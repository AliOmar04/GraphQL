// profile/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";
import { renderAuditPie } from "@/lib/hooks/auditRatio";
import { RecentAudits } from "@/lib/hooks/recentAudits";
import { RecentProjects } from "@/lib/hooks/recentProjects";
import { renderXPChart } from "@/lib/hooks/xpChart";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;                 // wait until user is available
    const raf = requestAnimationFrame(() => renderXPChart("xpSvgContainer"));
    return () => cancelAnimationFrame(raf);
  }, [user?.id]);

  if (loading) return <main className="auth-page"><p className="loading">Loading profile…</p></main>;
  if (error)   return <main className="auth-page"><p className="error-msg">Couldn’t load profile. Try again.</p></main>;
  if (!user)   return <main className="auth-page"><p>You are not logged in. <Link href="/">Log in</Link></p></main>;

  return (
    <main className="auth-page">
      <header className="dash-header">
        <div>
          <h1 className="title">Profile</h1>
          <p className="subtitle">
            Welcome back{(user.firstName || user.login) ? `, ${user.firstName || user.login}` : ""} 👋
          </p>
        </div>
        <button
          className="logout-btn"
          onClick={() => { localStorage.removeItem("jwt"); router.replace("/"); }}
          aria-label="Log out"
        >
          Log out
        </button>
      </header>
            {/* Background layers you already have */}
      <div className="grid-bg" />
      <div className="gradient-overlay" />
      <div className="scanlines" />

      {/* Floating shapes */}
      <div className="shapes-container">
        <div className="shape shape-circle" />
        <div className="shape shape-triangle" />
        <div className="shape shape-square" />
      </div>
      <div className="dashboard-grid">

        {/* XP bubble chart (extra wide on desktop) */}
        <section className="panel span-2" aria-labelledby="xp-bubbles-h">
          <h2 id="xp-bubbles-h" className="panel-title">XP by project</h2>
          <div id="xpSvgContainer" className="panel-body chart-body-svg" />
        </section>


        {/* user information */}
      <section className="panel" aria-labelledby="user-info-h">
        <h2 id="user-info-h" className="panel-title">User information</h2>
        <div className="panel-body">
          <dl className="info-vertical">
          <div className="row">
            <dt>Name:</dt>
            <dd title={[user.firstName, user.lastName].filter(Boolean).join(" ")}>
              {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
            </dd>
          </div>
          <div className="row">
            <dt>Username:</dt>
            <dd title={user.login || "—"}>{user.login || "—"}</dd>
          </div>
          <div className="row">
            <dt>ID:</dt>
            <dd title={String(user.id || "—")}>{user.id || "—"}</dd>
          </div>

          <div className="row">
            <dt>TotalXP:</dt>
            <dd title={String(user.totalXP ?? 0)}>
              {(user.totalXP ?? 0).toLocaleString()}
            </dd>
          </div>
          <div className="row email">
            <dt>Email:</dt>
            <dd>{user.email || "—"}</dd>
          </div>
        </dl>
        </div>
      </section>


        {/* recent projects */}
        <section className="panel" aria-labelledby="recent-projects-h">
          <h2 id="recent-projects-h" className="panel-title">Recent projects</h2>
            <div className="panel-body">
              <RecentProjects limit={5} />
            </div>
        </section>

        {/* recent audits */}
        <section className="panel" aria-labelledby="recent-audits-h">
          <h2 id="recent-audits-h" className="panel-title">Recent audits</h2>
            <div className="panel-body">
              <RecentAudits userId={user.id} limit={5} />
            </div>
        </section>



        {/* audit ratio (pie) */}
      <section className="panel" aria-labelledby="audit-ratio-h">
        <h2 id="audit-ratio-h" className="panel-title">Audit ratio</h2>
        <div
          className="panel-body center"
          dangerouslySetInnerHTML={{
            __html: renderAuditPie({
              totalUp: Number(user.totalUp) || 0,
              totalDown: Number(user.totalDown) || 0, // ← correct field
              size: 180,
            }),
          }}
        />
      </section>
      </div>
    </main>
  );
}
