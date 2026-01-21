"use client"

import { Camera } from "@/components/camera"
import { MediaSidebar } from "@/components/media-sidebar"
import { AnimatedLogin } from "@/components/animated-login"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { User, Key, Shield, Hash, Clock, Monitor, Wifi } from "lucide-react"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username] = useState("Seynyyuttey")
  const [clientInfo, setClientInfo] = useState({
    clientId: "Loading...",
    encryption: "AES-256",
    hashAlgorithm: "SHA-512",
    sessionStart: "--:--:--",
    deviceType: "Desktop",
    connectionStatus: "Connecting...",
  })

  // Fetch real session details from backend
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.session) {
          setClientInfo(data.session)
        }
      })
      .catch(err => {/* Failed to load session info */})
  }, [])

  if (!isAuthenticated) {
    return <AnimatedLogin onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{username}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="default"
            className="rounded-lg px-6 font-medium bg-transparent"
            onClick={() => setIsAuthenticated(false)}
          >
            LOG OUT
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex gap-12 w-full max-w-7xl">
          <div className="flex-1">
            <Camera />
          </div>

          <aside className="w-72 flex flex-col gap-6">
            <div className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Session Details</h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <Key className="w-3.5 h-3.5" />
                    <span>Client ID</span>
                  </div>
                  <p className="text-sm font-mono text-foreground pl-5">{clientInfo.clientId}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Encryption</span>
                  </div>
                  <p className="text-sm font-mono text-foreground pl-5">{clientInfo.encryption}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <Hash className="w-3.5 h-3.5" />
                    <span>Hash Algorithm</span>
                  </div>
                  <p className="text-sm font-mono text-foreground pl-5">{clientInfo.hashAlgorithm}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Connection</h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>Status</span>
                  </div>
                  <div className="flex items-center gap-2 pl-5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-sm font-medium text-foreground">{clientInfo.connectionStatus}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Session Start</span>
                  </div>
                  <p className="text-sm font-mono text-foreground pl-5">{clientInfo.sessionStart}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Device Type</span>
                  </div>
                  <p className="text-sm text-foreground pl-5">{clientInfo.deviceType}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>


    </main>
  )
}
