import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/components/lib/supabase/client";
import { useAuth } from "../context/useAuth";

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

type LeaderboardEntry = {
  id: number;
  name: string;
  points: number;
  rank: number;
};

export default function Leaderboards() {
  const { eventId } = useParams();
  const { userId } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", eventId)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      return;
    }

    setEvent(data);
  }, [eventId]);

  const fetchLeaderboard = useCallback(async () => {
    if (!eventId) return;

    /*
      Replace this query with your actual leaderboard table/query.

      Example table:
      participant_scores
        - participant_id
        - participant_name
        - event_id
        - points
    */

    const { data, error } = await supabase
      .from("participant_scores")
      .select("*")
      .eq("event_id", eventId)
      .order("points", { ascending: false });

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return;
    }

    const rankedData =
      data?.map((participant, index) => ({
        id: participant.participant_id,
        name: participant.participant_name,
        points: participant.points,
        rank: index + 1,
      })) ?? [];

    setLeaderboard(rankedData);
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
    fetchLeaderboard();
  }, [fetchEvent, fetchLeaderboard]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      {/* Page Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          {event?.event_name} Leaderboards
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
            to={`/events/teams/${eventId}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
          >
            Teams
          </Link>

          <Link
            to={`/events/leaderboards/${eventId}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Leaderboards
          </Link>

          {userId === event?.owner_id && (
            <Link
              to={`/events/edit/${event?.event_id}`}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-black transition"
            >
              Edit
            </Link>
          )}
        </nav>

        {/* Leaderboard Section */}
        <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
              Participant Rankings
            </h2>

            <p className="text-sm text-gray-500">
              Ranked by total points
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-gray-600">
              No leaderboard data available yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Rank
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Participant
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Points
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {leaderboard.map((participant) => (
                    <tr
                      key={participant.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {participant.rank === 1 && "🥇 "}
                        {participant.rank === 2 && "🥈 "}
                        {participant.rank === 3 && "🥉 "}
                        #{participant.rank}
                      </td>

                      <td className="px-6 py-4 text-gray-800">
                        {participant.name}
                      </td>

                      <td className="px-6 py-4 font-semibold text-blue-600">
                        {participant.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}