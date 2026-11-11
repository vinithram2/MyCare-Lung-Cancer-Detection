import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import SiriAssistant from './components/SiriAssistant.jsx'
import { ActivityProvider } from './context/ActivityContext.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AnalyzePage from './pages/AnalyzePage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import GuidancePage from './pages/GuidancePage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ChatbotPage from './pages/ChatbotPage.jsx'
import NewsPage from './pages/NewsPage.jsx'

export default function App() {
  return (
    <ActivityProvider>
      <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"         element={<LandingPage />} />
            <Route path="/analyze"  element={<AnalyzePage />} />
            <Route path="/news"     element={<NewsPage />} />
            <Route path="/results"  element={<ResultsPage />} />
            <Route path="/guidance" element={<GuidancePage />} />
            <Route path="/history"  element={<HistoryPage />} />
            <Route path="/about"    element={<AboutPage />} />
            <Route path="/chat"     element={<ChatbotPage />} />
          </Routes>
        </main>
        <Footer />
        {/* Floating Multilingual Voice AI Assistant on bottom-right */}
        <ChatWidget />
        {/* Hands-Free Siri-Style "Hey MyCare" AI Assistant on bottom-left */}
        <SiriAssistant />
      </div>
    </ActivityProvider>
  )
}
