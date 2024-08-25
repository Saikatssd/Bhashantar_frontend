import React, { useEffect, useState } from "react";
import Sidebar from "../../components/ClientCompany/Sidebar";
import { fetchUserNameById } from "../../utils/firestoreUtil";
import { fetchClientUserProjectsCount } from "../../services/projectServices";

export default function userHome({ companyId, userId }) {
  const [userName, setUserName] = useState("");
  const [projectCounts, setProjectCounts] = useState({
    pendingCount: 0,
    completedCount: 0,
    underReviewCount: 0,
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const userName = await fetchUserNameById(userId);
        setUserName(userName);

        const counts = await fetchClientUserProjectsCount(userId);
        setProjectCounts(counts);
        console.log(projectCounts);
      } catch (error) {
        console.error("Error loading user project counts:", error);
      }
    };

    fetchContent();
  }, [userId]);
  return (
    <div className="flex">
      <Sidebar companyId={companyId} role={"user"} />
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

        <div className="backdrop-blur-sm shadow-xl bg-white/30 mt-10 rounded-xl mx-auto">
          <div className="flex justify-between py-5">
            <div className="flex justify p-5 ">
              <div
                className="w-24 h-24 rounded-xl text-center flex justify-center items-center text-4xl text-red-500 font-bold"
                style={{ background: "rgba(249, 145, 145, 0.5)" }}
              >
                {projectCounts.pendingCount}
              </div>
              <div className="ml-5 my-auto ">
                <p className="text-xl font-bold">Pending Works </p>
              </div>
            </div>
            <div className="flex justify p-5">
              <div
                className="w-24 h-24 bg-[#e3d2fa] rounded-xl text-center flex justify-center items-center text-4xl text-green-500 font-bold"
                style={{ background: "rgba(191, 249, 191, 0.5)" }}
              >
                {projectCounts.completedCount}
              </div>
              <div className="ml-5 my-auto ">
                <p className="text-xl font-bold">Completed Works </p>
              </div>
            </div>
            <div className="flex justify p-5">
              <div
                className="w-24 h-24 bg-[#e3d2fa] rounded-xl text-center flex justify-center items-center text-4xl text-yellow-500 font-bold"
                style={{ background: "rgba(249, 246, 191, 0.5)" }}
              >
                {projectCounts.underReviewCount}
              </div>
              <div className="ml-5 my-auto ">
                <p className="text-xl font-bold">Downloaded</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
