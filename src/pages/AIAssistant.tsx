
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { useFarmData } from "@/hooks/useFarmData"
import { supabase } from "@/integrations/supabase/client"
import { 
  MessageSquare, 
  Brain, 
  Camera, 
  FileText, 
  Leaf, 
  Zap,
  Send,
  Image,
  TrendingUp,
  AlertTriangle,
  Bot,
  User,
  Mic,
  Upload,
  Loader2
} from "lucide-react"

interface ChatMessage {
  id: number
  type: 'user' | 'assistant'
  message: string
  timestamp: string
  image?: string
}

const chatHistory: ChatMessage[] = [
  {
    id: 1,
    type: 'user' as const,
    message: 'What are the optimal growing conditions for tomatoes?',
    timestamp: '2024-01-20 14:30'
  },
  {
    id: 2,
    type: 'assistant' as const,
    message: 'Optimal tomato growing conditions include: Temperature 65-75°F (18-24°C), pH 6.0-6.8, well-draining soil with organic matter, 6+ hours of direct sunlight, and consistent watering (1-2 inches per week).',
    timestamp: '2024-01-20 14:31'
  }
]

const assistantFeatures = [
  {
    title: 'Crop Analysis',
    description: 'AI-powered crop health assessment and disease detection',
    icon: Camera,
    badge: 'Gemini Vision'
  },
  {
    title: 'Document Generation',
    description: 'Automated compliance and export documentation',
    icon: FileText,
    badge: 'Gemini Pro'
  },
  {
    title: 'Expert Consultation',
    description: 'Agricultural best practices and recommendations',
    icon: Brain,
    badge: 'Gemini Pro'
  },
  {
    title: 'Market Insights',
    description: 'Real-time market analysis and pricing trends',
    icon: TrendingUp,
    badge: 'Gemini Pro'
  }
]

const recentAnalyses = [
  {
    type: 'Crop Disease Detection',
    result: 'Healthy - No issues detected',
    confidence: 96,
    date: '2024-01-20'
  },
  {
    type: 'Soil Quality Assessment',
    result: 'Good - Minor nutrient deficiency',
    confidence: 88,
    date: '2024-01-19'
  },
  {
    type: 'Pest Identification',
    result: 'Aphids detected - Treatment recommended',
    confidence: 92,
    date: '2024-01-18'
  }
]

const quickActions = [
  { label: 'Crop Health Check', icon: Leaf },
  { label: 'Pest Identification', icon: AlertTriangle },
  { label: 'Weather Forecast', icon: Brain },
  { label: 'Market Prices', icon: TrendingUp },
  { label: 'Compliance Check', icon: FileText }
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { toast } = useToast()
  const { user } = useAuth()
  const { farms } = useFarmData()

  const sendMessage = async () => {
    if (!message.trim() && !selectedImage) return
    
    setLoading(true)
    const timestamp = new Date().toLocaleString()
    const userMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      message: message.trim(),
      timestamp,
      image: selectedImage ? URL.createObjectURL(selectedImage) : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setMessage("")
    
    try {
      let response;
      
      if (selectedImage) {
        // Handle image analysis
        const formData = new FormData()
        formData.append('image', selectedImage)
        formData.append('prompt', message || 'Analyze this crop image for any issues or recommendations')
        formData.append('userId', user?.id || '')
        formData.append('farmId', farms[0]?.id || '')

        response = await supabase.functions.invoke('crop-vision-analysis', {
          body: formData
        })
      } else {
        // Handle text message
        response = await supabase.functions.invoke('farmer-assistant', {
          body: {
            message: message,
            userId: user?.id,
            farmId: farms[0]?.id,
            language: 'en'
          }
        })
      }

      if (response.error) {
        throw new Error(response.error.message)
      }

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        message: response.data.response || response.data.analysis || 'I apologize, but I encountered an issue processing your request.',
        timestamp: new Date().toLocaleString()
      }

      setMessages(prev => [...prev, assistantMessage])
      
    } catch (error) {
      console.error('Chat error:', error)
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setSelectedImage(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectQuickAction = (actionLabel: string) => {
    const prompts: Record<string, string> = {
      'Crop Health Check': 'Can you help me assess the health of my crops? What should I look for?',
      'Pest Identification': 'I think I have pests in my crops. How can I identify and treat them?',
      'Weather Forecast': 'How should I prepare my farm for upcoming weather conditions?',
      'Market Prices': 'What are the current market trends for my crops?',
      'Compliance Check': 'Help me understand the compliance requirements for my farm.'
    }
    
    setMessage(prompts[actionLabel] || actionLabel)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
        <p className="text-muted-foreground">Get expert agricultural advice powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">AgriExpert AI</CardTitle>
                  <CardDescription>Your personal farming advisor</CardDescription>
                </div>
                <Badge variant="default" className="ml-auto">Online</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {msg.type === "assistant" && (
                        <Bot className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      )}
                      {msg.type === "user" && (
                        <User className="h-4 w-4 mt-0.5 text-primary-foreground/80" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.type === "user" 
                            ? "text-primary-foreground/60" 
                            : "text-muted-foreground"
                        }`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            
            <div className="border-t p-4">
              {selectedImage && (
                <div className="mb-3 p-2 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Image selected: {selectedImage.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedImage(null)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask me anything about farming..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={loading}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon"
                  onClick={sendMessage}
                  disabled={loading || (!message.trim() && !selectedImage)}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common assistance topics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => selectQuickAction(action.label)}
                  disabled={loading}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Disease Identification</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Pest Management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Compliance Guidance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Weather Insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Market Analysis</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Queries</span>
                <span className="font-medium">12/100</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Images Analyzed</span>
                <span className="font-medium">3/20</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
