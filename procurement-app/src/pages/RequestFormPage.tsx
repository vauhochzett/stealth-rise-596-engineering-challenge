import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Order, RequestPayload } from '../api/client'
import { api } from '../api/client'
import Loading from '../components/Loading'
import OrderLinesEditor from '../components/OrderLinesEditor'

const emptyLine: Order = {
  title: '',
  unit_price: 0,
  amount: 1,
  unit: '',
  total: 0,
}

const RequestFormPage = () => {
  const navigate = useNavigate()
  const [orderLines, setOrderLines] = useState<Order[]>([{ ...emptyLine }])
  const [form, setForm] = useState<RequestPayload>({
    requestor: '',
    department: '',
    title: '',
    vendor: '',
    vat_id: '',
    commodity_group: '',
    orders: [],
    total: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const totalFromLines = useMemo(
    () =>
      orderLines.reduce((sum, line) => sum + (Number(line.total) || 0), 0),
    [orderLines],
  )

  const updateField = <K extends keyof RequestPayload>(
    key: K,
    value: RequestPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (evt: FormEvent) => {
    evt.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      const payload: RequestPayload = {
        ...form,
        orders: orderLines,
        total: totalFromLines,
      }
      const created = await api.createRequest(payload)
      setSuccess(`Request ${created.id} created`)
      setTimeout(() => navigate('/requests'), 500)
    } catch (err) {
      setError('Failed to submit request. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExtract = async (file: File) => {
    setIsExtracting(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await api.extractFromOffer(file)
      if (data.orders?.length) {
        setOrderLines(data.orders)
      }
      setForm((prev) => ({
        ...prev,
        requestor: data.requestor ?? prev.requestor,
        title: data.title ?? prev.title,
        vendor: data.vendor ?? prev.vendor,
        vat_id: data.vat_id ?? prev.vat_id,
        department: data.department ?? prev.department,
        commodity_group: data.commodity_group ?? prev.commodity_group,
      }))
      setSuccess('Offer extracted. Review the details below.')
    } catch (err) {
      setError('Could not extract data from the uploaded document.')
      console.error(err)
    } finally {
      setIsExtracting(false)
    }
  }

  const onFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0]
    if (file) handleExtract(file)
  }

  return (
    <div className="row">
      <div className="col-lg-8">
        <div className="d-flex align-items-center gap-2 mb-2">
          <i className="bi bi-file-text text-primary fs-4" />
          <h2 className="mb-0">Create procurement request</h2>
        </div>
        <p className="text-muted mb-4">
          Upload an offer to auto-fill details, review the lines, and submit to
          procurement.
        </p>
        <form className="needs-validation" onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="mb-3">
            <label className="form-label">Upload vendor offer (PDF/Doc)</label>
            <input
              type="file"
              className="form-control"
              accept=".pdf,.doc,.docx,.txt,image/*"
              onChange={onFileChange}
              disabled={isExtracting}
            />
            <div className="form-text">
              We will extract vendor, VAT ID, department and order lines for
              you.
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Requestor Name</label>
              <input
                className="form-control"
                value={form.requestor}
                onChange={(e) => updateField('requestor', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Department</label>
              <input
                className="form-control"
                value={form.department}
                onChange={(e) => updateField('department', e.target.value)}
                placeholder="HR"
                required
              />
            </div>
            <div className="col-md-12">
              <label className="form-label">Title / Short Description</label>
              <input
                className="form-control"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Adobe Creative Cloud Subscription"
                required
              />
            </div>
          </div>

          <hr className="my-4" />

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Vendor Name</label>
              <input
                className="form-control"
                value={form.vendor}
                onChange={(e) => updateField('vendor', e.target.value)}
                placeholder="Global Tech Solutions"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">VAT ID</label>
              <input
                className="form-control"
                value={form.vat_id}
                onChange={(e) => updateField('vat_id', e.target.value)}
                placeholder="DE123456789"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Commodity Group</label>
              <input
                className="form-control bg-light-subtle text-muted"
                value={form.commodity_group}
                readOnly
                disabled
                placeholder="Auto-selected by backend"
              />
              <div className="form-text">
                Auto-classified by procurement. Will update after extraction or backend processing.
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label">Total Cost (EUR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control bg-light-subtle text-muted"
                value={totalFromLines}
                readOnly
                disabled
                placeholder="Calculated from order lines"
              />
              <div className="form-text">
                Calculated from order lines ({totalFromLines.toFixed(2)} €).
              </div>
            </div>
          </div>

          <hr className="my-4" />

          <OrderLinesEditor lines={orderLines} onChange={setOrderLines} />

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted small">
              Total from lines: € {totalFromLines.toFixed(2)}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isExtracting}
            >
              {isSubmitting ? <Loading label="Submitting..." /> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
      <div className="col-lg-4">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h6 className="card-title">Tips</h6>
            <ul className="small text-muted ps-3">
              <li>Upload the vendor offer to auto-fill vendor fields.</li>
              <li>
                Commodity group can be left blank and classified later by
                procurement.
              </li>
              <li>Make sure every order line has quantity and price.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestFormPage
