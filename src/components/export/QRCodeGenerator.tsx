import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, QrCode, Copy, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRCodeGeneratorProps {
  data?: any
  onCodeGenerated?: (qrData: string, imageData: string) => void
}

export function QRCodeGenerator({ data, onCodeGenerated }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrData, setQrData] = useState("")
  const [size, setSize] = useState("200")
  const [errorLevel, setErrorLevel] = useState("M")
  const [generatedCode, setGeneratedCode] = useState("")
  const { toast } = useToast()

  // Generate blockchain-style hash for traceability
  const generateTraceabilityHash = (data: any) => {
    const str = JSON.stringify(data) + Date.now()
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  }

  const generateQRCode = async (customData?: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    let dataToEncode = customData || qrData

    if (data && !customData) {
      // Create traceability data structure
      const traceabilityData = {
        documentId: data.id || generateTraceabilityHash(data),
        type: data.type || "agricultural_product",
        timestamp: new Date().toISOString(),
        farmId: data.farmId,
        cropId: data.cropId,
        batchNumber: data.batchNumber || generateTraceabilityHash(data),
        verificationUrl: `https://verify.agriplatform.com/${generateTraceabilityHash(data)}`,
        blockchain: {
          hash: generateTraceabilityHash(data),
          network: "agricultural-chain",
          block: Math.floor(Math.random() * 1000000)
        }
      }
      dataToEncode = JSON.stringify(traceabilityData)
    }

    if (!dataToEncode) {
      toast({
        title: "No Data",
        description: "Please enter data to generate QR code",
        variant: "destructive"
      })
      return
    }

    try {
      await QRCode.toCanvas(canvas, dataToEncode, {
        width: parseInt(size),
        errorCorrectionLevel: errorLevel as any,
        color: {
          dark: '#1a5f3f', // Using agricultural green
          light: '#ffffff'
        }
      })

      setGeneratedCode(dataToEncode)
      
      // Convert canvas to data URL for download
      const imageData = canvas.toDataURL('image/png')
      onCodeGenerated?.(dataToEncode, imageData)

      toast({
        title: "QR Code Generated",
        description: "QR code has been generated successfully"
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive"
      })
    }
  }

  const downloadQRCode = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `qr-code-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const copyQRData = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode)
      toast({
        title: "Copied",
        description: "QR code data copied to clipboard"
      })
    }
  }

  const viewTraceabilityData = () => {
    if (generatedCode) {
      try {
        const parsed = JSON.parse(generatedCode)
        console.log("Traceability Data:", parsed)
        toast({
          title: "Traceability Data",
          description: "Check browser console for detailed data"
        })
      } catch {
        toast({
          title: "Raw Data",
          description: generatedCode
        })
      }
    }
  }

  useEffect(() => {
    if (data) {
      generateQRCode()
    }
  }, [data, size, errorLevel])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          QR Code Generator
        </CardTitle>
        <CardDescription>
          Generate QR codes for product traceability and blockchain verification
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!data && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-data">Data to Encode</Label>
              <Input
                id="qr-data"
                placeholder="Enter data for QR code"
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">Size (pixels)</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100x100</SelectItem>
                <SelectItem value="200">200x200</SelectItem>
                <SelectItem value="300">300x300</SelectItem>
                <SelectItem value="400">400x400</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="error-level">Error Correction</Label>
            <Select value={errorLevel} onValueChange={setErrorLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (7%)</SelectItem>
                <SelectItem value="M">Medium (15%)</SelectItem>
                <SelectItem value="Q">Quartile (25%)</SelectItem>
                <SelectItem value="H">High (30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border-2 border-dashed border-muted rounded-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => generateQRCode()} disabled={!data && !qrData}>
            <QrCode className="h-4 w-4 mr-2" />
            Generate
          </Button>
          
          <Button onClick={downloadQRCode} variant="outline" disabled={!generatedCode}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <Button onClick={copyQRData} variant="outline" disabled={!generatedCode}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Data
          </Button>
          
          <Button onClick={viewTraceabilityData} variant="outline" disabled={!generatedCode}>
            <Eye className="h-4 w-4 mr-2" />
            View Data
          </Button>
        </div>

        {generatedCode && (
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">Encoded Data Preview:</p>
            <p className="break-all">{generatedCode.length > 100 ? generatedCode.substring(0, 100) + "..." : generatedCode}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}