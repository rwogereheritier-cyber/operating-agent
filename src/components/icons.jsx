// Minimal inline icon set for the sidebar nav (stroke = currentColor).
const paths = {
  dashboard: 'M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 14h7v7H3z',
  requests: 'M4 5h16v11H7l-3 3z',
  suppliers: 'M12 3l9 4-9 4-9-4zM3 7v10l9 4 9-4V7',
  offers: 'M6 3h9l3 3v15H6zM14 3v4h4',
  followups: 'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  audit: 'M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  components: 'M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5',
};
export function Icon({ name, className = 'w-[18px] h-[18px]' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={paths[name] || ''} />
    </svg>
  );
}
