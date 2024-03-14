import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../components/UI/Login/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("https://fivesai-backend-production.up.railway.app/api/user");
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        try {
            const response = await axios.get("https://fivesai-backend-production.up.railway.app/api/user");
            const user = response.data.find(user => user.username === username && user.password === password);

            if (user) {
                console.log("Logged in user:", user);
                if (user.role === 'admin' || user.role === 'user') {
                    navigate('/dashboard', { state: { userRole: user.role } });
                } else {
                    setError('Invalid role. Only admin or user can login.'); // can be modified, since string it could be any
                }
            } else {
                setError('Invalid username or password. Please try again.');
            }
        } catch (error) {
            setError('Error logging in. Please try again.');
            console.error('Error logging in:', error);
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
