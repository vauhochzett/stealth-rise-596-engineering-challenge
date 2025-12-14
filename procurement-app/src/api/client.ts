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
const useMock = import.meta.env.VITE_USE_MOCKS === 'true'

const http = axios.create({
  baseURL,
})

const mockRequests: ProcurementRequest[] = [
  {
    id: 'REQ-1001',
    requestor: 'John Doe',
    department: 'HR',
    title: 'Adobe Creative Cloud Subscription',
    vendor: 'Adobe Systems',
    vat_id: 'DE123456789',
    commodity_group: 'Information Technology - Software',
    orders: [
      {
        title: 'Adobe Photoshop License',
        unit_price: 200,
        amount: 5,
        unit: 'licenses',
        total: 1000,
      },
    ],
    total: 3000,
    status: 'Open',
  },
]

function simulateLatency<T>(payload: T, delay = 400) {
  return new Promise<T>((resolve) => setTimeout(() => resolve(payload), delay))
}

export const api = {
  async listRequests(): Promise<ProcurementRequest[]> {
    if (useMock) {
      return simulateLatency(mockRequests)
    }
    const { data } = await http.get<ProcurementRequest[]>('/requests')
    return data
  },
  async createRequest(payload: RequestPayload): Promise<ProcurementRequest> {
    if (useMock) {
      const newRequest: ProcurementRequest = {
        ...payload,
        id: `REQ-${Math.floor(Math.random() * 9000) + 1000}`,
        status: 'Open',
      }
      mockRequests.unshift(newRequest)
      return simulateLatency(newRequest)
    }
    const { data } = await http.post<ProcurementRequest>('/request/new', payload)
    return data
  },
  async updateStatus(
    id: string,
    status: RequestStatus,
  ): Promise<ProcurementRequest> {
    if (useMock) {
      const existing = mockRequests.find((r) => r.id === id)
      if (existing) existing.status = status
      return simulateLatency(existing ?? mockRequests[0])
    }
    const { data } = await http.patch<ProcurementRequest>(
      `/requests/${id}/status`,
      { status },
    )
    return data
  },
  async extractFromOffer(file: File): Promise<ExtractedOffer> {
    if (useMock) {
      return simulateLatency({
        vendor: 'Global Tech Solutions',
        vat_id: 'DE987654321',
        department: 'Creative Marketing Department',
        commodity_group: 'Information Technology - Software',
        orders: [
          {
            title: 'Adobe Photoshop License',
            unit_price: 150,
            amount: 10,
            unit: 'licenses',
            total: 1500,
          },
          {
            title: 'Adobe Illustrator License',
            unit_price: 120,
            amount: 5,
            unit: 'licenses',
            total: 600,
          },
        ],
        total: 2100,
      })
    }
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

