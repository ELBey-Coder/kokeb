import Image from "next/image";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function DashboardHeader() {
  return (
    <header className="bg-[#0B132B] sticky top-0 z-40">
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-emerald-600" />
        <div className="h-full w-1/3 bg-[#FFD300]" />
        <div className="h-full w-1/3 bg-rose-600" />
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/kokeb-logo-light.png"
            alt="Kokeb"
            width={120}
            height={53}
            className="w-[120px] h-[53px]"
            priority
          />
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link
            href="/dashboard/properties"
            className="hover:text-white transition-colors"
          >
            My Properties
          </Link>
        </nav>
        <LogoutButton />
      </div>
    </header>
  );
}
