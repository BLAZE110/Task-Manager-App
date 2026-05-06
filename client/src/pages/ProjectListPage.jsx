import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI } from '../api';
import Modal from '../components/UI/Modal';
import { Plus, FolderKanban, Users, ListTodo, Calendar, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectListPage = () => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', deadline: '' });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll().then(r => r.data.data.projects),
  });

  const createMutation = useMutation({
    mutationFn: (data) => projectsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreate(false);
      setForm({ name: '', description: '', deadline: '' });
      toast.success('Project created!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create project'),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-surface-400 text-sm mt-1">{projects?.length || 0} projects</p>
        </div>
        <button id="create-project-btn" onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> New Project
        </button>
      </div>

      {(!projects || projects.length === 0) ? (
        <div className="glass-card p-12 text-center">
          <FolderKanban size={48} className="text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-surface-400 text-sm mb-6">Create your first project to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="glass-card-hover p-6 no-underline group block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-700/20 flex items-center justify-center">
                  <FolderKanban size={18} className="text-primary-400" />
                </div>
                <span className={`badge ${project.status === 'ACTIVE' ? 'badge-done' : 'badge-todo'}`}>
                  {project.status}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-surface-400 mb-4 line-clamp-2">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-surface-500 mt-auto pt-4 border-t border-surface-700/30">
                <span className="flex items-center gap-1"><Users size={13} /> {project._count?.members || 0}</span>
                <span className="flex items-center gap-1"><ListTodo size={13} /> {project._count?.tasks || 0} tasks</span>
                <ArrowRight size={14} className="ml-auto text-surface-600 group-hover:text-primary-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Project Name</label>
            <input
              id="project-name-input"
              type="text"
              className="input-field"
              placeholder="e.g. Marketing Website Redesign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Description (optional)</label>
            <textarea
              id="project-desc-input"
              className="input-field"
              rows={3}
              placeholder="Brief description of the project..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">Deadline (optional)</label>
            <input
              type="date"
              className="input-field"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button id="project-submit-btn" type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 justify-center">
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectListPage;
