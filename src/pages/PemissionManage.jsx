
import { server } from '../main'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import Sidebar from '../components/ClientCompany/Sidebar';


const PermissionsManager = () => {
  const [permissions, setPermissions] = useState({
    users: { read: false, create: false, update: false, delete: false },
    documents: { read: false, create: false, update: false, delete: false, assign: false },
  });

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [allPermissions, setAllPermissions] = useState([]);

  const handleCheckboxChange = (resource, action) => {
    setPermissions(prevPermissions => ({
      ...prevPermissions,
      [resource]: { ...prevPermissions[resource], [action]: !prevPermissions[resource][action] },
    }));
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${server}/api/role/getAllRoles`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${server}/api/permission/getAllPermissions`);
      setAllPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const createPermission = async () => {
    try {
      await axios.post(`${server}/api/permission/createPermission`, { roleId: selectedRole, permissions });
      fetchPermissions();
    } catch (error) {
      console.error('Error creating permission:', error);
    }
  };

  const updatePermission = async () => {
    try {
      await axios.put(`${server}/api/permission/updatePermission`, { roleId: selectedRole, permissions });
      fetchPermissions();
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const getRoleNameById = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  return (
    <div className='flex p-6'>
      {/* <Sidebar/> */}
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Permissions Manager</h1>
      <div className='flex'>
        <div className="container">

          <div className="mb-4 pr-4">
            <label className="block text-lg font-semibold mb-2">Select Role</label>
            <select
              className="p-2 w-1/2 border rounded"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <h2 className="text-lg font-semibold mb-1">Users Permissions</h2>
            {['read', 'create', 'update', 'delete'].map((action) => (
              <label key={action} className="block">
                <Checkbox
                  checked={permissions.users[action]}
                  onChange={() => handleCheckboxChange('users', action)}
                />
                <span className="ml-2 capitalize">{action}</span>
              </label>
            ))}
          </div>

          <div className="mb-3">
            <h2 className="text-lg font-semibold mb-2">Documents Permissions</h2>
            {['read', 'create', 'update', 'delete', 'assign'].map((action) => (
              <label key={action} className="block">
                <Checkbox
                  checked={permissions.documents[action]}
                  onChange={() => handleCheckboxChange('documents', action)}
                />
                <span className="ml-2 capitalize">{action}</span>
              </label>
            ))}
          </div>

          <div className="flex space-x-4 mb-8">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={createPermission}
            >
              Create Permission
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={updatePermission}
            >
              Update Permission
            </button>
          </div>
        </div>

        <div className="container">
          <div>
            <h2 className="text-xl font-semibold mb-4">All Permissions</h2>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Role Name</TableCell>
                    <TableCell>Users Permissions</TableCell>
                    <TableCell>Documents Permissions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allPermissions.map((perm) => (
                    <TableRow key={perm.id}>
                      <TableCell>{getRoleNameById(perm.roleId)}</TableCell>
                      <TableCell>
                        {Object.keys(perm.permissions.users).map((action) =>
                          perm.permissions.users[action] ? (
                            <div key={action} className="flex items-center space-x-2">
                              <CheckCircle className="text-green-500" />
                              <span>{action}</span>
                            </div>
                          ) : (
                            <div key={action} className="flex items-center space-x-2">
                              <Cancel className="text-red-500" />
                              <span>{action}</span>
                            </div>
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        {Object.keys(perm.permissions.documents).map((action) =>
                          perm.permissions.documents[action] ? (
                            <div key={action} className="flex items-center space-x-2">
                              <CheckCircle className="text-green-500" />
                              <span>{action}</span>
                            </div>
                          ) : (
                            <div key={action} className="flex items-center space-x-2">
                              <Cancel className="text-red-500" />
                              <span>{action}</span>
                            </div>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PermissionsManager;
