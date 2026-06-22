import { addNote, getAllNotes, updateNote, deleteNote } from './db.js'

let currentNoteId = null

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getNoteTitle(content) {
  const firstLine = content.split('\n')[0]
  return firstLine.substring(0, 50) || '无标题笔记'
}

export function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function loadNotes() {
  try {
    const notes = await getAllNotes()
    renderNotes(notes)
  } catch (error) {
    console.error('加载笔记失败:', error)
  }
}

export function renderNotes(notes) {
  const container = document.getElementById('notes-container')

  if (notes.length === 0) {
    container.innerHTML = '<p class="empty-text">还没有笔记，开始写第一篇吧！</p>'
    return
  }

  container.innerHTML = notes.map((note) => `
    <div class="note-card" data-id="${note.id}">
      <button class="btn-delete-close" data-id="${note.id}" title="删除">×</button>
      <div class="note-card-content">
        <h3 class="note-title">${escapeHtml(note.title || getNoteTitle(note.content))}</h3>
        <p class="note-preview">${escapeHtml(note.content.substring(0, 100))}</p>
        <span class="note-time">${formatTime(note.updatedAt)}</span>
      </div>
      <div class="note-card-actions">
        <button class="btn btn-edit" data-id="${note.id}">编辑</button>
      </div>
    </div>
  `).join('')

  container.querySelectorAll('.note-card').forEach((card) => {
    const id = Number(card.dataset.id)
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.note-card-actions') && !e.target.closest('.btn-delete-close')) {
        editNote(id)
      }
    })
  })

  container.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      editNote(Number(btn.dataset.id))
    })
  })

  container.querySelectorAll('.btn-delete-close').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      deleteNoteById(Number(btn.dataset.id))
    })
  })
}

export async function saveNote() {
  const titleInput = document.getElementById('note-title')
  const contentTextarea = document.getElementById('note-content')
  const title = titleInput.value.trim()
  const content = contentTextarea.value.trim()

  if (!content) {
    alert('笔记内容不能为空')
    return
  }

  try {
    if (currentNoteId) {
      await updateNote(currentNoteId, {
        title: title || getNoteTitle(content),
        content
      })
    } else {
      await addNote({
        title: title || getNoteTitle(content),
        content
      })
    }

    clearEditor()
    loadNotes()
  } catch (error) {
    console.error('保存笔记失败:', error)
    alert('保存失败')
  }
}

export async function editNote(id) {
  try {
    const notes = await getAllNotes()
    const note = notes.find((n) => n.id === id)
    if (note) {
      currentNoteId = id
      document.getElementById('note-title').value = note.title || ''
      document.getElementById('note-content').value = note.content
      document.getElementById('save-btn').textContent = '更新笔记'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } catch (error) {
    console.error('加载笔记失败:', error)
  }
}

export async function deleteNoteById(id) {
  const card = document.querySelector(`.note-card[data-id="${id}"]`)
  if (card) {
    card.classList.add('fade-out')
  }

  try {
    await deleteNote(id)
    if (currentNoteId === id) {
      clearEditor()
    }
    setTimeout(() => {
      loadNotes()
    }, 300)
  } catch (error) {
    console.error('删除笔记失败:', error)
    alert('删除失败')
    if (card) {
      card.classList.remove('fade-out')
    }
  }
}

export function clearEditor() {
  currentNoteId = null
  document.getElementById('note-title').value = ''
  document.getElementById('note-content').value = ''
  document.getElementById('save-btn').textContent = '保存笔记'
}

export function initUI() {
  document.getElementById('save-btn').addEventListener('click', saveNote)
  document.getElementById('new-btn').addEventListener('click', clearEditor)
}
