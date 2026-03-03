import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET(request: Request) {
  const url = new URL("/icon.svg?v=20260303", request.url);
  return NextResponse.redirect(url, 308);
}
