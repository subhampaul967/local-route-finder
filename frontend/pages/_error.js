export default function Error({ statusCode }) {
  return (
    <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Something went wrong</h1>
      {statusCode && <p>Status code: {statusCode}</p>}
    </div>
  );
}
