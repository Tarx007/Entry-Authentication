"use client"

import { useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import EnrollSection from "@/components/enroll-section"
import VerifySection from "@/components/verify-section"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isCameraOn, setIsCameraOn] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info")

  // ----------------------------
  // CAMERA CONTROL FUNCTIONS
  // ----------------------------
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCameraOn(true)
      setStatusMessage("✅ Camera started successfully.")
      setStatusType("success")
    } catch (err) {
      console.error("Camera error:", err)
      setStatusMessage("❌ Failed to access camera.")
      setStatusType("error")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraOn(false)
    setStatusMessage("🛑 Camera stopped.")
    setStatusType("info")
  }

  // ----------------------------
  // COMPONENT RENDER
  // ----------------------------
  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground p-6 gap-8">
      <h1 className="text-3xl font-bold text-center mt-6">
         Face Authentication System
      </h1>

      {/* CAMERA FEED */}
      <Card className="p-4 flex flex-col items-center bg-card border border-border w-full max-w-[800px]">
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-md">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex gap-3 mt-4">
          {!isCameraOn ? (
            <Button
              onClick={startCamera}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Start Camera
            </Button>
          ) : (
            <Button
              onClick={stopCamera}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Stop Camera
            </Button>
          )}
        </div>
      </Card>

      {/* STATUS MESSAGE */}
      {statusMessage && (
        <p
          className={`text-sm ${
            statusType === "error"
              ? "text-red-500"
              : statusType === "success"
              ? "text-green-500"
              : "text-yellow-400"
          }`}
        >
          {statusMessage}
        </p>
      )}

      {/* CANVAS (HIDDEN) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ENROLL + VERIFY SECTIONS */}
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-[1000px]">
        <EnrollSection
          videoRef={videoRef}
          canvasRef={canvasRef}
          setStatusMessage={setStatusMessage}
          setStatusType={setStatusType}
        />

        <VerifySection
          videoRef={videoRef}
          canvasRef={canvasRef}
          setStatusMessage={setStatusMessage}
          setStatusType={setStatusType}
        />
      </div>
    </main>
  )
}
