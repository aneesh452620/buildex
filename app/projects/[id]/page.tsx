import {Suspense} from "react";
import WorkspaceShell from "../../components/workspace-shell";
import ProjectDetails from "./project-details";
export const metadata = {title: "Project details | Buildex"};
async function ProjectContent({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  return <ProjectDetails id={Number(id)} />;
}
export default function ProjectPage({params}: {params: Promise<{id: string}>}) {
  return <WorkspaceShell active="projects"><Suspense fallback={<p className="panel" role="status">Loading project...</p>}><ProjectContent params={params} /></Suspense></WorkspaceShell>;
}
