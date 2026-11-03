"use client";

import Link from "next/link";
import Icon from "./components/ui-icon";
import WorkspaceShell from "./components/workspace-shell";
import { useProjects } from "./components/projects-provider";
import NewProjectButton from "./components/new-project-dialog";
import DeadlineReminders from "./components/deadline-reminders";

export default function Home() {
  const { projects } = useProjects();

  const completed = projects.filter((project) => project.status === "Completed").length;
  const active = projects.filter((project) => project.status === "In Progress").length;
  const todo = projects.filter((project) => project.status === "To Do").length;
  const progress = projects.length ? Math.round(completed / projects.length * 100) : 0;
  const breakdown = [
    { label: "Completed", count: completed, color: "blue", icon: "check" as const },
    { label: "In Progress", count: active, color: "violet", icon: "clock" as const },
    { label: "To Do", count: todo, color: "coral", icon: "folder" as const },
  ];
  const stats = [
    { label: "Total Projects", value: projects.length, detail: "Projects in your workspace", icon: "report" as const, badge: "Overview" },
    { label: "Completed", value: completed, detail: "Projects successfully finished", icon: "check" as const, badge: progress + "% done" },
    { label: "In Progress", value: active, detail: "Ideas currently taking shape", icon: "clock" as const, badge: "In motion" },
    { label: "To Do", value: todo, detail: "Projects ready to get started", icon: "folder" as const, badge: "Up next" },
  ];

  return (
    <WorkspaceShell active="report">
        <header className="page-header">
          <div><h1>Project Report</h1><p>A little clarity for everything you’re building.</p></div>
          <div className="header-actions"><Link href="/projects#project-search" className="icon-button" aria-label="Search projects"><Icon name="search" /></Link><NewProjectButton className="icon-button" label="Add a project"><Icon name="plus" /></NewProjectButton><div className="profile"><span className="avatar">B</span><div><strong>Your workspace</strong><span>Personal account</span></div></div></div>
        </header>

        <div className="dashboard-grid" id="report">
          <div className="dashboard-primary">
            <section className="stats" aria-label="Project summary">
              {stats.map((stat, index) => <article key={stat.label} className={"stat-card" + (index === 0 ? " featured" : "")}><div className="stat-top"><span className="stat-icon"><Icon name={stat.icon} size={20} /></span><span className={"stat-pill pill-" + index}>{stat.badge}</span></div><p className="stat-label">{stat.label}</p><div className="stat-bottom"><strong>{String(stat.value).padStart(2, "0")}</strong><span>{stat.detail}</span></div></article>)}
            </section>

            <section className="panel activity-panel" aria-labelledby="activity-heading">
              <div className="panel-heading"><div><h2 id="activity-heading">Project Overview</h2><p>See where your work stands</p></div><span className="period-label">All projects</span></div>
              <div className="chart-legend"><span><i className="legend-total" />Total projects</span><span><i className="legend-status" />By status</span></div>
              <div className="bar-chart" role="img" aria-label={"Of " + projects.length + " total projects, " + completed + " are completed, " + active + " are in progress, and " + todo + " are to do."}>
                <div className="chart-axis"><span>{projects.length || 1}</span><span>{(projects.length || 1) / 2}</span><span>0</span></div>
                <div className="chart-plot">{breakdown.map((item) => <div className="bar-group" key={item.label}><div className="bar-pair"><div className="bar total-bar" style={{ height: projects.length ? "100%" : "0%" }} /><div className={"bar status-bar " + item.color} style={{ height: (projects.length ? item.count / projects.length * 100 : 0) + "%" }}><span className="bar-value">{item.count}</span></div></div><span className="bar-label">{item.label}</span></div>)}</div>
              </div>
              <div className="chart-footer"><span className="live-dot" />{progress}% complete<span>{projects.length - completed} projects remaining</span></div>
            </section>
          </div>

          <div className="dashboard-secondary">
            <section className="panel distribution-panel" aria-labelledby="distribution-heading">
              <div className="panel-heading"><div><h2 id="distribution-heading">Project Statistics</h2><p>A snapshot of your progress</p></div></div>
              <div className="ring-chart">
                <svg viewBox="0 0 240 220" role="img" aria-label={progress + "% of projects completed"}>
                  {breakdown.map((item, index) => {
                    const radius = 86 - index * 19;
                    const length = 2 * Math.PI * radius;
                    const ratio = projects.length ? item.count / projects.length : 0;
                    return <g key={item.label} transform="rotate(90 112 110)"><circle className="ring-track" cx="112" cy="110" r={radius} strokeDasharray={length * .75 + " " + length} /><circle className={"ring-fill " + item.color} cx="112" cy="110" r={radius} strokeDasharray={length * .75 * ratio + " " + length} opacity={ratio ? 1 : 0} /></g>;
                  })}
                </svg>
                <div className="ring-summary"><strong>{String(projects.length).padStart(2, "0")}</strong><span>Total projects</span><b>{progress}% done</b></div>
              </div>
              <ul className="distribution-list">{breakdown.map((item) => <li key={item.label}><span className={"distribution-icon " + item.color}><Icon name={item.icon} size={16} /></span><span>{item.label}</span><strong>{String(item.count).padStart(2, "0")}</strong><span className={"percentage " + item.color}>{projects.length ? Math.round(item.count / projects.length * 100) : 0}%</span></li>)}</ul>
            </section>


          </div>
        </div>

        <DeadlineReminders />
    </WorkspaceShell>
  );
}
