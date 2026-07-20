import { Link } from 'react-router-dom'

const statusStyles = {
  processing: 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
}

export default function ReportList({ reports, onDelete }) {
  if (!reports.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
        No reports found. Upload one to get started.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">File name</th>
            <th className="px-4 py-3">Uploaded</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reports.map((r) => (
            <tr key={r.id} className="transition hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">
                <Link to={`/reports/${r.id}`} className="hover:text-brand-600 hover:underline">
                  {r.file_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-500">
                {new Date(r.uploaded_at).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[r.status] || 'bg-slate-100 text-slate-600'}`}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/reports/${r.id}`}
                  className="mr-3 text-brand-600 hover:underline"
                >
                  View
                </Link>
                <button
                  onClick={() => onDelete(r.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
