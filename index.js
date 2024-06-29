import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import './index.css';
import LoginForm from './LoginForm';
import Home from "./home"


const RedirectComponent = () => {
  return <Navigate to="/login" />;
};

const App = () => {
  return (
     <>
        <Routes>
          <Route path="/login" element={<LoginForm />} /> 
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<RedirectComponent />} />
        </Routes>
     </>
  );
}
 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
  </React.StrictMode>
);

