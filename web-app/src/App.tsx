// import { useState } from 'react'
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Events from './pages/Events';
import Create from './pages/Create'
import Profile from './pages/Profile';
import EventView from './pages/EventView';
import Participants from './pages/Participants';
import Teams from './pages/Teams';
import Statistics from './pages/Statistics';

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <nav className="p-4 bg-gray-100 flex gap-4">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/create">Create</Link>

          <Outlet />
        </nav>

        <Routes>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          
          <Route path="events" element={<Events />}>
            <Route path="create" element={<Create />} />
            <Route path="view-and-edit" element={<EventView />}>
              <Route path="participants" element={<Participants />} />
              <Route path="teams" element={<Teams />} />
              <Route path="statistics" element={<Statistics />} />
            </Route>
          </Route>

          <Route path="*" element={<Home />} />
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
