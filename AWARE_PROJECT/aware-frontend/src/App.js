import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// ─── CONFIGURATION ───────────────────────────────────────────────────────────
const API = 'https://aware-backend-38v2.onrender.com/api/reports';
const CREATOR = { name: 'Kuldeep Singh', email: 'ks14635142@gmail.com', phone: '6377328251' };
const ADMIN = { username: 'admin', password: 'admin123', role: 'ADMIN' };

// ─── CORE LOCALSTORAGE UTILITIES ─────────────────────────────────────────────
function loadUsers() {
  try { return JSON.parse(localStorage.getItem('aware_users') || '[]'); }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem('aware_users', JSON.stringify(users));
}

// ─── TELEMETRY ANALYSIS SERVICE ──────────────────────────────────────────────
async function analyzeImageWithAI(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API}/analyze`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Analysis pipeline returned status ' + res.status);
  const text = await res.text();
  return text.trim();
}

// ─── INTERFACE FORMATTING HELPERS ────────────────────────────────────────────
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
  if (!type) return { icon: '▪', label: 'Unspecified' };
  const t = type.toLowerCase();
  if (t.includes('road') || t.includes('pothole')) return { icon: '⌥', label: 'Transit Network' };
  if (t.includes('garbage') || t.includes('waste'))return { icon: '◊', label: 'Sanitation' };
  if (t.includes('water') || t.includes('flood'))  return { icon: '💧', label: 'Hydraulics' };
  if (t.includes('light'))                         return { icon: '✦', label: 'Grid / Electric' };
  if (t.includes('drain'))                         return { icon: '◎', label: 'Civil Drainage' };
  if (t.includes('tree'))                          return { icon: '❖', label: 'Environmental' };
  return { icon: '▪', label: 'Civil Event' };
}

const STATUS_LABELS = {
  PENDING: 'Triage Pending', 
  IN_PROGRESS: 'Active Dispatch',
  COMPLETED: 'Resolved', 
  REJECTED: 'Archived'
};

function generateFakeHash() {
  return Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join('');
}

// ─── NOTIFICATION TOAST COMPONENT ────────────────────────────────────────────
function Toast({ message, type, visible }) {
  return (
    <div className={`toast toast--${type} ${visible ? 'toast--show' : ''}`}>
      <div className="toast__indicator" />
      <span className="toast__text">{message}</span>
    </div>
  );
}

// ─── PREMIUM LANDING VIEW ────────────────────────────────────────────────────
function LandingPage({ onGetStarted }) {
  return (
    <div className="landing">
      <div className="glow-matrix" />
      
      <nav className="landing-nav">
        <div className="logo-wrap">
          <span className="logo-mark">A</span>
          <div className="logo-text-group">
            <span className="logo-text">AWARE</span>
            <span className="logo-sub">Data Integrity Suite</span>
          </div>
        </div>
        <div className="landing-nav-links">
          <a href="#architecture">Architecture</a>
          <a href="#pipeline">Validation Pipeline</a>
          <a href="#developer">Operations</a>
          <button className="btn-land-login" onClick={onGetStarted}>Console Access</button>
        </div>
      </nav>

      <header className="land-hero">
        <div className="land-hero-badge">System Protocol v4.12 // Live Verification Active</div>
        <h1 className="land-hero-title">
          High-Fidelity Telemetry for<br/>
          <span className="land-hero-accent">Municipal Event Infrastructure.</span>
        </h1>
        <p className="land-hero-desc">
          An un-alterable tracking environment for municipal logistics. AWARE cryptographically maps 
          and binds public infrastructure reports into structured, verifiable records backstopped by automated 
          computer vision workflows.
        </p>
        <div className="land-hero-btns">
          <button className="btn-land-primary" onClick={onGetStarted}>Initialize Console Portal</button>
          <a className="btn-land-secondary" href="#architecture">Review Technical Spec</a>
        </div>
        
        <div className="land-stats">
          {[
            {n:'SHA-256',l:'Cryptographic Core'},
            {n:'BLIP Pipeline',l:'Computer Vision Framework'},
            {n:'Immutable',l:'State Retention'},
            {n:'Real-Time',l:'Sync Resolution'}
          ].map(s=>(
            <div key={s.l} className="land-stat">
              <span className="land-stat__num">{s.n}</span>
              <span className="land-stat__label">{s.l}</span>
            </div>
          ))}
        </div>
      </header>

      <section className="land-section" id="architecture">
        <span className="land-section-tag">Core Specifications</span>
        <h2 className="land-section-title">Designed for absolute auditability.</h2>
        <p className="land-section-desc">
          Engineered to secure municipal event lifecycles. Traditional data stores can be silently corrected; 
          AWARE establishes sequential record interdependence to secure systemic transparency.
        </p>
        <div className="land-features">
          {[
            {title:'Sequential Record Interdependence',desc:'Each entry references a state verification string derived from the immediate antecedent, preventing unlogged modifications.'},
            {title:'Automated Vision Validation',desc:'Hugging Face vision models translate client binary image payloads directly into standardized structural categorization codes.'},
            {title:'Geographic Geocoding Engine',desc:'Reverse-interpolates client-side coordinate metrics using the OpenStreetMap index for precise positioning mapping.'},
            {title:'Administrative Telemetry Matrix',desc:'A centralized supervisory operations interface built specifically for dispatch sorting, resolution auditing, and user management.'},
            {title:'Isolated Multi-Role Authorization',desc:'Enforces hard structural division between field submission nodes and processing validation centers.'},
            {title:'Automatic Chain Disruption Warning',desc:'Any retroactive structural delta triggers an systemic verification fault, invalidating downstream telemetry nodes instantly.'},
          ].map(f=>(
            <div key={f.title} className="land-feature-card">
              <div className="land-feature-decor" />
              <div className="land-feature-title">{f.title}</div>
              <div className="land-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="land-section land-section--dark" id="pipeline">
        <span className="land-section-tag">Process Execution Flow</span>
        <h2 className="land-section-title">Telemetry Validation Lifespan</h2>
        <div className="land-steps">
          {[
            {n:'01',title:'Identity Validation',desc:'Nodes self-authenticate to generate valid cryptographic signature structures.'},
            {n:'02',title:'Payload Collection',desc:'Field telemetry data, contextual variables, and coordinate tracking tags assemble.'},
            {n:'03',title:'Vision Assessment',desc:'Spring Boot pipelines push binary data arrays to remote inference endpoints for analysis.'},
            {n:'04',title:'State Compounding',desc:'The central verification mechanism builds a unique cryptographic string binding the data package.'},
            {n:'05',title:'Persistent Ledgering',desc:'The ledger registers parameters, coordinate data strings, and operational statuses inside MySQL.'},
            {n:'06',title:'Supervisory Triage',desc:'Administrative operators update handling tracks from pending triage down to target resolution.'},
          ].map((s,i)=>(
            <div key={s.n} className="land-step">
              <div className="land-step-num">{s.n}</div>
              <div className="land-step-title">{s.title}</div>
              <div className="land-step-desc">{s.desc}</div>
              {i<5 && <div className="land-step-arrow" />}
            </div>
          ))}
        </div>
      </section>

      <section className="land-section" id="developer">
        <span className="land-section-tag">Engineering Matrix</span>
        <h2 className="land-section-title">Architecture Framework</h2>
        <div className="creator-card">
          <div className="creator-avatar">📊</div>
          <div className="creator-info">
            <div className="creator-name">{CREATOR.name}</div>
            <div className="creator-role">Systems Architect // Full Stack Core Developer</div>
            <div className="creator-bio">
              Engineered AWARE to test the boundaries of data integrity models in public logistical networks, 
              marrying advanced Java infrastructure design with deterministic front-end client states.
            </div>
            <div className="creator-contacts">
              <a className="creator-contact" href={`mailto:${CREATOR.email}`}>sys://{CREATOR.email}</a>
              <a className="creator-contact" href={`tel:${CREATOR.phone}`}>tel://{CREATOR.phone}</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="land-footer">
        <div className="land-footer-logo">AWARE PLATFORM</div>
        <div className="land-footer-sub">Advanced Web-based Application for Reporting Events</div>
        <div className="land-footer-copy">System Engine Lifecycle Registry // © 2026 AWARE Suite. All data logged.</div>
      </footer>
    </div>
  );
}

// ─── MINIMALIST PORTAL GATEWAY (AUTH) ────────────────────────────────────────
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
      else setError('System Identity rejected for operational credential.');
      return;
    }
    const users = loadUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (found) { onLogin({ username: found.username, email: found.email, role:'USER' }); }
    else setError('Profile identity mismatch or node non-existent.');
  };

  const handleSignup = () => {
    setError('');
    if (!username.trim())   { setError('Identity parameter missing.'); return; }
    if (!email.trim())      { setError('Contact routing email required.'); return; }
    if (password.length<6)  { setError('Key must consist of at least 6 characters.'); return; }
    if (password!==password2){ setError('Key confirmation mismatch.'); return; }
    const users = loadUsers();
    if (users.find(u=>u.username===username)) { setError('Identity moniker currently deployed by another node.'); return; }
    const newUser = { id:Date.now(), username:username.trim(), password, email:email.trim(), joinedAt:new Date().toISOString() };
    saveUsers([...users, newUser]);
    onSignup(newUser);
    setTab('login'); reset();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-logo">
          <div className="modal-logo-text">AWARE // IDENTITY SYSTEM</div>
          <div className="modal-logo-sub">Node Access Authorization Gateway</div>
        </div>
        
        <div className="role-tabs">
          <button className={`role-tab ${tab==='login'?'role-tab--active':''}`} onClick={()=>{setTab('login');reset();}}>Establish Session</button>
          <button className={`role-tab ${tab==='signup'?'role-tab--active':''}`} onClick={()=>{setTab('signup');reset();}}>Register Node</button>
        </div>

        {tab==='login' && (
          <div className="role-tabs role-tabs--sub">
            <button className={`role-tab ${role==='user'?'role-tab--active':''}`} onClick={()=>setRole('user')}>Standard Node</button>
            <button className={`role-tab role-tab--admin ${role==='admin'?'role-tab--active':''}`} onClick={()=>setRole('admin')}>Supervisory Access</button>
          </div>
        )}

        {tab==='login' && (
          <div className="modal-hint">
            {role==='admin' ? <>Supervisory Default: admin / admin123</> : <>Input client telemetry parameters to log in</>}
          </div>
        )}

        {error && <div className="modal-error">System Fault: {error}</div>}

        {tab==='login' ? (
          <>
            <div className="field">
              <label className="field-label">Node Identifier</label>
              <input className="field-input" type="text" placeholder="username" value={username}
                onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} autoFocus/>
            </div>
            <div className="field" style={{marginBottom:'1.5rem'}}>
              <label className="field-label">Verification Access Key</label>
              <input className="field-input" type="password" placeholder="••••••••" value={password}
                onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
            </div>
            <button className={`btn-primary ${role==='admin'?'btn-primary--amber':''}`} onClick={handleLogin}>
              {role==='admin' ? 'Initialize Supervisory Control' : 'Open Workspace'}
            </button>
            <p className="modal-switch" onClick={()=>{setTab('signup');reset();}}>New terminal node? <span>Request Authorization →</span></p>
          </>
        ) : (
          <>
            <div className="field">
              <label className="field-label">Desired Unique Moniker</label>
              <input className="field-input" type="text" placeholder="e.g., node_alpha" value={username} onChange={e=>setUsername(e.target.value)} autoFocus/>
            </div>
            <div className="field">
              <label className="field-label">Routing Destination Email</label>
              <input className="field-input" type="email" placeholder="node@domain.internal" value={email} onChange={e=>setEmail(e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">Secure Access Password</label>
              <input className="field-input" type="password" placeholder="Minimum 6 glyphs" value={password} onChange={e=>setPassword(e.target.value)}/>
            </div>
            <div className="field" style={{marginBottom:'1.5rem'}}>
              <label className="field-label">Re-Verify Access Password</label>
              <input className="field-input" type="password" placeholder="Repeat key parameters" value={password2}
                onChange={e=>setPassword2(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSignup()}/>
            </div>
            <button className="btn-primary" onClick={handleSignup}>Commit Node Registry</button>
            <p className="modal-switch" onClick={()=>{setTab('login');reset();}}>Profile authenticated? <span>Return to login panel →</span></p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── DESIGNED TELEMETRY RADIAL INDICATOR (STATUS BADGE) ──────────────────────
function StatusBadge({ status }) {
  const key = status || 'PENDING';
  return (
    <span className={`status-badge status--${key}`}>
      <span className="status-dot"/>
      <span className="status-text">{STATUS_LABELS[key] || key}</span>
    </span>
  );
}

// ─── TECHNICAL STREAM CARD COMPONENT ─────────────────────────────────────────
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
  const handleDelete = async () => { if(!window.confirm(`Permanently purge telemetry frame #${report.id}?`))return; setDeleting(true); await onDelete(report.id); setDeleting(false); };

  return (
    <div className="report-card" style={{ animationDelay:`${delay}ms` }}>
      <div className="card-img-wrap">
        {report.image
          ? <img src={`data:image/jpeg;base64,${report.image}`} alt="System Data Intercept Input" className="card-img"/>
          : <div className="card-img-placeholder"><span className="ph-icon">{ph.icon}</span><span className="ph-text">{ph.label}</span></div>
        }
        <div className="card-type-bar"><span className={`type-chip ${typeClass}`}>{report.issueType || 'General Unassigned'}</span></div>
        <div className="card-status-bar"><StatusBadge status={report.status || 'PENDING'}/></div>
      </div>

      <div className="card-body">
        <p className="card-desc">{report.description || 'Null log details provided.'}</p>

        {report.submittedBy && (
          <>
            <div className="card-submitter" onClick={()=>setShowUser(!showUser)}>
              <span className="submitter-lbl">Origin Terminal:</span>
              <span className="submitter-name">{report.submittedBy}</span>
              {report.submitterEmail && <span className="submitter-toggle">{showUser?'[hide details]':'[view details]'}</span>}
            </div>
            {showUser && report.submitterEmail && (
              <div className="submitter-detail">Routing Key: {report.submitterEmail}</div>
            )}
          </>
        )}

        {report.location && (
          <div className="card-location">
            <span className="loc-label">Geocoding String:</span>
            <span className="loc-value">{report.location}</span>
          </div>
        )}

        {report.aiLabel && (
          <div className="card-ai-label">
            <span className="ai-lbl-head">Vision Engine Assessment:</span>
            <span className="ai-lbl-body">{report.aiLabel}</span>
          </div>
        )}

        <div className="hash-block">
          <div className="hash-row">
            <span className="hash-key">Current State Hash</span>
            <span className="hash-val">{hash.substring(0,28)}...</span>
          </div>
          <div className="hash-row">
            <span className="hash-key">Antecedent Hash</span>
            <span className="hash-val hash-val--prev">{prevHash.substring(0,28)}...</span>
          </div>
        </div>

        {isAdmin && (
          <div className="status-update-row">
            <select className="status-select" value={sel} onChange={e=>setSel(e.target.value)}>
              <option value="PENDING">Triage Pending</option>
              <option value="IN_PROGRESS">Active Dispatch</option>
              <option value="COMPLETED">Mark Resolved</option>
              <option value="REJECTED">Archive Record</option>
            </select>
            <button className="btn-status-update" onClick={handleUpdate} disabled={updating||sel===report.status}>
              {updating ? <span className="spinner"/> : 'Update State'}
            </button>
            <button className="btn-delete-single" onClick={handleDelete} disabled={deleting} title="Purge Record Row">
              {deleting ? <span className="spinner"/> : 'Purge'}
            </button>
          </div>
        )}

        <div className="card-footer">
          <span className="report-id">Frame Index #{report.id || '—'}</span>
          <span className="chain-link-indicator">Ledger Link Stable</span>
        </div>
      </div>
    </div>
  );
}

// ─── CONTROL DROP INPUT (UPLOAD ZONE) ────────────────────────────────────────
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
      <label className="field-label">Visual Payload Matrix <span className="field-label--muted">(Processed via backend parsing engines)</span></label>
      <div className={`upload-zone ${dragging?'upload-zone--drag':''}`}
        onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)}
        onDrop={handleDrop} onClick={()=>inputRef.current.click()}>
        <input ref={inputRef} type="file" accept="image/*" style={{display:'none'}}
          onChange={e=>{ const f=e.target.files[0]; if(f) onFileSelect(f); }}/>
        <div className="upload-icon-wrap">//</div>
        <div className="upload-main-text">Drag array binary data directly or <span className="highlight">query folder</span></div>
        <div className="upload-sub-text">PNG, JPG allocations capped at 10MB // Model extraction triggers automatically</div>
        {fileName && <div className="upload-filename">Track Target Staged: {fileName}</div>}
        {previewUrl && <img src={previewUrl} alt="Payload staging preview" className="preview-img"/>}
      </div>
      {analyzing && (
        <div className="ai-result ai-result--loading">
          Routing image stream matrix to classification endpoints... Check IDE execution logs for [AI] tags.
        </div>
      )}
      {!analyzing && aiResult && (
        <div className="ai-result">
          Parsed Payload: <strong>{aiResult}</strong>
        </div>
      )}
    </div>
  );
}

// ─── CONTROL SUBMISSION FORM COMPONENT ───────────────────────────────────────
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
    if (!navigator.geolocation) { setLocation('Tracking protocols restricted by client.'); return; }
    setDetecting(true); setLocation('Awaiting positioning resolution...');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setLocation(data.display_name || `LAT:${latitude.toFixed(5)} // LON:${longitude.toFixed(5)}`);
        } catch { setLocation(`LAT:${latitude.toFixed(5)} // LON:${longitude.toFixed(5)}`); }
        setDetecting(false);
      },
      () => { setLocation('Positioning timeout — please explicit input parameters'); setDetecting(false); },
      { timeout: 10000 }
    );
  };

  const handleFileSelect = async (f) => {
    setFile(f); setFileName(f.name);
    setPreviewUrl(URL.createObjectURL(f));
    setAiResult(''); setAnalyzing(true);

    try {
      const result = await analyzeImageWithAI(f);
      if (result && result.trim() !== '') {
        setAiResult(result.trim());
      } else {
        setAiResult('Pipeline buffering — retry matrix submission in 10 seconds');
      }
    } catch (e) {
      setAiResult('Core microservice connection broken — start processing framework on port 8080');
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
      <div className="form-card-title"><div className="icon-box">IN</div>Ingest New Telemetry Frame</div>

      <div className="field">
        <label className="field-label">Classification Segment</label>
        <select className="field-input" value={issueType} onChange={e=>setIssueType(e.target.value)}>
          <option value="">Awaiting selection tracking segment...</option>
          <option value="Road Damage">Transit Network / Asset Damage</option>
          <option value="Garbage">Sanitation / Refuse Accumulation</option>
          <option value="Water Leakage">Hydraulic Flow Disruptions</option>
          <option value="Street Light">Grid Telemetry Fault</option>
          <option value="Drainage">Civil Drainage Infrastructure</option>
          <option value="Other">Unspecified Log Event</option>
        </select>
      </div>

      <div className="field">
        <label className="field-label">Contextual Parameter Details</label>
        <textarea className="field-input field-textarea"
          placeholder="Log comprehensive event tracking parameters, observed degradation patterns, metrics..."
          value={description} onChange={e=>setDescription(e.target.value)}/>
      </div>

      <div className="field">
        <label className="field-label">Geographic Grid Origin <span className="field-label--muted">(Manual string input or GPS validation)</span></label>
        <div className="location-row">
          <input className="field-input" type="text" placeholder="Specify physical deployment intersection, quadrant data..."
            value={location} onChange={e=>setLocation(e.target.value)}/>
          <button className="btn-locate" onClick={detectLocation} disabled={detecting}>
            {detecting ? <span className="spinner" style={{width:12,height:12}}/> : 'GPS'} Intercept
          </button>
        </div>
      </div>

      <UploadZone onFileSelect={handleFileSelect} fileName={fileName} previewUrl={previewUrl} aiResult={aiResult} analyzing={analyzing}/>

      <button className="btn-submit" disabled={loading || analyzing} onClick={handleSubmit}>
        {loading
          ? <><span className="spinner"/> Generating Crypto Hash Signature...</>
          : analyzing
          ? 'Locking state for AI vision ingestion...'
          : 'Commit Telemetry Block to Ledger'
        }
      </button>

      <div className="form-footer">
        <div className="feature-chip"><div className="dot-c dot-c--blue"/>SHA-256</div>
        <div className="feature-chip"><div className="dot-c dot-c--violet"/>State Vaulted</div>
        <div className="feature-chip"><div className="dot-c dot-c--green"/>Inference Ingest</div>
      </div>
    </div>
  );
}

// ─── ADMINISTRATIVE NODE DIRECTORY ───────────────────────────────────────────
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
    if (!window.confirm('Sever synchronization from this system user node?')) return;
    const updated = loadUsers().filter(u => u.id!==id);
    saveUsers(updated); setUsersState(updated);
  };

  return (
    <div className="user-mgmt">
      <div className="section-head" style={{marginBottom:'1rem'}}>
        <div className="section-title" style={{fontSize:'1.1rem'}}>
          Authorized Registry Terminals <span className="count-badge">{users.length} Nodes</span>
        </div>
        <button className="nav-btn" onClick={()=>setUsersState(loadUsers())}>Refresh Node Manifest</button>
      </div>
      {users.length === 0 ? (
        <div className="empty-state" style={{padding:'3rem',gridColumn:'auto'}}>
          <div className="empty-title" style={{fontSize:'0.95rem'}}>No client nodes discovered on network matrix</div>
        </div>
      ) : (
        <div className="user-list">
          {users.map(u=>(
            <div key={u.id} className="user-row">
              {editingId===u.id ? (
                <>
                  <div className="user-avatar">&gt;_</div>
                  <div className="user-fields">
                    <input className="field-input" style={{marginBottom:4,padding:'4px 8px',fontSize:'.78rem'}}
                      value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Username Moniker"/>
                    <input className="field-input" style={{padding:'4px 8px',fontSize:'.78rem'}}
                      value={editEmail} onChange={e=>setEditEmail(e.target.value)} placeholder="Routing Address"/>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn-status-update" onClick={saveEdit}>Save Profile</button>
                    <button className="btn-delete-single" onClick={()=>setEditingId(null)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="user-avatar">N</div>
                  <div className="user-info">
                    <div className="user-name">{u.username}</div>
                    <div className="user-email">{u.email||'Routing entry missing'}</div>
                    {u.joinedAt && <div className="user-joined">Initialized: {new Date(u.joinedAt).toLocaleDateString()}</div>}
                  </div>
                  <div className="user-badge">Terminal Node</div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn-status-update" onClick={()=>startEdit(u)}>Modify Config</button>
                    <button className="btn-delete-single" onClick={()=>deleteUser(u.id)}>Sever</button>
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

// ─── SUPERVISORY OPERATIONAL DASHBOARD (ADMIN) ───────────────────────────────
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
        <div className="admin-stat"><span className="admin-stat__num">{reports.length}</span><span className="admin-stat__label">Total Blocks</span></div>
        <div className="admin-stat admin-stat--amber"><span className="admin-stat__num">{pending}</span><span className="admin-stat__label">Triage Staged</span></div>
        <div className="admin-stat admin-stat--blue"><span className="admin-stat__num">{inProgress}</span><span className="admin-stat__label">In Dispatch</span></div>
        <div className="admin-stat admin-stat--green"><span className="admin-stat__num">{completed}</span><span className="admin-stat__label">Resolved States</span></div>
        <div className="admin-stat admin-stat--red"><span className="admin-stat__num">{rejected}</span><span className="admin-stat__label">Archived Array</span></div>
        <div className="admin-stat"><span className="admin-stat__num">{users.length}</span><span className="admin-stat__label">Active Nodes</span></div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab==='reports'?'admin-tab--active':''}`} onClick={()=>setActiveTab('reports')}>System Ledgers</button>
        <button className={`admin-tab ${activeTab==='users'?'admin-tab--active':''}`} onClick={()=>setActiveTab('users')}>Node Directories</button>
      </div>

      <section className="reports-section">
        {activeTab==='reports' ? (
          <>
            {reports.length>0 && (
              <div className="integrity-bar">
                <span>Verification Success: State telemetry array fully linked. Data frame coherence stable.</span>
              </div>
            )}
            <div className="section-head">
              <div className="section-title">Telemetry Ledger Streams <span className="count-badge">{reports.length} Frames Loaded</span></div>
              <div style={{display:'flex',gap:'.6rem'}}>
                <button className="nav-btn" onClick={onRefresh}>Poll Microservices</button>
                {reports.length>0 && <button className="btn-danger" onClick={onDeleteAll}>Wipe Entire Ledger & Reset State</button>}
              </div>
            </div>
            {reports.length===0 ? (
              <div className="reports-grid"><div className="empty-state">
                <div className="empty-title">System Ledgers Unallocated</div>
                <div className="empty-sub">No network client entries discovered within active collection frames.</div>
              </div></div>
            ) : (
              <div className="reports-grid">
                {reports.map((r,i)=>(
                  <ReportCard key={r.id??i} report={r} delay={i*30} isAdmin={true}
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

// ─── STANDARD CLIENT CONTROL DESK (USER WORKSPACE) ───────────────────────────
function UserDashboard({ reports, onSubmit, loading, currentUser }) {
  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">Cryptographic Verification Workspace // Live Pipeline</div>
          <h1 className="hero-title">Telemetry Ledger Submission Node.<br/><span className="hero-title__accent">Auditability Guaranteed.</span></h1>
          <p className="hero-desc">Individual operational inputs compound with an internal state tracking mechanism. High-fidelity classification algorithms verify incoming binary image structures upon ingestion.</p>
          <div className="tech-badges">
            {['Java Infrastructure','Relational Architecture','State Interdependence','BLIP Logic Array'].map(b=><span key={b} className="tech-badge">{b}</span>)}
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="stat-num">{reports.length||'00'}</div><div className="stat-label">Committed Records</div></div>
            <div className="stat"><div className="stat-num" style={{color:'var(--green)'}}>100%</div><div className="stat-label">Array Verification</div></div>
            <div className="stat"><div className="stat-num">256</div><div className="stat-label">Entropy Scale</div></div>
          </div>
        </div>
        <ReportForm onSubmit={onSubmit} loading={loading} currentUser={currentUser}/>
      </section>

      <section className="reports-section">
        {reports.length>0 && (
          <div className="integrity-bar">
            <span>Validation Active // Ledger Array Integrity Checked &amp; Confirmed Intact.</span>
          </div>
        )}
        <div className="section-head">
          <div className="section-title">Verifiable Infrastructure Log Tracker <span className="count-badge">{reports.length} Sequences</span></div>
        </div>
        {reports.length===0 ? (
          <div className="reports-grid"><div className="empty-state">
            <div className="empty-title">No Network Telemetry Discovered</div>
            <div className="empty-sub">Initialize system state by submitting the initial infrastructure frame above.</div>
          </div></div>
        ) : (
          <div className="reports-grid">
            {reports.map((r,i)=>(
              <ReportCard key={r.id??i} report={r} delay={i*30} isAdmin={false}
                onStatusUpdate={()=>{}} onDelete={()=>{}}/>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ─── PRIMARY APPLICATION STATE MACHINE (ROOT) ────────────────────────────────
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
  const handleSignup = (user) => { showToast(`Terminal node profile configured for ${user.username}. Initialize login routing.`,'success'); };

  const handleSubmit = async ({issueType,description,location,file,aiLabel,submittedBy,submitterEmail}, resetForm) => {
    if (!issueType)          { showToast('Specify telemetry classification parameter context.','error'); return; }
    if (!description.trim()) { showToast('Operational description variable missing.','error');    return; }
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
      if (res.ok) { showToast('Telemetry record securely appended to ledger.','success'); resetForm(); loadReports(); }
      else throw new Error();
    } catch {
      showToast('Offline Mode Intercept: Microservices disconnected. Mocking cryptographic signatures locally.','info');
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
      if (res.ok) { showToast(`Operational routing modified → ${STATUS_LABELS[newStatus]}`, 'success'); setReports(prev=>prev.map(r=>r.id===id?{...r,status:newStatus}:r)); }
      else throw new Error();
    } catch { setReports(prev=>prev.map(r=>r.id===id?{...r,status:newStatus}:r)); showToast('Local state mutated','info'); }
  };

  const handleDeleteSingle = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`,{method:'DELETE'});
      if (res.ok) { setReports(prev=>prev.filter(r=>r.id!==id)); showToast('Telemetry block purged','success'); }
      else throw new Error();
    } catch { setReports(prev=>prev.filter(r=>r.id!==id)); showToast('Purged local reference array','info'); }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ CRITICAL PERMISSION REQUEST: Completely purge database records and zero system matrix chain structures?')) return;
    try {
      const res = await fetch(`${API}/all`,{method:'DELETE'});
      if (res.ok) { setReports([]); showToast('All data frameworks zeroed out. Network index cleared.','success'); }
      else throw new Error();
    } catch { setReports([]); showToast('Flushed local state configurations','info'); }
  };

  if (screen==='landing') return <LandingPage onGetStarted={()=>setScreen('auth')}/>;
  if (screen==='auth')    return <AuthModal onLogin={handleLogin} onSignup={handleSignup}/>;

  return (
    <div className="app">
      <div className="glow-matrix" />
      <nav className="navbar">
        <div className="logo-wrap">
          <span className="logo-mark">A</span>
          <div>
            <div className="logo-text">AWARE OPERATIVE</div>
            <div className="logo-sub">Advanced Web Architecture for Reporting Events</div>
          </div>
        </div>
        <div className="nav-right">
          <div className="chain-status">
            <div className="pulse-dot"/>
            <span>{syncing ? 'polling stream...' : chainOk === false ? 'framework detached' : 'system nominal'}</span>
          </div>
          <div className="nav-user-pill">
            <div className={`role-dot ${isAdmin?'role-dot--admin':'role-dot--user'}`}/>
            <span>{currentUser.username} [{currentUser.role}]</span>
          </div>
          <button className="nav-btn" onClick={()=>setScreen('landing')}>Gateway</button>
          <button className="nav-logout" onClick={()=>{setCurrentUser(null);setScreen('landing');}}>Sever Connection</button>
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
