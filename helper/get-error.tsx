import axios from "axios"
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || 'Request failed'
  }
  return 'Unexpected error'
}