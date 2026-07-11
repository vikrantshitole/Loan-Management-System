const Card = ({ title, subtitle, children, className = '', actions }) => {
  return (
    <section className={`card ${className}`.trim()}>
      {title ? <h2 className="card-title">{title}</h2> : null}
      {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
      {children}
      {actions ? <div className="card-actions">{actions}</div> : null}
    </section>
  );
};

export default Card;
