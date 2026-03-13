import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/components/lib/supabase/client";
import { useAuth } from "../context/useAuth";
import TeamCard from "../components/TeamCard"




type Event = {
  event_id: number;
  organizer: string;
  event_name: string;
  event_type: string;
  is_private: boolean;
  start_date: string;
  end_date: string;
  event_description: string;
  is_published: boolean;
  owner_id: string;
  allow_teams: boolean;
  max_team_size: number;
};

type Team = {
  id: number;
  size: number;
  name: string;
  event_id: number;
  owner_id: number;
}

type Profile = {
  profile_id: string;
  username: string;
  team_id: number | null;
}
export default function Teams() {

  const { eventId } = useParams();

  const {userId} = useAuth()

  const [event, setEvent] = useState<Event | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);


  const [teamMembers, setTeamMembers] = useState<Record<number, Profile[]>>({})
  



  const fetchEvent = async () => {
    if (!eventId) return;

    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", eventId)
      .single();

    setEvent(data);
  };


  const fetchTeamMembers = async (teamId: number) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("team_id", teamId);

    if (error) {
      console.error("Error fetching team members for team ", teamId, ": ", error);
    }
    else {
      setTeamMembers(prev => (prev[teamId] = data))
      console.log(teamMembers)
    }
  }




  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select('*')
      .eq('event_id', eventId);

    console.log("Data ", data);
    
    if (error) {
      console.error("Error fetching teams: ", error)
    }
    else {
      setTeams(data ?? [])
    }
  }

  useEffect(() => {
    fetchEvent();
    fetchTeams()
  }, [eventId]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      
      {/* Page Header */}

      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          {event?.event_name}
        </h1>
      </header> 


      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 space-y-8">

        {/* Navigation */}
        <nav className="flex flex-wrap gap-4 border-b pb-6">
          <Link
            to={`/events/${eventId}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
          >
            Event
          </Link>

          <Link
            to={`/events/participants/${eventId}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
          >
            Participants
          </Link>

          <Link
            to={`/events/statistics/${eventId}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
          >
            Statistics
          </Link>

          {/* Only show edit button if owner of event */}
          {userId === event?.owner_id && <Link
            to={`/events/edit/${event?.event_id}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Edit
          </Link>}
        </nav>

        {/* Participants Section */}
        <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
            Teams
          </h2>

          {teams.length === 0 ? 
          (
            <p className="text-gray-600">No teams have been created yet.</p>
          )
          :
            (
              <div>
                {teams.map((team) => (
                  
                  <TeamCard key={team.id} teamProp={team} max_team_size={event?.max_team_size} isOwner={userId === event?.owner_id}/>

                  

                ))}
              </div>
            )
          }

 




          

        </div>

      </div>
    </div>
  )
}