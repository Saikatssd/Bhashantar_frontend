// export const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
// };

import { format } from 'date-fns';

export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? format(date, 'dd/MM/yyyy') : 'Invalid Date';
};