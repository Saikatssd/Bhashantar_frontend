import React from 'react'
import KyroSidebar from '../../components/Kyrotics/KyroSidebar'

export default function KyroticsAdminHome({companyId}) {
    return (
        <div className="flex">
            <KyroSidebar companyId={companyId} role={'admin'} />
            <div className="flex-1 p-4">
                <h1 className="text-2xl font-bold">Admin Home for Company: {companyId}</h1>
            </div>
        </div>
    )
}
