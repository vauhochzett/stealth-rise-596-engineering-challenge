import axios from 'axios'

export type RequestStatus = 'Open' | 'In Progress' | 'Closed'

export type Order = {
  title: string
  unit_price: number
  amount: number
  unit: string
  total: number
}

export type RequestPayload = {
  requestor: string
  department: string
  title: string
  vendor: string
  vat_id: string
  commodity_group: string
  orders: Order[]
  total: number
}

export type ProcurementRequest = RequestPayload & {
  id: string
  status: RequestStatus
}

export type ExtractedOffer = Partial<RequestPayload>

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const http = axios.create({
  baseURL,
})

export const api = {
  async listRequests(): Promise<ProcurementRequest[]> {
    const { data } = await http.get<ProcurementRequest[]>('/requests')
    return data
  },
  async createRequest(payload: RequestPayload): Promise<ProcurementRequest> {
    const { data } = await http.post<ProcurementRequest>('/request/new', payload)
    return data
  },
  async updateStatus(
    id: string,
    status: RequestStatus,
  ): Promise<ProcurementRequest> {
    const { data } = await http.put<ProcurementRequest>(
      `/request/${id}/status`,
      { status },
    )
    return data
  },
  async extractFromOffer(file: File): Promise<ExtractedOffer> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await http.post<ExtractedOffer>(
      '/requests/extract',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
    return data
  },
}

