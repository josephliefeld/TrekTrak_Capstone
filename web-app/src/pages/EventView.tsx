import { Link } from 'react-router-dom';
import { supabase } from "@/components/lib/supabase/client";
import { useEffect, useState } from "react";
import React from 'react';
import { useParams } from "react-router-dom";
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
};

export default function EventView() {
  const[event, setEvent] = useState<Event | null>(null);

  const { eventId } = useParams();

  const {userId} = useAuth()
  
  

  const fetchEvents = async () => {
    if (!eventId) return;

    const { data, error } = await supabase.from("events")
    .select("*")
    .eq('event_id', eventId).single();
    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvent(data);
    }
  };

  useEffect(() => {
    fetchEvents();
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
          to={`/events/participants/${event?.event_id}`}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
        >
          Participants
        </Link>
        <Link
          to="teams"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition"
        >
          Teams
        </Link>
        <Link
          to="statistics"
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

      {/* Event Description Section */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
          Event Description
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {event?.event_description}
        </p>
      </div>

      {/* Event Details Section */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
          Event Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <div>
            <span className="font-medium">Privacy:</span>{" "}
            {event?.is_private ? "Private Event" : "Public Event"}
          </div>

          <div>
            <span className="font-medium">Status:</span>{" "}
            {event?.is_published ? "Published" : "Not Published"}
          </div>

          <div>
            <span className="font-medium">Event Type:</span>{" "}
            {event?.event_type}
          </div>

          <div>
            <span className="font-medium">Start Date:</span>{" "}
            {event?.start_date}
          </div>

          <div>
            <span className="font-medium">End Date:</span>{" "}
            {event?.end_date}
          </div>
        </div>
      </div>

    </div>
  </div>
);
}