'use client'
import { useState } from 'react'
import { useTheme } from '@/lib/themes/ThemeProvider'
import { themes } from '@/lib/themes/themes'

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const { currentTheme, setTheme } = useTheme()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '16px',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          background: currentTheme.colors.primary,
          color: '#fff',
          cursor: 'pointer',
          border: 'none',
          fontSize: '24px'
        }}
      >
        {currentTheme.icon}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '1024px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>🎨 选择主题</h3>
              <button onClick={() => setOpen(false)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false) }}
                  style={{
                    background: t.colors.background,
                    border: currentTheme.id === t.id ? `2px solid ${t.colors.primary}` : '2px solid transparent',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ height: '80px', borderRadius: '8px', marginBottom: '12px', background: t.gradient }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '24px' }}>{t.icon}</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{t.name}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#666' }}>{t.description}</p>
                  {currentTheme.id === t.id && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', width: '24px', height: '24px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <p style={{ marginTop: '24px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
              💡 提示：主题会自动保存
            </p>
          </div>
        </div>
      )}
    </>
  )
}
