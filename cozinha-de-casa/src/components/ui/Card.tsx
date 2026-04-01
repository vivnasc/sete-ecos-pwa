interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-card border border-cream-dark p-4 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md active:scale-[0.98] transition-all" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
