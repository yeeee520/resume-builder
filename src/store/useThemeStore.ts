import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { themes } from '@/themes'

interface ThemeSlice {
  currentThemeId: string
  setTheme: (id: string) => void
  getTheme: () => (typeof themes)[string]
}

export const useThemeStore = create<ThemeSlice>()(
  persist(
    (set, get) => ({
      currentThemeId: 'modern-blue',

      setTheme: (id: string) => {
        const theme = themes[id]
        if (!theme) return
        // 注入 CSS 变量到 :root
        Object.entries(theme.vars).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, value)
        })
        set({ currentThemeId: id })
      },

      getTheme: () => {
        return themes[get().currentThemeId] ?? themes['modern-blue']
      },
    }),
    {
      name: 'resume-builder:theme-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentThemeId: state.currentThemeId }),
      onRehydrateStorage: () => (state) => {
        // 恢复主题 CSS 变量
        if (state) {
          const theme = themes[state.currentThemeId]
          if (theme) {
            Object.entries(theme.vars).forEach(([key, value]) => {
              document.documentElement.style.setProperty(key, value)
            })
          }
        }
      },
    }
  )
)
