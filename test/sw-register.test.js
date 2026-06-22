import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { registerServiceWorker, showOfflineBanner } from '../src/js/sw-register.js'

describe('sw-register.js', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      cb()
      return 0
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('showOfflineBanner', () => {
    it('创建了 .offline-banner 元素', () => {
      expect(document.querySelector('.offline-banner')).toBeNull()

      showOfflineBanner()

      const banner = document.querySelector('.offline-banner')
      expect(banner).not.toBeNull()
      expect(banner.textContent).toBe('已支持离线使用')
      expect(banner.classList.contains('offline-banner')).toBe(true)
    })

    it('添加 show 类显示横幅', () => {
      showOfflineBanner()

      const banner = document.querySelector('.offline-banner')
      expect(banner.classList.contains('show')).toBe(true)
    })

    it('3 秒后移除横幅', () => {
      showOfflineBanner()

      let banner = document.querySelector('.offline-banner')
      expect(banner.classList.contains('show')).toBe(true)

      vi.advanceTimersByTime(3000)
      expect(banner.classList.contains('show')).toBe(false)
      expect(document.querySelector('.offline-banner')).not.toBeNull()

      vi.advanceTimersByTime(400)
      expect(document.querySelector('.offline-banner')).toBeNull()
    })
  })

  describe('registerServiceWorker', () => {
    it('navigator.serviceWorker 不存在时直接 resolve', async () => {
      const originalSW = navigator.serviceWorker
      delete navigator.serviceWorker

      const result = await registerServiceWorker()
      expect(result).toBeUndefined()

      navigator.serviceWorker = originalSW
    })

    it('navigator.serviceWorker 存在时调用 register', async () => {
      const mockRegister = vi.fn().mockResolvedValue({
        scope: 'http://localhost/',
        addEventListener: vi.fn(),
        installing: null
      })

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: mockRegister,
          controller: null
        },
        writable: true
      })

      const promise = registerServiceWorker()

      window.dispatchEvent(new Event('load'))

      const result = await promise

      expect(mockRegister).toHaveBeenCalledWith('/sw.js')
      expect(result).toEqual(expect.objectContaining({ scope: 'http://localhost/' }))
    })

    it('注册成功后显示横幅', async () => {
      const mockRegister = vi.fn().mockResolvedValue({
        scope: 'http://localhost/',
        addEventListener: vi.fn(),
        installing: null
      })

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: mockRegister,
          controller: null
        },
        writable: true
      })

      const promise = registerServiceWorker()
      window.dispatchEvent(new Event('load'))
      await promise

      vi.advanceTimersByTime(1000)

      expect(document.querySelector('.offline-banner')).not.toBeNull()
      expect(document.querySelector('.offline-banner').classList.contains('show')).toBe(true)
    })

    it('注册失败时 reject', async () => {
      const testError = new Error('注册失败')
      const mockRegister = vi.fn().mockRejectedValue(testError)

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: mockRegister,
          controller: null
        },
        writable: true
      })

      const promise = registerServiceWorker()
      window.dispatchEvent(new Event('load'))

      await expect(promise).rejects.toThrow('注册失败')
    })

    it('监听 updatefound 事件', async () => {
      const mockAddEventListener = vi.fn()
      const mockRegister = vi.fn().mockResolvedValue({
        scope: 'http://localhost/',
        addEventListener: mockAddEventListener,
        installing: null
      })

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: mockRegister,
          controller: null
        },
        writable: true
      })

      const promise = registerServiceWorker()
      window.dispatchEvent(new Event('load'))
      await promise

      expect(mockAddEventListener).toHaveBeenCalledWith('updatefound', expect.any(Function))
    })
  })
})
