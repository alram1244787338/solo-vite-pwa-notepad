import { registerServiceWorker } from './sw-register.js'
import { initUI, loadNotes } from './render.js'

function init() {
  registerServiceWorker()
  loadNotes()
  initUI()
}

init()
