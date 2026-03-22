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
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Activity
      </h2>
      {loading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No activity yet.
        </p>
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
