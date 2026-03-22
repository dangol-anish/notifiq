"use client";

import { truncateWords } from "@/lib/truncate";
import Link from "next/link";

interface Props {
  workspace: {
    id: string;
    name: string;
    slug: string;
    role: string;
    created_at: string;
  };
}

export default function WorkspaceCard({ workspace }: Props) {
  return (
    <Link href={`/${workspace.slug}`}>
      <div className="cursor-pointer  bg-[#A07855]/10 p-6 transition-all hover:border-[#A07855] hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10  bg-primary rounded-sm flex items-center justify-center text-white font-bold text-lg">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <span className=" first-letter:uppercase rounded-sm  bg-secondary/90 px-2 py-1 text-xs text-white font-bold dark:bg-gray-800 dark:text-gray-400">
            {workspace.role}
          </span>
        </div>
        <h3 className="mt-3 font-semibold text-primary dark:text-gray-100 first-letter:uppercase mt-7">
          {truncateWords(workspace.name, 10)}
        </h3>
        <p className="mt-1 text-xs text-secondary font-semibold tracking-wide dark:text-gray-500">
          Created {new Date(workspace.created_at).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
