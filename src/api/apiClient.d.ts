import type { AxiosInstance } from 'axios'

declare const apiClient: AxiosInstance

export declare function setUnauthorizedHandler(handler: (error: unknown) => void): void

export default apiClient
