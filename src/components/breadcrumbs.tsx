import Link from "next/link";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = { label: string; href?: string };

/**
 * Remah navigasi untuk halaman dalam (Beranda → bagian → halaman). Situs
 * ini hanya punya dua-tiga tingkat, jadi remah dibuat ringkas: tanpa menu
 * lipat — item terakhir memakai `aria-current` dan barisnya membungkus
 * halus di layar sempit. Tautannya nyata (tanpa JS) dan area sentuhnya
 * 44px di perangkat sentuh.
 */
export function Breadcrumbs({
  items,
  label,
  className,
}: {
  items: BreadcrumbItem[];
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${index}-${item.label}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              {index > 0 ? (
                <span aria-hidden="true" className="text-ink-3/60">
                  /
                </span>
              ) : null}
              {isLast || !item.href ? (
                <span aria-current="page" className="font-medium text-ink">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="focus-ring inline-flex min-h-11 items-center text-ink-2 transition-colors hover:text-ink lg:min-h-0"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
