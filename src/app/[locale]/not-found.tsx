import { NotFoundContent } from "@/components/not-found-content";

/**
 * 404 untuk `notFound()` di dalam rute ber-locale (mis. slug proyek yang
 * tidak terbit): tetap memakai header & footer dari layout locale.
 */
export default function LocaleNotFound() {
  return <NotFoundContent />;
}
