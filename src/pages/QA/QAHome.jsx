import React, { useState, useEffect } from "react";
import KyroSidebar from "../../components/Kyrotics/KyroSidebar";
import { fetchUserNameById } from "../../utils/firestoreUtil";

const QAHome = ({ companyId, userId }) => {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const userName = await fetchUserNameById(userId);
        setUserName(userName);
        console
      } catch (error) {
        console.error("Error fetcing user name:", error);
      }
    };
    fetchContent();
  }, [userId]);
  return (
    <div className="flex">
      <KyroSidebar companyId={companyId} role={"QA"} />
      <div className="flex-1 p-4">
          <div className="backdrop-blur-sm shadow-xl bg-[#e3d2fa]/[0.6]  mt-10 rounded-xl p-6">
            <div className="flex justify-between">
              <div className="my-auto">
                <h1 className="text-3xl font-bold py-5">
                  Hi ! &nbsp;{userName}&nbsp; &nbsp;👋 ,
                </h1>
                <p className="py-4 text-md">
                  Welcome to your daily tasks. Let's get you started for the day!
                </p>
              </div>
              <img src="user.png" alt="user" className="w-80" />
            </div>
          </div>
      </div>
    </div>
  );
};

export default QAHome;
