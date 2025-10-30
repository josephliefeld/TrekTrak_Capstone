import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Events from './pages/Events';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <nav className="p-4 bg-gray-100 flex gap-4">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
        </nav>

        <Routes>
          <Route index element={<Home />} />
          <Route path="events" element={<Events />} />
        </Routes>
    </div>
    </>
  )
}

export default App
