"use client"

import { useEffect, useRef } from "react"

interface WebcamFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export default function WebcamFeed({ videoRef, canvasRef }: WebcamFeedProps) {
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Error accessing webcam:", err)
      }
    }

    initWebcam()
  }, [videoRef])

  // Keep syncing video to canvas
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        }
      }
    }, 200)
    return () => clearInterval(interval)
  }, [videoRef, canvasRef])

  return (
    <div className="flex flex-col items-center space-y-2">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width={400}
        height={300}
        className="rounded-lg border border-border"
      />
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="hidden"
      />
    </div>
  )
}
