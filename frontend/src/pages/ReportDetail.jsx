import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getReport, deleteReport } from '../api/reports'
import { useToast } from '../components/Toast'

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getReport(id)
      setReport(data)
    } catch (err) {
      showToast(err.message || 'Failed to load report.', 'error')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }, [id, navigate, showToast])

  useEffect(() => {
    load()
  }, [load])

  const handleCopy = async () => {
    if (!report?.summary) return
    await navigator.clipboard.writeText(report.summary)
    showToast('Summary copied to clipboard.', 'success')
  }

  const handleDownload = () => {
    if (!report?.summary) return
    const blob = new Blob([report.summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.file_name.replace(/\.[^/.]+$/, '')}-summary.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this report and its summary? This cannot be undone.')) return
    try {
      await deleteReport(id)
      showToast('Report deleted.', 'success')
      navigate('/')
    } catch (err) {
      showToast(err.message || 'Failed to delete report.', 'error')
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading…</div>
  }

  if (!report) return null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{report.file_name}</h1>
          <p className="text-sm text-slate-500">
            Uploaded {new Date(report.uploaded_at).toLocaleString()} · {report.file_type.toUpperCase()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={report.status !== 'done'}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            Copy summary
          </button>
          <button
            onClick={handleDownload}
            disabled={report.status !== 'done'}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            Download
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {report.status === 'failed' && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Processing failed: {report.error_message}
        </div>
      )}
      {report.status === 'processing' && (
        <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          This report is still being processed…
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            AI Summary
          </h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {report.summary || '—'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Original Report
          </h2>
          <div className="max-h-[600px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {report.extracted_text || '—'}
          </div>
        </div>
      </div>
    </div>
  )
}
