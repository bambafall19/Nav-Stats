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
      marginTop: 0,
      flexWrap: 'wrap',
      maxWidth: '100%',
      minWidth: 0,
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '9px 14px',
          borderRadius: 999,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: currentPage === 1 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.05)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.5 : 1,
          fontSize: '0.82rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-plus-jakarta)',
          transition: 'all 0.15s',
        }}
      >
        ← Précédent
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            style={{
              padding: '9px 13px',
              borderRadius: 999,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-plus-jakarta)',
              transition: 'all 0.15s',
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
            padding: '9px 13px',
            borderRadius: 999,
            border: currentPage === page ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.08)',
            background: currentPage === page ? 'var(--gradient-green)' : 'rgba(255, 255, 255, 0.05)',
            color: currentPage === page ? '#04120A' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontWeight: currentPage === page ? 800 : 500,
            fontSize: '0.82rem',
            fontFamily: 'var(--font-plus-jakarta)',
            boxShadow: currentPage === page ? '0 4px 16px rgba(42,255,160,0.25)' : 'none',
            transition: 'all 0.15s',
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
              padding: '9px 13px',
              borderRadius: 999,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-plus-jakarta)',
              transition: 'all 0.15s',
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
          padding: '9px 14px',
          borderRadius: 999,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: currentPage === totalPages ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.05)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.5 : 1,
          fontSize: '0.82rem',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-plus-jakarta)',
          transition: 'all 0.15s',
        }}
      >
        Suivant →
      </button>
    </div>
  )
}
