import React, { useEffect, useState, useCallback } from 'react';
import { Search, UserCheck, UserX, Filter, RefreshCw } from 'lucide-react';
import PageLayout from '../../components/common/PageLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { usersAPI } from '../../services/api';
import { User, UserRole } from '../../types';

const roleColors: Record<UserRole, string> = {
  student: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  educator: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  admin: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await usersAPI.getAllUsers();
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let result = users;
    if (search) {
      result = result.filter(
        (u) =>
          (u.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
          (u.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }
    setFiltered(result);
  }, [search, roleFilter, users]);

  const handleToggle = async (userId: string, current: boolean) => {
    if (toggling) return;
    setToggling(userId);
    try {
      await usersAPI.toggleUserStatus(userId, !current);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !current } : u))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(null);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen message="Loading users..." />;

  const counts = {
    student: users.filter((u) => u.role === 'student').length,
    educator: users.filter((u) => u.role === 'educator').length,
    admin: users.filter((u) => u.role === 'admin').length,
    inactive: users.filter((u) => !u.isActive).length,
  };

  return (
    <PageLayout
      title="User Management"
      subtitle={`${users.length} registered users · Manage roles, access, and account status`}
      actions={
        <button
          onClick={load}
          className="flex items-center gap-2 bg-slate-800 text-slate-400 hover:text-white text-sm px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      }
    >
      {/* Summary Pills */}
      <div className="flex gap-3 flex-wrap mb-6">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex gap-2 items-center">
            <span className="text-slate-500 text-xs capitalize">{k}</span>
            <span className="text-white text-sm font-bold">{v}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-500 shrink-0" />
          {(['all', 'student', 'educator', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                roleFilter === r
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Name', 'Email', 'Role', 'Institution', 'Joined', 'Last Active', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((user) => (
                <tr key={user._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(user.firstName || '?')[0]}{(user.lastName || '?')[0]}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.studentId && (
                          <p className="text-slate-600 text-xs">{user.studentId}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-sm">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-sm">{user.institution || '—'}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                      user.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-700 text-slate-500 border-slate-600'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggle(user._id, user.isActive)}
                      disabled={toggling === user._id}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        user.isActive
                          ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      } disabled:opacity-40`}
                    >
                      {user.isActive ? (
                        <><UserX size={13} /> Deactivate</>
                      ) : (
                        <><UserCheck size={13} /> Activate</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">No users match your search.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default UserManagement;
