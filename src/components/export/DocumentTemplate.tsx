import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { FileText, Download, QrCode, Shield, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DocumentTemplateProps {
  template: {
    id: string
    name: string
    description: string
    fields: string[]
    type: string
    compliance_standards: string[]
  }
  onGenerate: (data: any) => void
  onPreview: (data: any) => void
}

export function DocumentTemplate({ template, onGenerate, onPreview }: DocumentTemplateProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await onGenerate({
        template: template.id,
        data: formData,
        type: template.type
      })
      toast({
        title: "Document Generated",
        description: `${template.name} has been generated successfully.`
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getFieldComponent = (field: string) => {
    const fieldName = field.toLowerCase().replace(/[^a-z0-9]/g, '_')
    
    switch (fieldName) {
      case 'country':
      case 'destination_country':
        return (
          <Select onValueChange={(value) => handleFieldChange(field, value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="US">United States</SelectItem>
              <SelectItem value="EU">European Union</SelectItem>
              <SelectItem value="JP">Japan</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="AU">Australia</SelectItem>
            </SelectContent>
          </Select>
        )
      
      case 'product_description':
      case 'additional_notes':
      case 'inspection_notes':
        return (
          <Textarea
            placeholder={`Enter ${field.toLowerCase()}`}
            value={formData[field] || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="min-h-[100px]"
          />
        )
      
      default:
        return (
          <Input
            type={field.includes('date') ? 'date' : 'text'}
            placeholder={`Enter ${field.toLowerCase()}`}
            value={formData[field] || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
          />
        )
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {template.name}
            </CardTitle>
            <CardDescription>{template.description}</CardDescription>
            <div className="flex flex-wrap gap-2">
              {template.compliance_standards.map((standard, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {standard}
                </Badge>
              ))}
            </div>
          </div>
          <Badge variant="secondary">{template.type}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {template.fields.map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="text-sm font-medium">
                {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Label>
              {getFieldComponent(field)}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={() => onPreview({ template: template.id, data: formData })}
            variant="outline"
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              "Generating..."
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Document
              </>
            )}
          </Button>
          
          <Button
            onClick={() => onGenerate({ 
              template: template.id, 
              data: formData, 
              includeQR: true 
            })}
            variant="outline"
            className="flex-1"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Generate with QR
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}