import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { InquiryModal } from './components/InquiryModal';
import { WhatsAppFloatButton } from './components/WhatsAppFloatButton';
import { ConciergeWidget } from './components/ConciergeWidget';
import { InquiryProvider } from './context/InquiryContext';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';

// All Required Enganda Safaris Pages (+ Safari Wallet & Google Drive Vault)
import { HomePage } from './pages/HomePage';
import { GuidesPage } from './pages/GuidesPage';
import { GuideProfilePage } from './pages/GuideProfilePage';
import { ExperiencesPage } from './pages/ExperiencesPage';
import { ExperienceDetailPage } from './pages/ExperienceDetailPage';
import { DestinationsPage } from './pages/DestinationsPage';
import { HowWeWorkPage } from './pages/HowWeWorkPage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { JournalPage } from './pages/JournalPage';
import { ResponsibleTravelPage } from './pages/ResponsibleTravelPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { GoogleDrivePage } from './pages/GoogleDrivePage';
import { WalletPage } from './pages/WalletPage';

export default function App() {
  return (
    <AuthProvider>
      <InquiryProvider>
        <WalletProvider>
          <Router>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#1A1612] selection:bg-[#C85A28] selection:text-white">
              {/* Global Sticky Header */}
              <Navbar />

              {/* Route Views */}
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/guides" element={<GuidesPage />} />
                  <Route path="/partners" element={<GuidesPage />} />
                  <Route path="/guides/:slug" element={<GuideProfilePage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/experiences" element={<ExperiencesPage />} />
                  <Route path="/experiences/:slug" element={<ExperienceDetailPage />} />
                  <Route path="/destinations" element={<DestinationsPage />} />
                  <Route path="/how-we-work" element={<HowWeWorkPage />} />
                  <Route path="/trip-planner" element={<TripPlannerPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="/responsible-travel" element={<ResponsibleTravelPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/drive" element={<GoogleDrivePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Global Footer */}
              <Footer />

              {/* Global Inquiry Modal */}
              <InquiryModal />

              {/* Floating WhatsApp & Guide Matcher AI Concierge */}
              <WhatsAppFloatButton />
              <ConciergeWidget />
            </div>
          </Router>
        </WalletProvider>
      </InquiryProvider>
    </AuthProvider>
  );
}
