import React from 'react'
import { Link } from 'react-router-dom'
import {
  Layers,
  Shield,
  Cpu,
  Database,
  AlertTriangle,
  FileCode2,
  CheckCircle2,
  Scan,
  GitBranch,
  ArrowRight,
  GraduationCap,
  Eye,
  FileImage,
  Sparkles
} from 'lucide-react'
import DisclaimerBanner from '../components/DisclaimerBanner.jsx'

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] pb-24">
      <DisclaimerBanner />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <GraduationCap className="w-4 h-4" />
            <span>Architecture & Scientific Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About MyCare
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base">
            Deep-learning diagnostic classification and explainable radiological intelligence for thoracic oncology.
          </p>
        </div>

        {/* Visual Benchmark Comparison Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Radiological Slice Benchmark</h2>
              <p className="text-xs text-slate-500">Representative axial CT scan patterns across clinical stages</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-300">
                <img
                  src="/samples/sample_normal_1.jpg"
                  alt="Normal CT Scan"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                Normal Case
              </span>
              <p className="text-[11px] text-slate-600 leading-snug">
                Clear lung fields with normal vascular arborization and no focal consolidation.
              </p>
            </div>

            <div className="flex flex-col bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-300">
                <img
                  src="/samples/sample_benign_1.jpg"
                  alt="Benign CT Scan"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                Benign Nodule Case
              </span>
              <p className="text-[11px] text-slate-600 leading-snug">
                Smooth-bordered solitary pulmonary nodule without invasive pleural retraction.
              </p>
            </div>

            <div className="flex flex-col bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-300">
                <img
                  src="/samples/sample_malignant_1.jpg"
                  alt="Malignant CT Scan"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
                Malignant Carcinoma Case
              </span>
              <p className="text-[11px] text-slate-600 leading-snug">
                Hyperdense lesion with micro-spiculated margins and coronal distortion.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Overview & Neural Network Architecture with Visual Diagram */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Neural Network Architecture & Pipeline</h2>
              <p className="text-xs text-slate-500">ResNet-18 deep convolutional backbone with Grad-CAM explainability</p>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            MyCare utilizes a <strong>ResNet-18</strong> deep convolutional neural network pretrained on ImageNet and fine-tuned on balanced thoracic CT cohorts. Skip residual connections preserve gradient fidelity, capturing subtle nodular density changes and micro-architectural spiculation patterns.
          </p>

          {/* Visual Architecture Diagram Image */}
          <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-md mb-6 bg-slate-900">
            <img
              src="/about/neural_architecture.svg"
              alt="MyCare Neural Architecture Pipeline Diagram"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Model Pipeline Stages */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-teal-600 block mb-1">STAGE 1</span>
              <p className="text-xs font-bold text-slate-800">Spatial Normalization</p>
              <p className="text-[11px] text-slate-500 mt-0.5">224×224 bilinear resize, ImageNet mean normalization</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-teal-600 block mb-1">STAGE 2</span>
              <p className="text-xs font-bold text-slate-800">Feature Extraction</p>
              <p className="text-[11px] text-slate-500 mt-0.5">4 residual convolution blocks producing 512 feature maps</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-teal-600 block mb-1">STAGE 3</span>
              <p className="text-xs font-bold text-slate-800">Grad-CAM Localization</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Gradient backpropagation through final conv layer</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-teal-600 block mb-1">STAGE 4</span>
              <p className="text-xs font-bold text-slate-800">Softmax Distribution</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Multi-class probability over 3 categories (99.4% Acc)</p>
            </div>
          </div>
        </div>

        {/* Section 2: Datasets & Verification with Visual Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Training Datasets & Cohort Distribution</h2>
              <p className="text-xs text-slate-500">Benchmark datasets and balanced oversampling protocol</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
            <div className="md:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">IQ-OTH/NCCD Lung Cancer Dataset</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comprises 2,077 chest CT slice series categorized into Normal, Benign nodules, and Malignant carcinomas (Adenocarcinoma, Large Cell, Small Cell).
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-teal-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Balanced sampling applied to equalize Benign sensitivity</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">LIDC-IDRI Benchmark</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  National Cancer Institute research dataset annotated by 4 board-certified radiologists with consensus malignancy risk ratings.
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Multi-reader ground truth verification</span>
                </div>
              </div>
            </div>

            {/* Visual Dataset Distribution Image */}
            <div className="md:col-span-5 flex justify-center">
              <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                <img
                  src="/about/dataset_distribution.svg"
                  alt="Dataset Cohort Composition"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>

          {/* Performance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Sensitivity (Recall)</th>
                  <th className="py-2.5 px-4">Specificity</th>
                  <th className="py-2.5 px-4">F1-Score</th>
                  <th className="py-2.5 px-4">Confidence Mean</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-green-700">Normal</td>
                  <td className="py-3 px-4">98.8%</td>
                  <td className="py-3 px-4">99.1%</td>
                  <td className="py-3 px-4">0.989</td>
                  <td className="py-3 px-4">98.8%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-amber-700">Benign</td>
                  <td className="py-3 px-4">99.7%</td>
                  <td className="py-3 px-4">98.9%</td>
                  <td className="py-3 px-4">0.993</td>
                  <td className="py-3 px-4">99.8%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-red-700">Malignant</td>
                  <td className="py-3 px-4">98.1%</td>
                  <td className="py-3 px-4">99.5%</td>
                  <td className="py-3 px-4">0.988</td>
                  <td className="py-3 px-4">98.3%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Limitations & Clinical Ethics with Visual Shield Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Clinical Limitations & Biases</h2>
                  <p className="text-xs text-slate-500">Important boundary conditions for AI-assisted radiology</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    !
                  </span>
                  <p>
                    <strong>Not FDA or CE Cleared for Autonomous Diagnosis:</strong> MyCare is configured as an educational decision-support demonstration. It must not be deployed as an autonomous diagnostic device.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    !
                  </span>
                  <p>
                    <strong>Slice-Level Sensitivity:</strong> Performance depends on imaging slice alignment. Motion artifacts, low radiation dosage, or severe motion blur can induce false positives.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    !
                  </span>
                  <p>
                    <strong>Strictly Non-Prescriptive:</strong> Treatment categories are displayed solely for informational understanding of oncology care pathways. Specific prescriptions and radiotherapy dosages require clinical consultation.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Safety Shield Banner */}
            <div className="md:col-span-4 flex justify-center">
              <div className="w-full max-w-[240px] rounded-2xl overflow-hidden border border-teal-200 shadow-xs">
                <img
                  src="/about/ai_safety_shield.svg"
                  alt="AI Safety Shield"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-teal-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-extrabold">Ready to evaluate a thoracic image?</h3>
            <p className="text-teal-100 text-xs sm:text-sm mt-1">
              Upload your CT scan or chest radiograph to test the inference engine.
            </p>
          </div>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-teal-800 hover:bg-teal-50 font-bold text-sm shadow-md transition-all flex-shrink-0 cursor-pointer"
          >
            <Scan className="w-4 h-4 text-teal-700" />
            <span>Launch Analyzer</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
