"use client";

import { useRouter } from "next/navigation";
import ProjectActions from "./ProjectActions";

interface Props {
  project: any;
  slug: string;
  canEdit: boolean;
}

export default function ProjectCard({ project, slug, canEdit }: Props) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/${slug}/projects/${project.id}`)}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer relative"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900">{project.name}</h3>
        <div onClick={(e) => e.stopPropagation()}>
          <ProjectActions project={project} slug={slug} canEdit={canEdit} />
        </div>
      </div>
      {project.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {project.description}
        </p>
      )}
      <span
        className={`mt-3 inline-block text-xs px-2 py-1 rounded-full ${
          project.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {project.status}
      </span>
    </div>
  );
}
