interface EmptyStateProps {
  emoji: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <span className="text-5xl mb-4">{emoji}</span>
      <h3 className="text-lg font-display text-charcoal mb-1">{title}</h3>
      {description && <p className="text-sm text-stone mb-4">{description}</p>}
      {action}
    </div>
  );
}
