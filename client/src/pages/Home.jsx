import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Moon, 
  Sun, 
  Download, 
  FileText, 
  Send, 
  User,
  Briefcase,
  Layers,
  Code,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function Home({ theme, toggleTheme }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // State definitions
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [about, setAbout] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  // Contact form states
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [formFeedback, setFormFeedback] = useState(null); // { type: 'success'|'error', text: '' }

  // Fetch data on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/about`)
      .then(res => res.json())
      .then(data => setAbout(data))
      .catch(err => console.error('Error fetching about data:', err));

    fetch(`${API_BASE_URL}/api/projects`)
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('Error fetching projects:', err));

    fetch(`${API_BASE_URL}/api/jobs`)
      .then(res => res.json())
      .then(data => {
        // Sort jobs chronologically (latest first)
        const sortedJobs = data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        setJobs(sortedJobs);
      })
      .catch(err => console.error('Error fetching jobs:', err));
  }, []);

  // Sticky Navbar & Scroll Spy
  useEffect(() => {
    const handleScroll = () => {
      // Sticky header logic
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Scroll Spy logic
      const sections = ['about', 'projects', 'experience', 'contact'];
      const scrollPos = window.scrollY + 100;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Contact Submit
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    setIsSending(true);
    setFormFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFormFeedback({ type: 'success', text: t('contact.success') });
        setContactForm({ name: '', email: '', message: '' });
      } else {
        setFormFeedback({ type: 'error', text: t('contact.error') });
      }
    } catch (error) {
      setFormFeedback({ type: 'error', text: t('contact.error') });
    } finally {
      setIsSending(false);
    }
  };

  // Toggle i18n Language
  const toggleLanguage = () => {
    const nextLang = currentLang === 'az' ? 'en' : 'az';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('portfolio_lang', nextLang);
  };

  // Get all unique categories present in the projects list dynamically
  const categories = ['all', ...new Set(projects.map(p => p.category).filter(Boolean))];

  // Filter projects by category
  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter(p => p.category === activeFilter);

  // Format YYYY-MM into localized date representation
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + '-02'); // Add buffer day to prevent timezone shifts
    const options = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString(currentLang === 'az' ? 'az-AZ' : 'en-US', options);
  };

  return (
    <>
      {/* Background Decorative Glow Bubbles */}
      <div className="bg-glow bg-glow-right"></div>
      <div className="bg-glow bg-glow-left"></div>

      {/* Sticky Header Navbar */}
      <header className={`navbar glass ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <a href="#about" className="logo">
            <Code size={24} />
            <span>{about ? about.name[currentLang].split(' ')[0] : 'Anar'}.</span>
          </a>

          {/* Nav Menu Desktop */}
          <nav>
            <ul className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
              <li>
                <a 
                  href="#about" 
                  className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.about')}
                </a>
              </li>
              <li>
                <a 
                  href="#projects" 
                  className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.projects')}
                </a>
              </li>
              <li>
                <a 
                  href="#experience" 
                  className={`nav-link ${activeSection === 'experience' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.experience')}
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.contact')}
                </a>
              </li>
              
              {/* Mobile-Only Action Buttons inside drawer */}
              <li className="mobile-only-action" style={{ borderTop: '1px solid var(--border-color)', width: '100%', paddingTop: '20px', marginTop: '10px' }}>
                <button className="lang-toggle" onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }} style={{ margin: '0 auto 16px auto', width: '150px', display: 'flex', justifyContent: 'center' }}>
                  {currentLang === 'az' ? 'EN / AZ' : 'AZ / EN'}
                </button>
              </li>
              <li className="mobile-only-action" style={{ width: '100%' }}>
                <Link to="/admin" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)} style={{ margin: '0 auto 16px auto', width: '150px', gap: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <User size={16} />
                  <span>Admin Panel</span>
                </Link>
              </li>
              <li className="mobile-only-action" style={{ width: '100%' }}>
                <a href="/Anar_Zulfugarov_FlowCV_Resume_2026-06-01.pdf" className="btn btn-primary" download onClick={() => setMobileMenuOpen(false)} style={{ margin: '0 auto', width: '150px', gap: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Download size={16} />
                  <span>{t('nav.cv')}</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Action buttons (Bilingual, Dark Mode, Admin, CV) */}
          <div className="nav-actions">
            {/* Language Switch */}
            <button className="lang-toggle desktop-only-action" onClick={toggleLanguage}>
              {currentLang === 'az' ? 'AZ / EN' : 'EN / AZ'}
            </button>

            {/* Light/Dark Mode Switch */}
            <button 
              className="btn-icon" 
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Admin panel redirect */}
            <Link to="/admin" className="btn-icon desktop-only-action" aria-label="Admin Panel">
              <User size={18} />
            </Link>

            {/* Download CV */}
            <a href="/Anar_Zulfugarov_FlowCV_Resume_2026-06-01.pdf" className="btn btn-primary desktop-only-action" download style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Download size={14} />
              <span className="desktop-only">{t('nav.cv')}</span>
            </a>

            {/* Mobile Hamburger Burger */}
            <div className="burger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span style={{ transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
              <span style={{ opacity: mobileMenuOpen ? 0 : 1 }}></span>
              <span style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }}></span>
            </div>
          </div>
        </div>
      </header>

      {/* 1. Hero / About Me Section */}
      <section id="about" className="section container" style={{ paddingTop: '120px' }}>
        <div className="hero-wrapper">
          <div className="hero-content">
            <h5 className="hero-subtitle">{t('hero.greeting')}</h5>
            <h1 className="hero-title">
              {about ? about.name[currentLang].split(' ')[0] : 'Anar'} <span>{about ? about.name[currentLang].split(' ').slice(1).join(' ') : 'Zülfüqarov'}</span>
            </h1>
            <h3 className="hero-role">{about ? about.title[currentLang] : t('hero.role')}</h3>
            <p className="hero-bio">{about ? about.summary[currentLang] : t('hero.bio')}</p>

            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary">
                {t('hero.view_work')}
              </a>
              <a href="/Anar_Zulfugarov_FlowCV_Resume_2026-06-01.pdf" className="btn btn-secondary" download>
                <FileText size={18} />
                {t('hero.download_cv')}
              </a>
            </div>

            <div className="hero-socials">
              <span className="social-title">{t('hero.socials')}</span>
              <div className="social-links">
                <a href={about ? about.github : "https://github.com"} target="_blank" rel="noreferrer" className="btn-icon" aria-label="GitHub">
                  <Github size={18} />
                </a>
                <a href={about ? about.linkedin : "https://linkedin.com"} target="_blank" rel="noreferrer" className="btn-icon" aria-label="LinkedIn">
                  <Linkedin size={18} />
                </a>
                <a href={about ? `mailto:${about.email}` : "mailto:zulfuqar@example.com"} className="btn-icon" aria-label="Email">
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Morphing Profile Frame */}
          <div className="hero-image-area">
            <div className="image-frame">
              <img 
                src="/anar.jpg" 
                alt={about ? about.name[currentLang] : "Anar Zülfüqarov"} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  const svgEl = e.target.nextSibling;
                  if (svgEl) svgEl.style.display = 'block';
                }}
              />
              {/* Premium Vector Avatar since we don't have user's profile image */}
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
                <circle cx="50" cy="50" r="50" fill="url(#hero-grad)" />
                <path d="M50 25C40.61 25 33 32.61 33 42C33 49.33 37.66 55.56 44.18 57.92C45.31 58.33 46 59.43 46 60.63V65C46 67.21 47.79 69 50 69C52.21 69 54 67.21 54 65V60.63C54 59.43 54.69 58.33 55.82 57.92C62.34 55.56 67 49.33 67 42C67 32.61 59.39 25 50 25Z" fill="#ffffff" />
                <path d="M50 78C30.67 78 15 84.72 15 93V95H85V93C85 84.72 69.33 78 50 78Z" fill="#ffffff" fillOpacity="0.85" />
                <defs>
                  <linearGradient id="hero-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Projects Section */}
      <section id="projects" className="section" style={{ backgroundColor: 'var(--bg-secondary)', transition: 'background-color var(--transition-normal)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('projects.title')}</h2>
            <p className="section-subtitle">{t('projects.subtitle')}</p>
          </div>

          {/* Filtering buttons generated dynamically */}
          <div className="project-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
                onClick={() => setActiveFilter(category)}
                style={{ textTransform: 'capitalize' }}
              >
                {category === 'all' 
                  ? (currentLang === 'az' ? 'Hamısı' : 'All') 
                  : (t(`projects.filter_${category}`, { defaultValue: category }))}
              </button>
            ))}
          </div>

          {/* Responsive Card Grid */}
          <div className="projects-grid">
            {filteredProjects.map(project => (
              <article key={project.id} className="project-card glass-card">
                <div className="project-img-wrapper">
                  <span className="project-category" style={{ textTransform: 'capitalize' }}>
                    {t(`projects.filter_${project.category}`, { defaultValue: project.category })}
                  </span>
                  {project.imageUrl && project.imageUrl !== '/uploads/placeholder.jpg' ? (
                    <img 
                      src={project.imageUrl} 
                      alt={project.name[currentLang] || project.name.en} 
                      loading="lazy" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const sibling = e.target.nextSibling;
                        if (sibling) sibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {(!project.imageUrl || project.imageUrl === '/uploads/placeholder.jpg') ? (
                    <div className="project-placeholder">
                      <Code size={40} className="placeholder-icon" />
                      <span className="placeholder-text">{project.category}</span>
                    </div>
                  ) : (
                    <div className="project-placeholder" style={{ display: 'none' }}>
                      <Code size={40} className="placeholder-icon" />
                      <span className="placeholder-text">{project.category}</span>
                    </div>
                  )}
                </div>
                
                <div className="project-info">
                  <div className="project-date">
                    {formatDate(project.startDate)} — {project.endDate ? formatDate(project.endDate) : t('projects.ongoing')}
                  </div>
                  
                  <h3 className="project-card-title">{project.name[currentLang] || project.name.en}</h3>
                  
                  <p className="project-desc">
                    {project.description[currentLang] || project.description.en}
                  </p>

                  {project.siteUrl && (
                    <a 
                      href={project.siteUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="project-link"
                    >
                      <span>{t('projects.view_site')}</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
              {t('projects.no_projects')}
            </p>
          )}
        </div>
      </section>

      {/* 3. Work Experience Section */}
      <section id="experience" className="section container">
        <div className="section-header">
          <h2 className="section-title">{t('experience.title')}</h2>
          <p className="section-subtitle">{t('experience.subtitle')}</p>
        </div>

        {/* Timeline Component */}
        <div className="timeline">
          {jobs.map(job => (
            <div key={job.id} className="timeline-item">
              <div className="timeline-dot"></div>
              
              <div className="timeline-card glass-card">
                <div className="timeline-header">
                  <h3 className="timeline-company">{job.company}</h3>
                  <span className="timeline-date">
                    {formatDate(job.startDate)} — {job.endDate ? formatDate(job.endDate) : t('experience.ongoing')}
                  </span>
                </div>
                
                <p className="timeline-desc">
                  {job.description[currentLang] || job.description.en}
                </p>

                {job.siteUrl && (
                  <a 
                    href={job.siteUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="timeline-link"
                  >
                    <span>{t('experience.view_company')}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              {t('admin.dashboard.empty')}
            </p>
          )}
        </div>
      </section>

      {/* 4. Contact Section */}
      <section id="contact" className="section" style={{ backgroundColor: 'var(--bg-secondary)', transition: 'background-color var(--transition-normal)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('contact.title')}</h2>
            <p className="section-subtitle">{t('contact.subtitle')}</p>
          </div>

          <div className="contact-wrapper">
            <div className="contact-card glass-card">
              {about && (
                <div className="contact-details-grid">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>Email</div>
                    <a href={`mailto:${about.email}`} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{about.email}</a>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>{currentLang === 'az' ? 'Telefon' : 'Phone'}</div>
                    <a href={`tel:${about.phone}`} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{about.phone}</a>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '4px', fontWeight: 600, fontSize: '0.9rem' }}>{currentLang === 'az' ? 'Məkan' : 'Location'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{about.location[currentLang]}</div>
                  </div>
                </div>
              )}
              <form onSubmit={handleContactSubmit}>
                {/* Name */}
                <div className="form-group">
                  <label htmlFor="name" className="form-label">{t('contact.name')}</label>
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    placeholder={t('contact.placeholder_name')}
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">{t('contact.email')}</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder={t('contact.placeholder_email')}
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>

                {/* Message */}
                <div className="form-group">
                  <label htmlFor="message" className="form-label">{t('contact.message')}</label>
                  <textarea
                    id="message"
                    className="form-input"
                    placeholder={t('contact.placeholder_message')}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '10px' }}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <span>{t('contact.sending')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('contact.submit')}</span>
                      <Send size={16} />
                    </>
                  )}
                </button>

                {/* Status Feedback Alerts */}
                {formFeedback && (
                  <div className={`form-feedback ${formFeedback.type}`}>
                    {formFeedback.type === 'success' ? (
                      <CheckCircle2 size={16} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
                    ) : (
                      <AlertCircle size={16} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
                    )}
                    <span>{formFeedback.text}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} {about ? about.name[currentLang] : 'Anar Zülfüqarov'}. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
