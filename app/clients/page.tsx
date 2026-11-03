import WorkspaceShell from "../components/workspace-shell";
import ClientList from "./client-list";
export const metadata = {title: "Clients | Buildex"};
export default function ClientsPage() {
  return <WorkspaceShell active="clients"><header className="page-header"><div><h1>Clients</h1><p>Keep your relationships and their projects connected.</p></div></header><ClientList /></WorkspaceShell>;
}

