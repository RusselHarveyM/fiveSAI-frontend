import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../components/UI/Login/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [userData, setUserData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await axios
                    .get("https://fivesai-backend-production.up.railway.app/api/user/65f30f7eee73c50b279706ca/user")
                    .then((response) => {
                        console.log(response.body);
                        setUserData(response.data);
                    });
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        try {
            if (username === userData.username && password === userData.password) {
                navigate('/dashboard');
            }
            else {
                setError('Invalid username and password.');
            }
        } catch (error) {
            setError('Invalid username or password. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                    />
                </div>
                <button type="submit" className="login-btn">Login</button>
                {error && <div className="error-message">{error}</div>}
            </form>
        </div>
    );
};

export default Login;
