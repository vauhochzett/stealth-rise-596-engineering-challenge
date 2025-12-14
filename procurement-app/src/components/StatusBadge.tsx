import type { RequestStatus } from '../api/client'

const statusClass: Record<RequestStatus, string> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  CLOSED: 'success',
}

type Props = {
  status: RequestStatus
}

const StatusBadge = ({ status }: Props) => {
  return (
    <span className={`badge text-bg-${statusClass[status]}`}>{status}</span>
  )
}

export default StatusBadge

