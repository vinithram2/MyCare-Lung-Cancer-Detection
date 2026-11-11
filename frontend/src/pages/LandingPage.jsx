import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  Shield,
  Scan,
  ArrowRight,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Layers,
  HeartPulse,
  Award,
  ChevronRight,
  Eye,
  Zap,
  Microscope,
  FileImage,
  Bot,
  Mic,
  Languages
} from 'lucide-react'
import DisclaimerBanner from '../components/DisclaimerBanner.jsx'

export default function LandingPage() {
  const navigate = useNavigate()
  const [activeHeroTab, setActiveHeroTab] = useState('Malignant')

  const heroScans = {
    Normal: {
      img: '/samples/sample_normal_1.jpg',
      label: 'Normal Lung CT',
      badge: 'Low Risk',
      badgeColor: 'bg-green-100 text-green-700 border-green-200',
      conf: '97.4%',
      desc: 'Clear bilateral lung parenchyma without focal consolidation or suspicious nodular densities.'
    },
    Benign: {
      img: '/samples/sample_benign_1.jpg',
      label: 'Benign Solitary Nodule',
      badge: 'Moderate Risk',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      conf: '89.6%',
      desc: 'Well-circumscribed, non-calcified nodular density. Fleischner active surveillance indicated.'
    },
    Malignant: {
      img: '/samples/sample_malignant_1.jpg',
      label: 'Malignant Neoplasm (Adenocarcinoma)',
      badge: 'High Risk',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      conf: '96.8%',
      desc: 'Spiculated lesion with high cellular attenuation in upper lobe. Urgent oncological review required.'
    }
  }

  const currentScan = heroScans[activeHeroTab]

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <DisclaimerBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-teal-50/70 via-white to-[#FAFAFA]">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-teal-300 blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-blue-300 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100/80 text-teal-800 text-xs sm:text-sm font-semibold tracking-wide border border-teal-200 mb-6 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                <span>Next-Gen Medical AI Image Intelligence</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight"
              >
                Early Detection for{' '}
                <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Lung Health
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0"
              >
                Upload chest CT scans and X-ray images for rapid, deep-learning assisted classification
                (Normal, Benign, or Malignant), visual attention heatmaps, and evidence-based clinical guidance.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <button
                  onClick={() => navigate('/analyze')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg hover:shadow-teal-500/25 hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <Scan className="w-5 h-5" />
                  <span>Start Scan Analysis</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>

                <Link
                  to="/chat"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-base border border-teal-200 shadow-xs hover:scale-105 transition-all duration-200"
                >
                  <Bot className="w-5 h-5 text-teal-600" />
                  <span>Voice AI Assistant</span>
                  <span className="text-[10px] px-2 py-0.5 bg-teal-600 text-white rounded-full font-bold ml-1">EN/हि/ಕ</span>
                </Link>

                <Link
                  to="/about"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 shadow-xs hover:border-slate-300 transition-all duration-200"
                >
                  <FileText className="w-5 h-5 text-slate-500" />
                  <span>Methodology</span>
                </Link>
              </motion.div>

              {/* Micro trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-slate-500 font-medium"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Instant Heatmap Generation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Trained on 2,000+ Scans</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>DICOM & Image Support</span>
                </div>
              </motion.div>
            </div>

            {/* Right Hero Column: Interactive Live Medical Scanner Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 w-full"
            >
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl relative overflow-hidden">
                
                {/* Scanner header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                      Live Neural Scanner
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
                    ResNet18 Core Active
                  </span>
                </div>

                {/* Tab selector for sample images */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {['Normal', 'Benign', 'Malignant'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveHeroTab(tab)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        activeHeroTab === tab
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Medical Image Display Screen with Scanner Laser Beam */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
                  <img
                    src={currentScan.img}
                    alt={currentScan.label}
                    className="w-full h-full object-cover opacity-90 transition-all duration-300"
                  />

                  {/* Animated laser scanning line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-400 shadow-[0_0_15px_#2dd4bf] animate-[scanLine_3s_ease-in-out_infinite]" />

                  {/* Target bounding box / AI Detection overlay */}
                  <div className="absolute inset-6 border-2 border-teal-400/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-teal-300 bg-slate-900/80 px-2 py-0.5 rounded border border-teal-500/30">
                        ROI: Axial 224x224
                      </span>
                      <span className="text-[10px] font-mono text-teal-300 bg-slate-900/80 px-2 py-0.5 rounded border border-teal-500/30">
                        Confidence: {currentScan.conf}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 backdrop-blur-xs p-2.5 rounded-lg border border-slate-700 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{currentScan.label}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentScan.badgeColor}`}>
                          {currentScan.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                        {currentScan.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Analyze Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Benchmark IQ-OTH/NCCD CT Slice</span>
                  <button
                    onClick={() => navigate('/analyze')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
                  >
                    <span>Test This Scan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="border-y border-slate-200 bg-white py-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-teal-700">95.1%</p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Classification Accuracy</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-700">&lt; 0.15s</p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Inference Latency</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-teal-700">2,077</p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Trained Thoracic Scans</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-700">Grad-CAM</p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Explainable AI Heatmaps</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Radiological Gallery Section */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Radiological Spectrum</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Tri-Category Diagnostic Visual Gallery
            </p>
            <p className="mt-2 text-slate-600 text-sm">
              Our neural network is trained to differentiate micro-textures across healthy tissue, non-cancerous nodules, and invasive tumors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Normal */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 mb-4 border border-slate-200">
                  <img
                    src="/samples/sample_normal_2.jpg"
                    alt="Normal Lung CT Scan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-green-500/90 text-white rounded-lg text-[11px] font-bold">
                    Normal
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Clear Parenchyma</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Homogeneous pulmonary attenuation without discrete focal lesions, ground-glass opacities, or mediastinal adenopathy.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-green-700">Low Risk Profile</span>
                <Link to="/analyze" className="text-teal-600 font-bold hover:underline">Test Sample &rarr;</Link>
              </div>
            </div>

            {/* Card 2: Benign */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 mb-4 border border-slate-200">
                  <img
                    src="/samples/sample_benign_2.jpg"
                    alt="Benign Pulmonary Nodule"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-amber-500/90 text-white rounded-lg text-[11px] font-bold">
                    Benign
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Solitary Benign Nodule</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Circumscribed non-invasive nodule, typical of hamartomas, healed granulomas, or localized benign fibro-calcifications.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-700">Moderate Risk Profile</span>
                <Link to="/analyze" className="text-teal-600 font-bold hover:underline">Test Sample &rarr;</Link>
              </div>
            </div>

            {/* Card 3: Malignant */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 mb-4 border border-slate-200">
                  <img
                    src="/samples/sample_malignant_2.jpg"
                    alt="Malignant Lung Carcinoma"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-red-500/90 text-white rounded-lg text-[11px] font-bold">
                    Malignant
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Malignant Carcinoma</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Irregular, micro-lobulated border with pleural tethering, representing primary bronchogenic carcinoma.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-red-700">High Risk Profile</span>
                <Link to="/analyze" className="text-teal-600 font-bold hover:underline">Test Sample &rarr;</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Step-by-Step</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">How MyCare Works</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-2xl mb-5 shadow-xs">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Upload Scan</h4>
              <p className="text-slate-600 text-sm">
                Upload a JPEG, PNG or DICOM chest CT/X-ray image. The system validates and preprocesses it with noise reduction and normalization.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-2xl mb-5 shadow-xs">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Neural Inference</h4>
              <p className="text-slate-600 text-sm">
                The CNN analyzes radiological feature maps to determine probability distribution and generates a Grad-CAM localized heatmap.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-2xl mb-5 shadow-xs">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Review & Guidance</h4>
              <p className="text-slate-600 text-sm">
                Review confidence rings, risk classification, togglable overlays, and download educational recommendations for clinical consultations.
              </p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="mt-16 bg-gradient-to-r from-teal-700 to-blue-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to evaluate a chest scan?</h3>
              <p className="mt-2 text-teal-100 text-sm sm:text-base">
                Try the interactive scan analyzer with immediate results and educational next steps.
              </p>
            </div>
            <button
              onClick={() => navigate('/analyze')}
              className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-teal-800 hover:bg-teal-50 font-bold text-base shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Scan className="w-5 h-5 text-teal-700" />
              <span>Launch Analyzer</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
