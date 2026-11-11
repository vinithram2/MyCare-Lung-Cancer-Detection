import React from 'react'
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

const configs = {
  Normal: {
    bg:    'bg-green-100',
    text:  'text-green-700',
    border:'border-green-200',
    Icon:   CheckCircle,
  },
  Benign: {
    bg:    'bg-amber-100',
    text:  'text-amber-700',
    border:'border-amber-200',
    Icon:   AlertCircle,
  },
  Malignant: {
    bg:    'bg-red-100',
    text:  'text-red-700',
    border:'border-red-200',
    Icon:   AlertTriangle,
  },
  Low: {
    bg:    'bg-green-100',
    text:  'text-green-700',
    border:'border-green-200',
    Icon:   CheckCircle,
  },
  Moderate: {
    bg:    'bg-amber-100',
    text:  'text-amber-700',
    border:'border-amber-200',
    Icon:   AlertCircle,
  },
  High: {
    bg:    'bg-red-100',
    text:  'text-red-700',
    border:'border-red-200',
    Icon:   AlertTriangle,
  },
}

export default function RiskBadge({ level = 'Low' }) {
  const cfg = configs[level] || configs.Low
  const { bg, text, border, Icon } = cfg

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${bg} ${text} ${border}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {level} Risk
    </span>
  )
}
