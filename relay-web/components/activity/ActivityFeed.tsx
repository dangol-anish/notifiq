"use client";

import { useEffect, useState } from "react";
import ActivityItem from "./ActivityItem";

interface Props {
  slug: string;
}

export default function ActivityFeed({ slug }: Props) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workspaces/${slug}/activity`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Activity</h2>
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400">No activity yet.</p>
      ) : (
        <div className="space-y-4">
          {events.map((e) => (
            <ActivityItem key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
