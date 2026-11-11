import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scan,
  AlertCircle,
  FileCheck2,
  Sparkles,
  RefreshCw,
  Info,
  Layers,
  CheckCircle2,
  FileImage,
  Tag
} from 'lucide-react'
import UploadZone from '../components/UploadZone.jsx'
import DisclaimerBanner from '../components/DisclaimerBanner.jsx'
import { usePrediction } from '../hooks/usePrediction.js'

// Pre-configured real medical scans for instant 1-click testing
const SAMPLE_SCANS = [
  {
    id: 'sample-normal',
    name: 'Normal_Thoracic_Scan_01.jpg',
    category: 'Normal',
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    type: 'Thoracic CT',
    hint: 'Healthy parenchyma without nodular densities',
    imagePath: '/samples/sample_normal_1.jpg',
  },
  {
    id: 'sample-benign',
    name: 'Benign_Nodule_Scan_01.jpg',
    category: 'Benign',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    type: 'Thoracic CT',
    hint: 'Solitary circumscribed non-calcified nodule',
    imagePath: '/samples/sample_benign_1.jpg',
  },
  {
    id: 'sample-malignant',
    name: 'Malignant_Carcinoma_Scan_01.jpg',
    category: 'Malignant',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    type: 'Thoracic CT',
    hint: 'Spiculated upper lobe carcinoma lesion',
    imagePath: '/samples/sample_malignant_1.jpg',
  },
]

const LOADING_STEPS = [
  'Validating & normalizing image structure...',
  'Resizing to 224×224 and applying spatial filters...',
  'Extracting thoracic deep feature representations...',
  'Computing class probabilities across neural heads...',
  'Generating Grad-CAM localization heatmap...',
  'Compiling clinical educational guidance...'
]

export default function AnalyzePage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [scanType, setScanType] = useState('CT')
  const [loadingStepIndex, setLoadingStepIndex] = useState(0)

  const { loading, error, analyze, reset } = usePrediction()

  // Cycle loading step messages smoothly during analysis
  useEffect(() => {
    let interval
    if (loading) {
      setLoadingStepIndex(0)
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev))
      }, 700)
    }
    return () => clearInterval(interval)
  }, [loading])

  const handleFileSelect = (file) => {
    reset()
    setSelectedFile(file)
    if (file) {
      if (file.imagePath) {
        setPreviewUrl(file.imagePath)
      } else if (file instanceof Blob || file instanceof File) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      }
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSampleClick = async (sample) => {
    try {
      const res = await fetch(sample.imagePath)
      const blob = await res.blob()
      const file = new File([blob], sample.name, { type: 'image/jpeg' })
      file.imagePath = sample.imagePath
      handleFileSelect(file)
    } catch (e) {
      console.error('Error loading sample image:', e)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    try {
      const result = await analyze(selectedFile)
      if (result) {
        navigate('/results', {
          state: {
            result,
            imageUrl: previewUrl,
            fileName: selectedFile.name,
            scanType,
          },
        })
      }
    } catch (err) {
      console.error('Analysis submission failed:', err)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] pb-20">
      <DisclaimerBanner />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 w-full">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Scan className="w-3.5 h-3.5" />
            <span>AI Diagnostic Assistant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Upload & Analyze Chest Scan
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Select a thoracic CT scan or chest X-ray image for instant classification and heatmap generation.
          </p>
        </div>

        {/* Main Upload Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-8">
          {/* Scan Type Selection */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <label className="text-sm font-bold text-slate-800 block">Modality Type</label>
              <span className="text-xs text-slate-500">Choose the acquisition format of your imaging file</span>
            </div>
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setScanType('CT')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  scanType === 'CT'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thoracic CT
              </button>
              <button
                type="button"
                onClick={() => setScanType('XRAY')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  scanType === 'XRAY'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chest X-Ray
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="mb-8">
            <UploadZone
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              error={error}
            />
          </div>

          {/* Sample quick-select cards with REAL CT Scan Images */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 mb-8">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Quick Demo: Click a Real Dataset Sample Scan
                </span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                IQ-OTH/NCCD Ground-Truth Slices
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SAMPLE_SCANS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSampleClick(sample)}
                  className="flex flex-col bg-white hover:bg-teal-50/40 border border-slate-200 hover:border-teal-400 rounded-2xl p-3 text-left transition-all shadow-xs group cursor-pointer"
                >
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-200">
                    <img
                      src={sample.imagePath}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold border ${sample.badgeColor}`}>
                      {sample.category}
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate mb-0.5">{sample.name}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">{sample.hint}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-teal-600 group-hover:translate-x-0.5 transition-transform">
                      Load This Scan &rarr;
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="text-sm font-bold text-red-900">Scan Validation Error</h5>
                <p className="text-xs font-semibold text-red-700 mt-0.5">{error}</p>
                <p className="text-[11px] text-red-600/80 mt-1">
                  PulmoScan AI only accepts authentic thoracic CT scan cross-sections. Non-medical photos, everyday objects, selfies, documents, and screenshots will be rejected.
                </p>
              </div>
            </div>
          )}

          {/* Loading or CTA State */}
          {loading ? (
            <div className="p-8 rounded-2xl bg-teal-50/60 border border-teal-200 flex flex-col items-center justify-center text-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-teal-100 border-b-teal-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                <Scan className="w-6 h-6 text-teal-700 absolute inset-0 m-auto" />
              </div>

              <h4 className="text-base font-bold text-slate-900 mb-1">
                Processing Imaging Pipeline...
              </h4>
              <p className="text-xs font-medium text-teal-800 h-5 transition-all">
                {LOADING_STEPS[loadingStepIndex]}
              </p>

              {/* Progress visual bar */}
              <div className="w-full max-w-md bg-teal-200/60 h-2 rounded-full mt-4 overflow-hidden">
                <motion.div
                  className="bg-teal-600 h-full rounded-full"
                  initial={{ width: '5%' }}
                  animate={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>Images are processed in memory and evaluated with PyTorch deep learning.</span>
              </div>

              <button
                type="button"
                disabled={!selectedFile || loading}
                onClick={handleAnalyze}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-md ${
                  selectedFile && !loading
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/25 hover:shadow-lg hover:shadow-teal-600/30 transform hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Scan className="w-5 h-5" />
                <span>Run Diagnostic Analysis</span>
              </button>
            </div>
          )}
        </div>

        {/* Security & Specification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-600 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 mb-0.5">Pre-processing Pipeline</p>
              <p>Automatic contrast normalization, histogram equalization, and artifact reduction.</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 mb-0.5">Dual-View Heatmap</p>
              <p>Generates high-resolution Grad-CAM overlays to highlight suspicious tissue density.</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800 mb-0.5">Clinical Protocol Matching</p>
              <p>Matches results to standard NCCN clinical pathways for follow-up education.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
