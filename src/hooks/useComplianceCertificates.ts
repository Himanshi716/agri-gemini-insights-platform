import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface ComplianceCertificate {
  id: string
  farm_id: string
  certificate_name: string
  certificate_number?: string
  issuing_authority: string
  issue_date?: string
  expiry_date?: string
  status: 'active' | 'pending' | 'expired' | 'revoked'
  certificate_file_url?: string
  compliance_score: number
  category: string
  notes?: string
  created_at: string
  updated_at: string
}

export function useComplianceCertificates() {
  const [certificates, setCertificates] = useState<ComplianceCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('compliance_certificates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCertificates((data || []) as ComplianceCertificate[])
    } catch (error) {
      console.error('Error fetching certificates:', error)
      toast({
        title: "Error",
        description: "Failed to load certificates",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createCertificate = async (certificateData: Omit<ComplianceCertificate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('compliance_certificates')
        .insert(certificateData)
        .select()
        .single()

      if (error) throw error

      setCertificates(prev => [data as ComplianceCertificate, ...prev])
      toast({
        title: "Success",
        description: "Certificate created successfully"
      })
      return data as ComplianceCertificate
    } catch (error) {
      console.error('Error creating certificate:', error)
      toast({
        title: "Error",
        description: "Failed to create certificate",
        variant: "destructive"
      })
      throw error
    }
  }

  const updateCertificate = async (id: string, updates: Partial<Omit<ComplianceCertificate, 'id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('compliance_certificates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setCertificates(prev => 
        prev.map(cert => cert.id === id ? { ...cert, ...(data as ComplianceCertificate) } : cert)
      )
      toast({
        title: "Success",
        description: "Certificate updated successfully"
      })
      return data as ComplianceCertificate
    } catch (error) {
      console.error('Error updating certificate:', error)
      toast({
        title: "Error",
        description: "Failed to update certificate",
        variant: "destructive"
      })
      throw error
    }
  }

  const deleteCertificate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('compliance_certificates')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCertificates(prev => prev.filter(cert => cert.id !== id))
      toast({
        title: "Success",
        description: "Certificate deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting certificate:', error)
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive"
      })
      throw error
    }
  }

  const getExpiringCertificates = (daysThreshold = 30) => {
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)
    
    return certificates.filter(cert => {
      if (!cert.expiry_date) return false
      const expiryDate = new Date(cert.expiry_date)
      return expiryDate <= thresholdDate && cert.status === 'active'
    })
  }

  const getCertificatesByStatus = (status: ComplianceCertificate['status']) => {
    return certificates.filter(cert => cert.status === status)
  }

  const getCertificatesByCategory = (category: string) => {
    return certificates.filter(cert => cert.category === category)
  }

  useEffect(() => {
    if (user) {
      fetchCertificates()
    }
  }, [user])

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('compliance-certificates-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'compliance_certificates'
      }, () => {
        fetchCertificates()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    certificates,
    loading,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getExpiringCertificates,
    getCertificatesByStatus,
    getCertificatesByCategory,
    refetch: fetchCertificates
  }
}