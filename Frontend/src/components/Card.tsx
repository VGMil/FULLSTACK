interface CardProps {
  header?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ header, content, footer, className }) => {
  return (
    <div className={`w-full max-w-md p-8 bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {header && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          {header}
        </div>
      )}
      <div className="px-6 py-4">
        {content}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
