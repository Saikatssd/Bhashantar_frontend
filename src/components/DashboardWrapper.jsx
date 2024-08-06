import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import UserHome from '../pages/Users/UserHome';
import AdminHome from '../pages/Admin/AdminHome';
import SuperAdminHome from '../pages/SuperAdmin/SuperAdminHome';
import QAHome from '../pages/QA/QAHome';
import KyroticsUserHome from '../pages/Users/KyroticsUserHome';
import KyroticsAdminHome from '../pages/Admin/KyroticsAdminHome';

const DashboardWrapper = () => {

    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [companyId, setCompanyId] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const token = await user.getIdTokenResult();
                // console.log(token)
                user.roleName = token.claims.roleName;
                user.companyId = token.claims.companyId;
                setUser(user);
                // console.log(user)
                setRole(user.roleName);
                setCompanyId(user.companyId);

            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);


    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/" />;
    }


    if (companyId === 'cvy2lr5H0CUVH8o2vsVk') {
        if (role === 'user') {
            return <KyroticsUserHome userCompanyId={companyId} />;
        }
        if (role === 'admin') {
            return <KyroticsAdminHome companyId={companyId} role={role} />;
        }
        if (role === 'QA') {
            return <QAHome companyId={companyId} />;
        }

    }

    // Allow specific company user to access SuperAdminHome
    // if (role === 'user' && companyId === 'cvy2lr5H0CUVH8o2vsVk') {
    //     return <SuperAdminHome />;
    // }

    if (role === 'user') {
        return <UserHome companyId={companyId} />;
    }
    if (role === 'admin') {
        return <AdminHome companyId={companyId} />;
    }
    if (role === 'superAdmin') {
        return <SuperAdminHome />;
    }

    return <Navigate to="/dashboard" />;
};

export default DashboardWrapper;
