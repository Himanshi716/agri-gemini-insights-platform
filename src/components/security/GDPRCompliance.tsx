import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Shield, Cookie, Eye, Download, Trash2, Settings } from 'lucide-react'
import { useAuditLogger } from '@/utils/auditLogger'

interface ConsentSettings {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export function GDPRCompliance() {
  const [showBanner, setShowBanner] = useState(false)
  const [consent, setConsent] = useState<ConsentSettings>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  })
  const { logPrivacyAction } = useAuditLogger()

  useEffect(() => {
    const savedConsent = localStorage.getItem('gdpr-consent')
    if (!savedConsent) {
      setShowBanner(true)
    } else {
      setConsent(JSON.parse(savedConsent))
    }
  }, [])

  const handleAcceptAll = () => {
    const newConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    setConsent(newConsent)
    localStorage.setItem('gdpr-consent', JSON.stringify(newConsent))
    localStorage.setItem('gdpr-consent-date', new Date().toISOString())
    setShowBanner(false)
    logPrivacyAction('consent_accepted_all', '', { consent: newConsent })
  }

  const handleRejectAll = () => {
    const newConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    }
    setConsent(newConsent)
    localStorage.setItem('gdpr-consent', JSON.stringify(newConsent))
    localStorage.setItem('gdpr-consent-date', new Date().toISOString())
    setShowBanner(false)
    logPrivacyAction('consent_rejected_all', '', { consent: newConsent })
  }

  const handleCustomizeConsent = (settings: ConsentSettings) => {
    setConsent(settings)
    localStorage.setItem('gdpr-consent', JSON.stringify(settings))
    localStorage.setItem('gdpr-consent-date', new Date().toISOString())
    setShowBanner(false)
    logPrivacyAction('consent_customized', '', { consent: settings })
  }

  const handleDataRequest = (type: 'export' | 'delete') => {
    logPrivacyAction(`data_${type}_requested`, '', { requestType: type })
    // In a real app, this would trigger a backend process
    alert(`Data ${type} request submitted. You will receive an email within 30 days.`)
  }

  if (!showBanner) return null

  return (
    <>
      {/* GDPR Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-50">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">We value your privacy</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We use cookies and similar technologies to provide, protect and improve our services. 
                  By continuing to use our site, you agree to our privacy practices.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </DialogTrigger>
                <ConsentCustomization 
                  consent={consent}
                  onSave={handleCustomizeConsent}
                />
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRejectAll}
              >
                Reject All
              </Button>
              
              <Button 
                size="sm"
                onClick={handleAcceptAll}
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings Page */}
      <PrivacySettings onDataRequest={handleDataRequest} />
    </>
  )
}

function ConsentCustomization({ 
  consent, 
  onSave 
}: { 
  consent: ConsentSettings
  onSave: (settings: ConsentSettings) => void 
}) {
  const [localConsent, setLocalConsent] = useState(consent)

  const consentTypes = [
    {
      key: 'necessary' as keyof ConsentSettings,
      title: 'Necessary Cookies',
      description: 'Essential for the website to function properly',
      required: true,
    },
    {
      key: 'analytics' as keyof ConsentSettings,
      title: 'Analytics Cookies',
      description: 'Help us understand how you use our website',
      required: false,
    },
    {
      key: 'marketing' as keyof ConsentSettings,
      title: 'Marketing Cookies',
      description: 'Used to show you relevant advertisements',
      required: false,
    },
    {
      key: 'preferences' as keyof ConsentSettings,
      title: 'Preference Cookies',
      description: 'Remember your settings and preferences',
      required: false,
    },
  ]

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Preferences
        </DialogTitle>
        <DialogDescription>
          Choose which cookies and data processing you're comfortable with.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {consentTypes.map((type) => (
          <div key={type.key} className="flex items-start space-x-3 p-4 border rounded-lg">
            <Checkbox
              id={type.key}
              checked={localConsent[type.key]}
              disabled={type.required}
              onCheckedChange={(checked) =>
                setLocalConsent(prev => ({ ...prev, [type.key]: !!checked }))
              }
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <label htmlFor={type.key} className="font-medium text-sm">
                  {type.title}
                </label>
                {type.required && (
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {type.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={() => onSave(localConsent)}
        >
          Save Preferences
        </Button>
      </div>
    </DialogContent>
  )
}

function PrivacySettings({ 
  onDataRequest 
}: { 
  onDataRequest: (type: 'export' | 'delete') => void 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Your Privacy Rights
        </CardTitle>
        <CardDescription>
          Manage your personal data and privacy preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Data Portability</h4>
          <p className="text-sm text-muted-foreground mb-3">
            You have the right to receive your personal data in a portable format.
          </p>
          <Button 
            variant="outline" 
            onClick={() => onDataRequest('export')}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Request Data Export
          </Button>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-2">Right to be Forgotten</h4>
          <p className="text-sm text-muted-foreground mb-3">
            You have the right to request deletion of your personal data.
          </p>
          <Button 
            variant="destructive" 
            onClick={() => onDataRequest('delete')}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Request Data Deletion
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}