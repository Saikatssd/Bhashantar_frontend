import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { collection, query, where, getDocs } from "firebase/firestore";

const UserList = ({ companyId }) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        const usersQuery = query(
          collection(db, "users"),
          where("companyId", "==", companyId)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);

        const rolesSnapshot = await getDocs(collection(db, "roles"));
        const rolesData = rolesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoles(rolesData);
      } catch (error) {
        console.error("Error fetching users and roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndRoles();
  }, [companyId]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div className="container mx-auto  overflow-y-auto h-screen p-8">
      <Typography variant="h4" className="text-xl font-bold mb-4 p-4">
        Users
      </Typography>
      <TableContainer component={Paper} className="shadow-md">
        <Table className="min-w-full" aria-label="users table">
          <TableHead className="bg-gray-100">
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>User Name</TableCell>
              <TableCell>Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  {
                    roles.find((role) => role.id === user.roleId)?.name ||
                    "Unknown Role"
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default UserList;
