import { Suspense } from "react";
import NewProjectButton from "../components/new-project-dialog";
import type { Metadata } from "next";
import Icon from "../components/ui-icon";
import WorkspaceShell from "../components/workspace-shell";
import ProjectList from "./project-list";

export const metadata: Metadata = { title: "Projects | Buildex" };

export default function ProjectsPage() {
  return (
    <WorkspaceShell active="projects">
      <header className="page-header">
        <div><h1>Your Projects</h1><p>Find, organize, and keep track of everything you are building.</p></div>
        <NewProjectButton className="primary-button"><Icon name="plus" size={16} />New project</NewProjectButton>
      </header>
      <Suspense fallback={<p className="panel" role="status">Loading projects...</p>}>
        <ProjectList />
      </Suspense>
    </WorkspaceShell>
  );
}
