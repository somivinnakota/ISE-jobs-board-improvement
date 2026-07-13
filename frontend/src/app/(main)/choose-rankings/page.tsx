// pages/index.js

import Link from 'next/link'

export default function Home() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '2rem',
      }}
    >
      <Link href="/pre-interview-rankings" passHref>
        <button
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Pre-Interview Rankings
        </button>
      </Link>

      <Link href="/student/post-interview-rankings" passHref>
        <button
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Post-Interview Rankings
        </button>
      </Link>
    </div>
  )
}
