import Nav from "@/components/Nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />
      <div className="max-w-4xl mx-auto px-5 pb-20">{children}</div>
    </div>
  );
}
