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
    <div className=" border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-lg font-semibold text-primary font-serif dark:text-gray-100">
        Activity
      </h2>
      {loading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No activity yet.
        </p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {events.slice(0, 15).map((e) => (
            <ActivityItem key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
