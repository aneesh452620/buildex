"use client";
import {useEffect, useState} from "react";
import Link from "next/link";
import {useProjects} from "./projects-provider";
import {daysUntil, todayInIndia, formatDate} from "../lib/workspace";

export default function DeadlineReminders() {
  const {projects, tasks, storage} = useProjects();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const interval = setInterval(update, 60000);
    window.addEventListener("focus", update);
    return () => {clearInterval(interval); window.removeEventListener("focus", update);};
  }, []);
  const today = now === null ? "" : todayInIndia(now);
  const reminders = today ? [
    ...projects.filter(p => p.status !== "Completed" && p.deadline).map(p => ({key: "p" + p.id, name: p.name, deadline: p.deadline, type: "Project", href: "/projects/" + p.id})),
    ...tasks.filter(t => !t.completed && t.deadline).map(t => ({key: "t" + t.id, name: t.title, deadline: t.deadline, type: "Task", href: t.projectId ? "/projects/" + t.projectId : "/tasks"})),
  ].map(item => ({...item, days: daysUntil(item.deadline, today)})).filter(item => item.days <= 7).sort((a, b) => a.deadline.localeCompare(b.deadline)) : [];
  return <section className="panel feature-panel reminders-panel"><div className="panel-heading"><div><h2>Deadline reminders</h2><p>Overdue and next 7 days · shown here while you use Buildex.</p></div><span className="project-count">{reminders.length}</span></div>{!storage.ready || !today ? <p role="status">Loading reminders...</p> : reminders.length ? <ul className="reminder-list">{reminders.map(item => <li key={item.key}><div><Link href={item.href}>{item.name}</Link><span>{item.type} · {formatDate(item.deadline)}</span></div><span className={"deadline-pill " + (item.days < 0 ? "overdue" : "")}>{item.days < 0 ? Math.abs(item.days) + "d overdue" : item.days === 0 ? "Due today" : "In " + item.days + " days"}</span></li>)}</ul> : <p className="empty-state">You are all caught up. Set project or task deadlines to see reminders here.</p>}</section>;
}
