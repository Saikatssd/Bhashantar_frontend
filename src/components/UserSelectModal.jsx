import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const UserSelectModal = ({ open, handleClose, handleAssign, companyId }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getUsers = async () => {
            setIsLoading(true);
            try {
                const usersQuery = query(
                    collection(db, 'users'),
                    where('companyId', '==', companyId),
                    where('roleId', '==', '8q307xybAGCqnyQF52yX')
                );
                const usersSnapshot = await getDocs(usersQuery);
                const usersData = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(usersData);
            } catch (err) {
                console.error('Error fetching company users:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (open) {
            getUsers();
        }
    }, [open, companyId]);

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <h2>Select User</h2>
                {isLoading && <CircularProgress />}
                {error && <p>Error: {error.message}</p>}
                {!isLoading && !error && users.length === 0 && <p>No users found.</p>}
                {!isLoading && !error && users.length > 0 && (
                    <List>
                        {users.map((user) => (
                            <ListItem key={user.id}>
                                <ListItemButton onClick={() => handleAssign(user.id)}>
                                    <ListItemText primary={user.name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Modal>
    );
};

export default UserSelectModal;
