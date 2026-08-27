import AppNav from "@/components/AppNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8f6f1] text-ink">
      <AppNav />
      <main className="mx-auto min-h-screen w-full max-w-[480px] px-4 pb-28 pt-6 md:ml-[272px] md:max-w-4xl md:px-10 md:pb-12 md:pt-10">
        {children}
      </main>
    </div>
  );
}
