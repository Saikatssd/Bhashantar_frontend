import React, { useState, useEffect } from "react";
import { useParams, Route, Routes } from "react-router-dom";
import { auth } from "../utils/firebase";
import PermissionsManage from "../pages/PemissionManage";
import RoleManage from "../pages/RoleManage";
import UserManage from "../pages/UserManage";
import KyroSidebar from "./Kyrotics/KyroSidebar";
import Profile from "../pages/Profile";
import ClientCompanies from "./Kyrotics/ClientCompanies";
import ClientProjects from "./Kyrotics/ClientProjects";
import KyroAdminFileFlow from "./Kyrotics/KyroAdminFileFlow";
import KyroUserFileAssign from "./Kyrotics/KyroUserFileAssign";
import KyroUserWorkspace from "./Kyrotics/KyroUserWorkspace";
import QAWorkspace from "../pages/QA/QAWorkspace";
import FileStatusManager from "./FileStatusManager";
import Register from "../pages/Register";

export default function KyroInstance({ role }) {
  const [userCompanyId, setUserCompanyId] = useState("");

  const { companyId } = useParams();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        // console.log(token)
        user.roleName = token.claims.roleName;
        user.companyId = token.claims.companyId;

        // setRole(user.roleName);
        setUserCompanyId(user.companyId);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex">
      <KyroSidebar companyId={companyId} role={role} />
      <div className="flex-grow">
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="project" element={<ClientProjects />} />
          <Route path="clientCompanies" element={<ClientCompanies />} />

          {role === "user" && (
            <>
              <Route path="/myWork" element={<KyroUserWorkspace />} />
              <Route
                path="project/:projectId"
                element={<KyroUserFileAssign />}
              />
            </>
          )}
          {role === "QA" && (
            <>
              <Route path="project/:projectId" element={<QAWorkspace />} />
            </>
          )}

          {role !== "user" && role !== "QA" && (
            <>
              <Route
                path="project/:projectId"
                element={<KyroAdminFileFlow />}
              />
              <Route path="clientCompanies" element={<ClientCompanies />} />
              <Route path="permissionManage" element={<PermissionsManage />} />
              <Route path="roleManage" element={<RoleManage />} />
              <Route path="fileStatus" element={<FileStatusManager />} />
              <Route
                path="userManage"
                element={<UserManage companyId={userCompanyId} />}
              />
            </>
          )}
          {role === "superAdmin" && (
            <Route
              path="/register"
              element={<Register instanceCompanyId={companyId} />}
            />
          )}
        </Routes>
      </div>
    </div>
  );
}
