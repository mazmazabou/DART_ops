const ACTIVE_STATUSES = ['pending', 'approved', 'scheduled', 'driver_on_the_way', 'driver_arrived_grace'];
const TERMINAL_STATUSES = ['completed', 'no_show', 'denied', 'cancelled'];

export const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  scheduled: 'Scheduled',
  driver_on_the_way: 'On the Way',
  driver_arrived_grace: 'Grace Period',
  completed: 'Completed',
  no_show: 'No Show',
  denied: 'Denied',
  cancelled: 'Cancelled',
};

export function isActiveStatus(status) {
  return ACTIVE_STATUSES.includes(status);
}

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(status);
}

export function statusLabel(status) {
  return STATUS_LABELS[status] || (status || '').replace(/_/g, ' ').replace('driver ', '');
}
