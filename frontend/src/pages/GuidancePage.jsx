import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Shield,
  HeartPulse,
  Activity,
  Scissors,
  Zap,
  Droplets,
  Target,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  FileImage
} from 'lucide-react'
import RiskBadge from '../components/RiskBadge.jsx'
import DisclaimerBanner from '../components/DisclaimerBanner.jsx'

// Icon lookup for treatment cards
const ICON_MAP = {
  Scissors: Scissors,
  Zap: Zap,
  Droplets: Droplets,
  Target: Target,
  Shield: Shield,
  Activity: Activity,
  Stethoscope: Stethoscope,
  Eye: HeartPulse,
}

// Visual illustration mapping based on treatment or action name
const ILLUSTRATION_MAP = {
  'Active Surveillance': '/guidance/ct_surveillance.svg',
  'Minimally Invasive Diagnostics': '/guidance/biopsy_diagnostics.svg',
  'Thoracic Surgery': '/guidance/thoracic_surgery.svg',
  'Radiation Oncology': '/guidance/ct_surveillance.svg',
  'Systemic Chemotherapy': '/guidance/immunotherapy.svg',
  'Targeted Precision Therapy': '/guidance/immunotherapy.svg',
  'Immunotherapy': '/guidance/immunotherapy.svg',
}

export default function GuidancePage() {
  const location = useLocation()
  const navigate = useNavigate()

  const stateData = location.state || {}
  const rawResult = stateData.result || {
    class_name: 'Benign',
    prediction: 'Benign',
    confidence: 0.884,
    risk_level: 'Moderate',
    recommendations: {
      next_steps: [
        'Schedule an evaluation with a pulmonologist or chest physician.',
        'Obtain a low-dose computed tomography (LDCT) follow-up in 3–6 months to assess nodule volume stability.',
        'Review past thoracic radiographs or CTs for longitudinal comparison.',
        'Discuss biopsy or bronchoscopy if high-risk radiological features (spiculation, upper lobe location) are present.'
      ],
      treatment_categories: [
        {
          name: 'Active Surveillance',
          icon: 'Eye',
          description: 'Serial high-resolution CT imaging protocols following Fleischner Society guidelines to monitor size and solid components.'
        },
        {
          name: 'Minimally Invasive Diagnostics',
          icon: 'Activity',
          description: 'Navigational bronchoscopy, EBUS-TBNA, or CT-guided transthoracic needle biopsy if growth or morphological changes occur.'
        }
      ],
      lifestyle_tips: [
        'Strict smoking cessation is the most critical step to prevent malignant transformation.',
        'Limit exposure to radon, secondhand smoke, diesel particulate matter, and asbestos.',
        'Maintain pulmonary function through moderate aerobic physical activity and respiratory hygiene.'
      ],
      disclaimer: 'Informational guidance only. Dosing, medical prescriptions, and clinical management must be determined by a licensed oncologist.'
    }
  }

  const className = rawResult.class_name || rawResult.prediction || 'Normal'
  const recommendations = rawResult.recommendations || {}
  const nextSteps = recommendations.next_steps || []
  const treatmentCategories = recommendations.treatment_categories || []
  const lifestyleTips = recommendations.lifestyle_tips || []

  // Dynamic visual banner based on diagnosis
  const guidanceVisuals = {
    Normal: {
      heroImg: '/guidance/pulmonary_wellness.svg',
      title: 'Routine Health Maintenance Pathway',
      subtitle: 'Clear radiological indicators — periodic preventative screening & respiratory wellness.'
    },
    Benign: {
      heroImg: '/guidance/ct_surveillance.svg',
      title: 'Active Surveillance & Monitoring Protocol',
      subtitle: 'Solitary non-cancerous nodule — serial CT interval tracking to confirm volumetric stability.'
    },
    Malignant: {
      heroImg: '/guidance/consultation.svg',
      title: 'Immediate Multidisciplinary Oncology Pathway',
      subtitle: 'Suspicious neoplasm — urgent thoracic oncology consultation, staging biopsy, and biomarker profiling.'
    }
  }

  const currentVisual = guidanceVisuals[className] || guidanceVisuals.Benign

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] pb-24">
      {/* Persistent top disclaimer */}
      <DisclaimerBanner persistent />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 w-full">
        {/* Navigation back */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical Guidance & Next Steps
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Evidence-informed informational overview powered by <span className="font-semibold text-teal-600">MyCare</span>
            </p>
          </div>
        </div>

        {/* Current Assessment Summary Visual Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8 overflow-hidden relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Diagnostic Category
              </span>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-extrabold text-slate-900">{className}</h2>
                <RiskBadge level={rawResult.risk_level || (className === 'Malignant' ? 'High' : className === 'Benign' ? 'Moderate' : 'Low')} />
              </div>
              <h3 className="text-sm font-bold text-teal-700 mb-1">{currentVisual.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {currentVisual.subtitle}
              </p>

              <button
                onClick={() => navigate('/results', { state: stateData })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Return to Scan Results & Heatmap</span>
              </button>
            </div>

            {/* Visual Pathway Illustration */}
            <div className="md:col-span-5 flex justify-center">
              <div className="w-full max-w-[280px] rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-slate-50">
                <img
                  src={currentVisual.heroImg}
                  alt={currentVisual.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Recommended Next Steps with Visual Badges */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recommended Clinical Actions</h3>
              <p className="text-xs text-slate-500">Standard investigative pathways for this finding</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-300 transition-colors"
              >
                <span className="w-7 h-7 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: General Treatment Categories with Visual Cards */}
        {treatmentCategories.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Treatment Modalities & Clinical Procedures</h3>
                  <p className="text-xs text-slate-500">
                    High-level educational descriptions of standard clinical interventions
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                <strong>Educational Notice:</strong> Specific therapies, chemotherapeutic agents, and surgical indications depend on histopathological staging (TNM), molecular biomarkers (EGFR/ALK/PD-L1), and patient performance status.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {treatmentCategories.map((item, idx) => {
                const IconComponent = ICON_MAP[item.icon] || Activity
                const illustrationSrc = ILLUSTRATION_MAP[item.name] || '/guidance/biopsy_diagnostics.svg'

                return (
                  <div
                    key={idx}
                    className="rounded-3xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    {/* Visual Card Image Header */}
                    <div className="w-full aspect-[16/9] bg-slate-50 border-b border-slate-100 overflow-hidden">
                      <img
                        src={illustrationSrc}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Section 3: Lifestyle & Supportive Care with Visual Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Lifestyle & Supportive Wellness</h3>
                  <p className="text-xs text-slate-500">Evidence-based habits to support lung and general health</p>
                </div>
              </div>

              <div className="space-y-3">
                {lifestyleTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center">
              <div className="w-full max-w-[240px] rounded-2xl overflow-hidden border border-emerald-200 shadow-xs bg-emerald-50/30">
                <img
                  src="/guidance/pulmonary_wellness.svg"
                  alt="Pulmonary Wellness"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Verified External Resources */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <h3 className="text-base font-bold text-slate-900 mb-4">Official Clinical & Patient Resources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="https://www.cancer.gov/types/lung"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex items-center justify-between text-xs group"
            >
              <div>
                <span className="font-bold text-slate-900 block group-hover:text-teal-700">
                  National Cancer Institute (NCI)
                </span>
                <span className="text-slate-500">Comprehensive lung cancer guide</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </a>

            <a
              href="https://www.cancer.org/cancer/types/lung-cancer.html"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex items-center justify-between text-xs group"
            >
              <div>
                <span className="font-bold text-slate-900 block group-hover:text-teal-700">
                  American Cancer Society
                </span>
                <span className="text-slate-500">Diagnosis and supportive programs</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </a>

            <a
              href="https://www.who.int/news-room/fact-sheets/detail/cancer"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all flex items-center justify-between text-xs group"
            >
              <div>
                <span className="font-bold text-slate-900 block group-hover:text-teal-700">
                  World Health Organization
                </span>
                <span className="text-slate-500">Global oncological statistics</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </a>
          </div>
        </div>

        {/* Section 5: Mandatory Legal & Medical Disclaimer Box */}
        <div className="p-6 rounded-3xl bg-red-50/60 border-2 border-red-200 flex flex-col sm:flex-row items-start gap-4">
          <ShieldAlert className="w-7 h-7 text-red-600 flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-red-900">
              Mandatory Medical & Clinical Disclaimer
            </h4>
            <p className="text-xs text-red-800 leading-relaxed">
              MyCare AI is an algorithmic research and educational prototype. It does not provide medical diagnoses, treatment prescriptions, drug dosages, or therapeutic plans. The outputs generated must be verified by a board-certified radiologist and oncologist. Never ignore or delay seeking professional medical advice due to information provided by this system.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
