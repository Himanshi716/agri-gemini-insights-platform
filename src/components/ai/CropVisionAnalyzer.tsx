import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Camera, Upload, Loader2, Eye, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { useAdvancedAIChat } from '@/hooks/useAdvancedAIChat'
import { useNativeCapabilities } from '@/hooks/useNativeCapabilities'
import { useToast } from '@/hooks/use-toast'

const cropTypes = [
  'wheat', 'rice', 'corn', 'soybean', 'cotton', 'tomato', 'potato', 'lettuce', 'carrot', 'cabbage'
]

export function CropVisionAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [cropType, setCropType] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { analyzeCropImage, isLoading } = useAdvancedAIChat()
  const { takePhoto } = useNativeCapabilities()
  const { toast } = useToast()

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = async () => {
    setIsCapturing(true)
    try {
      const photoDataUrl = await takePhoto()
      if (photoDataUrl) {
        // Convert base64 to File object
        const response = await fetch(photoDataUrl)
        const blob = await response.blob()
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' })
        
        setSelectedImage(file)
        setImagePreview(photoDataUrl)
        
        toast({
          title: "📸 Photo Captured",
          description: "Image ready for analysis"
        })
      }
    } catch (error) {
      console.error('Error capturing photo:', error)
      toast({
        title: "Camera Error",
        description: "Failed to capture photo",
        variant: "destructive"
      })
    } finally {
      setIsCapturing(false)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please select or capture an image first",
        variant: "destructive"
      })
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Data = reader.result as string
        const base64Image = base64Data.split(',')[1] // Remove data:image/... prefix
        
        const result = await analyzeCropImage(base64Image, cropType, location)
        setAnalysisResult(result)
        
        toast({
          title: "🔍 Analysis Complete",
          description: "Crop analysis has been completed"
        })
      }
      reader.readAsDataURL(selectedImage)
    } catch (error) {
      console.error('Error analyzing image:', error)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence'
    if (confidence >= 0.6) return 'Medium Confidence'
    return 'Low Confidence'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Crop Vision Analyzer
          </CardTitle>
          <CardDescription>
            Upload or capture crop images for AI-powered health analysis and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Crop Image</Label>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </Button>
              <Button
                variant="outline"
                onClick={handleCameraCapture}
                disabled={isCapturing}
                className="flex items-center gap-2"
              >
                {isCapturing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                Capture Photo
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="relative w-full max-w-md mx-auto">
                <img
                  src={imagePreview}
                  alt="Crop preview"
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>
            </div>
          )}

          {/* Analysis Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cropType">Crop Type (Optional)</Label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="Farm location or field name"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!selectedImage || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Analyze Crop
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analysis Results
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getConfidenceColor(analysisResult.confidence)}>
                {getConfidenceLabel(analysisResult.confidence)}
              </Badge>
              <Progress 
                value={analysisResult.confidence * 100} 
                className="flex-1 max-w-48" 
              />
              <span className="text-sm text-muted-foreground">
                {Math.round(analysisResult.confidence * 100)}%
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Analysis Text */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Analysis</Label>
              <Textarea
                value={analysisResult.analysis}
                readOnly
                className="min-h-32 resize-none"
              />
            </div>

            {/* Recommendations */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Recommendations</Label>
                <div className="space-y-2">
                  {analysisResult.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Sources */}
            {analysisResult.data_sources && analysisResult.data_sources.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Data Sources</Label>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.data_sources.map((source: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}