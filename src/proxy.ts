import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-constants";

/**
 * Penjaga optimistis (Proxy Next 16, runtime Node): hanya membaca
 * ada/tidaknya cookie sesi untuk redirect cepat pengunjung anonim.
 * Verifikasi sesungguhnya (hash token → database) tetap di layout panel
 * (DAL) — Proxy berjalan juga untuk prefetch, jadi tidak boleh menyentuh
 * database di sini.
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Halaman masuk selalu boleh diakses (termasuk saat cookie sudah ada).
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (hasSession) {
    return NextResponse.next();
  }

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
