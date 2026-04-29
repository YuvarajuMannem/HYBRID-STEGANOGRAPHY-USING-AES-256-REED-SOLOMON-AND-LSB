import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Unlock, Upload, Download, Shield, Zap } from 'lucide-react';

function App() {
  const [mode, setMode] = useState('embed'); // 'embed' or 'extract'
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [secret, setSecret] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageDrop = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setImage(null);
    setPreview(null);
    setSecret('');
    setPassword('');
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!image || !password) {
      setError('Please provide image and password');
      return;
    }
    if (mode === 'embed' && !secret) {
      setError('Please enter secret message');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append(mode === 'embed' ? 'image' : 'stegoImage', image);
    formData.append('password', password);
    if (mode === 'embed') formData.append('secret', secret);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${API_URL}/api/${mode}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <Shield size={40} color="#6366f1" />
          <h1 style={styles.title}>Hybrid Steganography</h1>
          <p style={styles.subtitle}>AES-256 + Reed-Solomon + LSB System</p>
        </div>

        {/* Mode Toggle */}
        <div style={styles.toggleContainer}>
          <button
            onClick={() => handleModeSwitch('embed')}
            style={{
              ...styles.toggleButton,
              backgroundColor: mode === 'embed' ? '#6366f1' : '#1e293b',
            }}
          >
            <Lock size={18} /> Hide Data
          </button>
          <button
            onClick={() => handleModeSwitch('extract')}
            style={{
              ...styles.toggleButton,
              backgroundColor: mode === 'extract' ? '#6366f1' : '#1e293b',
            }}
          >
            <Unlock size={18} /> Extract Data
          </button>
        </div>

        {/* Image Upload */}
        <div style={styles.uploadArea}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageDrop}
            style={{ display: 'none' }}
            id="imageUpload"
          />
          <label htmlFor="imageUpload" style={styles.uploadLabel}>
            {preview ? (
              <img src={preview} alt="Preview" style={styles.preview} />
            ) : (
              <div style={styles.uploadPlaceholder}>
                <Upload size={48} color="#64748b" />
                <p>Click to upload {mode === 'embed' ? 'cover' : 'stego'} image</p>
              </div>
            )}
          </label>
        </div>

        {/* Secret Input (Embed mode only) */}
        {mode === 'embed' && (
          <textarea
            placeholder="Enter your secret message..."
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            style={styles.textarea}
            rows={4}
          />
        )}

        {/* Password Input */}
        <input
          type="password"
          placeholder="Enter encryption password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...styles.submitButton,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            'Processing...'
          ) : mode === 'embed' ? (
            <><Lock size={18} /> Hide Secret</>
          ) : (
            <><Unlock size={18} /> Extract Secret</>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && mode === 'embed' && (
          <div style={styles.resultBox}>
            <h3>✅ Data Hidden Successfully!</h3>
            {result.image && (
              <img src={result.image} alt="Stego" style={styles.resultImage} />
            )}
            <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${result.downloadUrl}`} download>
              <button style={styles.downloadButton}>
                <Download size={18} /> Download Stego Image
              </button>
            </a>
          </div>
        )}

        {result && mode === 'extract' && (
          <div style={styles.resultBox}>
            <h3>✅ Secret Extracted!</h3>
            <div style={styles.secretDisplay}>
              <strong>Hidden Message:</strong>
              <p>{result.secret}</p>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div style={styles.footer}>
          <Zap size={16} color="#6366f1" />
          <span>Zero Error Guarantee | AES-256 + Reed-Solomon + LSB</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    color: '#f1f5f9',
    fontSize: '28px',
    margin: '10px 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
  },
  toggleContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  toggleButton: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  uploadArea: {
    marginBottom: '20px',
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'block',
  },
  preview: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  uploadPlaceholder: {
    border: '2px dashed #475569',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    color: '#64748b',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    fontSize: '14px',
    marginBottom: '20px',
    resize: 'vertical',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #475569',
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    fontSize: '14px',
    marginBottom: '20px',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    color: '#fca5a5',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  resultBox: {
    backgroundColor: '#14532d',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    color: '#bbf7d0',
  },
  resultImage: {
    width: '100%',
    borderRadius: '8px',
    margin: '10px 0',
  },
  downloadButton: {
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px',
  },
  secretDisplay: {
    backgroundColor: '#0f172a',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '10px',
    color: '#f1f5f9',
  },
  footer: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '20px',
  },
};

export default App;
