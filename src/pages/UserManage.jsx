// // src/pages/UserManage.jsx
// import React, { useState, useEffect } from 'react';
// import { db } from '../utils/firebase';
// import {
//     Button,
//     IconButton,
//     MenuItem,
//     Select,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Paper,
//     Typography,
//     CircularProgress
// } from '@mui/material';
// import { Delete, Block, CheckCircle } from '@mui/icons-material';
// import { useParams } from 'react-router-dom';

// const UserManage = ({ companyId }) => {
//     const [users, setUsers] = useState([]);
//     const [roles, setRoles] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // const companyId = useParams();

//     useEffect(() => {
//         const fetchUsersAndRoles = async () => {
//             try {
//                 const usersSnapshot = await db.collection('users').where('companyId', '==', companyId).get();
//                 const usersData = usersSnapshot.docs.map(doc => ({
//                     id: doc.id,
//                     ...doc.data(),
//                 }));
//                 setUsers(usersData);

//                 const rolesSnapshot = await db.collection('roles').get();
//                 const rolesData = rolesSnapshot.docs.map(doc => ({
//                     id: doc.id,
//                     ...doc.data(),
//                 }));
//                 setRoles(rolesData);
//             } catch (error) {
//                 console.error('Error fetching users and roles:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUsersAndRoles();
//     }, [companyId]);

//     const handleRoleChange = async (userId, newRoleId) => {
//         try {
//             await db.collection('users').doc(userId).update({ roleId: newRoleId });
//             setUsers((prevUsers) =>
//                 prevUsers.map((user) =>
//                     user.id === userId ? { ...user, roleId: newRoleId } : user
//                 )
//             );
//         } catch (error) {
//             console.error('Error assigning role:', error);
//         }
//     };

//     const handleDisableUser = async (userId) => {
//         try {
//             await db.collection('users').doc(userId).update({ disabled: true });
//             setUsers((prevUsers) =>
//                 prevUsers.map((user) =>
//                     user.id === userId ? { ...user, disabled: true } : user
//                 )
//             );
//         } catch (error) {
//             console.error('Error disabling user:', error);
//         }
//     };

//     const handleDeleteUser = async (userId) => {
//         try {
//             await db.collection('users').doc(userId).delete();
//             setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
//         } catch (error) {
//             console.error('Error deleting user:', error);
//         }
//     };

//     if (loading) {
//         return <CircularProgress />;
//     }

//     return (
//         <div className="container mx-auto p-4">
//             <Typography variant="h4" className="text-2xl font-bold mb-4">
//                 Manage Users
//             </Typography>
//             <TableContainer component={Paper} className="shadow-md">
//                 <Table className="min-w-full" aria-label="users table">
//                     <TableHead className="bg-gray-100">
//                         <TableRow>
//                             <TableCell>Email</TableCell>
//                             <TableCell>Role</TableCell>
//                             <TableCell>Actions</TableCell>
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {users.map((user) => (
//                             <TableRow key={user.id}>
//                                 <TableCell>{user.email}</TableCell>
//                                 <TableCell>
//                                     <Select
//                                         value={user.roleId}
//                                         onChange={(e) => handleRoleChange(user.id, e.target.value)}
//                                         className="w-full"
//                                     >
//                                         {roles.map((role) => (
//                                             <MenuItem key={role.id} value={role.id}>
//                                                 {role.name}
//                                             </MenuItem>
//                                         ))}
//                                     </Select>
//                                 </TableCell>
//                                 <TableCell>
//                                     <IconButton onClick={() => handleDisableUser(user.id)} disabled={user.disabled} className="mr-2">
//                                         {user.disabled ? <CheckCircle className="text-green-500" /> : <Block className="text-red-500" />}
//                                     </IconButton>
//                                     <IconButton onClick={() => handleDeleteUser(user.id)} className="text-red-500">
//                                         <Delete />
//                                     </IconButton>
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </div>
//     );
// };

// export default UserManage;


// src/pages/UserManage.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import {
  Button,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { Delete, Block, CheckCircle } from '@mui/icons-material';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const UserManage = ({ companyId }) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        const usersQuery = query(collection(db, 'users'), where('companyId', '==', companyId));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);

        const rolesSnapshot = await getDocs(collection(db, 'roles'));
        const rolesData = rolesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoles(rolesData);
      } catch (error) {
        console.error('Error fetching users and roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndRoles();
  }, [companyId]);

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { roleId: newRoleId });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, roleId: newRoleId } : user
        )
      );
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const handleDisableUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { disabled: true });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, disabled: true } : user
        )
      );
    } catch (error) {
      console.error('Error disabling user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div className="container mx-auto p-8">
      <Typography variant="h4" className="text-xl font-bold mb-4 p-4">
        Manage Users
      </Typography>
      <TableContainer component={Paper} className="shadow-md">
        <Table className="min-w-full" aria-label="users table">
          <TableHead className="bg-gray-100">
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.roleId}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="w-full"
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDisableUser(user.id)} disabled={user.disabled} className="mr-2">
                    {user.disabled ? <CheckCircle className="text-green-500" /> : <Block className="text-red-500" />}
                  </IconButton>
                  <IconButton onClick={() => handleDeleteUser(user.id)} className="text-red-500">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default UserManage;
