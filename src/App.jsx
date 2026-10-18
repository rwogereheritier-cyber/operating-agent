import { useState } from 'react';
import { Button, Card, StatusPill, VerificationMarker, DataTable } from './components/ui.jsx';
import WorkspaceView from './features/RequestWorkspace.jsx';

function ThemeToggle() {
  const [, force] = useState(0);
  const toggle = () => {
    const el = document.documentElement;
    el.dataset.theme = el.dataset.theme === 'dark' ? 'light' : 'dark';
    force((n) => n + 1);
  };
  return <button onClick={toggle} className="font-mono text-[12px] cursor-pointer bg-surface text-ink border border-border-strong rounded-full px-3 py-1.5">◐ Theme</button>;
}

function Showcase() {
  return (
    <div className="grid grid-cols-1 min-[640px]:grid-cols-2 gap-4">
      <Card>
        <div className="text-[11px] tracking-[0.06em] uppercase text-ink-subtle font-semibold mb-2.5">Buttons</div>
        <div className="flex gap-2.5 flex-wrap items-center">
          <Button variant="primary">Approve</Button><Button variant="secondary">Changes</Button>
          <Button variant="ghost">Ask</Button><Button variant="danger">Decline</Button><Button disabled>Locked</Button>
        </div>
      </Card>
      <Card>
        <div className="text-[11px] tracking-[0.06em] uppercase text-ink-subtle font-semibold mb-2.5">Workflow status</div>
        <div className="flex gap-2 flex-wrap">
          {['NEW', 'NEEDS_INFO', 'SOURCING', 'AWAITING_APPROVAL', 'SENT', 'ACCEPTED', 'RECONCILED', 'BLOCKED'].map((x) => <StatusPill key={x} status={x} />)}
        </div>
      </Card>
      <Card>
        <div className="text-[11px] tracking-[0.06em] uppercase text-ink-subtle font-semibold mb-2.5">Evidence status</div>
        <div className="flex gap-4 flex-wrap items-center"><VerificationMarker kind="confirmed" /><VerificationMarker kind="inferred" /><VerificationMarker kind="unverified" /></div>
      </Card>
      <Card>
        <div className="text-[11px] tracking-[0.06em] uppercase text-ink-subtle font-semibold mb-2.5">Commission status</div>
        <div className="flex gap-2 flex-wrap">
          <StatusPill tone="warn">commission · pending</StatusPill><StatusPill tone="ok">commission · ok</StatusPill><StatusPill tone="danger">commission · unpaid</StatusPill>
        </div>
      </Card>
      <Card className="min-[640px]:col-span-2">
        <div className="text-[11px] tracking-[0.06em] uppercase text-ink-subtle font-semibold mb-2.5">Data table</div>
        <DataTable
          columns={[{ key: 'req', label: 'Request' }, { key: 'svc', label: 'Service' }, { key: 'wf', label: 'Workflow' }, { key: 'ev', label: 'Evidence' }]}
          rows={[
            { req: <span className="font-mono">REQ-0042</span>, svc: 'Vehicle', wf: <StatusPill status="AWAITING_APPROVAL" />, ev: <VerificationMarker kind="confirmed" label="1 verified" /> },
            { req: <span className="font-mono">REQ-0043</span>, svc: 'Goods', wf: <StatusPill status="SOURCING" />, ev: <VerificationMarker kind="unverified" label="0 verified" /> },
            { req: <span className="font-mono">REQ-0044</span>, svc: 'Property', wf: <StatusPill status="NEEDS_INFO" />, ev: <VerificationMarker kind="inferred" label="inferred" /> },
          ]}
        />
      </Card>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('workspace');
  return (
    <div>
      <div className="bg-warn-weak text-warn border-b border-border text-[12.5px] font-semibold text-center px-3 py-[7px]">
        SIMULATED PROTOTYPE · supplier responses and sending are mocked and clearly labelled · no real action is performed
      </div>
      <nav className="sticky top-0 z-10 bg-surface border-b border-border flex items-center gap-3.5 px-4 py-2.5">
        <div className="flex items-center gap-2.5 font-display text-[18px] tracking-[-0.01em]"><span className="w-[22px] h-[22px] rounded-[7px] bg-brand inline-block" /> Operating Agent</div>
        <div className="flex gap-1 ml-1.5" role="tablist">
          {[['workspace', 'Request Workspace'], ['components', 'Components']].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`text-[13px] font-semibold rounded-[6px] px-3 py-[7px] cursor-pointer border-0 ${tab === id ? 'bg-brand-weak text-brand' : 'bg-transparent text-ink-muted'}`}>{label}</button>
          ))}
        </div>
        <div className="ml-auto"><ThemeToggle /></div>
      </nav>
      {tab === 'workspace' && (
        <div className="bg-brand-weak">
          <div className="max-w-[1120px] mx-auto px-6 py-12">
            <h1 className="font-display text-[clamp(30px,5vw,44px)] leading-[1.05] tracking-[-0.015em] text-brand max-w-[16ch]">Fewer clicks. Every deal under control.</h1>
            <p className="text-ink-muted mt-4 max-w-[54ch] text-[15px] leading-relaxed">The operator's cockpit — turn a messy enquiry into a verified, approved offer. Nothing invented, and nothing sent without you.</p>
          </div>
        </div>
      )}
      <div className="max-w-[1120px] mx-auto px-6 py-8 pb-16">
        {tab === 'workspace' ? <WorkspaceView /> : <Showcase />}
      </div>
    </div>
  );
}
