// import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import './App.css'
import TopNav from "./components/TopNav";
import Events from './pages/Events';
import Create from './pages/Create'
import Profile from './pages/Profile';
import Login from './pages/Login';
import EventView from './pages/EventView';
import EventEdit from './pages/EventEdit';
import Participants from './pages/Participants';

function App() {
  // const [count, setCount] = useState(0)
  const {isLoggedIn, loading} = useAuth()
  if (loading) return <div>Loading...</div>
  return (
    <>
      <div>
        {isLoggedIn && <TopNav />}
      </div>  
      <div className="container mx-auto mt-6 p-4">
        <Routes>

          {!isLoggedIn ? (
            <>
              {/* Login routes */}
              <Route path="/" element={<Login />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              {/* Authenticated routes */}
              <Route path="/events" element={<Events />} />
              <Route path="/create" element={<Create />} />
              <Route path="/profile" element={<Profile />} />
              {/* Default redirect for logged-in users */}
              <Route path="/" element={<Navigate to="/events" replace />} />
              <Route path="*" element={<Navigate to="/events" replace />} />

              <Route path="/events/:eventId" element={<EventView />} />
              <Route path="/events/edit/:eventId" element={<EventEdit />} />
              <Route path="/events/participants/:eventId" element={<Participants />} />
            </>
          )}

        </Routes>
      </div>
    </>
  );
};

export default App;
