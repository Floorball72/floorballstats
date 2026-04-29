import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://kufnbnzkkrxemihelhew.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1Zm5ibnpra3J4ZW1paGVsaGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDQ2ODAsImV4cCI6MjA5MzAyMDY4MH0.P7xYL3d8XNcF6LIS3F3Y83T5cJ3YdSlfGDA94DW46_w";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtSecs = (s) => {
  if (!s && s !== 0) return "–";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  if (h) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
};
const pct = (a, b) => b ? ((a / b) * 100).toFixed(2) : "0.00";

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#0a0e1a;--surface:#111827;--surface2:#1c2333;--border:#2a3347;
    --accent:#00d4ff;--accent2:#ff6b35;--green:#00c875;--red:#ff4d6d;--yellow:#ffd60a;
    --text:#e8edf5;--muted:#6b7a99;--font:'Outfit',sans-serif;--mono:'DM Mono',monospace;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--font);min-height:100vh;}
  .app{display:flex;height:100vh;overflow:hidden;}
  /* Sidebar */
  .sidebar{width:220px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;}
  .sidebar-logo{padding:20px 16px;border-bottom:1px solid var(--border);}
  .sidebar-logo .logo-text{font-size:15px;font-weight:700;color:var(--accent);letter-spacing:.5px;}
  .sidebar-logo .logo-sub{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}
  .sidebar-nav{flex:1;padding:12px 8px;overflow-y:auto;}
  .nav-section{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1.5px;padding:16px 8px 6px;}
  .nav-btn{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border:none;background:none;color:var(--muted);font-family:var(--font);font-size:13px;font-weight:500;border-radius:8px;cursor:pointer;transition:all .15s;text-align:left;}
  .nav-btn:hover{background:var(--surface2);color:var(--text);}
  .nav-btn.active{background:rgba(0,212,255,.12);color:var(--accent);}
  .nav-btn svg{width:16px;height:16px;flex-shrink:0;}
  /* Main */
  .main{flex:1;overflow-y:auto;padding:28px 32px;}
  .page-title{font-size:26px;font-weight:800;margin-bottom:4px;}
  .page-sub{font-size:13px;color:var(--muted);margin-bottom:24px;}
  /* Cards */
  .card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;}
  .card-title{font-size:14px;font-weight:600;margin-bottom:16px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;}
  /* Grid */
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}
  .grid4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;}
  /* Stat boxes */
  .stat-box{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px 20px;}
  .stat-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;}
  .stat-val{font-size:32px;font-weight:800;font-family:var(--mono);}
  /* Table */
  .tbl-wrap{overflow-x:auto;}
  table{width:100%;border-collapse:collapse;font-size:12.5px;}
  th{padding:10px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);border-bottom:1px solid var(--border);white-space:nowrap;}
  td{padding:9px 12px;border-bottom:1px solid rgba(42,51,71,.5);white-space:nowrap;}
  tr:hover td{background:var(--surface2);}
  tr:last-child td{border-bottom:none;}
  td.num{font-family:var(--mono);text-align:right;}
  th.num{text-align:right;}
  /* Forms */
  .form-group{margin-bottom:14px;}
  label{display:block;font-size:12px;color:var(--muted);margin-bottom:5px;font-weight:500;}
  input,select,textarea{width:100%;padding:9px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font);font-size:13px;outline:none;transition:border .15s;}
  input:focus,select:focus,textarea:focus{border-color:var(--accent);}
  select option{background:var(--surface2);}
  /* Buttons */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:8px;border:none;font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}
  .btn-primary{background:var(--accent);color:#000;}
  .btn-primary:hover{opacity:.85;}
  .btn-danger{background:var(--red);color:#fff;}
  .btn-danger:hover{opacity:.85;}
  .btn-ghost{background:var(--surface2);color:var(--text);border:1px solid var(--border);}
  .btn-ghost:hover{border-color:var(--accent);color:var(--accent);}
  .btn-sm{padding:5px 10px;font-size:11px;}
  .btn-green{background:var(--green);color:#000;}
  .btn-orange{background:var(--accent2);color:#fff;}
  /* Badge */
  .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;}
  .badge-live{background:rgba(255,75,109,.2);color:var(--red);animation:pulse 1.5s infinite;}
  .badge-done{background:rgba(0,200,117,.15);color:var(--green);}
  .badge-plan{background:rgba(107,122,153,.15);color:var(--muted);}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
  /* Live tracker */
  .live-wrap{display:flex;flex-direction:column;gap:16px;}
  .live-score{display:flex;align-items:center;justify-content:center;gap:24px;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;}
  .live-team{text-align:center;flex:1;}
  .live-team-name{font-size:15px;font-weight:700;margin-bottom:4px;}
  .live-team-score{font-size:56px;font-weight:800;font-family:var(--mono);color:var(--accent);}
  .live-divider{font-size:28px;color:var(--muted);}
  .live-period{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px;}
  .period-badge{padding:4px 12px;border-radius:6px;font-size:11px;font-weight:600;background:var(--surface2);border:1px solid var(--border);}
  .event-log{background:var(--surface);border:1px solid var(--border);border-radius:12px;max-height:280px;overflow-y:auto;}
  .event-item{display:flex;align-items:center;gap:10px;padding:9px 14px;border-bottom:1px solid rgba(42,51,71,.4);font-size:12px;}
  .event-item:last-child{border-bottom:none;}
  .event-min{font-family:var(--mono);color:var(--accent);font-size:11px;width:36px;flex-shrink:0;}
  .event-icon{font-size:14px;width:20px;text-align:center;}
  .event-desc{flex:1;}
  .event-team{color:var(--muted);font-size:11px;}
  .quick-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  .action-btn{padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-family:var(--font);font-size:12px;font-weight:600;cursor:pointer;text-align:center;transition:all .15s;}
  .action-btn:hover{border-color:var(--accent);color:var(--accent);}
  .action-btn.danger:hover{border-color:var(--red);color:var(--red);}
  .action-btn .icon{font-size:20px;display:block;margin-bottom:4px;}
  /* Section header */
  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
  .section-title{font-size:18px;font-weight:700;}
  /* Modal */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;}
  .modal{background:var(--surface);border:1px solid var(--border);border-radius:16px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;padding:24px;}
  .modal-title{font-size:18px;font-weight:700;margin-bottom:20px;}
  .modal-footer{display:flex;gap:8px;justify-content:flex-end;margin-top:20px;}
  /* Alert */
  .alert{padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:12px;}
  .alert-err{background:rgba(255,77,109,.12);border:1px solid rgba(255,77,109,.3);color:var(--red);}
  .alert-ok{background:rgba(0,200,117,.12);border:1px solid rgba(0,200,117,.3);color:var(--green);}
  /* Mini bar chart */
  .bar-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
  .bar-label{width:130px;font-size:11px;color:var(--muted);text-align:right;flex-shrink:0;}
  .bar-track{flex:1;height:10px;background:var(--surface2);border-radius:5px;overflow:hidden;}
  .bar-fill{height:100%;border-radius:5px;transition:width .4s;}
  .bar-val{width:36px;font-size:11px;font-family:var(--mono);text-align:right;flex-shrink:0;}
  /* Tabs */
  .tabs{display:flex;gap:4px;border-bottom:1px solid var(--border);margin-bottom:20px;}
  .tab{padding:8px 16px;border:none;background:none;color:var(--muted);font-family:var(--font);font-size:13px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .15s;}
  .tab.active{color:var(--accent);border-bottom-color:var(--accent);}
  .spinner{width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;margin:40px auto;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .empty{text-align:center;color:var(--muted);padding:40px;font-size:14px;}
  .inline-flex{display:inline-flex;align-items:center;gap:6px;}
  .mt-4{margin-top:16px;}
  .mt-2{margin-top:8px;}
  .mb-3{margin-bottom:12px;}
  .text-accent{color:var(--accent);}
  .text-green{color:var(--green);}
  .text-red{color:var(--red);}
  .text-muted{color:var(--muted);}
  .fw-bold{font-weight:700;}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .full-col{grid-column:1/-1;}
  .row-gap{display:flex;flex-direction:column;gap:16px;}
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name }) => {
  const icons = {
    home: "🏠", events: "🏆", teams: "🛡️", players: "👤", games: "🎯",
    stats: "📊", live: "📡", plus: "➕", edit: "✏️", del: "🗑️",
    goal: "⚽", shot: "🏒", penalty: "⚠️", save: "🧤", sub: "🔄",
    back: "←", check: "✓", x: "✕"
  };
  return <span>{icons[name] || "•"}</span>;
};

// ─── Notification ────────────────────────────────────────────────────────────
function useNotif() {
  const [notif, setNotif] = useState(null);
  const show = (msg, type = "ok") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };
  return { notif, show };
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart({ data, color = "var(--accent)" }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ marginTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} className="bar-row">
          <div className="bar-label">{d.label}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
          <div className="bar-val">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    (async () => {
      const [{ count: teams }, { count: players }, { count: games }, { count: events }] = await Promise.all([
        sb.from("teams").select("*", { count: "exact", head: true }),
        sb.from("players").select("*", { count: "exact", head: true }),
        sb.from("games").select("*", { count: "exact", head: true }),
        sb.from("tournaments").select("*", { count: "exact", head: true }),
      ]);
      const { data: liveGames } = await sb.from("games").select("*").eq("status", "live");
      const { data: recentGames } = await sb.from("games")
        .select("*, home:home_team_id(name,short_name), away:away_team_id(name,short_name), tournament:tournament_id(name)")
        .eq("status", "finished").order("game_date", { ascending: false }).limit(5);
      setStats({ teams, players, games, events, liveGames: liveGames || [], recentGames: recentGames || [] });
    })();
  }, []);

  if (!stats) return <div className="spinner" />;
  return (
    <div>
      <div className="page-title">Dashboard</div>
      <div className="page-sub">Swiss Floorball Statistics Platform</div>
      <div className="grid4" style={{ marginBottom: 24 }}>
        {[
          { label: "Events", val: stats.events, color: "var(--accent)" },
          { label: "Teams", val: stats.teams, color: "var(--accent2)" },
          { label: "Players", val: stats.players, color: "var(--green)" },
          { label: "Games", val: stats.games, color: "var(--yellow)" },
        ].map(s => (
          <div key={s.label} className="stat-box">
            <div className="stat-label">{s.label}</div>
            <div className="stat-val" style={{ color: s.color }}>{s.val ?? 0}</div>
          </div>
        ))}
      </div>
      {stats.liveGames.length > 0 && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--red)" }}>
          <div className="card-title" style={{ color: "var(--red)" }}>🔴 Live Games</div>
          {stats.liveGames.map(g => (
            <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
              <span>Game in progress</span>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate("live", g.id)}>Track</button>
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <div className="card-title">Recent Games</div>
        {stats.recentGames.length === 0 ? <div className="empty">No finished games yet</div> : (
          <table>
            <thead><tr>
              <th>Date</th><th>Event</th><th>Match</th><th className="num">Result</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {stats.recentGames.map(g => (
                <tr key={g.id}>
                  <td className="text-muted">{g.game_date ? new Date(g.game_date).toLocaleDateString("de-CH") : "–"}</td>
                  <td>{g.tournament?.name || "–"}</td>
                  <td>{g.home?.short_name || g.home?.name} – {g.away?.short_name || g.away?.name}</td>
                  <td className="num fw-bold text-accent">{g.home_score}:{g.away_score}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => onNavigate("gameStats", g.id)}>Stats</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Events page ─────────────────────────────────────────────────────────────
function EventsPage({ onNavigate }) {
  const [events, setEvents] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", start_date: "", end_date: "", description: "" });
  const { notif, show } = useNotif();

  const load = useCallback(async () => {
    const { data } = await sb.from("tournaments").select("*").order("start_date", { ascending: false });
    setEvents(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const { error } = await sb.from("tournaments").insert([form]);
    if (error) { show(error.message, "err"); return; }
    show("Event created!"); setModal(false); setForm({ name: "", location: "", start_date: "", end_date: "", description: "" }); load();
  };

  const del = async (id) => {
    if (!confirm("Delete event?")) return;
    await sb.from("tournaments").delete().eq("id", id); load();
  };

  return (
    <div>
      <div className="page-title">Events</div>
      <div className="page-sub">Tournaments & competitions</div>
      {notif && <div className={`alert alert-${notif.type === "err" ? "err" : "ok"}`}>{notif.msg}</div>}
      <div className="section-header">
        <div className="section-title">{events?.length || 0} Events</div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" /> New Event</button>
      </div>
      {!events ? <div className="spinner" /> : events.length === 0 ? <div className="empty">No events yet. Create one!</div> : (
        <div className="row-gap">
          {events.map(e => (
            <div key={e.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{e.name}</div>
                <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{e.location} · {e.start_date} – {e.end_date}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("eventStats", e.id)}>📊 Stats</button>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("newGame", e.id)}>🎯 New Game</button>
                <button className="btn btn-danger btn-sm" onClick={() => del(e.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal title="New Event" onClose={() => setModal(false)} footer={
          <><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Create</button></>
        }>
          {[["name","Name *"],["location","Location"],["start_date","From","date"],["end_date","To","date"],["description","Description"]].map(([k,l,t="text"]) => (
            <div className="form-group" key={k}>
              <label>{l}</label>
              <input type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}

// ─── Teams page ───────────────────────────────────────────────────────────────
function TeamsPage() {
  const [teams, setTeams] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", short_name: "", color: "#00d4ff" });
  const { notif, show } = useNotif();

  const load = useCallback(async () => {
    const { data } = await sb.from("teams").select("*, players(count)").order("name");
    setTeams(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name) { show("Name required", "err"); return; }
    const { error } = await sb.from("teams").insert([form]);
    if (error) { show(error.message, "err"); return; }
    show("Team created!"); setModal(false); setForm({ name: "", short_name: "", color: "#00d4ff" }); load();
  };

  const del = async (id) => {
    if (!confirm("Delete team and all players?")) return;
    await sb.from("teams").delete().eq("id", id); load();
  };

  return (
    <div>
      <div className="page-title">Teams</div>
      <div className="page-sub">Manage clubs & teams</div>
      {notif && <div className={`alert alert-${notif.type === "err" ? "err" : "ok"}`}>{notif.msg}</div>}
      <div className="section-header">
        <div className="section-title">{teams?.length || 0} Teams</div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" /> New Team</button>
      </div>
      {!teams ? <div className="spinner" /> : teams.length === 0 ? <div className="empty">No teams yet.</div> : (
        <div className="grid3">
          {teams.map(t => (
            <div key={t.id} className="card" style={{ borderLeft: `3px solid ${t.color || "#00d4ff"}` }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{t.name}</div>
              {t.short_name && <div className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>({t.short_name})</div>}
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                {t.players?.[0]?.count || 0} players
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => del(t.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal title="New Team" onClose={() => setModal(false)} footer={
          <><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Create</button></>
        }>
          <div className="form-group"><label>Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="form-group"><label>Short Name</label><input value={form.short_name} onChange={e => setForm(f => ({ ...f, short_name: e.target.value }))} placeholder="e.g. WBB" /></div>
          <div className="form-group"><label>Color</label><input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} /></div>
        </Modal>
      )}
    </div>
  );
}

// ─── Players page ─────────────────────────────────────────────────────────────
function PlayersPage() {
  const [players, setPlayers] = useState(null);
  const [teams, setTeams] = useState([]);
  const [filter, setFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", jersey_number: "", position: "Forward", team_id: "" });
  const { notif, show } = useNotif();

  const load = useCallback(async () => {
    const [{ data: p }, { data: t }] = await Promise.all([
      sb.from("players").select("*, team:team_id(name,short_name,color)").order("last_name"),
      sb.from("teams").select("id,name,short_name").order("name"),
    ]);
    setPlayers(p || []); setTeams(t || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.first_name || !form.last_name) { show("Name required", "err"); return; }
    const { error } = await sb.from("players").insert([{ ...form, jersey_number: form.jersey_number ? parseInt(form.jersey_number) : null, team_id: form.team_id || null }]);
    if (error) { show(error.message, "err"); return; }
    show("Player added!"); setModal(false); setForm({ first_name: "", last_name: "", jersey_number: "", position: "Forward", team_id: "" }); load();
  };

  const del = async (id) => {
    if (!confirm("Delete player?")) return;
    await sb.from("players").delete().eq("id", id); load();
  };

  const filtered = players?.filter(p =>
    !filter || `${p.first_name} ${p.last_name} ${p.jersey_number}`.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  return (
    <div>
      <div className="page-title">Players</div>
      <div className="page-sub">Manage athletes</div>
      {notif && <div className={`alert alert-${notif.type === "err" ? "err" : "ok"}`}>{notif.msg}</div>}
      <div className="section-header">
        <input style={{ width: 240 }} placeholder="Search players…" value={filter} onChange={e => setFilter(e.target.value)} />
        <button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" /> Add Player</button>
      </div>
      {!players ? <div className="spinner" /> : (
        <div className="card">
          <div className="tbl-wrap">
            <table>
              <thead><tr>
                <th>#</th><th>Name</th><th>Team</th><th>Position</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td className="num text-accent">{p.jersey_number ?? "–"}</td>
                    <td className="fw-bold">{p.first_name} {p.last_name}</td>
                    <td>{p.team ? <span style={{ color: p.team.color }}>{p.team.short_name || p.team.name}</span> : <span className="text-muted">–</span>}</td>
                    <td>{p.position}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty">No players found</div>}
          </div>
        </div>
      )}
      {modal && (
        <Modal title="Add Player" onClose={() => setModal(false)} footer={
          <><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Add</button></>
        }>
          <div className="two-col">
            <div className="form-group"><label>First Name *</label><input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
            <div className="form-group"><label>Last Name *</label><input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
            <div className="form-group"><label>Jersey #</label><input type="number" value={form.jersey_number} onChange={e => setForm(f => ({ ...f, jersey_number: e.target.value }))} /></div>
            <div className="form-group"><label>Position</label>
              <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                <option>Goalkeeper</option><option>Defender</option><option>Forward</option>
              </select>
            </div>
            <div className="form-group full-col"><label>Team</label>
              <select value={form.team_id} onChange={e => setForm(f => ({ ...f, team_id: e.target.value }))}>
                <option value="">– No team –</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Games List page ──────────────────────────────────────────────────────────
function GamesPage({ onNavigate }) {
  const [games, setGames] = useState(null);
  const [modal, setModal] = useState(false);
  const [teams, setTeams] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ tournament_id: "", home_team_id: "", away_team_id: "", game_date: "", location: "", spectators: "" });
  const { notif, show } = useNotif();

  const load = useCallback(async () => {
    const [{ data: g }, { data: t }, { data: e }] = await Promise.all([
      sb.from("games").select("*, home:home_team_id(name,short_name,color), away:away_team_id(name,short_name,color), tournament:tournament_id(name)")
        .order("game_date", { ascending: false }),
      sb.from("teams").select("id,name,short_name").order("name"),
      sb.from("tournaments").select("id,name").order("name"),
    ]);
    setGames(g || []); setTeams(t || []); setEvents(e || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.home_team_id || !form.away_team_id) { show("Select both teams", "err"); return; }
    const { error } = await sb.from("games").insert([{ ...form, spectators: form.spectators ? parseInt(form.spectators) : null, status: "scheduled" }]);
    if (error) { show(error.message, "err"); return; }
    show("Game created!"); setModal(false); load();
  };

  const startGame = async (id) => {
    await sb.from("games").update({ status: "live" }).eq("id", id);
    onNavigate("live", id);
  };

  const statusBadge = (s) => {
    if (s === "live") return <span className="badge badge-live">LIVE</span>;
    if (s === "finished") return <span className="badge badge-done">Done</span>;
    return <span className="badge badge-plan">Planned</span>;
  };

  return (
    <div>
      <div className="page-title">Games</div>
      <div className="page-sub">All matches</div>
      {notif && <div className={`alert alert-${notif.type === "err" ? "err" : "ok"}`}>{notif.msg}</div>}
      <div className="section-header">
        <div className="section-title">{games?.length || 0} Games</div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Icon name="plus" /> New Game</button>
      </div>
      {!games ? <div className="spinner" /> : (
        <div className="card">
          <div className="tbl-wrap">
            <table>
              <thead><tr>
                <th>Date</th><th>Event</th><th>Match</th><th className="num">Score</th><th>Status</th><th>Spectators</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {games.map(g => (
                  <tr key={g.id}>
                    <td className="text-muted">{g.game_date ? new Date(g.game_date).toLocaleString("de-CH", { dateStyle:"short", timeStyle:"short" }) : "–"}</td>
                    <td>{g.tournament?.name || "–"}</td>
                    <td>
                      <span style={{ color: g.home?.color }}>{g.home?.short_name || g.home?.name || "?"}</span>
                      <span className="text-muted"> vs </span>
                      <span style={{ color: g.away?.color }}>{g.away?.short_name || g.away?.name || "?"}</span>
                    </td>
                    <td className="num fw-bold text-accent">{g.home_score}:{g.away_score}</td>
                    <td>{statusBadge(g.status)}</td>
                    <td className="num">{g.spectators ?? "–"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {g.status === "scheduled" && <button className="btn btn-green btn-sm" onClick={() => startGame(g.id)}>▶ Start</button>}
                        {g.status === "live" && <button className="btn btn-primary btn-sm" onClick={() => onNavigate("live", g.id)}>📡 Track</button>}
                        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("gameStats", g.id)}>📊</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {games.length === 0 && <div className="empty">No games yet.</div>}
          </div>
        </div>
      )}
      {modal && (
        <Modal title="New Game" onClose={() => setModal(false)} footer={
          <><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Create</button></>
        }>
          <div className="form-group"><label>Event</label>
            <select value={form.tournament_id} onChange={e => setForm(f => ({ ...f, tournament_id: e.target.value }))}>
              <option value="">– No event –</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="two-col">
            <div className="form-group"><label>Home Team *</label>
              <select value={form.home_team_id} onChange={e => setForm(f => ({ ...f, home_team_id: e.target.value }))}>
                <option value="">Select…</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Away Team *</label>
              <select value={form.away_team_id} onChange={e => setForm(f => ({ ...f, away_team_id: e.target.value }))}>
                <option value="">Select…</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="two-col">
            <div className="form-group"><label>Date & Time</label>
              <input type="datetime-local" value={form.game_date} onChange={e => setForm(f => ({ ...f, game_date: e.target.value }))} />
            </div>
            <div className="form-group"><label>Spectators</label>
              <input type="number" value={form.spectators} onChange={e => setForm(f => ({ ...f, spectators: e.target.value }))} />
            </div>
          </div>
          <div className="form-group"><label>Location</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Live Tracker ─────────────────────────────────────────────────────────────
function LiveTracker({ gameId, onNavigate }) {
  const [game, setGame] = useState(null);
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState(1);
  const [modal, setModal] = useState(null); // "goal"|"shot"|"penalty"|"save"
  const [mForm, setMForm] = useState({});
  const timerRef = useRef(null);
  const [running, setRunning] = useState(false);
  const { notif, show } = useNotif();

  const loadGame = useCallback(async () => {
    const { data: g } = await sb.from("games")
      .select("*, home:home_team_id(id,name,short_name,color), away:away_team_id(id,name,short_name,color)")
      .eq("id", gameId).single();
    setGame(g);
    const { data: p } = await sb.from("players").select("id,first_name,last_name,jersey_number,team_id,position")
      .in("team_id", [g.home_team_id, g.away_team_id]).order("last_name");
    setPlayers(p || []);
  }, [gameId]);

  const loadEvents = useCallback(async () => {
    const { data } = await sb.from("game_events").select("*, player:player_id(first_name,last_name,jersey_number), team:team_id(name,short_name,color)")
      .eq("game_id", gameId).order("created_at", { ascending: false });
    setEvents(data || []);
  }, [gameId]);

  useEffect(() => { loadGame(); loadEvents(); }, [loadGame, loadEvents]);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setMinute(m => m + 1), 60000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  const homeScore = events.filter(e => e.event_type === "goal" && e.team_id === game?.home_team_id).length;
  const awayScore = events.filter(e => e.event_type === "goal" && e.team_id === game?.away_team_id).length;

  const logEvent = async (type, extra = {}) => {
    const payload = { game_id: gameId, event_type: type, minute, period, ...extra };
    const { error } = await sb.from("game_events").insert([payload]);
    if (error) { show(error.message, "err"); return; }

    if (type === "goal") {
      const field = extra.team_id === game.home_team_id ? "home_score" : "away_score";
      await sb.from("games").update({ [field]: (type === "goal" ? (field === "home_score" ? homeScore : awayScore) : 0) + 1 }).eq("id", gameId);
    }
    loadEvents(); setModal(null); show("Logged!", "ok");
  };

  const endGame = async () => {
    if (!confirm("End game?")) return;
    setRunning(false);
    await sb.from("games").update({ status: "finished", home_score: homeScore, away_score: awayScore, duration_seconds: minute * 60 }).eq("id", gameId);
    show("Game finished!"); onNavigate("gameStats", gameId);
  };

  const teamPlayers = (teamId) => players.filter(p => p.team_id === teamId);

  const eventIcon = (type) => ({ goal: "⚽", shot: "🏒", penalty: "⚠️", save: "🧤", timeout: "⏸️", substitution: "🔄" }[type] || "•");

  if (!game) return <div className="spinner" />;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("games")}>← Back</button>
        <div className="page-title" style={{ margin: 0 }}>Live Tracker</div>
        <span className="badge badge-live">LIVE</span>
      </div>
      {notif && <div className={`alert alert-${notif.type === "err" ? "err" : "ok"}`}>{notif.msg}</div>}

      {/* Score */}
      <div className="live-score" style={{ marginBottom: 16 }}>
        <div className="live-team">
          <div className="live-team-name" style={{ color: game.home?.color }}>{game.home?.name}</div>
          <div className="live-team-score">{homeScore}</div>
        </div>
        <div>
          <div className="live-divider">:</div>
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            Min <strong style={{ color: "var(--text)" }}>{minute}</strong>
          </div>
        </div>
        <div className="live-team">
          <div className="live-team-name" style={{ color: game.away?.color }}>{game.away?.name}</div>
          <div className="live-team-score">{awayScore}</div>
        </div>
      </div>

      {/* Timer controls */}
      <div className="live-period" style={{ marginBottom: 16 }}>
        <button className={`period-badge`} style={running ? { borderColor: "var(--red)", color: "var(--red)" } : {}} onClick={() => setRunning(r => !r)}>
          {running ? "⏸ Pause" : "▶ Start Timer"}
        </button>
        {[1, 2, 3].map(p => (
          <button key={p} className="period-badge" style={period === p ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}} onClick={() => setPeriod(p)}>
            Period {p}
          </button>
        ))}
        <input type="number" value={minute} onChange={e => setMinute(parseInt(e.target.value) || 0)}
          style={{ width: 70, padding: "3px 8px", fontSize: 12 }} placeholder="Min" />
      </div>

      <div className="grid2" style={{ marginBottom: 16 }}>
        {/* Quick actions */}
        <div className="card">
          <div className="card-title">Quick Log</div>
          <div className="quick-actions">
            {[
              ["goal", "⚽", "Goal"],
              ["shot", "🏒", "Shot"],
              ["penalty", "⚠️", "Penalty"],
              ["save", "🧤", "Save"],
              ["timeout", "⏸️", "Timeout"],
              ["substitution", "🔄", "Sub"],
            ].map(([type, icon, label]) => (
              <button key={type} className="action-btn" onClick={() => { setMForm({ event_type: type }); setModal(type); }}>
                <span className="icon">{icon}</span>{label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-danger" style={{ width: "100%" }} onClick={endGame}>🏁 End Game</button>
          </div>
        </div>

        {/* Event log */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 13 }}>Event Log ({events.length})</div>
          <div className="event-log" style={{ maxHeight: 320 }}>
            {events.length === 0 ? <div className="empty">No events yet</div> : events.map(e => (
              <div key={e.id} className="event-item">
                <div className="event-min">{e.minute ?? "–"}'</div>
                <div className="event-icon">{eventIcon(e.event_type)}</div>
                <div className="event-desc">
                  <span className="fw-bold">{e.player ? `${e.player.jersey_number} ${e.player.last_name}` : e.event_type}</span>
                  {e.description && <span className="text-muted"> – {e.description}</span>}
                </div>
                <div className="event-team" style={{ color: e.team?.color }}>{e.team?.short_name || ""}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event modal */}
      {modal && (
        <Modal title={`Log ${modal}`} onClose={() => setModal(null)} footer={
          <><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => logEvent(modal, mForm)}>Log</button></>
        }>
          <div className="form-group">
            <label>Team</label>
            <select value={mForm.team_id || ""} onChange={e => setMForm(f => ({ ...f, team_id: e.target.value }))}>
              <option value="">Select team…</option>
              <option value={game.home_team_id}>{game.home?.name}</option>
              <option value={game.away_team_id}>{game.away?.name}</option>
            </select>
          </div>
          <div className="form-group">
            <label>Player</label>
            <select value={mForm.player_id || ""} onChange={e => setMForm(f => ({ ...f, player_id: e.target.value }))}>
              <option value="">– No player –</option>
              {(mForm.team_id ? teamPlayers(mForm.team_id) : players).map(p => (
                <option key={p.id} value={p.id}>{p.jersey_number} {p.first_name} {p.last_name}</option>
              ))}
            </select>
          </div>
          {modal === "goal" && (
            <>
              <div className="form-group">
                <label>Assist Player</label>
                <select value={mForm.assist_player_id || ""} onChange={e => setMForm(f => ({ ...f, assist_player_id: e.target.value }))}>
                  <option value="">– No assist –</option>
                  {(mForm.team_id ? teamPlayers(mForm.team_id) : players).map(p => (
                    <option key={p.id} value={p.id}>{p.jersey_number} {p.first_name} {p.last_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Goal Type</label>
                <select value={mForm.goal_type || ""} onChange={e => setMForm(f => ({ ...f, goal_type: e.target.value }))}>
                  {["regular","counter","standard","power_play","box_play","penalty_shot","own_goal","without_goalkeeper","empty_netter"].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g," ")}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Attack Type</label>
                <select value={mForm.attack_type || ""} onChange={e => setMForm(f => ({ ...f, attack_type: e.target.value }))}>
                  <option value="">–</option>
                  {["counterattack","long","pressing","short","standard"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {modal === "shot" && (
            <div className="form-group">
              <label>Shot Result</label>
              <select value={mForm.shot_result || ""} onChange={e => setMForm(f => ({ ...f, shot_result: e.target.value }))}>
                <option value="on_goal">On Goal</option>
                <option value="missed">Missed</option>
                <option value="blocked">Blocked</option>
                <option value="bar">On Bar</option>
              </select>
            </div>
          )}
          {modal === "penalty" && (
            <div className="form-group">
              <label>Offense Type</label>
              <input value={mForm.penalty_type || ""} onChange={e => setMForm(f => ({ ...f, penalty_type: e.target.value }))} placeholder="e.g. body, hooking…" />
            </div>
          )}
          <div className="form-group">
            <label>Minute (override)</label>
            <input type="number" value={mForm.minute ?? minute} onChange={e => setMForm(f => ({ ...f, minute: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input value={mForm.description || ""} onChange={e => setMForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Game Statistics page ────────────────────────────────────────────────────
function GameStatsPage({ gameId, onNavigate }) {
  const [game, setGame] = useState(null);
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: g } = await sb.from("games")
        .select("*, home:home_team_id(id,name,short_name,color), away:away_team_id(id,name,short_name,color), tournament:tournament_id(name)")
        .eq("id", gameId).single();
      setGame(g);
      const { data: ev } = await sb.from("game_events")
        .select("*, player:player_id(id,first_name,last_name,jersey_number,team_id), team:team_id(id,name,short_name,color)")
        .eq("game_id", gameId).order("minute");
      setEvents(ev || []);
      if (g) {
        const { data: p } = await sb.from("players").select("*").in("team_id", [g.home_team_id, g.away_team_id]);
        setPlayers(p || []);
      }
    })();
  }, [gameId]);

  if (!game) return <div className="spinner" />;

  const goals = events.filter(e => e.event_type === "goal");
  const shots = events.filter(e => e.event_type === "shot");
  const penalties = events.filter(e => e.event_type === "penalty");
  const saves = events.filter(e => e.event_type === "save");

  const homeId = game.home_team_id;
  const awayId = game.away_team_id;

  const teamGoals = (tid) => goals.filter(g => g.team_id === tid).length;
  const teamShots = (tid) => shots.filter(s => s.team_id === tid);
  const onGoal = (tid) => teamShots(tid).filter(s => s.shot_result === "on_goal").length;
  const allShots = shots.length;
  const totalOnGoal = shots.filter(s => s.shot_result === "on_goal").length;
  const totalMissed = shots.filter(s => s.shot_result === "missed").length;
  const totalBlocked = shots.filter(s => s.shot_result === "blocked").length;
  const totalBar = shots.filter(s => s.shot_result === "bar").length;
  const totalGoals = goals.length;

  // Goal types
  const goalTypeCount = (type) => goals.filter(g => g.goal_type === type).length;

  // Attack stats
  const attackTypes = ["counterattack", "long", "pressing", "short", "standard"];
  const attackStats = attackTypes.map(at => {
    const atGoals = goals.filter(g => g.attack_type === at);
    const atShots = shots.filter(s => s.attack_type === at);
    return { type: at, scored: atGoals.length, missed: atShots.length, interrupted: 0, total: atGoals.length + atShots.length };
  }).filter(a => a.total > 0);

  // Player stats
  const playerStats = players.map(p => {
    const pGoals = goals.filter(g => g.player_id === p.id).length;
    const pAssists = events.filter(e => e.assist_player_id === p.id).length;
    const pShots = shots.filter(s => s.player_id === p.id);
    const pOnGoal = pShots.filter(s => s.shot_result === "on_goal").length;
    const pPenalties = penalties.filter(pe => pe.player_id === p.id).reduce((a, pe) => a + (pe.penalty_duration_seconds || 120), 0);
    const team = p.team_id === homeId ? game.home : game.away;
    return {
      id: p.id, name: `${p.jersey_number || ""} ${p.first_name} ${p.last_name}`.trim(),
      team: team?.short_name || team?.name || "–", teamColor: team?.color,
      goals: pGoals, assists: pAssists, points: pGoals + pAssists,
      shots: pShots.length, onGoal: pOnGoal,
      pctOnGoal: pShots.length ? pct(pOnGoal, pShots.length) : "0.00",
      efficiency: pOnGoal ? pct(pGoals, pOnGoal) : "0.00",
      penaltySecs: pPenalties,
      plus: 0, minus: 0,
    };
  }).sort((a, b) => b.points - a.points);

  // Goalkeepers (saves)
  const gkStats = players.filter(p => p.position === "Goalkeeper").map(p => {
    const pSaves = saves.filter(s => s.player_id === p.id).length;
    const opp = p.team_id === homeId ? awayId : homeId;
    const oppOnGoal = shots.filter(s => s.team_id === opp && s.shot_result === "on_goal").length;
    return {
      name: `${p.jersey_number || ""} ${p.last_name}`, team: p.team_id === homeId ? game.home?.short_name : game.away?.short_name,
      saves: pSaves, shots: oppOnGoal, savePct: oppOnGoal ? pct(pSaves, oppOnGoal) : "–"
    };
  });

  // Penalty by type
  const penByType = penalties.reduce((acc, p) => { acc[p.penalty_type || "other"] = (acc[p.penalty_type || "other"] || 0) + (p.penalty_duration_seconds || 120); return acc; }, {});
  const penByTeam = penalties.reduce((acc, p) => {
    const tname = p.team?.short_name || p.team?.name || "–";
    acc[tname] = (acc[tname] || 0) + (p.penalty_duration_seconds || 120);
    return acc;
  }, {});

  // Top scorers for bar chart
  const topScorers = playerStats.filter(p => p.points > 0).slice(0, 10);
  const topGoals = playerStats.filter(p => p.goals > 0).slice(0, 10);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("games")}>← Back</button>
        <div className="page-title" style={{ margin: 0 }}>Game Statistics</div>
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
        {game.tournament?.name && <span>{game.tournament.name} · </span>}
        <span style={{ color: game.home?.color }}>{game.home?.name}</span>
        <span className="text-muted"> vs </span>
        <span style={{ color: game.away?.color }}>{game.away?.name}</span>
        {game.game_date && <span> · {new Date(game.game_date).toLocaleDateString("de-CH")}</span>}
      </div>

      {/* Summary */}
      <div className="grid4" style={{ marginBottom: 20 }}>
        <div className="stat-box"><div className="stat-label">Goals</div><div className="stat-val text-accent">{totalGoals}</div></div>
        <div className="stat-box"><div className="stat-label">Shots</div><div className="stat-val">{allShots}</div></div>
        <div className="stat-box"><div className="stat-label">Spectators</div><div className="stat-val">{game.spectators ?? "–"}</div></div>
        <div className="stat-box"><div className="stat-label">Penalty Time</div><div className="stat-val">{fmtSecs(penalties.reduce((a,p) => a + (p.penalty_duration_seconds || 120), 0))}</div></div>
      </div>

      {/* Score + game */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Result</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 32, padding: "12px 0" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: game.home?.color, fontWeight: 700, fontSize: 15 }}>{game.home?.name}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 48, fontWeight: 800, color: "var(--accent)" }}>{game.home_score}</div>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 24 }}>:</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: game.away?.color, fontWeight: 700, fontSize: 15 }}>{game.away?.name}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 48, fontWeight: 800, color: "var(--accent)" }}>{game.away_score}</div>
          </div>
        </div>
      </div>

      {/* Shot stats */}
      <div className="grid2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">Shots</div>
          <BarChart data={[
            { label: "On Goal", value: totalOnGoal },
            { label: "On Bar", value: totalBar },
            { label: "Missed", value: totalMissed },
            { label: "Blocked", value: totalBlocked },
          ]} color="var(--accent)" />
          <div className="tbl-wrap" style={{ marginTop: 12 }}>
            <table>
              <tbody>
                <tr><td>On Goal</td><td className="num">{totalOnGoal}</td></tr>
                <tr><td>On Bar</td><td className="num">{totalBar}</td></tr>
                <tr><td>Missed</td><td className="num">{totalMissed}</td></tr>
                <tr><td>Blocked</td><td className="num">{totalBlocked}</td></tr>
                <tr><td className="fw-bold">Total</td><td className="num fw-bold">{allShots}</td></tr>
                <tr><td>Precision %</td><td className="num text-accent">{pct(totalOnGoal, allShots)}</td></tr>
                <tr><td>Efficiency %</td><td className="num text-green">{pct(totalGoals, allShots)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Goals Scored</div>
          <BarChart data={[
            { label: "Regular", value: goalTypeCount("regular") },
            { label: "Counter", value: goalTypeCount("counter") },
            { label: "Standards", value: goalTypeCount("standard") },
            { label: "Power Play", value: goalTypeCount("power_play") },
            { label: "Box Play", value: goalTypeCount("box_play") },
            { label: "Penalty Shot", value: goalTypeCount("penalty_shot") },
            { label: "Own Goal", value: goalTypeCount("own_goal") },
          ].filter(d => d.value > 0)} color="var(--green)" />
          <div className="tbl-wrap" style={{ marginTop: 12 }}>
            <table><tbody>
              {[["Regular", "regular"],["Counter","counter"],["Standards","standard"],["Power Play","power_play"],["Box Play","box_play"],["Penalty Shot","penalty_shot"],["Own Goal","own_goal"],["Without GK","without_goalkeeper"],["Empty Netter","empty_netter"]].map(([l,t]) => (
                <tr key={t}><td>{l}</td><td className="num">{goalTypeCount(t)}</td></tr>
              ))}
            </tbody></table>
          </div>
        </div>
      </div>

      {/* Team overview */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Team Overview</div>
        <div className="tbl-wrap">
          <table>
            <thead><tr>
              <th>Team</th><th className="num">Shots</th><th className="num">On Goal</th>
              <th className="num">Precision %</th><th className="num">Efficiency %</th>
              <th className="num">Scored</th><th className="num">Received</th>
            </tr></thead>
            <tbody>
              {[{ team: game.home, id: homeId }, { team: game.away, id: awayId }].map(({ team, id }) => {
                const ts = teamShots(id); const tg = teamGoals(id); const og = onGoal(id);
                return (
                  <tr key={id}>
                    <td style={{ color: team?.color, fontWeight: 700 }}>{team?.name}</td>
                    <td className="num">{ts.length}</td>
                    <td className="num">{og}</td>
                    <td className="num text-accent">{pct(og, ts.length)}</td>
                    <td className="num text-green">{pct(tg, ts.length)}</td>
                    <td className="num fw-bold">{tg}</td>
                    <td className="num">{teamGoals(id === homeId ? awayId : homeId)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attack stats */}
      {attackStats.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Attack Statistics</div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Attack Type</th><th className="num">Scored</th><th className="num">Missed</th><th className="num">Total</th></tr></thead>
              <tbody>
                {attackStats.map(a => (
                  <tr key={a.type}><td>{a.type}</td><td className="num text-green">{a.scored}</td><td className="num">{a.missed}</td><td className="num fw-bold">{a.total}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Goalkeeper stats */}
      {gkStats.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Goalkeeper Statistics</div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Goalkeeper</th><th className="num">Saves %</th><th className="num">Shots faced</th><th className="num">Saves</th></tr></thead>
              <tbody>
                {gkStats.map((gk, i) => (
                  <tr key={i}>
                    <td>{gk.name} ({gk.team})</td>
                    <td className="num text-accent">{gk.savePct}</td>
                    <td className="num">{gk.shots}</td>
                    <td className="num text-green">{gk.saves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Penalty stats */}
      {penalties.length > 0 && (
        <div className="grid2" style={{ marginBottom: 16 }}>
          <div className="card">
            <div className="card-title">Penalties by Type</div>
            <div className="tbl-wrap">
              <table><thead><tr><th>Offense</th><th className="num">Box Time</th></tr></thead>
                <tbody>
                  {Object.entries(penByType).map(([k, v]) => (
                    <tr key={k}><td>{k}</td><td className="num">{fmtSecs(v)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Penalties by Team</div>
            <div className="tbl-wrap">
              <table><thead><tr><th>Team</th><th className="num">Box Time</th></tr></thead>
                <tbody>
                  {Object.entries(penByTeam).map(([k, v]) => (
                    <tr key={k}><td>{k}</td><td className="num">{fmtSecs(v)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Player stats */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Top Scorers</div>
        {topScorers.length === 0 ? <div className="empty">No goals yet</div> :
          <BarChart data={topScorers.map(p => ({ label: p.name, value: p.points }))} color="var(--accent)" />}
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Player Statistics</div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Team</th>
                <th className="num">Shots</th><th className="num">On Goal</th><th className="num">% on Goal</th><th className="num">Efficiency</th>
                <th className="num">Goals</th><th className="num">Assists</th><th className="num">Points</th><th className="num">Pen.Secs</th>
              </tr>
            </thead>
            <tbody>
              {playerStats.filter(p => p.points > 0 || p.shots > 0 || p.penaltySecs > 0).map(p => (
                <tr key={p.id}>
                  <td className="fw-bold">{p.name}</td>
                  <td style={{ color: p.teamColor }}>{p.team}</td>
                  <td className="num">{p.shots}</td>
                  <td className="num">{p.onGoal}</td>
                  <td className="num">{p.pctOnGoal}</td>
                  <td className="num">{p.efficiency}</td>
                  <td className="num text-green fw-bold">{p.goals}</td>
                  <td className="num">{p.assists}</td>
                  <td className="num text-accent fw-bold">{p.points}</td>
                  <td className="num">{p.penaltySecs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Event Statistics page ────────────────────────────────────────────────────
function EventStatsPage({ eventId, onNavigate }) {
  const [event, setEvent] = useState(null);
  const [games, setGames] = useState([]);
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: ev } = await sb.from("tournaments").select("*").eq("id", eventId).single();
      setEvent(ev);
      const { data: g } = await sb.from("games")
        .select("*, home:home_team_id(id,name,short_name,color), away:away_team_id(id,name,short_name,color)")
        .eq("tournament_id", eventId);
      setGames(g || []);
      if (g && g.length > 0) {
        const gids = g.map(x => x.id);
        const { data: ge } = await sb.from("game_events").select("*").in("game_id", gids);
        setAllEvents(ge || []);
      }
    })();
  }, [eventId]);

  if (!event) return <div className="spinner" />;

  const goals = allEvents.filter(e => e.event_type === "goal");
  const shots = allEvents.filter(e => e.event_type === "shot");
  const penalties = allEvents.filter(e => e.event_type === "penalty");
  const totalPenaltySecs = penalties.reduce((a, p) => a + (p.penalty_duration_seconds || 120), 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("events")}>← Back</button>
        <div className="page-title" style={{ margin: 0 }}>{event.name}</div>
      </div>
      <div className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>{event.location} · {event.start_date} – {event.end_date}</div>

      <div className="grid4" style={{ marginBottom: 20 }}>
        <div className="stat-box"><div className="stat-label">Games Played</div><div className="stat-val text-accent">{games.filter(g => g.status === "finished").length}</div></div>
        <div className="stat-box"><div className="stat-label">Total Goals</div><div className="stat-val">{goals.length}</div></div>
        <div className="stat-box"><div className="stat-label">Total Shots</div><div className="stat-val">{shots.length}</div></div>
        <div className="stat-box"><div className="stat-label">Penalty Time</div><div className="stat-val">{fmtSecs(totalPenaltySecs)}</div></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Games</div>
        <div className="tbl-wrap">
          <table>
            <thead><tr>
              <th>Date</th><th>Time</th><th>Match</th><th className="num">Result</th><th className="num">Spectators</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {games.map(g => (
                <tr key={g.id}>
                  <td>{g.game_date ? new Date(g.game_date).toLocaleDateString("de-CH") : "–"}</td>
                  <td>{g.game_date ? new Date(g.game_date).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" }) : "–"}</td>
                  <td><span style={{ color: g.home?.color }}>{g.home?.name}</span> – <span style={{ color: g.away?.color }}>{g.away?.name}</span></td>
                  <td className="num fw-bold text-accent">{g.home_score}:{g.away_score}</td>
                  <td className="num">{g.spectators ?? "–"}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => onNavigate("gameStats", g.id)}>📊 Stats</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {games.length === 0 && <div className="empty">No games for this event</div>}
        </div>
      </div>

      {shots.length > 0 && (
        <div className="grid2">
          <div className="card">
            <div className="card-title">Shot Summary</div>
            <BarChart data={[
              { label: "On Goal", value: shots.filter(s => s.shot_result === "on_goal").length },
              { label: "Missed", value: shots.filter(s => s.shot_result === "missed").length },
              { label: "Blocked", value: shots.filter(s => s.shot_result === "blocked").length },
              { label: "On Bar", value: shots.filter(s => s.shot_result === "bar").length },
            ]} />
          </div>
          <div className="card">
            <div className="card-title">Goal Types</div>
            <BarChart data={["regular","counter","standard","power_play","box_play","penalty_shot","own_goal"].map(t => ({
              label: t.replace(/_/g," "), value: goals.filter(g => g.goal_type === t).length
            })).filter(d => d.value > 0)} color="var(--green)" />
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [pageParam, setPageParam] = useState(null);

  const navigate = (p, param = null) => { setPage(p); setPageParam(param); };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "events", label: "Events", icon: "events" },
    { id: "games", label: "Games", icon: "games" },
    { id: "teams", label: "Teams", icon: "teams" },
    { id: "players", label: "Players", icon: "players" },
  ];

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard onNavigate={navigate} />;
      case "events": return <EventsPage onNavigate={navigate} />;
      case "teams": return <TeamsPage />;
      case "players": return <PlayersPage />;
      case "games": return <GamesPage onNavigate={navigate} />;
      case "live": return <LiveTracker gameId={pageParam} onNavigate={navigate} />;
      case "gameStats": return <GameStatsPage gameId={pageParam} onNavigate={navigate} />;
      case "eventStats": return <EventStatsPage eventId={pageParam} onNavigate={navigate} />;
      default: return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-text">🏒 FloorballStats</div>
            <div className="logo-sub">Swiss Statistics Platform</div>
          </div>
          <div className="sidebar-nav">
            <div className="nav-section">Navigation</div>
            {navItems.map(n => (
              <button key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`} onClick={() => navigate(n.id)}>
                <Icon name={n.icon} /> {n.label}
              </button>
            ))}
            <div className="nav-section">Tools</div>
            <button className={`nav-btn ${page === "live" ? "active" : ""}`} onClick={() => navigate("games")}>
              <Icon name="live" /> Live Tracking
            </button>
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", fontSize: 10, color: "var(--muted)" }}>
            Supabase: floorballstats
          </div>
        </div>
        <div className="main">
          {renderPage()}
        </div>
      </div>
    </>
  );
}
