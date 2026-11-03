export const projectStatuses = ["To Do", "In Progress", "Completed"] as const;
export const priorities = ["Low", "Medium", "High"] as const;
export type Status = typeof projectStatuses[number];
export type Priority = typeof priorities[number];
export type Comment = { id: string; text: string; createdAt: string };
export type Attachment = { id: string; name: string; size: number; createdAt: string };
export type Project = { id: number; name: string; status: Status; createdAt?: string; description: string; progress: number; deadline: string; clientId: number | null; comments: Comment[]; attachments: Attachment[] };
export type Task = { id: number; title: string; projectId: number | null; priority: Priority; completed: boolean; deadline: string; createdAt: string };
export type Client = { id: number; name: string; email: string; phone: string; company: string };
export type Workspace = { version: 2; projects: Project[]; tasks: Task[]; clients: Client[]; theme: "light" | "dark" };
export type ProjectInput = Pick<Project, "name" | "description" | "progress" | "deadline" | "clientId">;
export type TaskInput = Omit<Task, "id" | "createdAt">;
export type ClientInput = Omit<Client, "id">;
export const workspaceKey = "buildex.workspace.v2";
export const legacyKey = "buildex.projects.v1";
export const nextId = (items: { id: number }[]) => Math.max(0, ...items.map(item => item.id)) + 1;
export function statusForProgress(progress: number): Status { return progress === 100 ? "Completed" : progress === 0 ? "To Do" : "In Progress"; }
export function isDate(value: string) { return value === "" || (/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value); }
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const id = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v > 0;
const text = (v: unknown): v is string => typeof v === "string";
const timestamp = (v: unknown): v is string => text(v) && Number.isFinite(Date.parse(v));
function baseProject(v: unknown): boolean { return record(v) && id(v.id) && text(v.name) && !!v.name.trim() && projectStatuses.includes(v.status as Status) && (v.createdAt === undefined || timestamp(v.createdAt)); }
function unique(items: {id: number | string}[]) { return new Set(items.map(item => item.id)).size === items.length; }
export function migrateProjects(value: unknown): Workspace {
  if (!Array.isArray(value) || !value.every(baseProject) || !unique(value)) throw new Error("Saved projects are not valid. Your original data has been kept.");
  const projects = (value as Pick<Project, "id" | "name" | "status" | "createdAt">[]).map(project => ({ ...project, description: "", progress: project.status === "Completed" ? 100 : project.status === "In Progress" ? 50 : 0, deadline: "", clientId: null, comments: [], attachments: [] }));
  return {version: 2, projects, tasks: [], clients: [], theme: "light"};
}
export const initialWorkspace = migrateProjects([{id: 1, name: "Business Website", status: "In Progress"}, {id: 2, name: "Portfolio Design", status: "Completed"}, {id: 3, name: "Shopping App", status: "To Do"}]);
export function parseWorkspace(value: unknown): Workspace {
  if (!record(value) || value.version !== 2 || !["light", "dark"].includes(value.theme as string) || !Array.isArray(value.projects) || !Array.isArray(value.tasks) || !Array.isArray(value.clients)) throw new Error("Saved workspace could not be read. Your data has been kept.");
  const clientsValid = value.clients.every(c => record(c) && id(c.id) && text(c.name) && !!c.name.trim() && text(c.email) && text(c.phone) && text(c.company));
  const projectsValid = value.projects.every(p => record(p) && baseProject(p) && text(p.description) && typeof p.progress === "number" && Number.isInteger(p.progress) && p.progress >= 0 && p.progress <= 100 && p.status === statusForProgress(p.progress) && text(p.deadline) && isDate(p.deadline) && (p.clientId === null || id(p.clientId)) && Array.isArray(p.comments) && p.comments.every(c => record(c) && text(c.id) && text(c.text) && timestamp(c.createdAt)) && Array.isArray(p.attachments) && p.attachments.every(a => record(a) && text(a.id) && text(a.name) && typeof a.size === "number" && a.size >= 0 && timestamp(a.createdAt)));
  const tasksValid = value.tasks.every(t => record(t) && id(t.id) && text(t.title) && !!t.title.trim() && (t.projectId === null || id(t.projectId)) && priorities.includes(t.priority as Priority) && typeof t.completed === "boolean" && text(t.deadline) && isDate(t.deadline) && timestamp(t.createdAt));
  if (!clientsValid || !projectsValid || !tasksValid) throw new Error("Saved workspace contains invalid records. Your data has been kept.");
  const workspace = value as unknown as Workspace;
  if (!unique(workspace.projects) || !unique(workspace.tasks) || !unique(workspace.clients) || workspace.projects.some(p => p.clientId !== null && !workspace.clients.some(c => c.id === p.clientId)) || workspace.tasks.some(t => t.projectId !== null && !workspace.projects.some(p => p.id === t.projectId))) throw new Error("Saved links could not be read. Your data has been kept.");
  return workspace;
}
export function todayInIndia(now: number) {
  const parts = new Intl.DateTimeFormat("en-CA", {timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(now);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
}
export function daysUntil(deadline: string, today: string) { return Math.round((Date.parse(deadline) - Date.parse(today)) / 86400000); }
export function formatDate(value: string) { return new Intl.DateTimeFormat("en-IN", {day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata"}).format(new Date(value)); }
