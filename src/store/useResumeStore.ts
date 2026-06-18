import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Block, BlockType, Resume } from './types'
import {
  defaultTitleStyle,
  defaultParagraphStyle,
  defaultDividerStyle,
  defaultSkillBarStyle,
  defaultTimelineStyle,
  defaultContactStyle,
} from './types'

// ==================== 静态帮助函数 ====================

function createDefaultBlock(type: BlockType, order: number): Block {
  const id = nanoid(8)
  const base = { id, type, order } as const

  switch (type) {
    case 'title':
      return { ...base, type: 'title', content: '新标题', level: 'h2' as const, style: { ...defaultTitleStyle } }
    case 'paragraph':
      return { ...base, type: 'paragraph', content: '正文内容', style: { ...defaultParagraphStyle } }
    case 'divider':
      return { ...base, type: 'divider', style: { ...defaultDividerStyle } }
    case 'skill-bar':
      return { ...base, type: 'skill-bar', label: '技能名称', level: 80, style: { ...defaultSkillBarStyle } }
    case 'timeline':
      return {
        ...base, type: 'timeline',
        items: [{ id: nanoid(8), dateRange: '2020.01 - 至今', title: '经历标题', description: '经历描述' }],
        style: { ...defaultTimelineStyle },
      }
    case 'avatar':
      return { ...base, type: 'avatar', imageDataUrl: null, shape: 'circle' as const, size: 80 }
    case 'tag-group':
      return { ...base, type: 'tag-group', tags: [] }
    case 'contact':
      return {
        ...base, type: 'contact',
        items: [{ id: nanoid(8), label: '邮箱', value: 'example@email.com' }],
        style: { ...defaultContactStyle },
      }
    case 'spacer':
      return { ...base, type: 'spacer', height: 20 }
  }
}

/** 纯函数：找到当前简历并返回 index */
function getCurrentResumeIndex(state: ResumeSliceState): number {
  return state.resumes.findIndex(r => r.id === state.currentResumeId)
}

/** 纯函数：获取当前 blocks */
function getCurrentBlocks(state: ResumeSliceState): Block[] {
  const idx = getCurrentResumeIndex(state)
  return idx >= 0 ? state.resumes[idx].blocks : []
}

/** 纯函数：设置当前 blocks */
function setCurrentBlocks(state: ResumeSliceState, blocks: Block[]): void {
  const idx = getCurrentResumeIndex(state)
  if (idx >= 0) {
    state.resumes[idx].blocks = blocks
    state.resumes[idx].updatedAt = Date.now()
  }
}

const MAX_HISTORY = 50

// ==================== Store 类型 ====================

interface ResumeSliceState {
  resumes: Resume[]
  currentResumeId: string | null
  past: Block[][]
  future: Block[][]
}

interface ResumeSliceActions {
  addResume: (name: string) => string
  deleteResume: (id: string) => void
  switchResume: (id: string) => void
  renameResume: (id: string, name: string) => void
  addBlock: (type: BlockType, index?: number) => string
  addBlocks: (blocks: Block[]) => void
  updateBlock: (id: string, patch: Partial<Block>) => void
  removeBlock: (id: string) => void
  moveBlock: (fromIndex: number, toIndex: number) => void
  duplicateBlock: (id: string) => string | undefined
  undo: () => void
  redo: () => void
  clearHistory: () => void
}

type ResumeSlice = ResumeSliceState & ResumeSliceActions

// ==================== Store 实现 ====================

export const useResumeStore = create<ResumeSlice>()(
  persist(
    immer((set, get) => ({
      // ---- 状态 ----
      resumes: [],
      currentResumeId: null,
      past: [],
      future: [],

      // ---- 简历 CRUD ----

      addResume: (name: string) => {
        const id = nanoid(8)
        set(state => {
          const now = Date.now()
          state.resumes.push({
            id,
            name,
            createdAt: now,
            updatedAt: now,
            blocks: [],
            themeId: 'modern-blue',
          })
          if (!state.currentResumeId) {
            state.currentResumeId = id
          }
        })
        return id
      },

      deleteResume: (id: string) => {
        set(state => {
          const idx = state.resumes.findIndex(r => r.id === id)
          if (idx === -1) return
          state.resumes.splice(idx, 1)
          if (state.currentResumeId === id) {
            state.currentResumeId = state.resumes[0]?.id ?? null
          }
        })
      },

      switchResume: (id: string) => {
        set(state => {
          if (state.resumes.some(r => r.id === id)) {
            state.currentResumeId = id
            state.past = []
            state.future = []
          }
        })
      },

      renameResume: (id: string, name: string) => {
        set(state => {
          const resume = state.resumes.find(r => r.id === id)
          if (resume) resume.name = name
        })
      },

      // ---- Block CRUD ----

      addBlock: (type: BlockType, index?: number): string => {
        const state = get()
        const blocks = getCurrentBlocks(state)
        const insertIndex = index ?? blocks.length
        const newBlock = createDefaultBlock(type, insertIndex)
        const newBlocks = [...blocks]
        newBlocks.splice(insertIndex, 0, newBlock)
        const reordered = newBlocks.map((b, i) => ({ ...b, order: i }))

        set(state => {
          state.past.push(blocks)
          if (state.past.length > MAX_HISTORY) state.past.shift()
          state.future = []
          setCurrentBlocks(state, reordered)
        })
        return newBlock.id
      },

      addBlocks: (newBlocks: Block[]) => {
        const state = get()
        const currentBlocks = getCurrentBlocks(state)
        const startOrder = currentBlocks.length
        const ordered = newBlocks.map((b, i) => ({ ...b, order: startOrder + i }))

        set(state => {
          state.past.push(currentBlocks)
          if (state.past.length > MAX_HISTORY) state.past.shift()
          state.future = []
          setCurrentBlocks(state, [...currentBlocks, ...ordered])
        })
      },

      updateBlock: (id: string, patch: Partial<Block>) => {
        const state = get()
        const blocks = getCurrentBlocks(state)

        set(state => {
          state.past.push(blocks)
          if (state.past.length > MAX_HISTORY) state.past.shift()
          state.future = []
          const updated = getCurrentBlocks(state).map(b =>
            b.id === id ? { ...b, ...patch } as Block : b
          )
          setCurrentBlocks(state, updated)
        })
      },

      removeBlock: (id: string) => {
        const state = get()
        const blocks = getCurrentBlocks(state)

        set(state => {
          state.past.push(blocks)
          if (state.past.length > MAX_HISTORY) state.past.shift()
          state.future = []
          const filtered = getCurrentBlocks(state).filter(b => b.id !== id).map((b, i) => ({ ...b, order: i }))
          setCurrentBlocks(state, filtered)
        })
      },

      moveBlock: (fromIndex: number, toIndex: number) => {
        const state = get()
        const blocks = getCurrentBlocks(state)
        if (fromIndex === toIndex) return
        const moved = [...blocks]
        const [item] = moved.splice(fromIndex, 1)
        moved.splice(toIndex, 0, item)
        const reordered = moved.map((b, i) => ({ ...b, order: i }))

        set(state => {
          state.past.push(blocks)
          if (state.past.length > MAX_HISTORY) state.past.shift()
          state.future = []
          setCurrentBlocks(state, reordered)
        })
      },

      duplicateBlock: (id: string): string | undefined => {
        const state = get()
        const blocks = getCurrentBlocks(state)
        const idx = blocks.findIndex(b => b.id === id)
        if (idx === -1) return
        const source = { ...blocks[idx] }
        const newId = nanoid(8)
        ;(source as Record<string, unknown>).id = newId
        const newBlocks = [...blocks]
        newBlocks.splice(idx + 1, 0, source as Block)
        const reordered = newBlocks.map((b, i) => ({ ...b, order: i }))

        set(state => {
          state.past.push(blocks)
          if (state.past.length > MAX_HISTORY) state.past.shift()
          state.future = []
          setCurrentBlocks(state, reordered)
        })
        return newId
      },

      // ---- 撤销/重做 ----

      undo: () => {
        const { past } = get()
        if (past.length === 0) return
        set(state => {
          const current = getCurrentBlocks(state)
          state.future.push(current)
          const prev = state.past.pop()!
          setCurrentBlocks(state, prev)
        })
      },

      redo: () => {
        const { future } = get()
        if (future.length === 0) return
        set(state => {
          const current = getCurrentBlocks(state)
          state.past.push(current)
          const next = state.future.pop()!
          setCurrentBlocks(state, next)
        })
      },

      clearHistory: () => {
        set(state => {
          state.past = []
          state.future = []
        })
      },
    })),
    {
      name: 'resume-builder:resume-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        resumes: state.resumes,
        currentResumeId: state.currentResumeId,
      }),
    }
  )
)
