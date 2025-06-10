export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export class AuditLogger {
  private static logs: AuditLog[] = [];

  static log(
    userId: string,
    action: string,
    resource: string,
    details: any = {},
    riskLevel: 'low' | 'medium' | 'high' = 'low'
  ): void {
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      userId,
      action,
      resource,
      details,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      riskLevel
    };

    this.logs.push(auditLog);
    this.persistLog(auditLog);
    
    // Alert on high-risk activities
    if (riskLevel === 'high') {
      this.alertSecurity(auditLog);
    }
  }

  private static getClientIP(): string {
    // In production, this would be obtained from the server
    return 'Client-Side-IP';
  }

  private static persistLog(log: AuditLog): void {
    const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    existingLogs.push(log);
    
    // Keep only last 1000 logs for performance
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem('audit_logs', JSON.stringify(existingLogs));
  }

  private static alertSecurity(log: AuditLog): void {
    console.warn('High-risk security event:', log);
    // In production, this would send alerts to security team
  }

  static getLogs(userId?: string, startDate?: Date, endDate?: Date): AuditLog[] {
    const allLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    
    return allLogs.filter((log: AuditLog) => {
      if (userId && log.userId !== userId) return false;
      if (startDate && new Date(log.timestamp) < startDate) return false;
      if (endDate && new Date(log.timestamp) > endDate) return false;
      return true;
    });
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}
