import React, { useState } from 'react';
import { Upload, Lock, Unlock, ShieldAlert, Image as ImageIcon, Activity, Cpu, ArrowRight, Download, BarChart2 } from 'lucide-react';
import './index.css';

function App() {
  const [mode, setMode] = useState('embed');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [secret, setSecret] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setResultImage(null);
      setMetrics(null);
      setExtractedText('');
    }
  };

  const processEmbed = async () => {
    if (!file || !secret || !password) {
      setError('Please provide image, secret, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long for AES encryption.');
      return;
    }
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('secret', secret);
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE_URL}/api/embed`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setResultImage(data.image);
      setMetrics(data.metrics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processExtract = async () => {
    if (!file || !password) {
      setError('Please provide stego image and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long for AES decryption.');
      return;
    }
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('stegoImage', file);
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE_URL}/api/extract`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setExtractedText(data.secret);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <header className="topbar">
        <div className="logo">
          <ShieldAlert size={28} />
          <span style={{color: '#fff', letterSpacing: '1px'}}>HYBRID STEGANOGRAPHY USING AES-256, REED-SOLOMON, AND LSB</span>
        </div>
        <div style={{color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 'bold'}}>
          Advanced IQA Dashboard • Final Year SDP Project
        </div>
      </header>

      <main className="main-content">
        <div className="left-panel panel">
          <div className="tabs">
            <button className={`tab-btn ${mode === 'embed' ? 'active' : ''}`} onClick={() => {setMode('embed'); setFile(null); setPreview(null); setPassword('');}}>
              Encode Secret
            </button>
            <button className={`tab-btn ${mode === 'extract' ? 'active' : ''}`} onClick={() => {setMode('extract'); setFile(null); setPreview(null); setPassword('');}}>
              Decode Stego
            </button>
          </div>

          <div 
            className="file-drop" 
            onDragOver={(e) => e.preventDefault()} 
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input type="file" id="fileInput" hidden onChange={handleDrop} accept="image/*" />
            <Upload size={40} style={{margin: '0 auto 1rem', color: 'var(--primary)'}}/>
            <h3>{preview ? 'Change Image' : 'Drop Image Here'}</h3>
            <p style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>PNG or JPG (Max 5MB)</p>
          </div>

          {mode === 'embed' && (
            <div className="input-group">
              <label>Secret Payload (Text)</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Enter highly classified data..."
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label>Cryptographic Seed (AES-256 Password)</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter encryption seed..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div style={{color: '#ef4444', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '4px'}}>{error}</div>}

          <button 
            className="btn-primary" 
            onClick={mode === 'embed' ? processEmbed : processExtract}
            disabled={loading}
          >
            {loading ? <Activity className="animate-spin" /> : (mode === 'embed' ? <Lock size={20} /> : <Unlock size={20} />)}
            {loading ? 'Processing Pipeline...' : (mode === 'embed' ? 'Execute Embedding Pipeline' : 'Run Extraction & Decryption')}
          </button>
        </div>

        <div className="right-panel panel">
          <h2 style={{fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <BarChart2 size={24} color="var(--primary)"/> 
            {mode === 'embed' ? 'Image Quality Assessment (IQA)' : 'Extraction Results'}
          </h2>

          {mode === 'embed' ? (
            <>
              {/* Architecture Vis */}
              <div className="arch-flow">
                <div className="arch-node">
                  <div className="arch-icon"><Lock size={24} /></div>
                  <span>AES-256</span>
                </div>
                <ArrowRight size={20} color="var(--text-muted)"/>
                <div className="arch-node">
                  <div className="arch-icon"><ShieldAlert size={24} /></div>
                  <span>Reed-Solomon (EC)</span>
                </div>
                <ArrowRight size={20} color="var(--text-muted)"/>
                <div className="arch-node">
                  <div className="arch-icon"><Cpu size={24} /></div>
                  <span>PRNG Spatial Scatter</span>
                </div>
                <ArrowRight size={20} color="var(--text-muted)"/>
                <div className="arch-node">
                  <div className="arch-icon"><ImageIcon size={24} /></div>
                  <span>Stego Output</span>
                </div>
              </div>

              {metrics && (
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-label">PSNR (Peak Signal/Noise)</div>
                    <div className="metric-value">{metrics.psnr} dB</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem'}}>&gt; 40dB is mathematically invisible</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">SSIM (Structural Similarity)</div>
                    <div className="metric-value">{(metrics.ssim * 100).toFixed(2)}%</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem'}}>&gt; 99% indicates structural identity</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">MSE (Mean Squared Error)</div>
                    <div className="metric-value">{metrics.mse}</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem'}}>&lt; 1.0 means negligible variance</div>
                  </div>
                </div>
              )}

              {(preview || resultImage) && (
                <div className="image-viewer">
                  {preview && (
                    <div className="image-pane">
                      <div className="image-label">Original Cover Image</div>
                      <img src={preview} alt="Cover" />
                    </div>
                  )}
                  {resultImage && (
                    <div className="image-pane">
                      <div className="image-label" style={{background: 'var(--primary)'}}>Stego Output Generated</div>
                      <img src={resultImage} alt="Stego" />
                      <a href={resultImage} download="stego.png" style={{position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none'}}>
                        <Download size={16}/> Download
                      </a>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%'}}>
              {preview && (
                <div className="image-pane" style={{height: '200px', flex: 'none'}}>
                  <div className="image-label">Uploaded Stego Image</div>
                  <img src={preview} alt="Stego Uploaded" />
                </div>
              )}
              <div style={{flex: 1, background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border)', padding: '1.5rem'}}>
                <h3 style={{color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', textTransform: 'uppercase'}}>Decrypted Payload:</h3>
                {extractedText ? (
                  <div style={{fontSize: '1.25rem', color: 'var(--success)', wordBreak: 'break-all'}}>
                    {extractedText}
                  </div>
                ) : (
                  <div style={{color: 'var(--border)', fontStyle: 'italic'}}>
                    Awaiting extraction pipeline...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
