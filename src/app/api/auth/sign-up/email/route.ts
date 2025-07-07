import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.arrayBuffer()
  const headers = new Headers(request.headers)
  headers.delete("content-length")

  const res = await fetch(`${request.nextUrl.origin}/api/auth/signup/email`, {
    method: "POST",
    headers,
    body,
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