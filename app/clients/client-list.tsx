"use client";
import {useState, type FormEvent} from "react";
import Link from "next/link";
import {useProjects} from "../components/projects-provider";
import EditorDialog from "../components/editor-dialog";
import type {Client, ClientInput} from "../lib/workspace";

function ClientEditor({client, onClose}: {client?: Client; onClose: () => void}) {
  const {saveClient, storage} = useProjects();
  const [input, setInput] = useState<ClientInput>(client ?? {name: "", email: "", phone: "", company: ""});
  const [error, setError] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); if (saveClient(input, client?.id)) onClose(); else setError("Could not save this client. Check the contact details and browser storage."); }
  return <EditorDialog title={client ? "Edit client" : "Add a client"} onClose={onClose}><form onSubmit={submit}>
    <label htmlFor="client-name">Client name</label><input id="client-name" required maxLength={200} value={input.name} onChange={e => setInput({...input, name: e.target.value})} />
    <label htmlFor="client-company">Company (optional)</label><input id="client-company" value={input.company} onChange={e => setInput({...input, company: e.target.value})} />
    <label htmlFor="client-email">Email (optional)</label><input id="client-email" type="email" value={input.email} onChange={e => setInput({...input, email: e.target.value})} />
    <label htmlFor="client-phone">Phone (optional)</label><input id="client-phone" type="tel" value={input.phone} onChange={e => setInput({...input, phone: e.target.value})} />
    {error && <p role="alert" className="inline-error">{error}</p>}
    <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!storage.writable || !input.name.trim()}>Save client</button></div>
  </form></EditorDialog>;
}
export default function ClientList() {
  const {clients, projects, storage} = useProjects();
  const [editor, setEditor] = useState<Client | "new" | null>(null);
  const [search, setSearch] = useState("");
  const visible = clients.filter(client => [client.name, client.company, client.email, client.phone].join(" ").toLowerCase().includes(search.toLowerCase()));
  return <section className="panel feature-panel"><div className="panel-heading"><div><h2>Your clients <span className="project-count">{clients.length}</span></h2><p>Contact details and the work you are doing together.</p></div><button className="primary-button" onClick={() => setEditor("new")} disabled={!storage.writable}>+ Add client</button></div>
    <div className="feature-toolbar"><input aria-label="Search clients" placeholder="Search names, companies, or contact details" value={search} onChange={e => setSearch(e.target.value)} /></div>
    {!storage.ready ? <p role="status">Loading clients...</p> : <ul className="client-grid">{visible.map(client => {
      const linked = projects.filter(project => project.clientId === client.id);
      return <li className="client-card" key={client.id}><div className="panel-heading"><span className="client-avatar" aria-hidden="true">{client.name.charAt(0).toUpperCase()}</span><button className="text-button" onClick={() => setEditor(client)}>Edit<span className="sr-only"> {client.name}</span></button></div><h3>{client.name}</h3>{client.company && <p>{client.company}</p>}<dl className="contact-details"><div><dt>Email</dt><dd>{client.email || "Not provided"}</dd></div><div><dt>Phone</dt><dd>{client.phone || "Not provided"}</dd></div></dl><div className="linked-projects"><strong>{linked.length} linked {linked.length === 1 ? "project" : "projects"}</strong>{linked.map(p => <Link key={p.id} href={"/projects/" + p.id}>{p.name}<span aria-hidden="true"> →</span></Link>)}{!linked.length && <p>Assign this client from a project’s details.</p>}</div></li>;
    })}</ul>}
    {storage.ready && !visible.length && <p className="empty-state">No clients found. Add your first client to start connecting your work.</p>}
    {editor && <ClientEditor client={editor === "new" ? undefined : editor} onClose={() => setEditor(null)} />}
  </section>;
}
