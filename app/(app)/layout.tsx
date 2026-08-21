import AppNav from "@/components/AppNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <AppNav />
      <div className="md:ml-60 px-5 py-6 pb-24 md:pb-10 max-w-2xl md:max-w-3xl mx-auto md:mx-0 md:px-10">
        {children}
      </div>
    </div>
  );
}
