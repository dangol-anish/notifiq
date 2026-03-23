"use client";

import { useRouter } from "next/navigation";
import ProjectActions from "./ProjectActions";
import { truncateWords } from "@/lib/truncate";

interface Props {
  project: any;
  slug: string;
  canEdit: boolean;
}

export default function ProjectCard({ project, slug, canEdit }: Props) {
  const router = useRouter();

  const total = Number(project.total_tasks) || 0;
  const completed = Number(project.completed_tasks) || 0;
  const inProgress = Number(project.in_progress_tasks) || 0;
  const todo = Number(project.todo_tasks) || 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const archived = project.status === "archived";

  return (
    <div
      onClick={() => router.push(`/${slug}/projects/${project.id}`)}
      className={`relative cursor-pointer border bg-white p-6 transition-all dark:bg-gray-900 ${
        archived
          ? "border-dashed border-gray-200 opacity-95 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
          : "border-gray-200 hover:border-secondary hover:shadow-sm dark:border-gray-800 dark:hover:border-blue-500"
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className=" text-md font-semibold text-primary font-serif dark:text-gray-100">
          {truncateWords(project.name, 30)}
        </h3>
        <div onClick={(e) => e.stopPropagation()}>
          <ProjectActions project={project} slug={slug} canEdit={canEdit} />
        </div>
      </div>

      {project.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {truncateWords(project.description, 30)}
        </p>
      )}

      {/* Task counts */}
      {/* {total > 0 && (
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-gray-400">{todo} to do</span>
          <span className="text-xs text-grey-500">
            {inProgress} in progress
          </span>
          <span className="text-xs text-green-500">{completed} done</span>
        </div>
      )} */}

      {/* Progress bar */}
      {total > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">{progress}% complete</span>
            <span className="text-xs text-gray-400">{total} tasks</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {total === 0 && (
        <p className="text-xs text-gray-400 mt-3">No tasks yet</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <span
          className={`text-xs mt-2 px-2 first-letter:uppercase py-1 rounded-sm ${
            archived
              ? "bg-gray-200 text-gray-600"
              : project.status === "active" || !project.status
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {archived ? "archived" : project.status || "active"}
        </span>
      </div>
    </div>
  );
}
