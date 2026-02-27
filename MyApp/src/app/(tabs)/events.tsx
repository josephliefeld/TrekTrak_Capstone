import { Image } from 'expo-image';
import { StyleSheet, TextInput, FlatList, TouchableOpacity, Animated } from 'react-native';
import ParallaxScrollView from '@/src/components/parallax-scroll-view';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useState, useRef, useEffect } from 'react';

import { supabase } from '@/src/components/lib/supabase'
import { useAuthContext } from '@/hooks/use-auth-context'
import CreateTeamModal from '@/src/components/ui/create-team-modal';


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





const sampleEvents = [
  { id: '1', name: 'Morning Run' },
  { id: '2', name: 'TrekTrak Global Challenge' },
  { id: '3', name: 'Evening Yoga Session' },
  { id: '4', name: '5K Charity Run' },
];

export default function EventsScreen() {
  const [search, setSearch] = useState('');
  const [enrolledEvents, setEnrolledEvents] = useState<Event[]>([]);
  const [bannerMessage, setBannerMessage] = useState('');
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  const [teams, setTeams] = useState<Team[]>([]);

  const profile = useAuthContext()

  const [profileTeamId, setProfileTeamId] = useState<number | null>(profile.profile?.team_id);

  const [modalVisible, setModalVisible] = useState(false);

  

  //Fetch events from Supabase
  const[events, setEvents] = useState<Event[]>([]);


  async function fetchEvents() {
      const { data, error } = await supabase.from<"events", Event>("events").select("*");
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data ?? []);
      }
  };

  //Get event user is enrolled in already (might be none)
  async function fetchEnrolledEvent(){
    const { data, error } = await supabase
      .from("daily_steps")
      .select("event_id")
      .eq("profile_id", profile.profile?.profile_id);
    
    if (error) {
      console.error("Error fetching enrolled event: ", error);
    }
    else if (data.length > 0){
      const enrolledEvent = events.filter(event => event.event_id == data[0].event_id);
      setEnrolledEvents(enrolledEvent);

      if (enrolledEvent.length > 0){
        getTeams(enrolledEvent[0]); //Get teams for enrolled event
      }
    }
  }

  useEffect(() => {
    fetchEvents();
    console.log("Fetched", events)
  }, []);

  // Refetch enrolled event whenever events list changes to ensure we have the latest data
  useEffect(() => {
    fetchEnrolledEvent();
  }, [events])

  // Add user to daily_steps table for event they enrolled in
  const enrollProfileInEvent = async (eventId: number) => {
    const { data, error } = await supabase
      .from("daily_steps")
      .insert(
        {
          profile_id: profile.profile?.profile_id,
          event_id: eventId,
          dailysteps: 0,
          totaldailysteps: 0,
          date: new Date().toISOString().split('T')[0]
        }
      )

      if (error) {
        console.error("Error enrolling: ", error)
      }
  }

  const unenrollProfileFromEvent = async (eventId: number) => {
    const {error} = await supabase
      .from("daily_steps")
      .delete()
      .eq("profile_id", profile.profile?.profile_id)
      .eq("event_id", eventId)  

      if (error) {
        console.error("Error unenrolling: ", error)
      }
  }

  const addProfileToTeam = async (team: Team) => {
    if (profileTeamId != null) {
      showBanner("⚠️ You may only be in one team at a time.")
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .update( {team_id: team.id })
      .eq("profile_id", profile.profile?.profile_id)
    if (error) {
      console.error("Error joining team: ", error)
    }
    else {
      setProfileTeamId(team.id);
    }
  }

  const removeProfileFromTeam = async (team: Team) => {
    const {data, error} = await supabase
      .from("profiles")
      .update( {team_id: null })
      .eq("profile_id", profile.profile?.profile_id)
    if (error) {
      console.error("Error leaving team: ", error)
    }
    else {
      setProfileTeamId(null);
    }
  }


  // Banner display logic
  const showBanner = (message: string) => {
    setBannerMessage(message);
    Animated.timing(bannerOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(bannerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 3000); // disappears after 3 seconds
  };


  const getTeams = async (event: Event) => {
    const { data, error } = await supabase
      .from("teams")
      .select('*')
      .eq('event_id', event.event_id);

    console.log("Data ", data);
    
    if (error) {
      console.error("Error fetching teams: ", error)
    }
    else {
      setTeams(data ?? [])
    }
  }

  // -------------------------
  // UPDATED: Only 1 event active at a time
  // -------------------------
  const handleEnroll = async (event: Event) => {
    if (enrolledEvents.length >= 1) {
      showBanner("⚠️ You may only enroll in one event at a time");
      return;
    }

    // Check if event is private
    if (event.is_private) {
      const allowed = await isUserAllowedForPrivateEvent(event.event_id, profile.profile?.email || "");
      if (!allowed) {
        showBanner("❌ You are not allowed to join this private event.");
        return;
      }
    }

    setEnrolledEvents([event]); // enroll in ONLY this event

    enrollProfileInEvent(event.event_id); //Add user to event

    getTeams(event); //Fetch teams for the event


    showBanner('✅ You have enrolled in the event!');
  };

  const handleUnenroll = (event: Event) => {
    if (profileTeamId != null) {
      showBanner("⚠️ You must leave your team before unenrolling from the event.");
      return;
    }
    setEnrolledEvents([]);

    unenrollProfileFromEvent(event.event_id); //Remove user from event

    showBanner('❌ You have unenrolled from the event.');
  };

  const filteredEvents = events.filter(event =>
    event.event_name.toLowerCase().includes(search.toLowerCase())
  );

  const availableEvents = filteredEvents.filter(
    event => !enrolledEvents.includes(event)
  );

  
  const renderEventItem = (event: Event, enrolled = false) => (
    <ThemedView style={styles.eventItem}>
      <ThemedText>{event.event_name}</ThemedText>
      <TouchableOpacity
        onPress={() =>
          enrolled ? handleUnenroll(event) : handleEnroll(event)
        }
        style={[styles.button, enrolled ? styles.unenrollButton : styles.enrollButton]}
      >
        <ThemedText type="subtitle">
          {enrolled ? 'Unenroll' : 'Enroll'}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  const renderTeamItem = (team: Team) => {
    const inTeam = profileTeamId == team.id;

    return (
      <ThemedView style={styles.teamItem}>
        
        <ThemedText>{team.name}</ThemedText>
        <ThemedText>Team size: {team.size}</ThemedText>

        <TouchableOpacity 
          onPress={ () => 
            inTeam ? removeProfileFromTeam(team) : addProfileToTeam(team)
          }
          style={ [styles.teamButton, inTeam ? styles.leaveTeamButton : styles.joinTeamButton] }
        >
          <ThemedText type='defaultSemiBold'>{inTeam ? "Leave Team" : "Join Team"}</ThemedText>
        </TouchableOpacity>

      </ThemedView>
    )
  };



  const isUserAllowedForPrivateEvent = async (eventId: string | number, userEmail: string) => {
    const { data, error } = await supabase
      .from("private_event_members")
      .select("email")
      .eq("event_id", eventId)
      .eq("email", profile.profile?.email)
      .single();
  
    if (error && error.code !== "PGRST116") { // PGRST116 = no rows found
      console.error("Error checking private event:", error);
      return false;
    }
  
    return !!data; // true if the user is allowed, false otherwise
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>

      {/* Banner */}
      {bannerMessage ? (
        <Animated.View style={[styles.banner, { opacity: bannerOpacity }]}>
          <ThemedText style={styles.bannerText}>{bannerMessage}</ThemedText>
        </Animated.View>
      ) : null}

      {/* Header Section */}
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title">🏅 Events</ThemedText>
      </ThemedView>

      {/* Description Section */}
      <ThemedView style={styles.descriptionContainer}>
        <ThemedText type="subtitle">Upcoming Challenges & Activities</ThemedText>
        <ThemedText>
          Browse events, enroll to participate, and track your activity!
        </ThemedText>
      </ThemedView>

      {/* Search Section */}
      <ThemedView style={styles.searchContainer}>
        <TextInput
          placeholder="Search events by name..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </ThemedView>

      {/* Enrolled Events */}
      {enrolledEvents.length > 0 && (
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle">Your Enrolled Event</ThemedText>
          <FlatList
            data={events.filter(event => enrolledEvents.includes(event))} 
            keyExtractor={item => item.event_id.toString()}
            renderItem={({ item }) => renderEventItem(item, true)}
          />
          <ThemedText style={styles.teamHeader}>Create and join teams</ThemedText>

          <TouchableOpacity 
            style={styles.createTeamButton}
            onPress={ () => setModalVisible( (value) => !value) }
            >
            <ThemedText type='defaultSemiBold'>Create Team</ThemedText>
          </TouchableOpacity>

          <FlatList
            data={teams}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => renderTeamItem(item)}
          />
          {teams.length == 0 &&
            <ThemedText>No teams created for this event yet</ThemedText>
          }

          <CreateTeamModal modalVisible={modalVisible} setModalVisible={setModalVisible} event={enrolledEvents[0]} getTeams={getTeams} />


        </ThemedView>
      )}

      {/* Available Events */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Available Events</ThemedText>
        {availableEvents.length > 0 ? (
          <FlatList
            data={availableEvents}
            keyExtractor={item => item.event_id.toString()}
            renderItem={({ item }) => renderEventItem(item)}
          />
        ) : (
          <ThemedText>No events match your search.</ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
    
  );
}

export const styles = StyleSheet.create({
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  headerContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  descriptionContainer: {
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sectionContainer: {
    marginVertical: 12,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginHorizontal: 16,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  enrollButton: {
    backgroundColor: '#4CAF50',
  },
  unenrollButton: {
    backgroundColor: '#F44336',
  },
  banner: {
    top: 0,
    width: '100%',
    backgroundColor: '#333',
    padding: 12,
    zIndex: 999,
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  teamItem: {
    backgroundColor: '#c7f1ff',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 16
  },
  teamHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamButton: {
    borderRadius: 6,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  joinTeamButton: {
    backgroundColor: '#a7cbed',
  },
  leaveTeamButton: {
    backgroundColor: '#ff655a',
  },
  createTeamButton: {
    backgroundColor: '#99eeff',
    borderRadius: 6,
    width: 120,
    marginVertical: 8,
    alignItems: 'center',

  },
});
