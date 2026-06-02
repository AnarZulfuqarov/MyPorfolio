import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Briefcase, 
  Layers, 
  Mail, 
  LogOut, 
  Home, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Upload, 
  ArrowLeft,
  Calendar,
  Globe,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableRow({ proj, handleOpenEditProject, handleProjectDelete, t }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: proj.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: isDragging ? 'rgba(99, 102, 241, 0.05)' : undefined,
    border: isDragging ? '1px dashed var(--primary)' : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td>
        <div
          {...attributes}
          {...listeners}
          style={{ 
            cursor: 'grab', 
            padding: '8px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            userSelect: 'none'
          }}
          title="Sıralamaq üçün sürüşdürün"
        >
          <span style={{ fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 'bold' }}>≡</span>
        </div>
      </td>
      <td>
        <img src={proj.imageUrl} alt="" className="thumbnail" />
      </td>
      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{proj.name.az}</td>
      <td>{proj.name.en}</td>
      <td>
        <span className="timeline-date" style={{ textTransform: 'capitalize' }}>{proj.category}</span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={() => handleOpenEditProject(proj)}>
            <Edit2 size={16} />
          </button>
          <button className="btn-icon" onClick={() => handleProjectDelete(proj.id)} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

const API_BASE_URL = '';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('portfolio_token');

  // Dashboard Section Navigation State
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'jobs' | 'messages'

  // Data States
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [messages, setMessages] = useState([]);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  
  // Selected Item states for editing
  const [editingProject, setEditingProject] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  // Project Form States
  const [projectForm, setProjectForm] = useState({
    name_az: '', name_en: '',
    description_az: '', description_en: '',
    category: 'web', siteUrl: '',
    startDate: '', endDate: '',
    imageFile: null, imageUrl: ''
  });

  // Job Form States
  const [jobForm, setJobForm] = useState({
    company: '',
    description_az: '', description_en: '',
    startDate: '', endDate: '',
    siteUrl: ''
  });

  // Check auth and fetch data
  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [token, navigate]);

  // Central request helper that handles auth token checking
  const authFetch = async (url, options = {}) => {
    const headers = options.headers || {};
    options.headers = {
      ...headers,
      'Authorization': `Bearer ${token}`
    };

    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    try {
      const response = await fetch(fullUrl, options);
      if (response.status === 401) {
        // Expired/Invalid token -> clear and redirect
        localStorage.removeItem('portfolio_token');
        navigate('/admin/login');
        throw new Error('Session expired. Please log in again.');
      }
      return response;
    } catch (err) {
      console.error('Fetch error:', err.message);
      throw err;
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch projects
      const resProj = await fetch(`${API_BASE_URL}/api/projects`);
      if (resProj.ok) {
        const dataProj = await resProj.json();
        setProjects(dataProj);
      }

      // 2. Fetch jobs
      const resJobs = await fetch(`${API_BASE_URL}/api/jobs`);
      if (resJobs.ok) {
        const dataJobs = await resJobs.json();
        setJobs(dataJobs.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
      }

      // 3. Fetch messages
      const resMsg = await authFetch('/api/messages');
      if (resMsg && resMsg.ok) {
        const dataMsg = await resMsg.json();
        setMessages(dataMsg);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // DND Kit Sensors for drag and drop reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires moving 8px before drag triggers (crucial so click events on edit/delete still work)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex(p => p.id === active.id);
    const newIndex = projects.findIndex(p => p.id === over.id);

    const reordered = arrayMove(projects, oldIndex, newIndex);
    setProjects(reordered);

    try {
      const ids = reordered.map(p => p.id);
      const res = await authFetch('/api/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });

      if (!res.ok) {
        console.error('Failed to sync reordered projects with backend');
      }
    } catch (err) {
      console.error('Error reordering projects:', err);
    }
  };

  // Logout Trigger
  const handleLogout = () => {
    localStorage.removeItem('portfolio_token');
    navigate('/admin/login');
  };

  // ==========================================
  // PROJECT CRUD ACTIONS
  // ==========================================
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectForm({
      name_az: '', name_en: '',
      description_az: '', description_en: '',
      category: 'web', siteUrl: '',
      startDate: '', endDate: '',
      imageFile: null, imageUrl: ''
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj) => {
    setEditingProject(proj);
    setProjectForm({
      name_az: proj.name.az || '',
      name_en: proj.name.en || '',
      description_az: proj.description.az || '',
      description_en: proj.description.en || '',
      category: proj.category || 'web',
      siteUrl: proj.siteUrl || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      imageFile: null,
      imageUrl: proj.imageUrl || ''
    });
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name_az', projectForm.name_az);
    formData.append('name_en', projectForm.name_en);
    formData.append('description_az', projectForm.description_az);
    formData.append('description_en', projectForm.description_en);
    formData.append('category', projectForm.category);
    formData.append('siteUrl', projectForm.siteUrl);
    formData.append('startDate', projectForm.startDate);
    formData.append('endDate', projectForm.endDate || 'null'); // Send string null if empty

    if (projectForm.imageFile) {
      formData.append('image', projectForm.imageFile);
    } else {
      formData.append('imageUrl', projectForm.imageUrl);
    }

    try {
      let url = '/api/projects';
      let method = 'POST';

      if (editingProject) {
        url = `/api/projects/${editingProject.id}`;
        method = 'PUT';
      }

      const response = await authFetch(url, {
        method,
        body: formData // Fetch handles proper multipart/form-data boundary with FormData
      });

      if (response.ok) {
        setIsProjectModalOpen(false);
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed submitting project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectDelete = async (id) => {
    if (!window.confirm(t('admin.dashboard.delete_confirm'))) return;

    try {
      const response = await authFetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed deleting project:', error);
    }
  };

  // ==========================================
  // WORK EXPERIENCE CRUD ACTIONS
  // ==========================================
  const handleOpenAddJob = () => {
    setEditingJob(null);
    setJobForm({
      company: '',
      description_az: '', description_en: '',
      startDate: '', endDate: '',
      siteUrl: ''
    });
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (job) => {
    setEditingJob(job);
    setJobForm({
      company: job.company || '',
      description_az: job.description.az || '',
      description_en: job.description.en || '',
      startDate: job.startDate || '',
      endDate: job.endDate || '',
      siteUrl: job.siteUrl || ''
    });
    setIsJobModalOpen(true);
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let url = '/api/jobs';
      let method = 'POST';

      if (editingJob) {
        url = `/api/jobs/${editingJob.id}`;
        method = 'PUT';
      }

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm)
      });

      if (response.ok) {
        setIsJobModalOpen(false);
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed submitting job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobDelete = async (id) => {
    if (!window.confirm(t('admin.dashboard.delete_confirm'))) return;

    try {
      const response = await authFetch(`/api/jobs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed deleting job:', error);
    }
  };

  // ==========================================
  // MESSAGE MANAGEMENT ACTIONS
  // ==========================================
  const handleMessageDelete = async (id) => {
    if (!window.confirm(t('admin.dashboard.delete_confirm'))) return;

    try {
      const response = await authFetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed deleting message:', error);
    }
  };

  return (
    <div className="admin-layout">
      {/* 1. Sidebar Panel Nav */}
      <aside className="admin-sidebar">
        <div>
          <div className="admin-logo">
            <Layers size={22} style={{ color: 'var(--primary)' }} />
            <span>Zülfüqar Panel</span>
          </div>

          <nav>
            <ul className="admin-nav">
              <li className="admin-nav-item">
                <button 
                  className={`admin-nav-btn ${activeTab === 'projects' ? 'active' : ''}`}
                  onClick={() => setActiveTab('projects')}
                >
                  <Layers size={18} />
                  <span>{t('admin.dashboard.projects')}</span>
                </button>
              </li>
              <li className="admin-nav-item">
                <button 
                  className={`admin-nav-btn ${activeTab === 'jobs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('jobs')}
                >
                  <Briefcase size={18} />
                  <span>{t('admin.dashboard.jobs')}</span>
                </button>
              </li>
              <li className="admin-nav-item">
                <button 
                  className={`admin-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
                  onClick={() => setActiveTab('messages')}
                >
                  <Mail size={18} />
                  <span>{t('admin.dashboard.messages')} ({messages.length})</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          {/* Back to main site */}
          <Link to="/" className="btn btn-secondary" style={{ width: '100%', gap: '8px' }}>
            <Home size={16} />
            <span>{t('admin.dashboard.back_to_site')}</span>
          </Link>
          {/* Logout */}
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', gap: '8px', background: '#ef4444', boxShadow: 'none' }}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>{t('admin.dashboard.logout')}</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Admin Content Area */}
      <main className="admin-content">
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{t('admin.dashboard.title')}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'projects' && `${projects.length} layihə mövcuddur`}
              {activeTab === 'jobs' && `${jobs.length} təcrübə mövcuddur`}
              {activeTab === 'messages' && `${messages.length} yeni mesaj`}
            </p>
          </div>

          {/* Action buttons based on active tab */}
          {activeTab === 'projects' && (
            <button className="btn btn-primary" onClick={handleOpenAddProject}>
              <Plus size={18} />
              <span>{t('admin.dashboard.add_project')}</span>
            </button>
          )}

          {activeTab === 'jobs' && (
            <button className="btn btn-primary" onClick={handleOpenAddJob}>
              <Plus size={18} />
              <span>{t('admin.dashboard.add_job')}</span>
            </button>
          )}
        </div>

        {/* Tab Panel Renderers */}
        {isLoading && <p style={{ color: 'var(--text-muted)' }}>Yüklənir...</p>}

        {/* ========================================================== */}
        {/* PROJECTS TAB */}
        {/* ========================================================== */}
        {activeTab === 'projects' && !isLoading && (
          <div className="admin-table-wrapper">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}></th>
                    <th>{t('admin.dashboard.table_image')}</th>
                    <th>{t('admin.dashboard.table_title')} (AZ)</th>
                    <th>{t('admin.dashboard.table_title')} (EN)</th>
                    <th>{t('admin.dashboard.table_category')}</th>
                    <th>{t('admin.dashboard.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext
                    items={projects.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {projects.map(proj => (
                      <SortableRow
                        key={proj.id}
                        proj={proj}
                        handleOpenEditProject={handleOpenEditProject}
                        handleProjectDelete={handleProjectDelete}
                        t={t}
                      />
                    ))}
                  </SortableContext>

                  {projects.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        {t('admin.dashboard.empty')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </DndContext>
          </div>
        )}

        {/* ========================================================== */}
        {/* EXPERIENCE TAB */}
        {/* ========================================================== */}
        {activeTab === 'jobs' && !isLoading && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.dashboard.table_company')}</th>
                  <th>{t('admin.dashboard.table_date')}</th>
                  <th>{t('admin.dashboard.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.company}</td>
                    <td>
                      {job.startDate} — {job.endDate || t('admin.dashboard.end_date').split(' ')[0]}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon" onClick={() => handleOpenEditJob(job)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => handleJobDelete(job.id)} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {jobs.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      {t('admin.dashboard.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================== */}
        {/* CONTACT MESSAGES TAB */}
        {/* ========================================================== */}
        {activeTab === 'messages' && !isLoading && (
          <div className="messages-grid">
            {messages.map(msg => (
              <div key={msg.id} className="message-card">
                <div className="message-header">
                  <div>
                    <h3 className="message-sender">{msg.name}</h3>
                    <a href={`mailto:${msg.email}`} className="message-email">{msg.email}</a>
                  </div>
                  <span className="message-date">
                    {new Date(msg.date).toLocaleString()}
                  </span>
                </div>

                <div className="message-body">
                  {msg.message}
                </div>

                {/* Delete message button */}
                <button 
                  className="btn-icon message-delete-btn" 
                  onClick={() => handleMessageDelete(msg.id)}
                  style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <MessageSquare size={48} style={{ opacity: 0.3 }} />
                <p>{t('admin.dashboard.empty')}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================== */}
      {/* ADD/EDIT PROJECT MODAL */}
      {/* ========================================================== */}
      {isProjectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontWeight: 800 }}>
                {editingProject ? t('admin.dashboard.edit_project') : t('admin.dashboard.add_project')}
              </h2>
              <button className="btn-icon" onClick={() => setIsProjectModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit}>
              {/* Names (Bilingual) */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{t('admin.dashboard.name_az')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={projectForm.name_az}
                    onChange={(e) => setProjectForm({ ...projectForm, name_az: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.dashboard.name_en')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={projectForm.name_en}
                    onChange={(e) => setProjectForm({ ...projectForm, name_en: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">{t('admin.dashboard.category')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={projectForm.category}
                  onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                  required
                  placeholder="e.g. CRM, E-commerce, Landing page..."
                />
              </div>

              {/* Descriptions (Bilingual) */}
              <div className="form-group">
                <label className="form-label">{t('admin.dashboard.desc_az')}</label>
                <textarea
                  className="form-input"
                  value={projectForm.description_az}
                  onChange={(e) => setProjectForm({ ...projectForm, description_az: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.dashboard.desc_en')}</label>
                <textarea
                  className="form-input"
                  value={projectForm.description_en}
                  onChange={(e) => setProjectForm({ ...projectForm, description_en: e.target.value })}
                  required
                ></textarea>
              </div>

              {/* Image upload */}
              <div className="form-group">
                <label className="form-label">{t('admin.dashboard.image')}</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', gap: '8px' }}>
                    <Upload size={16} />
                    <span>Şəkil Seçin</span>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={(e) => setProjectForm({ ...projectForm, imageFile: e.target.files[0] })}
                    />
                  </label>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {projectForm.imageFile ? projectForm.imageFile.name : (editingProject ? 'Mövcud şəkil qalır' : 'Şəkil seçilməyib')}
                  </span>
                </div>
              </div>

              {/* Site URL */}
              <div className="form-group">
                <label className="form-label">{t('admin.dashboard.site_url')}</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com"
                  value={projectForm.siteUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, siteUrl: e.target.value })}
                />
              </div>

              {/* Dates */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{t('admin.dashboard.start_date')} (YYYY-MM)</label>
                  <input
                    type="month"
                    className="form-input"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.dashboard.end_date')} (YYYY-MM)</label>
                  <input
                    type="month"
                    className="form-input"
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsProjectModalOpen(false)}>
                  {t('admin.dashboard.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('admin.dashboard.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ADD/EDIT EXPERIENCE MODAL */}
      {/* ========================================================== */}
      {isJobModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontWeight: 800 }}>
                {editingJob ? t('admin.dashboard.edit_job') : t('admin.dashboard.add_job')}
              </h2>
              <button className="btn-icon" onClick={() => setIsJobModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleJobSubmit}>
              {/* Company */}
              <div className="form-group">
                <label className="form-label">{t('admin.dashboard.company')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={jobForm.company}
                  onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                  required
                />
              </div>

              {/* Descriptions (Bilingual) */}
              <div className="form-group">
                <label className="form-label">{t('admin.dashboard.desc_az')}</label>
                <textarea
                  className="form-input"
                  value={jobForm.description_az}
                  onChange={(e) => setJobForm({ ...jobForm, description_az: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.dashboard.desc_en')}</label>
                <textarea
                  className="form-input"
                  value={jobForm.description_en}
                  onChange={(e) => setJobForm({ ...jobForm, description_en: e.target.value })}
                  required
                ></textarea>
              </div>

              {/* Company URL */}
              <div className="form-group">
                <label className="form-label">{t('admin.dashboard.site_url')}</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://company.com"
                  value={jobForm.siteUrl}
                  onChange={(e) => setJobForm({ ...jobForm, siteUrl: e.target.value })}
                />
              </div>

              {/* Dates */}
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{t('admin.dashboard.start_date')} (YYYY-MM)</label>
                  <input
                    type="month"
                    className="form-input"
                    value={jobForm.startDate}
                    onChange={(e) => setJobForm({ ...jobForm, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.dashboard.end_date')} (YYYY-MM)</label>
                  <input
                    type="month"
                    className="form-input"
                    value={jobForm.endDate}
                    onChange={(e) => setJobForm({ ...jobForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsJobModalOpen(false)}>
                  {t('admin.dashboard.cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('admin.dashboard.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
