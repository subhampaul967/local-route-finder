export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      color: '#f1f5f9',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <a 
        href="/" 
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#0f766e',
          color: '#e0f2fe',
          textDecoration: 'none',
          borderRadius: '0.375rem',
          border: '1px solid #0e7490'
        }}
      >
        Go Home
      </a>
    </div>
  );
}
