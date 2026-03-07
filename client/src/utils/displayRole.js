/**
 * Maps internal role values to user-facing display labels.
 * The database role 'office' displays as 'Admin' in the UI.
 */
export function displayRole(role) {
  switch (role) {
    case 'office': return 'Admin';
    case 'driver': return 'Driver';
    case 'rider': return 'Rider';
    default: return role || '';
  }
}
