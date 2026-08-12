import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/branding";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={brand.logos.primarySvg}
            alt={`${brand.companyName} logo`}
            width={140}
            height={32}
            priority
          />
          <span className="hidden text-sm font-medium text-onyx sm:inline">
            /{brand.productName}
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-onyx">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 hover:bg-muted transition-colors"
          >
            New pursuit
          </Link>
          <a
            href="https://github.com/Aberdeen-Advisors/hack-team-05"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-md px-3 py-1.5 hover:bg-muted transition-colors"
          >
            Repo
          </a>
        </nav>
      </div>
    </header>
  );
}
