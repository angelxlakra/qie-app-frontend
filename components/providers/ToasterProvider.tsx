'use client'

import { Toaster } from 'sonner'

export function ToasterProvider() {
  return (
    <Toaster 
      position="bottom-right" 
      richColors 
      closeButton
      theme="system"
      toastOptions={{
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
      }}
    />
  )
}
