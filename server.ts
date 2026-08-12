import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { sendBookingConfirmationEmail, sendGenericEmail, testSmtpConnection } from "./src/lib/email";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: Send System Email (Unified endpoint for all 9 system templates)
  app.post("/api/send-system-email", async (req, res) => {
    try {
      const { recipientEmail, subject, htmlBody, fromName, fromEmail } = req.body;

      if (!recipientEmail || !subject || !htmlBody) {
        return res.status(400).json({
          success: false,
          error: "Trūksta privalomų laukų: recipientEmail, subject, htmlBody"
        });
      }

      const result = await sendGenericEmail({
        to: recipientEmail,
        subject,
        htmlBody,
        fromName: fromName || 'Campy.lt',
        fromEmail: fromEmail || 'noreply@campy.lt'
      });

      return res.json(result);
    } catch (error: any) {
      console.error("API error sending system email:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Serverio klaida siunčiant el. laišką"
      });
    }
  });

  // API Route: Send Booking Confirmation Email using Resend / SMTP
  app.post("/api/send-confirmation-email", async (req, res) => {
    try {
      const { guestEmail, guestName, campsiteTitle, checkIn, checkOut, totalPrice, bookingId, hostName, hostPhone } = req.body;

      if (!guestEmail || !campsiteTitle || !bookingId) {
        return res.status(400).json({ 
          success: false, 
          error: "Trūksta privalomų laukų: guestEmail, campsiteTitle, bookingId" 
        });
      }

      const result = await sendBookingConfirmationEmail({
        guestEmail,
        guestName: guestName || 'Svečias',
        campsiteTitle,
        checkIn: checkIn || '',
        checkOut: checkOut || '',
        totalPrice: Number(totalPrice) || 0,
        bookingId,
        hostName,
        hostPhone
      });

      return res.json(result);
    } catch (error: any) {
      console.error("API error sending confirmation email:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "Serverio klaida siunčiant el. laišką" 
      });
    }
  });

  // API Route: Get SMTP and Resend configuration status
  app.get("/api/smtp-status", async (req, res) => {
    try {
      const diag = await testSmtpConnection();
      return res.json({ success: true, ...diag });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Route: Send test SMTP email
  app.post("/api/test-smtp", async (req, res) => {
    try {
      const { testEmail } = req.body;
      if (!testEmail) {
        return res.status(400).json({ success: false, error: "Nurodykite testElPaštą" });
      }

      const result = await testSmtpConnection(testEmail);
      return res.json({ success: true, ...result });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Campy.lt Resend Email Engine" });
  });

  // Catch-all 404 handler for /api/* routes to guarantee JSON response instead of HTML
  app.all("/api/*", (req, res) => {
    return res.status(404).json({
      success: false,
      error: `API maršrutas ${req.method} ${req.originalUrl} nerastas`
    });
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in dev mode if Vite middleware passes through
    app.use("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      try {
        const fs = await import("fs");
        let template = await fs.promises.readFile(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
