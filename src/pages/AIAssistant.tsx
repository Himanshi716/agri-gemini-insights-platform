import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Bot, User, Mic, Image, FileText } from "lucide-react"

export default function AIAssistant() {
  const [message, setMessage] = useState("")
  const [messages] = useState([
    {
      id: 1,
      type: "assistant",
      content: "Hello! I'm your AI farming assistant. I can help you with crop management, pest identification, compliance questions, and export documentation. How can I assist you today?",
      timestamp: "09:00"
    },
    {
      id: 2,
      type: "user", 
      content: "I noticed some spots on my tomato leaves. Can you help identify what this might be?",
      timestamp: "09:02"
    },
    {
      id: 3,
      type: "assistant",
      content: "I'd be happy to help identify the issue with your tomato leaves! To provide an accurate diagnosis, could you please upload a clear photo of the affected leaves? Also, let me know:\n\n• When did you first notice the spots?\n• What's the current weather like in your area?\n• Have you applied any treatments recently?\n\nThis will help me give you the most accurate identification and treatment recommendations.",
      timestamp: "09:03"
    }
  ])

  const quickActions = [
    { label: "Crop Disease ID", icon: Image },
    { label: "Weather Advice", icon: MessageSquare },
    { label: "Compliance Check", icon: FileText },
    { label: "Market Prices", icon: MessageSquare }
  ]

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
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask me anything about farming..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon" variant="outline">
                  <Mic className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline">
                  <Image className="h-4 w-4" />
                </Button>
                <Button size="icon">
                  <Send className="h-4 w-4" />
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