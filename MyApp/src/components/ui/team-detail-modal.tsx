import { styles } from '@/src/app/(tabs)/events';
import { Modal, TouchableOpacity, StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { IconSymbol } from '@/src/components/ui/icon-symbol';

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
  daily_steps: [ {
    dailysteps: number;
  }];
}

export default function TeamDetailModal({ modalVisible, setModalVisible, event, getTeams, profileId, isTeamOwner, team, teamSteps} : 
    { 
        modalVisible: boolean, 
        setModalVisible: React.Dispatch<React.SetStateAction<Team | null>>,
        event: Event,
        getTeams: (event: Event) => Promise<void>,
        profileId: number,
        isTeamOwner: boolean,
        team: Team | null,
        teamSteps: {team_id: number, total_steps: number}[]
    }) 
{
    const [teamName, setTeamName] = useState('');
    const [showError, setShowError] = useState(false);
    const [teamMembers, setTeamMembers] = useState<Profile[]>([])
    const teamTotalSteps = teamSteps.find((t) => t.team_id === team?.id)?.total_steps || 0;


    const fetchTeamMembers = async (teamId: number | undefined) => {

        const { data, error } = await supabase
            .from("profiles")
            .select("*, daily_steps(dailysteps)")
            .eq("team_id", teamId);

        if (error) {
            console.error("Error fetching team members for team ", teamId, ": ", error);
        }
        else {
            console.log("memberdata==", data)
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

    const sortTeamMembers = (members: Profile[], ownerId?: string) => {
        return [...members].sort((a, b) => {
            if (a.profile_id === ownerId) return -1;
            if (b.profile_id === ownerId) return 1;
            return 0;
        });
    };

    const sortedMembers = useMemo(() => {
        return sortTeamMembers(teamMembers, team?.owner_id?.toString());
    }, [teamMembers, team?.owner_id]);




    return (
        <Modal
            animationType='none'
            visible={modalVisible}
            transparent={true}
            >
            <ThemedView style={modalstyles.outerThemedView}>
                <ThemedView style={modalstyles.modalContainer}>

                    <ThemedView style={modalstyles.nameContainer}>
                        <ThemedText type="subtitle" style={modalstyles.teamName}>{team?.name}</ThemedText>
                    </ThemedView>

                    <ThemedView style={{marginVertical: 12}}>
                        <ThemedText>Team Steps: {teamTotalSteps}</ThemedText>
                    </ThemedView>

                    <ScrollView style={{width: '100%', flex: 1}}>
                    {
                        teamMembers.length == 0 ?
                        <ThemedText>This team is empty</ThemedText> 
                        : 
                        sortedMembers.map((profile) => (
                            <View key={profile.profile_id} style={modalstyles.memberCard}>
                                <View style={{ width: team?.owner_id.toString() == profile.profile_id ? '100%' : '80%' }}>                                    
                                    <View style={modalstyles.userInfo}>
                                        <ScrollView style={{ flex: 1, width: '50%'}} horizontal showsHorizontalScrollIndicator={false}>
                                            <ThemedText  numberOfLines={1} ellipsizeMode="tail" type='defaultSemiBold'>
                                                {profile.username}
                                            </ThemedText>
                                        </ScrollView>

                                        
                                        {
                                            team?.owner_id.toString() == profile.profile_id &&
                                            <View style={{ alignItems: 'flex-end'}}>
                                                <ThemedText style={{fontSize: 14, color: '#2c2c2c'}}>Team Owner</ThemedText>
                                            </View>   

                                        }
                                                                   
                                    </View>
                                    <ScrollView 
                                            horizontal 
                                            showsHorizontalScrollIndicator={false}
                                        >
                                            <ThemedText style={{textAlign: 'left'}}>
                                                Steps: {profile.daily_steps[0].dailysteps}
                                            </ThemedText>
                                    </ScrollView>

                                </View>

                                {isTeamOwner && profile.profile_id !== profileId.toString() &&
                                    <TouchableOpacity style={modalstyles.removeMemberButton}
                                        onPress={() => removeProfileFromTeam(profile)}
                                    >
                                        <ThemedText type='defaultSemiBold' style={{padding: 2}}>
                                            <IconSymbol name='person.badge.minus.fill' size={18} color="#fff" />
                                        </ThemedText>
                                    </TouchableOpacity>
                                }
                            </View>
                        ))
                    }
                    </ScrollView>

                    <ThemedView style={modalstyles.buttonsContainer} >

                        <TouchableOpacity 
                        onPress={ () => {setModalVisible(null); setShowError(false); setTeamName('');}}
                        style={modalstyles.defaultButton}
                        >
                            <ThemedText style={styles.buttonText}>
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
        maxHeight: "80%",              // limit height to 80% of the screen
        width: "80%",               // inner box width
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 20,
        justifyContent: "flex-start",   // center inner content vertically if needed
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
        //minHeight: "30%"
        height: 60

    },
    removeMemberButton: {
        backgroundColor: "#F44336",
        borderRadius: 6,
        paddingHorizontal: 4,
        marginLeft: '5%',
        marginRight: '3%'

    },
    userInfo: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingRight: 10

    },
    nameContainer: {
        flexDirection: 'row',
        width: '100%',
        overflow: 'scroll'
    },
    teamName: {
        flexWrap: 'wrap'
    }



})