export const checkAuditCount = async (email) => {
  try {
    const response = await fetch(`/api/audit-count?action=check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to check audit count');
    }

    return {
      success: true,
      data: {
        auditCount: data.auditCount,
        auditLimit: data.auditLimit,
        hasReachedLimit: data.hasReachedLimit,
        remainingAudits: data.remainingAudits,
      },
    };
  } catch (error) {
    console.error('Error checking audit count:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Increment user's audit count after successful audit
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Updated audit count information
 */
export const incrementAuditCount = async (email) => {
  try {
    const response = await fetch(`/api/audit-count?action=increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to increment audit count');
    }

    return {
      success: true,
      data: {
        auditCount: data.auditCount,
        auditLimit: data.auditLimit,
        hasReachedLimit: data.hasReachedLimit,
        remainingAudits: data.remainingAudits,
        message: data.message,
      },
    };
  } catch (error) {
    console.error('Error incrementing audit count:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Quick status check using GET method (lighter weight)
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Current audit status
 */
export const getAuditStatus = async (email) => {
  try {
    const response = await fetch(`/api/audit-count?email=${encodeURIComponent(email)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get audit status');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error getting audit status:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Validate if user can run audit before proceeding
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Validation result with status
 */
export const validateAuditPermission = async (email) => {
  const result = await checkAuditCount(email);
  
  if (!result.success) {
    return {
      canRunAudit: false,
      reason: 'Failed to verify audit limit',
      error: result.error,
    };
  }

  if (result.data.hasReachedLimit) {
    return {
      canRunAudit: false,
      reason: 'Audit limit reached',
      auditCount: result.data.auditCount,
      auditLimit: result.data.auditLimit,
    };
  }

  return {
    canRunAudit: true,
    auditCount: result.data.auditCount,
    auditLimit: result.data.auditLimit,
    remainingAudits: result.data.remainingAudits,
  };
};