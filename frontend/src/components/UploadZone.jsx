import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, CheckCircle2, XCircle, FileImage, X, RefreshCw } from 'lucide-react'

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function UploadZone({ onFileSelect, selectedFile, error }) {
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) return
    const file = acceptedFiles[0]
    if (!file) return
    onFileSelect(file)
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png':  ['.png'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  })

  const rejectionError = fileRejections[0]?.errors[0]?.message || null

  const handleRemove = (e) => {
    e.stopPropagation()
    onFileSelect(null)
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
  }

  return (
    <div className="w-full">
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: selectedFile ? 1 : 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200
          ${isDragActive
            ? 'border-teal-500 bg-teal-50 scale-[1.02] shadow-lg shadow-teal-100'
            : selectedFile && !error
            ? 'border-green-400 bg-green-50'
            : error || rejectionError
            ? 'border-red-400 bg-red-50'
            : 'border-slate-300 bg-[#F8FAFC] hover:border-teal-400 hover:bg-teal-50/30'
          }
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-6 flex flex-col sm:flex-row items-center gap-5"
            >
              {/* Thumbnail */}
              {preview ? (
                <div className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileImage className="w-8 h-8 text-green-600" />
                </div>
              )}

              {/* File info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="font-semibold text-slate-800 text-sm truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedFile.type || 'application/dicom'} &bull; {formatBytes(selectedFile.size)}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">Ready for analysis</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRemove}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation() }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-700 bg-teal-100 hover:bg-teal-200 transition-colors"
                  title="Choose different file"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Change
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center py-14 px-6 text-center"
            >
              <motion.div
                animate={isDragActive ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className={`mb-4 w-16 h-16 rounded-2xl flex items-center justify-center ${
                  isDragActive ? 'bg-teal-100' : 'bg-slate-100'
                }`}
              >
                <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-teal-600' : 'text-slate-400'}`} />
              </motion.div>

              <p className="text-base font-semibold text-slate-700 mb-1">
                {isDragActive ? 'Drop your scan here' : 'Drag & drop your chest scan'}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                or <span className="text-teal-600 font-semibold underline underline-offset-2">browse files</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['JPEG', 'PNG'].map(fmt => (
                  <span key={fmt} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
                    {fmt}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">Maximum file size: 10 MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error messages */}
      <AnimatePresence>
        {(error || rejectionError) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl"
          >
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error || rejectionError}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
