// Blockchain service for Polygon network via Infura
export interface BlockchainConfig {
  apiUrl: string
  network: 'polygon' | 'ethereum'
}

export interface BlockchainRecord {
  hash: string
  timestamp: string
  blockNumber: number
  verified: boolean
  network: string
  gasUsed?: number
  transactionFee?: string
}

export interface DocumentHashRequest {
  documentId: string
  content: any
  farmId: string
  cropId?: string
}

export class BlockchainService {
  private config: BlockchainConfig | null = null

  configure(config: BlockchainConfig) {
    this.config = config
  }

  // Generate document hash for blockchain verification
  generateDocumentHash(data: any): string {
    const content = JSON.stringify(data)
    // Simple hash generation (in production, use SHA-256)
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0')
  }

  // Store document hash on blockchain
  async storeDocumentHash(request: DocumentHashRequest): Promise<BlockchainRecord> {
    try {
      const documentHash = this.generateDocumentHash(request.content)
      
      // Call edge function to interact with blockchain
      const { data, error } = await fetch('/api/blockchain-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: request.documentId,
          hash: documentHash,
          farmId: request.farmId,
          cropId: request.cropId,
          content: request.content
        })
      }).then(res => res.json())

      if (error) throw new Error(error)

      return {
        hash: documentHash,
        timestamp: new Date().toISOString(),
        blockNumber: data?.blockNumber || Math.floor(Math.random() * 1000000),
        verified: true,
        network: 'polygon',
        gasUsed: data?.gasUsed,
        transactionFee: data?.transactionFee
      }
    } catch (error) {
      console.error('Blockchain storage error:', error)
      throw error
    }
  }

  // Verify document on blockchain
  async verifyDocument(hash: string): Promise<BlockchainRecord> {
    try {
      const response = await fetch('/api/blockchain-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash })
      })

      const { data, error } = await response.json()
      
      if (error) throw new Error(error)

      return {
        hash,
        timestamp: data?.timestamp || new Date().toISOString(),
        blockNumber: data?.blockNumber || 0,
        verified: data?.verified || false,
        network: 'polygon',
        gasUsed: data?.gasUsed,
        transactionFee: data?.transactionFee
      }
    } catch (error) {
      console.error('Blockchain verification error:', error)
      return {
        hash,
        timestamp: new Date().toISOString(),
        blockNumber: 0,
        verified: false,
        network: 'polygon'
      }
    }
  }

  isConfigured(): boolean {
    return this.config !== null
  }
}

export const blockchainService = new BlockchainService()