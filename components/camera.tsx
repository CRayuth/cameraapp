"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera as LucideCamera, Video, Maximize2, X, Download, RefreshCw, Wifi, Flashlight } from "lucide-react"
import { cn } from "@/lib/utils"

type CameraMode = "photo" | "video"
type CameraState = "idle" | "ready" | "recording"

export function Camera() {
  const [cameraState, setCameraState] = useState<CameraState>("ready")
  const [mode, setMode] = useState<CameraMode>("photo")
  const [liveImageSrc, setLiveImageSrc] = useState<string | null>(null)
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [serverConfig, setServerConfig] = useState<{ ip: string; fullAddress: string; lanUrl?: string } | null>(null)
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [savedFiles, setSavedFiles] = useState<Array<{ filename: string; url: string; size: number }>>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Fetch server config for display
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setServerConfig(data))
      .catch(err => {/* Failed to load config */})
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cameraState === "recording") {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(timer)
  }, [cameraState])

  // Poll for new frames when in "ready" or "recording" state
  useEffect(() => {
    let isActive = true
    let timeoutId: NodeJS.Timeout

    const fetchFrame = async () => {
      if (!isActive) return

      try {
        // Add timestamp to prevent caching
        const response = await fetch(`/api/camera?t=${Date.now()}`)
        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          setLiveImageSrc((prev) => {
            if (prev) URL.revokeObjectURL(prev) // Cleanup old URL
            return url
          })
        }
      } catch (error) {
        // Silently ignore network errors to keep console clean
        // console.error("Error fetching frame:", error)
      } finally {
        if (isActive && (cameraState === "ready" || cameraState === "recording")) {
          // Schedule next fetch quickly (30ms) for smoother playback
          timeoutId = setTimeout(fetchFrame, 30)
        }
      }
    }

    if (cameraState === "ready" || cameraState === "recording") {
      fetchFrame()
    }

    return () => {
      isActive = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [cameraState])

  const stopCamera = () => {
    setCameraState("idle")
    setLiveImageSrc(null)
    setCapturedMedia(null)
  }

  const capturePhoto = () => {
    if (liveImageSrc) {
      setCapturedMedia(liveImageSrc)
    }
  }

  const startRecording = () => {
    // For now, simulate recording state without actual video recording
    // In a real app, we'd need to stitch the images or record the stream server-side
    setCameraState("recording")
  }

  const stopRecording = () => {
    setCameraState("ready")
    // Placeholder for video recording completion
    // setCapturedMedia(...) 
  }

  const handleCapture = () => {
    if (mode === "photo") {
      capturePhoto()
    } else {
      if (cameraState === "recording") {
        stopRecording()
      } else {
        startRecording()
      }
    }
  }

  const downloadMedia = () => {
    if (capturedMedia) {
      const link = document.createElement("a")
      link.href = capturedMedia
      link.download = `capture-${Date.now()}.jpg`
      link.click()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleFlashlight = async () => {
    try {
      // Get encryption key from keyStore (in real app, retrieve from secure storage)
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle_flashlight',
          commandId: `cmd_${Date.now()}`,
        }),
      })

      if (response.ok) {
        setFlashlightOn(!flashlightOn)
      }
    } catch (error) {
    }
  }

  const saveCurrentFrame = async () => {
    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save_frame',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh saved files list
        fetchSavedFiles()
      }
    } catch (error) {
    }
  }

  const fetchSavedFiles = async () => {
    try {
      const response = await fetch('/api/media')
      if (response.ok) {
        const data = await response.json()
        setSavedFiles(data.recordings.slice(0, 3)) // Show latest 3
      }
    } catch (error) {
    }
  }

  return (
    <div className="w-full">
      <div className="relative aspect-video bg-card rounded-2xl overflow-hidden border-2 border-foreground/15 shadow-lg bg-black/90">
        {cameraState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Wifi className="w-12 h-12 text-primary" />
            </div>
            <p className="text-center text-foreground/70 text-lg font-medium max-w-md">
              Connect to secure camera feed
            </p>
            <Button onClick={() => setCameraState("ready")} size="lg" className="mt-4 px-8 rounded-xl">
              Connect Stream
            </Button>
          </div>
        )}

        {cameraState !== "idle" && !capturedMedia && (
          <>
            {liveImageSrc ? (
              <img src={liveImageSrc} alt="Live Feed" className="w-full h-full object-contain" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-white/50 p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="w-10 h-10 animate-spin mb-2" />
                  <span className="text-lg font-medium">Waiting for signal...</span>
                </div>
              </div>
            )}

            {cameraState === "recording" && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-mono text-sm font-medium">{formatTime(recordingTime)}</span>
              </div>
            )}

            <div className="absolute top-4 right-4">
              <Button
                onClick={stopCamera}
                size="icon"
                variant="secondary"
                className="rounded-full w-12 h-12 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="absolute top-4 right-20 bg-background/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${liveImageSrc ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                <span className="text-xs font-medium text-white">AES-256 LIVE</span>
              </div>
            </div>

            {/* GPS functionality removed */}
          </>
        )}

        {capturedMedia && (
          <div className="absolute inset-0">
            <img src={capturedMedia} alt="Captured" className="w-full h-full object-contain" />

            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                onClick={downloadMedia}
                size="icon"
                variant="secondary"
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => setCapturedMedia(null)}
                size="icon"
                variant="secondary"
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {cameraState !== "idle" && !capturedMedia && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
            <Button
              onClick={handleCapture}
              size="icon"
              className={cn(
                "w-16 h-16 rounded-full relative transition-all shadow-xl hover:scale-105 active:scale-95",
                cameraState === "recording"
                  ? "bg-destructive hover:bg-destructive/90 ring-4 ring-destructive/30"
                  : "bg-white hover:bg-white/90 ring-4 ring-white/30",
              )}
            >
              {mode === "photo" ? (
                <div className="w-14 h-14 rounded-full border-2 border-black/10 flex items-center justify-center">
                  <div className="w-12 h-12 bg-transparent rounded-full border-2 border-black" />
                </div>
              ) : cameraState === "recording" ? (
                <div className="w-6 h-6 bg-white rounded-sm" />
              ) : (
                <div className="w-6 h-6 bg-red-500 rounded-full" />
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-8 mt-6">
        <Button
          onClick={() => setMode("photo")}
          variant="ghost"
          className={cn(
            "flex flex-col items-center gap-2 h-auto py-2 px-4 rounded-xl transition-all",
            mode === "photo" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          )}
          disabled={cameraState === "recording"}
        >
          <LucideCamera className="w-6 h-6" />
          <span className="text-xs font-medium">Photo</span>
        </Button>
        <Button
          onClick={toggleFlashlight}
          variant="ghost"
          className={cn(
            "flex flex-col items-center gap-2 h-auto py-2 px-4 rounded-xl transition-all",
            flashlightOn ? "bg-yellow-500/20 text-yellow-500" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Flashlight className="w-6 h-6" />
          <span className="text-xs font-medium">{flashlightOn ? "Flash ON" : "Flash OFF"}</span>
        </Button>
        <Button
          onClick={() => setMode("video")}
          variant="ghost"
          className={cn(
            "flex flex-col items-center gap-2 h-auto py-2 px-4 rounded-xl transition-all",
            mode === "video" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          )}
          disabled={cameraState === "recording"}
        >
          <Video className="w-6 h-6" />
          <span className="text-xs font-medium">Video</span>
        </Button>
        <Button
          onClick={saveCurrentFrame}
          variant="ghost"
          className="flex flex-col items-center gap-2 h-auto py-2 px-4 rounded-xl transition-all text-muted-foreground hover:text-foreground"
        >
          <Download className="w-6 h-6" />
          <span className="text-xs font-medium">Save Frame</span>
        </Button>
      </div>
    </div>
  )
}
