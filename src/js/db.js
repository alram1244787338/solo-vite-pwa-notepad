const DB_NAME = 'notepad'
const DB_VERSION = 1
const STORE_NAME = 'notes'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    }

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}

function addNote(note) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const noteWithTime = {
        ...note,
        createdAt: note.createdAt || Date.now(),
        updatedAt: note.updatedAt || Date.now()
      }
      const request = store.add(noteWithTime)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    }).catch(reject)
  })
}

function getAllNotes() {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const notes = request.result.sort((a, b) => b.updatedAt - a.updatedAt)
        resolve(notes)
      }

      request.onerror = () => {
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    }).catch(reject)
  })
}

function updateNote(id, changes) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const existing = getRequest.result
        if (!existing) {
          reject(new Error('Note not found'))
          return
        }
        const updated = { ...existing, ...changes, updatedAt: Date.now() }
        const putRequest = store.put(updated)

        putRequest.onsuccess = () => {
          resolve(putRequest.result)
        }

        putRequest.onerror = () => {
          reject(putRequest.error)
        }
      }

      getRequest.onerror = () => {
        reject(getRequest.error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    }).catch(reject)
  })
}

function deleteNote(id) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    }).catch(reject)
  })
}

export { addNote, getAllNotes, updateNote, deleteNote }
