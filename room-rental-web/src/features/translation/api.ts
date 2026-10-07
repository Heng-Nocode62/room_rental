import type { Language, PageResponse, Translation, TranslationMatrixRow } from '../../i18n/types'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let message = `Request failed: ${response.status}`
    try {
      const body = await response.json()
      message = body.message || message
    } catch {}
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

export async function listLanguages(params: {
  keyword?: string
  active?: boolean | ''
  page?: number
  perPage?: number
} = {}) {
  const search = new URLSearchParams()
  if (params.keyword) search.set('keyword', params.keyword)
  if (params.active !== undefined && params.active !== '') search.set('isActive', String(params.active))
  search.set('page', String(params.page ?? 0))
  search.set('perPage', String(params.perPage ?? 20))
  return request<PageResponse<Language>>(`/api/language?${search}`)
}

export async function createLanguage(payload: {
  code: string
  title: string
  flag?: string
  active?: boolean
}) {
  return request<Language>('/api/language', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateLanguage(id: number, payload: {
  code: string
  title: string
  flag?: string
  active?: boolean
}) {
  return request<Language>(`/api/language/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function toggleLanguage(id: number) {
  return request<Language>(`/api/language/${id}/toggle`, { method: 'PATCH' })
}

export async function deleteLanguage(id: number) {
  return request<void>(`/api/language/${id}`, { method: 'DELETE' })
}

export async function listTranslations(languageId: number, keyword = '', page = 0, perPage = 50) {
  const search = new URLSearchParams({ page: String(page), perPage: String(perPage) })
  if (keyword) search.set('keyword', keyword)
  return request<PageResponse<Translation>>(`/api/language/${languageId}/translation?${search}`)
}

export async function upsertTranslation(languageId: number, payload: {
  key: string
  value: unknown
  active?: boolean
}) {
  return request<Translation>(`/api/language/${languageId}/translation`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function toggleTranslation(id: number) {
  return request<Translation>(`/api/translation/${id}/toggle`, { method: 'PATCH' })
}

export async function deleteTranslation(id: number) {
  return request<void>(`/api/translation/${id}`, { method: 'DELETE' })
}

export async function deleteTranslationByKey(key: string) {
  const search = new URLSearchParams({ key })
  return request<void>(`/api/translation/by-key?${search}`, { method: 'DELETE' })
}

export async function saveGlobalTranslation(key: string, values: Record<number, string>) {
  return request<{ message: string }>('/api/translation/global', {
    method: 'POST',
    body: JSON.stringify({ key, values }),
  })
}

export async function listTranslationMatrix(keyword = '') {
  const search = new URLSearchParams()
  if (keyword) search.set('keyword', keyword)
  return request<TranslationMatrixRow[]>(`/api/translation/matrix?${search}`)
}

export async function importTranslations(file: File) {
  const form = new FormData()
  form.append('file', file)
  return request<{ message: string; imported: number; skipped: number; languagesMatched: number; rowsProcessed: number }>(
    '/api/translation/import',
    { method: 'POST', body: form },
  )
}

export async function downloadExport(languageIds: number[] = []) {
  const search = new URLSearchParams()
  languageIds.forEach((id) => search.append('languages', String(id)))
  const response = await fetch(`/api/translation/export?${search}`)
  if (!response.ok) throw new Error('Could not export translations')
  return response.blob()
}
