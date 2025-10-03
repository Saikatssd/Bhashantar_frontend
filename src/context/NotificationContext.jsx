import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { fetchNotificationCounts } from "../services/projectServices";
import { kyroCompanyId } from "../services/companyServices";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notificationData, setNotificationData] = useState({
    projectCounts: {},
    totalNotifications: 0,
    projectsWithNotifications: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  // Get company ID when user changes
  useEffect(() => {
    const getCompanyId = async () => {
      if (currentUser) {
        try {
          const id = await kyroCompanyId();
          setCompanyId(id);
        } catch (err) {
          console.error("Error getting company ID:", err);
        }
      }
    };
    getCompanyId();
  }, [currentUser]);

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

  // Initial fetch when company ID is available
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Set up periodic refresh every 30 seconds
  useEffect(() => {
    if (!companyId) return;

    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [companyId, fetchCounts]);

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

  // Function to check if any project has notifications
  const hasAnyNotifications = useCallback(() => {
    return notificationData.totalNotifications > 0;
  }, [notificationData.totalNotifications]);

  const value = {
    ...notificationData,
    loading,
    error,
    refresh,
    getProjectCount,
    hasAnyNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
