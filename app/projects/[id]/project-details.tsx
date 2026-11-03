"use client";
import {useState, type FormEvent, type ChangeEvent} from "react";
import Link from "next/link";
import {useProjects} from "../../components/projects-provider";
import EditorDialog from "../../components/editor-dialog";
import TaskBoard from "../../components/task-board";
import {formatDate, statusForProgress, type Project, type ProjectInput} from "../../lib/workspace";
import {saveFile, downloadFile, deleteFile} from "../../lib/files";

function ProjectEditor({project, onClose}: {project: Project; onClose: () => void}) {
  const {clients, storage, updateProject} = useProjects();
  const [input, setInput] = useState<ProjectInput>({name: project.name, description: project.description, progress: project.progress, deadline: project.deadline, clientId: project.clientId});
  const [error, setError] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); if (updateProject(project.id, input)) onClose(); else setError("Could not save this project. Check the fields and browser storage."); }
  return <EditorDialog title="Edit project" onClose={onClose}><form onSubmit={submit}>
    <label htmlFor="edit-project-name">Project name</label><input id="edit-project-name" required maxLength={200} value={input.name} onChange={e => setInput({...input, name: e.target.value})} />
    <label htmlFor="project-description">Description</label><textarea id="project-description" rows={3} maxLength={10000} value={input.description} onChange={e => setInput({...input, description: e.target.value})} />
    <label htmlFor="project-progress">Progress: {input.progress}% · {statusForProgress(input.progress)}</label><input id="project-progress" type="range" min="0" max="100" step="1" value={input.progress} onChange={e => setInput({...input, progress: Number(e.target.value)})} />
    <label htmlFor="project-deadline">Deadline (optional)</label><input id="project-deadline" type="date" value={input.deadline} onChange={e => setInput({...input, deadline: e.target.value})} />
    <label htmlFor="project-client">Client</label><select id="project-client" value={input.clientId ?? ""} onChange={e => setInput({...input, clientId: e.target.value ? Number(e.target.value) : null})}><option value="">No client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    {error && <p role="alert" className="inline-error">{error}</p>}
    <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!storage.writable || !input.name.trim()}>Save changes</button></div>
  </form></EditorDialog>;
}

export default function ProjectDetails({id}: {id: number}) {
  const {projects, clients, storage, addComment, addAttachment} = useProjects();
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [fileError, setFileError] = useState("");
  const [busy, setBusy] = useState(false);
  const project = projects.find(p => p.id === id);
  if (!storage.ready) return <p className="panel" role="status">Loading saved project...</p>;
  if (!project) return <section className="panel feature-panel"><h1>Project not found</h1><p>This project is not available in this browser.</p><Link className="text-button" href="/projects">Back to projects</Link></section>;
  const client = clients.find(c => c.id === project.clientId);
  function postComment(event: FormEvent) {
    event.preventDefault();
    if (addComment(id, comment)) {setComment(""); setFeedback("Comment added.");}
    else setFeedback("Comment could not be saved. Check browser storage.");
  }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setFileError("");
    if (file.size > 10 * 1024 * 1024) {setFileError("Please choose a file smaller than 10 MB."); input.value = ""; return;}
    setBusy(true);
    const fileId = crypto.randomUUID();
    try {
      await saveFile(fileId, file);
      if (!addAttachment(id, {id: fileId, name: file.name, size: file.size, createdAt: new Date().toISOString()})) {
        await deleteFile(fileId);
        throw new Error("The attachment record could not be saved. Please check browser storage.");
      }
      setFeedback("File attached.");
    } catch (error) {setFileError(error instanceof Error ? error.message : "File could not be attached.");}
    finally {setBusy(false); input.value = "";}
  }
  return <>
    <Link href="/projects" className="back-link">← All projects</Link>
    <header className="page-header detail-header"><div><h1>{project.name}</h1><p>PRJ-{String(project.id).padStart(3, "0")} · {project.createdAt ? "Added " + formatDate(project.createdAt) : "Added date unavailable"}</p></div><button className="primary-button" disabled={!storage.writable} onClick={() => setEditing(true)}>Edit project</button></header>
    <section className="panel feature-panel"><div className="panel-heading"><h2>Project details</h2><span className={"status-badge " + (project.status === "Completed" ? "complete" : project.status === "In Progress" ? "in-progress" : "todo")}>{project.status}</span></div><p className="project-description">{project.description || "Add a description to capture the goals and scope of this project."}</p><dl className="detail-facts"><div><dt>Client</dt><dd>{client ? <Link href="/clients">{client.name}</Link> : "No client assigned"}</dd></div><div><dt>Deadline</dt><dd>{project.deadline ? <time dateTime={project.deadline}>{formatDate(project.deadline)}</time> : "Not set"}</dd></div><div><dt>Progress</dt><dd>{project.progress}%</dd></div></dl><progress className="project-progress" value={project.progress} max={100} aria-label="Project progress" /></section>
    <TaskBoard projectId={id} />
    <div className="detail-grid">
      <section className="panel feature-panel"><div className="panel-heading"><div><h2>Comments</h2><p>Notes and updates for this project.</p></div><span className="project-count">{project.comments.length}</span></div><ul className="comment-list">{project.comments.map(item => <li key={item.id}><div><strong>You</strong><time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time></div><p>{item.text}</p></li>)}</ul>{!project.comments.length && <p className="empty-state">No comments yet.</p>}<form className="comment-form" onSubmit={postComment}><label htmlFor="project-comment">Add a comment</label><textarea id="project-comment" required rows={3} maxLength={10000} value={comment} onChange={e => setComment(e.target.value)} placeholder="Share an update or leave a note..." /><button className="primary-button" disabled={!storage.writable || !comment.trim()}>Post comment</button></form></section>
      <section className="panel feature-panel"><div className="panel-heading"><div><h2>Attachments</h2><p>Files are stored in this browser. Up to 10 MB each.</p></div></div><label className="upload-field">{busy ? "Saving file..." : "Choose a file to attach"}<input type="file" aria-label="Attach file to project" disabled={busy || !storage.writable} onChange={upload} /></label>{fileError && <p role="alert" className="inline-error">{fileError}</p>}<ul className="attachment-list">{project.attachments.map(file => <li key={file.id}><div><strong>{file.name}</strong><span>{(file.size / 1024).toFixed(1)} KB · {formatDate(file.createdAt)}</span></div><button className="text-button" onClick={async () => {try {await downloadFile(file.id, file.name); setFileError("");} catch(error) {setFileError(error instanceof Error ? error.message : "Download failed.");}}}>Download<span className="sr-only"> {file.name}</span></button></li>)}</ul>{!project.attachments.length && <p className="empty-state">No files attached yet.</p>}</section>
    </div>
    {feedback && <p role="status" className="feature-feedback">{feedback}</p>}
    {editing && <ProjectEditor project={project} onClose={() => setEditing(false)} />}
  </>;
}
