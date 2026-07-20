import { useRef, useState } from 'react'
import { uploadReport } from '../api/reports'
import { useToast } from './Toast'

const ALLOWED_TYPES = ['.pdf', '.docx', '.txt']
const MAX_SIZE_MB = 10

export default function FileUpload({ onUploaded }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const { showToast } = useToast()

  const validate = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_TYPES.includes(ext)) {
      showToast(`Unsupported file type. Allowed: ${ALLOWED_TYPES.join(', ')}`, 'error')
      return false
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showToast(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`, 'error')
      return false
    }
    return true
  }

  const handleFile = async (file) => {
    if (!file || !validate(file)) return

    setUploading(true)
    setProgress(0)
    try {
      const report = await uploadReport(file, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      showToast('Report uploaded and processed successfully.', 'success')
      onUploaded?.(report)
    } catch (err) {
      showToast(err.message || 'Upload failed.', 'error')
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
        dragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <p className="mb-1 font-medium text-slate-700">
        Drag & drop a medical report here, or
      </p>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : 'Browse files'}
      </button>
      <p className="mt-2 text-xs text-slate-400">PDF, DOCX, or TXT — up to {MAX_SIZE_MB}MB</p>

      {uploading && (
        <div className="mt-4 w-full max-w-xs">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">{progress}%</p>
        </div>
      )}
    </div>
  )
}
