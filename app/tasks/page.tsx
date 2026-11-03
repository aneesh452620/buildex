import WorkspaceShell from "../components/workspace-shell";
import TaskBoard from "../components/task-board";
export const metadata = {title: "Tasks | Buildex"};
export default function TasksPage() {
  return <WorkspaceShell active="tasks"><header className="page-header"><div><h1>Tasks</h1><p>Give every next step a priority and a finish line.</p></div></header><TaskBoard /></WorkspaceShell>;
}
