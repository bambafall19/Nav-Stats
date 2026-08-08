'use client'

import { useEffect, useState } from 'react'
import { FileDown, X } from 'lucide-react'
import { useToast } from '@/components/shared/Toast'
import { useT } from '@/lib/i18n/LanguageProvider'

interface ClassementPdfExportProps {
  title: string
  subtitle?: string
  columns: string[]
  rows: (string | number)[][]
}

/**
 * Exports the given table as a PDF via the browser's print dialog
 * ("Enregistrer au format PDF"). No external dependency required.
 */
export function ClassementPdfExport({ title, subtitle, columns, rows }: ClassementPdfExportProps) {
  const [exporting, setExporting] = useState(false)
  const { addToast } = useToast()
  const t = useT()

  useEffect(() => {
    if (!exporting) return
    const timer = setTimeout(() => window.print(), 150)
    const done = () => setExporting(false)
    window.addEventListener('afterprint', done)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('afterprint', done)
    }
  }, [exporting])

  const handleExport = () => {
    if (rows.length === 0) return
    setExporting(true)
    addToast(t('classements.exportPdfReady'), 'info', 6000)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleExport}
        disabled={rows.length === 0}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '8px 14px',
          borderRadius: 10,
          border: '1px solid rgba(255,201,77,0.3)',
          background: 'rgba(255,201,77,0.1)',
          color: 'var(--color-accent)',
          fontSize: '0.72rem',
          fontWeight: 700,
          cursor: rows.length === 0 ? 'not-allowed' : 'pointer',
          opacity: rows.length === 0 ? 0.5 : 1,
          fontFamily: 'var(--font-plus-jakarta)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,201,77,0.18)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,201,77,0.1)' }}
      >
        <FileDown size={13} />
        {t('classements.exportPdf')}
      </button>

      {exporting && (
        <div className="pdf-print-root" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <button
            type="button"
            onClick={() => setExporting(false)}
            aria-label={t('common.close')}
            className="pdf-close"
            style={{
              position: 'fixed',
              top: 12,
              right: 12,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: '#111',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
            }}
          >
            <X size={18} />
          </button>

          <div className="pdf-print-area" style={{ background: '#fff', color: '#000', padding: 32 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '3px solid #0dca6b',
              paddingBottom: 12,
              marginBottom: 8,
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0dca6b', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                NavéStats
              </div>
              <div style={{ fontSize: 13, color: '#555' }}>{new Date().toLocaleDateString('fr-FR')}</div>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: '16px 0 4px', color: '#000' }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 13, color: '#444', margin: '0 0 16px' }}>{subtitle}</p>}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col} style={{
                      border: '1px solid #ccc',
                      background: '#0dca6b',
                      color: '#fff',
                      padding: '8px 10px',
                      textAlign: 'left',
                      fontWeight: 700,
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f7faf8' : '#ffffff' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{
                        border: '1px solid #ddd',
                        padding: '7px 10px',
                        color: '#111',
                        fontWeight: j === 0 ? 700 : 400,
                      }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 11, color: '#888', marginTop: 16, textAlign: 'center' }}>
              © 2026 NavéStats · Navétanes de Khombole
            </p>
          </div>

          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .pdf-print-root { position: absolute !important; left: 0; top: 0; width: 100%; }
              .pdf-close { display: none !important; }
              .pdf-print-root, .pdf-print-root * { visibility: visible !important; }
              .pdf-print-area { position: absolute !important; left: 0; top: 0; width: 100%; padding: 0 !important; }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
