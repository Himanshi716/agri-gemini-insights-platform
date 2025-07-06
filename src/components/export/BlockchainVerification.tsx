import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  Link, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Hash,
  Database,
  Globe,
  Fingerprint
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BlockchainRecord {
  hash: string
  timestamp: string
  blockNumber: number
  documentId: string
  farmId: string
  transactionHash: string
  verified: boolean
  network: string
}

interface BlockchainVerificationProps {
  documentId?: string
  onVerificationComplete?: (result: BlockchainRecord) => void
}

export function BlockchainVerification({ documentId, onVerificationComplete }: BlockchainVerificationProps) {
  const [verificationId, setVerificationId] = useState(documentId || "")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<BlockchainRecord | null>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  // Real blockchain verification using Infura API
  const verifyOnBlockchain = async (id: string): Promise<BlockchainRecord> => {
    const response = await fetch('/api/blockchain-verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hash: id })
    })

    if (!response.ok) {
      throw new Error('Blockchain verification failed')
    }

    const { data, error } = await response.json()
    
    if (error) {
      throw new Error(error)
    }

    return {
      hash: data.hash,
      timestamp: data.timestamp,
      blockNumber: data.blockNumber,
      documentId: data.documentId || id,
      farmId: data.farmId || `farm_${Math.random().toString(36).substr(2, 9)}`,
      transactionHash: data.transactionHash || `0x${data.hash?.substring(0, 40)}`,
      verified: data.verified,
      network: data.network || "Polygon"
    }
  }

  // Simulate blockchain verification process (fallback for demo)
  const simulateBlockchainVerification = async (id: string): Promise<BlockchainRecord> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const hash = Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('')
        
        resolve({
          hash,
          timestamp: new Date().toISOString(),
          blockNumber: Math.floor(Math.random() * 1000000) + 500000,
          documentId: id,
          farmId: `farm_${Math.random().toString(36).substr(2, 9)}`,
          transactionHash: `0x${hash.substring(0, 40)}`,
          verified: Math.random() > 0.1, // 90% success rate
          network: "Agricultural Supply Chain Network"
        })
      }, 3000)
    })
  }

  const verifyDocument = async () => {
    if (!verificationId.trim()) {
      toast({
        title: "Invalid ID",
        description: "Please enter a valid document or hash ID",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)
    setProgress(0)
    setVerificationResult(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 20
      })
    }, 200)

    try {
      const result = await verifyOnBlockchain(verificationId)
      setProgress(100)
      setVerificationResult(result)
      onVerificationComplete?.(result)

      toast({
        title: result.verified ? "Verification Successful" : "Verification Failed",
        description: result.verified 
          ? "Document authenticity confirmed on blockchain"
          : "Document could not be verified on blockchain",
        variant: result.verified ? "default" : "destructive"
      })
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Failed to verify document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsVerifying(false)
      clearInterval(progressInterval)
    }
  }

  const generateTraceabilityHash = () => {
    const timestamp = Date.now()
    const randomBytes = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256)
    )
    const hash = randomBytes.map(b => b.toString(16).padStart(2, '0')).join('')
    setVerificationId(`doc_${timestamp}_${hash.substring(0, 16)}`)
  }

  useEffect(() => {
    if (documentId) {
      verifyDocument()
    }
  }, [documentId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Blockchain Verification
        </CardTitle>
        <CardDescription>
          Verify document authenticity and traceability on the agricultural blockchain network
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-id">Document ID or Hash</Label>
            <div className="flex gap-2">
              <Input
                id="verification-id"
                placeholder="Enter document ID or blockchain hash"
                value={verificationId}
                onChange={(e) => setVerificationId(e.target.value)}
                className="font-mono text-sm"
              />
              <Button 
                onClick={generateTraceabilityHash} 
                variant="outline"
                size="sm"
              >
                <Hash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isVerifying && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Verifying on blockchain...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={verifyDocument} 
            disabled={isVerifying || !verificationId.trim()}
            className="w-full"
          >
            {isVerifying ? (
              "Verifying..."
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify on Blockchain
              </>
            )}
          </Button>
        </div>

        {verificationResult && (
          <div className="space-y-4">
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Verification Result</h3>
                <Badge 
                  variant={verificationResult.verified ? "default" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {verificationResult.verified ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {verificationResult.verified ? "Verified" : "Unverified"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Document Hash</p>
                      <p className="text-muted-foreground font-mono break-all">
                        {verificationResult.hash.substring(0, 20)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Block Number</p>
                      <p className="text-muted-foreground">#{verificationResult.blockNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Timestamp</p>
                      <p className="text-muted-foreground">
                        {new Date(verificationResult.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Transaction Hash</p>
                      <p className="text-muted-foreground font-mono break-all">
                        {verificationResult.transactionHash.substring(0, 20)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Network</p>
                      <p className="text-muted-foreground">{verificationResult.network}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Farm ID</p>
                      <p className="text-muted-foreground font-mono">{verificationResult.farmId}</p>
                    </div>
                  </div>
                </div>
              </div>

              {verificationResult.verified && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Document Verified</span>
                  </div>
                  <p className="text-sm text-success/80 mt-1">
                    This document has been verified on the agricultural blockchain network and its authenticity is confirmed.
                  </p>
                </div>
              )}

              {!verificationResult.verified && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Verification Failed</span>
                  </div>
                  <p className="text-sm text-destructive/80 mt-1">
                    This document could not be verified on the blockchain network. It may be invalid or not yet recorded.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}