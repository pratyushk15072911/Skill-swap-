import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import Markdown from 'react-markdown';
import { SelfieSegmentation, Results } from '@mediapipe/selfie_segmentation';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { 
  GraduationCap, Volume2, Star, LogOut, Coffee, 
  MessageSquare, Send, Plus, Video, BrainCircuit, 
  Image as ImageIcon, Upload, Loader2, X, ArrowRight,
  Search, UserPlus, Check, User, History, Users, ExternalLink,
  Mic, MicOff, VideoOff, MonitorUp, PenTool, Eraser, Camera, Presentation,
  Clock, Timer, Bell, Globe
} from 'lucide-react';
import { cn } from './lib/utils';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, setDoc, getDoc, getDocs, 
  limit, where, updateDoc, deleteDoc, arrayUnion, arrayRemove,
  storage, ref, uploadBytes, getDownloadURL
} from './firebase';

// --- Types ---
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

type Message = {
  role: 'user' | 'ai';
  text: string;
};

// --- Helper for Base64 ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Hooks ---

const useApiKey = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  return { hasApiKey, handleSelectKey, setHasApiKey };
};

// --- Components ---

const Starfield = () => {
  return (
    <div className="starfield">
      {[...Array(100)].map((_, i) => (
        <div 
          key={i} 
          className="star" 
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3}px`,
            height: `${Math.random() * 3}px`,
            '--duration': `${2 + Math.random() * 4}s`
          } as any}
        />
      ))}
    </div>
  );
};

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <Starfield />
      
      {/* Warm Ambient Glows for Cozy Feel */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative mb-12 flex flex-col items-center"
      >
        <div className="relative">
          <div className="nexus-sphere w-32 h-32 border-cyan-500/20">
            <GraduationCap className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border border-dashed border-cyan-500/20 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 border border-dotted border-purple-500/20 rounded-full"
          />
          
          {/* Cozy Floating Icons */}
          <motion.div 
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 p-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl shadow-xl"
          >
            <Coffee className="w-5 h-5 text-amber-400" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-6 -left-6 p-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl shadow-xl"
          >
            <BrainCircuit className="w-5 h-5 text-purple-400" />
          </motion.div>
        </div>
      </motion.div>

      <div className="text-center relative z-10">
        <motion.h1 
          initial={{ letterSpacing: "15px", opacity: 0, filter: "blur(10px)" }}
          animate={{ letterSpacing: "4px", opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-6xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400 glitch-text"
        >
          SKILL SWAP
        </motion.h1>
        
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-72 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-50" />
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col items-center max-w-lg"
          >
            <p className="text-cyan-400/80 font-cursive text-3xl mb-6 leading-relaxed">
              "Knowledge is the only asset that grows when shared."
            </p>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 tracking-[0.5em] uppercase">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                Synchronizing Study Environment
              </div>
              <div className="text-[8px] text-slate-600 font-mono uppercase tracking-widest">
                Protocol v3.1.4 // Neural Link Stable
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="neural-tide opacity-10" />
    </div>
  );
};

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          username: result.user.email?.split('@')[0] || result.user.uid.slice(0, 8),
          bio: 'I am a student eager to learn and teach!',
          portfolioUrl: '',
          learningPreference: 'visual',
          availability: '',
          skills: [],
          skillsToLearn: [],
          certificates: [],
          karma: 0,
          sessionCount: 0,
          connections: [],
          isOnline: true,
          lastSeen: serverTimestamp()
        });
      } else {
        await updateDoc(userRef, { isOnline: true, lastSeen: serverTimestamp() }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${result.user.uid}`));
      }
    } catch (error) {
      console.error(error);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30 selection:text-cyan-100 overflow-hidden relative">
      <Starfield />
      
      <div className="relative mb-12">
        <div className="nexus-sphere">
          <GraduationCap className="w-24 h-24 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />
        </div>
        <div className="absolute -inset-4 bg-cyan-500/10 blur-3xl rounded-full -z-10" />
      </div>

      <div className="glass-panel border-beam p-12 max-w-md w-full text-center ambient-glow relative z-10">
        <h1 className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400 tech-hover inline-block">
          SKILL SWAP
        </h1>
        <p className="text-slate-400 mb-10 font-medium tracking-wide">
          <span className="text-cyan-400/80">SYSTEM STATUS:</span> ONLINE
          <br />
          Experience the convergence of knowledge and peer-to-peer learning.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 px-8 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group border border-cyan-400/30"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center p-1">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-full h-full" />
              </div>
              INITIALIZE SESSION
            </>
          )}
        </button>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
          <blockquote className="text-xl font-medium text-slate-400 border-l-2 border-cyan-500/30 pl-4 py-1 text-left font-cursive">
            "Knowledge is the only asset that grows when shared."
            <footer className="text-[10px] text-cyan-400/40 mt-1 font-bold tracking-widest uppercase font-sans">— Skill Swap Protocol</footer>
          </blockquote>
          <div className="flex justify-center gap-6 text-xs font-bold text-slate-500 tracking-widest uppercase">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Simulation</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Network</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Protocol</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 font-mono text-[10px] text-slate-600 tracking-widest uppercase">
        v.0.25.04.2026
      </div>
    </div>
  );
};


const ProfileSkeleton = () => (
  <div className="w-full max-w-4xl glass-panel border border-white/5 p-8 ambient-glow animate-pulse">
    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
      <div className="h-10 w-48 bg-slate-800 rounded-lg" />
      <div className="h-10 w-32 bg-slate-800 rounded-lg" />
    </div>
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-40 h-40 rounded-full bg-slate-800" />
        <div className="h-6 w-32 bg-slate-800 rounded-lg" />
        <div className="h-4 w-24 bg-slate-800 rounded-lg" />
      </div>
      <div className="flex-1 flex flex-col gap-6">
        <div className="h-6 w-24 bg-slate-800 rounded-lg" />
        <div className="h-24 w-full bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-16 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="w-full max-w-5xl flex flex-col gap-8 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="h-48 bg-slate-800/40 rounded-2xl border border-white/5" />
      <div className="h-48 bg-slate-800/40 rounded-2xl border border-white/5" />
    </div>
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 bg-slate-800/40 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-bold text-slate-300">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-44 bg-slate-800/40 rounded-2xl border border-white/5" />
        ))}
      </div>
    </div>
  </div>
);


const ProfilePage = ({ user, showToast }: { user: any, showToast: any }) => {
  const [userData, loading] = useDocumentData(doc(db, 'users', user.uid));
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [learningPreference, setLearningPreference] = useState<'visual' | 'auditory' | 'kinesthetic'>('visual');
  const [availability, setAvailability] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Beginner');
  const [uploading, setUploading] = useState(false);

  // Dedicated User Settings State (linked to user Auth UID)
  const [settings, setSettings] = useState({
    theme_preference: 'dark',
    email_notifications: true,
    profile_visibility: 'public',
    custom_turn: '',
    custom_turn_username: '',
    custom_turn_credential: ''
  });
  const [isCustomTurnEditing, setIsCustomTurnEditing] = useState(false);

  const settingsRef = doc(db, 'user_settings', user.uid);
  const [settingsData] = useDocumentData(settingsRef);

  useEffect(() => {
    if (settingsData) {
      setSettings({
        theme_preference: settingsData.theme_preference ?? 'dark',
        email_notifications: settingsData.email_notifications ?? true,
        profile_visibility: settingsData.profile_visibility ?? 'public',
        custom_turn: settingsData.custom_turn ?? '',
        custom_turn_username: settingsData.custom_turn_username ?? '',
        custom_turn_credential: settingsData.custom_turn_credential ?? ''
      });
    }
  }, [settingsData]);

  const updateSettingOptimistic = async (key: string, value: any) => {
    const previousValue = (settings as any)[key];
    
    // Update local state immediately (Optimistic UI)
    setSettings(prev => ({ ...prev, [key]: value }));
    
    try {
      await setDoc(settingsRef, { [key]: value }, { merge: true });
      showToast(`${key.replace('_', ' ')} updated successfully!`, "success");
    } catch (err) {
      console.error("Failed to save setting:", err);
      // Revert if write fails
      setSettings(prev => ({ ...prev, [key]: previousValue }));
      showToast("Sync failure. Reverted changes.", "error");
    }
  };

  useEffect(() => {
    if (userData) {
      setBio(userData.bio || '');
      setUsername(userData.username || '');
      setPortfolioUrl(userData.portfolioUrl || (user.email === '930pratyushkumarkv42021@gmail.com' ? 'https://portfolio-showcase--pratyushk1507.replit.app/' : ''));
      setLearningPreference(userData.learningPreference || 'visual');
      setAvailability(userData.availability || (user.email === '930pratyushkumarkv42021@gmail.com' ? '10pm - 1am' : ''));

      // Automatically sync requested profile for this user if empty
      if (user.email === '930pratyushkumarkv42021@gmail.com' && (!userData.portfolioUrl || !userData.availability)) {
        updateDoc(doc(db, 'users', user.uid), {
          portfolioUrl: userData.portfolioUrl || 'https://portfolio-showcase--pratyushk1507.replit.app/',
          availability: userData.availability || '10pm - 1am',
          learningPreference: userData.learningPreference || 'visual'
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
      }
    }
  }, [userData, user.email, user.uid]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      showToast("Profile image updated!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      showToast("Failed to upload image.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), { 
         bio, 
         username,
         portfolioUrl,
         learningPreference,
         availability
      });
      setIsEditing(false);
      showToast("Profile details saved successfully!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      showToast("Error updating profile.", "error");
    }
  };

  const addSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        skills: arrayUnion({ name: newSkillName.trim(), level: newSkillLevel })
      });
      setNewSkillName('');
      showToast("Skill added successfully!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const removeSkill = async (skillObj: any) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        skills: arrayRemove(skillObj)
      });
      showToast(`Removed skill: ${skillObj.name}`, "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="w-full max-w-4xl glass-panel border-beam p-8 ambient-glow scroll-fade">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h2 className="text-4xl font-bold tracking-tight text-slate-200 tech-hover inline-block">My Profile</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 px-6 py-2 rounded-lg font-semibold hover:bg-cyan-500/30 transition-all ambient-glow">
            Edit Profile
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-40 h-40 rounded-full border border-white/10 bg-slate-800 overflow-hidden relative group shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <img src={userData?.photoURL || user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            )}
            {!uploading && (
              <label className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Upload className="text-cyan-400 w-8 h-8" />
                <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
              </label>
            )}
          </div>
          <div className="text-center">
            <h3 className="font-bold text-2xl text-slate-200">@{userData?.username}</h3>
            <p className="font-medium text-slate-400">{userData?.displayName}</p>
          </div>
        </div>

          <div className="flex-1 flex flex-col gap-4">
            <h4 className="font-semibold uppercase tracking-widest text-sm text-slate-400">About Me</h4>
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Username</label>
                    <input 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      className="bg-slate-800/50 border border-white/10 rounded-lg p-3 font-medium text-slate-200 focus:outline-none focus:border-cyan-500" 
                      placeholder="Username" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Portfolio Link</label>
                    <input 
                      value={portfolioUrl} 
                      onChange={e => setPortfolioUrl(e.target.value)} 
                      className="bg-slate-800/50 border border-white/10 rounded-lg p-3 font-medium text-slate-200 focus:outline-none focus:border-cyan-500" 
                      placeholder="https://portfolio.com" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Learning Preference</label>
                    <select 
                      value={learningPreference} 
                      onChange={e => setLearningPreference(e.target.value as any)} 
                      className="bg-slate-800/50 border border-white/10 rounded-lg p-3 font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="kinesthetic">Kinesthetic</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Availability</label>
                    <input 
                      value={availability} 
                      onChange={e => setAvailability(e.target.value)} 
                      className="bg-slate-800/50 border border-white/10 rounded-lg p-3 font-medium text-slate-200 focus:outline-none focus:border-cyan-500" 
                      placeholder="e.g. Mon-Fri, 6pm-9pm" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bio</label>
                  <textarea 
                    value={bio} 
                    onChange={e => setBio(e.target.value)} 
                    className="bg-slate-800/50 border border-white/10 rounded-lg p-3 font-medium h-32 text-slate-200 focus:outline-none focus:border-cyan-500" 
                    placeholder="Write a short paragraph about yourself..." 
                  />
                </div>
                
                <button onClick={handleSave} className="bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 p-3 rounded-lg font-semibold hover:bg-cyan-500/30 transition-all self-start px-8 ambient-glow">
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="glass-panel border border-white/10 p-6 rounded-xl">
                  <p className="font-medium text-lg whitespace-pre-wrap text-slate-300">{userData?.bio || "No bio added yet."}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Portfolio</span>
                    {userData?.portfolioUrl ? (
                      <a href={userData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate font-semibold">
                        Link
                      </a>
                    ) : <span className="text-slate-400 font-semibold">Not set</span>}
                  </div>
                  <div className="glass-panel border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Learning Style</span>
                    <span className="text-slate-200 font-semibold capitalize">{userData?.learningPreference || "Not set"}</span>
                  </div>
                  <div className="glass-panel border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Availability</span>
                    <span className="text-slate-200 font-semibold truncate">{userData?.availability || "Not set"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-white/10">
        <h3 className="text-2xl font-bold tracking-tight mb-6 text-slate-200">Skills & Proficiency</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {userData?.skills?.map((skill: any, idx: number) => (
            <div key={idx} className="glass-panel border border-white/10 p-4 rounded-xl flex items-center justify-between group">
              <div className="flex flex-col">
                <span className="font-bold text-slate-200">{skill.name}</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  skill.level === 'Expert' ? "text-purple-400" :
                  skill.level === 'Advanced' ? "text-cyan-400" :
                  skill.level === 'Intermediate' ? "text-blue-400" : "text-slate-400"
                )}>
                  {skill.level}
                </span>
              </div>
              <button onClick={() => removeSkill(skill)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!userData?.skills || userData.skills.length === 0) && (
            <div className="col-span-full py-8 text-center text-slate-500 font-semibold border-2 border-dashed border-white/5 rounded-xl">
              No skills added yet.
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl bg-slate-900/50 p-6 rounded-2xl border border-white/5">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Skill Name</label>
            <input 
              value={newSkillName} 
              onChange={e => setNewSkillName(e.target.value)} 
              className="bg-slate-800/50 border border-white/10 rounded-lg p-3 font-medium text-slate-200 focus:outline-none focus:border-cyan-500" 
              placeholder="e.g. React, Python" 
            />
          </div>
          <div className="w-full sm:w-40 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Level</label>
            <select 
              value={newSkillLevel} 
              onChange={e => setNewSkillLevel(e.target.value as any)} 
              className="bg-slate-800/50 border border-white/10 rounded-lg p-3 font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <button onClick={addSkill} className="sm:self-end bg-purple-600/20 border border-purple-500/30 text-purple-300 p-3 rounded-lg font-semibold px-8 hover:bg-purple-500/30 transition-all ambient-glow">
            Add Skill
          </button>
        </div>
      </div>

      {/* Account Settings Dashboard (Section 3 of User Request) */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <h3 className="text-2xl font-bold tracking-tight mb-6 text-slate-200">Account Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Theme Preference Settings */}
          <div className="glass-panel border border-white/10 p-6 rounded-2xl flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400">
                <Camera className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Theme Atmosphere</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">Customize the aesthetic experience of your swapping workspace.</p>
            </div>
             <select
              value={settings.theme_preference}
              onChange={(e) => updateSettingOptimistic('theme_preference', e.target.value)}
              className="bg-slate-900/80 border border-white/10 text-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-cyan-500 w-full font-semibold"
            >
              <option value="dark">🌌 Cosmic Slate (Default)</option>
              <option value="amber">🔥 Warm Amber Eclipse</option>
              <option value="purple">🔮 Quantum Indigo Nebula</option>
              <option value="emerald">💚 Emerald Aurora</option>
              <option value="cyberpunk">⚡ Neon Cyberpunk Grid</option>
              <option value="vaporwave">✨ Vaporwave Sunset Dream</option>
              <option value="crimson">💥 Obsidian Crimson Fire</option>
            </select>
          </div>

          {/* Email Notification Settings with Switch Toggle */}
          <div className="glass-panel border border-white/10 p-6 rounded-2xl flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-400">
                <Bell className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Email Alerts</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">Get notified about connections and community session activities.</p>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enable Notifs</span>
              <button
                onClick={() => updateSettingOptimistic('email_notifications', !settings.email_notifications)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none w-11 h-6",
                  settings.email_notifications ? "bg-cyan-500" : "bg-slate-800"
                )}
                title="Toggle Email Notifications"
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out",
                    settings.email_notifications ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Profile Visibility Privacy Option */}
          <div className="glass-panel border border-white/10 p-6 rounded-2xl flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400">
                <User className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Profile Privacy</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">Control who can discover your teaching skills and contact info.</p>
            </div>
            <select
              value={settings.profile_visibility}
              onChange={(e) => updateSettingOptimistic('profile_visibility', e.target.value)}
              className="bg-slate-900/80 border border-white/10 text-slate-200 p-2.5 rounded-lg text-sm focus:outline-none focus:border-cyan-500 w-full font-semibold"
            >
              <option value="public">Fully Discoverable (Public)</option>
              <option value="connections">Verified Connections Only</option>
              <option value="private">Restricted (Incognito)</option>
            </select>
          </div>

          {/* Custom TURN Configuration block */}
          <div className="glass-panel border border-white/10 p-6 rounded-2xl flex flex-col gap-4 md:col-span-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-cyan-400">
                <Globe className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Advanced P2P TURN Config</span>
              </div>
              <button 
                onClick={() => setIsCustomTurnEditing(!isCustomTurnEditing)}
                className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:scale-105 transition-transform"
                title="Configure custom TURN relaying"
              >
                {isCustomTurnEditing ? "[ Save ]" : "[ Configure Relay ]"}
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium">Bypass strict firewalls and network traps on university or restricted office Wi-Fi by providing your TURN server relay credentials below.</p>
            {isCustomTurnEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TURN Server URL</label>
                  <input
                    value={settings.custom_turn}
                    onChange={(e) => setSettings(prev => ({ ...prev, custom_turn: e.target.value }))}
                    onBlur={() => updateSettingOptimistic('custom_turn', settings.custom_turn)}
                    placeholder="e.g. turn:your-turn-relay.com:3478"
                    className="bg-slate-900/80 border border-white/10 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TURN Username</label>
                  <input
                    value={settings.custom_turn_username}
                    onChange={(e) => setSettings(prev => ({ ...prev, custom_turn_username: e.target.value }))}
                    onBlur={() => updateSettingOptimistic('custom_turn_username', settings.custom_turn_username)}
                    placeholder="turn-username"
                    className="bg-slate-900/80 border border-white/10 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TURN Token/Password</label>
                  <input
                    type="password"
                    value={settings.custom_turn_credential}
                    onChange={(e) => setSettings(prev => ({ ...prev, custom_turn_credential: e.target.value }))}
                    onBlur={() => updateSettingOptimistic('custom_turn_credential', settings.custom_turn_credential)}
                    placeholder="Relay Credential"
                    className="bg-slate-900/80 border border-white/10 text-slate-200 text-xs p-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ) : (
              settings.custom_turn ? (
                <div className="text-xs bg-cyan-950/20 text-cyan-300 px-4 py-2 border border-cyan-500/15 rounded-lg font-mono">
                  Active Custom Relay: {settings.custom_turn}
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-500">Google STUN server P2P direct routing active (Default)</span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExplorePage = ({ user, showToast, onJoinRoom }: { user: any, showToast: any, onJoinRoom?: (roomId: string) => void }) => {
  const [exploreTab, setExploreTab] = useState<'posts' | 'members'>('posts');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Filter conditions for Posts
  const [postsSearch, setPostsSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  // Fetch pending connection requests sent TO the current user
  const [requestsSnap] = useCollection(
    query(collection(db, 'connectionRequests'), where('toUid', '==', user.uid), where('status', '==', 'pending'))
  );

  // Fetch Posts from Firebase with useCollection
  const [postsSnap] = useCollection(
    query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  );

  const posts = postsSnap?.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  })) || [];

  // Extract unique languages present in actual database posts to ensure dynamic fit
  const uniqueLanguages = Array.from(new Set(
    posts
      .map((p: any) => p.language?.trim())
      .filter((lang): lang is string => typeof lang === 'string' && lang !== '')
  )).sort();

  const commonLanguages = ["English", "Hindi", "Spanish", "French", "German", "Chinese", "Japanese"];
  const dynamicLanguages = uniqueLanguages.filter(lang => !commonLanguages.includes(lang));
  const allLangOptions = [...commonLanguages, ...dynamicLanguages];

  // Filter posts based on difficulty level, language, and custom keyword
  const filteredPosts = posts.filter((post: any) => {
    // 1. Level Filter
    if (selectedLevel !== 'All' && post.level !== selectedLevel) {
      return false;
    }

    // 2. Language Filter
    if (selectedLanguage !== 'All') {
      const match = post.language?.trim().toLowerCase() === selectedLanguage.trim().toLowerCase();
      if (!match) return false;
    }

    // 3. Keyword / Search Term Filter
    if (postsSearch.trim() !== '') {
      const q = postsSearch.toLowerCase().trim();
      const skillMatch = post.skill?.toLowerCase().includes(q);
      const descMatch = post.description?.toLowerCase().includes(q);
      const authorMatch = post.authorName?.toLowerCase().includes(q);
      if (!skillMatch && !descMatch && !authorMatch) {
        return false;
      }
    }

    return true;
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      // Simple prefix search on username
      const q = query(
        collection(db, 'users'), 
        where('username', '>=', search.trim()), 
        where('username', '<=', search.trim() + '\uf8ff'),
        limit(10)
      );
      const snap = await getDocs(q);
      // Sort by sessionCount to boost active users (AI recommendation simulation)
      const results = snap.docs
        .map(d => d.data())
        .filter(u => u.uid !== user.uid)
        .sort((a, b) => (b.sessionCount || 0) - (a.sessionCount || 0));
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (toUid: string) => {
    try {
      await addDoc(collection(db, 'connectionRequests'), {
        fromUid: user.uid,
        fromName: user.displayName,
        toUid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      showToast('Connection request sent!', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'connectionRequests');
    }
  };

  const handleRequest = async (docId: string, fromUid: string, action: 'accepted' | 'declined') => {
    try {
      await updateDoc(doc(db, 'connectionRequests', docId), { status: action });
      if (action === 'accepted') {
        await updateDoc(doc(db, 'users', user.uid), { connections: arrayUnion(fromUid) });
        await updateDoc(doc(db, 'users', fromUid), { connections: arrayUnion(user.uid) });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `connectionRequests/${docId} or users/${user.uid} or users/${fromUid}`);
    }
  };

  const joinPostRoom = async (postId: string, authorUid: string) => {
    if (!onJoinRoom) {
      showToast("Room controller is unavailable right now.", "error");
      return;
    }
    const roomRef = doc(db, 'rooms', postId);
    try {
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        await setDoc(roomRef, {
          roomId: postId,
          hostId: authorUid,
          participants: [user.uid],
          createdAt: serverTimestamp(),
          isActive: true
        });
      }
      onJoinRoom(postId);
    } catch (err) {
      console.error("Failed to join post room on Explore page:", err);
      showToast("Could not join study room.", "error");
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8">
      {/* Connection Requests */}
      {requestsSnap && requestsSnap.docs.length > 0 && (
        <div className="glass-panel border-beam p-6 ambient-glow scroll-fade">
          <h3 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2 text-slate-200">
            <Users className="w-6 h-6 text-purple-400" /> Pending Requests
          </h3>
          <div className="flex flex-col gap-4">
            {requestsSnap.docs.map(docSnap => {
              const req = docSnap.data();
              return (
                <div key={docSnap.id} className="glass-panel border border-white/10 p-4 flex items-center justify-between">
                  <span className="font-semibold text-lg text-slate-300">{req.fromName} wants to connect!</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleRequest(docSnap.id, req.fromUid, 'accepted')} className="bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 px-4 py-2 rounded-lg font-semibold hover:bg-cyan-500/30 transition-all ambient-glow">Accept</button>
                    <button onClick={() => handleRequest(docSnap.id, req.fromUid, 'declined')} className="bg-slate-800/50 text-slate-300 border border-white/10 px-4 py-2 rounded-lg font-semibold hover:bg-slate-700/50 transition-all">Decline</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Explore Workspace Card */}
      <div className="glass-panel border-beam p-8 ambient-glow scroll-fade" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-200 tech-hover inline-block">Explore Network</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Discover study bulletins, level-based help requests, or search users.</p>
          </div>
          
          {/* Sub-navigation tabs switch */}
          <div className="flex bg-slate-900/60 p-1 border border-white/10 rounded-xl max-w-xs md:max-w-md">
            <button
              onClick={() => setExploreTab('posts')}
              className={cn(
                "flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                exploreTab === 'posts'
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Bulletins
            </button>
            <button
              onClick={() => setExploreTab('members')}
              className={cn(
                "flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                exploreTab === 'members'
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Members
            </button>
          </div>
        </div>

        {exploreTab === 'members' ? (
          <>
            {/* Search Members Form */}
            <form onSubmit={handleSearch} className="flex gap-4 mb-8">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by username..." 
                className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg p-4 font-medium text-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" disabled={searching} className="bg-purple-600/20 border border-purple-500/30 text-purple-300 px-8 rounded-lg font-semibold hover:bg-purple-500/30 transition-all flex items-center gap-2 ambient-glow">
                {searching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                Search
              </button>
            </form>

            {/* Search Members Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.map((u, i) => (
                <div key={u.uid} className="glass-panel border-beam p-6 flex flex-col gap-4 scroll-fade interactive-card" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-center gap-4">
                    <img src={u.photoURL} alt={u.username} className="w-16 h-16 rounded-full border border-white/10 object-cover" />
                    <div>
                      <h3 className="font-bold text-xl text-slate-200">@{u.username}</h3>
                      <p className="font-medium text-slate-400 text-sm">{u.displayName}</p>
                    </div>
                  </div>
                  <p className="font-medium text-sm line-clamp-2 text-slate-300">{u.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {u.skills?.slice(0, 3).map((s: any, idx: number) => (
                      <span key={`${s.name}-${idx}`} className="text-[10px] font-semibold uppercase bg-slate-800/50 text-slate-300 border border-white/10 px-2 py-1 rounded-full">
                        {s.name} ({s.level})
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    {u.portfolioUrl && (
                      <a href={u.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors" title="Portfolio">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {u.learningPreference && (
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/30 px-2 py-1 rounded border border-white/5">
                        {u.learningPreference}
                      </span>
                    )}
                  </div>
                  <button onClick={() => sendRequest(u.uid)} className="mt-auto w-full py-2 bg-cyan-600/20 text-cyan-300 font-semibold rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2 ambient-glow">
                    <UserPlus className="w-4 h-4" /> Connect
                  </button>
                </div>
              ))}
              {searchResults.length === 0 && search && !searching && (
                <div className="col-span-full text-center py-8 font-semibold text-xl text-slate-500">No users found.</div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Filter Posts / Bulletin System on Explore Tab */}
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl mb-8 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Bulletin Filters</span>
                <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/10">
                  {filteredPosts.length} posts found
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Search Text */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Search Keywords</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={postsSearch}
                      onChange={(e) => setPostsSearch(e.target.value)}
                      placeholder="e.g. React, C++, Calculus"
                      className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs p-3 pl-9 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Level Select Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Difficulty Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs p-3 rounded-lg focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    <option value="All">All Difficulty Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                {/* Language Select Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Post Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs p-3 rounded-lg focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    <option value="All">All Languages</option>
                    {allLangOptions.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset Control Button */}
              {(selectedLevel !== 'All' || selectedLanguage !== 'All' || postsSearch !== '') && (
                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      setSelectedLevel('All');
                      setSelectedLanguage('All');
                      setPostsSearch('');
                    }}
                    className="px-4 py-2 bg-slate-950 border border-white/10 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Filtered Posts Board list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post: any, i: number) => {
                const date = post.createdAt?.toDate().toLocaleDateString() || 'Just now';
                return (
                  <div key={post.id} className="glass-panel border-beam p-6 flex flex-col justify-between gap-4 scroll-fade interactive-card" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div>
                      {/* Post top header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUid}`} 
                            alt="avatar" 
                            className="w-9 h-9 rounded-full border border-white/10 object-cover bg-slate-800"
                          />
                          <div>
                            <h4 className="font-semibold text-sm text-slate-200">@{post.authorName}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {post.type === 'teach' ? 'Offering' : 'Requesting'}
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider",
                          post.type === 'teach' ? "bg-teal-500/10 text-teal-300 border-teal-500/25" : "bg-purple-500/10 text-purple-300 border-purple-500/25"
                        )}>
                          {post.skill}
                        </span>
                      </div>

                      {/* Post Content */}
                      <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl mb-4 min-h-[80px]">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1">Topic Description</p>
                        <h4 className="text-base font-semibold text-slate-200 line-clamp-3">{post.description || "No description provided."}</h4>
                      </div>

                      {/* Metadata badges container */}
                      <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                        {post.level && (
                          <div className="flex items-center gap-1">
                            <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                            <span>{post.level}</span>
                          </div>
                        )}
                        {post.language && (
                          <div className="flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5 text-green-400" />
                            <span>{post.language}</span>
                          </div>
                        )}
                        {post.timing && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{post.timing}</span>
                          </div>
                        )}
                        {post.duration && (
                          <div className="flex items-center gap-1">
                            <Timer className="w-3.5 h-3.5 text-purple-400" />
                            <span>{post.duration}</span>
                          </div>
                        )}
                        {post.learningPreference && (
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                            <span>{post.learningPreference}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Join button block */}
                    <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                      <span className="text-[10px] font-semibold text-slate-500">{date}</span>
                      <button 
                        onClick={() => joinPostRoom(post.id, post.authorUid)} 
                        className="px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 hover:bg-cyan-500/30 transition-all ambient-glow"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Room
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredPosts.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 font-semibold text-lg bg-slate-900/10 border border-dashed border-white/10 rounded-2xl">
                  {posts.length === 0 ? "No bulletins are posted in the workspace yet." : "No posts matching the selected level/language filter criteria."}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SessionsPage = ({ user }: { user: any }) => {
  const [sessionsSnap] = useCollection(
    query(collection(db, 'sessions'), where('participants', 'array-contains', user.uid), orderBy('createdAt', 'desc'))
  );

  return (
    <div className="w-full max-w-4xl glass-panel border-beam p-8 ambient-glow scroll-fade">
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
        <History className="w-10 h-10 text-cyan-400" />
        <h2 className="text-4xl font-bold tracking-tight text-slate-200 tech-hover inline-block">Session History</h2>
      </div>

      <div className="flex flex-col gap-4">
        {!sessionsSnap && <div className="font-semibold text-slate-400">Loading sessions...</div>}
        {sessionsSnap?.docs.length === 0 && <div className="font-semibold text-slate-500">No past sessions found.</div>}
        {sessionsSnap?.docs.map((docSnap, i) => {
          const session = docSnap.data();
          const date = session.createdAt?.toDate().toLocaleDateString() || 'Unknown Date';
          return (
            <div key={docSnap.id} className="glass-panel border border-white/10 p-6 flex flex-col gap-4 scroll-fade" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-slate-200 mb-1">Study Session</h3>
                  <p className="font-medium text-slate-400 text-sm">Date: {date}</p>
                </div>
                <div className="flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 text-teal-300 px-4 py-2 rounded-lg font-semibold">
                  <Check className="w-5 h-5" /> Completed
                </div>
              </div>
              
              {session.slideUrls && session.slideUrls.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-bold mb-3 flex items-center gap-2 text-slate-200"><ImageIcon className="w-5 h-5 text-cyan-400"/> Captured Slides</h4>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
                    {session.slideUrls.map((url: string, idx: number) => (
                      <img 
                        key={idx} 
                        src={url} 
                        alt={`Slide ${idx + 1}`} 
                        className="h-40 rounded-xl border border-white/10 shadow-2xl cursor-pointer hover:scale-105 transition-transform object-cover aspect-video"
                        onClick={() => window.open(url, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {session.report && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-200"><BrainCircuit className="w-5 h-5 text-purple-400"/> AI Session Report</h4>
                  <div className="markdown-body prose prose-sm max-w-none font-medium bg-slate-800/50 p-4 rounded-xl border border-white/10 text-slate-300">
                    <Markdown>{session.report}</Markdown>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AIDoubtSolver = ({ user }: { user: any }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { hasApiKey, handleSelectKey, setHasApiKey } = useApiKey();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imageFile) || loading) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message to UI
    const newMessage: Message = { role: 'user', text: userMsg + (imageFile ? '\n[Attached Image]' : '') };
    setMessages(prev => [...prev, newMessage]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      let contents: any = { parts: [] };
      
      if (imageFile) {
        const base64Data = await fileToBase64(imageFile);
        contents.parts.push({ inlineData: { data: base64Data, mimeType: imageFile.type } });
        setImageFile(null);
        setImagePreview(null);
      }
      
      if (userMsg) {
        contents.parts.push({ text: userMsg });
      }

      // Add context
      const contextText = messages.map(m => `${m.role}: ${m.text}`).join('\n');
      if (contextText) {
        contents.parts.unshift({ text: `Previous context:\n${contextText}\n\nNew query:` });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: contents,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction: "You are an expert AI teacher and doubt solver. Explain concepts clearly, step-by-step using **Markdown formatting**. Use bold text for key terms, bullet points for lists, and headings for different sections. If an image is provided, analyze it carefully to answer the student's question."
        }
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'No response generated.' }]);
    } catch (error: any) {
      console.error("Error generating response:", error);
      const errorMessage = error.message || String(error);
      
      if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('Requested entity was not found')) {
        setMessages(prev => [...prev, { role: 'ai', text: 'AI Doubt Solving requires a Gemini API key. Please select a valid key with billing enabled.' }]);
        setHasApiKey(false);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'An error occurred while processing your request.' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl glass-panel border-beam flex flex-col h-[85vh] overflow-hidden ambient-glow scroll-fade">
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div>
            <h2 className="font-bold text-2xl tracking-tight text-slate-200 tech-hover inline-block">AI Doubt Solver</h2>
            <p className="font-medium text-sm text-slate-400">Your personal expert teacher powered by Gemini 3.1 Pro</p>
          </div>
        </div>
        {!hasApiKey && (
          <button 
            onClick={handleSelectKey}
            className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-all"
          >
            SELECT API KEY
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
            <BrainCircuit className="w-20 h-20 text-slate-600" />
            <p className="max-w-md font-semibold text-xl text-slate-500">Ask a question or upload an image of your problem to get started.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl",
              msg.role === 'user' ? "bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 rounded-tr-sm" : "glass-panel border border-white/10 text-slate-300 rounded-tl-sm"
            )}>
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
              ) : (
                <div className="markdown-body prose prose-sm max-w-none font-medium text-slate-300">
                  <Markdown>{msg.text}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass-panel border border-white/10 p-4 flex items-center gap-3 text-cyan-400 font-semibold rounded-2xl rounded-tl-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing & Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-slate-900/50">
        {imagePreview && (
          <div className="mb-4 relative inline-block">
            <img src={imagePreview} alt="Upload preview" className="h-24 rounded-lg border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
            <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-slate-800 border border-white/10 rounded-full p-1 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <label className="p-4 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-xl cursor-pointer hover:bg-purple-500/30 transition-all ambient-glow">
            <ImageIcon className="w-6 h-6" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl py-4 pl-4 pr-4 font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={(!input.trim() && !imageFile) || loading}
            className="p-4 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl disabled:opacity-50 hover:bg-cyan-500/30 transition-all ambient-glow"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ user, onJoinRoom, showToast }: { user: any, onJoinRoom: (roomId: string) => void, showToast: any }) => {
  const [userData] = useDocumentData(doc(db, 'users', user.uid));
  const [onlineConnections, setOnlineConnections] = useState<any[]>([]);
  const [joinRoomId, setJoinRoomId] = useState('');
  
  // Focus soundscapes state
  const [isPlayingSound, setIsPlayingSound] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<{ source?: AudioNode; lfo?: OscillatorNode; mainGain?: GainNode }[]>([]);

  const stopSound = () => {
    soundNodesRef.current.forEach(node => {
      try {
        if (node.source && 'stop' in node.source) {
          (node.source as any).stop();
        }
        if (node.lfo) {
          node.lfo.stop();
        }
      } catch (e) {}
    });
    soundNodesRef.current = [];
    setIsPlayingSound(null);
  };

  const playSound = (type: string) => {
    stopSound();
    
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        showToast("Web Audio not supported in this browser.", "error");
        return;
      }
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.08, ctx.currentTime); // keep it soft
      mainGain.connect(ctx.destination);
      
      if (type === 'rain') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        
        whiteNoise.connect(filter);
        filter.connect(mainGain);
        whiteNoise.start();
        
        soundNodesRef.current.push({ source: whiteNoise, mainGain });
        setIsPlayingSound('rain');
      } else if (type === 'binaural') {
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const synthGainL = ctx.createGain();
        const synthGainR = ctx.createGain();
        const merger = ctx.createChannelMerger(2);
        
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(140, ctx.currentTime);
        synthGainL.gain.setValueAtTime(0.4, ctx.currentTime);
        oscL.connect(synthGainL);
        synthGainL.connect(merger, 0, 0);
        
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(180, ctx.currentTime); // 40Hz difference (focus)
        synthGainR.gain.setValueAtTime(0.4, ctx.currentTime);
        oscR.connect(synthGainR);
        synthGainR.connect(merger, 0, 1);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, ctx.currentTime);
        
        merger.connect(filter);
        filter.connect(mainGain);
        
        oscL.start();
        oscR.start();
        
        soundNodesRef.current.push({ source: oscL, mainGain });
        soundNodesRef.current.push({ source: oscR, mainGain });
        setIsPlayingSound('binaural');
      } else if (type === 'space') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(65, ctx.currentTime); // Low space rumble frequency
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(95, ctx.currentTime);
        
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
        lfoGain.gain.setValueAtTime(15, ctx.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        osc.connect(filter);
        filter.connect(mainGain);
        
        osc.start();
        lfo.start();
        
        soundNodesRef.current.push({ source: osc, lfo, mainGain });
        setIsPlayingSound('space');
      }
      showToast(`Desk focus ambiance activated!`, "info");
    } catch (e) {
      console.error(e);
      showToast("Could not synthesize soundscape.", "error");
    }
  };

  // Turn off sound on unmount
  useEffect(() => {
    return () => {
      soundNodesRef.current.forEach(node => {
        try {
          if (node.source && 'stop' in node.source) {
            (node.source as any).stop();
          }
          if (node.lfo) {
            node.lfo.stop();
          }
        } catch (e) {}
      });
    };
  }, []);
  
  // Post Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [postType, setPostType] = useState<'teach'|'learn'>('teach');
  const [postSkill, setPostSkill] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postTiming, setPostTiming] = useState('');
  const [postDuration, setPostDuration] = useState('');
  const [postLevel, setPostLevel] = useState('Beginner');
  const [postLanguage, setPostLanguage] = useState('English');
  const [postAtmosphere, setPostAtmosphere] = useState<'social' | 'silent'>('social');
  const [roomAtmosphere, setRoomAtmosphere] = useState<'social' | 'silent'>('social');

  // Fetch Posts
  const [postsSnap] = useCollection(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20)));

  useEffect(() => {
    if (!userData?.connections || userData.connections.length === 0) {
      setOnlineConnections([]);
      return;
    }
    // Fetch online users from connections list
    const q = query(
      collection(db, 'users'), 
      where('uid', 'in', userData.connections.slice(0, 10)), // Firestore 'in' limit is 10
      where('isOnline', '==', true)
    );
    const unsub = onSnapshot(q, (snap) => {
      setOnlineConnections(snap.docs.map(d => d.data()));
    });
    return () => unsub();
  }, [userData?.connections]);

  const startPrivateRoom = async (peerUid: string) => {
    // Create a unique room ID for these two users
    const roomId = [user.uid, peerUid].sort().join('_');
    const roomRef = doc(db, 'rooms', roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) {
      await setDoc(roomRef, {
        roomId,
        hostId: user.uid,
        coHostIds: [peerUid],
        participants: [user.uid],
        createdAt: serverTimestamp(),
        isActive: true
      });
    }
    onJoinRoom(roomId);
  };

  const createGroupRoom = async () => {
    const roomId = 'room_' + Math.random().toString(36).substring(2, 9);
    await setDoc(doc(db, 'rooms', roomId), {
      roomId,
      hostId: user.uid,
      participants: [user.uid],
      createdAt: serverTimestamp(),
      isActive: true,
      atmosphere: roomAtmosphere
    });
    onJoinRoom(roomId);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;
    const roomRef = doc(db, 'rooms', joinRoomId.trim());
    const snap = await getDoc(roomRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.participants && data.participants.length >= 15 && !data.participants.includes(user.uid)) {
        showToast("Room is full (max 15 participants).", "error");
        return;
      }
      onJoinRoom(joinRoomId.trim());
    } else {
      showToast("Room not found.", "error");
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postSkill.trim()) return;
    try {
      await addDoc(collection(db, 'posts'), {
        authorUid: user.uid,
        authorName: userData?.displayName || user.displayName,
        authorPhoto: userData?.photoURL || user.photoURL,
        type: postType,
        skill: postSkill.trim(),
        description: postDesc.trim(),
        timing: postTiming.trim(),
        duration: postDuration.trim(),
        level: postLevel,
        language: postLanguage.trim(),
        learningPreference: userData?.learningPreference || 'visual',
        atmosphere: postAtmosphere,
        createdAt: serverTimestamp()
      });
      setShowPostModal(false);
      setPostSkill('');
      setPostDesc('');
      setPostTiming('');
      setPostDuration('');
      setPostLevel('Beginner');
      setPostLanguage('English');
      setPostAtmosphere('social');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    }
  };

  const joinPostRoom = async (postId: string, authorUid: string) => {
    const roomRef = doc(db, 'rooms', postId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) {
      let postAtmosphereVal = 'social';
      try {
        const postSnap = await getDoc(doc(db, 'posts', postId));
        if (postSnap.exists()) {
          postAtmosphereVal = postSnap.data()?.atmosphere || 'social';
        }
      } catch (err) {}

      await setDoc(roomRef, {
        roomId: postId,
        hostId: authorUid,
        participants: [user.uid],
        createdAt: serverTimestamp(),
        isActive: true,
        atmosphere: postAtmosphereVal
      });
    }
    onJoinRoom(postId);
  };  return (
    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-8 relative items-start">
      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border-beam p-6 w-full max-w-md ambient-glow">
            <h2 className="text-2xl font-bold tracking-tight mb-4 text-slate-200">Post a Skill</h2>
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <div>
                <label className="font-semibold text-sm text-slate-400">Type</label>
                <select value={postType} onChange={e => setPostType(e.target.value as 'teach'|'learn')} className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500">
                  <option value="teach">Offering (Teach)</option>
                  <option value="learn">Requesting (Learn)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-sm text-slate-400">Room Atmosphere</label>
                <select value={postAtmosphere} onChange={e => setPostAtmosphere(e.target.value as 'social' | 'silent')} className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500">
                  <option value="social">🔊 Social Studio Lobbies (Mics Allowed)</option>
                  <option value="silent">🤫 Focus Library Study (Silent, Cams/Chat only)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-sm text-slate-400">Skill</label>
                <div className="flex gap-2">
                  <input type="text" value={postSkill} onChange={e => setPostSkill(e.target.value)} placeholder="e.g. C++, React, Math" className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500" required />
                  <select value={postLevel} onChange={e => setPostLevel(e.target.value)} className="bg-slate-800/50 border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs font-bold uppercase">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-semibold text-sm text-slate-400">Language</label>
                <input type="text" value={postLanguage} onChange={e => setPostLanguage(e.target.value)} placeholder="e.g. English, Hindi, Spanish" className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="font-semibold text-sm text-slate-400">Description</label>
                <textarea value={postDesc} onChange={e => setPostDesc(e.target.value)} placeholder="What exactly?" className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-sm text-slate-400">Timing</label>
                  <input type="text" value={postTiming} onChange={e => setPostTiming(e.target.value)} placeholder="e.g. 6 PM Today" className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="font-semibold text-sm text-slate-400">Duration</label>
                  <input type="text" value={postDuration} onChange={e => setPostDuration(e.target.value)} placeholder="e.g. 45 mins" className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 py-2 rounded-lg font-semibold hover:bg-cyan-500/30 transition-all ambient-glow">Post</button>
                <button type="button" onClick={() => setShowPostModal(false)} className="flex-1 bg-slate-800/50 border border-white/10 text-slate-300 py-2 rounded-lg font-semibold hover:bg-slate-700/50 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Left Column */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="glass-panel border-beam p-6 flex flex-col ambient-glow scroll-fade interactive-card">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-slate-200 tech-hover inline-block">Your Desk</h2>
            <Coffee className="w-5 h-5 text-theme-primary" />
          </div>

          <div className="flex items-center gap-3 mb-6 bg-slate-900/35 border border-white/5 p-3 rounded-xl">
            <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-slate-800 bg-center">
              <img src={userData?.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-200 truncate">{userData?.displayName || user.displayName}</p>
              <p className="text-xs text-slate-400 truncate">@{userData?.username || 'username'}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Teaching Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {userData?.skills?.slice(0, 3).map((s: any, idx: number) => (
                <span key={`${s.name}-${idx}`} className="inline-block px-2.5 py-1 bg-slate-800/60 border border-white/5 rounded-lg text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                  {s.name} <span className="text-theme-primary ml-1 opacity-70">{s.level}</span>
                </span>
              ))}
              {(!userData?.skills || userData.skills.length === 0) && (
                <span className="text-xs font-semibold text-slate-500 italic">No skills registered yet</span>
              )}
            </div>
          </div>

          {/* Karma / Reputation indicator */}
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Desk Reputation</span>
              <span className="text-theme-primary font-extrabold flex items-center gap-1">
                <Star className="w-3 h-3 fill-theme-primary/20" /> {userData?.karma || 0} XP
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-theme-primary to-theme-secondary shadow-[0_0_8px_var(--glow-color)] transition-all duration-500" 
                style={{ width: `${Math.max(5, Math.min(100, ((userData?.karma || 0) / 100) * 100))}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
              {userData?.karma ? `${userData.karma} XP Earned` : "0 XP • Start Helping"}
            </p>
          </div>
        </div>

        {/* Focus Soundscapes Card */}
        <div className="glass-panel border-beam p-5 flex flex-col scroll-fade interactive-card" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 tech-hover inline-block">Focus Atmosphere</h2>
            <Volume2 className="w-4 h-4 text-theme-primary" />
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">
            Activate soft synthesized focus soundscapes (Web Audio) to block external noise.
          </p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'binaural', label: 'Binaural Focus Beat', desc: '40Hz Gamma Focus State' },
              { id: 'rain', label: 'Cozy Desk Rainfall', desc: 'Synthesized high-cut relaxing noise' },
              { id: 'space', label: 'Stellar Drone Rumble', desc: 'Deep cosmic resonant synth wave' },
            ].map(sound => (
              <button
                key={sound.id}
                onClick={() => isPlayingSound === sound.id ? stopSound() : playSound(sound.id)}
                className={cn(
                  "p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-300 relative overflow-hidden group",
                  isPlayingSound === sound.id 
                    ? "bg-cyan-600/15 border-cyan-500/45 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)] animate-pulse" 
                    : "bg-slate-900/40 border-white/5 hover:border-white/10 text-slate-300"
                )}
              >
                <div className="min-w-0 z-10">
                  <p className="text-xs font-bold leading-none">{sound.label}</p>
                  <p className="text-[9px] text-slate-500 font-medium mt-1 leading-none truncate">{sound.desc}</p>
                </div>
                {isPlayingSound === sound.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1.5 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-slate-800/40 border border-white/5 group-hover:bg-slate-700/40 transition-all flex items-center justify-center">
                    <Star className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                )}
              </button>
            ))}
            {isPlayingSound && (
              <button 
                onClick={stopSound} 
                className="w-full mt-1.5 py-2 border border-dashed border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all"
              >
                Silence Workspace
              </button>
            )}
          </div>
        </div>

        {/* Dynamic AI Matchmaker */}
        <div className="glass-panel border border-white/10 p-6 flex flex-col scroll-fade" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-200 tech-hover inline-block">AI Matchmaker</h2>
            <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
          </div>

          {(() => {
            const teachingSkillNames = (userData?.skills || []).map((s: any) => s.name?.trim().toLowerCase());
            const allPosts = postsSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [];
            const matchedRequests = allPosts.filter((post: any) => {
              if (post.type !== 'learn' || post.authorUid === user.uid) return false;
              const postSkillLower = post.skill?.trim().toLowerCase();
              return teachingSkillNames.includes(postSkillLower);
            });

            if (matchedRequests.length > 0) {
              return (
                <div className="flex flex-col gap-4">
                  <div className="bg-purple-950/20 border border-purple-500/20 p-3 rounded-xl">
                    <p className="text-xs font-semibold text-purple-300 leading-relaxed">
                      We identified <strong className="text-purple-200 font-extrabold">{matchedRequests.length} peer request{matchedRequests.length > 1 ? 's' : ''}</strong> matching your skills:
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                    {matchedRequests.slice(0, 3).map((match: any) => (
                      <div key={match.id} className="bg-slate-900/40 p-2.5 rounded-lg border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-cyan-400 capitalize bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/10">{match.skill}</span>
                          <span className="text-[9px] text-slate-400">by @{match.authorName?.split(' ')[0]}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium truncate italic">"{match.description}"</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 text-center font-semibold uppercase tracking-wider">Matches update instantly</p>
                </div>
              );
            } else {
              return (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-900/30 border border-white/5 p-3 rounded-xl">
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">
                      No active peer help requests match your exact teaching stacks right now.
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium leading-relaxed border-t border-white/5 pt-3">
                    <span className="font-semibold text-slate-400 block mb-1">💡 Expand Matches:</span>
                    Enter more technical stacks (e.g. C++, Python, Math, Chemistry) inside your Profile tab.
                  </div>
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Middle Column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex justify-between items-center bg-slate-900/30 p-2 pl-4 pr-2 rounded-xl border border-white/5">
          <h2 className="text-xl font-black tracking-wider text-slate-200 uppercase">Study Bulletins</h2>
          <button 
            onClick={() => setShowPostModal(true)} 
            className="px-5 py-2.5 border rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-98 interactive-btn"
          >
            <Plus className="w-3.5 h-3.5" /> Post bulletin
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto max-h-[800px] pr-2">
          {postsSnap?.docs.map((docSnap, i) => {
            const post = docSnap.data();
            const date = post.createdAt?.toDate().toLocaleDateString() || 'Just now';
            // Pulsing online dot check
            const isAuthorOnline = onlineConnections.some(c => c.uid === post.authorUid) || post.authorUid === user.uid;

            return (
              <div key={docSnap.id} className="glass-panel border-beam p-6 ambient-glow scroll-fade interactive-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                      <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-slate-800">
                        <img src={post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUid}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      {isAuthorOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-200 text-sm">{post.authorName}</h3>
                        {isAuthorOnline && (
                          <span className="text-[9px] font-black text-green-400 uppercase tracking-widest bg-green-500/10 px-1.5 py-0.5 rounded">Active</span>
                        )}
                      </div>
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{post.type === 'teach' ? 'Offering Help' : 'Requesting Help'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className={cn(
                      "px-3 py-1 border rounded-lg text-xs font-bold uppercase tracking-wider", 
                      post.type === 'teach' ? "bg-teal-500/10 text-teal-300 border-teal-500/20" : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                    )}>
                      {post.skill}
                    </span>
                    {post.atmosphere === 'silent' && (
                      <span className="px-2.5 py-1 border border-purple-500/20 bg-purple-500/10 text-purple-300 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <MicOff className="w-3.5 h-3.5 text-purple-400" /> Silent Study
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mb-6">
                  <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">Topic Goal</p>
                    <h4 className="text-lg md:text-xl font-medium text-slate-200 leading-normal">{post.description}</h4>
                  </div>
                  <div className="flex flex-wrap gap-4 px-1 mt-1">
                    {post.level && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <BrainCircuit className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{post.level}</span>
                      </div>
                    )}
                    {post.timing && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-semibold tracking-wide text-slate-300">{post.timing}</span>
                      </div>
                    )}
                    {post.duration && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Timer className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-semibold tracking-wide text-slate-300">{post.duration}</span>
                      </div>
                    )}
                    {post.learningPreference && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <GraduationCap className="w-4 h-4 text-amber-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{post.learningPreference}</span>
                      </div>
                    )}
                    {post.language && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Volume2 className="w-4 h-4 text-green-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{post.language}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-xs font-semibold text-slate-500">{date}</span>
                  <button 
                    onClick={() => joinPostRoom(docSnap.id, post.authorUid)} 
                    className="px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-500/30 transition-all ambient-glow"
                  >
                    <Video className="w-4 h-4" /> Join Room
                  </button>
                </div>
              </div>
            );
          })}
          {postsSnap?.docs.length === 0 && (
            <div className="text-center py-12 font-bold text-slate-500 bg-slate-900/10 border border-dashed border-white/10 rounded-2xl">
              No bulletins posted yet. Be the first to post!
            </div>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Group Rooms Card */}
        <div className="glass-panel border-beam p-6 flex flex-col gap-4 ambient-glow scroll-fade interactive-card" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <h2 className="font-bold uppercase tracking-widest text-xs text-slate-400 tech-hover inline-block">Group Study Lobby</h2>
            <span className="text-[9px] bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/20 text-cyan-300 rounded-full font-bold">Max 15</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider leading-none mb-1">Target Atmosphere</p>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/60 rounded-xl border border-white/5">
              <button 
                type="button"
                onClick={() => setRoomAtmosphere('social')}
                className={cn(
                  "py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5",
                  roomAtmosphere === 'social' 
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm" 
                    : "text-slate-400 border border-transparent hover:text-slate-300"
                )}
              >
                <Volume2 className="w-3.5 h-3.5" /> Social Study
              </button>
              <button 
                type="button"
                onClick={() => setRoomAtmosphere('silent')}
                className={cn(
                  "py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5",
                  roomAtmosphere === 'silent' 
                    ? "bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-sm" 
                    : "text-slate-400 border border-transparent hover:text-slate-300"
                )}
              >
                <MicOff className="w-3.5 h-3.5" /> Silent Library
              </button>
            </div>
          </div>
          <button 
            onClick={createGroupRoom} 
            className={cn(
              "w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ambient-glow",
              roomAtmosphere === 'silent'
                ? "bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                : "bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30"
            )}
          >
            {roomAtmosphere === 'silent' ? (
              <>
                <MicOff className="w-4 h-4 text-purple-400" /> Create Silent Room
              </>
            ) : (
              <>
                <Video className="w-4 h-4" /> Create Social Room
              </>
            )}
          </button>
          
          <div className="relative flex items-center my-1">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">or Join ID</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <form onSubmit={handleJoinSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={joinRoomId} 
              onChange={e => setJoinRoomId(e.target.value)} 
              placeholder="Room ID" 
              className="flex-1 bg-slate-800/40 border border-white/10 rounded-lg p-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500" 
            />
            <button 
              type="submit" 
              className="bg-slate-800/60 border border-white/10 text-slate-300 px-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-700/60 transition-colors"
            >
              Join
            </button>
          </form>
        </div>

        {/* Online Connections Card */}
        <div className="glass-panel border border-white/10 p-6 flex flex-col min-h-[340px] scroll-fade interactive-card" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-5 border-b border-white/10 pb-2.5 tech-hover">
            Online Lobby ({onlineConnections.length})
          </h2>
          
          <div className="flex flex-col gap-4 flex-grow overflow-y-auto">
            {onlineConnections.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center text-slate-600 mb-3 bg-slate-900/20">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-400 mb-1">Silent desk right now</p>
                <p className="text-[10px] text-slate-500 leading-normal font-medium max-w-[180px]">
                  Connect with peers on the <strong className="text-cyan-500/80 font-bold">Explore</strong> tab to build your live lobby!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {onlineConnections.map(conn => (
                  <div key={conn.uid} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/10 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={conn.photoURL} className="w-9 h-9 rounded-full border border-white/10 object-cover" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-slate-300 truncate">@{conn.username}</span>
                        <span className="text-[9px] text-slate-500 font-bold truncate capitalize">{conn.learningPreference || 'Visual'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => startPrivateRoom(conn.uid)}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 rounded-full hover:scale-110 transition-all ambient-glow shadow-md"
                      title="Start Private Video Chat"
                    >
                      <Video className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoRoom = ({ user, roomId, onLeave, showToast }: { user: any, roomId: string, onLeave: (tab?: string) => void, showToast: any }) => {
  const [messagesSnap] = useCollection(
    query(collection(db, 'messages'), where('roomId', '==', roomId), orderBy('createdAt', 'asc'))
  );
  const [roomSnap, roomLoading] = useDocumentData(doc(db, 'rooms', roomId));
  const isHost = roomSnap?.hostId === user.uid;
  
  const [waitingUserSnap, waitingLoading] = useDocumentData(doc(db, 'rooms', roomId, 'waitingUsers', user.uid));
  const [waitingUsersSnap] = useCollection(
    isHost ? query(collection(db, 'rooms', roomId, 'waitingUsers'), where('status', '==', 'waiting')) : null
  );
  
  const [hasJoined, setHasJoined] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const { hasApiKey, handleSelectKey, setHasApiKey } = useApiKey();

  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Media States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [isVirtualBg, setIsVirtualBg] = useState(false);
  const [bgType, setBgType] = useState<'blur' | 'color' | 'image'>('blur');
  const [bgColor, setBgColor] = useState('#000000');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isWhiteboardOn, setIsWhiteboardOn] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#FFD700');
  const [strokeWidth, setStrokeWidth] = useState(6);
  
  // AI Report States
  const [slides, setSlides] = useState<string[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const selfieSegmentationRef = useRef<SelfieSegmentation | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const bgSettingsRef = useRef({ type: bgType, color: bgColor, image: bgImageRef.current });

  // Whiteboard drawing synchronizer cache refs
  const currentPointsRef = useRef<{ x: number, y: number }[]>([]);
  const allStrokesRef = useRef<any[]>([]);

  // Resolve custom/fallback ICE servers dynamically from host user settings (Section 1 setup)
  const userSettingsRef = doc(db, 'user_settings', user.uid);
  const [userSettingsData] = useDocumentData(userSettingsRef);

  const servers = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302', 
          'stun:stun2.l.google.com:19302',
          'stun:stun.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302'
        ],
      },
      ...(userSettingsData?.custom_turn ? [{
        urls: [userSettingsData.custom_turn],
        username: userSettingsData.custom_turn_username || '',
        credential: userSettingsData.custom_turn_credential || ''
      }] : [])
    ],
    iceCandidatePoolSize: 10,
  };

  // Real-time synchronization of whiteboard drawings using normalized coordinates (Section 2)
  useEffect(() => {
    if (!roomId) return;
    const q = query(collection(db, 'rooms', roomId, 'annotations'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      
      const docs = snapshot.docs.map(doc => doc.data());
      allStrokesRef.current = docs;

      if (!canvas || !ctx) return;
      
      // Clear and redraw all strokes
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      docs.forEach(data => {
        if (data.type === 'clear') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        
        const points = data.points;
        if (!points || points.length === 0) return;
        
        ctx.beginPath();
        // Multiply normalized coordinates by receiving user's local canvas dimensions
        const firstPt = points[0];
        ctx.moveTo(firstPt.x * canvas.width, firstPt.y * canvas.height);
        
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x * canvas.width, points[i].y * canvas.height);
        }
        
        ctx.strokeStyle = data.color || '#FFD700';
        ctx.lineWidth = data.width || 6;
        ctx.lineCap = 'round';
        ctx.stroke();
      });
    }, (error) => {
      console.error("Firestore annotations onSnapshot error:", error);
    });

    return () => unsubscribe();
  }, [roomId]);

  // Debounced ResizeObserver to scale whiteboard dimensions fluidly across devices (Section 2)
  useEffect(() => {
    if (!isAnnotating || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    let timeoutId: any;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (canvasRef.current) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
            
            // Redraw from cached snapshot
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, width, height);
              allStrokesRef.current.forEach(data => {
                if (data.type === 'clear') {
                  ctx.clearRect(0, 0, width, height);
                  return;
                }
                const points = data.points;
                if (!points || points.length === 0) return;
                
                ctx.beginPath();
                const firstPt = points[0];
                ctx.moveTo(firstPt.x * width, firstPt.y * height);
                for (let i = 1; i < points.length; i++) {
                  ctx.lineTo(points[i].x * width, points[i].y * height);
                }
                ctx.strokeStyle = data.color || '#FFD700';
                ctx.lineWidth = data.width || 6;
                ctx.lineCap = 'round';
                ctx.stroke();
              });
            }
          }
        }, 120);
      }
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isAnnotating]);

  useEffect(() => {
    if (bgType === 'image' && bgImage) {
      const img = new Image();
      img.src = bgImage;
      img.onload = () => {
        bgImageRef.current = img;
        bgSettingsRef.current = { type: bgType, color: bgColor, image: img };
      };
    } else {
      bgImageRef.current = null;
      bgSettingsRef.current = { type: bgType, color: bgColor, image: null };
    }
  }, [bgType, bgImage, bgColor]);

  const participants = roomSnap?.participants || [];

  useEffect(() => {
    if (roomSnap?.atmosphere === 'silent') {
      setIsMicOn(false);
    }
  }, [roomSnap]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesSnap]);

  useEffect(() => {
    if (roomLoading) return;
    
    if (isHost) {
      if (!hasJoined) {
        const roomRef = doc(db, 'rooms', roomId);
        updateDoc(roomRef, { participants: arrayUnion(user.uid) })
          .then(() => setHasJoined(true))
          .catch(console.error);
      }
    } else {
      if (!hasJoined && !waitingLoading) {
        const waitingRef = doc(db, 'rooms', roomId, 'waitingUsers', user.uid);
        if (!waitingUserSnap) {
          setDoc(waitingRef, {
            userId: user.uid,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || '',
            joinedAt: serverTimestamp(),
            status: 'waiting'
          });
        } else if (waitingUserSnap.status === 'admitted') {
          const roomRef = doc(db, 'rooms', roomId);
          updateDoc(roomRef, { participants: arrayUnion(user.uid) })
            .then(() => setHasJoined(true))
            .catch(console.error);
        }
      }
    }
  }, [roomLoading, isHost, hasJoined, waitingLoading, waitingUserSnap, roomId, user]);

  useEffect(() => {
    if (!hasJoined) return;
    
    // Initialize Media
    const initMedia = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Media devices not supported in this browser.");
        }
        const isSilent = roomSnap?.atmosphere === 'silent';
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: !isSilent 
        });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup WebRTC
        if (typeof RTCPeerConnection === 'undefined') {
          throw new Error("WebRTC is not supported in this browser.");
        }
        const pc = new RTCPeerConnection(servers);
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
          }
          event.streams[0].getTracks().forEach((track) => {
            remoteStreamRef.current?.addTrack(track);
          });
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
          }
        };

        const callDoc = doc(db, 'rooms', roomId, 'calls', 'main');
        const iceCandidatesCol = collection(callDoc, 'iceCandidates');

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            addDoc(iceCandidatesCol, {
              ...event.candidate.toJSON(),
              userId: user.uid
            }).catch(console.error);
          }
        };

        let unsubCall: () => void;
        let unsubCandidates: () => void;

        if (isHost) {
          const offerDescription = await pc.createOffer();
          await pc.setLocalDescription(offerDescription);

          const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
          };

          await setDoc(callDoc, { offer });

          // Listen for answer
          unsubCall = onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (!pc.currentRemoteDescription && data?.answer) {
              const answerDescription = new RTCSessionDescription(data.answer);
              pc.setRemoteDescription(answerDescription);
            }
          });

          // Listen for remote ICE candidates
          unsubCandidates = onSnapshot(iceCandidatesCol, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const data = change.doc.data();
                if (data.userId !== user.uid) {
                  pc.addIceCandidate(new RTCIceCandidate(data)).catch(console.error);
                }
              }
            });
          });
        } else {
          // Listen for offer
          unsubCall = onSnapshot(callDoc, async (snapshot) => {
            const data = snapshot.data();
            if (!pc.currentRemoteDescription && data?.offer) {
              const offerDescription = new RTCSessionDescription(data.offer);
              await pc.setRemoteDescription(offerDescription);

              const answerDescription = await pc.createAnswer();
              await pc.setLocalDescription(answerDescription);

              const answer = {
                type: answerDescription.type,
                sdp: answerDescription.sdp,
              };

              await updateDoc(callDoc, { answer });
            }
          });

          // Listen for remote ICE candidates
          unsubCandidates = onSnapshot(iceCandidatesCol, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const data = change.doc.data();
                if (data.userId !== user.uid) {
                  pc.addIceCandidate(new RTCIceCandidate(data)).catch(console.error);
                }
              }
            });
          });
        }

        return () => {
          unsubCall?.();
          unsubCandidates?.();
        };

      } catch (err: any) {
        console.error("Failed to get media", err);
        setMediaError(err.message || "Could not access camera or microphone. Please ensure you have granted permissions and are using a secure connection.");
      }
    };
    const cleanupMedia = initMedia();

    return () => {
      const roomRef = doc(db, 'rooms', roomId);
      updateDoc(roomRef, { participants: arrayRemove(user.uid) }).catch(console.error);
      streamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      peerConnectionRef.current?.close();
      cameraRef.current?.stop();
      selfieSegmentationRef.current?.close();
      cleanupMedia.then(cleanup => cleanup?.());
    };
  }, [roomId, user.uid, hasJoined, isHost]);

  // Virtual Background Logic
  useEffect(() => {
    if (!hasJoined || !localVideoRef.current || !bgCanvasRef.current) return;

    if (isVirtualBg) {
      if (!selfieSegmentationRef.current) {
        const selfieSegmentation = new SelfieSegmentation({locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }});
        selfieSegmentation.setOptions({
          modelSelection: 1,
        });
        
        selfieSegmentation.onResults((results: Results) => {
          const canvas = bgCanvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (!ctx || !canvas) return;

          canvas.width = results.image.width;
          canvas.height = results.image.height;

          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw segmentation mask
          ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

          // Draw the person
          ctx.globalCompositeOperation = 'source-in';
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

          // Draw the background
          ctx.globalCompositeOperation = 'destination-atop';
          
          const { type, color, image } = bgSettingsRef.current;
          if (type === 'color') {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (type === 'image' && image) {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          } else {
            // Blur
            ctx.filter = 'blur(10px)';
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          }
          
          ctx.restore();
        });
        selfieSegmentationRef.current = selfieSegmentation;
      }

      if (!cameraRef.current && localVideoRef.current) {
        const camera = new MediaPipeCamera(localVideoRef.current, {
          onFrame: async () => {
            if (localVideoRef.current && selfieSegmentationRef.current) {
              await selfieSegmentationRef.current.send({image: localVideoRef.current});
            }
          },
          width: 1280,
          height: 720
        });
        camera.start();
        cameraRef.current = camera;
      }
    } else {
      cameraRef.current?.stop();
      cameraRef.current = null;
      // Clear canvas
      const canvas = bgCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isVirtualBg, hasJoined]);

  useEffect(() => {
    if (isAnnotating && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }, [isAnnotating]);

  const toggleMic = () => {
    if (roomSnap?.atmosphere === 'silent') {
      showToast("Strictly no mics allowed in this Silent Library focus session. 🤫", "info");
      return;
    }
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => t.enabled = !isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } catch (err) {
        console.error("Failed to share screen", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    if (localVideoRef.current && streamRef.current) {
      localVideoRef.current.srcObject = streamRef.current;
    }
    setIsScreenSharing(false);
  };

  const toggleWhiteboard = () => {
    setIsWhiteboardOn(!isWhiteboardOn);
    if (!isWhiteboardOn) {
      setIsAnnotating(true);
    }
  };

  // Annotation Handlers utilizing Normalized Coordinate syncing for cross-platform alignment
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAnnotating) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(localX, localY);
    setIsDrawing(true);

    // Track starting point in normalized proportions
    currentPointsRef.current = [
      { x: localX / canvas.width, y: localY / canvas.height }
    ];
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAnnotating || !isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    ctx.lineTo(localX, localY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Track intermediate points in normalized proportions
    currentPointsRef.current.push({
      x: localX / canvas.width,
      y: localY / canvas.height
    });
  };

  const stopDrawing = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPointsRef.current.length > 0) {
      try {
        await addDoc(collection(db, 'rooms', roomId, 'annotations'), {
          points: currentPointsRef.current,
          color: strokeColor,
          width: strokeWidth,
          createdAt: serverTimestamp(),
          uid: user.uid,
          type: 'stroke'
        });
      } catch (err) {
        console.error("Failed to sync whiteboard stroke to Firebase:", err);
      }
    }
    currentPointsRef.current = [];
  };

  const clearAnnotation = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    try {
      await addDoc(collection(db, 'rooms', roomId, 'annotations'), {
        type: 'clear',
        createdAt: serverTimestamp(),
        uid: user.uid
      });
    } catch (err) {
      console.error("Failed to sync whiteboard clear status:", err);
    }
  };

  const captureSlide = () => {
    const canvas = document.createElement('canvas');
    let width = 1280;
    let height = 720;

    if (localVideoRef.current && localVideoRef.current.videoWidth) {
      width = localVideoRef.current.videoWidth;
      height = localVideoRef.current.videoHeight;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw Background (Video, Virtual BG, or Whiteboard)
    if (isWhiteboardOn) {
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(0, 0, width, height);
    } else {
      const sourceElement = isVirtualBg ? bgCanvasRef.current : localVideoRef.current;
      if (sourceElement) {
        ctx.drawImage(sourceElement, 0, 0, width, height);
      }
    }

    // 2. Draw Annotations on top
    if (canvasRef.current) {
      ctx.drawImage(canvasRef.current, 0, 0, width, height);
    }

    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    setSlides(prev => [...prev, base64]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await addDoc(collection(db, 'messages'), {
        roomId,
        authorUid: user.uid,
        authorName: user.displayName,
        text: input.trim(),
        createdAt: serverTimestamp()
      });
      setInput('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  const handleEndSession = async () => {
    setIsGeneratingReport(true);
    let reportText = '';
    let slideUrls: string[] = [];
    
    try {
      // Upload slides to Storage
      for (let i = 0; i < slides.length; i++) {
        const slideBase64 = slides[i];
        const storageRef = ref(storage, `sessions/${roomId}/slide_${Date.now()}_${i}.jpg`);
        const blob = await (await fetch(`data:image/jpeg;base64,${slideBase64}`)).blob();
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        slideUrls.push(url);
      }

      if (slides.length > 0 || (messagesSnap && messagesSnap.docs.length > 0)) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const parts: any[] = [];
        
        slides.forEach((base64, index) => {
          parts.push({ text: `Slide ${index + 1}:` });
          parts.push({ inlineData: { data: base64, mimeType: 'image/jpeg' } });
        });
        
        const chatHistory = messagesSnap?.docs?.map(d => `${d.data().authorName}: ${d.data().text}`).join('\n');
        if (chatHistory) {
          parts.push({ text: `\nChat History:\n${chatHistory}` });
        }
        
        parts.push({ text: `\nBased on the provided slides (images) and chat history from this study session, generate a comprehensive, in-depth session report using **Markdown formatting**. 

The slides may contain handwritten annotations, diagrams, or text - please analyze these carefully as they represent the core teaching material. 

For each slide, please provide:
- **Verbatim Text Extraction**: List the exact text, words, or phrases written on the board/slide using bullet points.
- **In-depth Analysis**: Explain the concepts taught in detail, summarizing the educational context of the annotations and drawings. Use bold text for key terms.

Use high-level thinking to infer the educational context and provide a thorough explanation of the topics discussed. 

**Structure the report as follows:**
1. **Session Overview**: A brief summary of the overall topic.
2. **Detailed Slide Analysis**: Break down each slide with headings (e.g., ### Slide 1).
3. **Chat Summary**: Summarize the key questions and discussions from the chat.
4. **Key Takeaways**: A bulleted list of the most important concepts.

Ensure the final summary is structured, professional, and captures the essence of the entire session.` });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: { parts },
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
          }
        });
        reportText = response.text || 'No report generated.';
      } else {
        reportText = 'No slides captured and no chat history available to generate a report.';
      }
    } catch (err: any) {
      console.error("AI Report generation failed", err);
      const errorMessage = err.message || String(err);
      
      if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('Requested entity was not found')) {
        reportText = "AI Report generation requires a Gemini API key. Please select a valid key with billing enabled.";
        setHasApiKey(false);
      } else {
        reportText = "Failed to generate AI report due to an error.";
      }
    }

    // Record session history
    try {
      await addDoc(collection(db, 'sessions'), {
        roomId,
        participants: participants.length > 0 ? participants : [user.uid],
        createdAt: serverTimestamp(),
        report: reportText,
        slideUrls: slideUrls
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'sessions');
    }
    // Increment session count for user
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const currentCount = userSnap.exists() ? (userSnap.data().sessionCount || 0) : 0;
    try {
      await updateDoc(userRef, { sessionCount: currentCount + 1 });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
    
    setIsGeneratingReport(false);
    onLeave('Sessions');
  };

  const admitUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'rooms', roomId, 'waitingUsers', userId), { status: 'admitted' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}/waitingUsers/${userId}`);
    }
  };

  const denyUser = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'rooms', roomId, 'waitingUsers', userId), { status: 'denied' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}/waitingUsers/${userId}`);
    }
  };

  if (roomLoading || (!isHost && waitingLoading)) {
    return <div className="flex items-center justify-center h-[85vh]"><Loader2 className="w-12 h-12 animate-spin" /></div>;
  }

  if (!isHost && (!waitingUserSnap || waitingUserSnap.status === 'waiting')) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-8 overflow-hidden relative">
        <Starfield />
        <div className="neural-tide" />
        
        <div className="glass-panel border-beam p-12 max-w-2xl w-full text-center ambient-glow relative z-10">
          <div className="nexus-sphere mb-12 mx-auto">
            <Loader2 className="w-16 h-16 animate-spin text-cyan-400 drop-shadow-[0_0_10px_#22d3ee]" />
          </div>
          
          <h2 className="text-5xl font-black tracking-[0.2em] text-cyan-400 mb-6 tech-hover inline-block uppercase">
            Waiting Room
          </h2>
          <p className="text-xl font-medium text-slate-400 mb-12 tracking-wide">
            SYNAPTIC CONNECTION PENDING...
            <br />
            <span className="text-slate-500 text-sm font-mono mt-2 block">Please wait for the host to admit you to the session.</span>
          </p>
          
          <button 
            onClick={() => onLeave()} 
            className="px-10 py-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-black uppercase tracking-widest hover:bg-red-500/30 transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            Abort Connection
          </button>
        </div>
        
        <div className="absolute bottom-12 left-12 font-mono text-[10px] text-cyan-500/30 tracking-[0.5em] uppercase">
          Neural Tide Protocol Active
        </div>
      </div>
    );
  }

  if (!isHost && waitingUserSnap?.status === 'denied') {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-8 overflow-hidden relative">
        <Starfield />
        <div className="glass-panel border-beam p-12 max-w-2xl w-full text-center ambient-glow relative z-10">
          <div className="w-24 h-24 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <X className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-red-500 mb-6 tech-hover inline-block">
            ACCESS DENIED
          </h2>
          <p className="text-xl font-bold text-slate-400 mb-12">The host has declined your request to join this session.</p>
          <button 
            onClick={() => onLeave()} 
            className="px-10 py-4 bg-slate-800 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest hover:bg-slate-700 transition-all active:scale-95"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl h-[85vh] glass-panel border-beam flex flex-col md:flex-row relative overflow-hidden">
      {isGeneratingReport && (
        <div className="absolute inset-0 bg-[#030712] z-[100] flex flex-col items-center justify-center p-8 overflow-hidden">
          <Starfield />
          
          {/* Warm Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

          <div className="relative z-10 text-center flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative mb-12"
            >
              <div className="nexus-sphere w-32 h-32 border-cyan-500/20">
                <BrainCircuit className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border border-dashed border-cyan-500/20 rounded-full"
              />
            </motion.div>
            
            <h2 className="text-4xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400 mb-8 glitch-text uppercase">
              Synthesizing Session
            </h2>
            
            <div className="max-w-md mx-auto">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-8 relative">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_#22d3ee]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 8, ease: "easeInOut" }}
                />
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                <p className="text-cyan-400/60 font-cursive text-3xl">
                  "Knowledge is the only asset that grows when shared."
                </p>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-slate-500 tracking-[0.4em] uppercase">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                    Generating AI Session Report
                  </div>
                  <div className="text-[8px] text-slate-600 font-mono uppercase tracking-widest">
                    Analyzing Annotations // Compiling Insights
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="absolute top-12 left-12 font-mono text-[10px] text-cyan-500/30 tracking-[0.5em] uppercase">
            Neural Processing Unit Active
          </div>
          <div className="absolute bottom-12 right-12 font-mono text-[10px] text-cyan-500/30 tracking-[0.5em] uppercase">
            Data Encryption: 256-bit AES
          </div>
        </div>
      )}

      {/* Video Area */}
      <div className="flex-1 relative flex flex-col bg-slate-900/50 p-4 overflow-hidden">
        <div className="flex flex-wrap gap-2 justify-between items-center mb-4 z-10">
          <div className="flex items-center gap-2">
            <div className="bg-red-500/20 text-red-400 px-3 py-1 font-semibold uppercase text-xs border border-red-500/30 flex items-center gap-2 rounded-full">
              <div className="w-2 h-2 bg-red-400 rounded-full shadow-[0_0_8px_rgba(248,113,113,0.8)] animate-pulse" /> Live
            </div>
            {roomSnap?.atmosphere === 'silent' ? (
              <div className="bg-purple-500/20 text-purple-300 px-3 py-1 font-bold uppercase text-xs border border-purple-500/30 flex items-center gap-1.5 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.15)] animate-pulse">
                <MicOff className="w-3.5 h-3.5 text-purple-400" /> Focus Library Mode (Silent)
              </div>
            ) : (
              <div className="bg-cyan-500/10 text-cyan-300 px-3 py-1 font-semibold uppercase text-xs border border-cyan-500/20 flex items-center gap-1.5 rounded-full">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Social Study
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-800/50 text-slate-300 px-3 py-1 font-semibold uppercase text-xs border border-white/10 flex items-center gap-2 rounded-full">
              Room ID: <span className="select-all bg-slate-700/50 px-2 py-0.5 rounded text-cyan-300">{roomId}</span>
            </div>
            <div className="bg-cyan-600/20 text-cyan-300 px-3 py-1 font-semibold uppercase text-xs border border-cyan-500/30 rounded-full">
              {participants.length}/15 Joined
            </div>
          </div>
        </div>

        {roomSnap?.atmosphere === 'silent' && (
          <div className="mb-4 p-3 rounded-xl bg-purple-950/20 border border-purple-500/15 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.1)] animate-pulse">
              <MicOff className="w-4 h-4 text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase text-purple-300 tracking-wider">Silent Library Rules Active</p>
              <p className="text-[10px] text-slate-400 font-medium leading-normal">To honor the Focus Library atmosphere, all microphones inside this room are strictly muted and disabled. Use room chat for discussions!</p>
            </div>
          </div>
        )}

        {/* Main Video / Screen Share Area */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden mb-20 rounded-xl border border-white/10 bg-black shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          {mediaError && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 p-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mb-6">
                <VideoOff className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-tighter">Media Access Error</h3>
              <p className="text-slate-400 max-w-md mb-8 font-medium">{mediaError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-slate-800 border border-white/10 text-white rounded-lg hover:bg-slate-700 transition-all font-bold uppercase text-xs tracking-widest"
              >
                Retry Connection
              </button>
            </div>
          )}
          {/* Remote Video (Main) */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          {/* Local Video (PIP) */}
          <div className="absolute bottom-4 right-4 w-48 aspect-video bg-slate-800 rounded-lg border border-white/20 overflow-hidden shadow-2xl z-20">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={cn("w-full h-full object-cover", isVirtualBg && "absolute opacity-0 pointer-events-none")}
              style={{ transform: isScreenSharing ? 'none' : 'scaleX(-1)' }}
            />
            <canvas
              ref={bgCanvasRef}
              className={cn("w-full h-full object-cover", !isVirtualBg && "hidden")}
              style={{ transform: isScreenSharing ? 'none' : 'scaleX(-1)' }}
            />
            {!isVideoOn && !isScreenSharing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400 border border-white/10">
                  {user.displayName?.charAt(0)}
                </div>
              </div>
            )}
          </div>

          {isWhiteboardOn && (
            <div className="absolute inset-0 bg-slate-800 z-15" />
          )}
          {isAnnotating && (
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair z-20"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
            />
          )}
          
          {/* Waiting List Overlay for Host */}
          {isHost && waitingUsersSnap && waitingUsersSnap.docs.length > 0 && (
            <div className="absolute top-4 left-4 z-40 w-64 flex flex-col gap-2">
              <div className="glass-panel p-3 border-amber-500/30 bg-amber-500/10 animate-pulse">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">Connection Requests</h4>
                <div className="flex flex-col gap-2">
                  {waitingUsersSnap.docs.map(docSnap => {
                    const wUser = docSnap.data();
                    return (
                      <div key={docSnap.id} className="flex items-center justify-between bg-slate-900/80 p-2 rounded border border-white/10">
                        <div className="flex items-center gap-2">
                          <img src={wUser.photoURL} className="w-6 h-6 rounded-full" />
                          <span className="text-[10px] font-bold text-slate-200 truncate max-w-[80px]">{wUser.displayName}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => admitUser(wUser.userId)} className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={() => denyUser(wUser.userId)} className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* Mini grid of other participants overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {participants.filter((p: string) => p !== user.uid).map((pUid: string) => (
              <div key={pUid} className="w-32 aspect-video bg-slate-800/80 backdrop-blur-sm border border-white/10 relative flex items-center justify-center rounded-lg overflow-hidden">
                <Video className="w-6 h-6 text-slate-500" />
                <span className="absolute bottom-1 left-1 bg-black/60 text-slate-300 text-[8px] font-semibold px-1.5 py-0.5 rounded border border-white/10">
                  Participant
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-4 z-30 pointer-events-none">
          {isVirtualBg && (
            <div className="pointer-events-auto flex gap-4 glass-panel p-2 items-center rounded-full">
              <select 
                value={bgType} 
                onChange={e => setBgType(e.target.value as any)}
                className="bg-slate-800 text-slate-200 text-xs font-semibold rounded px-2 py-1 border border-white/10 outline-none"
              >
                <option value="blur">Blur</option>
                <option value="color">Color</option>
                <option value="image">Image</option>
              </select>
              
              {bgType === 'color' && (
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={e => setBgColor(e.target.value)} 
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0" 
                />
              )}
              
              {bgType === 'image' && (
                <input 
                  type="text" 
                  placeholder="Image URL..." 
                  value={bgImage || ''} 
                  onChange={e => setBgImage(e.target.value)} 
                  className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-white/10 outline-none w-32"
                />
              )}
            </div>
          )}
          {isAnnotating && (
            <div className="pointer-events-auto flex gap-4 glass-panel p-2 items-center rounded-full">
              <div className="flex items-center gap-2 px-2">
                <label className="font-semibold text-xs uppercase text-slate-400">Color:</label>
                <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
              </div>
              <div className="flex items-center gap-2 px-2 border-l border-white/10 pl-4">
                <label className="font-semibold text-xs uppercase text-slate-400">Size:</label>
                <input type="range" min="2" max="20" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} className="w-24 accent-cyan-500" />
              </div>
            </div>
          )}
          <div className="pointer-events-auto flex flex-wrap gap-2 glass-panel p-2 rounded-full items-center justify-center">
            <button 
              onClick={toggleMic} 
              className={cn(
                "w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", 
                roomSnap?.atmosphere === 'silent' 
                  ? "bg-purple-950/40 border border-purple-500/20 text-purple-400 cursor-not-allowed" 
                  : !isMicOn && "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              )} 
              title={roomSnap?.atmosphere === 'silent' ? "Mics are disabled in Focus Library" : "Toggle Mic"}
            >
              {roomSnap?.atmosphere === 'silent' || !isMicOn ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button onClick={toggleVideo} className={cn("w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", !isVideoOn && "bg-red-500/20 text-red-400 hover:bg-red-500/30")} title="Toggle Video">
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button onClick={toggleScreenShare} className={cn("w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", isScreenSharing && "bg-cyan-600/20 text-cyan-400 hover:bg-cyan-500/30")} title="Share Screen">
              <MonitorUp className="w-5 h-5" />
            </button>
            <button onClick={() => setIsVirtualBg(!isVirtualBg)} className={cn("w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", isVirtualBg && "bg-purple-600/20 text-purple-400 hover:bg-purple-500/30")} title="Virtual Filter">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button onClick={toggleWhiteboard} className={cn("w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", isWhiteboardOn && "bg-slate-200 text-slate-900 hover:bg-slate-300")} title="Whiteboard">
              <Presentation className="w-5 h-5" />
            </button>
            <button onClick={() => setIsAnnotating(!isAnnotating)} className={cn("w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", isAnnotating && "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30")} title="Annotate">
              <PenTool className="w-5 h-5" />
            </button>
            {isAnnotating && (
              <button onClick={clearAnnotation} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors text-slate-300" title="Clear Annotations">
                <Eraser className="w-5 h-5" />
              </button>
            )}
            <button onClick={captureSlide} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-700/50 transition-colors text-slate-300 relative" title="Capture Slide for AI Report">
              <Camera className="w-5 h-5" />
              {slides.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(248,113,113,0.8)]">
                  {slides.length}
                </span>
              )}
            </button>
            <button onClick={handleEndSession} className="min-h-[44px] px-6 flex items-center justify-center bg-red-500/20 text-red-400 font-bold uppercase rounded-full border border-red-500/30 hover:bg-red-500/30 transition-colors ml-2 ambient-glow">
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Private Chat */}
      <div className="w-full md:w-80 bg-slate-900/80 backdrop-blur-md border-l border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 bg-slate-800/50">
          <h3 className="font-semibold uppercase tracking-widest text-sm text-slate-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" /> Room Chat
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-transparent">
          {messagesSnap?.docs.map(docSnap => {
            const msg = docSnap.data();
            const isMe = msg.authorUid === user.uid;
            return (
              <div key={docSnap.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                <span className="text-[10px] font-semibold text-slate-500 mb-1">{msg.authorName}</span>
                <div className={cn(
                  "p-3 font-medium text-sm max-w-[90%] rounded-2xl",
                  isMe ? "bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 rounded-tr-sm" : "bg-slate-800/80 text-slate-200 border border-white/10 rounded-tl-sm"
                )}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex gap-2 bg-slate-800/50">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type..." 
            className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <button type="submit" className="bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 p-2 rounded-lg hover:bg-cyan-500/30 transition-colors ambient-glow">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};


// --- Main App Shell ---

const MyConnectionsPage = ({ user }: { user: any }) => {
  const [userData] = useDocumentData(doc(db, 'users', user.uid));
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userData?.connections || userData.connections.length === 0) {
      setConnections([]);
      return;
    }

    const fetchConnections = async () => {
      setLoading(true);
      try {
        const uids = userData.connections;
        const results: any[] = [];
        
        // Firestore 'in' query limit is 10, so we chunk the requests
        for (let i = 0; i < uids.length; i += 10) {
          const chunk = uids.slice(i, i + 10);
          const q = query(collection(db, 'users'), where('uid', 'in', chunk));
          const snap = await getDocs(q);
          results.push(...snap.docs.map(d => d.data()));
        }
        setConnections(results);
      } catch (error) {
        console.error("Error fetching connections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [userData?.connections]);

  return (
    <div className="w-full max-w-5xl glass-panel border-beam p-8 ambient-glow scroll-fade">
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
        <Users className="w-10 h-10 text-cyan-400" />
        <h2 className="text-4xl font-bold tracking-tight text-slate-200 tech-hover inline-block">My Connections</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-semibold text-xl">
          You haven't connected with anyone yet. Explore to find peers!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((conn, i) => (
            <div key={conn.uid} className="glass-panel border border-white/10 p-6 flex flex-col items-center text-center gap-4 scroll-fade" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="relative">
                <img src={conn.photoURL} alt={conn.username} className="w-20 h-20 rounded-full border-2 border-cyan-500/30 object-cover shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
                {conn.isOnline && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-200">@{conn.username}</h3>
                <p className="font-medium text-slate-400 text-sm">{conn.displayName}</p>
              </div>
              {conn.skills && conn.skills.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 px-2 py-1 rounded-full">
                    {conn.skills[0].name} ({conn.skills[0].level})
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mt-2">
                {conn.portfolioUrl && (
                  <a href={conn.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {conn.learningPreference || 'Visual'}
                </span>
              </div>
              <div className="mt-auto pt-4 w-full border-t border-white/5 flex justify-center gap-4">
                <button className="text-slate-400 hover:text-cyan-400 transition-colors" title="Send Message">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="text-slate-400 hover:text-purple-400 transition-colors" title="Start Video Call">
                  <Video className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState('Study Desk');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  const userSettingsRef = user ? doc(db, 'user_settings', user.uid) : null;
  const [globalSettingsData] = useDocumentData(userSettingsRef);

  useEffect(() => {
    if (!user) {
      document.body.classList.remove('theme-dark', 'theme-amber', 'theme-purple', 'theme-emerald', 'theme-cyberpunk', 'theme-vaporwave', 'theme-crimson');
      return;
    }
    const theme = globalSettingsData?.theme_preference || 'dark';
    document.body.classList.remove('theme-dark', 'theme-amber', 'theme-purple', 'theme-emerald', 'theme-cyberpunk', 'theme-vaporwave', 'theme-crimson');
    if (['amber', 'purple', 'emerald', 'cyberpunk', 'vaporwave', 'crimson'].includes(theme)) {
      document.body.classList.add(`theme-${theme}`);
    } else {
      document.body.classList.add('theme-dark');
    }
  }, [globalSettingsData, user]);

  // Global Toast Notifications state (Section 3)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Notification states and real-time query subscriptions
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);

  const [requestsSnap] = useCollection(
    user ? query(collection(db, 'connectionRequests'), where('toUid', '==', user.uid), where('status', '==', 'pending')) : null
  );

  const [messagesSnap] = useCollection(
    user 
      ? query(
          collection(db, 'messages'), 
          orderBy('createdAt', 'desc'), 
          limit(100)
        )
      : null
  );

  // Helper to read last read times for a room
  const getRoomLastRead = (roomId: string) => {
    try {
      const data = localStorage.getItem(`lastRead_${user?.uid}_${roomId}`);
      return data ? parseInt(data, 10) : 0;
    } catch {
      return 0;
    }
  };

  // Helper to set last read times for a room
  const setRoomLastRead = (roomId: string) => {
    try {
      localStorage.setItem(`lastRead_${user?.uid}_${roomId}`, Date.now().toString());
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to fetch visited rooms
  const getVisitedRooms = (): string[] => {
    try {
      const data = localStorage.getItem(`visitedRooms_${user?.uid}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // Helper to add room to visited set
  const addVisitedRoom = (roomId: string) => {
    try {
      const rooms = getVisitedRooms();
      if (!rooms.includes(roomId)) {
        rooms.push(roomId);
        localStorage.setItem(`visitedRooms_${user?.uid}`, JSON.stringify(rooms));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Keep tracking unread messages
  useEffect(() => {
    if (!user || !messagesSnap) return;
    const visited = getVisitedRooms();
    const unreadTemp: any[] = [];

    messagesSnap.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (!data) return;
      const msgRoomId = data.roomId;
      if (!msgRoomId) return;

      // Do not count our own messages as unread
      if (data.authorUid === user.uid) return;

      // Unread messages should either be in private chats involving us (containing our uid)
      // or other study rooms we have visited/joined
      const isPrivateChat = msgRoomId.includes(user.uid);
      const isVisitedRoom = visited.includes(msgRoomId);

      if (isPrivateChat || isVisitedRoom) {
        const lastRead = getRoomLastRead(msgRoomId);
        let msgTime = 0;
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            msgTime = data.createdAt.toDate().getTime();
          } else if (data.createdAt.seconds) {
            msgTime = data.createdAt.seconds * 1000;
          } else {
            msgTime = new Date(data.createdAt).getTime();
          }
        }
        
        if (msgTime > lastRead) {
          unreadTemp.push({
            id: docSnap.id,
            ...data,
            createdAtTime: msgTime
          });
        }
      }
    });

    setUnreadMessages(unreadTemp);
  }, [messagesSnap, user, activeRoomId]);

  // When visiting/entering an activeRoomId, mark it as read immediately
  useEffect(() => {
    if (user && activeRoomId) {
      addVisitedRoom(activeRoomId);
      setRoomLastRead(activeRoomId);
      setUnreadMessages(prev => prev.filter(m => m.roomId !== activeRoomId));
    }
  }, [user, activeRoomId]);

  const handleDropdownRequest = async (docId: string, fromUid: string, action: 'accepted' | 'declined') => {
    try {
      await updateDoc(doc(db, 'connectionRequests', docId), { status: action });
      if (action === 'accepted') {
        await updateDoc(doc(db, 'users', user.uid), { connections: arrayUnion(fromUid) });
        await updateDoc(doc(db, 'users', fromUid), { connections: arrayUnion(user.uid) });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `connectionRequests/${docId} or users/${user.uid} or users/${fromUid}`);
    }
  };

  // Global mouse move for torch effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle online status
  useEffect(() => {
    if (!user) return;
    const handleBeforeUnload = () => {
      updateDoc(doc(db, 'users', user.uid), { isOnline: false, lastSeen: serverTimestamp() }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [user]);

  const handleSignOut = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { isOnline: false, lastSeen: serverTimestamp() });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
    await signOut(auth);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      <div className="torch-effect" />
      
      {/* Top Banner */}
      <div className="bg-slate-900/80 backdrop-blur-md text-slate-300 text-[10px] sm:text-xs font-semibold tracking-widest py-2 px-4 flex items-center gap-2 border-b border-white/10">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        JOIN THE "REACT MASTERCLASS" SESSION AT 6 PM • EARN KARMA BY HELPING PEERS!
      </div>

      {/* Navbar */}
      <nav className="h-16 glass-panel flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-theme-primary drop-shadow-[0_0_8px_var(--glow-color)] transition-all duration-300" />
            <span className="text-xl font-bold tracking-tight text-slate-200 hidden sm:block">SkillSwap</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
            {['Study Desk', 'Explore', 'My Connections', 'Sessions', 'AI Solver', 'Profile'].map(tab => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setActiveRoomId(null); }}
                className={cn(
                  "hover:text-theme-primary transition-colors relative py-2",
                  activeTab === tab && !activeRoomId && "text-theme-primary drop-shadow-[0_0_8px_var(--glow-color)]"
                )}
              >
                {tab === 'AI Solver' && <BrainCircuit className="w-4 h-4 inline-block mr-1 mb-0.5" />}
                {tab}
                {activeTab === tab && !activeRoomId && (
                  <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-primary shadow-[0_0_8px_var(--glow-color)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-slate-800/50 border border-white/10 rounded-full font-semibold text-sm hover:bg-slate-700/50 transition-all text-slate-200 ambient-glow">
            <Star className="w-4 h-4 text-theme-primary" /> Karma
          </button>

          {/* Notification Bell with Badge Count */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className={cn(
                "p-2 bg-slate-800/50 border border-white/10 rounded-full text-slate-300 hover:text-theme-primary hover:scale-110 transition-all relative",
                (requestsSnap?.docs.length || 0) + unreadMessages.length > 0 && "text-theme-primary shadow-[0_0_12px_var(--glow-color)]"
              )}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {(requestsSnap?.docs.length || 0) + unreadMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-theme-primary to-theme-secondary text-slate-950 font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_8px_var(--glow-color)] border border-slate-950 animate-bounce">
                  {(requestsSnap?.docs.length || 0) + unreadMessages.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel shadow-2xl bg-slate-950/95 border border-white/10 backdrop-blur-xl rounded-xl z-50 p-4 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <h4 className="font-bold text-slate-200 uppercase tracking-widest text-xs flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-theme-primary" /> Notifications
                  </h4>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-500 hover:text-slate-300 transition-colors text-xs font-semibold"
                  >
                    Clear Look
                  </button>
                </div>

                <div className="max-h-[320px] overflow-y-auto flex flex-col gap-4 pr-1">
                  {/* Category: Pending Requests */}
                  {requestsSnap && requestsSnap.docs.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase">
                        Connection Requests ({requestsSnap.docs.length})
                      </span>
                      {requestsSnap.docs.map(docSnap => {
                        const req = docSnap.data();
                        return (
                          <div key={docSnap.id} className="flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded-xl">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-200 text-sm">{req.fromName}</span>
                              <span className="text-[10px] text-slate-500">wants to connect</span>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleDropdownRequest(docSnap.id, req.fromUid, 'accepted')}
                                className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-cyan-500/30 transition-colors"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleDropdownRequest(docSnap.id, req.fromUid, 'declined')}
                                className="px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-red-500/30 transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Category: Unread Messages */}
                  {unreadMessages.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                        Unread Chats ({unreadMessages.length})
                      </span>
                      {unreadMessages.map(msg => (
                        <div 
                          key={msg.id} 
                          onClick={() => {
                            setRoomLastRead(msg.roomId);
                            setActiveRoomId(msg.roomId);
                            setShowNotifications(false);
                          }}
                          className="flex flex-col gap-1 bg-white/5 border border-white/5 p-3 rounded-xl cursor-pointer hover:bg-cyan-400/10 hover:border-cyan-500/20 active:scale-98 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-cyan-300 text-xs">@{msg.authorName}</span>
                            <span className="text-[8px] font-mono text-slate-500">
                              {new Date(msg.createdAtTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm truncate">{msg.text}</p>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Click to open chat →
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* Empty State */}
                  {(requestsSnap?.docs.length || 0) === 0 && unreadMessages.length === 0 && (
                    <div className="text-center py-8 flex flex-col items-center justify-center gap-2">
                      <Bell className="w-8 h-8 text-slate-600 border border-dashed border-slate-700/50 p-1.5 rounded-full" />
                      <p className="text-slate-300 font-bold text-sm">Perfectly Clear!</p>
                      <p className="text-slate-500 text-xs">You have no pending requests or unread messages.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => { setActiveTab('Profile'); setActiveRoomId(null); }} className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-slate-800 hover:scale-110 transition-transform">
            <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Avatar" className="w-full h-full object-cover" />
          </button>
          <button onClick={handleSignOut} className="text-slate-400 hover:text-cyan-400 transition-colors" title="Sign Out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 flex justify-center items-start">
        {activeRoomId ? (
        <VideoRoom user={user} roomId={activeRoomId} onLeave={(tab) => { setActiveRoomId(null); if (tab) setActiveTab(tab); }} showToast={showToast} />
        ) : (
          <>
            {activeTab === 'Study Desk' && <Dashboard user={user} onJoinRoom={(id) => setActiveRoomId(id)} showToast={showToast} />}
            {activeTab === 'Explore' && <ExplorePage user={user} showToast={showToast} />}
            {activeTab === 'My Connections' && <MyConnectionsPage user={user} />}
            {activeTab === 'Sessions' && <SessionsPage user={user} />}
            {activeTab === 'AI Solver' && <AIDoubtSolver user={user} />}
            {activeTab === 'Profile' && <ProfilePage user={user} showToast={showToast} />}
          </>
        )}
      </main>

      {/* Floating Animated Toast Notifications layout (Section 3 of User Request) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.92 }}
              className={cn(
                "p-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center justify-between text-xs font-bold uppercase tracking-wider relative overflow-hidden",
                toast.type === 'success' ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300" :
                toast.type === 'error' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                "bg-slate-900/90 border-white/10 text-slate-300"
              )}
            >
              {/* Subtle accent bar */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                toast.type === 'success' ? "bg-cyan-400" :
                toast.type === 'error' ? "bg-red-500" :
                "bg-slate-500"
              )} />
              <span className="pl-2">{toast.message}</span>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-4 text-slate-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
