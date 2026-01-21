"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ImageIcon, Video, Download, Trash2, Settings, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaItem {
  id: string
  type: "photo" | "video"
  url: string
  timestamp: string
}

interface MediaSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MediaSidebar({ isOpen, onClose }: MediaSidebarProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "settings">("gallery")
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])

  const [settings, setSettings] = useState({
    resolution: "1080p",
    frameRate: "30fps",
    quality: "High",
    autoSave: true,
  })

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-96 bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Media & Settings</h2>
            <Button onClick={onClose} size="icon" variant="ghost" className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("gallery")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                activeTab === "gallery" ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Media Gallery
              </div>
              {activeTab === "gallery" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors relative",
                activeTab === "settings" ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </div>
              {activeTab === "settings" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === "gallery" && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {mediaItems.filter((item) => item.type === "photo").length} photos,{" "}
                    {mediaItems.filter((item) => item.type === "video").length} videos
                  </p>
                  <Button size="sm" variant="outline" className="rounded-lg bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative group aspect-square bg-muted rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <img
                        src={item.url || "/no-image.svg"}
                        alt={`${item.type} ${item.id}`}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute top-2 left-2">
                        <div className="bg-background/80 backdrop-blur-sm rounded-full p-1.5">
                          {item.type === "photo" ? (
                            <ImageIcon className="w-3 h-3 text-foreground" />
                          ) : (
                            <Video className="w-3 h-3 text-foreground" />
                          )}
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs font-mono text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                          {item.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Camera Quality</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Resolution</label>
                      <select
                        value={settings.resolution}
                        onChange={(e) => setSettings({ ...settings, resolution: e.target.value })}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="720p">720p HD</option>
                        <option value="1080p">1080p Full HD</option>
                        <option value="4k">4K Ultra HD</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Frame Rate</label>
                      <select
                        value={settings.frameRate}
                        onChange={(e) => setSettings({ ...settings, frameRate: e.target.value })}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="24fps">24 fps</option>
                        <option value="30fps">30 fps</option>
                        <option value="60fps">60 fps</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Quality</label>
                      <select
                        value={settings.quality}
                        onChange={(e) => setSettings({ ...settings, quality: e.target.value })}
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Preferences</h3>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Auto Save</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Automatically save captures</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, autoSave: !settings.autoSave })}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors",
                        settings.autoSave ? "bg-primary" : "bg-muted-foreground/30",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          settings.autoSave ? "left-5" : "left-0.5",
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <Button variant="outline" className="w-full justify-between rounded-lg bg-transparent">
                    Storage Usage
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between rounded-lg bg-transparent">
                    Advanced Settings
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
