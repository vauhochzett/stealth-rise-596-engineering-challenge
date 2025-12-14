import type { ProcurementRequest } from '../api/client'

type Props = {
  request: ProcurementRequest
}

const RequestDetails = ({ request }: Props) => {
  return (
    <div className="card shadow-sm border-0 mt-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Request Details</h5>
          <span className="badge text-bg-secondary">{request.id}</span>
        </div>
        <div className="row gy-3">
          <div className="col-md-4">
            <h6 className="text-muted text-uppercase small">Requestor</h6>
            <div className="fw-semibold">{request.requestor}</div>
            <div className="text-muted small">{request.department}</div>
          </div>
          <div className="col-md-4">
            <h6 className="text-muted text-uppercase small">Vendor</h6>
            <div className="fw-semibold">{request.vendor}</div>
            <div className="text-muted small">VAT: {request.vat_id}</div>
          </div>
          <div className="col-md-4">
            <h6 className="text-muted text-uppercase small">Commodity Group</h6>
            <div>{request.commodity_group || 'Pending classification'}</div>
          </div>
          <div className="col-12">
            <h6 className="text-muted text-uppercase small">Title</h6>
            <div>{request.title}</div>
          </div>
        </div>

        <hr className="my-4" />

        <h6 className="text-muted text-uppercase small">Order Lines</h6>
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-end">Unit Price (€)</th>
                <th className="text-end">Qty</th>
                <th>Unit</th>
                <th className="text-end">Total (€)</th>
              </tr>
            </thead>
            <tbody>
              {request.orders.map((order, idx) => (
                <tr key={`${order.title}-${idx}`}>
                  <td>{order.title}</td>
                  <td className="text-end">
                    {Number(order.unit_price).toFixed(2)}
                  </td>
                  <td className="text-end">{order.amount}</td>
                  <td>{order.unit}</td>
                  <td className="text-end">{Number(order.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <div className="h5 mb-0">
            Total: € {Number(request.total || 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestDetails

