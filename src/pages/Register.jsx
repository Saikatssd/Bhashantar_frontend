// import React, { useState } from 'react';
// import { toast } from 'react-hot-toast';
// import axios from 'axios';

// const Register = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [phoneNo, setPhoneNo] = useState('');
//   const [roleId, setRoleId] = useState('');
//   const [companyId, setCompanyId] = useState('');
//   const [isRegistering, setIsRegistering] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isRegistering) {
//       setIsRegistering(true);
//       try {
//         const response = await axios.post('http://localhost:5000/api/auth/createUser', {
//           email,
//           password,
//           name,
//           phoneNo,
//           roleId,
//           companyId,
//         });

//         toast.success('Registration Successful');
//         // Perform any additional actions such as navigation
//       } catch (error) {
//         console.error('Error registering user:', error);
//         toast.error(error.response?.data?.error || error.message);
//       } finally {
//         setIsRegistering(false);
//       }
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100">
//       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
//         <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>
//         <form className="space-y-4" onSubmit={handleSubmit}>
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               id="name"
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700">
//               Phone No
//             </label>
//             <input
//               id="phoneNo"
//               type="text"
//               value={phoneNo}
//               onChange={(e) => setPhoneNo(e.target.value)}
//               required
//               className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
//               Role ID
//             </label>
//             <input
//               id="roleId"
//               type="text"
//               value={roleId}
//               onChange={(e) => setRoleId(e.target.value)}
//               required
//               className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
//               Company ID
//             </label>
//             <input
//               id="companyId"
//               type="text"
//               value={companyId}
//               onChange={(e) => setCompanyId(e.target.value)}
//               required
//               className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={isRegistering}
//             className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             {isRegistering ? 'Registering...' : 'Register'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;




import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { server } from '../main';
import { handleSendVerificationEmail, handleSignUp } from '../utils/auth';
import Sidebar from '../components/ClientCompany/Sidebar';

const Register = (instanceCompanyId) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [roleId, setRoleId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);


  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhoneNo('');
    setRoleId('');
    setCompanyId('');
  };

  useEffect(() => {
    // Fetch roles and companies when the component mounts
    const fetchRolesAndCompanies = async () => {
      try {
        const rolesResponse = await axios.get(`${server}/api/role/getAllRoles`);
        setRoles(rolesResponse.data);

        const companiesResponse = await axios.get(`${server}/api/company`);
        setCompanies(companiesResponse.data);
      } catch (error) {
        console.error('Error fetching roles or companies:', error);
        toast.error('Error fetching roles or companies');
      }
    };

    fetchRolesAndCompanies();
  }, []);


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!isRegistering) {
  //     setIsRegistering(true);
  //     try {

  //       const userCredential = await handleSignUp(email, password);
  //       const user = userCredential.user;
  //       console.log('User created successfully:', user);

  //       // Send email verification
  //       try {
  //         await handleSendVerificationEmail(user);
  //         toast.success('Registration Successful! Please check your email for a verification link.');
  //       } catch (error) {
  //         console.error('Error sending email verification:', error);
  //         toast.error('An error occurred while sending verification email. Please try again later.');
  //       }


  //       const registrationData = {
  //         email,
  //         name,
  //         phoneNo,
  //         roleId,
  //         companyId,
  //       };
  //       try {
  //         const response = await axios.post(`${server}/api/auth/createUser`, registrationData);
  //         console.log('User data sent to backend:', response.data);
  //       } catch (error) {
  //         console.error('Error sending user data to backend:', error);
  //         let message = 'An error occurred while creating your account.';
  //         toast.error(message);
  //       }

  //       resetForm();
  //     } catch (error) {
  //       console.error('Error creating user:', error);
  //       let message = 'An error occurred. Please try again.';

  //       switch (error.code) {
  //         case 'auth/email-already-in-use':
  //           message = 'The email address is already in use.';
  //           break;
  //         case 'auth/weak-password':
  //           message = 'The password is not strong enough.';
  //           break;
  //         case 'auth/invalid-email':
  //           message = 'The email address is not valid.';
  //           break;
  //         case 'auth/operation-not-allowed':
  //           message = 'This operation is not allowed. Please contact support.';
  //           break;
  //         case 'auth/too-many-requests':
  //           message = 'Too many register attempts. Please try again later.';
  //           break;
  //         case 'auth/network-request-failed':
  //           message = 'Check your internet connection.';
  //           break;
  //         default:
  //           message = error.message || message;
  //       }

  //       toast.error(message);
  //     } finally {
  //       setIsRegistering(false);
  //     }
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      try {


        const response = await axios.post(
          `${server}/api/auth/createUser`,
          {
            email,
            password,
            name,
            phoneNo,
            roleId,
            companyId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        toast.success('Registration Successful');
        resetForm();
      } catch (error) {
        console.error(error);
        let message = "An error occurred. Please try again.";

        // Check for backend error messages
        if (error.response && error.response.data) {
          message = error.response.data.error || message;
        } else {
          message = error.message || message;
        }

        toast.error(message);
      } finally {
        setIsRegistering(false);
      }
    }
  };


  return (
    <div className='flex w-full  '>
      {/* <Sidebar role='superAdmin'/> */}

      {/* Main content */}
      <div className='w-full flex justify-center bg-slate-200'>

        <div className="flex w-4/5 h-screen items-center justify-center ">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  minLength='6'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700">
                  Phone No
                </label>
                <input
                  id="phoneNo"
                  type="text"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="roleId"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="" disabled>Select a role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <select
                  id="companyId"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="" disabled>Select a company</option>
                  {companies.filter(doc => doc.data().id !== instanceCompanyId ).map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isRegistering ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;
