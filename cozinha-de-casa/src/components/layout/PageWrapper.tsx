interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <main className={`max-w-app mx-auto min-h-screen bg-cream pb-20 ${className}`}>
      {children}
    </main>
  );
}
