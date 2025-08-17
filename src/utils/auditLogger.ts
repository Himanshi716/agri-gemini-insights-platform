export interface AuditLogEntry {
  id: string
  timestamp: string
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
}

class AuditLogger {
  private logs: AuditLogEntry[] = []
  private maxLogs = 1000

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getUserInfo() {
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
    // In a real app, you'd get the user's IP from your auth service
    const ipAddress = 'client-side' // This would be determined server-side
    
    return { userAgent, ipAddress }
  }

  public log(
    action: string,
    resource: string,
    details?: Record<string, any>,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info',
    resourceId?: string,
    userId?: string
  ): void {
    const { userAgent, ipAddress } = this.getUserInfo()
    
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      severity,
    }

    this.logs.unshift(entry)
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[AUDIT] ${severity.toUpperCase()}: ${action} on ${resource}`, entry)
    }

    // In production, send to your logging service
    if (import.meta.env.PROD) {
      this.sendToLoggingService(entry)
    }
  }

  private async sendToLoggingService(entry: AuditLogEntry): Promise<void> {
    try {
      // This would be your actual logging service endpoint
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      console.error('Failed to send audit log:', error)
    }
  }

  public getLogs(): AuditLogEntry[] {
    return [...this.logs]
  }

  public getLogsByUser(userId: string): AuditLogEntry[] {
    return this.logs.filter(log => log.userId === userId)
  }

  public getLogsByResource(resource: string): AuditLogEntry[] {
    return this.logs.filter(log => log.resource === resource)
  }

  public getLogsBySeverity(severity: string): AuditLogEntry[] {
    return this.logs.filter(log => log.severity === severity)
  }

  public clearLogs(): void {
    this.logs = []
  }

  // Compliance-specific logging methods
  public logDataAccess(resource: string, resourceId: string, userId?: string): void {
    this.log('data_access', resource, { resourceId }, 'info', resourceId, userId)
  }

  public logDataModification(resource: string, resourceId: string, changes: Record<string, any>, userId?: string): void {
    this.log('data_modification', resource, { resourceId, changes }, 'warning', resourceId, userId)
  }

  public logDataDeletion(resource: string, resourceId: string, userId?: string): void {
    this.log('data_deletion', resource, { resourceId }, 'critical', resourceId, userId)
  }

  public logLogin(userId: string, success: boolean): void {
    this.log(
      success ? 'login_success' : 'login_failure',
      'authentication',
      { success },
      success ? 'info' : 'warning',
      undefined,
      userId
    )
  }

  public logLogout(userId: string): void {
    this.log('logout', 'authentication', {}, 'info', undefined, userId)
  }

  public logPrivacyAction(action: string, userId: string, details?: Record<string, any>): void {
    this.log(`privacy_${action}`, 'privacy', details, 'info', undefined, userId)
  }

  public logComplianceEvent(event: string, details: Record<string, any>, userId?: string): void {
    this.log(event, 'compliance', details, 'warning', undefined, userId)
  }
}

export const auditLogger = new AuditLogger()

// React hook for easier usage
export function useAuditLogger() {
  return {
    logAction: auditLogger.log.bind(auditLogger),
    logDataAccess: auditLogger.logDataAccess.bind(auditLogger),
    logDataModification: auditLogger.logDataModification.bind(auditLogger),
    logDataDeletion: auditLogger.logDataDeletion.bind(auditLogger),
    logPrivacyAction: auditLogger.logPrivacyAction.bind(auditLogger),
    logComplianceEvent: auditLogger.logComplianceEvent.bind(auditLogger),
    getLogs: auditLogger.getLogs.bind(auditLogger),
  }
}
