// import { useState } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css'
import Home from './pages/Home';
import Events from './pages/Events';
import Create from './pages/Create'
import Profile from './pages/Profile';
import EventView from './pages/EventView';
import Participants from './pages/Participants';
import Teams from './pages/Teams';
import Statistics from './pages/Statistics';
import Login from './pages/Login';

function App() {
  // const [count, setCount] = useState(0)
  const {isLoggedIn, loading, logout} = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <>
      <div>
        {isLoggedIn && (
          <nav className="p-4 bg-gray-100 flex gap-4 items-center justify-between">
          <div className="flex gap-4">
            <Link to="/home">Home</Link>
            <Link to="/events">Events</Link>
            <Link to="/profile">Profile</Link>
          </div>
          <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
            Log Out
          </button>
        </nav>
        )}

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
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="/events" element={<Events />}>
                <Route path="create" element={<Create />} />
                <Route path="view-and-edit" element={<EventView />} />
                  <Route path="participants" element={<Participants />} />
                  <Route path="teams" element={<Teams />} />
                  <Route path="statistics" element={<Statistics />} />
              </Route>

              {/* Default redirect for logged-in users */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </>
          )}

          {/*<Route path="/" element={<Login />} />

          <Route path="/home" element={<Home />}/>
          <Route path="profile" element={<Profile />} />
          
          <Route path="events" element={<Events />}>
            <Route path="create" element={<Create />} />
            <Route path="view-and-edit" element={<EventView />}>
              <Route path="participants" element={<Participants />} />
              <Route path="teams" element={<Teams />} />
              <Route path="statistics" element={<Statistics />} />
            </Route>
          </Route>

          <Route path="*" element={<Login />} />*/}
        </Routes>

        {/* <Routes>
          <Route index element={<LoginPage />} />
          <Route path="create-account" element={<CreateAccount />} />
        </Routes> */}
      </div>
    </>
  )
}

export default App
