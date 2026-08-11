'use client'

import { useState } from 'react'

export interface CsvImportResult {
  inserted: number
  errors: string[]
}

interface CsvImporterProps {
  title: string
  description?: string
  expectedHeaders: string[]
  templateHeaders: string[]
  sampleRows: (string | number)[][]
  onImport: (rows: Record<string, string>[]) => Promise<CsvImportResult>
  onSuccess?: () => void
}

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      if (row.some(f => f.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  row.push(field)
  if (row.some(f => f.trim() !== '')) rows.push(row)
  return rows
}

function toCSV(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers, ...rows].map(r => r.map(escape).join(',')).join('\n')
}

export default function CsvImporter({ title, description, expectedHeaders, templateHeaders, sampleRows, onImport, onSuccess }: CsvImporterProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState<Record<string, string>[] | null>(null)
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleParse = () => {
    setResult(null)
    const raw = parseCSV(text)
    if (raw.length < 2) {
      setParseErrors(['Le fichier doit contenir au moins une ligne d’en-tête et une ligne de données.'])
      setParsed(null)
      return
    }
    const headers = raw[0].map(normalizeHeader)
    const errors: string[] = []
    for (const expected of expectedHeaders) {
      if (!headers.includes(expected)) {
        errors.push(`Colonne « ${expected} » manquante.`)
      }
    }
    if (errors.length > 0) {
      setParseErrors(errors)
      setParsed(null)
      return
    }
    const rows = raw.slice(1).map((cells) => {
      const obj: Record<string, string> = {}
      headers.forEach((h, j) => {
        obj[h] = (cells[j] ?? '').trim()
      })
      return obj
    })
    setParseErrors([])
    setParsed(rows)
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      setText(String(e.target?.result || ''))
      setParsed(null)
      setResult(null)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!parsed) return
    setBusy(true)
    setResult(null)
    const res = await onImport(parsed)
    setResult({
      type: res.errors.length === 0 ? 'success' : 'error',
      text: `${res.inserted} ligne(s) importée(s).${res.errors.length > 0 ? ` ${res.errors.length} erreur(s) : ${res.errors.slice(0, 5).join(' ; ')}` : ''}`,
    })
    setBusy(false)
    if (onSuccess && res.errors.length === 0) onSuccess()
  }

  return (
    <div style={{ background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-plus-jakarta)', textAlign: 'left',
        }}
      >
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>📥 {title}</div>
          {description && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{description}</div>}
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: '4px 20px 20px', display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(toCSV(templateHeaders, sampleRows))}`}
              download="modele.csv"
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(42,255,160,0.08)', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}
            >
              ⬇️ Télécharger le modèle
            </a>
            <label style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              📂 Choisir un fichier CSV
              <input type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </label>
          </div>

          <textarea
            placeholder="…ou collez ici le contenu du CSV. Colonnes attendues :"
            value={text}
            onChange={e => { setText(e.target.value); setParsed(null); setResult(null) }}
            rows={6}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.8rem', fontFamily: 'monospace', background: 'var(--color-surface-card)', color: 'var(--color-text-primary)', resize: 'vertical', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleParse}
              disabled={!text.trim()}
              style={{ padding: '9px 18px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: '0.8rem', fontWeight: 700, cursor: text.trim() ? 'pointer' : 'not-allowed', opacity: text.trim() ? 1 : 0.5 }}
            >
              🔍 Analyser
            </button>
            <button
              onClick={handleImport}
              disabled={!parsed || busy}
              style={{ padding: '9px 18px', borderRadius: 'var(--radius-full)', background: 'var(--gradient-green)', border: 'none', color: 'white', fontSize: '0.8rem', fontWeight: 700, cursor: parsed && !busy ? 'pointer' : 'not-allowed', opacity: parsed && !busy ? 1 : 0.5 }}
            >
              {busy ? 'Importation…' : '🚀 Importer'}
            </button>
          </div>

          {parseErrors.length > 0 && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(232,0,45,0.08)', color: '#E8002D', fontSize: '0.8rem' }}>
              {parseErrors.join(' ')}
            </div>
          )}
          {parsed && (
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              ✅ {parsed.length} ligne(s) prête(s) à l’import.
            </div>
          )}
          {result && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem',
              background: result.type === 'success' ? 'rgba(0,166,81,0.1)' : 'rgba(232,0,45,0.08)',
              color: result.type === 'success' ? 'var(--color-primary)' : '#E8002D',
            }}>
              {result.type === 'success' ? '✅' : '⚠️'} {result.text}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
