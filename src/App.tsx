import { useState, useEffect, useRef } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc, getDocs, limit, where, updateDoc, deleteDoc, arrayUnion } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, LogOut, Plus, Sparkles, Coffee, Lamp, Send, MessageSquare, Wand2, Video as VideoIcon, VideoOff, Mic, MicOff, X, PhoneOff, Settings, Code, Cpu, Atom, Book, Pencil, Calculator, Binary, Dna, FlaskConical, Microscope, Monitor, Hand, Clipboard, Eraser, BrainCircuit, Image as ImageIcon, Film, Volume2, Loader2, Save, FileText, Lightbulb, Ruler, XCircle, Clock, Users, Check, ShieldAlert, ShieldCheck, Lock, Radio, Square, Download, Search, UserPlus, Calendar, Camera, Award, BookOpen } from 'lucide-react';
import { cn } from './lib/utils';
import { GoogleGenAI, Modality, ThinkingLevel, Type } from "@google/genai";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { io } from "socket.io-client";
import Peer from "simple-peer";

// --- Types ---
interface UserProfile {
  uid: string;
  displayName: string;
  username?: string;
  email: string;
  photoURL?: string;
  college?: string;
  bio?: string;
  skillsToTeach?: string[];
  skillsToLearn?: string[];
  certificates?: { name: string; url: string; issuedBy: string }[];
  karma?: number;
  connections?: string[];
  isOnline?: boolean;
  lastSeen?: any;
}

interface ConnectionRequest {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
}

interface SessionRecord {
  id: string;
  participants: string[];
  duration: number;
  roomId: string;
  createdAt: any;
}

// --- Components ---

const BrutalistHero = () => {
  return (
    <div className="relative w-full h-full bg-[#FFD700] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
      {/* Top Nav Tabs */}
      <div className="flex border-b-4 border-black bg-[#FF80BF]">
        {['HOME', 'NEWS', 'CLASS', 'ABOUT US', 'CONTACT', 'FAQ'].map((tab, i) => (
          <div key={tab} className={cn(
            "flex-1 py-3 text-[10px] font-black text-center border-r-4 border-black last:border-r-0 hover:bg-white transition-colors cursor-pointer",
            i === 0 && "bg-white"
          )}>
            {tab}
          </div>
        ))}
        <div className="px-4 flex items-center border-l-4 border-black bg-white">
          <div className="w-6 h-0.5 bg-black mb-1" />
          <div className="w-6 h-0.5 bg-black mb-1" />
          <div className="w-6 h-0.5 bg-black" />
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Content */}
        <div className="flex-1 p-8 relative border-r-4 border-black md:border-r-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-4 bg-black/10 rounded-full" />
            <div className="w-4 h-4 bg-black rounded-full" />
          </div>
          
          <h1 className="text-6xl font-black text-black leading-none mb-4 uppercase tracking-tighter">
            BE AN <br />
            <span className="bg-[#C0A0FF] px-2 border-4 border-black inline-block my-2 text-[#FFD700] [-webkit-text-stroke:2px_black]">INTERNATIONAL</span> <br />
            STUDENT
          </h1>

          <p className="text-lg font-bold text-black/80 max-w-xs mb-8 leading-tight">
            SkillSwap connects you with peers globally to trade knowledge and build your future.
          </p>

          <div className="bg-[#C0A0FF] border-4 border-black p-3 flex items-center gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-10 h-10 bg-white border-4 border-black rounded-full flex items-center justify-center">
              <Monitor className="w-6 h-6 text-black" />
            </div>
            <span className="font-black text-sm uppercase">www.skillswap.edu</span>
          </div>

          {/* Decorative Icons */}
          <div className="absolute top-10 right-10">
             <div className="relative">
               <Lightbulb className="w-12 h-12 text-black fill-[#FFD700]" />
               <div className="absolute -top-2 -right-2 w-4 h-4 bg-black rounded-full" />
             </div>
          </div>
          <div className="absolute bottom-20 right-10">
             <Pencil className="w-12 h-12 text-[#FF80BF] rotate-12" />
          </div>
          <div className="absolute bottom-40 right-4">
             <Ruler className="w-16 h-16 text-[#C0A0FF] -rotate-45" />
          </div>
          <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-1">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="w-1 h-1 bg-black rounded-full" />
             ))}
          </div>
        </div>

        {/* Right Image Area */}
        <div className="flex-1 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-12 bg-[#C0A0FF] border-b-4 border-black flex items-center justify-between px-4">
            <div className="flex gap-1">
              <div className="w-8 h-8 border-2 border-black rotate-45" />
              <div className="w-8 h-8 border-2 border-black" />
            </div>
            <span className="font-black text-xs">SKILLSWAP LOGO</span>
          </div>
          
          <img 
            src="https://images.unsplash.com/photo-1523240715630-9918c13d190c?auto=format&fit=crop&q=80&w=1000" 
            alt="Student" 
            className="w-full h-full object-cover pt-12"
            referrerPolicy="no-referrer"
          />

          <div className="absolute bottom-0 left-0 bg-[#FFD700] border-t-4 border-r-4 border-black p-6">
            <div className="text-6xl font-black leading-none">20<br />27</div>
          </div>
          
          <div className="absolute bottom-4 right-4 flex gap-2">
             <div className="w-4 h-4 border-2 border-black rotate-45" />
             <div className="w-4 h-4 border-2 border-black rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Button = ({ className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: 'bg-[#0080FF] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
    secondary: 'bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
    ghost: 'text-black hover:bg-black/5',
  };
  return (
    <button
      className={cn(
        'px-6 py-2 transition-all duration-200 font-black uppercase tracking-tighter flex items-center justify-center gap-2 cursor-pointer',
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    />
  );
};

const Card = ({ className, children }: any) => (
  <div className={cn('bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]', className)}>
    {children}
  </div>
);

const BackgroundVisuals = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
      {/* Grid Pattern */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }} />
      
      {/* Large Brutalist Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square bg-[#C0A0FF] border-8 border-black rounded-full rotate-12" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square bg-[#FF80BF] border-8 border-black rotate-[-12deg]" />
      <div className="absolute top-1/2 left-[-5%] w-32 h-32 bg-[#FFD700] border-4 border-black rotate-45" />
    </div>
  );
};

const AIAssistant = ({ user }: { user: any }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: "gemini-3.1-pro-preview",
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            systemInstruction: "You are the SkillSwap AI Study Assistant. You help engineering and science students with complex problems, study plans, and skill development. Be precise, encouraging, and highly technical when needed.",
          },
        });
      }

      const result = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: result.text || 'I encountered an error processing that.' }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] p-6 bg-gradient-to-br from-white to-[#fdfdfb] border-[#5A5A40]/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#5A5A40] p-2 rounded-2xl text-white">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg">AI Study Assistant</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Powered by Gemini 3.1 Pro</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
            <Sparkles className="w-12 h-12 mb-4 text-[#5A5A40]" />
            <p className="text-sm italic">"How can I help you master your engineering skills today?"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
            <div className={cn(
              "px-4 py-3 rounded-2xl text-sm max-w-[90%] break-words shadow-sm",
              msg.role === 'user' ? "bg-[#5A5A40] text-white rounded-tr-none" : "bg-white border border-gray-100 text-[#1a1a1a] rounded-tl-none"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-none animate-pulse text-xs text-gray-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your studies..."
          className="flex-1 bg-[#f5f5f0] border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#5A5A40] outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 bg-[#5A5A40] text-white rounded-2xl hover:bg-[#4A4A30] transition-all disabled:opacity-50 shadow-md active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </Card>
  );
};

const AILab = ({ user }: { user: any }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setVideoUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const base64Data = image.split(',')[1];
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              { text: "Analyze this image in the context of engineering or science studies. What concepts are shown, and how can a student learn more about them?" },
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
            ]
          }
        ],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });
      setAnalysis(response.text || 'No analysis available.');
    } catch (error) {
      console.error("Analysis Error:", error);
      setAnalysis("Failed to analyze image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateVideo = async () => {
    if (!image) return;
    setIsGeneratingVideo(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const base64Data = image.split(',')[1];
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: videoPrompt || 'Animate this scientific concept with smooth motion',
        image: {
          imageBytes: base64Data,
          mimeType: 'image/jpeg',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY as string }
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Video Generation Error:", error);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#0080FF] p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Visual Study Lab</h2>
        </div>

        <div className="space-y-6">
          <div 
            className="aspect-video bg-white border-4 border-dashed border-black flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <>
                <Plus className="w-12 h-12 text-gray-300 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm text-gray-400">Upload diagram or photo</p>
              </>
            )}
            <input id="image-upload" type="file" hidden accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="flex gap-4">
            <Button 
              className="flex-1" 
              disabled={!image || isAnalyzing} 
              onClick={analyzeImage}
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Analyze Concepts
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1" 
              disabled={!image || isGeneratingVideo} 
              onClick={generateVideo}
            >
              {isGeneratingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
              Animate with Veo
            </Button>
          </div>

          {isGeneratingVideo && (
            <div className="p-4 bg-[#0080FF] border-2 border-black text-white text-xs font-black uppercase tracking-tighter animate-pulse shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Veo is carefully animating your image... this may take a minute.
            </div>
          )}

          {analysis && (
            <div className="p-6 bg-white border-4 border-black text-sm leading-relaxed text-black font-bold shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="font-black text-black mb-2 flex items-center gap-2 uppercase tracking-tighter">
                <BrainCircuit className="w-4 h-4 text-[#0080FF]" />
                AI Analysis
              </h4>
              {analysis}
            </div>
          )}

          {videoUrl && (
            <div className="space-y-2">
              <h4 className="font-black text-black flex items-center gap-2 uppercase tracking-tighter">
                <Film className="w-4 h-4 text-[#FF80BF]" />
                Generated Animation
              </h4>
              <video src={videoUrl} controls className="w-full border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" />
            </div>
          )}
        </div>
      </Card>

      <AIAssistant user={user} />
    </div>
  );
};

const VoiceAssistant = ({ onClose }: { onClose: () => void }) => {
  const [status, setStatus] = useState('Connecting...');
  const [isListening, setIsListening] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
    
    const connect = async () => {
      try {
        const session = await ai.live.connect({
          model: "gemini-2.5-flash-native-audio-preview-12-2025",
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "You are a helpful study buddy. Speak naturally and help the user with their science and engineering questions through voice.",
          },
          callbacks: {
            onopen: () => {
              setStatus('Connected - Ready to talk');
              setIsListening(true);
            },
            onmessage: async (message) => {
              const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audioData) {
                playAudio(audioData);
              }
            },
            onclose: () => setStatus('Disconnected'),
            onerror: (err) => console.error("Live Error:", err),
          }
        });
        sessionRef.current = session;
      } catch (err) {
        console.error("Connection Error:", err);
        setStatus('Connection Failed');
      }
    };

    connect();
    return () => {
      sessionRef.current?.close();
      audioContextRef.current?.close();
    };
  }, []);

  const playAudio = async (base64: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    // Simple PCM playback logic would go here
    // For brevity, we'll assume the user can hear the response
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[400] flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border-8 border-black p-12 w-[450px] text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#0080FF] animate-ping opacity-20" />
            <div className="relative bg-[#0080FF] border-4 border-black p-8 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <Volume2 className="w-12 h-12" />
            </div>
          </div>
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Voice Assistant</h2>
        <p className="text-sm text-gray-400 mb-8 font-bold uppercase tracking-widest">{status}</p>
        
        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <motion.div
                key={i}
                animate={{ height: isListening ? [10, 40, 10] : 10 }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-2 bg-black"
              />
            ))}
          </div>
          <Button variant="secondary" onClick={onClose} className="mt-8 bg-[#FF80BF] border-4 border-black text-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            End Conversation
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const Chat = ({ user }: { user: any }) => {
  const [messagesSnapshot] = useCollection(
    query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(50))
  );
  const messages = messagesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
  const [newMessage, setNewMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage('');

    // AI Moderation
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const modResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Is the following message appropriate for a student study room? Answer with 'SAFE' or 'UNSAFE' only: "${text}"`,
      });
      
      if (modResponse.text?.toUpperCase().includes('UNSAFE')) {
        console.warn("Message flagged as unsafe:", text);
        return;
      }
    } catch (error) {
      console.error("Moderation error:", error);
    }

    try {
      await addDoc(collection(db, 'messages'), {
        authorUid: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        text,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getIcebreaker = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Give me 3 fun, short academic icebreaker questions for a student study room chat. Return them as a JSON array of strings only. e.g. ['What's the weirdest thing you've learned today?', 'Coffee or tea for late night study?', 'Best study hack you know?']",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      const data = JSON.parse(response.text);
      setSuggestions(data);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendSuggestion = async (text: string) => {
    setSuggestions([]);
    try {
      await addDoc(collection(db, 'messages'), {
        authorUid: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL,
        text,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending suggestion:", error);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] p-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#5A5A40]" />
          <h3 className="text-sm font-bold uppercase tracking-widest font-sans text-gray-400">Study Room Chat</h3>
        </div>
        <button
          onClick={getIcebreaker}
          disabled={isGenerating}
          className="p-2 text-[#5A5A40] hover:bg-[#f5f5f0] rounded-full transition-colors disabled:opacity-50"
          title="AI Icebreaker"
        >
          <Wand2 className={cn("w-4 h-4", isGenerating && "animate-pulse")} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200"
      >
        {messages?.map((msg: any) => (
          <div key={msg.id} className={cn("flex flex-col", msg.authorUid === user.uid ? "items-end" : "items-start")}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-gray-400">{msg.authorName}</span>
            </div>
            <div className={cn(
              "px-4 py-2 border-2 border-black text-sm max-w-[85%] break-words shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              msg.authorUid === user.uid ? "bg-[#C0A0FF] text-black" : "bg-white text-black"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest mb-2">AI Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendSuggestion(s)}
                className="text-[11px] bg-white border border-[#e5e5e0] px-3 py-1.5 rounded-full hover:bg-[#f5f5f0] transition-all text-left"
              >
                {s}
              </button>
            ))}
            <button 
              onClick={() => setSuggestions([])}
              className="text-[11px] text-gray-400 hover:text-gray-600 px-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white border-4 border-black px-4 py-2 text-sm font-black focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-3 bg-[#FF80BF] border-4 border-black text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </Card>
  );
};

const VideoRoom = ({ roomId, user, onLeave, onSessionEnd }: { 
  roomId: string, 
  user: any, 
  onLeave: () => void,
  onSessionEnd?: (duration: number, participants: string[]) => void 
}) => {
  const [peers, setPeers] = useState<any[]>([]);
  const socketRef = useRef<any>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<any[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [videoQuality, setVideoQuality] = useState<'high' | 'medium' | 'low'>('high');
  
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [roomMessages, setRoomMessages] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [whiteboardSnapshots, setWhiteboardSnapshots] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());
  const [hostId, setHostId] = useState<string | null>(null);
  const [coHostIds, setCoHostIds] = useState<string[]>([]);
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [waitingUsers, setWaitingUsers] = useState<any[]>([]);
  const [isDenied, setIsDenied] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [roomPassword, setRoomPassword] = useState<string | null>(null);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processingRef = useRef<boolean>(false);
  const segmentationRef = useRef<SelfieSegmentation | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!selectedBackground || !stream || isScreenSharing) {
      if (processingRef.current) {
        processingRef.current = false;
        bgImageRef.current = null;
        // Restore original stream to video element
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
        // Update peers with original track
        const originalTrack = stream?.getVideoTracks()[0];
        if (originalTrack) {
          peersRef.current.forEach(({ peer }) => {
            const sender = peer._pc.getSenders().find((s: any) => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(originalTrack);
          });
        }
      }
      return;
    }

    const initSegmentation = async () => {
      // Pre-load background image if not blur
      if (selectedBackground !== 'blur') {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = selectedBackground;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails to load
        });
        bgImageRef.current = img;
      } else {
        bgImageRef.current = null;
      }

      if (!segmentationRef.current) {
        const selfieSegmentation = new SelfieSegmentation({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });
        selfieSegmentation.setOptions({ modelSelection: 1 });
        selfieSegmentation.onResults(onResults);
        segmentationRef.current = selfieSegmentation;
      }
      processingRef.current = true;
      requestAnimationFrame(processFrame);
    };

    const processFrame = async () => {
      if (!processingRef.current || !userVideo.current || !segmentationRef.current) return;
      if (userVideo.current.readyState >= 2) {
        await segmentationRef.current.send({ image: userVideo.current });
      }
      requestAnimationFrame(processFrame);
    };

    const onResults = (results: any) => {
      if (!canvasRef.current || !processingRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (canvas.width !== results.image.width || canvas.height !== results.image.height) {
        canvas.width = results.image.width;
        canvas.height = results.image.height;
      }

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'source-in';
      if (selectedBackground === 'blur') {
        ctx.filter = 'blur(10px)';
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
      } else if (bgImageRef.current && bgImageRef.current.complete) {
        ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
      }

      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      
      ctx.restore();

      // Update local video and peers
      if (processingRef.current && (canvas as any).captureStream) {
        const canvasStream = (canvas as any).captureStream(30);
        const canvasTrack = canvasStream.getVideoTracks()[0];
        
        // Update local video if it's not already showing the canvas stream
        if (userVideo.current && userVideo.current.srcObject !== canvasStream) {
          userVideo.current.srcObject = canvasStream;
        }

        peersRef.current.forEach(({ peer }) => {
          const sender = peer._pc.getSenders().find((s: any) => s.track?.kind === 'video');
          if (sender && sender.track?.id !== canvasTrack.id) {
            sender.replaceTrack(canvasTrack);
          }
        });
      }
    };

    initSegmentation();

    return () => {
      processingRef.current = false;
    };
  }, [selectedBackground, stream, isScreenSharing]);

  const backgrounds = [
    { id: 'none', name: 'None', url: null },
    { id: 'blur', name: 'Blur', url: 'blur' },
    { id: 'library', name: 'Library', url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1000' },
    { id: 'office', name: 'Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000' },
    { id: 'cafe', name: 'Cafe', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000' },
    { id: 'space', name: 'Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000' },
  ];

  const getConstraints = (quality: 'high' | 'medium' | 'low') => ({
    video: {
      width: { ideal: quality === 'high' ? 1280 : quality === 'medium' ? 640 : 320 },
      height: { ideal: quality === 'high' ? 720 : quality === 'medium' ? 480 : 240 },
      frameRate: { ideal: quality === 'high' ? 30 : quality === 'medium' ? 24 : 15 },
    },
    audio: true
  });

  const changeQuality = async (newQuality: 'high' | 'medium' | 'low') => {
    if (!stream) return;
    setVideoQuality(newQuality);

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(getConstraints(newQuality));
      const newVideoTrack = newStream.getVideoTracks()[0];
      const oldVideoTrack = stream.getVideoTracks()[0];

      if (userVideo.current) {
        userVideo.current.srcObject = newStream;
      }

      peersRef.current.forEach(({ peer }) => {
        if (peer.replaceTrack) {
          peer.replaceTrack(oldVideoTrack, newVideoTrack, stream);
        }
      });

      oldVideoTrack.stop();
      
      // Sync mic/cam states to the new tracks
      newStream.getAudioTracks()[0].enabled = isMicOn;
      newStream.getVideoTracks()[0].enabled = isCamOn;
      
      setStream(newStream);
    } catch (err) {
      console.error("Failed to change video quality:", err);
    }
  };

  useEffect(() => {
    // Fetch or create room metadata
    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribeRoom = onSnapshot(roomRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHostId(data.hostId);
        setCoHostIds(data.coHostIds || []);
        setRoomPassword(data.password || null);
        
        const isModerator = data.hostId === user.uid || (data.coHostIds || []).includes(user.uid);
        if (isModerator) {
          setIsAdmitted(true);
          setIsPasswordVerified(true);
        }
      } else {
        // Fetch post data to get the password
        const postSnap = await getDoc(doc(db, 'posts', roomId));
        const postData = postSnap.exists() ? postSnap.data() : null;

        const newRoom = {
          roomId,
          hostId: user.uid,
          coHostIds: [],
          password: postData?.password || null,
          createdAt: serverTimestamp(),
          isActive: true
        };
        setDoc(roomRef, newRoom);
        setHostId(user.uid);
        setIsAdmitted(true);
        setIsPasswordVerified(true);
      }
    });

    return () => unsubscribeRoom();
  }, [roomId, user.uid]);

  useEffect(() => {
    if (isAdmitted || !hostId || (roomPassword && !isPasswordVerified)) return;

    const waitingUserRef = doc(db, 'rooms', roomId, 'waitingUsers', user.uid);
    setDoc(waitingUserRef, {
      userId: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      joinedAt: serverTimestamp(),
      status: 'waiting'
    });

    const unsubscribeWaiting = onSnapshot(waitingUserRef, (docSnap) => {
      if (docSnap.exists()) {
        const status = docSnap.data().status;
        if (status === 'admitted') {
          setIsAdmitted(true);
        } else if (status === 'denied') {
          setIsDenied(true);
        }
      }
    });

    return () => {
      unsubscribeWaiting();
      deleteDoc(waitingUserRef).catch(() => {});
    };
  }, [isAdmitted, hostId, roomId, user, roomPassword, isPasswordVerified]);

  useEffect(() => {
    const isModerator = hostId === user.uid || coHostIds.includes(user.uid);
    if (!isModerator || !roomId) return;

    const waitingUsersRef = collection(db, 'rooms', roomId, 'waitingUsers');
    const q = query(waitingUsersRef, where('status', '==', 'waiting'));
    const unsubscribeWaitingList = onSnapshot(q, (snapshot) => {
      setWaitingUsers(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribeWaitingList();
  }, [hostId, coHostIds, roomId, user.uid]);

  useEffect(() => {
    if (!isAdmitted) return;
    const interval = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAdmitted]);

  useEffect(() => {
    if (!isAdmitted) return;

    socketRef.current = io("/");
    navigator.mediaDevices.getUserMedia(getConstraints(videoQuality)).then(stream => {
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
      socketRef.current.emit("join-room", roomId);
      
      socketRef.current.on("mute-remote", () => {
        if (stream) {
          stream.getAudioTracks()[0].enabled = false;
          setIsMicOn(false);
        }
      });

      socketRef.current.on("kick-remote", () => {
        onLeave();
      });

      socketRef.current.on("message-highlighted", (messageId: string | null) => {
        setHighlightedMessageId(messageId);
      });

      socketRef.current.on("all-users", (users: string[]) => {
        const peers: any[] = [];
        users.forEach(userID => {
          const peer = createPeer(userID, socketRef.current.id, stream);
          peersRef.current.push({
            peerID: userID,
            peer,
          });
          peers.push({
            peerID: userID,
            peer,
          });
        });
        setPeers(peers);
      });

      socketRef.current.on("user-joined", (payload: any) => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({
          peerID: payload.callerID,
          peer,
        });
        setPeers(prev => [...prev, { peerID: payload.callerID, peer }]);
      });

      socketRef.current.on("receiving-returned-signal", (payload: any) => {
        const item = peersRef.current.find(p => p.peerID === payload.id);
        if (item) item.peer.signal(payload.signal);
      });

      socketRef.current.on("user-disconnected", (userId: string) => {
        const peerObj = peersRef.current.find(p => p.peerID === userId);
        if (peerObj) peerObj.peer.destroy();
        const peers = peersRef.current.filter(p => p.peerID !== userId);
        peersRef.current = peers;
        setPeers(peers);
        setRaisedHands(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      });

      socketRef.current.on("user-hand-raise", ({ userId, isRaised }: any) => {
        setRaisedHands(prev => {
          const next = new Set(prev);
          if (isRaised) next.add(userId);
          else next.delete(userId);
          return next;
        });
      });

      socketRef.current.on("receive-room-message", (message: any) => {
        setRoomMessages(prev => [...prev, message]);
      });
    });

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      socketRef.current?.disconnect();
    };
  }, [isAdmitted, roomId]);

  function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", signal => {
      socketRef.current.emit("sending-signal", { userToSignal, callerID, signal });
    });

    return peer;
  }

  function addPeer(incomingSignal: any, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", signal => {
      socketRef.current.emit("returning-signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isCamOn;
      setIsCamOn(!isCamOn);
    }
  };

  const toggleHandRaise = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    socketRef.current.emit("hand-raise", roomId, next);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        const oldVideoTrack = stream?.getVideoTracks()[0];

        if (userVideo.current) {
          userVideo.current.srcObject = screenStream;
        }

        peersRef.current.forEach(({ peer }) => {
          if (peer.replaceTrack && oldVideoTrack) {
            peer.replaceTrack(oldVideoTrack, screenTrack, stream!);
          }
        });

        screenTrack.onended = () => {
          stopScreenShare(screenTrack);
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Failed to share screen:", err);
      }
    } else {
      const screenTrack = userVideo.current?.srcObject instanceof MediaStream 
        ? (userVideo.current.srcObject as MediaStream).getVideoTracks()[0] 
        : null;
      if (screenTrack) stopScreenShare(screenTrack);
    }
  };

  const stopScreenShare = async (screenTrack: MediaStreamTrack) => {
    screenTrack.stop();
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia(getConstraints(videoQuality));
      const videoTrack = videoStream.getVideoTracks()[0];
      const audioTrack = videoStream.getAudioTracks()[0];

      // Sync with current UI state
      videoTrack.enabled = isCamOn;
      audioTrack.enabled = isMicOn;

      if (userVideo.current) {
        userVideo.current.srcObject = videoStream;
      }

      peersRef.current.forEach(({ peer }) => {
        if (peer.replaceTrack) {
          peer.replaceTrack(screenTrack, videoTrack, stream!);
        }
      });

      // Stop old stream tracks to prevent leaks
      stream?.getTracks().forEach(t => t.stop());
      
      setStream(videoStream);
      setIsScreenSharing(false);
    } catch (err) {
      console.error("Failed to restore camera:", err);
      setIsScreenSharing(false);
    }
  };

  const sendRoomMessage = (text: string) => {
    socketRef.current.emit("send-room-message", roomId, {
      id: Math.random().toString(36).substr(2, 9),
      userName: user.displayName,
      userId: user.uid,
      text
    });
  };

  const handleMuteUser = (userId: string) => {
    socketRef.current.emit("mute-user", roomId, userId);
  };

  const handleKickUser = (userId: string) => {
    socketRef.current.emit("kick-user", roomId, userId);
  };

  const handleHighlightMessage = (messageId: string | null) => {
    socketRef.current.emit("highlight-message", roomId, messageId);
  };

  const handleMuteAll = () => {
    socketRef.current.emit("mute-all", roomId);
  };

  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });
      
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(screenStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SkillSwap-Session-${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
        screenStream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isHost = user.uid === hostId;
  const isCoHost = coHostIds.includes(user.uid);
  const isModerator = isHost || isCoHost;

  if (roomPassword && !isPasswordVerified && !isModerator) {
    return (
      <div className="fixed inset-0 bg-[#C0A0FF] z-[400] flex items-center justify-center p-6 text-center">
        <BackgroundVisuals />
        <div className="bg-white border-8 border-black p-12 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative z-10">
          <Lock className="w-20 h-20 text-[#5A5A40] mx-auto mb-6" />
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Private Meeting</h2>
          <p className="text-lg font-bold mb-8 italic">This session is password protected. Please enter the password to continue.</p>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (passwordInput === roomPassword) {
                setIsPasswordVerified(true);
                setPasswordError(false);
              } else {
                setPasswordError(true);
              }
            }}
            className="space-y-4"
          >
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password..."
              className={cn(
                "w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                passwordError && "border-red-500 shadow-red-500"
              )}
              autoFocus
            />
            {passwordError && <p className="text-red-500 text-xs font-black uppercase">Incorrect password. Try again.</p>}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-[#0080FF] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">Verify</Button>
              <Button type="button" variant="ghost" onClick={onLeave} className="border-4 border-black">Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isDenied) {
    return (
      <div className="fixed inset-0 bg-[#FF80BF] z-[300] flex items-center justify-center p-6 text-center">
        <BackgroundVisuals />
        <div className="bg-white border-8 border-black p-12 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative z-10">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Access Denied</h2>
          <p className="text-lg font-bold mb-8 italic">The host has declined your request to join this session.</p>
          <Button onClick={onLeave} className="w-full bg-black text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">Return to Lobby</Button>
        </div>
      </div>
    );
  }

  if (!isAdmitted) {
    return (
      <div className="fixed inset-0 bg-[#FFD700] z-[300] flex items-center justify-center p-6 text-center">
        <BackgroundVisuals />
        <div className="bg-white border-8 border-black p-12 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#C0A0FF] animate-ping opacity-20" />
              <div className="relative bg-[#C0A0FF] border-4 border-black p-8 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Clock className="w-12 h-12" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Waiting Room</h2>
          <p className="text-lg font-bold mb-8 italic">Please wait while the host admits you to the session...</p>
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: [10, 40, 10] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-2 bg-black"
                />
              ))}
            </div>
            <Button variant="secondary" onClick={onLeave} className="mt-8 bg-red-500 text-white border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              Cancel Request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleAdmitUser = async (waitingUserId: string) => {
    const waitingUserRef = doc(db, 'rooms', roomId, 'waitingUsers', waitingUserId);
    await updateDoc(waitingUserRef, { status: 'admitted' });
  };

  const handleDenyUser = async (waitingUserId: string) => {
    const waitingUserRef = doc(db, 'rooms', roomId, 'waitingUsers', waitingUserId);
    await updateDoc(waitingUserRef, { status: 'denied' });
  };

  const handlePromoteToCoHost = async (peerUid: string) => {
    if (!isHost) return;
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      coHostIds: arrayUnion(peerUid)
    });
  };

  return (
    <div className="fixed inset-0 bg-[#FFD700] z-[200] flex flex-col">
      <BackgroundVisuals />
      <canvas ref={canvasRef} className="hidden" />
      <div className="p-6 flex justify-between items-center text-black relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#5A5A40] p-2 rounded-xl text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Study Room: {roomId.slice(0, 8)}</h2>
            <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Live Peer-to-Peer Learning Session</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs">
            <Settings className="w-3 h-3 text-[#5A5A40]" />
            <span className="opacity-60 font-sans uppercase tracking-widest font-bold">Quality:</span>
            <select 
              value={videoQuality} 
              onChange={(e) => changeQuality(e.target.value as any)}
              className="bg-transparent border-none outline-none cursor-pointer font-black text-[#5A5A40]"
            >
              <option value="high">High (720p)</option>
              <option value="medium">Med (480p)</option>
              <option value="low">Low (240p)</option>
            </select>
          </div>
          <Button 
            variant="secondary" 
            className="bg-red-500 border-4 border-black text-white font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all" 
            onClick={() => {
              if (whiteboardSnapshots.length > 0) {
                setShowSummary(true);
              } else {
                onLeave();
              }
            }}
          >
            <PhoneOff className="w-4 h-4" />
            Leave Call
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
          {/* Waiting Room List (Moderators only) */}
          {isModerator && waitingUsers.length > 0 && (
            <div className="col-span-full mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-black mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Waiting Room ({waitingUsers.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {waitingUsers.map((wUser) => (
                  <div key={wUser.userId} className="bg-white border-4 border-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-3">
                      <img src={wUser.photoURL} className="w-10 h-10 border-2 border-black" referrerPolicy="no-referrer" />
                      <span className="font-black text-sm">{wUser.displayName}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAdmitUser(wUser.userId)}
                        className="bg-green-500 border-2 border-black p-1.5 text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDenyUser(wUser.userId)}
                        className="bg-red-500 border-2 border-black p-1.5 text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Video */}
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border-2 border-[#5A5A40]">
            <video ref={userVideo} autoPlay muted playsInline className={cn("w-full h-full object-cover", !isScreenSharing && "mirror")} />
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs flex items-center gap-2">
              <span>You ({user.displayName})</span>
              {isHost && <span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded text-[8px] font-black uppercase">Host</span>}
              {isScreenSharing && <span className="text-blue-400">(Sharing Screen)</span>}
              {isHandRaised && <Hand className="w-3 h-3 text-yellow-500 animate-bounce" />}
            </div>
            {!isCamOn && !isScreenSharing && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#2a2a2a]">
                <div className="w-20 h-20 rounded-full bg-[#5A5A40] flex items-center justify-center text-2xl font-bold text-white">
                  {user.displayName?.[0]}
                </div>
              </div>
            )}
          </div>

          {/* Remote Videos */}
          {peers.map((peerObj, index) => (
            <RemoteVideo 
              key={index} 
              peer={peerObj.peer} 
              peerID={peerObj.peerID}
              isHandRaised={raisedHands.has(peerObj.peerID)} 
              isModerator={isModerator}
              isHost={isHost}
              onMute={() => handleMuteUser(peerObj.peerID)}
              onKick={() => handleKickUser(peerObj.peerID)}
              onPromote={() => handlePromoteToCoHost(peerObj.peerID)}
            />
          ))}
        </div>

        {showChat && (
          <div className="w-80 bg-white border-l-8 border-black flex flex-col p-6 shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-6 text-black">
              <h3 className="font-black uppercase tracking-widest text-sm">In-Call Chat</h3>
              <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300">
              {roomMessages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex flex-col p-3 border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  highlightedMessageId === msg.id ? "bg-yellow-200" : "bg-white"
                )}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black uppercase text-[#5A5A40]">{msg.userName}</span>
                    {isHost && (
                      <button 
                        onClick={() => handleHighlightMessage(highlightedMessageId === msg.id ? null : msg.id)}
                        className={cn(
                          "text-[8px] uppercase font-black px-1.5 py-0.5 border border-black",
                          highlightedMessageId === msg.id ? "bg-yellow-500 text-black" : "bg-gray-100 text-gray-400 hover:text-black"
                        )}
                      >
                        {highlightedMessageId === msg.id ? 'Pinned' : 'Pin'}
                      </button>
                    )}
                  </div>
                  <div className="text-black text-xs font-medium">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem('msg') as HTMLInputElement;
                if (input.value.trim()) {
                  sendRoomMessage(input.value);
                  input.value = '';
                }
              }}
              className="flex gap-2"
            >
              <input
                name="msg"
                placeholder="Send message..."
                className="flex-1 bg-white border-2 border-black px-4 py-2 text-xs text-black outline-none focus:bg-yellow-50"
              />
              <button className="p-2 bg-[#5A5A40] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="p-8 flex justify-center items-center gap-4 relative">
        <div className="absolute left-8 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/5 px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Clock className="w-4 h-4 text-[#5A5A40]" />
            <span className="font-black text-sm tabular-nums">{formatDuration(sessionDuration)}</span>
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 bg-red-50 px-4 py-2 border-2 border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] animate-pulse">
              <Radio className="w-4 h-4 text-red-500" />
              <span className="font-black text-xs text-red-500 uppercase tracking-tighter">Recording</span>
            </div>
          )}
        </div>

        {showBackgroundOptions && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#2a2a2a] p-4 rounded-2xl shadow-2xl border border-[#3a3a3a] w-[400px] z-[300]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Virtual Backgrounds</h3>
              <button onClick={() => setShowBackgroundOptions(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBackground(bg.url)}
                  className={cn(
                    "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                    selectedBackground === bg.url ? "border-[#5A5A40]" : "border-transparent hover:border-gray-500"
                  )}
                >
                  {bg.url === 'blur' ? (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center text-[10px] text-white font-bold">BLUR</div>
                  ) : bg.url ? (
                    <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-[10px] text-white font-bold">NONE</div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-[8px] text-white text-center uppercase font-bold">
                    {bg.name}
                  </div>
                </button>
              ))}
              <label className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-600 hover:border-[#5A5A40] transition-all cursor-pointer flex flex-col items-center justify-center gap-1">
                <Plus className="w-4 h-4 text-gray-400" />
                <span className="text-[8px] text-gray-400 font-bold uppercase">Upload</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setSelectedBackground(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        )}

        <button
          onClick={toggleMic}
          className={cn(
            "w-12 h-12 border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
            isMicOn ? "bg-white text-black" : "bg-red-500 text-white"
          )}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button
          onClick={toggleCam}
          className={cn(
            "w-12 h-12 border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
            isCamOn ? "bg-white text-black" : "bg-red-500 text-white"
          )}
        >
          {isCamOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        
        <div className="w-1 h-8 bg-black mx-2" />

        <button
          onClick={() => setShowBackgroundOptions(!showBackgroundOptions)}
          className={cn(
            "w-12 h-12 border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
            selectedBackground ? "bg-[#0080FF] text-white" : "bg-white text-black"
          )}
          title="Virtual Background"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          onClick={toggleHandRaise}
          className={cn(
            "w-12 h-12 border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
            isHandRaised ? "bg-yellow-500 text-white" : "bg-white text-black"
          )}
          title="Raise Hand"
        >
          <Hand className="w-5 h-5" />
        </button>

        <button
          onClick={toggleScreenShare}
          className={cn(
            "w-12 h-12 border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
            isScreenSharing ? "bg-[#0080FF] text-white" : "bg-white text-black"
          )}
          title="Present Screen"
        >
          <Monitor className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowWhiteboard(true)}
          className="w-12 h-12 border-4 border-black bg-white text-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          title="Annotation Clipboard"
        >
          <Clipboard className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          className={cn(
            "w-12 h-12 border-4 border-black flex items-center justify-center transition-all relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
            showChat ? "bg-[#0080FF] text-white" : "bg-white text-black"
          )}
          title="In-Call Chat"
        >
          <MessageSquare className="w-5 h-5" />
          {roomMessages.length > 0 && !showChat && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />
          )}
        </button>

        {isModerator && (
          <button
            onClick={handleMuteAll}
            className="w-12 h-12 border-4 border-black bg-white text-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            title="Mute All Participants"
          >
            <MicOff className="w-5 h-5" />
          </button>
        )}

        {isHost && (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "w-12 h-12 border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
              isRecording ? "bg-red-500 text-white" : "bg-white text-black"
            )}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Radio className="w-5 h-5" />}
          </button>
        )}

        <button
          onClick={() => {
            if (whiteboardSnapshots.length > 0 || roomMessages.length > 0) {
              setShowSummary(true);
            } else {
              onLeave();
            }
          }}
          className="px-6 h-12 bg-red-500 text-white border-4 border-black font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ml-4"
        >
          Leave Session
        </button>
      </div>

      {showWhiteboard && (
        <Whiteboard 
          onClose={() => setShowWhiteboard(false)} 
          onSaveSnapshot={(data) => {
            setWhiteboardSnapshots(prev => [...prev, data]);
            setShowWhiteboard(false);
          }}
        />
      )}
      {showSummary && (
        <SessionSummary 
          snapshots={whiteboardSnapshots} 
          messages={roomMessages}
          onDone={() => {
            setShowSummary(false);
            if (onSessionEnd) {
              const participants = [user.uid, ...peers.map(p => p.peerID)];
              onSessionEnd(sessionDuration, participants);
            }
            onLeave();
          }} 
        />
      )}
    </div>
  );
};

const RemoteVideo = ({ peer, peerID, isHandRaised, isModerator, isHost, onMute, onKick, onPromote }: { 
  peer: any, 
  peerID: string,
  isHandRaised?: boolean, 
  isModerator?: boolean, 
  isHost?: boolean, 
  onMute?: () => void, 
  onKick?: () => void,
  onPromote?: () => void
}) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peer.on("stream", (stream: MediaStream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return (
    <div className="relative aspect-video bg-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
      <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
      
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs flex items-center gap-2">
        <span>User ({peerID.substring(0, 5)}...)</span>
        {isHandRaised && <Hand className="w-3 h-3 text-yellow-500 animate-bounce" />}
      </div>
      
      {isModerator && (
        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onMute}
            className="bg-white border-2 border-black p-2 text-black hover:bg-red-500 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Mute Participant"
          >
            <MicOff className="w-3 h-3" />
          </button>
          <button 
            onClick={onKick}
            className="bg-white border-2 border-black p-2 text-black hover:bg-red-500 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Remove Participant"
          >
            <LogOut className="w-3 h-3" />
          </button>
          {isHost && (
            <button 
              onClick={onPromote}
              className="bg-white border-2 border-black p-2 text-black hover:bg-blue-500 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title="Promote to Co-Host"
            >
              <ShieldCheck className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

    </div>
  );
};

const Whiteboard = ({ onClose, onSaveSnapshot }: { onClose: () => void, onSaveSnapshot: (dataUrl: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#5A5A40');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    
    // Fill background white for better AI analysis
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = color;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSaveSnapshot(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-10">
      <div className="bg-white rounded-[40px] p-8 w-full h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-light italic">Annotation Clipboard</h2>
            <div className="flex gap-2">
              {['#5A5A40', '#ef4444', '#3b82f6', '#10b981'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn("w-6 h-6 rounded-full border-2", color === c ? "border-black" : "border-transparent")}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={clear} className="text-red-500">
              <Eraser className="w-4 h-4" />
              Clear
            </Button>
            <Button variant="secondary" onClick={handleSave} className="bg-[#5A5A40] text-white hover:bg-[#4A4A30]">
              <Save className="w-4 h-4" />
              Save to Slides
            </Button>
            <Button variant="secondary" onClick={onClose}>
              <X className="w-4 h-4" />
              Close
            </Button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="flex-1 bg-white rounded-3xl cursor-crosshair border border-[#e5e5e0]"
        />
      </div>
    </div>
  );
};

const PostModal = ({ user, profile, onClose }: { user: any, profile: UserProfile | null, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border-8 border-black p-10 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
    >
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Post to Bulletin</h2>
      <form className="space-y-6" onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await addDoc(collection(db, 'posts'), {
          authorUid: user.uid,
          authorName: user.displayName,
          authorPhoto: user.photoURL,
          type: formData.get('type'),
          skill: formData.get('skill'),
          description: formData.get('description'),
          password: formData.get('password') || null,
          createdAt: serverTimestamp(),
        });
        onClose();
      }}>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-400 block mb-2">I want to...</label>
          <select
            name="type"
            className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] appearance-none"
          >
            <option value="teach">Teach a Skill</option>
            <option value="learn">Learn a Skill</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-400 block mb-2">Skill Name</label>
          <input
            name="skill"
            placeholder="e.g. Advanced Python"
            className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-400 block mb-2">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Tell others what you can offer or what you're looking for..."
            className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-none"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-400 block mb-2">Meeting Password (Optional)</label>
          <input
            name="password"
            type="password"
            placeholder="Leave empty for public room"
            className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1 bg-[#FF80BF] text-black">Post Now</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  </div>
);

const Dashboard = ({ user, profile, onlineConnections, pendingRequests, onJoinRoom }: { 
  user: any, 
  profile: UserProfile | null, 
  onlineConnections: UserProfile[], 
  pendingRequests: ConnectionRequest[],
  onJoinRoom: (id: string) => void
}) => {
  const [postsSnapshot, postsLoading] = useCollection(query(collection(db, 'posts'), orderBy('createdAt', 'desc')));
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handleAcceptRequest = async (request: ConnectionRequest) => {
    try {
      await updateDoc(doc(db, 'connectionRequests', request.id), { status: 'accepted' });
      await updateDoc(doc(db, 'users', user.uid), {
        connections: arrayUnion(request.fromUid)
      });
      await updateDoc(doc(db, 'users', request.fromUid), {
        connections: arrayUnion(user.uid)
      });
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left: Study Desk Status */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Lamp className={cn("w-6 h-6 transition-colors", profile?.skillsToTeach?.length ? "text-yellow-500" : "text-gray-300")} />
          </div>
          <h3 className="text-lg font-bold mb-4">Your Desk</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-400 font-sans font-bold">College</label>
              <p className="text-sm italic">{profile?.college || 'Not set'}</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-400 font-sans font-bold">Teaching</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile?.skillsToTeach?.map(s => (
                  <span key={s} className="text-[10px] bg-[#f5f5f0] px-2 py-1 rounded-full">{s}</span>
                )) || <p className="text-xs text-gray-400 italic">No skills added</p>}
              </div>
            </div>
          </div>
        </Card>

        {pendingRequests.length > 0 && (
          <Card className="bg-[#FF80BF] border-4 border-black">
            <h3 className="text-sm font-bold mb-4 uppercase tracking-widest font-sans">Pending Requests</h3>
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between gap-2 p-2 bg-white border-2 border-black">
                  <span className="text-xs font-bold truncate">{req.fromName}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleAcceptRequest(req)} className="p-1 bg-green-500 text-white border border-black hover:translate-y-[-1px] transition-transform">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => updateDoc(doc(db, 'connectionRequests', req.id), { status: 'declined' })} className="p-1 bg-red-500 text-white border border-black hover:translate-y-[-1px] transition-transform">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Center: Bulletin Board (Posts) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-light italic">Bulletin Board</h2>
          <Button onClick={() => setIsPostModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Post a Skill
          </Button>
        </div>

        <div className="space-y-4">
          {postsLoading ? (
            <div className="text-center py-20 text-gray-400 italic">Loading posts...</div>
          ) : postsSnapshot?.docs.length === 0 ? (
            <div className="text-center py-20 text-gray-400 italic">The board is empty. Be the first to post!</div>
          ) : (
            postsSnapshot?.docs.map((doc: any) => {
              const post = doc.data();
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="hover:border-[#5A5A40] transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <img src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}`} alt={post.authorName} className="w-10 h-10 rounded-full border border-gray-100" referrerPolicy="no-referrer" />
                        <div>
                          <h4 className="font-bold text-sm">{post.authorName}</h4>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-sans">{post.type === 'teach' ? 'Offering' : 'Seeking'}</p>
                        </div>
                      </div>
                      <span className={cn("text-[10px] px-3 py-1 rounded-full font-sans font-bold uppercase tracking-wider", post.type === 'teach' ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700")}>{post.skill}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-[#f5f5f0]">
                      <span className="text-[10px] text-gray-400 font-sans">{post.createdAt?.toDate().toLocaleDateString()}</span>
                      <Button variant="ghost" className="text-xs group-hover:bg-[#5A5A40] group-hover:text-white" onClick={() => onJoinRoom(doc.id)}>
                        {post.password ? <Lock className="w-3 h-3 text-amber-500" /> : <VideoIcon className="w-3 h-3" />}
                        Join Call
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Online Connections & Chat */}
      <div className="lg:col-span-3 space-y-6">
        <Chat user={user} />
        <Card>
          <h3 className="text-sm font-bold mb-4 uppercase tracking-widest font-sans text-gray-400">Connections Online</h3>
          <div className="space-y-4">
            {onlineConnections.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No connections online</p>
            ) : (
              onlineConnections.map(conn => (
                <div key={conn.uid} className="flex items-center gap-3">
                  <div className="relative">
                    <img src={conn.photoURL || `https://ui-avatars.com/api/?name=${conn.displayName}`} className="w-8 h-8 rounded-full border border-black" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">{conn.displayName}</p>
                    <p className="text-[10px] text-gray-400">{conn.college}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {isPostModalOpen && <PostModal user={user} profile={profile} onClose={() => setIsPostModalOpen(false)} />}
    </div>
  );
};

const Explore = ({ user, profile }: { user: any, profile: UserProfile | null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'), 
        where('username', '>=', searchQuery.toLowerCase()), 
        where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(10)
      );
      const snap = await getDocs(q);
      setResults(snap.docs.map(doc => doc.data() as UserProfile).filter(u => u.uid !== user.uid));
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (targetUser: UserProfile) => {
    try {
      const requestId = `${user.uid}_${targetUser.uid}`;
      await setDoc(doc(db, 'connectionRequests', requestId), {
        fromUid: user.uid,
        fromName: profile?.displayName || user.displayName,
        toUid: targetUser.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert(`Request sent to ${targetUser.displayName}!`);
    } catch (err) {
      console.error("Failed to send request:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-light italic">Explore SkillSwap</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by username..."
            className="flex-1 bg-white border-4 border-black p-4 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none"
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-5 h-5" />
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(u => (
          <Card key={u.uid} className="hover:border-[#5A5A40] transition-all">
            <div className="flex items-center gap-4 mb-4">
              <img src={u.photoURL} className="w-16 h-16 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" referrerPolicy="no-referrer" />
              <div>
                <h3 className="font-bold text-lg">{u.displayName}</h3>
                <p className="text-xs text-gray-400">@{u.username}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 italic">"{u.bio || 'No bio yet'}"</p>
            <div className="flex flex-wrap gap-1 mb-6">
              {u.skillsToTeach?.map(s => (
                <span key={s} className="text-[10px] bg-[#f5f5f0] px-2 py-1 rounded-full border border-black">{s}</span>
              ))}
            </div>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => sendRequest(u)}
              disabled={profile?.connections?.includes(u.uid)}
            >
              <UserPlus className="w-4 h-4" />
              {profile?.connections?.includes(u.uid) ? 'Connected' : 'Connect'}
            </Button>
          </Card>
        ))}
        {!loading && searchQuery && results.length === 0 && (
          <div className="col-span-full text-center py-20 italic text-gray-400">No users found with that username.</div>
        )}
      </div>
    </div>
  );
};

const SessionsView = ({ user, sessions }: { user: any, sessions: SessionRecord[] }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-light italic">Session History</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map(s => (
          <Card key={s.id} className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#5A5A40]" />
                <span className="text-sm font-bold">{s.createdAt?.toDate().toLocaleDateString()}</span>
              </div>
              <div className="px-3 py-1 bg-[#f5f5f0] rounded-full text-[10px] font-bold uppercase tracking-widest">
                {Math.floor(s.duration / 60)}m {s.duration % 60}s
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {s.participants.slice(0, 3).map(p => (
                  <div key={p} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                ))}
                {s.participants.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-black text-white text-[10px] flex items-center justify-center border-2 border-white">
                    +{s.participants.length - 3}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">{s.participants.length} Participants</p>
            </div>
            <Button variant="ghost" className="w-full mt-2 text-xs">
              View Recap
            </Button>
          </Card>
        ))}
        {sessions.length === 0 && (
          <div className="col-span-full text-center py-20 italic text-gray-400">You haven't participated in any sessions yet.</div>
        )}
      </div>
    </div>
  );
};

const ProfileView = ({ user, profile, onUpdate }: { user: any, profile: UserProfile | null, onUpdate: (p: UserProfile) => void }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>(profile || {});
  const [newCert, setNewCert] = useState({ name: '', url: '', issuedBy: '' });

  const handleSave = async () => {
    try {
      const updated = { ...profile, ...formData };
      await updateDoc(doc(db, 'users', user.uid), updated);
      onUpdate(updated as UserProfile);
      setEditing(false);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const addCertificate = async () => {
    if (!newCert.name || !newCert.url) return;
    try {
      const updatedCerts = [...(profile?.certificates || []), newCert];
      await updateDoc(doc(db, 'users', user.uid), { certificates: updatedCerts });
      onUpdate({ ...profile!, certificates: updatedCerts });
      setNewCert({ name: '', url: '', issuedBy: '' });
    } catch (err) {
      console.error("Failed to add certificate:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative group">
          <img src={profile?.photoURL} className="w-48 h-48 rounded-[40px] border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] object-cover" referrerPolicy="no-referrer" />
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[40px]">
            <Camera className="w-8 h-8 text-white" />
            <input type="file" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                // In a real app, upload to storage. Here we'll use local preview
                const reader = new FileReader();
                reader.onload = async (ev) => {
                  const url = ev.target?.result as string;
                  await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
                  onUpdate({ ...profile!, photoURL: url });
                };
                reader.readAsDataURL(file);
              }
            }} />
          </label>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">{profile?.displayName}</h1>
              <p className="text-[#5A5A40] font-bold italic">@{profile?.username || 'no-username'}</p>
            </div>
            <Button onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
          
          {editing ? (
            <div className="space-y-4 bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <input 
                value={formData.displayName} 
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                placeholder="Display Name"
                className="w-full p-2 border-2 border-black font-bold"
              />
              <input 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                placeholder="Username"
                className="w-full p-2 border-2 border-black font-bold"
              />
              <textarea 
                value={formData.bio} 
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                className="w-full p-2 border-2 border-black font-bold h-24"
              />
              <Button onClick={handleSave} className="w-full">Save Changes</Button>
            </div>
          ) : (
            <p className="text-lg italic text-gray-700 leading-relaxed">"{profile?.bio || 'No bio yet. Add one to tell others what you are about!'}"</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white">
          <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certificates
          </h3>
          <div className="space-y-4">
            {profile?.certificates?.map((cert, i) => (
              <div key={i} className="p-4 bg-[#f5f5f0] border-2 border-black flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{cert.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{cert.issuedBy}</p>
                </div>
                <a href={cert.url} target="_blank" className="text-[#0080FF] hover:underline text-xs font-bold">View</a>
              </div>
            ))}
            <div className="pt-4 border-t-2 border-black space-y-2">
              <input 
                placeholder="Cert Name" 
                value={newCert.name} 
                onChange={e => setNewCert({...newCert, name: e.target.value})}
                className="w-full p-2 border border-black text-xs"
              />
              <input 
                placeholder="URL" 
                value={newCert.url} 
                onChange={e => setNewCert({...newCert, url: e.target.value})}
                className="w-full p-2 border border-black text-xs"
              />
              <Button variant="secondary" className="w-full text-xs" onClick={addCertificate}>Add Certificate</Button>
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Skills
          </h3>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Teaching</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile?.skillsToTeach?.map(s => (
                  <span key={s} className="px-3 py-1 bg-green-100 text-green-800 border-2 border-black text-xs font-bold">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Learning</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile?.skillsToLearn?.map(s => (
                  <span key={s} className="px-3 py-1 bg-blue-100 text-blue-800 border-2 border-black text-xs font-bold">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
const SessionSummary = ({ snapshots, messages, onDone }: { snapshots: string[], messages: any[], onDone: () => void }) => {
  const [slides, setSlides] = useState<{ title: string, content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSlides = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const parts = snapshots.map(s => ({
        inlineData: {
          data: s.split(',')[1],
          mimeType: 'image/png'
        }
      }));

      const chatContext = messages.map(m => `${m.userName}: ${m.text}`).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            ...parts,
            { text: `Analyze these whiteboard snapshots and the following chat transcript from a study session to create a structured slide deck summary. 
            
            Chat Transcript:
            ${chatContext}
            
            For each snapshot, provide a slide title and a concise summary of the key points discussed, using the chat context to enrich the explanation. If there are no snapshots but there is chat, generate summary slides based on the chat discussion.
            
            Return as a JSON array of objects with 'title' and 'content' properties.` }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ['title', 'content']
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setSlides(data);
    } catch (err) {
      console.error("Failed to generate slides:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (snapshots.length > 0 || messages.length > 0) generateSlides();
  }, [snapshots, messages]);

  return (
    <div className="fixed inset-0 bg-[#f5f5f0] z-[400] flex flex-col p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-serif italic mb-2">Session Recap</h1>
            <p className="text-gray-600">AI-generated slide deck from your whiteboard notes</p>
          </div>
          <Button onClick={onDone} className="bg-[#5A5A40] text-white px-8 rounded-full">
            Back to Desk
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
            <p className="font-sans font-bold uppercase tracking-widest text-xs text-[#5A5A40]">Gemini is drafting your slides...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {slides.map((slide, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-12 rounded-[40px] shadow-sm border border-[#e5e5e0] min-h-[500px] flex flex-col md:flex-row gap-12 items-center"
              >
                <div className="flex-1 w-full">
                  <div className="mb-8">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#5A5A40]">Slide {i + 1}</span>
                    <h2 className="text-3xl font-serif italic mt-2">{slide.title}</h2>
                  </div>
                  <div className="text-lg text-gray-700 leading-relaxed font-serif">
                    {slide.content}
                  </div>
                </div>
                {snapshots[i] && (
                  <div className="flex-1 w-full">
                    <img 
                      src={snapshots[i]} 
                      alt={`Whiteboard snapshot ${i + 1}`} 
                      className="w-full h-auto rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </motion.div>
            ))}
            {slides.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-[#e5e5e0]">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No whiteboard snapshots were saved during this session.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'explore' | 'lab' | 'sessions' | 'profile'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showVoice, setShowVoice] = useState(false);

  const [connectionsSnapshot] = useCollection(
    user ? query(collection(db, 'users'), where('uid', 'in', profile?.connections?.length ? profile.connections : ['none'])) : null
  );
  const onlineConnections = connectionsSnapshot?.docs
    .map(doc => doc.data() as UserProfile)
    .filter(c => c.isOnline);

  const [requestsSnapshot] = useCollection(
    user ? query(collection(db, 'connectionRequests'), where('toUid', '==', user.uid), where('status', '==', 'pending')) : null
  );
  const pendingRequests = requestsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConnectionRequest));

  const [sessionsSnapshot] = useCollection(
    user ? query(collection(db, 'sessions'), where('participants', 'array-contains', user.uid), orderBy('createdAt', 'desc')) : null
  );
  const sessions = sessionsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as SessionRecord));

  // Fetch or create profile on login
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'Student',
            email: user.email || '',
            photoURL: user.photoURL || '',
            karma: 0,
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
          setIsProfileModalOpen(true); // Prompt for college info
        }
      };
      fetchProfile();
    }
  }, [user]);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRadioOn, setIsRadioOn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        console.error("Login error:", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };
  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Coffee className="w-12 h-12 text-[#5A5A40]" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0080FF] font-sans selection:bg-[#FFD700] selection:text-black flex items-center justify-center p-4 md:p-12 overflow-hidden">
        <div className="w-full max-w-6xl aspect-[16/10] relative">
          <BrutalistHero />
          
          {/* Floating Action Button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogin}
            className="absolute -bottom-8 -right-8 bg-[#FF80BF] border-8 border-black p-8 rounded-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] z-50 group"
          >
            <div className="flex flex-col items-center">
              <GraduationCap className="w-12 h-12 text-black mb-2" />
              <span className="font-black text-xl uppercase tracking-tighter">JOIN NOW</span>
            </div>
          </motion.button>

          {/* Background shapes */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#C0A0FF] rounded-full border-8 border-black -z-10" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#FFD700] border-8 border-black rotate-12 -z-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0080FF] font-sans text-[#1a1a1a]">
      <BackgroundVisuals />
      {currentRoomId && (
        <VideoRoom 
          roomId={currentRoomId} 
          user={user} 
          onLeave={() => setCurrentRoomId(null)}
          onSessionEnd={async (duration, participants) => {
            try {
              await addDoc(collection(db, 'sessions'), {
                userId: user.uid,
                roomId: currentRoomId,
                duration,
                participants,
                createdAt: serverTimestamp()
              });
            } catch (err) {
              console.error("Failed to save session record:", err);
            }
          }}
        />
      )}
      {/* Sidebar/Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#e5e5e0] z-50">
        {/* Announcement Bar */}
        <div className="bg-[#5A5A40] text-white py-1.5 overflow-hidden whitespace-nowrap relative">
          <motion.div 
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block text-[10px] font-sans font-bold uppercase tracking-[0.2em]"
          >
            📢 New: AI Lab is now live! Analyze engineering diagrams with Gemini 3.1 Pro • Join the "React Masterclass" session at 6 PM • Earn Karma by helping peers!
          </motion.div>
        </div>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-xl font-bold text-[#5A5A40]">
              <GraduationCap className="w-6 h-6" />
              <span>SkillSwap</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-sans uppercase tracking-widest font-medium text-gray-500">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                   "pb-1 transition-all cursor-pointer",
                   activeTab === 'dashboard' ? "text-[#5A5A40] border-b-2 border-[#5A5A40]" : "hover:text-[#5A5A40]"
                )}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('explore')}
                className={cn(
                   "pb-1 transition-all cursor-pointer",
                   activeTab === 'explore' ? "text-[#5A5A40] border-b-2 border-[#5A5A40]" : "hover:text-[#5A5A40]"
                )}
              >
                Explore
              </button>
              <button 
                onClick={() => setActiveTab('sessions')}
                className={cn(
                   "pb-1 transition-all cursor-pointer",
                   activeTab === 'sessions' ? "text-[#5A5A40] border-b-2 border-[#5A5A40]" : "hover:text-[#5A5A40]"
                )}
              >
                Sessions
              </button>
              <button 
                onClick={() => setActiveTab('lab')}
                className={cn(
                   "pb-1 transition-all cursor-pointer flex items-center gap-2",
                   activeTab === 'lab' ? "text-[#5A5A40] border-b-2 border-[#5A5A40]" : "hover:text-[#5A5A40]"
                )}
              >
                <BrainCircuit className="w-3 h-3" />
                AI Lab
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={cn(
                   "pb-1 transition-all cursor-pointer",
                   activeTab === 'profile' ? "text-[#5A5A40] border-b-2 border-[#5A5A40]" : "hover:text-[#5A5A40]"
                )}
              >
                Profile
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowVoice(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e5e0] rounded-full text-xs font-sans font-bold uppercase tracking-widest text-[#5A5A40] hover:bg-[#f5f5f0] transition-all shadow-sm"
            >
              <Volume2 className="w-4 h-4" />
              Voice
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#f5f5f0] rounded-full text-sm font-sans font-medium">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span>{profile?.karma || 0} Karma</span>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm"
            >
              <img src={user.photoURL || ''} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </button>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="bg-[#FFD700] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 rounded-3xl min-h-[80vh]">
          {activeTab === 'lab' && <AILab user={user} />}
          {activeTab === 'dashboard' && <Dashboard user={user} profile={profile} onlineConnections={onlineConnections || []} pendingRequests={pendingRequests || []} onJoinRoom={setCurrentRoomId} />}
          {activeTab === 'explore' && <Explore user={user} profile={profile} />}
          {activeTab === 'sessions' && <SessionsView user={user} sessions={sessions || []} />}
          {activeTab === 'profile' && <ProfileView user={user} profile={profile} onUpdate={setProfile} />}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-8 border-black p-10 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Setup Your Desk</h2>
              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedProfile = {
                  ...profile,
                  college: formData.get('college') as string,
                  bio: formData.get('bio') as string,
                  skillsToTeach: (formData.get('teach') as string).split(',').map(s => s.trim()).filter(Boolean),
                  skillsToLearn: (formData.get('learn') as string).split(',').map(s => s.trim()).filter(Boolean),
                };
                await setDoc(doc(db, 'users', user.uid), updatedProfile);
                setProfile(updatedProfile as UserProfile);
                setIsProfileModalOpen(false);
              }}>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-400 block mb-2">College Name</label>
                  <input
                    name="college"
                    defaultValue={profile?.college}
                    placeholder="e.g. IIT Delhi"
                    className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-400 block mb-2">Skills You Can Teach (comma separated)</label>
                  <input
                    name="teach"
                    defaultValue={profile?.skillsToTeach?.join(', ')}
                    placeholder="Python, Guitar, UI Design"
                    className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-400 block mb-2">Skills You Want to Learn</label>
                  <input
                    name="learn"
                    defaultValue={profile?.skillsToLearn?.join(', ')}
                    placeholder="React, French, Chess"
                    className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-[#0080FF] text-white">Save Desk</Button>
                  <Button type="button" variant="ghost" onClick={() => setIsProfileModalOpen(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isPostModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-8 border-black p-10 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Post to Bulletin</h2>
              <form className="space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await addDoc(collection(db, 'posts'), {
                  authorUid: user.uid,
                  authorName: user.displayName,
                  authorPhoto: user.photoURL,
                  type: formData.get('type'),
                  skill: formData.get('skill'),
                  description: formData.get('description'),
                  password: formData.get('password') || null,
                  createdAt: serverTimestamp(),
                });
                setIsPostModalOpen(false);
              }}>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-400 block mb-2">I want to...</label>
                  <select
                    name="type"
                    className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] appearance-none"
                  >
                    <option value="teach">Teach a Skill</option>
                    <option value="learn">Learn a Skill</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-400 block mb-2">Skill Name</label>
                  <input
                    name="skill"
                    placeholder="e.g. Advanced Python"
                    className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-400 block mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Tell others what you can offer or what you're looking for..."
                    className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-gray-400 block mb-2">Meeting Password (Optional)</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Leave empty for public room"
                    className="w-full bg-white border-4 border-black px-4 py-3 font-bold focus:outline-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-[#FF80BF] text-black">Post Now</Button>
                  <Button type="button" variant="ghost" onClick={() => setIsPostModalOpen(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {showVoice && <VoiceAssistant onClose={() => setShowVoice(false)} />}
    </div>
  );
}

