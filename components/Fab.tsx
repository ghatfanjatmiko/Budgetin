"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function Fab({ href = "/tracker/add" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-ledger text-white flex items-center justify-center shadow-lg"
    >
      <Plus size={26} />
    </Link>
  );
}
