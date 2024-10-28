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
import Loader from "../components/common/Loader";

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

        // Sort active users first, followed by disabled users
        const sortedUsers = [
          ...usersData.filter((user) => !user.disabled),
          ...usersData.filter((user) => user.disabled),
        ];
        setUsers(sortedUsers);

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
    return <Loader />;
  }

  return (
    <div className="container mx-auto overflow-y-auto h-screen p-8">
      <Typography variant="h4" className="text-xl font-bold mb-6 p-4 text-gray-800">
        Users
      </Typography>
      <TableContainer component={Paper} className="shadow-md rounded-lg">
        <Table className="min-w-full" aria-label="users table">
          <TableHead className="">
            <TableRow>
              <TableCell className="font-semibold">Email</TableCell>
              <TableCell className="font-semibold">User Name</TableCell>
              <TableCell className="font-semibold">Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className={user.disabled ? "opacity-50 bg-gray-100" : ""}
                style={{ color: user.disabled ? "#9e9e9e" : "inherit" }}
              >
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  {roles.find((role) => role.id === user.roleId)?.name || "Unknown Role"}
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
