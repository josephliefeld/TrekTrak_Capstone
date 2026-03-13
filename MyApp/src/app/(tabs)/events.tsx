import { StyleSheet, TextInput, FlatList, TouchableOpacity, Animated, View, Pressable, ScrollView } from 'react-native'
import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'
import { useState, useRef, useEffect } from 'react'

import { supabase } from '@/src/components/lib/supabase'
import { useAuthContext } from '@/hooks/use-auth-context'
import CreateTeamModal from '@/src/components/ui/create-team-modal';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import TeamDetailModal from '@/src/components/ui/team-detail-modal';


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

export default function EventsScreen() {

  const [search, setSearch] = useState('')
  const [enrolledEventId, setEnrolledEventId] = useState<number | null>(null)
  const [enrolledEvents, setEnrolledEvents] = useState<Event[]>([]);
  const [bannerMessage, setBannerMessage] = useState('')

  const bannerOpacity = useRef(new Animated.Value(0)).current
  const profile = useAuthContext()

  const [teams, setTeams] = useState<Team[]>([])
  const [profileTeamId, setProfileTeamId] = useState<number | null>(profile.profile?.team_id)
  const [createTeamModalVisible, setCreateTeamModalVisible] = useState<boolean>(false)
  const [teamDetailModalVisible, setTeamDetailModalVisible] = useState<boolean>(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [ownsTeam, setOwnsTeam] = useState<boolean>(false)

  const [events, setEvents] = useState<Event[]>([])

  async function fetchEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")

    if (error) {
      console.error("Error fetching events:", error)
    } else {
      setEvents(data ?? [])
    }
  }

  async function fetchEnrollment() {

    if (!profile.profile?.profile_id) return

    const { data, error } = await supabase
      .from("daily_steps")
      .select("event_id")
      .eq("profile_id", profile.profile.profile_id)
      .limit(1)

    if (error) {
      console.error("Error fetching enrollment:", error)
      return
    }

    if (data && data.length > 0) {
      setEnrolledEventId(data[0].event_id)
    }
  }

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
        getTeams(enrolledEvent[0]);
      }
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    fetchEnrollment()
  }, [profile.profile])

  useEffect(() => {
    fetchEnrolledEvent();
  }, [events])

  useEffect(() => {
    if (enrolledEvents.length > 0) {
      getTeams(enrolledEvents[0]);
    }
  }, [profileTeamId])

  useEffect(() => {
    checkOwnsTeam();
  })

  const enrollProfileInEvent = async (eventId: number) => {

    if (!profile.profile?.profile_id) return

    const { error } = await supabase
      .from("daily_steps")
      .insert({
        profile_id: profile.profile.profile_id,
        event_id: eventId,
        dailysteps: 0,
        totaldailysteps: 0,
        date: new Date().toISOString().split('T')[0]
      })

    if (error) {
      console.error("Error enrolling:", error)
    } else {
      setEnrolledEventId(eventId)
    }
  }

  const unenrollProfileFromEvent = async (eventId: number) => {

    if (!profile.profile?.profile_id) return

    const { error } = await supabase
      .from("daily_steps")
      .delete()
      .eq("profile_id", profile.profile.profile_id)
      .eq("event_id", eventId)

    if (error) {
      console.error("Error joining team: ", error)
    }
    else {
      setEnrolledEventId(null);
    }
  }

  const addProfileToTeam = async (team: Team) => {
    if (profileTeamId != null) {
      showBanner("⚠️ You may only be in one team at a time.")
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({team_id: team.id})
      .eq("profile_id", profile.profile?.profile_id)

    if (error) {
      console.error("Error joining team: ", error)
    }
    else {
      setProfileTeamId(team.id);
    }
  }

  const removeProfileFromTeam = async (team: Team) => {
    const {error} = await supabase
      .from("profiles")
      .update({team_id: null})
      .eq("profile_id", profile.profile?.profile_id)

    if (error) {
      console.error("Error leaving team: ", error)
    }
    else {
      setProfileTeamId(null);
    }
  }

  const deleteTeam = async (team: Team) => {
    const {error} = await supabase
      .from("teams")
      .delete()
      .eq("id", team.id)

    if (error) {
      console.error("Error deleting team: ", error)
    }
    else {
      setOwnsTeam(false);
      getTeams(enrolledEvents[0]);
    }
  }

  const checkOwnsTeam = async() => {
    const { data, error } = await supabase
      .from("teams")
      .select("id")
      .eq("owner_id", profile.profile?.profile_id)
      .maybeSingle()

    if (data) {
      setOwnsTeam(true);
      return
    }
    else if (error) {
      console.error("Error checking team ownership: ", error)
    }
    else {
      setOwnsTeam(false);
    }
  }

  const getTeams = async (event: Event) => {
    const { data, error } = await supabase
      .from("teams")
      .select('*')
      .eq('event_id', event.event_id);

    if (error) {
      console.error("Error fetching teams: ", error)
    }
    else {
      setTeams(data ?? [])
    }
  }

  const showBanner = (message: string) => {
    setBannerMessage(message)

    Animated.timing(bannerOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start()

    setTimeout(() => {
      Animated.timing(bannerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start()
    }, 3000)
  }

  const handleEnroll = async (event: Event) => {
    if (enrolledEventId) {
      showBanner("⚠️ You may only enroll in one event at a time");
      return;
    }

    if (event.is_private) {
      const allowed = await isUserAllowedForPrivateEvent(event.event_id, profile.profile?.email || "");
      if (!allowed) {
        showBanner("❌ You are not allowed to join this private event.");
        return;
      }
    }

    setEnrolledEvents([event])
    enrollProfileInEvent(event.event_id)
    getTeams(event)
    showBanner('✅ You have enrolled in the event!');
  };

  const handleUnenroll = (event: Event) => {
     if (profileTeamId != null) {
      showBanner("⚠️ You must leave your team before unenrolling from the event.");
      return;
    }

    setEnrolledEvents([])
    unenrollProfileFromEvent(event.event_id)
    showBanner('❌ You have unenrolled from the event.');
  };

  const filteredEvents = events.filter(event =>
    event.event_name.toLowerCase().includes(search.toLowerCase())
  )

  const availableEvents = filteredEvents.filter(
    event => event.event_id !== enrolledEventId
  )

  const renderEventItem = (event: Event, enrolled = false) => (
    <View style={styles.eventCard}>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.eventTitle}>{event.event_name}</ThemedText>
        <ThemedText style={styles.eventMeta}>
          {event.event_type} • {event.start_date}
        </ThemedText>
      </View>

      <TouchableOpacity
        onPress={() => enrolled ? handleUnenroll(event) : handleEnroll(event)}
        style={[
          styles.actionButton,
          enrolled ? styles.unenrollButton : styles.enrollButton
        ]}
      >
        <ThemedText style={styles.buttonText}>
          {enrolled ? 'Leave' : 'Join'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  )

  const renderTeamItem = (team: Team) => {

    const inTeam = profileTeamId == team.id;

    return (
      <ThemedView style={styles.teamItem}>

        <Pressable style={styles.teamCardLeftInfo}
          onPress={() => setSelectedTeam(team)}
        >
          <ThemedText type='defaultSemiBold' numberOfLines={2}>{team.name}</ThemedText>
          <View style={styles.teamNumUsers}>
            <IconSymbol name="person.2.fill" color="#403a39"/>
            <ThemedText>{team.size} / {enrolledEvents[0].max_team_size}</ThemedText>
          </View>
        </Pressable>

        <View style={styles.teamCardRightInfo}>
          <TouchableOpacity 
            onPress={() => inTeam ? removeProfileFromTeam(team) : addProfileToTeam(team)}
            style={[styles.teamButton, inTeam ? styles.leaveTeamButton : styles.joinTeamButton]}
          >
            <ThemedText type='defaultSemiBold'>
              {inTeam ? "Leave Team" : "Join Team"}
            </ThemedText>
          </TouchableOpacity>

          {profile.profile?.profile_id == team.owner_id &&
            <TouchableOpacity 
              onPress={() => {
                if (team.size > 0) {
                  showBanner("⚠️ Cannot delete a team with members still in it.")
                  return;
                }
                deleteTeam(team)
              }}
            >
              <IconSymbol name="trash.fill" size={24} color="#403a39" />
            </TouchableOpacity>
          }
        </View>
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

    if (error && error.code !== "PGRST116") {
      console.error("Error checking private event:", error);
      return false;
    }

    return !!data;
  };

  return (

    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom:40}}>
    <ThemedView>

      {bannerMessage ? (
        <Animated.View style={[styles.banner, { opacity: bannerOpacity }]}>
          <ThemedText style={styles.bannerText}>{bannerMessage}</ThemedText>
        </Animated.View>
      ) : null}

      <ThemedView style={styles.pageHeader}>
        <ThemedText type="title">Events</ThemedText>
        <ThemedText style={styles.subtitle}>
          Discover and join activity challenges
        </ThemedText>
      </ThemedView>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search events..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {enrolledEvents.length > 0 && (
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle">Your Enrolled Event</ThemedText>

          <FlatList
            data={events.filter(event => enrolledEvents.includes(event))}
            keyExtractor={item => item.event_id.toString()}
            renderItem={({ item }) => renderEventItem(item, true)}
            scrollEnabled={false}
          />

          {enrolledEvents[0].allow_teams && (
          <>
            <ThemedText style={styles.teamHeader}>Create and join teams</ThemedText>

            <TouchableOpacity 
              style={[styles.createTeamButton,
                (profileTeamId != null || ownsTeam) && styles.disabledButton]}
              onPress={() => {
                if (profileTeamId != null) {
                  showBanner("⚠️ You must leave your current team before creating a new one.")
                  return;
                }
                else if (ownsTeam) {
                  showBanner("⚠️ You may only have one team at a time.")
                  return;
                }
                setCreateTeamModalVisible(v => !v)
              }}
            >
              <ThemedText 
                type='defaultSemiBold'
                style={(profileTeamId != null || ownsTeam) && styles.disabledText}
              >
                Create Team
              </ThemedText>
            </TouchableOpacity>

            <FlatList
              data={teams}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => renderTeamItem(item)}
              scrollEnabled={false}
            />

            {teams.length == 0 &&
              <ThemedText>No teams created for this event yet</ThemedText>
            }

            <CreateTeamModal 
              createTeamModalVisible={createTeamModalVisible} 
              setCreateTeamModalVisible={setCreateTeamModalVisible} 
              event={enrolledEvents[0]} 
              getTeams={getTeams} 
              profileId={profile.profile?.profile_id}
              setProfileTeamId={setProfileTeamId}
              setOwnsTeam={setOwnsTeam}
            />

            <TeamDetailModal
              modalVisible={selectedTeam !== null}
              setModalVisible={setSelectedTeam}
              event={enrolledEvents[0]}
              getTeams={getTeams}
              profileId={profile.profile?.profile_id}
              isTeamOwner={profile.profile?.profile_id == selectedTeam?.owner_id}
              team={selectedTeam}
            />
          </>
          )}

        </ThemedView>
      )}

      <View style={styles.section}>
        <ThemedText type="subtitle">Available Events</ThemedText>

        {availableEvents.length > 0 ? (
          <FlatList
            data={availableEvents}
            keyExtractor={item => item.event_id.toString()}
            renderItem={({ item }) => renderEventItem(item)}
            scrollEnabled={false}
          />
        ) : (
          <ThemedText>No events match your search.</ThemedText>
        )}
      </View>

    </ThemedView>
    </ScrollView>
  )
}

export const styles = StyleSheet.create({
  container:{flex:1,padding:20,backgroundColor:'#fff'},
  pageHeader:{marginBottom:20},
  subtitle:{opacity:0.6,marginTop:4},
  searchContainer:{marginBottom:16},
  searchInput:{backgroundColor:'#f3f4f6',paddingVertical:10,paddingHorizontal:14,borderRadius:10},
  section:{marginTop:20},
  sectionContainer:{marginVertical:12},
  eventCard:{flexDirection:'row',alignItems:'center',padding:16,borderRadius:12,marginTop:10,backgroundColor:'#f9fafb',justifyContent:'space-between'},
  eventTitle:{fontWeight:'600',fontSize:16},
  eventMeta:{opacity:0.6,marginTop:2},
  actionButton:{paddingHorizontal:16,paddingVertical:8,borderRadius:8},
  enrollButton:{backgroundColor:'#2563eb'},
  unenrollButton:{backgroundColor:'#ef4444'},
  buttonText:{color:'white',fontWeight:'600'},
  banner:{backgroundColor:'#111827',padding:10,borderRadius:8,marginBottom:12,alignItems:'center'},
  bannerText:{color:'#fff',fontWeight:'bold'},
  teamItem:{backgroundColor:'#c7f1ff',borderRadius:12,padding:0,marginTop:8,marginBottom:8,flexDirection:'row',gap:16,alignItems:'center',justifyContent:'space-between'},
  teamHeader:{fontSize:18,fontWeight:'bold'},
  teamButton:{borderRadius:6,width:100,justifyContent:'center',alignItems:'center',fontWeight:'bold'},
  joinTeamButton:{backgroundColor:'#a7cbed'},
  leaveTeamButton:{backgroundColor:'#ff655a'},
  createTeamButton:{backgroundColor:'#99eeff',borderRadius:6,width:120,marginVertical:8,alignItems:'center'},
  disabledButton:{backgroundColor:'#dff7fb'},
  disabledText:{color:'#b7b6b6'},
  teamNumUsers:{alignItems:'center',flexDirection:'row',gap:4},
  teamCardLeftInfo:{width:'45%',backgroundColor:'#b7b6b6',padding:12,borderStartStartRadius:12,borderBottomStartRadius:12},
  teamCardRightInfo:{width:'50%',flexDirection:'row',justifyContent:'space-between',padding:12}
});