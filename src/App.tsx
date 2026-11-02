import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Currency, LanguageCode } from './types';
import { ScrollToTop } from './components/ScrollToTop';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { TingaAssistantWidget } from './components/TingaAssistantWidget';

// Pages
import { HomePage } from './pages/HomePage';
import { HowWeWorkPage } from './pages/HowWeWorkPage';
import { PartnersPage } from './pages/PartnersPage';
import { PermitsPage } from './pages/PermitsPage';
import { TeamPage } from './pages/TeamPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { JournalPage } from './pages/JournalPage';
import { ResponsibleTravelPage } from './pages/ResponsibleTravelPage';
import { ContactPage } from './pages/ContactPage';
import { DestinationDetailPage } from './pages/DestinationDetailPage';
import { ItineraryDetailPage } from './pages/ItineraryDetailPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { AuthProvider } from './context/AuthContext';
import { GoogleDrivePage } from './pages/GoogleDrivePage';
import { WalletPage } from './pages/WalletPage';
import { WalletTopupPage } from './pages/WalletTopupPage';
import { WalletTermsPage } from './pages/WalletTermsPage';

export default function App() {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>('USD');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-600 selection:text-stone-950">
          {/* Sticky Header Navbar */}
          <Navbar
            currentCurrency={currentCurrency}
            onCurrencyChange={setCurrentCurrency}
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
          />

          {/* Dynamic Route Pages */}
          <main className="flex-grow">
            <Routes>
              <Route
                path="/"
                element={<HomePage currency={currentCurrency} language={currentLanguage} />}
              />
              <Route path="/how-we-work" element={<HowWeWorkPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/permits" element={<PermitsPage currency={currentCurrency} />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/responsible-travel" element={<ResponsibleTravelPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Google Drive Safari Vault */}
              <Route path="/drive" element={<GoogleDrivePage />} />

              {/* Safari Wallet & Travel Credits */}
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/wallet/topup" element={<WalletTopupPage />} />
              <Route path="/wallet/terms" element={<WalletTermsPage />} />

              {/* Localized / Country Route */}
              <Route
                path="/safaris/:country"
                element={<DestinationDetailPage currency={currentCurrency} />}
              />

              {/* Itinerary Details */}
              <Route
                path="/itineraries/:slug"
                element={<ItineraryDetailPage currency={currentCurrency} />}
              />

              {/* Interactive Trip Planner */}
              <Route
                path="/trip-planner"
                element={<TripPlannerPage currency={currentCurrency} />}
              />

              {/* Admin Operations Portal */}
              <Route path="/admin" element={<AdminDashboardPage />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />

          {/* Floating Tinga Assistant Concierge */}
          <TingaAssistantWidget
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}
