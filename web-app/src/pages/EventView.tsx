import { Outlet, Link } from 'react-router-dom';

export default function EventView() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">View and Edit Events</h1>
      <p>This will be the page that allows organizations to view and update a specific event.</p>
      {/* <a href=></a> */}

      <nav className="p-4 bg-gray-100 flex gap-4">
        <Link to="participants">Participants</Link>
        <Link to="teams">Teams</Link>
        <Link to="statistics">Statistics</Link>
        </nav>
        <Outlet /> 
    </div>
  )
}