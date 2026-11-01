import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Bypass total sementara: Semua pengunjung diizinkan mengakses /dashboard dan halaman lainnya tanpa proteksi atau redirect
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard", "/login"],
};
