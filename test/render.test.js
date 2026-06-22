import { describe, it, expect, beforeEach, vi } from 'vitest'
import { escapeHtml, renderNotes } from '../src/js/render.js'

vi.mock('../src/js/db.js', () => ({
  addNote: vi.fn(),
  getAllNotes: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn()
}))

describe('render.js', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="notes-container"></div>
    `
  })

  describe('escapeHtml', () => {
    it('对 <script> 进行转义', () => {
      const result = escapeHtml('<script>alert("xss")</script>')
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
      expect(result).not.toContain('<script>')
    })

    it('转义其他 HTML 特殊字符', () => {
      expect(escapeHtml('<div>')).toBe('&lt;div&gt;')
      expect(escapeHtml('&')).toBe('&amp;')
      expect(escapeHtml('"')).toBe('&quot;')
      expect(escapeHtml("'")).toBe('&#39;')
    })

    it('普通文本不变', () => {
      expect(escapeHtml('hello world')).toBe('hello world')
      expect(escapeHtml('你好')).toBe('你好')
    })
  })

  describe('renderNotes', () => {
    it('生成的 DOM 里有 .note-card 元素', () => {
      const notes = [
        { id: 1, title: '笔记1', content: '内容1', updatedAt: Date.now() }
      ]

      renderNotes(notes)

      const card = document.querySelector('.note-card')
      expect(card).not.toBeNull()
      expect(card.dataset.id).toBe('1')
    })

    it('多条笔记生成多个 .note-card 元素', () => {
      const notes = [
        { id: 1, title: '笔记1', content: '内容1', updatedAt: Date.now() },
        { id: 2, title: '笔记2', content: '内容2', updatedAt: Date.now() - 1000 }
      ]

      renderNotes(notes)

      const cards = document.querySelectorAll('.note-card')
      expect(cards.length).toBe(2)
    })

    it('空笔记列表显示空状态文字', () => {
      renderNotes([])

      const container = document.getElementById('notes-container')
      expect(container.querySelector('.empty-text')).not.toBeNull()
      expect(container.querySelector('.note-card')).toBeNull()
    })

    it('笔记内容被正确转义', () => {
      const notes = [
        { id: 1, title: '<script>alert(1)</script>', content: '<div>xss</div>', updatedAt: Date.now() }
      ]

      renderNotes(notes)

      const card = document.querySelector('.note-card')
      expect(card.innerHTML).not.toContain('<script>')
      expect(card.innerHTML).not.toContain('<div>xss</div>')
    })
  })
})
