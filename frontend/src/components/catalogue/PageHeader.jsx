function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading page-heading-row">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default PageHeader;
