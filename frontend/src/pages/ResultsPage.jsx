import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  Download,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  Eye,
  RotateCcw,
  ShieldCheck,
  Calendar,
  Share2
} from 'lucide-react'
import CircularProgress from '../components/CircularProgress.jsx'
import RiskBadge from '../components/RiskBadge.jsx'
import DisclaimerBanner from '../components/DisclaimerBanner.jsx'

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [showHeatmap, setShowHeatmap] = useState(true)

  // Extract navigation state or use a demo fallback if visited directly
  const stateData = location.state || {}
  const rawResult = stateData.result || {
    class_name: 'Benign',
    prediction: 'Benign',
    confidence: 0.884,
    risk_level: 'Moderate',
    heatmap_url: null,
    recommendations: {
      next_steps: [
        'Consult with a pulmonologist for comprehensive evaluation.',
        'Follow-up low-dose CT scan recommended in 3 to 6 months.',
        'Monitor for respiratory symptoms such as cough or chest discomfort.'
      ],
      treatment_categories: [
        {
          name: 'Active Surveillance',
          description: 'Serial high-resolution CT imaging to measure volume doubling time.',
          icon: 'Eye'
        },
        {
          name: 'Diagnostic Biopsy',
          description: 'Tissue sampling if nodule morphology shows suspicious progression.',
          icon: 'Activity'
        }
      ],
      lifestyle_tips: [
        'Smoking cessation is the primary protective intervention.',
        'Minimize occupational exposure to silica, diesel exhaust, and asbestos.',
        'Maintain a balanced antioxidant-rich diet.'
      ],
      disclaimer: 'Educational information only. Consult an oncologist or pulmonologist for clinical care.'
    }
  }

  const uploadedImageUrl = stateData.imageUrl || null
  const fileName = stateData.fileName || 'Chest_Scan_Image.png'
  const scanType = stateData.scanType || 'Thoracic CT'

  // Normalise class name & confidence
  const className = rawResult.class_name || rawResult.prediction || 'Normal'
  const rawConfidence = typeof rawResult.confidence === 'number' ? rawResult.confidence : 0.85
  const confidencePercent = rawConfidence <= 1.0 ? rawConfidence * 100 : rawConfidence
  const riskLevel = rawResult.risk_level || (className === 'Malignant' ? 'High' : className === 'Benign' ? 'Moderate' : 'Low')

  // Pick theme color based on diagnosis
  const colorMap = {
    Normal: {
      accent: '#16a34a',
      bgLight: 'bg-green-50',
      borderLight: 'border-green-200',
      textAccent: 'text-green-700',
      title: 'Normal / No Significant Malignancy Detected'
    },
    Benign: {
      accent: '#d97706',
      bgLight: 'bg-amber-50',
      borderLight: 'border-amber-200',
      textAccent: 'text-amber-700',
      title: 'Benign Nodule / Non-Malignant Lesion'
    },
    Malignant: {
      accent: '#dc2626',
      bgLight: 'bg-red-50',
      borderLight: 'border-red-200',
      textAccent: 'text-red-700',
      title: 'High Suspicion of Malignant Neoplasm'
    }
  }

  const currentTheme = colorMap[className] || colorMap.Normal
  const heatmapUrl = rawResult.heatmap_url
    ? (rawResult.heatmap_url.startsWith('http') ? rawResult.heatmap_url : `http://localhost:8000${rawResult.heatmap_url}`)
    : null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] pb-24 print:bg-white print:p-0">
      <div className="print:hidden">
        <DisclaimerBanner persistent />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 w-full">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/analyze')}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
              title="Return to upload"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Scan Diagnostic Analysis
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                File: <span className="font-semibold text-slate-700">{fileName}</span> &bull; Modality:{' '}
                <span className="font-semibold text-slate-700">{scanType}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={() => navigate('/analyze')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Scan</span>
            </button>
          </div>
        </div>

        {/* Results Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Viewer & Heatmap */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">Radiological Visualization</h3>
                </div>

                {heatmapUrl && (
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setShowHeatmap(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        !showHeatmap
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setShowHeatmap(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        showHeatmap
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Grad-CAM Heatmap
                    </button>
                  </div>
                )}
              </div>

              {/* Image Frame */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner">
                {heatmapUrl && showHeatmap ? (
                  <motion.img
                    key="heatmap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={heatmapUrl}
                    alt="Grad-CAM Heatmap Overlay"
                    className="w-full h-full object-contain"
                  />
                ) : uploadedImageUrl ? (
                  <motion.img
                    key="original"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={uploadedImageUrl}
                    alt="Uploaded Thoracic Scan"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6">
                    <Layers className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Radiological scan representation</p>
                  </div>
                )}

                {/* Heatmap Legend Overlay */}
                {showHeatmap && heatmapUrl && (
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 text-[11px] text-white flex items-center gap-2">
                    <span className="text-slate-300">Attention:</span>
                    <div className="w-16 h-2 rounded bg-gradient-to-r from-blue-500 via-yellow-400 to-red-600" />
                    <span className="font-bold text-red-400">High</span>
                  </div>
                )}
              </div>

              {/* Image Description */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Spatial Size: 224 × 224 px (Normalized)</span>
                <span className="font-medium text-teal-700">TensorFlow Core Active</span>
              </div>
            </div>
          </div>

          {/* Right Column: Diagnostic Classification & Confidence */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Primary Classification Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Classification Output
                </span>
                <RiskBadge level={riskLevel} />
              </div>

              {/* Result Title & Badge */}
              <div className="mb-8">
                <span className="text-xs font-semibold text-slate-400 block mb-1">PREDICTED CATEGORY</span>
                <h2
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ color: currentTheme.accent }}
                >
                  {className}
                </h2>
                <p className="text-sm font-medium text-slate-600 mt-1">{currentTheme.title}</p>
              </div>

              {/* Confidence Ring & Metrics */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-around gap-6 mb-8">
                <CircularProgress
                  percentage={confidencePercent}
                  size={150}
                  strokeWidth={12}
                  color={currentTheme.accent}
                  label="Confidence"
                />

                <div className="flex flex-col gap-3 text-left w-full sm:w-auto">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-400 block">MODEL CERTAINTY</span>
                    <span className="text-lg font-bold text-slate-800">
                      {confidencePercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-400 block">RISK CLASSIFICATION</span>
                    <span className="text-base font-bold text-slate-800">{riskLevel} Risk Profile</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() =>
                    navigate('/guidance', {
                      state: {
                        result: rawResult,
                        imageUrl: uploadedImageUrl,
                        fileName,
                      },
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-md shadow-teal-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  <FileText className="w-5 h-5" />
                  <span>View Clinical Guidance & Next Steps</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>

                <button
                  onClick={() => navigate('/history')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>View in Scan History Dashboard</span>
                </button>
              </div>
            </div>

            {/* Disclaimer Reminder Box */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-bold">Notice to Clinicians & Patients:</strong> AI predictions
                are intended solely to assist radiological evaluation and cannot substitute histopathological
                biopsy or multidisciplinary oncology review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
