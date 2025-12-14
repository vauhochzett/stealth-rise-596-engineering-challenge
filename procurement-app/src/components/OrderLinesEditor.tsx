import type { Order } from '../api/client'

type Props = {
  lines: Order[]
  onChange: (lines: Order[]) => void
}

const blankLine: Order = {
  title: '',
  unit_price: 0,
  amount: 1,
  unit: '',
  total: 0,
}

const OrderLinesEditor = ({ lines, onChange }: Props) => {
  const updateLine = <K extends keyof Order>(
    index: number,
    key: K,
    value: Order[K],
  ) => {
    const next = [...lines]
    const numericKeys: Array<keyof Order> = ['unit_price', 'amount']
    const line = { ...next[index], [key]: value }
    if (numericKeys.includes(key)) {
      const unitPrice = Number(line.unit_price) || 0
      const amount = Number(line.amount) || 0
      line.total = Number.isFinite(unitPrice * amount)
        ? Math.round(unitPrice * amount * 100) / 100
        : 0
    }
    next[index] = line
    onChange(next)
  }

  const addLine = () => {
    onChange([...lines, { ...blankLine }])
  }

  const removeLine = (index: number) => {
    const next = lines.filter((_, i) => i !== index)
    onChange(next.length ? next : [{ ...blankLine }])
  }

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title mb-0">Order Lines</h6>
          <button
            className="btn btn-outline-primary btn-sm"
            type="button"
            onClick={addLine}
          >
            <i className="bi bi-plus-lg me-1" />
            Add line
          </button>
        </div>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Description</th>
                <th style={{ width: '15%' }}>Unit price</th>
                <th style={{ width: '15%' }}>Amount</th>
                <th style={{ width: '15%' }}>Unit</th>
                <th style={{ width: '15%' }}>Total</th>
                <th style={{ width: '10%' }} />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      className="form-control"
                      value={line.title}
                      onChange={(e) =>
                        updateLine(idx, 'title', e.target.value)
                      }
                      placeholder="Product or service"
                    />
                  </td>
                  <td>
                    <div className="input-group">
                      <span className="input-group-text">€</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={line.unit_price ?? ''}
                        onChange={(e) =>
                          updateLine(idx, 'unit_price', Number(e.target.value))
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-control"
                      value={line.amount ?? ''}
                      onChange={(e) =>
                        updateLine(idx, 'amount', Number(e.target.value))
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      value={line.unit}
                      onChange={(e) => updateLine(idx, 'unit', e.target.value)}
                      placeholder="licenses"
                    />
                  </td>
                  <td>
                    <div className="input-group">
                      <span className="input-group-text">€</span>
                      <input
                        className="form-control"
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.total ?? 0}
                        onChange={(e) => updateLine(idx, 'total', Number(e.target.value))}
                      />
                    </div>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-link text-danger"
                      onClick={() => removeLine(idx)}
                      aria-label="Remove line"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OrderLinesEditor

