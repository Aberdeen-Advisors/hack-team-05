import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/branding";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={brand.logos.primarySvg}
            alt={`${brand.companyName} logo`}
            width={126}
            height={28}
            priority
          />
          {/* Product identity lockup — pursuit icon + product name */}
          <span className="hidden items-center gap-2 border-l border-border pl-3 sm:flex">
            <Image
              src={brand.logos.productIconPng}
              alt=""
              width={28}
              height={28}
              priority
            />
            <span className="text-sm font-semibold tracking-tight text-aberdeen-blue">
              {brand.productName}
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-onyx/80 sm:flex">
          <Link
            href="/#engines"
            className="hover:text-aberdeen-blue transition-colors"
          >
            Engines
          </Link>
          <Link
            href="/#how"
            className="hover:text-aberdeen-blue transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/roadmap"
            className="hover:text-aberdeen-blue transition-colors"
          >
            Roadmap
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-aberdeen-blue px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-verdigris"
          >
            New pursuit →
          </Link>
        </nav>
      </div>
    </header>
  );
}
