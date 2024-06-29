import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const LoginForm = () => {
  const navigate = useNavigate();
  // State variables to hold the username and password
  const [username, setUsername] = useState('test_username');
  const [password, setPassword] = useState('');

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    
        try {
      // Make Axios POST request to your server endpoint
      const response = await axios.post('http://localhost:8000/login', {
        username,
        password
      },{
         withCredentials: true
         // sets credentials that's why its setting the cookie
        
        });
      navigate("/home",{ state: {username:username} })
    } catch (error) {
      console.error('Login failed:', error);
    }
    
    

  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
