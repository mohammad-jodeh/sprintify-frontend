import { protectedApi } from "./config";

/**
 * Get all automation rules for a project
 */
export const getRules = async (projectId) => {
  const response = await protectedApi.get(
    `/projects/${projectId}/automation-rules`
  );
  // Backend returns { message, data: [...] }
  return response.data.data || response.data || [];
};

/**
 * Get single automation rule
 */
export const getRule = async (projectId, ruleId) => {
  const response = await protectedApi.get(
    `/projects/${projectId}/automation-rules/${ruleId}`
  );
  // Backend returns { message, data: {...} }
  return response.data.data || response.data;
};

/**
 * Create automation rule
 */
export const createRule = async (projectId, data) => {
  const response = await protectedApi.post(
    `/projects/${projectId}/automation-rules`,
    data
  );
  // Backend returns { message, data: {...} }
  return response.data.data || response.data;
};

/**
 * Update automation rule
 */
export const updateRule = async (projectId, ruleId, data) => {
  const response = await protectedApi.patch(
    `/projects/${projectId}/automation-rules/${ruleId}`,
    data
  );
  // Backend returns { message, data: {...} }
  return response.data.data || response.data;
};

/**
 * Delete automation rule
 */
export const deleteRule = async (projectId, ruleId) => {
  const response = await protectedApi.delete(
    `/projects/${projectId}/automation-rules/${ruleId}`
  );
  return response.data;
};

/**
 * Toggle rule active status
 */
export const toggleRuleStatus = async (projectId, ruleId) => {
  const response = await protectedApi.patch(
    `/projects/${projectId}/automation-rules/${ruleId}/toggle`
  );
  // Backend returns { message, data: {...} }
  return response.data.data || response.data;
};

/**
 * Get automation statistics
 */
export const getStats = async (projectId) => {
  const response = await protectedApi.get(
    `/projects/${projectId}/automation-rules-stats`
  );
  // Backend returns { message, data: {...} } or just { ... }
  return response.data.data || response.data;
};

