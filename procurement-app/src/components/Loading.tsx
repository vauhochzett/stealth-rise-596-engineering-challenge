type Props = {
  label?: string
}

const Loading = ({ label = 'Loading...' }: Props) => (
  <div className="d-flex align-items-center gap-2 text-muted">
    <div className="spinner-border spinner-border-sm" role="status" />
    <span>{label}</span>
  </div>
)

export default Loading

