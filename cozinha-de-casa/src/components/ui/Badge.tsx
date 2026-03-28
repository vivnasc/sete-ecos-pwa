type BadgeColor = "red" | "orange" | "green" | "blue" | "gray";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  red: "bg-rose/10 text-rose border-rose/20",
  orange: "bg-amber-100 text-amber-800 border-amber-200",
  green: "bg-olive/10 text-olive border-olive/20",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function Badge({ children, color = "gray", className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
}
