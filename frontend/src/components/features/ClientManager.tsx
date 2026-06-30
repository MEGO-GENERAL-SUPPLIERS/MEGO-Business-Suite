import { useState, useEffect, useCallback, useRef } from "react";

// ─── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 50;

const AVATAR_PALETTE = [
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#FBEAF0", text: "#72243E" },
  { bg: "#EAF3DE", text: "#27500A" },
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#FAECE7", text: "#712B13" },
];

const STATUS_CFG = {
  active:    { label: "Active",    dot: "#4CAF50", bg: "#EAF3DE", text: "#3B6D11" },
  pending:   { label: "Pending",   dot: "#F59E0B", bg: "#FAEEDA", text: "#854F0B" },
  suspended: { label: "Suspended", dot: "#EF4444", bg: "#FCEBEB", text: "#A32D2D" },
  inactive:  { label: "Inactive",  dot: "#9CA3AF", bg: "#F1EFE8", text: "#5F5E5A" },
  
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
function avatarColor(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function initials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function fmt(n: any) { return Number(n).toLocaleString(); }

// ─── Mock data ─────────────────────────────────────────────────────────────────
const NAMES = [
  "Verdant Holdings Ltd","Apex Digital SME","BlueSky Logistics","Miriam Nakamura",
  "Priya Osei-Mensah","Cornerstone Ventures","Lumina Analytics","Sokoya & Partners",
  "Teal River Corp","Nordic Fleet Ltd","Zanele Dube","Marco Industries",
  "Hive Technologies","Okafor Consulting","Stratum Capital","Vela Maritime",
  "Kestrel Media","Dynamo Retail","Sandpiper Trust","Forthright Group",
];
const TYPES    = ["Corporate", "Individual", "SME"];
const STATUSES = ["active", "active", "active", "pending", "suspended", "inactive"];

const ALL_MOCK = Array.from({ length: 120 }, (_, i) => {
  const base = NAMES[i % NAMES.length];
  const suffix = i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : "";
  const name = base + suffix;
  return {
    id: `CLT-${String(i + 1).padStart(4, "0")}`,
    name,
    email: name.toLowerCase().replace(/[^a-z0-9]/g, ".").replace(/\.+/g, ".") + "@company.com",
    type: TYPES[i % TYPES.length],
    status: STATUSES[i % STATUSES.length],
    quotes: Math.round(Math.random() * 40) + 1,
    transactions: Math.round(Math.random() * 200) + 5,
    phone: `+27 ${Math.round(Math.random() * 89 + 10)} ${Math.round(Math.random() * 899 + 100)} ${Math.round(Math.random() * 8999 + 1000)}`,
    address: `${Math.round(Math.random() * 98 + 1)} Business Park, Johannesburg`,
    createdAt: new Date(2022, i % 12, (i % 28) + 1).toISOString(),
  };
});

async function defaultFetchClients(page: any, pageSize: any, signal: any) {
  await new Promise((r) => setTimeout(r, 500 + Math.round(Math.random() * 400)));
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const start = (page - 1) * pageSize;
  return { data: ALL_MOCK.slice(start, start + pageSize), total: ALL_MOCK.length };
}

// ─── Reusable atoms ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: any) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.inactive;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 10, background: cfg.bg, color: cfg.text, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function Shimmer({ w = "100%", h = 14, r = 6, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", flexShrink: 0, ...style }} />;
}

function InfoCard({ label, value }: any) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", border: "1px solid #f1f5f9" }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "#94a3b8", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{value ?? "—"}</div>
    </div>
  );
}

function ABtn({ children, variant = "ghost", onClick }: any) {
  const base = { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 13px", fontSize: 12, fontWeight: 500, borderRadius: 8, cursor: "pointer", border: "1px solid", transition: "opacity 0.15s" };
  const v = {
    ghost:   { ...base, background: "white",   borderColor: "#e2e8f0",  color: "#475569" },
    primary: { ...base, background: "#185FA5", borderColor: "#185FA5",  color: "white"   },
    danger:  { ...base, background: "white",   borderColor: "#fca5a5",  color: "#A32D2D" },
  };
  return <button style={v[variant] || v.ghost} onClick={onClick} onMouseEnter={e => e.currentTarget.style.opacity="0.8"} onMouseLeave={e => e.currentTarget.style.opacity="1"}>{children}</button>;
}

// ─── Loading skeletons ─────────────────────────────────────────────────────────
function ListSkeleton() {
  return (
    <div style={{ padding: "8px 0" }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #f8fafc" }}>
          <Shimmer w={36} h={36} r={10} />
          <div style={{ flex: 1 }}>
            <Shimmer w="68%" h={13} style={{ marginBottom: 7 }} />
            <Shimmer w="40%" h={10} />
          </div>
          <Shimmer w={38} h={18} r={9} />
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 14, marginBottom: 22, alignItems: "center" }}>
        <Shimmer w={48} h={48} r={13} />
        <div style={{ flex: 1 }}>
          <Shimmer w="55%" h={16} style={{ marginBottom: 9 }} />
          <Shimmer w="30%" h={11} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {[80,80,95,80].map((w,i) => <Shimmer key={i} w={w} h={32} r={8} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: 12 }}>
            <Shimmer w="38%" h={9} style={{ marginBottom: 9 }} />
            <Shimmer w="62%" h={13} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Detail pane ───────────────────────────────────────────────────────────────
const DETAIL_TABS = ["Overview", "Quotes", "Transactions", "Notes"];

const MOCK_QUOTES = [
  { id: "QT-2241", date: "28 Apr 2026", amount: "R 42,000",  status: "active"   },
  { id: "QT-2198", date: "14 Mar 2026", amount: "R 118,500", status: "pending"  },
  { id: "QT-2101", date: "02 Jan 2026", amount: "R 7,200",   status: "inactive" },
];
const MOCK_TXNS = [
  { id: "TXN-8812", date: "30 Apr 2026", amount: "R 42,000",  ref: "Invoice #1042" },
  { id: "TXN-8749", date: "15 Mar 2026", amount: "R 118,500", ref: "Invoice #1039" },
  { id: "TXN-8601", date: "10 Jan 2026", amount: "R 7,200",   ref: "Invoice #1031" },
];

function ClientDetail({ client, onClose, isMobile }: any) {
  const [tab, setTab] = useState("Overview");
  const { bg, text } = avatarColor(client.name);
  const since = client.createdAt
    ? new Date(client.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", animation: "fadeIn 0.18s ease" }}>
      {/* Header */}
      <div style={{ padding: "13px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", position: "sticky", top: 0, zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
          {isMobile && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#64748b", padding: "0 6px 0 0", lineHeight: 1, flexShrink: 0 }}>‹</button>
          )}
          <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, color: text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
            {initials(client.name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", marginTop: 1 }}>{client.id} · {client.type}</div>
          </div>
        </div>
        <StatusBadge status={client.status} />
      </div>

      {/* Action bar */}
      <div style={{ padding: "10px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <ABtn variant="primary">✏ Edit</ABtn>
        <ABtn>📋 Quotes</ABtn>
        <ABtn>💳 Transactions</ABtn>
        <ABtn variant="danger">⊘ Disable</ABtn>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 18px", borderBottom: "1px solid #f1f5f9", display: "flex" }}>
        {DETAIL_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 14px", fontSize: 12, fontWeight: 500, background: "none", border: "none", cursor: "pointer", color: tab === t ? "#185FA5" : "#64748b", borderBottom: tab === t ? "2px solid #185FA5" : "2px solid transparent", marginBottom: -1, transition: "color 0.12s" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {tab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <InfoCard label="Client Type" value={client.type} />
            <InfoCard label="Status" value={STATUS_CFG[client.status]?.label} />
            <InfoCard label="Email" value={client.email} />
            <InfoCard label="Phone" value={client.phone} />
            <InfoCard label="Total Quotes" value={fmt(client.quotes)} />
            <InfoCard label="Total Transactions" value={fmt(client.transactions)} />
            {since && <InfoCard label="Member Since" value={since} />}
            {client.address && <InfoCard label="Address" value={client.address} />}
          </div>
        )}

        {tab === "Quotes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_QUOTES.map(q => (
              <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", fontFamily: "monospace" }}>{q.id}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{q.date}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{q.amount}</span>
                  <StatusBadge status={q.status} />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Transactions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_TXNS.map(t => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", fontFamily: "monospace" }}>{t.id}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{t.ref} · {t.date}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{t.amount}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "Notes" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", color: "#94a3b8" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span style={{ fontSize: 13, marginTop: 10 }}>No notes yet for this client.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pagination bar ─────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }: any) {
  if (totalPages <= 1) return null;

  const range = [];
  const delta = 1;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) range.push(i);
  const showLeft  = range[0] > 1;
  const showRight = range[range.length - 1] < totalPages;

  const Btn = ({ n, label, active, disabled }: any) => (
    <button
      disabled={disabled}
      onClick={() => !disabled && onChange(n)}
      style={{
        width: 28, height: 28, borderRadius: 7, fontSize: 12, fontWeight: 500,
        border: active ? "1px solid #185FA5" : "1px solid #e2e8f0",
        background: active ? "#185FA5" : "white",
        color: active ? "white" : disabled ? "#cbd5e1" : "#475569",
        cursor: disabled ? "default" : "pointer",
      }}
    >{label ?? n}</button>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, padding: "8px 4px 4px" }}>
      <Btn n={page - 1} label="‹" disabled={page === 1} />
      {showLeft && <><Btn n={1} active={page === 1} />{range[0] > 2 && <span style={{ color: "#94a3b8", fontSize: 12 }}>…</span>}</>}
      {range.map(p => <Btn key={p} n={p} active={p === page} />)}
      {showRight && <>{range[range.length-1] < totalPages-1 && <span style={{ color: "#94a3b8", fontSize: 12 }}>…</span>}<Btn n={totalPages} active={page === totalPages} /></>}
      <Btn n={page + 1} label="›" disabled={page === totalPages} />
    </div>
  );
}

// ─── Root component ─────────────────────────────────────────────────────────────
export default function ClientManager({ fetchClients = defaultFetchClients }) {
  const [clients, setClients]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDetail, setShowDetail] = useState(false); // mobile: is detail open?
  const [isMobile, setIsMobile] = useState(false);
  const abortRef = useRef(null);

  // Detect mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const h = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  // Fetch on page change
  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);

    fetchClients(page, PAGE_SIZE, ctrl.signal)
      .then(({ data, total }) => {
        setClients(data);
        setTotal(total);
        setSelected(prev => data.find(c => c.id === prev?.id) ?? data[0] ?? null);
        setLoading(false);
      })
      .catch(err => { if (err.name !== "AbortError") setLoading(false); });

    return () => ctrl.abort();
  }, [page, fetchClients]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Client-side filter within the loaded page
  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSelect = useCallback((client: any) => {
    setSelected(client);
    if (isMobile) setShowDetail(true);
  }, [isMobile]);

  const handlePageChange = (p: any) => { setPage(p); setShowDetail(false); };

  // Whether to show list / detail on mobile
  const showList   = !isMobile || !showDetail;
  const showRHS    = !isMobile || showDetail;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .cm-row { cursor:pointer; border-left: 3px solid transparent; transition: background 0.12s, border-color 0.12s; }
        .cm-row:hover { background: #f8fafc; }
        .cm-row.sel { background: #eff6ff; border-left-color: #185FA5; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", height: "100%", minHeight: 520, border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", background: "white", boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}>

        {/* ── Top bar ── */}
        <div style={{ padding: "12px 18px", background: "#0C447C", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "white", letterSpacing: "-0.2px" }}>Client Manager</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: 10 }}>
              {loading ? "Loading…" : `${fmt(total)} clients`}
            </span>
            <button style={{ padding: "6px 13px", fontSize: 12, fontWeight: 500, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "white", borderRadius: 8, cursor: "pointer" }}>
              + Add Client
            </button>
          </div>
        </div>

        {/* ── Body: list + detail ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── LEFT: List pane ── */}
          {showList && (
            <div style={{ width: isMobile ? "100%" : 270, flexShrink: 0, borderRight: isMobile ? "none" : "1px solid #f1f5f9", display: "flex", flexDirection: "column", background: "white" }}>

              {/* Search + filter */}
              <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
                <div style={{ position: "relative", marginBottom: 7 }}>
                  <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search clients…"
                    style={{ width: "100%", padding: "7px 10px 7px 27px", border: "1px solid #e8edf2", borderRadius: 9, fontSize: 12, outline: "none", background: "#f8fafc", color: "#0f172a", boxSizing: "border-box" }}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  style={{ width: "100%", padding: "6px 9px", border: "1px solid #e8edf2", borderRadius: 9, fontSize: 12, background: "#f8fafc", color: "#64748b", outline: "none" }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Rows */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {loading ? <ListSkeleton /> : filtered.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No clients found</div>
                ) : filtered.map((client: any, i: number) => {
                  const { bg, tc } = avatarColor(client.name);
                  const isActive = selected?.id === client.id;
                  const cfg = STATUS_CFG[client.status] || STATUS_CFG.inactive;
                  return (
                    <div
                      key={client.id}
                      className={`cm-row${isActive ? " sel" : ""}`}
                      onClick={() => handleSelect(client)}
                      style={{ padding: "11px 14px 11px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: 10, animation: `fadeIn 0.18s ease both`, animationDelay: `${Math.min(i, 7) * 25}ms` }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: avatarColor(client.name).bg, color: avatarColor(client.name).text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {initials(client.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.name}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace", marginTop: 2 }}>{client.id}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot }} />
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{client.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination — shown only when total > PAGE_SIZE */}
              {!loading && total > PAGE_SIZE && (
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "2px 8px 6px", flexShrink: 0 }}>
                  <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
                  <div style={{ textAlign: "center", fontSize: 10, color: "#94a3b8", paddingBottom: 4 }}>
                    Page {page} of {totalPages} · {fmt(total)} total records
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── RIGHT: Detail pane ── */}
          {showRHS && (
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {loading ? (
                <DetailSkeleton />
              ) : selected ? (
                <div style={{ flex: 1, overflowY: "auto" }}>
                  <ClientDetail client={selected} onClose={() => setShowDetail(false)} isMobile={isMobile} />
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#94a3b8" }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span style={{ fontSize: 13 }}>Select a client to view details</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}