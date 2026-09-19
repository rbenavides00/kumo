function Card({ children, className = "" }) {
  return (
    <div
      className={`flex min-h-full flex-col rounded-2xl bg-white shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <header className="border-b border-gray-200 p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </header>
  );
}

function CardBody({ children, className = "" }) {
  return <div className={`flex-1 p-6 ${className}`}>{children}</div>;
}

Card.Header = CardHeader;
Card.Body = CardBody;

export default Card;
