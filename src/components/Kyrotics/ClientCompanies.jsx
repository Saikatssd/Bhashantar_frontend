import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { server } from '../../main';
import { fetchClientCompanies } from '../../services/companyServices';


const ClientCompanies = () => {
    

    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
 

    useEffect(() => {
        const fetchCompanies = async () => {
          setIsLoading(true);
          try {
            const companies = await fetchClientCompanies();
            setCompanies(companies);
          } catch (err) {
            setError(err);
          } finally {
            setIsLoading(false);
          }
        };
        fetchCompanies();
      }, []);
      

    return (
        <div className="flex flex-col items-center p-20">
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {!isLoading && !error && (
                <>
                    <Grid container spacing={4} className="w-full">
                        {companies.map((company) => (
                            <Grid item xs={12} sm={6} md={4} key={company.id}>
                                <Link to={`/kyro/${company.id}/project`} key={company.id}>
                                    <Card
                                        className="transform transition-transform hover:scale-105 shadow-lg rounded-lg overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                        }}
                                    >
                                        <CardContent className="flex flex-col items-center">
                                            <Typography variant="h5" component="div" className="font-bold">
                                                {company.name}
                                            </Typography>
                                            <Typography variant="body2" component="div" className="mt-2">
                                                Click to view projects
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </div>
    );
};

export default ClientCompanies;
