const Modal = ({ title, description, children, onClose, actions }) => {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          {title ? <h2>{title}</h2> : null}
          {description ? <p className="muted-text">{description}</p> : null}
        </header>
        {children}
        {actions ? <div className="modal-actions">{actions}</div> : null}
      </section>
    </div>
  );
};

export default Modal;
