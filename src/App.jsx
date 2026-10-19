import { useState } from 'react';
import { Button, StatusPill, VerificationMarker, DataTable, EmptyState } from './components/ui.jsx';
import { Icon } from './components/icons.jsx';
import WorkspaceView from './features/RequestWorkspace.jsx';
import Dashboard from './features/Dashboard.jsx';

// Section metadata (routing keys unchanged — content switching below depends on them).
const SECTIONS = {
  dashboard: { label: 'Dashboard', icon: 'dashboard', sub: 'Requests that need you — approvals, missing info and open deals.' },
  workspace: { label: 'Requests', icon: 'requests', sub: 'Turn a messy enquiry into a verified, approved offer.' },
  suppliers: { label: 'Suppliers', icon: 'suppliers', sub: 'Verified supplier responses and the evidence behind them.' },
  offers: { label: 'Offers & approvals', icon: 'offers', sub: 'Draft offers awaiting your sign-off.' },
  followups: { label: 'Follow-ups', icon: 'followups', sub: 'Deals that need a nudge.' },
  audit: { label: 'Audit log', icon: 'audit', sub: 'Append-only record of every important change.' },
  components: { label: 'Components', icon: 'components', sub: 'The design-system primitives this interface is built from.' },
};

// Navigation grouping (deliberate hierarchy; labels are subtle section dividers).
const NAV_GROUPS = [
  { label: null, items: ['dashboard'] },
  { label: 'Workspace', items: ['workspace', 'suppliers', 'offers', 'followups'] },
  { label: 'System', items: ['audit', 'components'] },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="grid place-items-center w-[26px] h-[26px] rounded-[7px] bg-brand text-on-brand shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
      </span>
      <div className="leading-none min-w-0">
        <div className="text-[13.5px] font-semibold tracking-[-0.01em] text-ink truncate">Operating Agent</div>
        <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-subtle mt-[3px]">Mission Control</div>
      </div>
    </div>
  );
}

function SimBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-warn whitespace-nowrap" title="Supplier responses, sending and figures are mocked and clearly labelled.">
      <span className="w-1.5 h-1.5 rounded-full bg-warn shrink-0" />
      Simulated prototype
    </span>
  );
}

function NavRow({ k, active, onSelect }) {
  const s = SECTIONS[k];
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(k)}
      className={`group relative w-full flex items-center gap-2.5 rounded-[6px] pl-3 pr-2.5 py-[7px] text-[13px] font-medium cursor-pointer border-0 bg-transparent text-left transition-colors ${
        active ? 'bg-surface-2 text-ink' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
      }`}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-brand" />}
      <Icon name={s.icon} className={`w-4 h-4 shrink-0 ${active ? 'text-brand' : 'text-ink-subtle group-hover:text-ink-muted'}`} />
      <span className="truncate">{s.label}</span>
    </button>
  );
}

function Nav({ current, onSelect }) {
  return (
    <nav role="tablist" className="flex flex-col">
      {NAV_GROUPS.map((g, gi) => (
        <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
          {g.label && (
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">{g.label}</div>
          )}
          <div className="flex flex-col gap-0.5">
            {g.items.map((k) => (
              <NavRow key={k} k={k} active={current === k} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Placeholder({ title }) {
  return (
    <EmptyState
      title={`${title} — on the build roadmap`}
      body={<>The live, end-to-end flow is in <strong>Requests</strong>. This section is scaffolded for the next build increment.</>}
    />
  );
}

function Showcase() {
  const panel = 'bg-surface-2 border border-border rounded-[12px] p-4';
  const label = 'text-[10px] tracking-[0.08em] uppercase text-ink-subtle font-semibold mb-3';
  return (
    <div className="grid grid-cols-1 min-[640px]:grid-cols-2 gap-3">
      <div className={panel}>
        <div className={label}>Buttons</div>
        <div className="flex gap-2 flex-wrap items-center">
          <Button variant="primary">Approve</Button><Button variant="secondary">Changes</Button>
          <Button variant="ghost">Ask</Button><Button variant="danger">Decline</Button><Button disabled>Locked</Button>
        </div>
      </div>
      <div className={panel}>
        <div className={label}>Workflow status</div>
        <div className="flex gap-2 flex-wrap">
          {['NEW', 'NEEDS_INFO', 'SOURCING', 'AWAITING_APPROVAL', 'SENT', 'ACCEPTED', 'RECONCILED', 'BLOCKED'].map((x) => <StatusPill key={x} status={x} />)}
        </div>
      </div>
      <div className={panel}>
        <div className={label}>Evidence status</div>
        <div className="flex gap-4 flex-wrap items-center"><VerificationMarker kind="confirmed" /><VerificationMarker kind="inferred" /><VerificationMarker kind="unverified" /></div>
      </div>
      <div className={panel}>
        <div className={label}>Commission status</div>
        <div className="flex gap-2 flex-wrap">
          <StatusPill tone="warn">commission · pending</StatusPill><StatusPill tone="ok">commission · ok</StatusPill><StatusPill tone="danger">commission · unpaid</StatusPill>
        </div>
      </div>
      <div className={`${panel} min-[640px]:col-span-2`}>
        <div className={label}>Data table</div>
        <DataTable
          columns={[{ key: 'req', label: 'Request' }, { key: 'svc', label: 'Service' }, { key: 'wf', label: 'Workflow' }, { key: 'ev', label: 'Evidence' }]}
          rows={[
            { req: <span className="font-mono">REQ-0042</span>, svc: 'Vehicle', wf: <StatusPill status="AWAITING_APPROVAL" />, ev: <VerificationMarker kind="confirmed" label="1 verified" /> },
            { req: <span className="font-mono">REQ-0043</span>, svc: 'Goods', wf: <StatusPill status="SOURCING" />, ev: <VerificationMarker kind="unverified" label="0 verified" /> },
          ]}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  const meta = SECTIONS[tab];
  const select = (k) => { setTab(k); setNavOpen(false); };
  const content = tab === 'dashboard' ? <Dashboard /> : tab === 'workspace' ? <WorkspaceView /> : tab === 'components' ? <Showcase /> : <Placeholder title={meta.label} />;

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden min-[900px]:flex flex-col w-[220px] shrink-0 h-screen sticky top-0 border-r border-border bg-surface">
        <div className="h-12 shrink-0 flex items-center px-4 border-b border-border"><Logo /></div>
        <div className="flex-1 overflow-y-auto px-2.5 py-4"><Nav current={tab} onSelect={select} /></div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-12 shrink-0 flex items-center gap-3 px-4 min-[900px]:px-8 border-b border-border bg-surface">
          <button
            className="min-[900px]:hidden grid place-items-center w-8 h-8 -ml-1.5 rounded-[6px] text-ink-muted hover:bg-surface-2 hover:text-ink cursor-pointer border-0 bg-transparent"
            onClick={() => setNavOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
          >
            <Icon name={navOpen ? 'close' : 'menu'} className="w-[18px] h-[18px]" />
          </button>
          <div className="flex items-center gap-2 min-w-0 text-[13px]">
            <span className="text-ink-subtle hidden min-[560px]:inline">Operating Agent</span>
            <Icon name="chevron" className="w-3.5 h-3.5 text-ink-subtle hidden min-[560px]:inline shrink-0" />
            <span className="font-semibold text-ink truncate">{meta.label}</span>
          </div>
          <div className="ml-auto flex items-center"><SimBadge /></div>
        </header>

        {/* Mobile nav drawer */}
        {navOpen && (
          <div className="min-[900px]:hidden border-b border-border bg-surface px-2.5 pt-3 pb-4">
            <Nav current={tab} onSelect={select} />
          </div>
        )}

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="px-4 min-[900px]:px-8 py-6 pb-16 max-w-[1320px]">
            {meta.sub && (
              <div className="mb-5 pb-3.5 border-b border-border">
                <p className="text-[13px] text-ink-muted">{meta.sub}</p>
              </div>
            )}
            {content}
          </div>
        </main>
      </div>
    </div>
  );
}
