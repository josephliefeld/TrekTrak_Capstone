import { useParams } from "react-router-dom";
//import { supabase } from "@/components/lib/supabase/client";



export default function Participants() {

  //const { eventId } = useParams();
  const imageUrl = `http://127.0.0.1:54321/storage/v1/object/public/tier1/Screenshot%202025-12-03%20201532.png`;


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Participants</h1>
      <p>This is where organizations can view a list of participants for a specific event.</p>

      {/* <a href=></a> */}
    </div>
  )
}