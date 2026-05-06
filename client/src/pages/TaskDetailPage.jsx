import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI, projectsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Calendar, Clock, Send, Edit3, MessageSquare,
  AlertTriangle, Activity, User, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const TaskDetailPage = () => {
  const { projectId, taskId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksAPI.getOne(projectId, taskId).then(r => r.data.data.task),
  });

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.getOne(projectId).then(r => r.data.data.project),
  });

  const isAdmin = project?.members?.find(m => m.userId === user?.id)?.role === 'ADMIN';
  const isAssignee = task?.assignees?.some(a => a.id === user?.id);

  const updateMutation = useMutation({
    mutationFn: (data) => tasksAPI.update(projectId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setEditing(false);
      toast.success('Task updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const commentMutation = useMutation({
    mutationFn: (data) => tasksAPI.addComment(projectId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setComment('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksAPI.remove(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Task deleted');
      navigate(`/projects/${projectId}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete task'),
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate();
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate({ content: comment.trim() });
  };

  const handleSaveEdit = () => {
    const data = { ...editForm };
    if (data.dueDate) data.dueDate = new Date(data.dueDate).toISOString();
    else data.dueDate = null;
    updateMutation.mutate(data);
  };

  const startEdit = () => {
    setEditForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assigneeIds: task.assignees?.map(a => a.id) || [],
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setEditing(true);
  };

  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task?.status !== 'DONE';

  const getActionLabel = (action) => {
    const labels = { CREATED: 'created this task', STATUS_CHANGED: 'changed status', ASSIGNED: 'reassigned this task', COMMENTED: 'commented', DELETED: 'deleted this task', UPDATED: 'updated this task' };
    return labels[action] || action;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) return <div className="text-center py-20 text-surface-400">Task not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Back link */}
      <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-surface-400 hover:text-white transition-colors text-sm no-underline">
        <ArrowLeft size={16} /> Back to board
      </Link>

      {/* Task header */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {editing ? (
              <input type="text" className="input-field text-lg font-semibold mb-2" value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            ) : (
              <h1 className="text-xl font-bold text-white">{task.title}</h1>
            )}
          </div>
          {!editing && isAdmin && (
            <div className="flex gap-2">
              <button onClick={startEdit} className="btn-secondary text-sm">
                <Edit3 size={14} /> Edit
              </button>
              <button onClick={handleDelete} className="btn-secondary text-sm text-danger border-danger/30 hover:bg-danger/10">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <textarea className="input-field" rows={4} value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description..." style={{ resize: 'vertical' }} />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-surface-400 mb-1">Status</label>
                <select className="input-field" value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-surface-400 mb-1">Priority</label>
                <select className="input-field" value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-surface-400 mb-1">Due Date</label>
                <input type="date" className="input-field" value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-surface-400 mb-1">Assignees</label>
              <div className="space-y-2 max-h-40 overflow-y-auto bg-surface-900 p-3 rounded-lg border border-surface-700">
                {project?.members?.map(m => (
                  <label key={m.userId} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-surface-800 rounded">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={editForm.assigneeIds?.includes(m.userId) || false}
                      onChange={(e) => {
                        const currentIds = editForm.assigneeIds || [];
                        if (e.target.checked) {
                          setEditForm({ ...editForm, assigneeIds: [...currentIds, m.userId] });
                        } else {
                          setEditForm({ ...editForm, assigneeIds: currentIds.filter(id => id !== m.userId) });
                        }
                      }}
                    />
                    <span className="text-sm text-surface-200">{m.user?.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="btn-primary">
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {task.description && <p className="text-surface-300 text-sm mb-4 whitespace-pre-wrap">{task.description}</p>}
            <div className="flex flex-wrap gap-3 items-center">
              {(!isAdmin && isAssignee) ? (
                <select 
                  className="input-field py-1 px-2 text-sm w-auto" 
                  value={task.status}
                  onChange={(e) => updateMutation.mutate({ status: e.target.value })}
                  disabled={updateMutation.isPending}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  {isAdmin && <option value="DONE">Done</option>}
                </select>
              ) : (
                <span className={`badge badge-${task.status === 'IN_PROGRESS' ? 'in-progress' : task.status.toLowerCase()}`}>
                  {task.status.replace('_', ' ')}
                </span>
              )}
              <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
              {task.dueDate && (
                <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-danger' : 'text-surface-400'}`}>
                  {isOverdue && <AlertTriangle size={12} />}
                  <Calendar size={12} />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-surface-700/30 text-sm">
              {task.assignees && task.assignees.length > 0 && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-surface-500" />
                  <span className="text-surface-400">Assigned to</span>
                  <div className="flex flex-wrap gap-1">
                    {task.assignees.map(a => (
                      <span key={a.id} className="text-white font-medium bg-surface-700/50 px-2 py-0.5 rounded-full text-xs">
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {task.createdBy && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-surface-500" />
                  <span className="text-surface-400">Created by</span>
                  <span className="text-white font-medium">{task.createdBy.name}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Comments & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Comments */}
        <div className="lg:col-span-3 glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare size={16} /> Comments ({task.comments?.length || 0})
          </h3>

          <form onSubmit={handleComment} className="flex gap-2 mb-5">
            <input type="text" className="input-field flex-1" placeholder="Add a comment..."
              value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit" disabled={commentMutation.isPending || !comment.trim()} className="btn-primary px-4">
              <Send size={16} />
            </button>
          </form>

          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {(!task.comments || task.comments.length === 0) ? (
              <p className="text-surface-500 text-sm text-center py-6">No comments yet</p>
            ) : (
              task.comments.map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-surface-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-primary-500/20 text-primary-400 text-[10px] font-bold flex items-center justify-center">
                      {c.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white">{c.user?.name}</span>
                    <span className="text-xs text-surface-500 ml-auto">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-surface-300 pl-8">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} /> Activity
          </h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {(!task.activityLogs || task.activityLogs.length === 0) ? (
              <p className="text-surface-500 text-sm text-center py-6">No activity</p>
            ) : (
              task.activityLogs.map(log => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary-500/50 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-surface-300">
                      <span className="text-white font-medium">{log.user?.name}</span>{' '}
                      {getActionLabel(log.action)}
                      {log.oldValue && log.newValue && (
                        <span className="text-surface-500"> — {log.oldValue} → {log.newValue}</span>
                      )}
                    </p>
                    <span className="text-xs text-surface-500">
                      {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
