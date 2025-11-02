import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/enroll`

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Enroll proxy error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
