import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LandingPage from './suby/pages/LandingPage';
import Login from './suby/pages/Login';
import Signup from './suby/pages/Signup';
import ProductMenu from './suby/components/ProductMenu';

import './App.css';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/products/:firmId/:firmName' element={<ProductMenu />} />
        <Route path='./suby/pages/Login' element={<Login />} />
        <Route path='./suby/pages/Signup' element={<Signup />} />
      </Routes>
    </div>
  );
};

export default App;
