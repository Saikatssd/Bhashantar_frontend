import React from 'react';
import KyroSidebar from '../../components/Kyrotics/KyroSidebar';

const QAHome = ({ companyId }) => {
    return (
        <div className="flex">
            <KyroSidebar companyId={companyId} role={'QA'} />
            <div className="flex-1 p-4">
                <h1 className="text-2xl font-bold">QA User Home for Company: {companyId}</h1>
            </div>
        </div>
    );
};

export default QAHome;
