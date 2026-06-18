import type { ThemeDef } from '@/store/types'

export const themes: Record<string, ThemeDef> = {
  'classic-bw': {
    id: 'classic-bw',
    name: '经典黑白',
    vars: {
      '--canvas-bg': '#ffffff',
      '--canvas-text': '#1a1a1a',
      '--editor-bg': '#f8f9fa',
      '--editor-text': '#1a1a1a',
      '--panel-bg': '#ffffff',
      '--border-color': '#e5e7eb',
      '--accent': '#000000',
      '--accent-hover': '#333333',
      '--skill-bar-fill': '#000000',
      '--skill-bar-bg': '#e5e5e5',
      '--surface-hover': '#f3f4f6',
      '--shadow-sm': '0 1px 2px rgba(0,0,0,0.05)',
      '--shadow-md': '0 4px 6px rgba(0,0,0,0.07)',
      '--shadow-lg': '0 10px 15px rgba(0,0,0,0.1)',
    },
  },
  'modern-blue': {
    id: 'modern-blue',
    name: '现代蓝色',
    vars: {
      '--canvas-bg': '#ffffff',
      '--canvas-text': '#1e293b',
      '--editor-bg': '#f0f4ff',
      '--editor-text': '#1e293b',
      '--panel-bg': '#ffffff',
      '--border-color': '#cbd5e1',
      '--accent': '#2563eb',
      '--accent-hover': '#1d4ed8',
      '--skill-bar-fill': '#2563eb',
      '--skill-bar-bg': '#dbeafe',
      '--surface-hover': '#eff6ff',
      '--shadow-sm': '0 1px 2px rgba(37,99,235,0.05)',
      '--shadow-md': '0 4px 6px rgba(37,99,235,0.07)',
      '--shadow-lg': '0 10px 15px rgba(37,99,235,0.1)',
    },
  },
  'minimal-gray': {
    id: 'minimal-gray',
    name: '简约灰白',
    vars: {
      '--canvas-bg': '#fafafa',
      '--canvas-text': '#404040',
      '--editor-bg': '#f5f5f5',
      '--editor-text': '#404040',
      '--panel-bg': '#ffffff',
      '--border-color': '#e5e5e5',
      '--accent': '#525252',
      '--accent-hover': '#404040',
      '--skill-bar-fill': '#737373',
      '--skill-bar-bg': '#f5f5f5',
      '--surface-hover': '#fafafa',
      '--shadow-sm': '0 1px 2px rgba(0,0,0,0.04)',
      '--shadow-md': '0 4px 6px rgba(0,0,0,0.05)',
      '--shadow-lg': '0 10px 15px rgba(0,0,0,0.08)',
    },
  },
}

export function getTheme(id: string): ThemeDef {
  return themes[id] ?? themes['modern-blue']
}
