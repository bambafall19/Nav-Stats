'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = []
  const maxVisible = 5

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 20,
      flexWrap: 'wrap',
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid var(--color-border)',
          background: currentPage === 1 ? 'var(--color-surface)' : 'var(--color-surface-card)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1,
          fontSize: '0.85rem',
        }}
      >
        ← Précédent
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-card)',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            1
          </button>
          {start > 2 && <span style={{ color: 'var(--color-text-muted)' }}>...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: currentPage === page ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            background: currentPage === page ? 'var(--color-primary)' : 'var(--color-surface-card)',
            color: currentPage === page ? 'white' : 'var(--color-text)',
            cursor: 'pointer',
            fontWeight: currentPage === page ? 700 : 500,
            fontSize: '0.85rem',
          }}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: 'var(--color-text-muted)' }}>...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-card)',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid var(--color-border)',
          background: currentPage === totalPages ? 'var(--color-surface)' : 'var(--color-surface-card)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.5 : 1,
          fontSize: '0.85rem',
        }}
      >
        Suivant →
      </button>
    </div>
  )
}
