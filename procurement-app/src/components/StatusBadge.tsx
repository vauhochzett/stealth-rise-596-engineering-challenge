import type { RequestStatus } from '../api/client'

const statusClass: Record<RequestStatus, string> = {
  Open: 'warning',
  'In Progress': 'info',
  Closed: 'success',
}

type Props = {
  status: RequestStatus
}

const StatusBadge = ({ status }: Props) => {
  const variant = statusClass[status] ?? 'secondary'
  return (
    <span className={`badge text-bg-${variant}`}>{status}</span>
  )
}

export default StatusBadge

