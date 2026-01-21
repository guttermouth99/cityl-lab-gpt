interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/intro-preview-scaled.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-h-screen w-full overflow-auto">
        {children}
      </div>
    </div>
  );
}
