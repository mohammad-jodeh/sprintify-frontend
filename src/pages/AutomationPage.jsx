import React, { useState, useEffect } from "react";
import { AlertCircle, Zap, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import AutomationRulesList from "../components/automation/AutomationRulesList";
import * as automationAPI from "../api/automation";
import * as statusAPI from "../api/statuses";
import * as projectAPI from "../api/project";

const AutomationPage = () => {
  const { projectId } = useParams();
  const [statuses, setStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageData();
  }, [projectId]);

  const loadPageData = async () => {
    try {
      setLoading(true);
      console.log("[AutomationPage] 🔄 Loading page data for project:", projectId);

      // Load statuses
      try {
        console.log("[AutomationPage] 📋 Fetching statuses...");
        const statusesData = await statusAPI.fetchStatuses({ projectId });
        const statusesArray = Array.isArray(statusesData) ? statusesData : [];
        console.log("[AutomationPage] ✅ Statuses loaded:", {
          count: statusesArray.length,
          statuses: statusesArray
        });
        setStatuses(statusesArray);
      } catch (error) {
        console.error("[AutomationPage] ❌ Failed to load statuses:", error);
        setStatuses([]);
      }

      // Load project members
      try {
        console.log("[AutomationPage] 👥 Fetching project members...");
        const projectData = await projectAPI.fetchProjectById(projectId);
        console.log("[AutomationPage] 📊 Project data received:", projectData);
        
        if (projectData?.members && Array.isArray(projectData.members)) {
          const normalizedUsers = projectData.members
            .map((member) => {
              const resolvedId = member?.userId || member?.user?.id;
              const resolvedName = member?.user?.fullName || member?.user?.name || member?.user?.email;
              const resolvedEmail = member?.user?.email;

              if (!resolvedId) {
                return null;
              }

              return {
                id: resolvedId,
                name: resolvedName || resolvedEmail || resolvedId,
                email: resolvedEmail,
              };
            })
            .filter(Boolean);

          console.log("[AutomationPage] ✅ Members loaded:", {
            count: normalizedUsers.length,
            members: normalizedUsers
          });
          setUsers(normalizedUsers);
        } else {
          console.warn("[AutomationPage] ⚠️ No members found in project data");
          setUsers([]);
        }
      } catch (error) {
        console.error("[AutomationPage] ❌ Failed to load project members:", error);
        setUsers([]);
      }

      // Load automation stats
      try {
        console.log("[AutomationPage] 📊 Fetching automation stats...");
        const statsData = await automationAPI.getStats(projectId);
        console.log("[AutomationPage] ✅ Stats loaded:", statsData);
        setStats(statsData);
      } catch (error) {
        console.error("[AutomationPage] ❌ Failed to load automation stats:", error);
        setStats(null);
      }

      console.log("[AutomationPage] ✅ All page data loaded successfully");
    } catch (error) {
      console.error("[AutomationPage] ❌ Fatal error loading page data:", error);
      toast.error("Failed to load page data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="e animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Zap size={28} />
          <h1 className="text-3xl font-bold">Automation & Workflows</h1>
        </div>
        <p className="text-purple-100">
          Create rules to automate repetitive tasks and streamline your project management
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Rules */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Active Rules
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.activeRules || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Zap className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          {/* Total Executions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Executions
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalExecutions || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Success Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.successRate ? `${stats.successRate.toFixed(1)}%` : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <AlertCircle className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
        <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium mb-1">How it works:</p>
          <p>
            Define triggers (e.g., "when status changes to Done") and actions (e.g., "automatically
            close the issue"). Rules execute automatically when conditions are met.
          </p>
        </div>
      </div>

      {/* Rules List */}
      <AutomationRulesList projectId={projectId} statuses={Array.isArray(statuses) ? statuses : []} users={Array.isArray(users) ? users : []} />
    </div>
  );
};

export default AutomationPage;
