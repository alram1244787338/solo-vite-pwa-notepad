import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { addNote, getAllNotes, updateNote, deleteNote } from '../src/js/db.js'

describe('db.js', () => {
  beforeEach(async () => {
    const databases = await indexedDB.databases()
    for (const dbInfo of databases) {
      indexedDB.deleteDatabase(dbInfo.name)
    }
  })

  afterEach(async () => {
    const databases = await indexedDB.databases()
    for (const dbInfo of databases) {
      indexedDB.deleteDatabase(dbInfo.name)
    }
  })

  describe('addNote', () => {
    it('插入后的记录有 id、createdAt、updatedAt', async () => {
      const noteData = { title: '测试笔记', content: '测试内容' }
      const id = await addNote(noteData)

      expect(typeof id).toBe('number')
      expect(id).toBeGreaterThan(0)

      const notes = await getAllNotes()
      expect(notes.length).toBe(1)

      const savedNote = notes[0]
      expect(savedNote.id).toBe(id)
      expect(savedNote.title).toBe('测试笔记')
      expect(savedNote.content).toBe('测试内容')
      expect(typeof savedNote.createdAt).toBe('number')
      expect(typeof savedNote.updatedAt).toBe('number')
      expect(savedNote.createdAt).toBe(savedNote.updatedAt)
    })
  })

  describe('getAllNotes', () => {
    it('按 updatedAt 降序排列', async () => {
      const now = Date.now()
      await addNote({ title: '笔记1', content: '内容1', createdAt: now - 2000, updatedAt: now - 2000 })
      await addNote({ title: '笔记2', content: '内容2', createdAt: now - 1000, updatedAt: now - 1000 })
      await addNote({ title: '笔记3', content: '内容3', createdAt: now, updatedAt: now })

      const notes = await getAllNotes()
      expect(notes.length).toBe(3)
      expect(notes[0].title).toBe('笔记3')
      expect(notes[1].title).toBe('笔记2')
      expect(notes[2].title).toBe('笔记1')
    })
  })

  describe('updateNote', () => {
    it('只更新传入的字段且 createdAt 不变', async () => {
      const id = await addNote({ title: '原标题', content: '原内容' })

      const notesBefore = await getAllNotes()
      const originalNote = notesBefore[0]
      const originalCreatedAt = originalNote.createdAt
      const originalUpdatedAt = originalNote.updatedAt

      await new Promise(resolve => setTimeout(resolve, 10))

      await updateNote(id, { title: '新标题' })

      const notesAfter = await getAllNotes()
      const updatedNote = notesAfter[0]

      expect(updatedNote.title).toBe('新标题')
      expect(updatedNote.content).toBe('原内容')
      expect(updatedNote.createdAt).toBe(originalCreatedAt)
      expect(updatedNote.updatedAt).toBeGreaterThan(originalUpdatedAt)
    })

    it('可以同时更新多个字段', async () => {
      const id = await addNote({ title: '原标题', content: '原内容' })

      const notesBefore = await getAllNotes()
      const originalCreatedAt = notesBefore[0].createdAt

      await updateNote(id, { title: '新标题', content: '新内容' })

      const notesAfter = await getAllNotes()
      const updatedNote = notesAfter[0]

      expect(updatedNote.title).toBe('新标题')
      expect(updatedNote.content).toBe('新内容')
      expect(updatedNote.createdAt).toBe(originalCreatedAt)
    })
  })

  describe('deleteNote', () => {
    it('删除后 get 不到', async () => {
      const id = await addNote({ title: '待删除', content: '内容' })

      let notes = await getAllNotes()
      expect(notes.length).toBe(1)

      await deleteNote(id)

      notes = await getAllNotes()
      expect(notes.length).toBe(0)
    })
  })
})
