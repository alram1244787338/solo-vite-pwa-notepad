import { describe, it, expect } from 'vitest'
import { isHTMLRequest, CACHE_NAME, APP_SHELL } from '../src/js/sw-utils.js'

describe('sw.js 纯函数测试', () => {
  describe('APP_SHELL', () => {
    it('install 事件缓存的资源至少包含 / 和 /index.html', () => {
      expect(APP_SHELL).toContain('/')
      expect(APP_SHELL).toContain('/index.html')
    })

    it('包含 manifest.json', () => {
      expect(APP_SHELL).toContain('/manifest.json')
    })
  })

  describe('CACHE_NAME', () => {
    it('定义了缓存名称', () => {
      expect(CACHE_NAME).toBeDefined()
      expect(typeof CACHE_NAME).toBe('string')
      expect(CACHE_NAME.length).toBeGreaterThan(0)
    })
  })

  describe('isHTMLRequest', () => {
    it('request.mode === navigate 时返回 true', () => {
      const request = {
        mode: 'navigate',
        headers: {
          get: () => null
        }
      }
      expect(isHTMLRequest(request)).toBe(true)
    })

    it('accept header 包含 text/html 时返回 true', () => {
      const request = {
        mode: 'cors',
        headers: {
          get: (name) => name === 'accept' ? 'text/html,application/xhtml+xml' : null
        }
      }
      expect(isHTMLRequest(request)).toBe(true)
    })

    it('mode 不是 navigate 且 accept 不含 text/html 时返回 false', () => {
      const request = {
        mode: 'cors',
        headers: {
          get: (name) => name === 'accept' ? 'application/javascript' : null
        }
      }
      expect(isHTMLRequest(request)).toBe(false)
    })

    it('mode 是 no-cors 且 accept 不含 html 时返回 false', () => {
      const request = {
        mode: 'no-cors',
        headers: {
          get: () => 'image/png'
        }
      }
      expect(isHTMLRequest(request)).toBe(false)
    })

    it('mode 是 same-origin 且 accept 包含 text/html 时返回 true', () => {
      const request = {
        mode: 'same-origin',
        headers: {
          get: () => 'text/html'
        }
      }
      expect(isHTMLRequest(request)).toBe(true)
    })

    it('使用 request.mode === navigate 作为判断条件之一', () => {
      const navigateRequest = {
        mode: 'navigate',
        headers: { get: () => null }
      }
      const nonNavigateRequest = {
        mode: 'cors',
        headers: { get: () => null }
      }

      expect(isHTMLRequest(navigateRequest)).toBe(true)
      expect(isHTMLRequest(nonNavigateRequest)).toBe(false)
    })
  })
})
