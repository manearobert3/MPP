import {
    Button,
    Container,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import Box from '@mui/material/Box';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import {useNavigate} from 'react-router-dom';
import useFoodStore from './components/FoodStore';
import Food from './components/Interface';

const Overview = () => {
    const authHeader = useAuthHeader();
    const [open, setOpen] = useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    const [username, setUsername] = useState('');

    const {foods, deleteFood} = useFoodStore();
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState<boolean>(true); // Assume online by default
    //const [foods, setFoods] = useState<Food[]>([]);
    const [rows, setRows] = useState<Food[]>(foods);

    // const getData = async () => {
    //     const response = await axios.get<Food[]>(
    //         'http://localhost:5050/api/foods/',
    //     );
    //     setFoods(response.data);
    // };
    // useEffect(() => {
    //     getData();
    // }, []);
    const checkInternetStatus = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5050/api/check-internet',
            );
            setIsOnline(response.data.isOnline);
        } catch (error) {
            setIsOnline(false); // If there's an error, assume offline
        }
    };
    useEffect(() => {
        checkInternetStatus();
        const interval = setInterval(checkInternetStatus, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    });
    useEffect(() => {
        // Update rows whenever foods change
        setRows(foods);
    }, [foods]);

    const socket = new WebSocket('ws://localhost:3000');

    // Connection opened
    socket.addEventListener('open', () => {
        socket.send('Connection established');
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
        console.log('Message from server ', event.data);
        if (event.data === 'refresh') {
            fetchDataAndUpdateRows();
        }
    });
    const sendMessage = () => {
        socket.send('hello from frontend');
    };
    const fetchDataAndUpdateRows = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5050/api/foods/',
            );
            setRows(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const generateFoodData = async () => {
        try {
            await axios.post('http://localhost:5050/api/generate-food-data');
            // Once the data generation is complete, fetch the updated data
            fetchDataAndUpdateRows();
        } catch (error) {
            console.error('Error generating food data:', error);
        }
    };

    const signOut = useSignOut();

    const getCredentials = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5050/api/login/getinfo',
                {
                    headers: {
                        Authorization: authHeader,
                    },
                },
            );
            const {userName} = response.data;
            setUsername(userName);
            setOpen(true);
            // Handle response data here
            console.log('Response:', response.data);
        } catch (error) {
            // Handle error
            console.error('Error:', error);
        }
    };

    const columns: GridColDef<Food[][number]>[] = [
        {field: 'FoodID', headerName: 'ID', width: 70},
        {field: 'FoodName', headerName: 'Food Name', width: 130},
        {field: 'Calories', headerName: 'Calories', width: 130},
        {
            field: 'actions',
            headerName: 'Actions',
            width: 500,
            renderCell: (params) => (
                // <ButtonGroup
                //     variant='outlined'
                //     color='primary'
                //     aria-label='outlined primary button group'
                //     sx={{}}
                // >
                <>
                    <Button
                        variant='outlined'
                        onClick={() => {
                            navigate(`/foods/edit/${params.row.FoodID}`);
                        }}
                        sx={{
                            color: 'orange',
                            borderColor: 'orange',
                            '&:hover': {
                                backgroundColor: 'orange',
                                color: 'white',
                            },
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant='outlined'
                        sx={{
                            color: 'red',
                            borderColor: 'red',
                            '&:hover': {
                                backgroundColor: 'red',
                                color: 'white',
                            },
                        }}
                        onClick={() => deleteFood(params.row.FoodID)}
                    >
                        Delete
                    </Button>

                    <Button
                        variant='outlined'
                        onClick={() => navigate(`/foods/${params.row.FoodID}`)}
                        sx={{
                            color: 'purple',
                            borderColor: 'purple',
                            '&:hover': {
                                backgroundColor: 'purple',
                                color: 'white',
                            },
                        }}
                    >
                        Detail
                    </Button>
                    <Button
                        variant='outlined'
                        onClick={() =>
                            navigate(`/foodandreview/${params.row.FoodID}`)
                        }
                        sx={{
                            color: 'purple',
                            borderColor: 'purple',
                            '&:hover': {
                                backgroundColor: 'purple',
                                color: 'white',
                            },
                        }}
                    >
                        See Food Reviews
                    </Button>
                </>
            ),
        },
    ];
    return (
        <div>
            <React.Fragment>
                <CssBaseline />
                <div>
                    <p>Internet status: {isOnline ? 'Online' : 'Offline'}</p>
                    {!isOnline && <p>Backend server is not reachable.</p>}
                </div>
                <Container maxWidth='lg'>
                    <Box sx={{height: '100vh'}}>
                        <h1>CRUD App</h1>
                        <Button
                            variant='outlined'
                            sx={{
                                color: 'green',
                                borderColor: 'green',
                                '&:hover': {
                                    backgroundColor: 'green',
                                    color: 'white',
                                },
                            }}
                            onClick={() => {
                                signOut();
                                navigate(`/login`);
                            }}
                        >
                            Logout
                        </Button>
                        <Button
                            variant='outlined'
                            sx={{
                                color: 'green',
                                borderColor: 'green',
                                '&:hover': {
                                    backgroundColor: 'green',
                                    color: 'white',
                                },
                            }}
                            onClick={() => {
                                getCredentials();
                            }}
                        >
                            Get Credentials
                        </Button>
                        <Dialog open={open} onClose={handleClose}>
                            <DialogTitle>User Credentials</DialogTitle>
                            <DialogContent>
                                <p>Username: {username}</p>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose}>Close</Button>
                            </DialogActions>
                        </Dialog>
                        <Button
                            variant='outlined'
                            sx={{
                                color: 'green',
                                borderColor: 'green',
                                '&:hover': {
                                    backgroundColor: 'green',
                                    color: 'white',
                                },
                            }}
                            onClick={() => {
                                navigate(`/foods/add`);
                                //   handleOpen();
                            }}
                        >
                            Add
                        </Button>
                        <Button
                            variant='outlined'
                            sx={{
                                color: 'green',
                                borderColor: 'green',
                                '&:hover': {
                                    backgroundColor: 'green',
                                    color: 'white',
                                },
                            }}
                            onClick={() => {
                                sendMessage();
                            }}
                        >
                            Send message w web sockets
                        </Button>
                        <Button
                            variant='outlined'
                            sx={{
                                color: 'yellow',
                                borderColor: 'yellow',
                                '&:hover': {
                                    backgroundColor: 'yellow',
                                    color: 'white',
                                },
                            }}
                            onClick={() => {
                                navigate(`/foods/chart`);
                                //   handleOpen();
                            }}
                        >
                            Chart
                        </Button>
                        <Button
                            variant='outlined'
                            sx={{
                                color: 'yellow',
                                borderColor: 'yellow',
                                '&:hover': {
                                    backgroundColor: 'yellow',
                                    color: 'white',
                                },
                            }}
                            onClick={() => {
                                navigate(`/review`);
                                //   handleOpen();
                            }}
                        >
                            Go to Food Reviews
                        </Button>
                        <Button
                            variant='outlined'
                            sx={{
                                color: 'green',
                                borderColor: 'green',
                                '&:hover': {
                                    backgroundColor: 'green',
                                    color: 'white',
                                },
                            }}
                            onClick={() => {
                                generateFoodData();
                            }}
                        >
                            Insert Multiple Food And Food Reviews
                        </Button>
                        <Button
                            variant='outlined'
                            sx={{
                                color: 'green',
                                borderColor: 'green',
                                '&:hover': {
                                    backgroundColor: 'green',
                                    color: 'white',
                                },
                            }}
                            onClick={() => {
                                navigate('/joinedTables');
                            }}
                        >
                            Go to multiple food reviews
                        </Button>
                        <Box sx={{height: 400, width: '100%'}}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                getRowId={(row) => row.FoodID}
                                initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 5,
                                        },
                                    },
                                }}
                                pageSizeOptions={[5]}
                                checkboxSelection
                                disableRowSelectionOnClick
                            />
                        </Box>
                    </Box>
                </Container>
            </React.Fragment>
        </div>
    );
};

export default Overview;
