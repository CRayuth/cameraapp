"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [accessKey, setAccessKey] = useState("")
  const [showInput, setShowInput] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const handleSetAccessKey = () => {
    if (showInput && accessKey.trim()) {
      // Simulate authentication
      onLogin()
    } else {
      setShowInput(true)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-xl flex flex-col items-center gap-8">
        {/* Loading text */}
        <h1 className="text-4xl font-bold tracking-[0.5em] text-foreground">LOADING</h1>

        {/* Progress bar */}
        <div className="w-full max-w-md h-12 border-2 border-border rounded-full overflow-hidden bg-background relative">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* Decorative stripes */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1.5">
            <div className={`w-1 h-6 rounded-full ${progress > 90 ? "bg-green-600" : "bg-muted"}`} />
            <div className={`w-1 h-6 rounded-full ${progress > 95 ? "bg-green-600" : "bg-muted"}`} />
            <div className={`w-1 h-6 rounded-full ${progress > 99 ? "bg-green-600" : "bg-muted"}`} />
          </div>
        </div>

        {/* Character avatar */}
        <div className="relative w-48 h-48 mt-8">
          <img src="/images/image.png" alt="Character avatar" className="w-full h-full object-contain" />
        </div>

        {/* Input field (conditional) */}
        {showInput && (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
            <Input
              type="password"
              placeholder="Enter access key..."
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSetAccessKey()
                }
              }}
              className="h-14 text-center text-lg border-2 rounded-xl"
              autoFocus
            />
          </div>
        )}

        {/* Set Access Key button */}
        <Button
          onClick={handleSetAccessKey}
          disabled={isLoading || (showInput && !accessKey.trim())}
          size="lg"
          className="w-full max-w-md h-14 text-lg rounded-xl font-medium"
        >
          {showInput ? "Confirm Access Key" : "Set Access Key"}
        </Button>

        {/* Loading status text */}
        {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Initializing system... {progress}%</p>}
      </div>
    </div>
  )
}
