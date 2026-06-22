export function isHTMLRequest(request) {
  return request.mode === 'navigate' || !!(request.headers.get('accept')?.includes('text/html'))
}

export const CACHE_NAME = 'notepad-cache-v2'
export const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json'
]
