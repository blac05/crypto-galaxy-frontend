import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';

const API = process.env.REACT_APP_API_URL || 'https://crypto-galaxy-backend.onrender.com';

// ── Notifications Page ────────────────────────────────────────────────────────
export function Notifications() {
const { notifications, setUnread } = useOutletContext();
React.useEffect(() => { setUnread(0); }, []);

return (

<div>
<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
<h1 className="font-orbitron" style={{ fontSize: 24, marginBottom: 6 }}>🔔 Notifications</h1>
<p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real-time alerts from mission control</p>
</motion.div>

  <div className="glass-card" style={{ padding: 24 }}>
    {notifications.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🛰️</div>
        <p className="font-orbitron" style={{ fontSize: 14, letterSpacing: 1 }}>ALL QUIET IN THE GALAXY</p>
        <p style={{ fontSize: 13, marginTop: 8, fontFamily: 'Share Tech Mono, monospace' }}>Notifications will appear here in real-time</p>
      </div>
    ) : (
      notifications.map((notif, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: i < notifications.length - 1 ? '1px solid var(--glass-border)' : 'none', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 28 }}>
            {notif.type === 'transaction' ? '💸' : notif.type === 'login' ? '🔐' : notif.type === 'security' ? '🛡️' : '🔔'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'white', fontSize: 14, marginBottom: 4 }}>{notif.title || 'Notification'}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{notif.message}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Share Tech Mono, monospace', marginTop: 6 }}>
              {new Date(notif.timestamp || Date.now()).toLocaleString()}
            </div>
          </div>
        </motion.div>
      ))
    )}
  </div>
</div>

);
}

// ── Settings Page ─────────────────────────────────────────────────────────────
export function Settings() {
const { user, token, setUser } = useAuthStore();
const fileInputRef = useRef(null);
const idDocRef = useRef(null);
const selfieRef = useRef(null);

const [notifSettings, setNotifSettings] = useState({
email: true, sms: true, login: true, transaction: true, marketing: false,
});
const [security, setSecurity] = useState({ twoFactor: true, loginAlerts: true });

// Profile state
const [profilePic, setProfilePic] = useState(user?.profilePicture || null);
const [uploadingPic, setUploadingPic] = useState(false);

// ID verification state
const [verifyStep, setVerifyStep] = useState(0); // 0=idle, 1=upload docs, 2=submitted
const [idDoc, setIdDoc] = useState(null);
const [selfie, setSelfie] = useState(null);
const [submittingId, setSubmittingId] = useState(false);
  const [idStatus, setIdStatus] = useState(user?.idVerificationStatus || 'none'); // none, pending, approved, rejected

const verificationColor = {
none: '#888',
pending: '#F3BA2F',
approved: '#00FF87',
rejected: '#FF3131',
};

const verificationLabel = {
none: 'NOT VERIFIED',
pending: '⏳ UNDER REVIEW',
approved: '✅ VERIFIED',
rejected: '❌ REJECTED',
};

// Convert file to base64
const fileToBase64 = (file) => new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onload = () => resolve(reader.result);
reader.onerror = reject;
reader.readAsDataURL(file);
});

// Upload profile picture
const handleProfilePicChange = async (e) => {
const file = e.target.files[0];
if (!file) return;
if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');

setUploadingPic(true);
try {
const base64 = await fileToBase64(file);
const res = await fetch(`${API}/api/user/profile/picture`, {
method: 'PUT',
headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
body: JSON.stringify({ profilePicture: base64 }),
});
const data = await res.json();
if (data.success) {
setProfilePic(base64);
if (setUser) setUser(data.user);
toast.success('Profile picture updated! 🌟');
} else {
toast.error(data.message);
}
} catch {
toast.error('Failed to upload image');
}
setUploadingPic(false);

};

// Handle ID document upload
const handleIdDocChange = async (e) => {
const file = e.target.files[0];
if (!file) return;
if (file.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB');
const base64 = await fileToBase64(file);
setIdDoc(base64);
toast.success('ID document loaded ✓');
};

const handleSelfieChange = async (e) => {
const file = e.target.files[0];
if (!file) return;
if (file.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB');
const base64 = await fileToBase64(file);
setSelfie(base64);
toast.success('Selfie loaded ✓');
};

// Submit ID verification
const handleSubmitVerification = async () => {
if (!idDoc || !selfie) return toast.error('Please upload both your ID and selfie');
setSubmittingId(true);
try {
const res = await fetch(`${API}/api/user/profile/verify-id`, {
method: 'POST',
headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
body: JSON.stringify({ idDocument: idDoc, selfieWithId: selfie }),
});
const data = await res.json();
if (data.success) {
setIdStatus('pending');
setVerifyStep(2);
toast.success('Verification submitted! Under review 🔍');
// Simulate auto-approval for demo
setTimeout(() => {
setIdStatus('approved');
toast.success('🎉 ID Verified! Blue tick unlocked!', { duration: 5000 });
}, 6000);
} else {
toast.error(data.message);
}
} catch {
toast.error('Submission failed. Try again.');
}
setSubmittingId(false);
};

return (

<div>
<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
<h1 className="font-orbitron" style={{ fontSize: 24, marginBottom: 6 }}>⚙️ Settings</h1>
<p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Configure your galaxy account</p>
</motion.div>

  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

```
{/* ── Profile Card ── */}
<div className="glass-card" style={{ padding: 28, gridColumn: '1 / -1' }}>
  <h3 className="font-orbitron" style={{ fontSize: 14, marginBottom: 24, letterSpacing: 1, color: 'var(--star-cyan)' }}>
    👤 PROFILE
  </h3>

  <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
    {/* Avatar with upload */}
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: 96, height: 96, borderRadius: '50%', cursor: 'pointer',
          border: `3px solid ${idStatus === 'approved' ? '#00FF87' : 'rgba(0,245,255,0.4)'}`,
          boxShadow: `0 0 24px ${idStatus === 'approved' ? 'rgba(0,255,135,0.4)' : 'rgba(0,245,255,0.2)'}`,
          overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(135deg, var(--cosmic-blue), var(--nebula-purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {profilePic ? (
          <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 32, color: 'white', fontWeight: 700 }}>
            {user?.firstName?.[0] || 'A'}
          </span>
        )}

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.2s',
          borderRadius: '50%',
        }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
        >
          <span style={{ fontSize: 22 }}>{uploadingPic ? '⏳' : '📷'}</span>
        </div>
      </motion.div>

      {/* Blue verified tick */}
      <AnimatePresence>
        {idStatus === 'approved' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 28, height: 28, borderRadius: '50%',
              background: '#1DA1F2',
              border: '2px solid rgba(8,8,32,1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, boxShadow: '0 0 10px rgba(29,161,242,0.6)',
            }}
          >
            ✓
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePicChange} />
    </div>

    {/* User info */}
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 20, color: 'white', fontWeight: 700, marginBottom: 4 }}>
        {user?.firstName} {user?.lastName}
        {idStatus === 'approved' && (
          <span style={{ marginLeft: 8, fontSize: 16, color: '#1DA1F2' }} title="Verified">✓</span>
        )}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace', marginBottom: 8 }}>
        {user?.email}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {/* Email verified badge */}
        <div style={{ padding: '4px 10px', borderRadius: 6, background: user?.isEmailVerified ? 'rgba(0,255,135,0.1)' : 'rgba(255,49,49,0.1)', border: `1px solid ${user?.isEmailVerified ? 'rgba(0,255,135,0.3)' : 'rgba(255,49,49,0.3)'}`, fontSize: 11, fontFamily: 'Share Tech Mono, monospace', color: user?.isEmailVerified ? '#00FF87' : '#FF3131' }}>
          {user?.isEmailVerified ? '✓ Email Verified' : '✗ Email Unverified'}
        </div>
        {/* Phone verified badge */}
        <div style={{ padding: '4px 10px', borderRadius: 6, background: user?.isPhoneVerified ? 'rgba(0,255,135,0.1)' : 'rgba(255,49,49,0.1)', border: `1px solid ${user?.isPhoneVerified ? 'rgba(0,255,135,0.3)' : 'rgba(255,49,49,0.3)'}`, fontSize: 11, fontFamily: 'Share Tech Mono, monospace', color: user?.isPhoneVerified ? '#00FF87' : '#FF3131' }}>
          {user?.isPhoneVerified ? '✓ Phone Verified' : '✗ Phone Unverified'}
        </div>
        {/* ID verified badge */}
        <div style={{ padding: '4px 10px', borderRadius: 6, background: `${verificationColor[idStatus]}18`, border: `1px solid ${verificationColor[idStatus]}44`, fontSize: 11, fontFamily: 'Share Tech Mono, monospace', color: verificationColor[idStatus] }}>
          {verificationLabel[idStatus]}
        </div>
      </div>
    </div>

    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace', textAlign: 'right' }}>
      Click avatar<br />to change photo
    </div>
  </div>
</div>

{/* ── ID Verification Card ── */}
<div className="glass-card" style={{ padding: 28, gridColumn: '1 / -1' }}>
  <h3 className="font-orbitron" style={{ fontSize: 14, marginBottom: 6, letterSpacing: 1, color: 'var(--star-cyan)' }}>
    🛡️ IDENTITY VERIFICATION
  </h3>
  <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace', marginBottom: 20 }}>
    Verify your identity to unlock the blue tick badge and higher transaction limits.
  </p>

  <AnimatePresence mode="wait">
    {/* Already verified */}
    {idStatus === 'approved' && (
      <motion.div key="approved" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ textAlign: 'center', padding: '32px 0' }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: 64, marginBottom: 12 }}
        >
          ✅
        </motion.div>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, color: '#00FF87', marginBottom: 8 }}>
          IDENTITY VERIFIED
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>
          Your blue verified badge is now active on your profile.
        </div>
      </motion.div>
    )}

    {/* Pending */}
    {idStatus === 'pending' && verifyStep !== 0 && (
      <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>⏳</div>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 16, color: '#F3BA2F', marginBottom: 8 }}>
          VERIFICATION UNDER REVIEW
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>
          Your documents are being reviewed. This usually takes a few minutes.
        </div>
      </motion.div>
    )}

    {/* Not started */}
    {(idStatus === 'none' || idStatus === 'rejected') && verifyStep === 0 && (
      <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[
            { icon: '📋', title: 'Step 1', desc: 'Upload your government-issued ID or passport' },
            { icon: '🤳', title: 'Step 2', desc: 'Take a selfie holding your ID document' },
            { icon: '✅', title: 'Step 3', desc: 'Get verified and earn your blue tick badge' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: 'var(--star-cyan)', marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>{desc}</div>
            </div>
          ))}
        </div>
        {idStatus === 'rejected' && (
          <div style={{ padding: 12, background: 'rgba(255,49,49,0.08)', border: '1px solid rgba(255,49,49,0.3)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: '#FF3131', fontFamily: 'Share Tech Mono, monospace' }}>
            ❌ Your previous verification was rejected. Please resubmit with clearer images.
          </div>
        )}
        <button className="btn-primary" onClick={() => setVerifyStep(1)}>
          🛡️ START VERIFICATION
        </button>
      </motion.div>
    )}

    {/* Upload step */}
    {verifyStep === 1 && (
      <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* ID Document upload */}
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'Orbitron, monospace', letterSpacing: 1 }}>
              ID / PASSPORT PHOTO
            </label>
            <div
              onClick={() => idDocRef.current?.click()}
              style={{
                height: 160, borderRadius: 12, cursor: 'pointer',
                border: `2px dashed ${idDoc ? 'rgba(0,255,135,0.5)' : 'rgba(0,245,255,0.3)'}`,
                background: idDoc ? 'rgba(0,255,135,0.05)' : 'rgba(255,255,255,0.02)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, transition: 'all 0.3s', overflow: 'hidden',
              }}
            >
              {idDoc ? (
                <img src={idDoc} alt="ID" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <span style={{ fontSize: 36 }}>📋</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>
                    Click to upload ID
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Share Tech Mono, monospace' }}>
                    JPG, PNG up to 5MB
                  </span>
                </>
              )}
            </div>
            <input ref={idDocRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleIdDocChange} />
            {idDoc && (
              <button onClick={() => setIdDoc(null)} style={{ background: 'none', border: 'none', color: '#FF3131', cursor: 'pointer', fontSize: 11, fontFamily: 'Share Tech Mono, monospace', marginTop: 4 }}>
                ✕ Remove
              </button>
            )}
          </div>

          {/* Selfie with ID upload */}
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'Orbitron, monospace', letterSpacing: 1 }}>
              SELFIE HOLDING ID
            </label>
            <div
              onClick={() => selfieRef.current?.click()}
              style={{
                height: 160, borderRadius: 12, cursor: 'pointer',
                border: `2px dashed ${selfie ? 'rgba(0,255,135,0.5)' : 'rgba(0,245,255,0.3)'}`,
                background: selfie ? 'rgba(0,255,135,0.05)' : 'rgba(255,255,255,0.02)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, transition: 'all 0.3s', overflow: 'hidden',
              }}
            >
              {selfie ? (
                <img src={selfie} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <span style={{ fontSize: 36 }}>🤳</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>
                    Click to upload selfie
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Share Tech Mono, monospace' }}>
                    Hold your ID next to your face
                  </span>
                </>
              )}
            </div>
            <input ref={selfieRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSelfieChange} />
            {selfie && (
              <button onClick={() => setSelfie(null)} style={{ background: 'none', border: 'none', color: '#FF3131', cursor: 'pointer', fontSize: 11, fontFamily: 'Share Tech Mono, monospace', marginTop: 4 }}>
                ✕ Remove
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: 12, background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.15)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Share Tech Mono, monospace' }}>
          🔒 Your documents are encrypted and stored securely. They are only used for identity verification and never shared with third parties.
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" onClick={() => setVerifyStep(0)} style={{ flex: 1 }}>← BACK</button>
          <motion.button
            className="btn-primary"
            onClick={handleSubmitVerification}
            disabled={submittingId || !idDoc || !selfie}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{ flex: 2, opacity: (!idDoc || !selfie) ? 0.5 : 1 }}
          >
            {submittingId ? '⏳ SUBMITTING...' : '🚀 SUBMIT FOR VERIFICATION'}
          </motion.button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>

{/* ── Notification settings ── */}
<div className="glass-card" style={{ padding: 24 }}>
  <h3 className="font-orbitron" style={{ fontSize: 14, marginBottom: 20, letterSpacing: 1, color: 'var(--star-cyan)' }}>🔔 NOTIFICATIONS</h3>
  {Object.entries(notifSettings).map(([key, val]) => (
    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'white', marginBottom: 2 }}>
          {key === 'email' ? '📧 Email Alerts' : key === 'sms' ? '📱 SMS Alerts' : key === 'login' ? '🔐 Login Alerts' : key === 'transaction' ? '💸 Transaction Alerts' : '📣 Marketing'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {key === 'email' ? 'Receive alerts via email' : key === 'sms' ? 'Receive SMS notifications' : key === 'login' ? 'Alert on new login' : key === 'transaction' ? 'Alert on transactions' : 'Promotional updates'}
        </div>
      </div>
      <div onClick={() => setNotifSettings(p => ({ ...p, [key]: !val }))}
        style={{ width: 48, height: 26, borderRadius: 13, background: val ? 'var(--cosmic-blue)' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'all 0.3s', border: `1px solid ${val ? 'var(--star-cyan)' : 'var(--glass-border)'}` }}>
        <div style={{ position: 'absolute', top: 3, left: val ? 24 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'all 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
      </div>
    </div>
  ))}
</div>

{/* ── Security settings ── */}
<div className="glass-card" style={{ padding: 24 }}>
  <h3 className="font-orbitron" style={{ fontSize: 14, marginBottom: 20, letterSpacing: 1, color: 'var(--star-cyan)' }}>🔐 SECURITY</h3>
  {Object.entries(security).map(([key, val]) => (
    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--glass-border)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'white', marginBottom: 2 }}>
          {key === 'twoFactor' ? '🛡️ Two-Factor Auth' : '🔔 Login Alerts'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {key === 'twoFactor' ? 'Require OTP on login' : 'Notify on new device login'}
        </div>
      </div>
      <div onClick={() => setSecurity(p => ({ ...p, [key]: !val }))}
        style={{ width: 48, height: 26, borderRadius: 13, background: val ? 'var(--cosmic-blue)' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'all 0.3s', border: `1px solid ${val ? 'var(--star-cyan)' : 'var(--glass-border)'}` }}>
        <div style={{ position: 'absolute', top: 3, left: val ? 24 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'all 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
      </div>
    </div>
  ))}
  <div style={{ marginTop: 20 }}>
    <button className="btn-secondary" style={{ width: '100%', marginBottom: 10 }}>🔑 Change Password</button>
    <button className="btn-secondary" style={{ width: '100%', color: 'var(--danger-red)', borderColor: 'var(--danger-red)' }}>🗑️ Delete Account</button>
  </div>
</div>

{/* ── App info ── */}
<div className="glass-card" style={{ padding: 24, gridColumn: '1 / -1' }}>
  <h3 className="font-orbitron" style={{ fontSize: 14, marginBottom: 16, letterSpacing: 1, color: 'var(--star-cyan)' }}>ℹ️ APP INFO</h3>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
    {[
      { label: 'Version',  value: 'v1.1.0' },
      { label: 'Network',  value: 'Mainnet' },
      { label: 'Security', value: '256-bit AES' },
      { label: 'Status',   value: '🟢 All Systems Go' },
    ].map(({ label, value }) => (
      <div key={label} style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Orbitron, monospace', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
        <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 14, color: 'white' }}>{value}</div>
      </div>
    ))}
  </div>
</div>
```

  </div>
</div>

);
}