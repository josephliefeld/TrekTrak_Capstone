import { Outlet, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"

export default function Events() {
  return (
    <>
      <div className='p-6'>
        <h1 className="text-3xl font-bold">Events</h1>
      </div>
      <div className='flex flex-col items-start gap-2'>
        <p>View all past, present, and future events.</p>
        <Button variant="link">
          <Link to="view-and-edit">View Event 1</Link>
        </Button>
        <Outlet /> 
      </div>
    </>
  )
}