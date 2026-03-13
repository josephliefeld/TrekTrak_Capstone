import { styles } from '@/src/app/(tabs)/events';
import { Modal, TouchableOpacity, TextInput, StyleSheet, Pressable, View } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  email: string;
}

export default function TeamDetailModal({ modalVisible, setModalVisible, event, getTeams, profileId, isTeamOwner, team} : 
    { 
        modalVisible: boolean, 
        setModalVisible: React.Dispatch<React.SetStateAction<Team | null>>,
        event: Event,
        getTeams: (event: Event) => Promise<void>,
        profileId: number,
        isTeamOwner: boolean,
        team: Team | null
    }) 
{
    const [teamName, setTeamName] = useState('');
    const [showError, setShowError] = useState(false);
    const [teamMembers, setTeamMembers] = useState<Profile[]>([])


    const fetchTeamMembers = async (teamId: number | undefined) => {

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("team_id", teamId);

        if (error) {
            console.error("Error fetching team members for team ", teamId, ": ", error);
        }
        else {
            console.log("data==", data)
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
            if (team){
                fetchTeamMembers(team.id)
                getTeams(event)
            }
        }

    }

    useEffect(() => {
        if (modalVisible && team){
            console.log(team.id)
            fetchTeamMembers(team.id)
        }

    }, [modalVisible])




    return (
        <Modal
            animationType='none'
            visible={modalVisible}
            transparent={true}
            >
            <ThemedView style={modalstyles.outerThemedView}>
                <ThemedView style={modalstyles.modalContainer}>

                    <ThemedView>
                        <ThemedText type="subtitle">{team?.name}</ThemedText>
                    </ThemedView>


                    {
                        teamMembers.length == 0 ?
                        <ThemedText>This team is empty</ThemedText> 
                        :
                        teamMembers.map((profile) => (
                            <View key={profile.profile_id} style={modalstyles.memberCard}>
                                <View >
                                    <ThemedText numberOfLines={2} ellipsizeMode="tail" type='defaultSemiBold'>{profile.username}</ThemedText>
                                    {
                                        team?.owner_id.toString() == profile.profile_id &&
                                        <ThemedText>Team Owner</ThemedText>

                                    }
                                </View>
                                {/* <ThemedText>{profile.email}</ThemedText> */}

                                {isTeamOwner && profile.profile_id !== profileId.toString() &&
                                    <TouchableOpacity style={modalstyles.removeMemberButton}
                                        onPress={() => removeProfileFromTeam(profile)}
                                    >
                                        <ThemedText type='defaultSemiBold'>
                                            Remove
                                        </ThemedText>
                                    </TouchableOpacity>
                                }
                            </View>
                    ))}

                    <ThemedView style={modalstyles.buttonsContainer} >

                        <TouchableOpacity 
                        onPress={ () => {setModalVisible(null); setShowError(false); setTeamName('');}}
                        style={modalstyles.defaultButton}
                        >
                            <ThemedText>
                                Close
                            </ThemedText> 
                        </TouchableOpacity>




                    </ThemedView>

                </ThemedView>
            </ThemedView>


        </Modal>
    )
}

const modalstyles = StyleSheet.create({ 
    outerThemedView: {
        flex: 1,                    // fill the whole screen
        justifyContent: "center",   // vertical center
        alignItems: "center",       // horizontal center
        backgroundColor: "rgba(0, 0, 0, 0.284)"
    },
    modalContainer: {
        width: "80%",               // inner box width
        // height: "40%",
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 20,
        justifyContent: "space-around",   // center inner content vertically if needed
        alignItems: "center",       // center inner content horizontally
    },
    buttonsContainer: {
        flexDirection: "row",
    },
    defaultButton: {
        backgroundColor: "#a7cbed",
        margin: 10,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        padding: 5,
        width: 120,

    },
    memberCard: {
        borderRadius: 6,
        backgroundColor: "#eeeded",
        padding: 4,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginVertical: 2,
        justifyContent: 'space-between',
        minHeight: "30%"

    },
    removeMemberButton: {
        backgroundColor: "#F44336",
        borderRadius: 6,
        paddingHorizontal: 4

    }



})