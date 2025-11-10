// import { useState } from 'react'
// import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import {Routes, Route } from 'react-router-dom';
import './App.css'
import TopNav from "./components/TopNav";
import Events from './pages/Events';
import Create from './pages/Create'
import Profile from './pages/Profile';
// import EventView from './pages/EventView';
// import Participants from './pages/Participants';
// import Teams from './pages/Teams';
// import Statistics from './pages/Statistics';
// import Login from './pages/Login'; 

const App: React.FC = () => {
  return (
    <>
      {/* This top nav always shows */}
      <TopNav />

      <div className="container mx-auto mt-6 p-4">
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/create" element={<Create />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
