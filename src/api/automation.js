import { protectedApi } from "./config";

const LOG_PREFIX = "[🤖 AUTOMATION-API]";

/**
 * Get all automation rules for a project
 */
export const getRules = async (projectId) => {
  try {
    console.log(`${LOG_PREFIX} 📋 Fetching rules for project: ${projectId}`);
    const response = await protectedApi.get(
      `/projects/${projectId}/automation-rules`
    );
    const data = response.data.data || response.data || [];
    console.log(`${LOG_PREFIX} ✅ Rules fetched successfully:`, {
      count: Array.isArray(data) ? data.length : 0,
      data: data,
      rawResponse: response.data
    });
    return data;
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Failed to fetch rules:`, {
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data,
      fullError: error
    });
    throw error;
  }
};

/**
 * Get single automation rule
 */
export const getRule = async (projectId, ruleId) => {
  try {
    console.log(`${LOG_PREFIX} 📄 Fetching rule ${ruleId} for project: ${projectId}`);
    const response = await protectedApi.get(
      `/projects/${projectId}/automation-rules/${ruleId}`
    );
    const data = response.data.data || response.data;
    console.log(`${LOG_PREFIX} ✅ Rule fetched successfully:`, data);
    return data;
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Failed to fetch rule ${ruleId}:`, error);
    throw error;
  }
};

/**
 * Create automation rule
 */
export const createRule = async (projectId, data) => {
  try {
    console.log(`${LOG_PREFIX} ➕ Creating rule for project: ${projectId}`, {
      ruleName: data.name,
      triggerType: data.triggerType,
      actionType: data.actionType,
      fullData: data
    });
    const response = await protectedApi.post(
      `/projects/${projectId}/automation-rules`,
      data
    );
    const resultData = response.data.data || response.data;
    console.log(`${LOG_PREFIX} ✅ Rule created successfully:`, {
      ruleId: resultData?.id,
      ruleName: resultData?.name,
      data: resultData
    });
    return resultData;
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Failed to create rule:`, {
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data,
      sentData: data,
      fullError: error
    });
    throw error;
  }
};

/**
 * Update automation rule
 */
export const updateRule = async (projectId, ruleId, data) => {
  try {
    console.log(`${LOG_PREFIX} ✏️ Updating rule ${ruleId} for project: ${projectId}`, {
      ruleName: data.name,
      fullData: data
    });
    const response = await protectedApi.patch(
      `/projects/${projectId}/automation-rules/${ruleId}`,
      data
    );
    const resultData = response.data.data || response.data;
    console.log(`${LOG_PREFIX} ✅ Rule updated successfully:`, resultData);
    return resultData;
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Failed to update rule ${ruleId}:`, error);
    throw error;
  }
};

/**
 * Delete automation rule
 */
export const deleteRule = async (projectId, ruleId) => {
  try {
    console.log(`${LOG_PREFIX} 🗑️ Deleting rule ${ruleId} for project: ${projectId}`);
    const response = await protectedApi.delete(
      `/projects/${projectId}/automation-rules/${ruleId}`
    );
    console.log(`${LOG_PREFIX} ✅ Rule deleted successfully`);
    return response.data;
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Failed to delete rule ${ruleId}:`, error);
    throw error;
  }
};

/**
 * Toggle rule active status
 */
export const toggleRuleStatus = async (projectId, ruleId) => {
  try {
    console.log(`${LOG_PREFIX} 🔄 Toggling rule ${ruleId} status for project: ${projectId}`);
    const response = await protectedApi.patch(
      `/projects/${projectId}/automation-rules/${ruleId}/toggle`
    );
    const resultData = response.data.data || response.data;
    console.log(`${LOG_PREFIX} ✅ Rule status toggled. New status:`, resultData?.isActive);
    return resultData;
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Failed to toggle rule ${ruleId}:`, error);
    throw error;
  }
};

/**
 * Get automation statistics
 */
export const getStats = async (projectId) => {
  try {
    console.log(`${LOG_PREFIX} 📊 Fetching automation stats for project: ${projectId}`);
    const response = await protectedApi.get(
      `/projects/${projectId}/automation-rules-stats`
    );
    const data = response.data.data || response.data;
    console.log(`${LOG_PREFIX} ✅ Stats fetched successfully:`, data);
    return data;
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Failed to fetch stats:`, error);
    throw error;
  }
};

