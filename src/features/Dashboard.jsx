import { StatusPill, VerificationMarker, DataTable } from '../components/ui.jsx';

// All figures here are SIMULATED demo data, clearly labelled.
function StatTile({ label, value, delta, tone }) {
  return (
    <div className="bg-surface border border-border rounded-[20px] p-5">
      <div className="text-[11.5px] text-ink-subtle font-semibold uppercase tracking-[0.05em]">{label}</div>
      <div className="flex items-end gap-2 mt-2.5">
        <div className="font-display text-[30px] leading-none tracking-[-0.01em]">{value}</div>
        {delta && <StatusPill tone={tone || 'ok'}>{delta}</StatusPill>}
      </div>
    </div>
  );
}

function Sparkline({ data, color = 'var(--ok)' }) {
  const w = 260, h = 60, max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / (max - min || 1)) * (h - 10) - 5]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16 mt-3" preserveAspectRatio="none">
      <path d={area} fill={color} opacity="0.12" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const TREND = [12, 14, 13, 16, 18, 17, 20, 19, 23, 24, 26, 28];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 min-[1000px]:grid-cols-4 gap-4">
        <StatTile label="Open requests" value="7" delta="this week" tone="neutral" />
        <StatTile label="Awaiting your approval" value="2" delta="action" tone="warn" />
        <StatTile label="Commission pending" value="AED 6,000" delta="2 deals" tone="warn" />
        <StatTile label="Reconciled · 30d" value="AED 48,500" delta="+12%" tone="ok" />
      </div>

      <div className="grid grid-cols-1 min-[1000px]:grid-cols-[1.2fr_1fr] gap-4">
        <div className="bg-surface border border-border rounded-[20px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11.5px] text-ink-subtle font-semibold uppercase tracking-[0.05em]">Commission collected</div>
              <div className="flex items-end gap-2 mt-2.5">
                <div className="font-display text-[34px] leading-none tracking-[-0.01em]">AED 48,500</div>
                <StatusPill tone="ok">+12%</StatusPill>
              </div>
              <div className="text-[12px] text-ink-subtle mt-1">last 12 weeks · simulated</div>
            </div>
          </div>
          <Sparkline data={TREND} />
        </div>

        <div className="bg-brand-weak border border-transparent rounded-[20px] p-5 flex flex-col justify-center">
          <div className="font-display text-[20px] text-brand tracking-[-0.01em]">Nothing invented. Nothing sent without you.</div>
          <p className="text-[13px] text-ink-muted mt-2">Every price traces to a verified supplier and a recorded approval. The full trail lives in the audit log.</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[20px] p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="font-display text-[18px] tracking-[-0.01em]">Recent requests</div>
          <span className="text-[12px] text-ink-subtle">simulated</span>
        </div>
        <DataTable
          columns={[{ key: 'req', label: 'Request' }, { key: 'svc', label: 'Service' }, { key: 'wf', label: 'Workflow' }, { key: 'ev', label: 'Evidence' }, { key: 'val', label: 'Value' }]}
          rows={[
            { req: <span className="font-mono">REQ-0042</span>, svc: 'Vehicle', wf: <StatusPill status="AWAITING_APPROVAL" />, ev: <VerificationMarker kind="confirmed" label="1 verified" />, val: <span className="font-mono">AED 50,000</span> },
            { req: <span className="font-mono">REQ-0041</span>, svc: 'Vehicle', wf: <StatusPill status="RECONCILED" />, ev: <VerificationMarker kind="confirmed" label="verified" />, val: <span className="font-mono">AED 72,000</span> },
            { req: <span className="font-mono">REQ-0040</span>, svc: 'Goods', wf: <StatusPill status="SOURCING" />, ev: <VerificationMarker kind="unverified" label="0 verified" />, val: <span className="font-mono text-ink-subtle">—</span> },
            { req: <span className="font-mono">REQ-0039</span>, svc: 'Property', wf: <StatusPill status="NEEDS_INFO" />, ev: <VerificationMarker kind="inferred" label="inferred" />, val: <span className="font-mono text-ink-subtle">—</span> },
          ]}
        />
      </div>
    </div>
  );
}
