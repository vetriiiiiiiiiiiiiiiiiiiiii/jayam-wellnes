import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { adminApi, formatDateTime } from '../../lib/adminApi';
import { useAuth } from '../../lib/auth';
import { useNotice } from './adminBits';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [notice, notify] = useNotice();

  const load = useCallback(() => {
    adminApi.users().then((result) => (result.ok ? setUsers(result.data) : setError(result.message)));
  }, []);
  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users || []).filter((user) => !q || [user.fullname, user.email].some((field) => field?.toLowerCase().includes(q)));
  }, [users, query]);

  const changeRole = async (user, role) => {
    if (role === 'admin' && !window.confirm(`Give ${user.email} full admin access to the store?`)) return;
    const result = await adminApi.updateRole(user.id, role);
    if (!result.ok) return notify(result.message, 'error');
    notify('Role updated');
    load();
  };

  const remove = async (user) => {
    if (!window.confirm(`Delete the account for ${user.email}? Their past orders are kept.`)) return;
    const result = await adminApi.deleteUser(user.id);
    if (!result.ok) return notify(result.message, 'error');
    notify('Account deleted');
    load();
  };

  if (error) return <p className="ad-error">{error}</p>;

  return (
    <div className="ad-page">
      {notice}
      <div className="ad-head">
        <div>
          <h1>Users</h1>
          <p className="ad-muted">Customer accounts and the team. Admins can open this dashboard.</p>
        </div>
      </div>

      <div className="ad-toolbar">
        <span className="ad-muted">{users ? `${users.length} accounts` : ''}</span>
        <label className="ad-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Name or email" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search users" />
        </label>
      </div>

      <section className="ad-card ad-card--flush">
        {!users ? (
          <p className="ad-muted ad-pad">Loading users…</p>
        ) : (
          <table className="ad-table">
            <thead><tr><th>Name</th><th>Signs in with</th><th className="ad-num">Orders</th><th>Joined</th><th>Role</th><th /></tr></thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td><b>{user.fullname || '—'}</b><small>{user.email}</small></td>
                  <td>{user.signIn}</td>
                  <td className="ad-num">{user.orderCount}</td>
                  <td>{formatDateTime(user.createdAt)}</td>
                  <td>
                    <select value={user.role} onChange={(event) => changeRole(user, event.target.value)} disabled={user.id === me?.id} aria-label={`Role for ${user.email}`}>
                      <option value="user">Customer</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="ad-num">
                    {user.id !== me?.id && (
                      <button type="button" className="ad-icon-btn ad-icon-btn--danger" onClick={() => remove(user)} aria-label={`Delete ${user.email}`}><Trash2 size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
