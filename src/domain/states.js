// Deal state machine. The ONLY legal path a request can walk.
// Transitions live in code so no LLM output and no crafted message can jump a stage.

export const STATES = Object.freeze({
  NEW: 'NEW',
  NEEDS_INFO: 'NEEDS_INFO',
  SOURCING: 'SOURCING',
  OFFER_DRAFT: 'OFFER_DRAFT',
  AWAITING_APPROVAL: 'AWAITING_APPROVAL',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  COMMISSION_PENDING: 'COMMISSION_PENDING',
  RECONCILED: 'RECONCILED',
  // branches
  DECLINED: 'DECLINED',
  BLOCKED: 'BLOCKED',
  CLOSED: 'CLOSED',
  SPLIT: 'SPLIT',
});

const TRANSITIONS = {
  NEW: ['NEEDS_INFO', 'SOURCING', 'SPLIT', 'BLOCKED', 'CLOSED'],
  NEEDS_INFO: ['SOURCING', 'BLOCKED', 'CLOSED'],
  SOURCING: ['OFFER_DRAFT', 'BLOCKED', 'CLOSED'],
  OFFER_DRAFT: ['AWAITING_APPROVAL', 'BLOCKED', 'CLOSED'],
  AWAITING_APPROVAL: ['SENT', 'OFFER_DRAFT', 'DECLINED', 'CLOSED'],
  SENT: ['ACCEPTED', 'DECLINED', 'CLOSED'],
  ACCEPTED: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['COMPLETED', 'BLOCKED', 'CLOSED'],
  COMPLETED: ['COMMISSION_PENDING', 'CLOSED'],
  COMMISSION_PENDING: ['RECONCILED', 'CLOSED'],
  RECONCILED: [],
  DECLINED: [],
  BLOCKED: ['SOURCING', 'NEEDS_INFO', 'CLOSED'],
  CLOSED: [],
  SPLIT: [],
};

export function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal state transition: ${from} -> ${to}`);
  }
  return true;
}
