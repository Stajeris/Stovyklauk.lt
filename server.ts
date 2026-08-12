import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { sendBookingConfirmationEmail } from "./src/lib/email";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Send Booking Confirmation Email using Resend
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

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Resend Email Server" });
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
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
