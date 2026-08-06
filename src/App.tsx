import React from 'react';
import { CampsiteProvider, useCampsites } from './context/CampsiteContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { CampsiteDetailPage } from './components/CampsiteDetailPage';
import { HostDashboard } from './components/HostDashboard';
import { AddListingWizard } from './components/AddListingWizard';
import { MyTripsPage } from './components/MyTripsPage';
import { PendingRequestsPage } from './components/PendingRequestsPage';
import { AdminPanel } from './components/AdminPanel';
import { ShieldAlert } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView, currentUser, setView } = useCampsites();

  return (
    <main className="flex-1">
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'search' && <SearchResultsPage />}
      {currentView === 'detail' && <CampsiteDetailPage />}
      {currentView === 'host-dashboard' && <HostDashboard />}
      {currentView === 'pending-requests' && <PendingRequestsPage />}
      {currentView === 'add-listing' && <AddListingWizard />}
      {currentView === 'my-trips' && <MyTripsPage />}
      {currentView === 'admin' && (
        currentUser?.isAdmin ? (
          <AdminPanel />
        ) : (
          <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-red-200 shadow-xl text-center font-sans space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Prieiga Apribota (Access Restricted)</h2>
            <p className="text-gray-600 text-xs leading-relaxed">
              Jūs esate prisijungęs kaip registruotas šeimininkas (<strong>{currentUser?.name}</strong>). Jūsų paskyrai neleidžiama pasiekti platformos administratoriaus ir valdymo puslapių. Jūs turite prieigą tik prie dedikuoto Šeimininko valdymo skydo ir viešųjų svetainės puslapių.
            </p>
            <button
              onClick={() => setView('host-dashboard')}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Eiti į Savo Šeimininko Skydą
            </button>
          </div>
        )
      )}
    </main>
  );
};

export default function App() {
  return (
    <CampsiteProvider>
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </CampsiteProvider>
  );
}
