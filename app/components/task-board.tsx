"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useProjects } from "./projects-provider";
import EditorDialog from "./editor-dialog";
import { priorities, formatDate, type Task, type TaskInput } from "../lib/workspace";

function TaskEditor({ task, projectId, onClose }: {task?: Task; projectId?: number; onClose: () => void}) {
  const {projects, storage, saveTask} = useProjects();
  const [input, setInput] = useState<TaskInput>(task ?? {title: "", projectId: projectId ?? null, priority: "Medium", completed: false, deadline: ""});
  const [error, setError] = useState("");
  function submit(event: FormEvent) {
    event.preventDefault();
    if (saveTask(input, task?.id)) onClose();
    else setError("Could not save this task. Check the fields and browser storage.");
  }
  return <EditorDialog title={task ? "Edit task" : "Create a task"} onClose={onClose}><form onSubmit={submit}>
    <label htmlFor="task-title">Task name</label><input id="task-title" required maxLength={200} value={input.title} onChange={e => setInput({...input, title: e.target.value})} placeholder="What needs to get done?" />
    <label htmlFor="task-project">Project</label><select id="task-project" disabled={projectId !== undefined} value={input.projectId ?? ""} onChange={e => setInput({...input, projectId: e.target.value ? Number(e.target.value) : null})}><option value="">No project</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
    <label htmlFor="task-priority">Priority</label><select id="task-priority" value={input.priority} onChange={e => setInput({...input, priority: e.target.value as TaskInput["priority"]})}>{priorities.map(p => <option key={p}>{p}</option>)}</select>
    <label htmlFor="task-deadline">Deadline (optional)</label><input id="task-deadline" type="date" value={input.deadline} onChange={e => setInput({...input, deadline: e.target.value})} />
    <label className="checkbox-label"><input type="checkbox" checked={input.completed} onChange={e => setInput({...input, completed: e.target.checked})} />Completed</label>
    {error && <p role="alert" className="inline-error">{error}</p>}
    <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={!storage.writable || !input.title.trim()}>Save task</button></div>
  </form></EditorDialog>;
}

export default function TaskBoard({projectId}: {projectId?: number}) {
  const {tasks, projects, storage, completeTask} = useProjects();
  const [editor, setEditor] = useState<Task | "new" | null>(null);
  const [filter, setFilter] = useState("All");
  const [priority, setPriority] = useState("All priorities");
  const [search, setSearch] = useState("");
  const scoped = tasks.filter(task => projectId === undefined || task.projectId === projectId);
  const visible = scoped.filter(task => (filter === "All" || task.completed === (filter === "Completed")) && (priority === "All priorities" || task.priority === priority) && task.title.toLowerCase().includes(search.toLowerCase()));
  return <section className="panel feature-panel">
    <div className="panel-heading"><div><h2>{projectId ? "Project tasks" : "Tasks"}</h2><p>{scoped.filter(t => t.completed).length} of {scoped.length} complete. Task completion is tracked separately from project progress.</p></div><button className="primary-button" disabled={!storage.writable} onClick={() => setEditor("new")}>+ New task</button></div>
    <div className="feature-toolbar"><input aria-label="Search tasks" placeholder="Search tasks" value={search} onChange={e => setSearch(e.target.value)} /><select aria-label="Task completion filter" value={filter} onChange={e => setFilter(e.target.value)}><option>All</option><option>Open</option><option>Completed</option></select><select aria-label="Task priority filter" value={priority} onChange={e => setPriority(e.target.value)}><option>All priorities</option>{priorities.map(p => <option key={p}>{p}</option>)}</select></div>
    {!storage.ready ? <p role="status">Loading tasks...</p> : <ul className="record-list">{visible.map(task => <li key={task.id} className={task.completed ? "task-row done" : "task-row"}><input type="checkbox" aria-label={"Mark " + task.title + (task.completed ? " incomplete" : " complete")} checked={task.completed} disabled={!storage.writable} onChange={e => completeTask(task.id, e.target.checked)} /><div className="record-main"><strong>{task.title}</strong><div className="record-meta">{task.projectId ? <Link href={"/projects/" + task.projectId}>{projects.find(p => p.id === task.projectId)?.name}</Link> : <span>Unassigned</span>}{task.deadline && <span>Due {formatDate(task.deadline)}</span>}</div></div><span className={"priority-badge priority-" + task.priority.toLowerCase()}>{task.priority}</span><button className="text-button" onClick={() => setEditor(task)}>Edit<span className="sr-only"> {task.title}</span></button></li>)}</ul>}
    {storage.ready && !visible.length && <p className="empty-state">No tasks here yet. Create a task or adjust your filters.</p>}
    {editor && <TaskEditor task={editor === "new" ? undefined : editor} projectId={projectId} onClose={() => setEditor(null)} />}
  </section>;
}
