"use client";

import dynamic from "next/dynamic";

const ProjectActions = dynamic(
  () => import("./ProjectActions").then((mod) => mod.default),
  { ssr: false },
);

export default ProjectActions;
