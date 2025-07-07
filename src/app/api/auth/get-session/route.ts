import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const res = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
    method: "GET",
    headers: request.headers,
    credentials: "include",
  })

  let data
  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    data = await res.json()
  } else {
    data = await res.text()
  }

  return NextResponse.json(data, { status: res.status })
} 