// The design-system primitives. Trust & precision, built on the shared tokens.
// Button, Field, Card, StatusPill, VerificationMarker, ApprovalPanel, DataTable.

const btnBase = 'inline-flex items-center justify-center gap-2 text-[14px] font-semibold cursor-pointer rounded-full px-5 py-2.5 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
const btnVariants = {
  primary: 'bg-brand text-on-brand hover:bg-brand-ink',
  secondary: 'bg-surface text-ink border-border-strong hover:bg-surface-2',
  ghost: 'bg-transparent text-brand hover:bg-brand-weak',
  danger: 'bg-danger text-white',
};
export function Button({ variant = 'secondary', className = '', ...props }) {
  return <button className={`${btnBase} ${btnVariants[variant]} ${className}`} {...props} />;
}

export function Field({ label, hint, hintTone, missing, children, id }) {
  const hintColor = hintTone === 'warn' ? 'text-warn' : hintTone === 'danger' ? 'text-danger' : 'text-ink-subtle';
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      {label && <label htmlFor={id} className="text-[12.5px] font-semibold">{label}</label>}
      {children ?? (
        <input
          id={id}
          className={`font-[inherit] text-[14px] text-ink bg-surface border rounded-[6px] px-[11px] py-[9px] w-full outline-none focus:border-brand ${missing ? 'border-warn bg-warn-weak' : 'border-border-strong'}`}
        />
      )}
      {hint && <span className={`text-[11.5px] ${hintColor}`}>{hint}</span>}
    </div>
  );
}

export function Card({ title, sub, right, className = '', children }) {
  return (
    <div className={`bg-surface border border-border rounded-[20px] shadow-[0_1px_2px_rgba(20,28,38,0.04)] p-5 min-w-0 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-2.5 mb-3.5">
          <div>
            {title && <div className="font-display text-[18px] tracking-[-0.01em]">{title}</div>}
            {sub && <div className="text-[12px] text-ink-subtle">{sub}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

const pillTone = {
  neutral: 'text-ink-muted bg-surface-2 border-border',
  info: 'text-info bg-info-weak border-transparent',
  brand: 'text-brand bg-brand-weak border-transparent',
  warn: 'text-warn bg-warn-weak border-transparent',
  ok: 'text-ok bg-ok-weak border-transparent',
  danger: 'text-danger bg-danger-weak border-transparent',
};
const workflowTone = {
  NEW:'neutral', NEEDS_INFO:'warn', SOURCING:'info', OFFER_DRAFT:'neutral', AWAITING_APPROVAL:'warn',
  SENT:'info', ACCEPTED:'ok', IN_PROGRESS:'brand', COMPLETED:'ok', COMMISSION_PENDING:'warn',
  RECONCILED:'ok', BLOCKED:'danger', DECLINED:'neutral',
};
export function StatusPill({ status, tone, children }) {
  const t = tone || workflowTone[status] || 'neutral';
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11.5px] font-medium tracking-[0.02em] px-2.5 py-1 rounded-full border ${pillTone[t]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children || status}
    </span>
  );
}

// kind: 'confirmed' | 'inferred' | 'unverified'
export function VerificationMarker({ kind, label }) {
  const tone = kind === 'confirmed' ? 'text-ok' : kind === 'inferred' ? 'text-warn' : 'text-ink-subtle';
  const dot =
    kind === 'confirmed'
      ? <span className="w-[15px] h-[15px] rounded-full grid place-items-center text-[10px] text-white bg-ok">✓</span>
      : <span className={`w-[15px] h-[15px] rounded-full grid place-items-center text-[10px] border border-dashed ${kind === 'inferred' ? 'border-warn text-warn' : 'border-ink-subtle text-ink-subtle'}`}>!</span>;
  const txt = label || (kind === 'confirmed' ? 'Confirmed' : kind === 'inferred' ? 'Inferred — not confirmed' : 'Unverified');
  return <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${tone}`}>{dot}{txt}</span>;
}

export function DataTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto border border-border rounded-[10px]">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-2.5 py-[9px] border-b border-border text-[11px] tracking-[0.04em] uppercase text-ink-subtle font-semibold">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} className="text-left px-2.5 py-[9px] border-b border-border last:border-b-0">{r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ApprovalPanel({ approval, sent, onApprove, onSend }) {
  const approved = !!approval;
  return (
    <div className={`mt-3.5 rounded-[10px] p-[13px] border ${approved ? 'border-ok bg-ok-weak' : 'border-warn bg-warn-weak'}`}>
      <div className={`flex items-center gap-2 font-bold text-[13px] ${approved ? 'text-ok' : 'text-warn'}`}>
        {approved ? '✓ Approved — ready to send' : '⚠ Awaiting your approval — not sent'}
      </div>
      {approved
        ? <p className="mt-2 text-[12.5px] font-mono">approvedBy: {approval.by} · at {approval.at}</p>
        : <p className="mt-2 text-[12.5px]">Every line is backed by verified evidence. Nothing goes out until you approve.</p>}
      <div className="flex gap-2.5 mt-[11px] flex-wrap">
        {!approved && <Button variant="primary" onClick={onApprove}>Approve</Button>}
        <Button variant="primary" onClick={onSend} disabled={!approved || sent}>{sent ? 'Sent (simulated)' : 'Send to customer'}</Button>
        <Button variant="ghost">Request changes</Button>
      </div>
    </div>
  );
}
