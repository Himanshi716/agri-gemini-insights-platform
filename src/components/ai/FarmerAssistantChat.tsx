import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Camera, 
  MapPin, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Trash2
} from 'lucide-react'
import { useGeminiChat } from '@/hooks/useGeminiChat'
import { useFarmData } from '@/hooks/useFarmData'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface QuickAction {
  id: string
  label: string
  prompt: string
  icon: React.ReactNode
  category: 'analysis' | 'advice' | 'compliance'
}

const quickActions: QuickAction[] = [
  {
    id: 'crop-health',
    label: 'Crop Health Check',
    prompt: 'How can I assess the health of my crops? What signs should I look for?',
    icon: <TrendingUp className="h-4 w-4" />,
    category: 'analysis'
  },
  {
    id: 'pest-management',
    label: 'Pest Management',
    prompt: 'What are the best practices for integrated pest management on my farm?',
    icon: <AlertTriangle className="h-4 w-4" />,
    category: 'advice'
  },
  {
    id: 'compliance-help',
    label: 'Compliance Guidance',
    prompt: 'Help me understand organic farming compliance requirements and documentation.',
    icon: <CheckCircle className="h-4 w-4" />,
    category: 'compliance'
  },
  {
    id: 'weather-planning',
    label: 'Weather Planning',
    prompt: 'How should I plan my farming activities based on upcoming weather conditions?',
    icon: <MapPin className="h-4 w-4" />,
    category: 'advice'
  }
]

export function FarmerAssistantChat() {
  const [message, setMessage] = useState('')
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { 
    messages, 
    isLoading, 
    isConnected, 
    sendMessage, 
    clearChat 
  } = useGeminiChat()
  
  const { farms } = useFarmData()
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedImage) return

    let imageData: string | undefined
    if (selectedImage) {
      const reader = new FileReader()
      imageData = await new Promise((resolve) => {
        reader.onload = () => {
          const base64Data = reader.result as string
          resolve(base64Data.split(',')[1]) // Remove data:image/... prefix
        }
        reader.readAsDataURL(selectedImage)
      })
    }

    const context = {
      farms: farms.map(f => ({ id: f.id, name: f.name, location: f.location_address })),
      timestamp: new Date().toISOString(),
      has_image: !!selectedImage
    }

    await sendMessage(message, imageData, context)
    
    setMessage('')
    setSelectedImage(null)
    setShowImageUpload(false)
  }

  const handleQuickAction = (action: QuickAction) => {
    setMessage(action.prompt)
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      toast({
        title: "📷 Image Selected",
        description: "Image will be included with your message"
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analysis': return 'bg-blue-100 text-blue-800'
      case 'advice': return 'bg-green-100 text-green-800'
      case 'compliance': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMessageIcon = (role: string, metadata: any) => {
    if (role === 'user') return <User className="h-4 w-4" />
    if (metadata?.type === 'crop_analysis') return <TrendingUp className="h-4 w-4" />
    if (metadata?.type === 'compliance_check') return <CheckCircle className="h-4 w-4" />
    return <Bot className="h-4 w-4" />
  }

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Farmer Assistant
              </CardTitle>
              <CardDescription>
                AI-powered agricultural guidance and crop analysis
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Ready"}
              </Badge>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2 h-auto p-3 text-left justify-start"
                  >
                    {action.icon}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{action.label}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCategoryColor(action.category)}`}
                      >
                        {action.category}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
          </CardContent>
        )}

        {/* Messages */}
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] ${
                      msg.role === 'user' ? 'order-2' : 'order-1'
                    }`}
                  >
                    <div
                      className={`rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getMessageIcon(msg.role, msg.metadata)}
                        <span className="text-xs opacity-70">
                          {format(msg.timestamp, 'HH:mm')}
                        </span>
                        {msg.metadata?.hasImage && (
                          <Camera className="h-3 w-3 opacity-70" />
                        )}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      {msg.metadata?.confidence && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Confidence: {Math.round(msg.metadata.confidence * 100)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Assistant is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="mt-4 space-y-3">
            {selectedImage && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Camera className="h-4 w-4" />
                <span className="text-sm">{selectedImage.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about crops, farming techniques, compliance..."
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={(!message.trim() && !selectedImage) || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  )
}