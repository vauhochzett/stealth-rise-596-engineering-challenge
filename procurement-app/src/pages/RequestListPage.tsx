import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProcurementRequest, RequestStatus } from '../api/client'
import { api } from '../api/client'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'

const statusOptions: RequestStatus[] = ['Open', 'In Progress', 'Closed']

const RequestListPage = () => {
  const [requests, setRequests] = useState<ProcurementRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listRequests()
      setRequests(data)
    } catch (err) {
      console.error(err)
      setError('Could not load requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const changeStatus = async (id: string, status: RequestStatus) => {
    setUpdatingId(id)
    setError(null)
    try {
      await api.updateStatus(id, status)
      await load()
    } catch (err) {
      console.error(err)
      setError('Failed to update status.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-clipboard-check text-primary fs-4" />
          <h2 className="mb-0">Requests overview</h2>
        </div>
        <Link to="/requests/new" className="btn btn-primary">
          + New Request
        </Link>
      </div>
      <p className="text-muted">
        Track incoming procurement requests and keep status up to date.
      </p>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <Loading label="Loading requests..." />
      ) : requests.length === 0 ? (
        <div className="alert alert-info">
          No requests yet. Create the first one.
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Vendor</th>
                  <th>Dept.</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="text-nowrap fw-semibold">{req.id}</td>
                    <td>{req.title}</td>
                    <td>
                      <div className="fw-semibold">{req.vendor}</div>
                      <div className="text-muted small">{req.vat_id}</div>
                    </td>
                    <td className="text-nowrap">{req.department}</td>
                    <td>
                      {req.status && <StatusBadge status={req.status} />}
                    </td>
                    <td className="text-nowrap">
                      € {Number(req.total || 0).toFixed(2)}
                    </td>
                    <td className="text-end">
                      <select
                        className="form-select form-select-sm w-auto d-inline-block"
                        value={req.status ?? 'Open'}
                        disabled={updatingId === req.id}
                        onChange={(e) =>
                          changeStatus(req.id, e.target.value as RequestStatus)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestListPage

