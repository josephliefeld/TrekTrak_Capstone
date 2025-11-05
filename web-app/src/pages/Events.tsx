import { Outlet, Link } from 'react-router-dom';

export default function Events() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">This is the future events page!</h1>
      <p>View all past, present, and future events.</p>
      {/* <a href=></a> */}

        <nav className="p-4 bg-gray-100 flex gap-4">
          <Link to="create">Create</Link>
          <Link to="view-and-edit">View</Link>
        </nav>
        <Outlet /> 
    </div>
  )
}
