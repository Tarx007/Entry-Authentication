"use client"

import { useState, RefObject } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Props {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
  setStatusMessage: (msg: string) => void
  setStatusType: (type: "success" | "error" | "info") => void
}

export default function EnrollSection({
  videoRef,
  canvasRef,
  setStatusMessage,
  setStatusType,
}: Props) {
  const [userId, setUserId] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleEnroll = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setStatusMessage("Camera not ready.")
      setStatusType("error")
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    // Capture frame
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    )
    if (!blob) {
      setStatusMessage("Failed to capture image.")
      setStatusType("error")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("user_id", userId)
    formData.append("full_name", fullName)
    formData.append("image", blob, `${userId}.jpg`)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/enroll`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Enroll failed")

      setStatusMessage(`✅ ${data.message}`)
      setStatusType("success")
      setUserId("")
      setFullName("")
    } catch (err: any) {
      setStatusMessage(`❌ ${err.message}`)
      setStatusType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Enroll New User</h2>

      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="User ID"
        className="border rounded px-3 py-2 mb-2 w-full"
      />
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full Name"
        className="border rounded px-3 py-2 mb-4 w-full"
      />

      <Button
        onClick={handleEnroll}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
      >
        {loading ? "Enrolling..." : "Enroll User"}
      </Button>
    </Card>
  )
}
