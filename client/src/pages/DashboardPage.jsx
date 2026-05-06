import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, Clock, AlertTriangle, ListTodo, FolderKanban, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#60a5fa',
  DONE: '#34d399',
};

const DashboardPage = () => {
  const { user } = useAuth();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats().then(r => r.data.data.stats),
  });

  const { data: myTasks } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => dashboardAPI.getMyTasks().then(r => r.data.data.tasks),
  });

  const { data: overdueTasks } = useQuery({
    queryKey: ['overdue-tasks'],
    queryFn: () => dashboardAPI.getOverdue().then(r => r.data.data.tasks),
  });

  const stats = statsData || { 
    totalTasks: 0, 
    byStatus: { TODO: 0, IN_PROGRESS: 0, DONE: 0 }, 
    byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    byUser: [], 
    overdueCount: 0, 
    totalProjects: 0,
    projectStatus: { ACTIVE: 0, COMPLETED: 0, ARCHIVED: 0 }
  };

  const pieData = [
    { name: 'To Do', value: stats.byStatus.TODO, color: COLORS.TODO },
    { name: 'In Progress', value: stats.byStatus.IN_PROGRESS, color: COLORS.IN_PROGRESS },
    { name: 'Done', value: stats.byStatus.DONE, color: COLORS.DONE },
  ].filter(d => d.value > 0);

  const priorityPieData = [
    { name: 'Low', value: stats.byPriority.LOW || 0, color: '#94a3b8' },
    { name: 'Medium', value: stats.byPriority.MEDIUM || 0, color: '#facc15' },
    { name: 'High', value: stats.byPriority.HIGH || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const projectPieData = [
    { name: 'Active', value: stats.projectStatus?.ACTIVE || 0, color: '#818cf8' },
    { name: 'Completed', value: stats.projectStatus?.COMPLETED || 0, color: '#34d399' },
  ].filter(d => d.value > 0);

  const barData = (stats.byUser || []).map(item => ({
    name: item.user?.name?.split(' ')[0] || 'Unknown',
    TODO: item.TODO || 0,
    IN_PROGRESS: item.IN_PROGRESS || 0,
    DONE: item.DONE || 0,
    total: item.taskCount || 0,
  }));

  const maxTasks = Math.max(...barData.map(item => item.total), 1);

  const getDaysOverdue = (dueDate) => {
    const diff = Math.floor((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-surface-400 text-sm mt-1">
            Welcome back, {user?.name?.split(' ')[0]}! Here's your overview.
          </p>
        </div>
        <Link to="/projects" className="btn-primary no-underline">
          <FolderKanban size={16} /> View Projects
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
              <ListTodo size={16} className="text-primary-400" />
            </div>
            <span className="text-xs text-surface-400">Total Tasks</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-info/15 flex items-center justify-center">
              <Clock size={16} className="text-info" />
            </div>
            <span className="text-xs text-surface-400">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.byStatus.IN_PROGRESS}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
              <CheckCircle size={16} className="text-success" />
            </div>
            <span className="text-xs text-surface-400">Done Tasks</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.byStatus.DONE}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center">
              <AlertTriangle size={16} className="text-danger" />
            </div>
            <span className="text-xs text-surface-400">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-danger">{stats.overdueCount}</p>
        </div>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Tasks by Status</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 w-1/2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-surface-300 truncate">{d.name}</span>
                    <span className="text-xs font-semibold text-white ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-surface-500 text-sm text-center py-10">No tasks yet</p>
          )}
        </div>

        {/* Priority Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Tasks by Priority</h3>
          {priorityPieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={priorityPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                    {priorityPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 w-1/2">
                {priorityPieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-surface-300 truncate">{d.name}</span>
                    <span className="text-xs font-semibold text-white ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-surface-500 text-sm text-center py-10">No tasks yet</p>
          )}
        </div>

        {/* Project Status Doughnut Chart */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Project Status</h3>
          {projectPieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={projectPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                    {projectPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 w-1/2">
                {projectPieData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-surface-300 truncate">{d.name}</span>
                    <span className="text-xs font-semibold text-white ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-surface-500 text-sm text-center py-10">No projects yet</p>
          )}
        </div>
      </div>

      {/* Tasks per User Bar Chart */}
      <div className="glass-card p-6">
        <h3 className="text-base font-semibold text-white mb-4">Tasks per Member</h3>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" domain={[0, maxTasks]} tickCount={maxTasks + 1} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#e2e8f0', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0]?.payload;
                  return (
                    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0' }}>
                      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
                      <p style={{ color: '#4ade80', fontSize: 12 }}>Done : {data?.DONE}</p>
                      <p style={{ color: '#38bdf8', fontSize: 12 }}>In Progress : {data?.IN_PROGRESS}</p>
                      <p style={{ color: '#cbd5e1', fontSize: 12 }}>To Do : {data?.TODO}</p>
                      <p style={{ fontWeight: 600, fontSize: 12, marginTop: 4, borderTop: '1px solid #475569', paddingTop: 4 }}>Total : {data?.total}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="TODO" name="To Do" stackId="a" fill="#cbd5e1">
                {barData.map((entry, index) => (
                  <Cell key={`todo-${index}`} fill="#cbd5e1" radius={(entry.IN_PROGRESS === 0 && entry.DONE === 0) ? [0, 8, 8, 0] : [0, 0, 0, 0]} />
                ))}
              </Bar>
              <Bar dataKey="IN_PROGRESS" name="In Progress" stackId="a" fill="#38bdf8">
                {barData.map((entry, index) => (
                  <Cell key={`inprog-${index}`} fill="#38bdf8" radius={entry.DONE === 0 ? [0, 8, 8, 0] : [0, 0, 0, 0]} />
                ))}
              </Bar>
              <Bar dataKey="DONE" name="Done" stackId="a" fill="#4ade80">
                {barData.map((entry, index) => (
                  <Cell key={`done-${index}`} fill="#4ade80" radius={[0, 8, 8, 0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-surface-500 text-sm text-center py-10">No assigned tasks yet</p>
        )}
      </div>

      {/* Bottom Row — My Tasks & Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">My Tasks</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {(!myTasks || myTasks.length === 0) ? (
              <p className="text-surface-500 text-sm text-center py-6">No tasks assigned to you</p>
            ) : (
              myTasks.slice(0, 8).map(task => (
                <Link
                  key={task.id}
                  to={`/projects/${task.projectId}/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-800/50 transition-all no-underline group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate group-hover:text-primary-400 transition-colors">{task.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{task.project?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                    <span className={`badge badge-${task.status === 'IN_PROGRESS' ? 'in-progress' : task.status.toLowerCase()}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-danger" /> Overdue Tasks
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {(!overdueTasks || overdueTasks.length === 0) ? (
              <p className="text-success text-sm text-center py-6">🎉 No overdue tasks!</p>
            ) : (
              overdueTasks.slice(0, 8).map(task => (
                <Link
                  key={task.id}
                  to={`/projects/${task.projectId}/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-danger/5 border border-danger/10 hover:border-danger/30 transition-all no-underline"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{task.project?.name}</p>
                  </div>
                  <span className="text-xs font-medium text-danger ml-3 whitespace-nowrap">
                    {getDaysOverdue(task.dueDate)}d overdue
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
