import { create } from 'zustand'
import type { ImportState, ImportStatus, TextSegment, ClassificationResult } from './types'

interface ImportSlice extends ImportState {
  startParse: (fileName: string, fileType: 'pdf' | 'docx') => void
  setReview: (segments: TextSegment[], classifications: ClassificationResult[]) => void
  setImporting: () => void
  setDone: () => void
  setError: (message: string) => void
  reset: () => void
  updateClassification: (index: number, update: Partial<ClassificationResult>) => void
  removeClassification: (index: number) => void
}

const initialState: ImportState = {
  status: 'idle',
  segments: [],
  classifications: [],
  fileName: '',
  fileType: null,
  errorMessage: null,
}

export const useImportStore = create<ImportSlice>()((set) => ({
  ...initialState,

  startParse: (fileName, fileType) =>
    set({ status: 'parsing', fileName, fileType, segments: [], classifications: [], errorMessage: null }),

  setReview: (segments, classifications) =>
    set({ status: 'reviewing', segments, classifications }),

  setImporting: () =>
    set({ status: 'importing' }),

  setDone: () =>
    set({ status: 'done' }),

  setError: (message) =>
    set({ status: 'error', errorMessage: message }),

  reset: () =>
    set({ ...initialState }),

  updateClassification: (index, update) =>
    set(state => ({
      classifications: state.classifications.map((c, i) =>
        i === index ? { ...c, ...update } : c
      ),
    })),

  removeClassification: (index) =>
    set(state => ({
      classifications: state.classifications.filter((_, i) => i !== index),
    })),
}))
