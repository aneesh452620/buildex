"use client";

import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import Icon from "./ui-icon";
import { useProjects } from "./projects-provider";

const NewProjectContext = createContext<(() => void) | null>(null);

export function NewProjectProvider({ children }: { children: ReactNode }) {
  const { addProject, storage, clients } = useProjects();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const previousOverflow = useRef<string | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("To Do");
  const [notice, setNotice] = useState("");
  const [deadline, setDeadline] = useState("");
  const [clientId, setClientId] = useState<number | null>(null);
  const [description, setDescription] = useState("");

  function restoreScrolling() {
    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current;
      previousOverflow.current = null;
    }
  }

  useEffect(() => restoreScrolling, []);

  function openDialog() {
    if (!dialogRef.current || dialogRef.current.open) return;
    setName("");
    setStatus("To Do");
    setNotice("");
    setDeadline("");
    setClientId(null);
    setDescription("");
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current.showModal();
    nameRef.current?.focus();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!addProject(name, status, {deadline, clientId, description})) return;
    setNotice(name.trim());
    dialogRef.current?.close();
  }

  return (
    <NewProjectContext.Provider value={openDialog}>
      {children}
      <dialog
        ref={dialogRef}
        className="project-dialog new-project-dialog"
        aria-labelledby="new-project-title"
        aria-describedby="new-project-description"
        onClose={restoreScrolling}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
            event.currentTarget.close();
          }
        }}
      >
        <div className="project-dialog-header">
          <span className="dialog-symbol"><Icon name="folder" size={23} /></span>
          <button type="button" className="dialog-close" onClick={() => dialogRef.current?.close()} aria-label="Close new project dialog"><span aria-hidden="true">&times;</span></button>
        </div>
        <h2 id="new-project-title">Create a new project</h2>
        <p id="new-project-description">Give your next big idea a place to grow.</p>
        <form onSubmit={submit}>
          <div className="new-project-fields">
            <div className="new-project-field">
              <label htmlFor="new-project-name">Project name</label>
              <input ref={nameRef} id="new-project-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Website redesign" required />
              </div>
            <div className="new-project-field">
              <label htmlFor="new-project-status">Initial status</label>
              <select id="new-project-status" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option>To Do</option><option>In Progress</option><option>Completed</option>
              </select>
              </div>
            <div className="new-project-field new-project-field-wide">
              <label htmlFor="new-project-description-input">Description (optional)</label>
              <textarea id="new-project-description-input" rows={3} maxLength={10000} value={description} onChange={event => setDescription(event.target.value)} />
              </div>
            <div className="new-project-field">
              <label htmlFor="new-project-deadline">Deadline (optional)</label>
              <input id="new-project-deadline" type="date" value={deadline} onChange={event => setDeadline(event.target.value)} />
              </div>
            <div className="new-project-field">
              <label htmlFor="new-project-client">Client (optional)</label>
              <select id="new-project-client" value={clientId ?? ""} onChange={event => setClientId(event.target.value ? Number(event.target.value) : null)}><option value="">No client</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
              </div>
          </div>
          {storage.error && <p className="inline-error" role="alert">{storage.error}</p>}
          <p className="dialog-hint"><Icon name="clock" size={14} />The added date is saved automatically.</p>
          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button type="submit" className="primary-button" disabled={!storage.writable || !name.trim()}><Icon name="plus" size={16} />Create project</button>
          </div>
        </form>
      </dialog>
      {notice && <div className="project-notice"><p role="status"><strong>{notice}</strong> added.</p><Link href="/projects" onClick={() => setNotice("")}>View projects</Link><button type="button" onClick={() => setNotice("")} aria-label="Dismiss project notification">&times;</button></div>}
    </NewProjectContext.Provider>
  );
}

export default function NewProjectButton({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  const openDialog = useContext(NewProjectContext);
  if (!openDialog) throw new Error("NewProjectButton requires NewProjectProvider");
  return <button type="button" className={className} aria-label={label} aria-haspopup="dialog" onClick={openDialog}>{children}</button>;
}
