"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Icon from "../components/ui-icon";
import { useProjects, statuses } from "../components/projects-provider";

const addedDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export default function ProjectList() {
  const { projects, clients, storage } = useProjects();
  const [search, setSearch] = useState("");
  const params = useSearchParams();
  const requestedStatus = params.get("status") ?? "All projects";
  const filter = statuses.includes(requestedStatus) ? requestedStatus : "All projects";
  const visibleProjects = projects.filter((project) =>
    (filter === "All projects" || project.status === filter) &&
    project.name.toLowerCase().includes(search.trim().toLowerCase())
  );
  if (!storage.ready) return <p className="panel" role="status">Loading saved projects...</p>;
  return (
        <section className="panel projects-panel" id="projects" aria-labelledby="projects-heading">
          <div className="panel-heading"><div><h2 id="projects-heading">Your Projects <span className="project-count">{projects.length}</span></h2><p>Big ideas, neatly organized</p></div><label className="search-field"><Icon name="search" size={16} /><input id="project-search" type="search" aria-label="Search projects" placeholder="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
          <div className="filter-tabs" aria-label="Filter projects">{statuses.map((status) => <Link key={status} href={status === "All projects" ? "/projects" : "/projects?status=" + encodeURIComponent(status)} scroll={false} className={filter === status ? "selected" : ""} aria-current={filter === status ? "page" : undefined}>{status}</Link>)}</div>
          <ul className="project-list">{visibleProjects.map((project) => <li className="project-card" key={project.id}><div className="project-card-top"><span className="folder-icon"><Icon name="folder" /></span><span className="project-reference">PRJ-{String(project.id).padStart(3, "0")}</span></div><h3><Link href={"/projects/" + project.id}>{project.name}</Link></h3><p className="project-date"><Icon name="clock" size={13} />{project.createdAt ? <span>Added <time dateTime={project.createdAt}>{addedDateFormatter.format(new Date(project.createdAt))}</time></span> : <span>Date unavailable</span>}</p><div className="project-card-bottom"><span className={"status-badge " + (project.status === "Completed" ? "complete" : project.status === "In Progress" ? "in-progress" : "todo")}><i />{project.status}</span><span>{clients.find(client => client.id === project.clientId)?.name || "No client"}</span></div><div className="project-card-progress"><span>{project.progress}% complete</span><progress value={project.progress} max={100} aria-label={project.name + " progress"} /></div>{project.deadline && <p className="project-date">Due {addedDateFormatter.format(new Date(project.deadline))}</p>}<Link className="project-detail-link" href={"/projects/" + project.id}>View details <span aria-hidden="true">?</span></Link></li>)}</ul>
          {visibleProjects.length === 0 && <p className="empty-state">No projects found. Try another search or start a new project.</p>}
          <div className="list-footer">{visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"} in view<span>Made for your next big idea.</span></div>
        </section>
  );
}
