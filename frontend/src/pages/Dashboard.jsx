import { useCallback, useEffect, useState } from 'react'
import FileUpload from '../components/FileUpload'
import ReportList from '../components/ReportList'
import { listReports, deleteReport } from '../api/reports'
import { useToast } from '../components/Toast'

export default function Dashboard() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const { showToast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listReports({ search, sort })
      setReports(data.items)
    } catch (err) {
      showToast(err.message || 'Failed to load reports.', 'error')
    } finally {
      setLoading(false)
    }
  }, [search, sort, showToast])

  useEffect(() => {
    const timeout = setTimeout(load, 300) // debounce search
    return () => clearTimeout(timeout)
  }, [load])

  const handleDelete = async (id) => {
    if (!confirm('Delete this report and its summary? This cannot be undone.')) return
    try {
      await deleteReport(id)
      showToast('Report deleted.', 'success')
      setReports((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      showToast(err.message || 'Failed to delete report.', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Your reports</h1>

      <div className="mb-8">
        <FileUpload onUploaded={() => load()} />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by file name…"
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-slate-400">Loading…</div>
      ) : (
        <ReportList reports={reports} onDelete={handleDelete} />
      )}
    </div>
  )
}
