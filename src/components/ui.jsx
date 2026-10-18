// Design-system primitives — dark, restrained, token-driven.
// Button, Field, Select, Card, StatusPill (badge), VerificationMarker, DataTable,
// ApprovalPanel, Dialog, Spinner, EmptyState.
// Depth = layered surfaces + hairline borders. No glows, no gradients.

const btnBase = 'inline-flex items-center justify-center gap-2 text-[13px] font-medium cursor-pointer rounded-[8px] px-3.5 py-2 border border-transparent transition-colors disabled:opacity-45 disabled:cursor-not-allowed';
const btnVariants = {
  primary: 'bg-brand text-on-brand hover:bg-brand-ink',
  secondary: 'bg-surface-2 text-ink border-border hover:bg-surface-3',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface-2 hover:text-ink',
  danger: 'bg-transparent text-danger border-border-strong hover:bg-danger-weak',
};
export function Button({ variant = 'secondary', className = '', ...props }) {
  return <button className={`${btnBase} ${btnVariants[variant]} ${className}`} {...props} />;
}

const fieldInput = 'font-[inherit] text-[14px] text-ink bg-surface rounded-[8px] px-3 py-2 w-full outline-none border placeholder:text-ink-subtle focus:border-brand';
export function Field({ label, hint, hintTone, missing, children, id }) {
  const hintColor = hintTone === 'warn' ? 'text-warn' : hintTone === 'danger' ? 'text-danger' : 'text-ink-subtle';
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      {label && <label htmlFor={id} className="text-[12.5px] font-medium text-ink-muted">{label}</label>}
      {children ?? <input id={id} className={`${fieldInput} ${missing ? 'border-warn bg-warn-weak' : 'border-border-strong'}`} />}
      {hint && <span className={`text-[11.5px] ${hintColor}`}>{hint}</span>}
    </div>
  );
}

export function Select({ id, value, onChange, children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select id={id} value={value} onChange={onChange}
        className={`${fieldInput} border-border-strong appearance-none pr-9 cursor-pointer`}>
        {children}
      </select>
      <svg viewBox="0 0 24 24" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-subtle" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
    </div>
  );
}

export function Card({ title, sub, right, className = '', children }) {
  return (
    <div className={`bg-surface-2 border border-border rounded-[12px] p-5 min-w-0 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-2.5 mb-3.5">
          <div>
            {title && <div className="font-semibold text-[15px] tracking-[-0.01em]">{title}</div>}
            {sub && <div className="text-[12px] text-ink-subtle mt-0.5">{sub}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

const pillTone = {
  neutral: 'text-ink-muted bg-surface-3 border-border',
  info: 'text-info bg-info-weak border-transparent',
  brand: 'text-brand bg-brand-weak border-transparent',
  warn: 'text-warn bg-warn-weak border-transparent',
  ok: 'text-ok bg-ok-weak border-transparent',
  danger: 'text-danger bg-danger-weak border-transparent',
};
const workflowTone = {
  NEW: 'neutral', NEEDS_INFO: 'warn', SOURCING: 'info', OFFER_DRAFT: 'neutral', AWAITING_APPROVAL: 'warn',
  SENT: 'info', ACCEPTED: 'ok', IN_PROGRESS: 'brand', COMPLETED: 'ok', COMMISSION_PENDING: 'warn',
  RECONCILED: 'ok', BLOCKED: 'danger', DECLINED: 'neutral',
};
export function StatusPill({ status, tone, children }) {
  const t = tone || workflowTone[status] || 'neutral';
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-[0.02em] px-2 py-[3px] rounded-[6px] border ${pillTone[t]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children || status}
    </span>
  );
}

export function VerificationMarker({ kind, label }) {
  const tone = kind === 'confirmed' ? 'text-ok' : kind === 'inferred' ? 'text-warn' : 'text-ink-subtle';
  const dot = kind === 'confirmed'
    ? <span className="w-[15px] h-[15px] rounded-full grid place-items-center text-[10px] text-[#042017] bg-ok">✓</span>
    : <span className={`w-[15px] h-[15px] rounded-full grid place-items-center text-[10px] border border-dashed ${kind === 'inferred' ? 'border-warn text-warn' : 'border-ink-subtle text-ink-subtle'}`}>!</span>;
  const txt = label || (kind === 'confirmed' ? 'Confirmed' : kind === 'inferred' ? 'Inferred — not confirmed' : 'Unverified');
  return <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${tone}`}>{dot}{txt}</span>;
}

export function DataTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto border border-border rounded-[10px]">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-3 py-2.5 border-b border-border text-[11px] tracking-[0.04em] uppercase text-ink-subtle font-semibold bg-surface">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-surface">
              {columns.map((c) => (
                <td key={c.key} className="text-left px-3 py-2.5 border-b border-border last:border-b-0">{r[c.key]}</td>
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
    <div className={`mt-3.5 rounded-[10px] p-[13px] border ${approved ? 'border-ok/40 bg-ok-weak' : 'border-warn/40 bg-warn-weak'}`}>
      <div className={`flex items-center gap-2 font-semibold text-[13px] ${approved ? 'text-ok' : 'text-warn'}`}>
        {approved ? '✓ Approved — ready to send' : '⚠ Awaiting your approval — not sent'}
      </div>
      {approved
        ? <p className="mt-2 text-[12.5px] font-mono text-ink-muted">approvedBy: {approval.by} · at {approval.at}</p>
        : <p className="mt-2 text-[12.5px] text-ink-muted">Every line is backed by verified evidence. Nothing goes out until you approve.</p>}
      <div className="flex gap-2.5 mt-[11px] flex-wrap">
        {!approved && <Button variant="primary" onClick={onApprove}>Approve</Button>}
        <Button variant="primary" onClick={onSend} disabled={!approved || sent}>{sent ? 'Sent (simulated)' : 'Send to customer'}</Button>
        <Button variant="ghost">Request changes</Button>
      </div>
    </div>
  );
}

export function Spinner({ className = 'w-[14px] h-[14px]' }) {
  return <span className={`spin inline-block ${className} border-2 border-border-strong border-t-brand rounded-full align-[-2px]`} aria-label="loading" />;
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="bg-surface-2 border border-border rounded-[12px] p-10 text-center">
      <div className="font-semibold text-[16px] tracking-[-0.01em]">{title}</div>
      {body && <p className="text-ink-muted text-[13.5px] mt-2 max-w-[48ch] mx-auto">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Dialog({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] grid place-items-center z-50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        className="bg-surface-2 border border-border rounded-[12px] shadow-[var(--shadow-lg)] max-w-[440px] w-full p-5">
        {title && <h3 className="font-semibold text-[16px] tracking-[-0.01em] m-0">{title}</h3>}
        {children && <div className="mt-2.5 text-[13.5px] text-ink-muted">{children}</div>}
        {footer && <div className="flex gap-2.5 mt-5 justify-end">{footer}</div>}
      </div>
    </div>
  );
}
