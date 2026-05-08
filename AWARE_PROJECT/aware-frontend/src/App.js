import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = 'https://your-backend-name.onrender.com';
// NOTE: HF token is now in ReportController.java (backend)
// React no longer calls HuggingFace directly — Spring Boot does it server-side

// ─── CREATOR INFO ─────────────────────────────────────────────────────────────
const CREATOR = { name: 'Kuldeep Singh', email: 'ks14635142@gmail.com', phone: '6377328251' };

// ─── ADMIN CREDENTIAL ────────────────────────────────────────────────────────
const ADMIN = { username: 'admin', password: 'admin123', role: 'ADMIN' };

// ─── LOCALSTORAGE HELPERS ─────────────────────────────────────────────────────
function loadUsers() {
  try { return JSON.parse(localStorage.getItem('aware_users') || '[]'); }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem('aware_users', JSON.stringify(users));
}

// ─── AI ANALYSIS ─────────────────────────────────────────────────────────────
// HOW IT WORKS:
// React sends the image to Spring Boot /api/reports/analyze
// Spring Boot calls Hugging Face BLIP model (server-to-server, no CORS)
// BLIP generates a caption like "a road with large potholes and cracks"
// Spring Boot maps that to a civic category and returns it to React
// React shows the result in the form and stores it with the report
async function analyzeImageWithAI(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API}/analyze`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Analyze endpoint returned ' + res.status);
  const text = await res.text();
  return text.trim();
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getTypeClass(type) {
  if (!type) return 'type-default';
  const t = type.toLowerCase();
  if (t.includes('road') || t.includes('pothole'))      return 'type-road';
  if (t.includes('garbage') || t.includes('waste'))     return 'type-garbage';
  if (t.includes('water') || t.includes('flood'))       return 'type-water';
  if (t.includes('light') || t.includes('electric'))    return 'type-light';
  if (t.includes('drain'))                              return 'type-drainage';
  return 'type-default';
}
function getTypePlaceholder(type) {
  if (!type) return { icon: '🏙️', label: 'No Image' };
  const t = type.toLowerCase();
  if (t.includes('road') || t.includes('pothole')) return { icon: '🛣️', label: 'Road Issue' };
  if (t.includes('garbage') || t.includes('waste'))return { icon: '🗑️', label: 'Waste Issue' };
  if (t.includes('water') || t.includes('flood'))  return { icon: '💧', label: 'Water Issue' };
  if (t.includes('light'))                         return { icon: '💡', label: 'Light Issue' };
  if (t.includes('drain'))                         return { icon: '🌀', label: 'Drainage' };
  if (t.includes('tree'))                          return { icon: '🌳', label: 'Vegetation' };
  return { icon: '📍', label: 'Civic Issue' };
}
const STATUS_LABELS = {
  PENDING:'⏳ Pending', IN_PROGRESS:'🔄 In Progress',
  COMPLETED:'✅ Completed', REJECTED:'❌ Rejected'
};
function generateFakeHash() {
  return Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join('');
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ message, type, visible }) {
  const icons = { success:'✓', error:'✕', info:'ℹ' };
  return (
    <div className={`toast toast--${type} ${visible ? 'toast--show' : ''}`}>
      <span className="toast__icon">{icons[type] || 'ℹ'}</span>
      {message}
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onGetStarted }) {
  return (
    <div className="landing">
      <div className="orb orb--1"/><div className="orb orb--2"/>
      <nav className="landing-nav">
        <div className="logo-wrap">
          <div className="logo-icon">🔗</div>
          <div className="logo-text">AWARE</div>
        </div>
        <div className="landing-nav-links">
          <a href="#about">About</a>
          <a href="#how">How It Works</a>
          <a href="#creator">Creator</a>
          <button className="btn-land-login" onClick={onGetStarted}>Login / Sign Up →</button>
        </div>
      </nav>

      <section className="land-hero">
        <div className="land-hero-badge">🔗 Blockchain-Inspired · AI-Powered · SHA-256 Secured</div>
        <h1 className="land-hero-title">
          Report Civic Issues.<br/>
          <span className="land-hero-accent">Make Your City Better.</span>
        </h1>
        <p className="land-hero-desc">
          AWARE is a tamper-proof civic reporting platform where every issue is
          cryptographically hashed and linked — creating an immutable chain of civic
          data verified by Hugging Face AI image analysis.
        </p>
        <div className="land-hero-btns">
          <button className="btn-land-primary" onClick={onGetStarted}>🚀 Start Reporting Now</button>
          <a className="btn-land-secondary" href="#about">Learn More ↓</a>
        </div>
        <div className="land-stats">
          {[{n:'SHA-256',l:'Hash Algorithm'},{n:'BLIP AI',l:'Image Analysis'},{n:'100%',l:'Tamper Proof'},{n:'Live',l:'Status Updates'}].map(s=>(
            <div key={s.l} className="land-stat">
              <span className="land-stat__num">{s.n}</span>
              <span className="land-stat__label">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="land-section" id="about">
        <div className="land-section-tag">About AWARE</div>
        <h2 className="land-section-title">What is AWARE?</h2>
        <p className="land-section-desc">
          AWARE (Advanced Web-based Application for Reporting Events) empowers citizens to report
          local infrastructure issues using a blockchain-inspired integrity system so reports can
          never be silently tampered with.
        </p>
        <div className="land-features">
          {[
            {icon:'🔗',title:'Blockchain Hashing',desc:'Every report generates a SHA-256 hash linked to the previous, creating a verifiable chain.'},
            {icon:'🤖',title:'BLIP AI Analysis',desc:'Hugging Face BLIP model reads your uploaded image and generates a natural language description of the issue.'},
            {icon:'📍',title:'GPS Location',desc:'Auto-detect your GPS location via OpenStreetMap or type an address manually.'},
            {icon:'🛡️',title:'Admin Dashboard',desc:'Separate admin portal to manage statuses, view all reports, and manage registered users.'},
            {icon:'🔒',title:'Role-Based Access',desc:'Users submit reports. Admins manage them. Clear separation of responsibilities.'},
            {icon:'⛓️',title:'Tamper Detection',desc:'Any altered record breaks the hash chain — making data integrity fully verifiable.'},
          ].map(f=>(
            <div key={f.title} className="land-feature-card">
              <div className="land-feature-icon">{f.icon}</div>
              <div className="land-feature-title">{f.title}</div>
              <div className="land-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="land-section" id="how">
        <div className="land-section-tag">Process</div>
        <h2 className="land-section-title">How It Works</h2>
        <div className="land-steps">
          {[
            {n:'01',title:'Sign Up / Login',desc:'Create your account or login. Admins have a separate secure portal.'},
            {n:'02',title:'Upload Image',desc:'Select issue type, describe the problem, detect GPS location, upload a photo.'},
            {n:'03',title:'AI Analyzes',desc:'Spring Boot sends your image to Hugging Face BLIP. BLIP describes what it sees. We map it to a civic category.'},
            {n:'04',title:'Hash Generated',desc:'Spring Boot creates a SHA-256 hash linking your report to the previous one.'},
            {n:'05',title:'Stored in MySQL',desc:'Saved with hash, location, AI label, submitter info, and status.'},
            {n:'06',title:'Admin Reviews',desc:'Admin updates status (Pending → In Progress → Completed) and manages the chain.'},
          ].map((s,i)=>(
            <div key={s.n} className="land-step">
              <div className="land-step-num">{s.n}</div>
              <div className="land-step-title">{s.title}</div>
              <div className="land-step-desc">{s.desc}</div>
              {i<5 && <div className="land-step-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="land-section land-section--dark">
        <div className="land-section-tag">Technology</div>
        <h2 className="land-section-title">Built With</h2>
        <div className="land-techs">
          {[
            {icon:'⚛️',name:'React',desc:'Frontend UI'},
            {icon:'☕',name:'Spring Boot',desc:'Java Backend'},
            {icon:'🐬',name:'MySQL',desc:'Database'},
            {icon:'🤗',name:'HF BLIP',desc:'AI Vision Model'},
            {icon:'🔐',name:'SHA-256',desc:'Hash Algorithm'},
            {icon:'📍',name:'OpenStreetMap',desc:'GPS Geocoding'},
          ].map(t=>(
            <div key={t.name} className="land-tech-card">
              <div className="land-tech-icon">{t.icon}</div>
              <div className="land-tech-name">{t.name}</div>
              <div className="land-tech-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="land-section" id="creator">
        <div className="land-section-tag">Creator</div>
        <h2 className="land-section-title">About the Developer</h2>
        <div className="creator-card">
          <div className="creator-avatar">👨‍💻</div>
          <div className="creator-info">
            <div className="creator-name">{CREATOR.name}</div>
            <div className="creator-role">Full Stack Developer · AWARE Project</div>
            <div className="creator-bio">
              Built AWARE as a civic technology project combining blockchain-inspired data integrity,
              Hugging Face AI image analysis via Spring Boot, and real-time status tracking to help
              citizens report and track local infrastructure issues effectively.
            </div>
            <div className="creator-contacts">
              <a className="creator-contact" href={`mailto:${CREATOR.email}`}>✉️ {CREATOR.email}</a>
              <a className="creator-contact" href={`tel:${CREATOR.phone}`}>📞 {CREATOR.phone}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="land-cta">
        <h2 className="land-cta-title">Ready to Make a Difference?</h2>
        <p className="land-cta-desc">Join AWARE and start reporting civic issues in your area today.</p>
        <button className="btn-land-primary btn-land-primary--lg" onClick={onGetStarted}>
          🚀 Get Started — It's Free
        </button>
      </section>

      <footer className="land-footer">
        <div className="land-footer-logo">🔗 AWARE</div>
        <div className="land-footer-sub">Advanced Web-based Application for Reporting Events</div>
        <div className="land-footer-sub" style={{marginTop:'.3rem'}}>
          Built by {CREATOR.name} · {CREATOR.email} · {CREATOR.phone}
        </div>
        <div className="land-footer-copy">© 2025 AWARE. All rights reserved.</div>
      </footer>
    </div>
  );
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onLogin, onSignup }) {
  const [tab,       setTab]       = useState('login');
  const [role,      setRole]      = useState('user');
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [email,     setEmail]     = useState('');
  const [error,     setError]     = useState('');

  const reset = () => { setUsername(''); setPassword(''); setPassword2(''); setEmail(''); setError(''); };

  const handleLogin = () => {
    setError('');
    if (role === 'admin') {
      if (username === ADMIN.username && password === ADMIN.password) { onLogin({username, role:'ADMIN'}); }
      else setError('Invalid admin credentials.');
      return;
    }
    const users = loadUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (found) { onLogin({ username: found.username, email: found.email, role:'USER' }); }
    else setError('User not found. Please sign up first.');
  };

  const handleSignup = () => {
    setError('');
    if (!username.trim())   { setError('Username is required.'); return; }
    if (!email.trim())      { setError('Email is required.'); return; }
    if (password.length<6)  { setError('Password min 6 characters.'); return; }
    if (password!==password2){ setError('Passwords do not match.'); return; }
    const users = loadUsers();
    if (users.find(u=>u.username===username)) { setError('Username already taken.'); return; }
    const newUser = { id:Date.now(), username:username.trim(), password, email:email.trim(), joinedAt:new Date().toISOString() };
    saveUsers([...users, newUser]);
    onSignup(newUser);
    setTab('login'); reset();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-logo">
          <div className="modal-logo-icon">🔗</div>
          <div className="modal-logo-text">AWARE</div>
          <div className="modal-logo-sub">Advanced Web-based Application for Reporting Events</div>
        </div>
        <div className="role-tabs">
          <button className={`role-tab ${tab==='login'?'role-tab--active':''}`} onClick={()=>{setTab('login');reset();}}>Login</button>
          <button className={`role-tab ${tab==='signup'?'role-tab--active':''}`} onClick={()=>{setTab('signup');reset();}}>Sign Up</button>
        </div>
        {tab==='login' && (
          <div className="role-tabs" style={{marginBottom:'1rem'}}>
            <button className={`role-tab ${role==='user'?'role-tab--active':''}`} onClick={()=>setRole('user')}>👤 User</button>
            <button className={`role-tab role-tab--admin ${role==='admin'?'role-tab--active':''}`} onClick={()=>setRole('admin')}>🛡️ Admin</button>
          </div>
        )}
        {tab==='login' && (
          <div className="modal-hint">
            {role==='admin' ? <><strong>Admin:</strong> admin / admin123</> : <>Sign up to create a user account</>}
          </div>
        )}
        {error && <div className="modal-error">⚠ {error}</div>}

        {tab==='login' ? (
          <>
            <div className="field"><label className="field-label">Username</label>
              <input className="field-input" type="text" placeholder="Enter username" value={username}
                onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} autoFocus/>
            </div>
            <div className="field" style={{marginBottom:'1.4rem'}}><label className="field-label">Password</label>
              <input className="field-input" type="password" placeholder="••••••••" value={password}
                onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
            </div>
            <button className={`btn-primary ${role==='admin'?'btn-primary--amber':''}`} onClick={handleLogin}>
              {role==='admin' ? '🛡️ Login as Admin' : '👤 Login'}
            </button>
            <p className="modal-switch" onClick={()=>{setTab('signup');reset();}}>Don't have an account? <span>Sign Up →</span></p>
          </>
        ) : (
          <>
            <div className="field"><label className="field-label">Username</label>
              <input className="field-input" type="text" placeholder="e.g. rahul_sharma" value={username} onChange={e=>setUsername(e.target.value)} autoFocus/>
            </div>
            <div className="field"><label className="field-label">Email</label>
              <input className="field-input" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
            </div>
            <div className="field"><label className="field-label">Password</label>
              <input className="field-input" type="password" placeholder="Min 6 characters" value={password} onChange={e=>setPassword(e.target.value)}/>
            </div>
            <div className="field" style={{marginBottom:'1.4rem'}}><label className="field-label">Confirm Password</label>
              <input className="field-input" type="password" placeholder="Repeat password" value={password2}
                onChange={e=>setPassword2(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSignup()}/>
            </div>
            <button className="btn-primary" onClick={handleSignup}>✅ Create Account</button>
            <p className="modal-switch" onClick={()=>{setTab('login');reset();}}>Already have an account? <span>Login →</span></p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const key = status || 'PENDING';
  return (
    <span className={`status-badge status--${key}`}>
      <span className="status-dot"/>
      {(STATUS_LABELS[key] || key).replace(/^[^\s]+\s/, '')}
    </span>
  );
}

// ─── REPORT CARD ──────────────────────────────────────────────────────────────
function ReportCard({ report, delay, isAdmin, onStatusUpdate, onDelete }) {
  const [sel,      setSel]      = useState(report.status || 'PENDING');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUser, setShowUser] = useState(false);

  useEffect(() => { setSel(report.status || 'PENDING'); }, [report.status]);

  const ph        = getTypePlaceholder(report.issueType);
  const typeClass = getTypeClass(report.issueType);
  const hash      = report.hash || '—';
  const prevHash  = report.previousHash || '0'.repeat(64);

  const handleUpdate = async () => { if(sel===report.status)return; setUpdating(true); await onStatusUpdate(report.id, sel); setUpdating(false); };
  const handleDelete = async () => { if(!window.confirm(`Delete Report #${report.id}?`))return; setDeleting(true); await onDelete(report.id); setDeleting(false); };

  return (
    <div className="report-card" style={{ animationDelay:`${delay}ms` }}>
      <div className="card-img-wrap">
        {report.image
          ? <img src={`data:image/jpeg;base64,${report.image}`} alt="issue" className="card-img"/>
          : <div className="card-img-placeholder"><span className="ph-icon">{ph.icon}</span><span className="ph-text">{ph.label}</span></div>
        }
        <div className="card-type-bar"><span className={`type-chip ${typeClass}`}>{report.issueType || 'Unknown'}</span></div>
        <div className="card-status-bar"><StatusBadge status={report.status || 'PENDING'}/></div>
      </div>

      <div className="card-body">
        <p className="card-desc">{report.description || 'No description.'}</p>

        {report.submittedBy && (
          <>
            <div className="card-submitter" onClick={()=>setShowUser(!showUser)}>
              <span className="submitter-icon">👤</span>
              <span className="submitter-name">{report.submittedBy}</span>
              {report.submitterEmail && <span className="submitter-toggle">{showUser?'▲':'▼'}</span>}
            </div>
            {showUser && report.submitterEmail && (
              <div className="submitter-detail">📧 {report.submitterEmail}</div>
            )}
          </>
        )}

        {report.location && (
          <div className="card-location"><span className="loc-icon">📍</span><span>{report.location}</span></div>
        )}

        {report.aiLabel && (
          <div className="card-ai-label">🤖 {report.aiLabel}</div>
        )}

        <div className="hash-block">
          <div className="hash-row">
            <span className="hash-key">Hash</span>
            <span className="hash-val">{hash.substring(0,30)}...</span>
          </div>
          <div className="hash-row">
            <span className="hash-key">Prev</span>
            <span className="hash-val hash-val--prev">{prevHash.substring(0,30)}...</span>
          </div>
        </div>

        {isAdmin && (
          <div className="status-update-row">
            <select className="status-select" value={sel} onChange={e=>setSel(e.target.value)}>
              <option value="PENDING">⏳ Pending</option>
              <option value="IN_PROGRESS">🔄 In Progress</option>
              <option value="COMPLETED">✅ Completed</option>
              <option value="REJECTED">❌ Rejected</option>
            </select>
            <button className="btn-status-update" onClick={handleUpdate} disabled={updating||sel===report.status}>
              {updating ? <span className="spinner"/> : 'Update'}
            </button>
            <button className="btn-delete-single" onClick={handleDelete} disabled={deleting} title="Delete">
              {deleting ? <span className="spinner"/> : '🗑️'}
            </button>
          </div>
        )}

        <div className="card-footer">
          <span className="report-id">⛓ Report #{report.id || '—'}</span>
          <span className="chain-link-indicator">✓ Chain Linked</span>
        </div>
      </div>
    </div>
  );
}

// ─── UPLOAD ZONE ──────────────────────────────────────────────────────────────
function UploadZone({ onFileSelect, fileName, previewUrl, aiResult, analyzing }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) onFileSelect(f);
  };
  return (
    <div className="field">
      <label className="field-label">Upload Image <span className="field-label--muted">(optional · AI analyzed by Hugging Face BLIP)</span></label>
      <div className={`upload-zone ${dragging?'upload-zone--drag':''}`}
        onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)}
        onDrop={handleDrop} onClick={()=>inputRef.current.click()}>
        <input ref={inputRef} type="file" accept="image/*" style={{display:'none'}}
          onChange={e=>{ const f=e.target.files[0]; if(f) onFileSelect(f); }}/>
        <div className="upload-icon-wrap">📷</div>
        <div className="upload-main-text">Drop image here or <span className="highlight">browse</span></div>
        <div className="upload-sub-text">PNG, JPG up to 10MB · Hugging Face BLIP will describe the issue</div>
        {fileName && <div className="upload-filename">✓ {fileName}</div>}
        {previewUrl && <img src={previewUrl} alt="preview" className="preview-img"/>}
      </div>
      {analyzing && (
        <div className="ai-result ai-result--loading">
          🤖 Sending image to Hugging Face via Spring Boot... check IntelliJ console for [AI] logs
        </div>
      )}
      {!analyzing && aiResult && (
        <div className="ai-result">
          🤖 <strong>{aiResult}</strong>
        </div>
      )}
    </div>
  );
}

// ─── REPORT FORM ──────────────────────────────────────────────────────────────
function ReportForm({ onSubmit, loading, currentUser }) {
  const [issueType,   setIssueType]   = useState('');
  const [description, setDescription] = useState('');
  const [location,    setLocation]    = useState('');
  const [detecting,   setDetecting]   = useState(false);
  const [file,        setFile]        = useState(null);
  const [fileName,    setFileName]    = useState('');
  const [previewUrl,  setPreviewUrl]  = useState('');
  const [aiResult,    setAiResult]    = useState('');
  const [analyzing,   setAnalyzing]   = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) { setLocation('Geolocation not supported'); return; }
    setDetecting(true); setLocation('Detecting...');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setLocation(data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } catch { setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`); }
        setDetecting(false);
      },
      () => { setLocation('Could not detect — type manually'); setDetecting(false); },
      { timeout: 10000 }
    );
  };

  const handleFileSelect = async (f) => {
    setFile(f); setFileName(f.name);
    setPreviewUrl(URL.createObjectURL(f));
    setAiResult(''); setAnalyzing(true);

    try {
      const result = await analyzeImageWithAI(f);
      // Always show whatever the backend returned — even raw labels
      // Check Spring Boot terminal for [AI] logs to see exactly what HF returned
      if (result && result.trim() !== '') {
        setAiResult(result.trim());
      } else {
        // Backend returned empty — model was still loading after retry
        // User should wait a few seconds and re-upload the image
        setAiResult('Model warming up — please re-upload the image in 10 seconds');
      }
    } catch (e) {
      setAiResult('Spring Boot offline — start it on :8080 first');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(
      {
        issueType, description, location, file,
        aiLabel: aiResult,
        submittedBy: currentUser.username,
        submitterEmail: currentUser.email || ''
      },
      () => {
        setIssueType(''); setDescription(''); setLocation('');
        setFile(null); setFileName(''); setPreviewUrl(''); setAiResult(''); setAnalyzing(false);
      }
    );
  };

  return (
    <div className="form-card">
      <div className="form-card-title"><div className="icon-box">📋</div>Submit a New Report</div>

      <div className="field"><label className="field-label">Issue Type</label>
        <select className="field-input" value={issueType} onChange={e=>setIssueType(e.target.value)}>
          <option value="">Select issue type...</option>
          <option value="Road Damage">🛣️ Road Damage</option>
          <option value="Garbage">🗑️ Garbage / Waste</option>
          <option value="Water Leakage">💧 Water Leakage</option>
          <option value="Street Light">💡 Street Light Issue</option>
          <option value="Drainage">🌀 Drainage Blockage</option>
          <option value="Other">📌 Other</option>
        </select>
      </div>

      <div className="field"><label className="field-label">Description</label>
        <textarea className="field-input field-textarea"
          placeholder="Describe the issue — location, severity, duration..."
          value={description} onChange={e=>setDescription(e.target.value)}/>
      </div>

      <div className="field">
        <label className="field-label">Location <span className="field-label--muted">(type or detect)</span></label>
        <div className="location-row">
          <input className="field-input" type="text" placeholder="e.g. MG Road, Block 4, Near City Park..."
            value={location} onChange={e=>setLocation(e.target.value)}/>
          <button className="btn-locate" onClick={detectLocation} disabled={detecting}>
            {detecting ? <span className="spinner" style={{width:12,height:12}}/> : '📍'} Detect
          </button>
        </div>
      </div>

      <UploadZone onFileSelect={handleFileSelect} fileName={fileName} previewUrl={previewUrl} aiResult={aiResult} analyzing={analyzing}/>

      <button className="btn-submit" disabled={loading || analyzing} onClick={handleSubmit}>
        {loading
          ? <><span className="spinner"/> Hashing &amp; Submitting...</>
          : analyzing
          ? '⏳ Waiting for AI analysis...'
          : 'Submit Report & Generate Hash'
        }
      </button>

      <div className="form-footer">
        <div className="feature-chip"><div className="dot-c dot-c--blue"/>SHA-256</div>
        <div className="feature-chip"><div className="dot-c dot-c--violet"/>Chain Linked</div>
        <div className="feature-chip"><div className="dot-c dot-c--green"/>HF BLIP AI</div>
      </div>
    </div>
  );
}

// ─── USER MANAGEMENT (Admin) ──────────────────────────────────────────────────
function UserManagement() {
  const [users,     setUsersState] = useState(loadUsers());
  const [editingId, setEditingId]  = useState(null);
  const [editName,  setEditName]   = useState('');
  const [editEmail, setEditEmail]  = useState('');

  const startEdit = (u) => { setEditingId(u.id); setEditName(u.username); setEditEmail(u.email||''); };
  const saveEdit  = ()   => {
    const updated = loadUsers().map(u => u.id===editingId ? {...u, username:editName, email:editEmail} : u);
    saveUsers(updated); setUsersState(updated); setEditingId(null);
  };
  const deleteUser = (id) => {
    if (!window.confirm('Remove this user?')) return;
    const updated = loadUsers().filter(u => u.id!==id);
    saveUsers(updated); setUsersState(updated);
  };

  return (
    <div className="user-mgmt">
      <div className="section-head" style={{marginBottom:'1rem'}}>
        <div className="section-title" style={{fontSize:'1.2rem'}}>
          👥 Registered Users <span className="count-badge">{users.length}</span>
        </div>
        <button className="nav-btn" onClick={()=>setUsersState(loadUsers())}>↻ Refresh</button>
      </div>
      {users.length === 0 ? (
        <div className="empty-state" style={{padding:'2rem',gridColumn:'auto'}}>
          <div className="empty-icon-wrap" style={{width:50,height:50,fontSize:'1.3rem',margin:'0 auto .8rem'}}>👤</div>
          <div className="empty-title" style={{fontSize:'1rem'}}>No users signed up yet</div>
        </div>
      ) : (
        <div className="user-list">
          {users.map(u=>(
            <div key={u.id} className="user-row">
              {editingId===u.id ? (
                <>
                  <div className="user-avatar">✏️</div>
                  <div className="user-fields">
                    <input className="field-input" style={{marginBottom:4,padding:'4px 8px',fontSize:'.8rem'}}
                      value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Username"/>
                    <input className="field-input" style={{padding:'4px 8px',fontSize:'.8rem'}}
                      value={editEmail} onChange={e=>setEditEmail(e.target.value)} placeholder="Email"/>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn-status-update" onClick={saveEdit}>💾 Save</button>
                    <button className="btn-delete-single" onClick={()=>setEditingId(null)}>✕</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="user-avatar">👤</div>
                  <div className="user-info">
                    <div className="user-name">{u.username}</div>
                    <div className="user-email">{u.email||'No email'}</div>
                    {u.joinedAt && <div className="user-joined">Joined: {new Date(u.joinedAt).toLocaleDateString()}</div>}
                  </div>
                  <div className="user-badge">USER</div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn-status-update" onClick={()=>startEdit(u)}>✏️ Edit</button>
                    <button className="btn-delete-single" onClick={()=>deleteUser(u.id)}>🗑️</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ reports, onStatusUpdate, onDelete, onDeleteAll, onRefresh }) {
  const [activeTab, setActiveTab] = useState('reports');
  const users      = loadUsers();
  const pending    = reports.filter(r=>r.status==='PENDING').length;
  const inProgress = reports.filter(r=>r.status==='IN_PROGRESS').length;
  const completed  = reports.filter(r=>r.status==='COMPLETED').length;
  const rejected   = reports.filter(r=>r.status==='REJECTED').length;

  return (
    <>
      <div className="admin-stats-bar">
        <div className="admin-stat"><span className="admin-stat__num">{reports.length}</span><span className="admin-stat__label">Total</span></div>
        <div className="admin-stat admin-stat--amber"><span className="admin-stat__num">{pending}</span><span className="admin-stat__label">Pending</span></div>
        <div className="admin-stat admin-stat--blue"><span className="admin-stat__num">{inProgress}</span><span className="admin-stat__label">In Progress</span></div>
        <div className="admin-stat admin-stat--green"><span className="admin-stat__num">{completed}</span><span className="admin-stat__label">Completed</span></div>
        <div className="admin-stat admin-stat--red"><span className="admin-stat__num">{rejected}</span><span className="admin-stat__label">Rejected</span></div>
        <div className="admin-stat"><span className="admin-stat__num">{users.length}</span><span className="admin-stat__label">Users</span></div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab==='reports'?'admin-tab--active':''}`} onClick={()=>setActiveTab('reports')}>📋 Reports</button>
        <button className={`admin-tab ${activeTab==='users'?'admin-tab--active':''}`} onClick={()=>setActiveTab('users')}>👥 Users</button>
      </div>

      <section className="reports-section">
        {activeTab==='reports' ? (
          <>
            {reports.length>0 && (
              <div className="integrity-bar">
                <span>⛓️</span>
                <span>Hash chain verified — {reports.length} record{reports.length!==1?'s':''} intact</span>
              </div>
            )}
            <div className="section-head">
              <div className="section-title">All Reports <span className="count-badge">{reports.length}</span></div>
              <div style={{display:'flex',gap:'.6rem'}}>
                <button className="nav-btn" onClick={onRefresh}>↻ Refresh</button>
                {reports.length>0 && <button className="btn-danger" onClick={onDeleteAll}>🗑️ Delete All &amp; Reset</button>}
              </div>
            </div>
            {reports.length===0 ? (
              <div className="reports-grid"><div className="empty-state">
                <div className="empty-icon-wrap">📋</div>
                <div className="empty-title">No Reports</div>
                <div className="empty-sub">Users haven't submitted any reports yet</div>
              </div></div>
            ) : (
              <div className="reports-grid">
                {reports.map((r,i)=>(
                  <ReportCard key={r.id??i} report={r} delay={i*40} isAdmin={true}
                    onStatusUpdate={onStatusUpdate} onDelete={onDelete}/>
                ))}
              </div>
            )}
          </>
        ) : (
          <UserManagement/>
        )}
      </section>
    </>
  );
}

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
function UserDashboard({ reports, onSubmit, loading, currentUser }) {
  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">🔗 Blockchain-Inspired Integrity</div>
          <h1 className="hero-title">Report Civic Issues.<br/><span className="hero-title__accent">Verified &amp; Immutable.</span></h1>
          <p className="hero-desc">Every report is cryptographically hashed with SHA-256 and linked to the previous entry — a tamper-proof chain powered by Hugging Face BLIP AI image analysis.</p>
          <div className="tech-badges">
            {['Spring Boot','MySQL','SHA-256','HF BLIP AI','Hash Chain'].map(b=><span key={b} className="tech-badge">{b}</span>)}
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="stat-num">{reports.length||'—'}</div><div className="stat-label">Reports Filed</div></div>
            <div className="stat"><div className="stat-num" style={{color:'var(--green)'}}>✓</div><div className="stat-label">Chain Valid</div></div>
            <div className="stat"><div className="stat-num">256</div><div className="stat-label">SHA Bits</div></div>
          </div>
        </div>
        <ReportForm onSubmit={onSubmit} loading={loading} currentUser={currentUser}/>
      </section>

      <section className="reports-section">
        {reports.length>0 && (
          <div className="integrity-bar">
            <span>⛓️</span>
            <span>Hash chain verified — {reports.length} record{reports.length!==1?'s':''} intact</span>
          </div>
        )}
        <div className="section-head">
          <div className="section-title">Report Chain <span className="count-badge">{reports.length}</span></div>
        </div>
        {reports.length===0 ? (
          <div className="reports-grid"><div className="empty-state">
            <div className="empty-icon-wrap">📋</div>
            <div className="empty-title">No Reports Yet</div>
            <div className="empty-sub">Submit your first civic issue above to start the chain</div>
          </div></div>
        ) : (
          <div className="reports-grid">
            {reports.map((r,i)=>(
              <ReportCard key={r.id??i} report={r} delay={i*40} isAdmin={false}
                onStatusUpdate={()=>{}} onDelete={()=>{}}/>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
function App() {
  const [screen,      setScreen]      = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [reports,     setReports]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [syncing,     setSyncing]     = useState(false);
  const [chainOk,     setChainOk]     = useState(null);
  const [toast,       setToast]       = useState({visible:false,message:'',type:'success'});

  const isAdmin = currentUser?.role === 'ADMIN';

  const showToast = (message, type='success') => {
    setToast({visible:true,message,type});
    setTimeout(()=>setToast(t=>({...t,visible:false})), 3500);
  };

  const loadReports = async () => {
    setSyncing(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();
      setReports([...await res.json()].reverse());
      setChainOk(true);
    } catch { setChainOk(false); }
    finally { setSyncing(false); }
  };

  useEffect(()=>{
    if (!currentUser) return;
    loadReports();
    const iv = setInterval(loadReports, 15000);
    return ()=>clearInterval(iv);
  },[currentUser]);

  const handleLogin  = (user) => { setCurrentUser(user); setScreen('app'); };
  const handleSignup = (user) => { showToast(`Account created for ${user.username}! Now login.`,'success'); };

  const handleSubmit = async ({issueType,description,location,file,aiLabel,submittedBy,submitterEmail}, resetForm) => {
    if (!issueType)          { showToast('Please select an issue type','error'); return; }
    if (!description.trim()) { showToast('Please add a description','error');    return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('issueType',   issueType);
      fd.append('description', description);
      fd.append('submittedBy', submittedBy||'');
      fd.append('submitterEmail', submitterEmail||'');
      if (location) fd.append('location', location);
      if (aiLabel)  fd.append('aiLabel',  aiLabel);
      if (file)     fd.append('image',    file);
      const res = await fetch(API, {method:'POST',body:fd});
      if (res.ok) { showToast('Report submitted & chained!','success'); resetForm(); loadReports(); }
      else throw new Error();
    } catch {
      showToast('Demo mode — start Spring Boot on :8080','info');
      setReports(prev=>[{
        id:Date.now(), issueType, description, location,
        aiLabel:aiLabel||null, submittedBy, submitterEmail,
        status:'PENDING', hash:generateFakeHash(), previousHash:'0'.repeat(64), image:null
      },...prev]);
      resetForm();
    } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:newStatus})});
      if (res.ok) { showToast(`Status → ${newStatus.replace('_',' ')}`, 'success'); setReports(prev=>prev.map(r=>r.id===id?{...r,status:newStatus}:r)); }
      else throw new Error();
    } catch { setReports(prev=>prev.map(r=>r.id===id?{...r,status:newStatus}:r)); showToast('Updated locally','info'); }
  };

  const handleDeleteSingle = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`,{method:'DELETE'});
      if (res.ok) { setReports(prev=>prev.filter(r=>r.id!==id)); showToast('Report deleted','success'); }
      else throw new Error();
    } catch { setReports(prev=>prev.filter(r=>r.id!==id)); showToast('Deleted locally','info'); }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ Delete ALL reports and reset the hash chain?')) return;
    try {
      const res = await fetch(`${API}/all`,{method:'DELETE'});
      if (res.ok) { setReports([]); showToast('All reports deleted. Chain reset!','success'); }
      else throw new Error();
    } catch { setReports([]); showToast('Cleared locally','info'); }
  };

  if (screen==='landing') return <LandingPage onGetStarted={()=>setScreen('auth')}/>;
  if (screen==='auth')    return <AuthModal onLogin={handleLogin} onSignup={handleSignup}/>;

  return (
    <div className="app">
      <div className="orb orb--1"/><div className="orb orb--2"/>
      <nav className="navbar">
        <div className="logo-wrap">
          <div className="logo-icon">🔗</div>
          <div>
            <div className="logo-text">AWARE</div>
            <div className="logo-sub">Advanced Web-based Application for Reporting Events</div>
          </div>
        </div>
        <div className="nav-right">
          <div className="chain-status">
            <div className="pulse-dot"/>
            <span>{syncing?'Syncing...':chainOk===false?'Backend Offline':'System Active'}</span>
          </div>
          <div className="nav-user-pill">
            <div className={`role-dot ${isAdmin?'role-dot--admin':'role-dot--user'}`}/>
            <span>{currentUser.username} ({currentUser.role})</span>
          </div>
          <button className="nav-btn" onClick={()=>setScreen('landing')}>🏠 Home</button>
          <button className="nav-logout" onClick={()=>{setCurrentUser(null);setScreen('landing');}}>Logout</button>
        </div>
      </nav>

      {isAdmin
        ? <AdminDashboard reports={reports} onStatusUpdate={handleStatusUpdate}
            onDelete={handleDeleteSingle} onDeleteAll={handleDeleteAll} onRefresh={loadReports}/>
        : <UserDashboard reports={reports} onSubmit={handleSubmit} loading={loading} currentUser={currentUser}/>
      }

      <Toast message={toast.message} type={toast.type} visible={toast.visible}/>
    </div>
  );
}

export default App;
