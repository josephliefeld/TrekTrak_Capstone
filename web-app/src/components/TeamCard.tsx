import { supabase } from "@/components/lib/supabase/client";
import { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "../context/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  email: string;
}


export default function TeamCard({teamProp, max_team_size, isOwner} : 
    {
        teamProp: Team, 
        max_team_size: number | undefined,
        isOwner: boolean
    }) {

    const {userId} = useAuth()
    

    const [teamMembers, setTeamMembers] = useState<Profile[]>([])
    const [viewOpen, setViewOpen] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [team, setTeam] = useState<Team>(teamProp)

    const fetchTeam = async () => {
        const {data, error} = await supabase
            .from("teams")
            .select("*")
            .eq("id", team.id)
        if (error) {
            console.error("Error fetching team: ", error)
        }
        else {
            setTeam(data[0])
        }
    }


    const fetchTeamMembers = async (teamId: number) => {

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("team_id", teamId);

        if (error) {
            console.error("Error fetching team members for team ", teamId, ": ", error);
        }
        else {
            setTeamMembers(data)
        }
    }

    
    const removeProfileFromTeam = async (profile: Profile) => {
        const {data, error} = await supabase
        .from("profiles")
        .update( {team_id: null })
        .eq("profile_id", profile.profile_id)

        if (error) {
        console.error("Error leaving team: ", error)
        }
        else {
            fetchTeamMembers(team.id)
            fetchTeam()
        }

    }
    

    return (
        <div className="bg-white rounded-lg shadow p-4 m-4">

            <div className="flex flex-row justify-between mx-2">
                <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>

                <p>Members: {team.size} / {max_team_size}</p>

                <Button onClick={async () => {
                    if (viewOpen){
                        setViewOpen(false)
                    }
                    else {
                        await fetchTeamMembers(team.id)
                        setViewOpen(true)
                    }
                }}>
                    View
                </Button>
            </div>

            { viewOpen && (
            <div className="pt-2">
                {
                    teamMembers.length == 0 ?
                    <p>This team is empty</p> 
                    :
                    teamMembers.map((profile) => (
                        <div key={profile.profile_id} className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 transition rounded-2xl p-4 m-2 shadow-sm">
                            <div className="flex flex-col items-start">
                                <p className="font-bold text-lg">{profile.username}</p>
                                {
                                    team.owner_id.toString() == profile.profile_id &&
                                    <p className="text-sm text-gray-500">Team Owner</p>

                                }
                            </div>
                            <p>{profile.email}</p>

                            {isOwner &&
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="hover:bg-red-700">
                                            Remove
                                        </Button>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Remove User From Team?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        This action cannot be undone. This will remove 
                                        <span className="font-bold"> {profile.username}</span> from 
                                        team 
                                        <span className="font-bold"> {team.name}</span>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                        onClick={() => removeProfileFromTeam(profile)}
                                        variant="destructive"
                                        className="hover:bg-red-700"
                                        >
                                        Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            }
                        </div>
                    ))}
            </div> )
            }
        </div>
    )
}