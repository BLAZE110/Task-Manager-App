import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI, tasksAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/UI/Modal';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Users, Settings, Calendar, MessageSquare, AlertTriangle,
  GripVertical, UserPlus, Trash2, ArrowLeft, Clock, History
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', color: '#94a3b8' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#60a5fa' },
  { id: 'DONE', label: 'Done', color: '#34d399' },
];

/* ─── Sortable Task Card ───────────────────────── */
const TaskCard = ({ task, projectId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Link
        to={`/projects/${projectId}/tasks/${task.id}`}
        className="kanban-card mb-3 block no-underline group"
      >
        <div className="flex items-start gap-2">
          <div {...listeners} className="mt-0.5 cursor-grab text-surface-600 hover:text-surface-400">
            <GripVertical size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors truncate">
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-surface-500 mt-1 line-clamp-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
              {task.dueDate && (
                <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-danger' : 'text-surface-500'}`}>
                  {isOverdue && <AlertTriangle size={11} />}
                  <Calendar size={11} />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {task._count?.comments > 0 && (
                <span className="flex items-center gap-1 text-xs text-surface-500">
                  <MessageSquare size={11} /> {task._count.comments}
                </span>
              )}
            </div>
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.assignees.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-1 bg-surface-800 px-1.5 py-0.5 rounded-full" style={{ zIndex: 10 - i }}>
                    <div className="w-4 h-4 rounded-full bg-primary-500/20 text-primary-400 text-[9px] font-bold flex items-center justify-center">
                      {a.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] text-surface-400">{a.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

/* ─── Main Page ────────────────────────────────── */
const ProjectDetailPage = () => {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeIds: [] });
  const [memberEmail, setMemberEmail] = useState('');
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.getOne(projectId).then(r => r.data.data.project),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasksAPI.getAll(projectId, { limit: 100 }).then(r => r.data.data),
  });

  const { data: activityLogs } = useQuery({
    queryKey: ['projectActivity', projectId],
    queryFn: () => projectsAPI.getActivity(projectId).then(r => r.data.data.logs),
  });

  const tasks = tasksData?.tasks || [];
  const membership = project?.members?.find(m => m.userId === user?.id);
  const isAdmin = membership?.role === 'ADMIN';

  const tasksByStatus = useMemo(() => {
    const grouped = { TODO: [], IN_PROGRESS: [], DONE: [] };
    tasks.forEach(t => { if (grouped[t.status]) grouped[t.status].push(t); });
    return grouped;
  }, [tasks]);

  const createTaskMutation = useMutation({
    mutationFn: (data) => tasksAPI.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectActivity', projectId] });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeIds: [] });
      toast.success('Task created!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => tasksAPI.update(projectId, taskId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data) => projectsAPI.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectActivity', projectId] });
      toast.success('Project status updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const addMemberMutation = useMutation({
    mutationFn: (data) => projectsAPI.addMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectActivity', projectId] });
      setMemberEmail('');
      toast.success('Member added!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => projectsAPI.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectActivity', projectId] });
      toast.success('Member removed');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Determine target column
    let targetStatus = null;
    COLUMNS.forEach(col => {
      if (col.id === over.id || tasksByStatus[col.id]?.some(t => t.id === over.id)) {
        targetStatus = col.id;
      }
    });

    if (targetStatus && targetStatus !== task.status) {
      if (!isAdmin && targetStatus === 'DONE') {
        toast.error('Only admins can mark tasks as DONE');
        return;
      }

      updateTaskMutation.mutate({ taskId, data: { status: targetStatus } });
      // Optimistic update
      queryClient.setQueryData(['tasks', projectId], (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map(t => t.id === taskId ? { ...t, status: targetStatus } : t),
        };
      });
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    const data = { ...taskForm };
    if (!data.dueDate) delete data.dueDate;
    else data.dueDate = new Date(data.dueDate).toISOString();
    if (!data.assigneeIds || data.assigneeIds.length === 0) delete data.assigneeIds;
    createTaskMutation.mutate(data);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/projects" className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-all no-underline">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{project?.name || 'Loading...'}</h1>
              {project?.status === 'COMPLETED' && (
                <span className="badge badge-done text-xs ml-2">COMPLETED</span>
              )}
            </div>
            {project?.description && <p className="text-sm text-surface-400 mt-0.5">{project.description}</p>}
            <div className="mt-2 flex items-center gap-2 text-sm text-surface-400">
              <Clock size={14} /> Deadline: 
              {isAdmin ? (
                <input 
                  type="date" 
                  className="bg-surface-800 border border-surface-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary-500" 
                  value={project?.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''} 
                  onChange={(e) => updateProjectMutation.mutate({ deadline: e.target.value || null })} 
                />
              ) : (
                <span>{project?.deadline ? new Date(project.deadline).toLocaleDateString() : 'None'}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button onClick={() => setShowMemberModal(true)} className="btn-secondary">
              <Users size={16} /> Members ({project?.members?.length || 0})
            </button>
          )}
          {isAdmin && (
            <>
              {project?.status === 'ACTIVE' ? (
                <button onClick={() => {
                  if (window.confirm('Mark project as COMPLETED?')) {
                    updateProjectMutation.mutate({ status: 'COMPLETED' });
                  }
                }} className="btn-secondary border-primary-500/30 text-primary-400 hover:bg-primary-500/10">
                  Complete Project
                </button>
              ) : (
                <button onClick={() => updateProjectMutation.mutate({ status: 'ACTIVE' })} className="btn-secondary">
                  Reopen Project
                </button>
              )}
            </>
          )}
          {isAdmin && project?.status === 'ACTIVE' && (
            <button id="create-task-btn" onClick={() => setShowTaskModal(true)} className="btn-primary">
              <Plus size={16} /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => (
            <div key={col.id} className="kanban-column">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-700/30">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                <h3 className="text-sm font-semibold text-white">{col.label}</h3>
                <span className="ml-auto text-xs text-surface-500 bg-surface-800/50 px-2 py-0.5 rounded-full">
                  {tasksByStatus[col.id]?.length || 0}
                </span>
              </div>
              <SortableContext items={tasksByStatus[col.id]?.map(t => t.id) || []} strategy={verticalListSortingStrategy} id={col.id}>
                <div className="min-h-[200px]" data-column={col.id}>
                  {tasksByStatus[col.id]?.map(task => (
                    <TaskCard key={task.id} task={task} projectId={projectId} />
                  ))}
                  {tasksByStatus[col.id]?.length === 0 && (
                    <div className="text-center py-8 text-surface-600 text-sm">
                      No tasks
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Project Activity Log */}
      <div className="glass-card p-6 mt-8">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <History size={18} className="text-primary-400" /> Project Activity Log
        </h3>
        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
          {activityLogs && activityLogs.length > 0 ? (
            activityLogs.map((log) => (
              <div key={log.id} className="flex gap-4 p-3 rounded-lg bg-surface-800/50 border border-surface-700/50">
                <img
                  src={log.user.avatarUrl || `https://ui-avatars.com/api/?name=${log.user.name}&background=1e293b&color=fff`}
                  alt={log.user.name}
                  className="w-8 h-8 rounded-full bg-surface-700 flex-shrink-0"
                />
                <div>
                  <p className="text-sm text-surface-200">
                    <span className="font-medium text-white">{log.user.name}</span>{' '}
                    {log.action === 'CREATED' && 'created the project'}
                    {log.action === 'PROJECT_STATUS_CHANGED' && (
                      <>changed status from <span className="font-medium text-white">{log.oldValue}</span> to <span className="font-medium text-white">{log.newValue}</span></>
                    )}
                    {log.action === 'PROJECT_DEADLINE_CHANGED' && (
                      <>changed deadline from <span className="font-medium text-white">{log.oldValue}</span> to <span className="font-medium text-white">{log.newValue}</span></>
                    )}
                    {log.action === 'PROJECT_MEMBER_ADDED' && (
                      <>added member <span className="font-medium text-white">{log.newValue}</span></>
                    )}
                    {log.action === 'PROJECT_MEMBER_REMOVED' && (
                      <>removed member <span className="font-medium text-white">{log.oldValue}</span></>
                    )}
                    {log.action === 'TASK_ADDED' && (
                      <>added task <span className="font-medium text-white">{log.newValue}</span></>
                    )}
                  </p>
                  <p className="text-xs text-surface-500 mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-surface-500 text-center py-4">No activity recorded yet.</p>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task" maxWidth="550px">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Title</label>
            <input id="task-title-input" type="text" className="input-field" placeholder="Task title..."
              value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Description</label>
            <textarea className="input-field" rows={3} placeholder="Describe the task..."
              value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Priority</label>
              <select className="input-field" value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Due Date</label>
              <input type="date" className="input-field" value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Assign To</label>
            <div className="space-y-2 max-h-40 overflow-y-auto bg-surface-900 p-3 rounded-lg border border-surface-700">
              {project?.members?.map(m => (
                <label key={m.user.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-surface-800 rounded">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-sm"
                    checked={taskForm.assigneeIds.includes(m.user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTaskForm({ ...taskForm, assigneeIds: [...taskForm.assigneeIds, m.user.id] });
                      } else {
                        setTaskForm({ ...taskForm, assigneeIds: taskForm.assigneeIds.filter(id => id !== m.user.id) });
                      }
                    }}
                  />
                  <span className="text-sm text-surface-200">{m.user.name} ({m.user.email})</span>
                </label>
              ))}
              {project?.members?.length === 0 && (
                <span className="text-sm text-surface-500">No members available</span>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button id="task-submit-btn" type="submit" disabled={createTaskMutation.isPending} className="btn-primary flex-1 justify-center">
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Member Management Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Manage Members" maxWidth="500px">
        {isAdmin && (
          <div className="flex gap-2 mb-5">
            <input type="email" className="input-field flex-1" placeholder="Add member by email..."
              value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
            <button
              onClick={() => { if (memberEmail.trim()) addMemberMutation.mutate({ email: memberEmail.trim() }); }}
              disabled={addMemberMutation.isPending}
              className="btn-primary"
            >
              <UserPlus size={16} />
            </button>
          </div>
        )}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {project?.members?.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {m.user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{m.user.name}</p>
                  <p className="text-xs text-surface-500">{m.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${m.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>{m.role}</span>
                {isAdmin && m.userId !== user?.id && (
                  <button
                    onClick={() => removeMemberMutation.mutate(m.userId)}
                    className="p-1.5 rounded-lg text-surface-500 hover:text-danger hover:bg-danger/10 transition-all bg-transparent border-none cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
