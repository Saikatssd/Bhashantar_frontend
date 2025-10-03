import { useState, useEffect, useCallback } from "react";
import { fetchNotificationCounts } from "../services/projectServices";

const useNotificationCounts = (companyId, refreshInterval = 30000) => {
  const [notificationData, setNotificationData] = useState({
    projectCounts: {},
    totalNotifications: 0,
    projectsWithNotifications: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCounts = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchNotificationCounts(companyId);
      setNotificationData(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching notification counts:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Initial fetch
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Set up periodic refresh
  useEffect(() => {
    if (!companyId || refreshInterval <= 0) return;

    const interval = setInterval(fetchCounts, refreshInterval);
    return () => clearInterval(interval);
  }, [companyId, refreshInterval, fetchCounts]);

  // Function to manually refresh
  const refresh = useCallback(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Function to get count for specific project
  const getProjectCount = useCallback(
    (projectId) => {
      return notificationData.projectCounts[projectId] || 0;
    },
    [notificationData.projectCounts]
  );

  return {
    ...notificationData,
    loading,
    error,
    refresh,
    getProjectCount,
  };
};

export default useNotificationCounts;
