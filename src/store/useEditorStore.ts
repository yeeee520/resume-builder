import { create } from 'zustand'

interface EditorSlice {
  selectedBlockId: string | null
  isDragging: boolean
  leftPanelOpen: boolean
  rightPanelOpen: boolean
}

interface EditorActions {
  selectBlock: (id: string | null) => void
  setDragging: (dragging: boolean) => void
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
}

export const useEditorStore = create<EditorSlice & EditorActions>()((set) => ({
  selectedBlockId: null,
  isDragging: false,
  leftPanelOpen: true,
  rightPanelOpen: true,

  selectBlock: (id) => set({ selectedBlockId: id }),
  setDragging: (dragging) => set({ isDragging: dragging }),
  toggleLeftPanel: () => set(s => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set(s => ({ rightPanelOpen: !s.rightPanelOpen })),
}))
