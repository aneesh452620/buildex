"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { initialWorkspace, legacyKey, workspaceKey, migrateProjects, parseWorkspace, projectStatuses, priorities, nextId, statusForProgress, isDate, type Workspace, type ProjectInput, type TaskInput, type ClientInput, type Attachment } from "../lib/workspace";

export const statuses = ["All projects", ...projectStatuses];
type ContextValue = Workspace & {
  storage: { ready: boolean; error: string; writable: boolean };
  addProject: (name: string, status: string, extra?: { deadline?: string; clientId?: number | null; description?: string }) => boolean;
  updateProject: (id: number, input: ProjectInput) => boolean;
  saveTask: (input: TaskInput, id?: number) => boolean;
  completeTask: (id: number, completed: boolean) => boolean;
  saveClient: (input: ClientInput, id?: number) => boolean;
  addComment: (projectId: number, text: string) => boolean;
  addAttachment: (projectId: number, file: Attachment) => boolean;
  toggleTheme: () => void;
};
const Context = createContext<ContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const current = useRef(initialWorkspace);
  const writable = useRef(false);
  const [storage, setStorage] = useState({ ready: false, error: "", writable: false });

  useEffect(() => {
    let data = initialWorkspace;
    let error = "";
    try {
      const saved = localStorage.getItem(workspaceKey);
      const legacy = localStorage.getItem(legacyKey);
      data = saved !== null ? parseWorkspace(JSON.parse(saved)) : legacy !== null ? migrateProjects(JSON.parse(legacy)) : initialWorkspace;
      writable.current = true;
    } catch (problem) {
      error = problem instanceof Error ? problem.message : "Browser storage is unavailable.";
    }
    current.current = data;
    // Restore external browser storage after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWorkspace(data);
    setStorage({ ready: true, error, writable: writable.current });
  }, []);

  useEffect(() => { document.documentElement.dataset.theme = workspace.theme; }, [workspace.theme]);

  function commit(change: (data: Workspace) => Workspace): boolean {
    if (!writable.current) return false;
    try {
      const next = parseWorkspace(change(current.current));
      localStorage.setItem(workspaceKey, JSON.stringify(next));
      current.current = next;
      setWorkspace(next);
      setStorage({ ready: true, error: "", writable: true });
      return true;
    } catch (problem) {
      const detail = problem instanceof Error ? problem.message : "Browser storage is unavailable.";
      setStorage({ ready: true, writable: true, error: "Changes were not saved. " + detail });
      return false;
    }
  }

  function addProject(name: string, status: string, extra: { deadline?: string; clientId?: number | null; description?: string } = {}) {
    if (!name.trim() || !projectStatuses.includes(status as typeof projectStatuses[number]) || !isDate(extra.deadline ?? "")) return false;
    return commit(data => ({
      ...data, projects: [...data.projects, {
        id: nextId(data.projects), name: name.trim(), status: status as typeof projectStatuses[number], createdAt: new Date().toISOString(),
        description: extra.description?.trim() ?? "", progress: status === "Completed" ? 100 : status === "In Progress" ? 50 : 0,
        deadline: extra.deadline ?? "", clientId: extra.clientId ?? null, comments: [], attachments: [],
      }]
    }));
  }
  function updateProject(id: number, input: ProjectInput) {
    if (!input.name.trim() || !Number.isInteger(input.progress) || input.progress < 0 || input.progress > 100 || !isDate(input.deadline)) return false;
    return commit(data => {
      if (!data.projects.some(project => project.id === id)) throw new Error("Project not found.");
      return { ...data, projects: data.projects.map(project => project.id === id ? { ...project, ...input, name: input.name.trim(), status: statusForProgress(input.progress) } : project) };
    });
  }
  function saveTask(input: TaskInput, id?: number) {
    if (!input.title.trim() || !priorities.includes(input.priority) || !isDate(input.deadline)) return false;
    return commit(data => {
      if (id !== undefined && !data.tasks.some(task => task.id === id)) throw new Error("Task not found.");
      const values = { ...input, title: input.title.trim() };
      return { ...data, tasks: id === undefined ? [...data.tasks, { ...values, id: nextId(data.tasks), createdAt: new Date().toISOString() }] : data.tasks.map(task => task.id === id ? { ...task, ...values } : task) };
    });
  }
  function completeTask(id: number, completed: boolean) { return commit(data => ({ ...data, tasks: data.tasks.map(task => task.id === id ? { ...task, completed } : task) })); }
  function saveClient(input: ClientInput, id?: number) {
    if (!input.name.trim() || (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))) return false;
    return commit(data => {
      if (id !== undefined && !data.clients.some(client => client.id === id)) throw new Error("Client not found.");
      const values = { name: input.name.trim(), email: input.email.trim(), phone: input.phone.trim(), company: input.company.trim() };
      return { ...data, clients: id === undefined ? [...data.clients, { ...values, id: nextId(data.clients) }] : data.clients.map(client => client.id === id ? { ...client, ...values } : client) };
    });
  }
  function addComment(projectId: number, text: string) {
    if (!text.trim() || text.length > 10000) return false;
    return commit(data => {
      if (!data.projects.some(project => project.id === projectId)) throw new Error("Project not found.");
      return { ...data, projects: data.projects.map(project => project.id === projectId ? { ...project, comments: [...project.comments, { id: crypto.randomUUID(), text: text.trim(), createdAt: new Date().toISOString() }] } : project) };
    });
  }
  function addAttachment(projectId: number, file: Attachment) {
    return commit(data => {
      if (!data.projects.some(project => project.id === projectId)) throw new Error("Project not found.");
      return { ...data, projects: data.projects.map(project => project.id === projectId ? { ...project, attachments: [...project.attachments, file] } : project) };
    });
  }
  function toggleTheme() { commit(data => ({ ...data, theme: data.theme === "light" ? "dark" : "light" })); }

  return <Context.Provider value={{ ...workspace, storage, addProject, updateProject, saveTask, completeTask, saveClient, addComment, addAttachment, toggleTheme }}>{children}</Context.Provider>;
}
export function useProjects() {
  const context = useContext(Context);
  if (!context) throw new Error("useProjects requires ProjectsProvider");
  return context;
}
