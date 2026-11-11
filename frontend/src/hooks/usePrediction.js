import { useState, useCallback } from 'react'
import { predictImage } from '../utils/api.js'

// Mock result for demo when backend is unavailable
const MOCK_RESULT = {
  prediction: 'Malignant',
  confidence: 87.4,
  risk_level: 'High',
  heatmap_url: null,
  recommendations: {
    next_steps: [
      'Schedule an urgent consultation with a pulmonologist or oncologist within 1-2 weeks.',
      'Request a high-resolution CT scan (HRCT) of the chest for detailed imaging.',
      'Consider a PET-CT scan to assess metabolic activity of the nodule.',
      'Discuss biopsy options with your specialist (bronchoscopy, CT-guided biopsy, or VATS).',
      'Ensure complete blood work including tumor markers (CEA, CYFRA 21-1).',
      'Document smoking history and occupational exposures for your physician.',
    ],
    treatment_categories: [
      {
        name: 'Surgical Options',
        icon: 'Scissors',
        description: 'Lobectomy, segmentectomy, or pneumonectomy depending on tumor stage and patient fitness.',
      },
      {
        name: 'Radiation Therapy',
        icon: 'Zap',
        description: 'SBRT/SABR for early-stage disease; conventional radiation or IMRT for locally advanced cases.',
      },
      {
        name: 'Chemotherapy',
        icon: 'Droplets',
        description: 'Platinum-based doublet chemotherapy, often combined with other modalities.',
      },
      {
        name: 'Targeted Therapy',
        icon: 'Target',
        description: 'EGFR inhibitors, ALK inhibitors, and other targeted agents based on molecular profiling.',
      },
      {
        name: 'Immunotherapy',
        icon: 'Shield',
        description: 'PD-1/PD-L1 checkpoint inhibitors such as pembrolizumab and nivolumab.',
      },
    ],
    lifestyle_tips: [
      'Quit smoking immediately — it is the single most impactful lifestyle change.',
      'Eat a nutrient-rich diet emphasizing fruits, vegetables, and lean proteins.',
      'Engage in gentle physical activity as tolerated to maintain strength.',
      'Seek psychological support — counseling or support groups for cancer patients.',
      'Limit alcohol consumption and avoid environmental toxins (asbestos, radon).',
      'Keep all follow-up appointments and report any new symptoms promptly.',
    ],
  },
}

export function usePrediction() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [result, setResult]   = useState(null)

  const analyze = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const data = await predictImage(formData)
      setResult(data)
      return data
    } catch (err) {
      // Fall back to mock data ONLY if backend is completely unreachable (network connection refused)
      if (
        !err.response &&
        (err.message?.includes('Network Error') ||
         err.message?.includes('ECONNREFUSED') ||
         err.code === 'ERR_NETWORK')
      ) {
        console.warn('Backend unavailable — using mock demo data.')
        const mockData = { ...MOCK_RESULT }
        setResult(mockData)
        return mockData
      }
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Analysis failed. Please try again.'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setResult(null)
  }, [])

  return { loading, error, result, analyze, reset }
}
