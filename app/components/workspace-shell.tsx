"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Icon from "./ui-icon";
import { useProjects } from "./projects-provider";
import NewProjectButton from "./new-project-dialog";

export default function WorkspaceShell({ active, children }: {
  active: "report" | "projects" | "tasks" | "clients";
  children: ReactNode;
}) {
  const { projects, storage, theme, toggleTheme } = useProjects();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Buildex home"><span className="brand-symbol"><span /><span /></span>Buildex<span className="brand-period">.</span></Link>
        <p className="nav-label">MENU</p>
        <nav aria-label="Main navigation">
          <Link className={active === "report" ? "nav-active" : ""} href="/" aria-current={active === "report" ? "page" : undefined}><Icon name="home" />Dashboard</Link>
          <Link className={active === "projects" ? "nav-active" : ""} href="/projects" aria-current={active === "projects" ? "page" : undefined}><Icon name="folder" />Projects<span className="nav-count">{projects.length}</span></Link>
          <Link className={active === "tasks" ? "nav-active" : ""} href="/tasks" aria-current={active === "tasks" ? "page" : undefined}><Icon name="check" />Tasks</Link>
          <Link className={active === "clients" ? "nav-active" : ""} href="/clients" aria-current={active === "clients" ? "page" : undefined}><Icon name="clients" />Clients</Link>
        </nav>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Project shortcuts">
          <Link href="/projects?status=In%20Progress"><Icon name="clock" />In progress</Link>
          <Link href="/projects?status=Completed"><Icon name="check" />Completed</Link>
          <NewProjectButton><Icon name="plus" />Add project</NewProjectButton>
          <button type="button" onClick={toggleTheme} disabled={!storage.writable} aria-pressed={theme === "dark"}><Icon name="theme" />{theme === "dark" ? "Light mode" : "Dark mode"}</button>
        </nav>
        <div className="sidebar-promo"><span className="promo-icon"><Icon name="folder" size={16} /></span><h2>Your next big idea.</h2><p>Make space for what comes next. Build something great.</p><NewProjectButton>Create a project <Icon name="arrow" size={15} /></NewProjectButton></div>
      </aside>
      <main id="overview">
        {storage.error && <p role="alert" className="storage-alert">{storage.error}</p>}
        {children}
      </main>
    </div>
  );
}
