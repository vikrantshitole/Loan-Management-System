const Loader = ({ label = 'Loading…', fullPage = false }) => {
  const content = (
    <div className="loader">
      <span className="loader-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );

  if (fullPage) {
    return <div className="loader-page">{content}</div>;
  }

  return content;
};

export default Loader;
