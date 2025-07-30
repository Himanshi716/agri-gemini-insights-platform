import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

interface AnalyticsReport {
  id: string
  title: string
  description?: string
  report_type: string
  content?: any
  generated_at: string
  scheduled_for?: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  file_url?: string
  created_at: string
}

interface ComplianceRequirement {
  id: string
  standard_name: string
  category: string
  requirement_text: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  compliance_score: number
  evidence_required: string[]
  last_assessed?: string
  next_assessment?: string
}

export function useAnalytics() {
  const [reports, setReports] = useState<AnalyticsReport[]>([])
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchReports = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('analytics_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports((data || []).map(report => ({
        ...report,
        status: report.status as 'pending' | 'generating' | 'completed' | 'failed'
      })))
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const fetchRequirements = async () => {
    try {
      const { data, error } = await supabase
        .from('compliance_requirements')
        .select('*')
        .order('priority', { ascending: false })

      if (error) throw error
      setRequirements((data || []).map(req => ({
        ...req,
        priority: req.priority as 'low' | 'medium' | 'high' | 'critical'
      })))
    } catch (error) {
      console.error('Error fetching requirements:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchReports(), fetchRequirements()])
      setLoading(false)
    }

    loadData()
  }, [user])

  const generateReport = async (title: string, reportType: string, description?: string) => {
    if (!user) return

    try {
      setLoading(true)
      
      // Generate report content based on type
      let content = {}
      
      switch (reportType) {
        case 'farm_performance':
          content = {
            productivity: { yield: '18.7 tons/ha', efficiency: '85.3%' },
            costs: { per_unit: '$2.34/kg', total: '$45,600' },
            quality: { score: '94.2%', rating: 'A+' }
          }
          break
        case 'compliance':
          content = {
            overall_score: requirements.reduce((sum, req) => sum + req.compliance_score, 0) / requirements.length,
            requirements_met: requirements.filter(req => req.compliance_score >= 90).length,
            critical_issues: requirements.filter(req => req.priority === 'critical' && req.compliance_score < 90).length
          }
          break
        case 'iot_performance':
          content = {
            sensors_online: '12/15',
            data_points: '2,847',
            uptime: '98.5%',
            alerts: '3 active'
          }
          break
        default:
          content = { message: 'Report generated successfully' }
      }

      const { data, error } = await supabase
        .from('analytics_reports')
        .insert({
          user_id: user.id,
          title,
          description,
          report_type: reportType,
          content,
          status: 'completed'
        })
        .select()
        .single()

      if (error) throw error
      
      setReports(prev => [{
        ...data,
        status: data.status as 'pending' | 'generating' | 'completed' | 'failed'
      }, ...prev])
      return data
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const scheduleReport = async (title: string, reportType: string, scheduledFor: string, description?: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('analytics_reports')
        .insert({
          user_id: user.id,
          title,
          description,
          report_type: reportType,
          scheduled_for: scheduledFor,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      
      setReports(prev => [{
        ...data,
        status: data.status as 'pending' | 'generating' | 'completed' | 'failed'
      }, ...prev])
      return data
    } catch (error) {
      console.error('Error scheduling report:', error)
      throw error
    }
  }

  const calculateOverallComplianceScore = () => {
    if (requirements.length === 0) return 0
    return Math.round(requirements.reduce((sum, req) => sum + req.compliance_score, 0) / requirements.length)
  }

  const getCriticalIssues = () => {
    return requirements.filter(req => req.priority === 'critical' && req.compliance_score < 90)
  }

  const getComplianceByCategory = () => {
    const categories = requirements.reduce((acc, req) => {
      if (!acc[req.category]) {
        acc[req.category] = { total: 0, sum: 0, count: 0 }
      }
      acc[req.category].sum += req.compliance_score
      acc[req.category].count += 1
      acc[req.category].total = Math.round(acc[req.category].sum / acc[req.category].count)
      return acc
    }, {} as Record<string, { total: number; sum: number; count: number }>)
    
    return Object.entries(categories).map(([category, data]) => ({
      category,
      score: data.total,
      count: data.count
    }))
  }

  return {
    reports,
    requirements,
    loading,
    generateReport,
    scheduleReport,
    calculateOverallComplianceScore,
    getCriticalIssues,
    getComplianceByCategory,
    refetch: () => Promise.all([fetchReports(), fetchRequirements()])
  }
}