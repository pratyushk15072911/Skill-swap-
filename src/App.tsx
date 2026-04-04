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
  Clock, Timer
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


const ProfilePage = ({ user }: { user: any }) => {
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
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
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
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const addSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        skills: arrayUnion({ name: newSkillName.trim(), level: newSkillLevel })
      });
      setNewSkillName('');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const removeSkill = async (skillObj: any) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        skills: arrayRemove(skillObj)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  if (loading) return <div className="p-8 font-black uppercase text-2xl">Loading Profile...</div>;

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
    </div>
  );
};

const ExplorePage = ({ user }: { user: any }) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Fetch pending connection requests sent TO the current user
  const [requestsSnap] = useCollection(
    query(collection(db, 'connectionRequests'), where('toUid', '==', user.uid), where('status', '==', 'pending'))
  );

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
      alert('Connection request sent!');
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

      {/* Search */}
      <div className="glass-panel border-beam p-8 ambient-glow scroll-fade" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-4xl font-bold tracking-tight mb-6 text-slate-200 tech-hover inline-block">Explore Network</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {searchResults.map((u, i) => (
            <div key={u.uid} className="glass-panel border border-white/10 p-6 flex flex-col gap-4 scroll-fade" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center gap-4">
                <img src={u.photoURL} alt={u.username} className="w-16 h-16 rounded-full border border-white/10 object-cover" />
                <div>
                  <h3 className="font-bold text-xl text-slate-200">@{u.username}</h3>
                  <p className="font-medium text-slate-400 text-sm">{u.displayName}</p>
                </div>
              </div>
              <p className="font-medium text-sm line-clamp-2 text-slate-300">{u.bio}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {u.skills?.slice(0, 3).map((s: any) => (
                  <span key={s.name} className="text-[10px] font-semibold uppercase bg-slate-800/50 text-slate-300 border border-white/10 px-2 py-1 rounded-full">
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

const Dashboard = ({ user, onJoinRoom }: { user: any, onJoinRoom: (roomId: string) => void }) => {
  const [userData] = useDocumentData(doc(db, 'users', user.uid));
  const [onlineConnections, setOnlineConnections] = useState<any[]>([]);
  const [joinRoomId, setJoinRoomId] = useState('');
  
  // Post Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [postType, setPostType] = useState<'teach'|'learn'>('teach');
  const [postSkill, setPostSkill] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postTiming, setPostTiming] = useState('');
  const [postDuration, setPostDuration] = useState('');
  const [postLevel, setPostLevel] = useState('Beginner');
  const [postLanguage, setPostLanguage] = useState('English');

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
      isActive: true
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
        alert("Room is full (max 15 participants).");
        return;
      }
      onJoinRoom(joinRoomId.trim());
    } else {
      alert("Room not found.");
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
        createdAt: serverTimestamp()
      });
      setShowPostModal(false);
      setPostSkill('');
      setPostDesc('');
      setPostTiming('');
      setPostDuration('');
      setPostLevel('Beginner');
      setPostLanguage('English');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    }
  };

  const joinPostRoom = async (postId: string, authorUid: string) => {
    const roomRef = doc(db, 'rooms', postId);
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
  };

  return (
    <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 relative">
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
      <div className="w-full lg:w-1/4 flex flex-col gap-6">
        <div className="glass-panel border-beam p-6 flex flex-col ambient-glow scroll-fade">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-slate-200 tech-hover inline-block">Your Desk</h2>
            <Coffee className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mb-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Username</p>
            <p className="font-medium text-slate-300">@{userData?.username}</p>
          </div>
          <div className="mb-8">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Teaching</p>
            <div className="flex flex-wrap gap-2">
              {userData?.skills?.slice(0, 3).map((s: any) => (
                <span key={s.name} className="inline-block px-3 py-1 bg-slate-800/50 border border-white/10 rounded-full text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                  {s.name} <span className="text-cyan-500 ml-1 opacity-70">{s.level}</span>
                </span>
              ))}
              {(!userData?.skills || userData.skills.length === 0) && <span className="text-xs font-semibold text-slate-500">None yet</span>}
            </div>
          </div>
        </div>

        <div className="glass-panel border border-white/10 p-6 flex flex-col scroll-fade" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold text-slate-200 mb-4 tech-hover inline-block">AI Matchmaker</h2>
          <p className="text-sm font-medium text-slate-400 mb-6">
            "We found 3 students who want to learn what you teach."
          </p>
          <button className="w-full py-3 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg font-semibold hover:bg-purple-500/30 transition-all ambient-glow">
            View Matches
          </button>
        </div>
      </div>

      {/* Middle Column */}
      <div className="w-full lg:w-2/4 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-200 tech-hover inline-block">Bulletin Board</h2>
          <button onClick={() => setShowPostModal(true)} className="px-6 py-3 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 rounded-lg font-semibold flex items-center gap-2 hover:bg-cyan-500/30 transition-all ambient-glow">
            <Plus className="w-4 h-4" /> Post a Skill
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto max-h-[800px] pr-2">
          {postsSnap?.docs.map((docSnap, i) => {
            const post = docSnap.data();
            const date = post.createdAt?.toDate().toLocaleDateString() || 'Just now';
            return (
              <div key={docSnap.id} className="glass-panel border-beam p-6 ambient-glow scroll-fade" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-slate-800">
                      <img src={post.authorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUid}`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200">{post.authorName}</h3>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{post.type === 'teach' ? 'Offering' : 'Requesting'}</p>
                    </div>
                  </div>
                  <span className={cn("px-3 py-1 border rounded-full text-xs font-semibold", post.type === 'teach' ? "bg-teal-500/20 text-teal-300 border-teal-500/30" : "bg-purple-500/20 text-purple-300 border-purple-500/30")}>{post.skill}</span>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <div className="flex flex-col gap-3 w-full">
                    <div className="bg-slate-800/30 border border-white/5 p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Topic / Description</p>
                      <h4 className="text-2xl font-medium text-slate-200">{post.description}</h4>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-1">
                      {post.level && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <BrainCircuit className="w-4 h-4 text-purple-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{post.level}</span>
                        </div>
                      )}
                      {post.timing && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-semibold uppercase tracking-wider">{post.timing}</span>
                        </div>
                      )}
                      {post.duration && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Timer className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-semibold uppercase tracking-wider">{post.duration}</span>
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
                          <span className="text-[10px] font-bold uppercase tracking-widest">{post.language}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-xs font-semibold text-slate-500">{date}</span>
                  <div className="flex gap-4">
                    <button onClick={() => joinPostRoom(docSnap.id, post.authorUid)} className="px-4 py-1.5 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-500/30 transition-all ambient-glow">
                      <Video className="w-4 h-4" /> Join Call
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {postsSnap?.docs.length === 0 && (
            <div className="text-center py-8 font-semibold text-slate-500">No posts yet. Be the first!</div>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6">
        {/* Group Rooms Card */}
        <div className="glass-panel border-beam p-6 flex flex-col gap-4 ambient-glow scroll-fade" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-semibold uppercase tracking-widest text-sm text-slate-400 border-b border-white/10 pb-2 tech-hover inline-block">Group Study (Max 15)</h2>
          <button onClick={createGroupRoom} className="w-full py-2 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-cyan-500/30 transition-all ambient-glow">
            <Video className="w-4 h-4" /> Create Room
          </button>
          <form onSubmit={handleJoinSubmit} className="flex gap-2">
            <input type="text" value={joinRoomId} onChange={e => setJoinRoomId(e.target.value)} placeholder="Room ID" className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg p-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500" />
            <button type="submit" className="bg-slate-800/50 border border-white/10 text-slate-300 px-3 rounded-lg font-semibold hover:bg-slate-700/50 transition-colors">Join</button>
          </form>
        </div>

        {/* Online Connections Card */}
        <div className="glass-panel border border-white/10 p-6 flex flex-col h-full min-h-[300px] scroll-fade" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-semibold uppercase tracking-widest text-sm text-slate-400 mb-6 border-b border-white/10 pb-2 tech-hover inline-block">Online Connections ({onlineConnections.length})</h2>
          <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
            {onlineConnections.length === 0 && (
              <p className="text-sm font-semibold text-slate-500 italic">No connections online right now.</p>
            )}
            {onlineConnections.map(conn => (
              <div key={conn.uid} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={conn.photoURL} className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  </div>
                  <span className="font-semibold text-sm text-slate-300">@{conn.username}</span>
                </div>
                <button 
                  onClick={() => startPrivateRoom(conn.uid)}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 rounded-full hover:scale-110 transition-all ambient-glow"
                  title="Start Private Video Chat"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoRoom = ({ user, roomId, onLeave }: { user: any, roomId: string, onLeave: (tab?: string) => void }) => {
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
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const selfieSegmentationRef = useRef<SelfieSegmentation | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const bgSettingsRef = useRef({ type: bgType, color: bgColor, image: bgImageRef.current });

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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesSnap]);

  useEffect(() => {
    if (roomLoading) return;
    
    if (isHost) {
      if (!hasJoined) {
        const roomRef = doc(db, 'rooms', roomId);
        updateDoc(roomRef, { participants: arrayUnion(user.uid) }).catch(console.error);
        setHasJoined(true);
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
          updateDoc(roomRef, { participants: arrayUnion(user.uid) }).catch(console.error);
          setHasJoined(true);
        }
      }
    }
  }, [roomLoading, isHost, hasJoined, waitingLoading, waitingUserSnap, roomId, user]);

  useEffect(() => {
    if (!hasJoined) return;
    
    // Initialize Media
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to get media", err);
      }
    };
    initMedia();

    return () => {
      const roomRef = doc(db, 'rooms', roomId);
      updateDoc(roomRef, { participants: arrayRemove(user.uid) }).catch(console.error);
      streamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      cameraRef.current?.stop();
      selfieSegmentationRef.current?.close();
    };
  }, [roomId, user.uid, hasJoined]);

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

  // Annotation Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAnnotating) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAnnotating || !isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearAnnotation = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        <div className="flex justify-between items-center mb-4 z-10">
          <div className="bg-red-500/20 text-red-400 px-3 py-1 font-semibold uppercase text-xs border border-red-500/30 flex items-center gap-2 animate-pulse rounded-full">
            <div className="w-2 h-2 bg-red-400 rounded-full shadow-[0_0_8px_rgba(248,113,113,0.8)]" /> Live
          </div>
          <div className="bg-slate-800/50 text-slate-300 px-3 py-1 font-semibold uppercase text-xs border border-white/10 flex items-center gap-2 rounded-full">
            Room ID: <span className="select-all bg-slate-700/50 px-2 py-0.5 rounded text-cyan-300">{roomId}</span>
          </div>
          <div className="bg-cyan-600/20 text-cyan-300 px-3 py-1 font-semibold uppercase text-xs border border-cyan-500/30 rounded-full">
            {participants.length}/15 Joined
          </div>
        </div>

        {/* Main Video / Screen Share Area */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden mb-20 rounded-xl border border-white/10 bg-black shadow-[0_0_30px_rgba(0,0,0,0.5)]">
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
          {!isVideoOn && !isScreenSharing && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
              <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center text-5xl font-bold text-slate-400 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                {user.displayName?.charAt(0)}
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
          <div className="pointer-events-auto flex gap-2 glass-panel p-2 rounded-full">
            <button onClick={toggleMic} className={cn("p-3 rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", !isMicOn && "bg-red-500/20 text-red-400 hover:bg-red-500/30")} title="Toggle Mic">
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button onClick={toggleVideo} className={cn("p-3 rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", !isVideoOn && "bg-red-500/20 text-red-400 hover:bg-red-500/30")} title="Toggle Video">
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button onClick={toggleScreenShare} className={cn("p-3 rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", isScreenSharing && "bg-cyan-600/20 text-cyan-400 hover:bg-cyan-500/30")} title="Share Screen">
              <MonitorUp className="w-5 h-5" />
            </button>
            <button onClick={() => setIsVirtualBg(!isVirtualBg)} className={cn("p-3 rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", isVirtualBg && "bg-purple-600/20 text-purple-400 hover:bg-purple-500/30")} title="Virtual Filter">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button onClick={toggleWhiteboard} className={cn("p-3 rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", isWhiteboardOn && "bg-slate-200 text-slate-900 hover:bg-slate-300")} title="Whiteboard">
              <Presentation className="w-5 h-5" />
            </button>
            <button onClick={() => setIsAnnotating(!isAnnotating)} className={cn("p-3 rounded-full hover:bg-slate-700/50 transition-colors text-slate-300", isAnnotating && "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30")} title="Annotate">
              <PenTool className="w-5 h-5" />
            </button>
            {isAnnotating && (
              <button onClick={clearAnnotation} className="p-3 rounded-full hover:bg-slate-700/50 transition-colors text-slate-300" title="Clear Annotations">
                <Eraser className="w-5 h-5" />
              </button>
            )}
            <button onClick={captureSlide} className="p-3 rounded-full hover:bg-slate-700/50 transition-colors text-slate-300 relative" title="Capture Slide for AI Report">
              <Camera className="w-5 h-5" />
              {slides.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(248,113,113,0.8)]">
                  {slides.length}
                </span>
              )}
            </button>
            <button onClick={handleEndSession} className="px-6 py-2 bg-red-500/20 text-red-400 font-semibold uppercase rounded-full border border-red-500/30 hover:bg-red-500/30 transition-colors ml-2 ambient-glow">
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
            <GraduationCap className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-xl font-bold tracking-tight text-slate-200 hidden sm:block">SkillSwap</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
            {['Study Desk', 'Explore', 'My Connections', 'Sessions', 'AI Solver', 'Profile'].map(tab => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setActiveRoomId(null); }}
                className={cn(
                  "hover:text-cyan-400 transition-colors relative py-2",
                  activeTab === tab && !activeRoomId && "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                )}
              >
                {tab === 'AI Solver' && <BrainCircuit className="w-4 h-4 inline-block mr-1 mb-0.5" />}
                {tab}
                {activeTab === tab && !activeRoomId && (
                  <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-slate-800/50 border border-white/10 rounded-full font-semibold text-sm hover:bg-slate-700/50 transition-all text-slate-200 ambient-glow">
            <Star className="w-4 h-4 text-cyan-400" /> Karma
          </button>
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
        <VideoRoom user={user} roomId={activeRoomId} onLeave={(tab) => { setActiveRoomId(null); if (tab) setActiveTab(tab); }} />
        ) : (
          <>
            {activeTab === 'Study Desk' && <Dashboard user={user} onJoinRoom={(id) => setActiveRoomId(id)} />}
            {activeTab === 'Explore' && <ExplorePage user={user} />}
            {activeTab === 'My Connections' && <MyConnectionsPage user={user} />}
            {activeTab === 'Sessions' && <SessionsPage user={user} />}
            {activeTab === 'AI Solver' && <AIDoubtSolver user={user} />}
            {activeTab === 'Profile' && <ProfilePage user={user} />}
          </>
        )}
      </main>
    </div>
  );
}
