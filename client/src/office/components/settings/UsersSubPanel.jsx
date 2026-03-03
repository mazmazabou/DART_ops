import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchAdminUsers, createAdminUser, deleteAdminUser, resetAdminUserPassword } from '../../../api';
import { useToast } from '../../../contexts/ToastContext';
import { useModal } from '../../../components/ui/Modal';
import UserDrawer from './UserDrawer';

export default function UsersSubPanel() {
  const { showToast } = useToast();
  const { showModal } = useModal();
  const [users, setUsers] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [drawerUserId, setDrawerUserId] = useState(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const filterTimer = useRef(null);

  const loadUsers = useCallback(async () => {
    try {
      const data = await fetchAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast(e.message, 'error');
    }
  }, [showToast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      result = result.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q) ||
        (u.member_id || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [users, filterText, roleFilter]);

  const handleFilterChange = (e) => {
    clearTimeout(filterTimer.current);
    const val = e.target.value;
    filterTimer.current = setTimeout(() => setFilterText(val), 300);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ok = await showModal({
      title: 'Delete Users',
      body: `Are you sure you want to delete ${selectedIds.size} user(s)? This cannot be undone.`,
      confirmLabel: 'Delete',
      confirmClass: 'ro-btn--danger',
    });
    if (!ok) return;
    let deleted = 0;
    for (const id of selectedIds) {
      try {
        await deleteAdminUser(id);
        deleted++;
      } catch (e) {
        showToast(`Failed to delete user: ${e.message}`, 'error');
      }
    }
    if (deleted > 0) {
      showToast(`Deleted ${deleted} user(s).`, 'success');
      setSelectedIds(new Set());
      loadUsers();
    }
  };

  const handleAddUser = async () => {
    const ok = await showModal({
      title: 'Create New User',
      body: `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div><label class="ro-label">Username</label><input class="ro-input" id="modal-new-username" placeholder="Username" /></div>
          <div><label class="ro-label">Full Name</label><input class="ro-input" id="modal-new-name" placeholder="Full name" /></div>
          <div><label class="ro-label">Email</label><input class="ro-input" id="modal-new-email" type="email" placeholder="Email" /></div>
          <div><label class="ro-label">Phone</label><input class="ro-input" id="modal-new-phone" placeholder="Phone (optional)" /></div>
          <div><label class="ro-label">Member ID</label><input class="ro-input" id="modal-new-memberid" placeholder="Member ID (optional)" /></div>
          <div><label class="ro-label">Role</label><select class="ro-input" id="modal-new-role"><option value="rider">Rider</option><option value="driver">Driver</option><option value="office">Office</option></select></div>
          <div><label class="ro-label">Password</label><input class="ro-input" id="modal-new-password" type="password" placeholder="Min 8 characters" /></div>
        </div>
      `,
      confirmLabel: 'Create User',
    });
    if (!ok) return;
    const username = document.getElementById('modal-new-username')?.value?.trim();
    const name = document.getElementById('modal-new-name')?.value?.trim();
    const email = document.getElementById('modal-new-email')?.value?.trim();
    const phone = document.getElementById('modal-new-phone')?.value?.trim();
    const memberId = document.getElementById('modal-new-memberid')?.value?.trim();
    const role = document.getElementById('modal-new-role')?.value;
    const password = document.getElementById('modal-new-password')?.value;
    if (!username || !name || !password) {
      showToast('Username, name, and password are required.', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    try {
      await createAdminUser({ username, name, email, phone, memberId, role, password });
      showToast('User created successfully.', 'success');
      loadUsers();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleResetPassword = async (userId, userName) => {
    const ok = await showModal({
      title: 'Reset Password',
      body: `<p>Reset password for <strong>${userName}</strong>?</p>
        <div style="margin-top:12px;">
          <label class="ro-label">New Password</label>
          <input class="ro-input" id="modal-reset-pw" type="password" placeholder="Min 8 characters" />
        </div>`,
      confirmLabel: 'Reset Password',
      confirmClass: 'ro-btn--danger',
    });
    if (!ok) return;
    const newPassword = document.getElementById('modal-reset-pw')?.value;
    if (!newPassword || newPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    try {
      await resetAdminUserPassword(userId, { newPassword });
      showToast('Password reset successfully.', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const ok = await showModal({
      title: 'Delete User',
      body: `Are you sure you want to delete <strong>${userName}</strong>? This cannot be undone.`,
      confirmLabel: 'Delete',
      confirmClass: 'ro-btn--danger',
    });
    if (!ok) return;
    try {
      await deleteAdminUser(userId);
      showToast('User deleted.', 'success');
      loadUsers();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Username', 'Role', 'Member ID', 'Phone'];
    const rows = filteredUsers.map(u => [u.name, u.email, u.username, u.role, u.member_id || '', u.phone || '']);
    const csv = [headers, ...rows].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'users.csv';
    a.click();
  };

  const roleBadgeClass = (role) => {
    if (role === 'office') return 'status-badge status-badge--approved';
    if (role === 'driver') return 'status-badge status-badge--scheduled';
    return 'status-badge status-badge--pending';
  };

  return (
    <>
      <div className="filter-bar">
        <input
          type="text"
          id="admin-user-filter"
          className="ro-input"
          placeholder="Search by name, email, phone, member ID, or role..."
          style={{ maxWidth: '400px' }}
          onChange={handleFilterChange}
        />
      </div>
      <div className="ro-section">
        <div className="text-sm text-muted mb-16">
          Manage riders, drivers, and office accounts. You cannot delete your own office account.
        </div>
        <div className="ro-table-wrap">
          <table className="ro-table" id="admin-users-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }}>
                  <input
                    type="checkbox"
                    id="users-select-all"
                    checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Member ID</th>
                <th>Phone</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => setDrawerUserId(u.id)}>
                  <td onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleSelect(u.id)} />
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email || '\u2014'}</td>
                  <td className="text-muted">{u.username}</td>
                  <td><span className={roleBadgeClass(u.role)}>{u.role}</span></td>
                  <td className="text-muted">{u.member_id || '\u2014'}</td>
                  <td className="text-muted">{u.phone || '\u2014'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ position: 'relative' }}>
                      <KebabMenu
                        onResetPassword={() => handleResetPassword(u.id, u.name)}
                        onDelete={() => handleDeleteUser(u.id, u.name)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={8} className="text-center text-muted" style={{ padding: '24px' }}>No users found.</td></tr>
              )}
            </tbody>
          </table>
          <div className="table-toolbar">
            <span className="table-toolbar__count" id="admin-user-filter-count">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </span>
            <button
              className="ro-btn ro-btn--danger ro-btn--sm"
              id="users-delete-selected-btn"
              style={{ display: selectedIds.size > 0 ? '' : 'none' }}
              onClick={handleBulkDelete}
            >
              <i className="ti ti-trash"></i> Delete Selected (<span id="users-selected-count">{selectedIds.size}</span>)
            </button>
            <div className="table-toolbar__actions">
              <div style={{ position: 'relative' }}>
                <button
                  className="table-toolbar__btn"
                  id="admin-role-filter-btn"
                  title="Filter by role"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                >
                  <i className="ti ti-filter"></i>
                </button>
                {showRoleDropdown && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '120px',
                  }}>
                    {['all', 'office', 'driver', 'rider'].map(r => (
                      <button key={r} style={{
                        display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
                        border: 'none', background: roleFilter === r ? 'var(--color-primary-subtle)' : 'transparent',
                        cursor: 'pointer', fontSize: '13px',
                      }} onClick={() => { setRoleFilter(r); setShowRoleDropdown(false); }}>
                        {r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="table-toolbar__btn" id="admin-export-csv-btn" title="Export CSV" onClick={exportCSV}>
                <i className="ti ti-download"></i>
              </button>
              <button className="table-toolbar__btn table-toolbar__btn--add" id="admin-add-user-btn" title="Add user" onClick={handleAddUser}>
                <i className="ti ti-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <UserDrawer
        userId={drawerUserId}
        onClose={() => { setDrawerUserId(null); loadUsers(); }}
        onResetPassword={handleResetPassword}
        onDeleteUser={handleDeleteUser}
      />
    </>
  );
}

function KebabMenu({ onResetPassword, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="kebab-btn" onClick={() => setOpen(!open)}>
        <i className="ti ti-dots-vertical"></i>
      </button>
      {open && (
        <div className="kebab-menu" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 10 }}>
          <button className="kebab-item" onClick={() => { setOpen(false); onResetPassword(); }}>
            <i className="ti ti-key"></i> Reset Password
          </button>
          <button className="kebab-item" style={{ color: 'var(--status-denied)' }} onClick={() => { setOpen(false); onDelete(); }}>
            <i className="ti ti-trash"></i> Delete
          </button>
        </div>
      )}
    </>
  );
}
