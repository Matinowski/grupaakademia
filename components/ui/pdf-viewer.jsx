"use client"

import { useState } from "react"
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react"

export default function PdfViewer({ file, onClose }) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium truncate">{file.name}</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleZoomOut} className="p-1 rounded-full hover:bg-gray-100" title="Pomniejsz">
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1 rounded-full hover:bg-gray-100" title="Powiększ">
              <ZoomIn className="w-5 h-5" />
            </button>
            <button onClick={handleRotate} className="p-1 rounded-full hover:bg-gray-100" title="Obróć">
              <RotateCw className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" title="Zamknij">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          <iframe
            src={`${file.path}#view=FitH&zoom=${zoom}&rotate=${rotation}`}
            className="w-full h-full"
            title={file.name}
            onLoad={handleIframeLoad}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
            }}
          />
        </div>
        <div className="p-3 border-t flex justify-end">
          <a
            href={file.path}
            download={file.name}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Pobierz
          </a>
        </div>
      </div>
    </div>
  )
}
