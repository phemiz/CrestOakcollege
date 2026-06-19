import db from './db';

interface AuditLogOptions {
  userId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PUBLISH_RESULTS' | 'RECORD_PAYMENT';
  entity: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(options: AuditLogOptions) {
  try {
    // We log through standard client db
    await db.auditLog.create({
      data: {
        userId: options.userId || null,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId || null,
        oldValues: options.oldValues ? JSON.parse(JSON.stringify(options.oldValues)) : null,
        newValues: options.newValues ? JSON.parse(JSON.stringify(options.newValues)) : null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
