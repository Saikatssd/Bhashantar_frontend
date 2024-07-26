import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ role, onLogout }) => {
  useEffect(() => {

    console.log("Role in Dashboard", role)
  }, [])

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={onLogout}>Logout</button>
      {role === 'superAdmin' && (
        <div>
          <Link to="/create-company">Create Company</Link>
        </div>
      )}
      {role !== 'companyUser' && (
        <div>
          <Link to="/project">Manage Projects</Link>
        </div>
      )}
      {role === 'companyUser' && (
        <div>
          <Link to="/workflow">Document Workflow</Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


// // src/components/Dashboard.js

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { server } from '../main'
// const Dashboard = () => {
//   const [data, setData] = useState(null);
//   const [role, setRole] = useState('');
//   const navigate = useNavigate();



//   useEffect(() => {
//     const currentUser = firebase.auth().currentUser;
//     if (!currentUser) {
//       console.error('No user signed in');
//       return;
//     }

//     // Get the Firebase ID token
//     const idToken = currentUser.getIdToken();

//     // Fetch user profile to determine role
//     axios.get(`${server}/api/auth/getUserProfile`, {
//       headers: {
//         Authorization: `Bearer ${idToken}`
//       }
//     })
//       .then(response => {
//         setRole(response.data.role);
//         // Fetch data based on role
//         let endpoint;
//         switch (response.data.role) {
//           case 'superAdmin':
//             endpoint = `${server}/api/dashboard/superAdmin`;
//             break;
//           case 'companyAdmin':
//             endpoint = `${server}/api/dashboard/companyAdmin`;
//             break;
//           case 'companyUser':
//             endpoint = `${server}/api/dashboard/companyUser`;
//             break;
//           default:
//             navigate('/');
//         }
//         return axios.get(endpoint);
//       })
//       .then(response => {
//         setData(response.data);
//       })
//       .catch(error => {
//         console.error('Error fetching dashboard data:', error);
//       });
//   }, [navigate]);

//   return (
//     <div className="flex">
//       <Sidebar role={role} />
//       <div className="p-4 w-full">
//         {role === 'superAdmin' && <SuperAdminDashboard data={data} />}
//         {role === 'companyAdmin' && <CompanyAdminDashboard data={data} />}
//         {role === 'companyUser' && <CompanyUserDashboard data={data} />}
//       </div>
//     </div>
//   );
// };

// const Sidebar = ({ role }) => (
//   <div className="w-64 bg-gray-800 text-white">
//     <div className="p-4">
//       <h2 className="text-2xl font-bold">Dashboard</h2>
//     </div>
//     <nav>
//       <ul>
//         {role === 'superAdmin' && (
//           <li className="p-4 hover:bg-gray-700">Companies</li>
//         )}
//         {role === 'companyAdmin' && (
//           <li className="p-4 hover:bg-gray-700">Projects</li>
//         )}
//         {role === 'companyUser' && (
//           <li className="p-4 hover:bg-gray-700">Tasks</li>
//         )}
//       </ul>
//     </nav>
//   </div>
// );

// const SuperAdminDashboard = ({ data }) => (
//   <div>
//     <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
//     <ul>
//       {data?.companies?.map((company, index) => (
//         <li key={index} className="p-2 border-b">{company.name}</li>
//       ))}
//     </ul>
//   </div>
// );

// const CompanyAdminDashboard = ({ data }) => (
//   <div>
//     <h1 className="text-3xl font-bold">Company Admin Dashboard</h1>
//     <ul>
//       {data?.projects?.map((project, index) => (
//         <li key={index} className="p-2 border-b">{project.name}</li>
//       ))}
//     </ul>
//   </div>
// );

// const CompanyUserDashboard = ({ data }) => (
//   <div>
//     <h1 className="text-3xl font-bold">Company User Dashboard</h1>
//     <ul>
//       {data?.tasks?.map((task, index) => (
//         <li key={index} className="p-2 border-b">{task.name}</li>
//       ))}
//     </ul>
//   </div>
// );

// export default Dashboard;



// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { auth } from "../utils/firebase";
// import { server } from '../main';

// const Dashboard = () => {
//   const [data, setData] = useState(null);
//   const [role, setRole] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const currentUser = auth.currentUser;
//         if (!currentUser) {
//           console.error('No user signed in');
//           return;
//         }

//         // Get the Firebase ID token
//         const idToken = await currentUser.getIdToken();

//         // Fetch user profile to determine role
//         const userProfileResponse = await axios.get(`${server}/api/auth/getUserProfile`, {
//           headers: {
//             Authorization: `Bearer ${idToken}`
//           }
//         });
//         const userRole = userProfileResponse.data.role;
//         setRole(userRole);

//         // Fetch data based on role
//         let endpoint;
//         switch (userRole) {
//           case 'superAdmin':
//             endpoint = `${server}/api/dashboard/superAdmin`;
//             break;
//           case 'companyAdmin':
//             endpoint = `${server}/api/dashboard/companyAdmin`;
//             break;
//           case 'companyUser':
//             endpoint = `${server}/api/dashboard/companyUser`;
//             break;
//           default:
//             navigate('/');
//             return;
//         }

//         // Fetch data based on determined endpoint
//         const dashboardDataResponse = await axios.get(endpoint, {
//           headers: {
//             Authorization: `Bearer ${idToken}`
//           }
//         });
//         setData(dashboardDataResponse.data);
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//       }
//     };

//     fetchDashboardData();
//   }, [navigate]);

//   return (
//     <div className="flex">
//       <Sidebar role={role} />
//       <div className="p-4 w-full">
//         {role === 'superAdmin' && <SuperAdminDashboard data={data} />}
//         {role === 'companyAdmin' && <CompanyAdminDashboard data={data} />}
//         {role === 'companyUser' && <CompanyUserDashboard data={data} />}
//       </div>
//     </div>
//   );
// };

// const Sidebar = ({ role }) => (
//   <div className="w-64 bg-gray-800 text-white">
//     <div className="p-4">
//       <h2 className="text-2xl font-bold">Dashboard</h2>
//     </div>
//     <nav>
//       <ul>
//         {role === 'superAdmin' && (
//           <li className="p-4 hover:bg-gray-700">Companies</li>
//         )}
//         {role === 'companyAdmin' && (
//           <li className="p-4 hover:bg-gray-700">Projects</li>
//         )}
//         {role === 'companyUser' && (
//           <li className="p-4 hover:bg-gray-700">Tasks</li>
//         )}
//       </ul>
//     </nav>
//   </div>
// );

// const SuperAdminDashboard = ({ data }) => (
//   <div>
//     <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
//     <ul>
//       {data?.companies?.map((company, index) => (
//         <li key={index} className="p-2 border-b">{company.name}</li>
//       ))}
//     </ul>
//   </div>
// );

// const CompanyAdminDashboard = ({ data }) => (
//   <div>
//     <h1 className="text-3xl font-bold">Company Admin Dashboard</h1>
//     <ul>
//       {data?.projects?.map((project, index) => (
//         <li key={index} className="p-2 border-b">{project.name}</li>
//       ))}
//     </ul>
//   </div>
// );

// const CompanyUserDashboard = ({ data }) => (
//   <div>
//     <h1 className="text-3xl font-bold">Company User Dashboard</h1>
//     <ul>
//       {data?.tasks?.map((task, index) => (
//         <li key={index} className="p-2 border-b">{task.name}</li>
//       ))}
//     </ul>
//   </div>
// );

// export default Dashboard;






// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { auth } from "../utils/firebase";
// import { server } from '../main';

// const Dashboard = ({ user, onLogout }) => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         if (!user) {
//           navigate('/');
//           return;
//         }

//         const idToken = await user.getIdToken();

//         const userProfileResponse = await axios.get(`${server}/api/auth/getUserProfile`, {
//           headers: {
//             Authorization: `Bearer ${idToken}`
//           }
//         });

//         const userRole = userProfileResponse.data.role;

//         let endpoint;
//         switch (userRole) {
//           case 'superAdmin':
//             endpoint = `${server}/api/dashboard/superAdmin`;
//             break;
//           case 'companyAdmin':
//             endpoint = `${server}/api/dashboard/companyAdmin`;
//             break;
//           case 'companyUser':
//             endpoint = `${server}/api/dashboard/companyUser`;
//             break;
//           default:
//             navigate('/');
//             return;
//         }

//         const dashboardDataResponse = await axios.get(endpoint, {
//           headers: {
//             Authorization: `Bearer ${idToken}`
//           }
//         });

//         setData(dashboardDataResponse.data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//         setError('Error fetching dashboard data.');
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [user, navigate]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   return (
//     <div className="flex">
//       <Sidebar role={user.role} />
//       <div className="p-4 w-full">
//         {user.role === 'superAdmin' && <SuperAdminDashboard data={data} />}
//         {user.role === 'companyAdmin' && <CompanyAdminDashboard data={data} />}
//         {user.role === 'companyUser' && <CompanyUserDashboard data={data} />}
//       </div>
//     </div>
//   );
// };

// const Sidebar = ({ role }) => (
//   <div className="w-64 bg-gray-800 text-white">
//     <div className="p-4">
//       <h2 className="text-2xl font-bold">Dashboard</h2>
//     </div>
//     <nav>
//       <ul>
//         {role === 'superAdmin' && (
//           <li className="p-4 hover:bg-gray-700">Companies</li>
//         )}
//         {role === 'companyAdmin' && (
//           <li className="p-4 hover:bg-gray-700">Projects</li>
//         )}
//         {role === 'companyUser' && (
//           <li className="p-4 hover:bg-gray-700">Tasks</li>
//         )}
//       </ul>
//     </nav>
//   </div>
// );

// const SuperAdminDashboard = ({ data }) => (
//   <div>
//     <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
//     <ul>
//       {data?.companies?.map((company, index) => (
//         <li key={index} className="p-2 border-b">{company.name}</li>
//       ))}
//     </ul>
//   </div>
// );

// const CompanyAdminDashboard = ({ data }) => (
//   <div>
//     <h1 className="text-3xl font-bold">Company Admin Dashboard</h1>
//     <ul>
//       {data?.projects?.map((project, index) => (
//         <li key={index} className="p-2 border-b">{project.name}</li>
//       ))}
//     </ul>
//   </div>
// );

// const CompanyUserDashboard = ({ data }) => (
//   <div>
//     <h1 className="text-3xl font-bold">Company User Dashboard</h1>
//     <ul>
//       {data?.tasks?.map((task, index) => (
//         <li key={index} className="p-2 border-b">{task.name}</li>
//       ))}
//     </ul>
//   </div>
// );

// export default Dashboard;
