function Notice({ error, message }) {
  return (
    <>
      {error && <div className="notice notice-error">{error}</div>}
      {message && <div className="notice notice-success">{message}</div>}
    </>
  );
}

export default Notice;
