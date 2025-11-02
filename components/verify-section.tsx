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

export default function VerifySection({
  videoRef,
  canvasRef,
  setStatusMessage,
  setStatusType,
}: Props) {
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setStatusMessage("Camera not ready.")
      setStatusType("error")
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

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
    formData.append("image", blob, `${userId}.jpg`)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (res.ok) {
        setStatusMessage(`✅ ${data.message}`)
        setStatusType("success")
      } else {
        setStatusMessage(`❌ ${data.message || data.error}`)
        setStatusType("error")
      }
    } catch (err: any) {
      setStatusMessage(`❌ ${err.message}`)
      setStatusType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Verify User</h2>

      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="User ID"
        className="border rounded px-3 py-2 mb-4 w-full"
      />

      <Button
        onClick={handleVerify}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
      >
        {loading ? "Verifying..." : "Verify User"}
      </Button>
    </Card>
  )
}
