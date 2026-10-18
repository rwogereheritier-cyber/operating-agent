import { useState } from 'react';
import { Button, StatusPill, VerificationMarker, DataTable, EmptyState } from './components/ui.jsx';
import { Icon } from './components/icons.jsx';
import WorkspaceView from './features/RequestWorkspace.jsx';
import Dashboard from './features/Dashboard.jsx';

const SECTIONS = {
  dashboard: { label: 'Dashboard', icon: 'dashboard', title: 'Overview', sub: 'Your deals at a glance.' },
  workspace: { label: 'Requests', icon: 'requests', title: 'Request workspace', sub: 'Turn a messy enquiry into a verified, approved offer.' },
  suppliers: { label: 'Suppliers', icon: 'suppliers', title: 'Suppliers', sub: 'Verified supplier responses and evidence.' },
  offers: { label: 'Offers & approvals', icon: 'offers', title: 'Offers & approvals', sub: 'Draft offers awaiting your sign-off.' },
  followups: { label: 'Follow-ups', icon: 'followups', title: 'Follow-ups', sub: 'Deals that need a nudge.' },
  audit: { label: 'Audit log', icon: 'audit', title: 'Audit log', sub: 'Append-only record of every change.' },
  components: { label: 'Components', icon: 'components', title: 'Components', sub: 'The design-system primitives.' },
};
const ORDER = ['dashboard', 'workspace', 'suppliers', 'offers', 'followups', 'audit', 'components'];

function ThemeToggle() {
  const [, force] = useState(0);
  const toggle = () => {
    const el = document.documentElement;
    el.dataset.theme = el.dataset.theme === 'dark' ? 'light' : 'dark';
    force((n) => n + 1);
  };
  return <button onClick={toggle} className="font-mono text-[12px] cursor-pointer bg-surface text-ink border border-border-strong rounded-full px-3 py-1.5 hover:bg-surface-2">◐ Theme</button>;
}

function NavList({ current, onSelect, orientation }) {
  const horizontal = orientation === 'horizontal';
  return (
    <nav className={horizontal ? 'flex gap-1.5' : 'flex flex-col gap-1'} role="tablist">
      {ORDER.map((key) => {
        const s = SECTIONS[key];
        const active = current === key;
        const base = horizontal
          ? `shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap ${active ? 'bg-brand-weak text-brand' : 'text-ink-muted hover:bg-surface-2'}`
          : `w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13.5px] font-medium ${active ? 'bg-brand-weak text-brand' : 'text-ink-muted hover:bg-surface-2'}`;
        return (
          <button key={key} role="tab" aria-selected={active} onClick={() => onSelect(key)} className={`cursor-pointer border-0 bg-transparent text-left ${base}`}>
            <Icon name={s.icon} className="w-[17px] h-[17px] shrink-0" />
            <span>{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Placeholder({ title }) {
  return <EmptyState title={`${title} — on the build roadmap`} body={<>The live, end-to-end flow is in <strong>Requests</strong>. This section is scaffolded for the next build increment.</>} />;
}

function Showcase() {
  return (
    <div className="grid grid-cols-1 min-[640px]:grid-cols-2 gap-4">
      <div className="bg-surface border border-border rounded-[20px] p-5">
        <div className="text-[11px] tracking-[0.06em] uppercase text-ink-subtle font-semibold mb-2.5">Buttons</div>
        <div className="flex gap-2.5 flex-wrap items-center">
          <Button variant="primary">Approve</Button><Button variant="secondary">Changes</Button>
          <Button variant="ghost">Ask</Button><Button variant="danger">Decline</Button><Button disabled>Locked</Button>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-[20px] p-5">
        <div className="text-[11px] tracking-[0.06em] uppercase text-ink-subtle font-semibold mb-2.5">Workflow status</div>
        <div className="flex gap-2 flex-wrap">
          {['NEW', 'NEEDS_INFO', 'SOURCING', 'AWAITING_APPROVAL', 'SENT', 'ACCEPTED', 'RECONCILED', 'BLOCKED'].map((x) => <StatusPill key={x} status={x} />)}
        </div>
      </div>
      <div className="bg-surface border border-border rounded-[20px] p-5">
        <div className="text-[11px] tracking-[0.06em] uppercase text-ink-subtle font-semibold mb-2.5">Evidence status</div>
        <div className="flex gap-4 flex-wrap items-center"><VerificationMarker kind="confirmed" /><VerificationMarker kind="inferred" /><VerificationMarker kind="unverified" /></div>
      </div>
      <div className="bg-surface border border-border rounded-[20px] p-5">
        <div className="text-[11px] tracking-[0.06em] uppercase text-ink-subtle font-semibold mb-2.5">Commission status</div>
        <div className="flex gap-2 flex-wrap">
          <StatusPill tone="warn">commission · pending</StatusPill><StatusPill tone="ok">commission · ok</StatusPill><StatusPill tone="danger">commission · unpaid</StatusPill>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-[20px] p-5 min-[640px]:col-span-2">
        <div className="text-[11px] tracking-[0.06em] uppercase text-ink-subtle font-semibold mb-2.5">Data table</div>
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
  const meta = SECTIONS[tab];
  const content = tab === 'dashboard' ? <Dashboard /> : tab === 'workspace' ? <WorkspaceView /> : tab === 'components' ? <Showcase /> : <Placeholder title={meta.title} />;
  const Logo = ({ size = 22 }) => (
    <div className="flex items-center gap-2.5 font-display text-[17px] tracking-[-0.01em]">
      <span className="rounded-[7px] bg-brand inline-block" style={{ width: size, height: size }} /> Operating Agent
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="bg-warn-weak text-warn border-b border-border text-[12.5px] font-semibold text-center px-3 py-[7px]">
        SIMULATED PROTOTYPE · supplier responses, sending, and dashboard figures are mocked and clearly labelled
      </div>
      <div className="min-[900px]:flex">
        <aside className="hidden min-[900px]:flex flex-col w-[236px] shrink-0 h-screen sticky top-0 border-r border-border bg-surface px-3 py-4">
          <div className="px-2 pb-4"><Logo /></div>
          <NavList current={tab} onSelect={setTab} orientation="vertical" />
        </aside>

        <main className="flex-1 min-w-0">
          <div className="min-[900px]:hidden sticky top-0 z-10 bg-surface border-b border-border">
            <div className="flex items-center justify-between px-4 py-3"><Logo size={20} /><ThemeToggle /></div>
            <div className="px-3 pb-2 overflow-x-auto"><NavList current={tab} onSelect={setTab} orientation="horizontal" /></div>
          </div>
          <div className="hidden min-[900px]:flex items-center justify-end px-6 py-3.5 border-b border-border"><ThemeToggle /></div>

          <div className="max-w-[1080px] mx-auto px-6 py-8 pb-16">
            <div className="mb-6">
              <h1 className="font-display text-[26px] tracking-[-0.015em]">{meta.title}</h1>
              {meta.sub && <p className="text-ink-muted mt-1 text-[14px]">{meta.sub}</p>}
            </div>
            {content}
          </div>
        </main>
      </div>
    </div>
  );
}
