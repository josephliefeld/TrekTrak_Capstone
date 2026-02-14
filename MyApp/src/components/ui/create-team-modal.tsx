import { styles } from '@/src/app/(tabs)/events';
import { Modal, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { useState, useRef } from 'react';
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
};

type Team = {
  id: number;
  size: number;
  name: string;
  event_id: number;
}

export default function CreateTeamModal({ modalVisible, setModalVisible, event, getTeams} : 
    { 
        modalVisible: boolean, 
        setModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
        event: Event,
        getTeams: (event: Event) => Promise<void>
    }) 
{
    const [teamName, setTeamName] = useState('');
    const [showError, setShowError] = useState(false);


    

    const createTeam = async() => {
        if (teamName.trim() === '') {
            console.log('Team name cannot be empty');
            setShowError(true);
            return;
        }

        const {data, error} = await supabase
            .from('teams')
            .insert({
                name: teamName,
                size: 1,
                event_id: event.event_id
            })
        if (error) {
            console.log('Error creating team:', error);
        } 
        else {
            getTeams(event); //Refresh events displayed
            setTeamName('');
            setShowError(false);
            setModalVisible(false);
        }
    }


    return (
        <Modal
            animationType='none'
            visible={modalVisible}
            transparent={true}
            >
            <ThemedView style={modalstyles.outerThemedView}>
                <ThemedView style={modalstyles.modalContainer}>

                    <ThemedView>
                        <ThemedText type="subtitle">Create new team</ThemedText>
                    </ThemedView>

                    <ThemedView>
                    <TextInput 
                        placeholder='Enter Team Name'
                        value={teamName}
                        style={styles.searchInput}
                        onChangeText={setTeamName}
                    />
                    {showError && 
                        <ThemedText>Please enter a team name</ThemedText>
                    }
                    </ThemedView>

                    

                    <ThemedView style={modalstyles.buttonsContainer} >

                        {/* Create Team button */}
                        <TouchableOpacity 
                        onPress={ () => createTeam()}
                        style={modalstyles.defaultButton}
                        >
                            <ThemedText>
                                Create Team
                            </ThemedText> 
                        </TouchableOpacity>

                        {/* Close Modal button */}
                        <TouchableOpacity 
                        onPress={ () => {setModalVisible(false); setShowError(false); setTeamName('');}}
                        style={modalstyles.defaultButton}
                        >
                            <ThemedText>
                            Close Modal
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
        backgroundColor: "rgba(0, 0, 0, 0.608)"
    },
    modalContainer: {
        width: "80%",               // inner box width
        height: "40%",
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
        padding: 5

    }



})