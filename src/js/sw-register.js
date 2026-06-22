export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker 注册成功:', registration.scope)
          showOfflineBanner()

          registration.addEventListener('updatefound', () => {
            console.log('发现新的 Service Worker')
            const newWorker = registration.installing
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('有新版本可用，请刷新页面')
              }
            })
          })

          resolve(registration)
        })
        .catch((error) => {
          console.log('Service Worker 注册失败:', error)
          reject(error)
        })
    })
  })
}

function showOfflineBanner() {
  const banner = document.createElement('div')
  banner.className = 'offline-banner'
  banner.textContent = '已支持离线使用'
  document.body.appendChild(banner)

  requestAnimationFrame(() => {
    banner.classList.add('show')
  })

  setTimeout(() => {
    banner.classList.remove('show')
    setTimeout(() => {
      banner.remove()
    }, 400)
  }, 3000)
}
