import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useComplianceCertificates } from "@/hooks/useComplianceCertificates"
import { useFarmData } from "@/hooks/useFarmData"
import { 
  Shield, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CertificateFormData {
  certificate_name: string
  certificate_number: string
  issuing_authority: string
  issue_date: string
  expiry_date: string
  category: string
  compliance_score: number
  notes: string
  farm_id: string
}

export function ComplianceCertificateManager() {
  const { certificates, loading, createCertificate, updateCertificate, deleteCertificate, getExpiringCertificates } = useComplianceCertificates()
  const { farms } = useFarmData()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)
  const [formData, setFormData] = useState<CertificateFormData>({
    certificate_name: '',
    certificate_number: '',
    issuing_authority: '',
    issue_date: '',
    expiry_date: '',
    category: '',
    compliance_score: 0,
    notes: '',
    farm_id: ''
  })

  const expiringCertificates = getExpiringCertificates(30) // 30 days threshold

  const resetForm = () => {
    setFormData({
      certificate_name: '',
      certificate_number: '',
      issuing_authority: '',
      issue_date: '',
      expiry_date: '',
      category: '',
      compliance_score: 0,
      notes: '',
      farm_id: ''
    })
  }

  const handleAdd = async () => {
    try {
      await createCertificate({
        ...formData,
        status: 'pending'
      })
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Failed to create certificate:', error)
    }
  }

  const handleEdit = async () => {
    if (!selectedCertificate) return
    
    try {
      await updateCertificate(selectedCertificate.id, formData)
      setIsEditDialogOpen(false)
      setSelectedCertificate(null)
      resetForm()
    } catch (error) {
      console.error('Failed to update certificate:', error)
    }
  }

  const handleDelete = async (certificateId: string) => {
    try {
      await deleteCertificate(certificateId)
    } catch (error) {
      console.error('Failed to delete certificate:', error)
    }
  }

  const openEditDialog = (certificate: any) => {
    setSelectedCertificate(certificate)
    setFormData({
      certificate_name: certificate.certificate_name,
      certificate_number: certificate.certificate_number || '',
      issuing_authority: certificate.issuing_authority,
      issue_date: certificate.issue_date || '',
      expiry_date: certificate.expiry_date || '',
      category: certificate.category,
      compliance_score: certificate.compliance_score,
      notes: certificate.notes || '',
      farm_id: certificate.farm_id
    })
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Active</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getExpiryStatus = (expiryDate: string) => {
    if (!expiryDate) return null
    
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-destructive', days: Math.abs(daysUntilExpiry) }
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'text-warning', days: daysUntilExpiry }
    }
    
    return { status: 'valid', color: 'text-success', days: daysUntilExpiry }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading certificates...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Certificate Management</h3>
          <p className="text-sm text-muted-foreground">Manage your compliance certificates and their expiry dates</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Certificate</DialogTitle>
              <DialogDescription>Enter the details for the new compliance certificate</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certificate_name">Certificate Name</Label>
                <Input
                  id="certificate_name"
                  value={formData.certificate_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, certificate_name: e.target.value }))}
                  placeholder="e.g., Organic Certification"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificate_number">Certificate Number</Label>
                <Input
                  id="certificate_number"
                  value={formData.certificate_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, certificate_number: e.target.value }))}
                  placeholder="e.g., ORG-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="farm_id">Farm</Label>
                <Select value={formData.farm_id} onValueChange={(value) => setFormData(prev => ({ ...prev, farm_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuing_authority">Issuing Authority</Label>
                <Input
                  id="issuing_authority"
                  value={formData.issuing_authority}
                  onChange={(e) => setFormData(prev => ({ ...prev, issuing_authority: e.target.value }))}
                  placeholder="e.g., USDA Organic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organic">Organic</SelectItem>
                    <SelectItem value="food_safety">Food Safety</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="labor">Labor Standards</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="compliance_score">Compliance Score (%)</Label>
                <Input
                  id="compliance_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.compliance_score}
                  onChange={(e) => setFormData(prev => ({ ...prev, compliance_score: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or requirements..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Certificate</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Expiring Certificates Alert */}
      {expiringCertificates.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Certificates Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringCertificates.map((cert) => {
                const expiryInfo = getExpiryStatus(cert.expiry_date!)
                return (
                  <div key={cert.id} className="flex items-center justify-between">
                    <span className="font-medium">{cert.certificate_name}</span>
                    <span className={cn("text-sm", expiryInfo?.color)}>
                      {expiryInfo?.status === 'expired' 
                        ? `Expired ${expiryInfo.days} days ago`
                        : `Expires in ${expiryInfo?.days} days`
                      }
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates List */}
      <div className="space-y-4">
        {certificates.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Certificates</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first compliance certificate</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          certificates.map((certificate) => {
            const expiryInfo = certificate.expiry_date ? getExpiryStatus(certificate.expiry_date) : null
            
            return (
              <Card key={certificate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{certificate.certificate_name}</h3>
                        {getStatusBadge(certificate.status)}
                        {expiryInfo && (
                          <Badge variant="outline" className={cn("text-xs", expiryInfo.color)}>
                            {expiryInfo.status === 'expired' 
                              ? `Expired ${expiryInfo.days}d ago`
                              : expiryInfo.status === 'expiring'
                              ? `Expires in ${expiryInfo.days}d`
                              : 'Valid'
                            }
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Certificate #:</span>
                          <p className="font-medium">{certificate.certificate_number || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Authority:</span>
                          <p className="font-medium">{certificate.issuing_authority}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <p className="font-medium capitalize">{certificate.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Score:</span>
                          <p className="font-medium">{certificate.compliance_score}%</p>
                        </div>
                      </div>

                      {certificate.notes && (
                        <div className="mt-3">
                          <span className="text-muted-foreground text-sm">Notes:</span>
                          <p className="text-sm mt-1">{certificate.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(certificate)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{certificate.certificate_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(certificate.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Certificate</DialogTitle>
            <DialogDescription>Update the certificate details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_certificate_name">Certificate Name</Label>
              <Input
                id="edit_certificate_name"
                value={formData.certificate_name}
                onChange={(e) => setFormData(prev => ({ ...prev, certificate_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_certificate_number">Certificate Number</Label>
              <Input
                id="edit_certificate_number"
                value={formData.certificate_number}
                onChange={(e) => setFormData(prev => ({ ...prev, certificate_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_issuing_authority">Issuing Authority</Label>
              <Input
                id="edit_issuing_authority"
                value={formData.issuing_authority}
                onChange={(e) => setFormData(prev => ({ ...prev, issuing_authority: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="food_safety">Food Safety</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="labor">Labor Standards</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_compliance_score">Compliance Score (%)</Label>
              <Input
                id="edit_compliance_score"
                type="number"
                min="0"
                max="100"
                value={formData.compliance_score}
                onChange={(e) => setFormData(prev => ({ ...prev, compliance_score: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_issue_date">Issue Date</Label>
              <Input
                id="edit_issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_expiry_date">Expiry Date</Label>
              <Input
                id="edit_expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit_notes">Notes</Label>
              <Textarea
                id="edit_notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}