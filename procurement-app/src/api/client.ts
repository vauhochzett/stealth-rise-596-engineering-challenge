import axios from 'axios'

export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED'

export type OrderLine = {
  description: string
  unitPrice: number
  amount: number
  unit: string
  totalPrice: number
}

export type RequestPayload = {
  requestorName: string
  title: string
  vendorName: string
  vatId: string
  commodityGroup?: string
  orderLines: OrderLine[]
  totalCost: number
  department?: string
}

export type ProcurementRequest = RequestPayload & {
  id: string
  status: RequestStatus
  createdAt?: string
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
    requestorName: 'John Doe',
    title: 'Adobe Creative Cloud Subscription',
    vendorName: 'Adobe Systems',
    vatId: 'DE123456789',
    commodityGroup: 'Information Technology - Software',
    orderLines: [
      {
        description: 'Adobe Photoshop License',
        unitPrice: 200,
        amount: 5,
        unit: 'licenses',
        totalPrice: 1000,
      },
    ],
    totalCost: 3000,
    department: 'HR',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
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
        status: 'OPEN',
        createdAt: new Date().toISOString(),
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
        vendorName: 'Global Tech Solutions',
        vatId: 'DE987654321',
        department: 'Creative Marketing Department',
        commodityGroup: 'Information Technology - Software',
        orderLines: [
          {
            description: 'Adobe Photoshop License',
            unitPrice: 150,
            amount: 10,
            unit: 'licenses',
            totalPrice: 1500,
          },
          {
            description: 'Adobe Illustrator License',
            unitPrice: 120,
            amount: 5,
            unit: 'licenses',
            totalPrice: 600,
          },
        ],
        totalCost: 2100,
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

