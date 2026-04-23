/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Copy, Check, Save, Download, FolderOpen, X, Trash2 } from 'lucide-react';
import { generateRapLyrics, RapEngineResponse } from './services/geminiService';
import { cn } from './lib/utils';

interface SavedLyric {
  id: string;
  timestamp: number;
  topic: string;
  reference: string;
  response: RapEngineResponse;
}

export default function App() {
  const [referenceLyrics, setReferenceLyrics] = useState('');
  const [topic, setTopic] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RapEngineResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Vault State
  const [showVault, setShowVault] = useState(false);
  const [savedVault, setSavedVault] = useState<SavedLyric[]>(() => {
    try {
      const stored = localStorage.getItem('ai-rap-vault');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ai-rap-vault', JSON.stringify(savedVault));
  }, [savedVault]);

  const handleGenerate = async () => {
    if (!referenceLyrics.trim()) {
      setError('ERROR: Reference lyrics required.');
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    setResult(null);
    setSaved(false);

    try {
      const response = await generateRapLyrics(referenceLyrics, topic, debugMode);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ERROR: Engine failure.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.lyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadTxt = () => {
    if (!result) return;
    const content = `=== AI RAP ENGINE: ${topic || 'UNTITLED'} ===\n\n${result.lyrics}\n\n=== FLOW BLUEPRINT ===\nRhyme Scheme:\n${result.flowBlueprint.rhymeSchemeMap}\n\nCadence:\n${result.flowBlueprint.cadenceNotes}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RAP_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveToVault = () => {
    if (!result) return;
    const newEntry: SavedLyric = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      topic: topic || 'UNTITLED',
      reference: referenceLyrics,
      response: result
    };
    setSavedVault(prev => [newEntry, ...prev]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const loadFromVault = (entry: SavedLyric) => {
    setReferenceLyrics(entry.reference);
    setTopic(entry.topic);
    setResult(entry.response);
    setShowVault(false);
  };

  const deleteFromVault = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedVault(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-miami-bg text-white selection:bg-miami-pink/30 selection:text-white relative">
      
      {/* HEADER */}
      <header className="border-b-4 border-miami-panel-border bg-miami-panel py-6 px-8 flex items-center justify-between sticky top-0 z-50">
        <h1 className="font-display font-800 text-3xl md:text-5xl uppercase tracking-tighter text-miami-cyan drop-shadow-[0_0_10px_rgba(13,240,227,0.5)]">
          AI RAP ENGINE
        </h1>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowVault(true)}
            className="rounded-full border-4 border-miami-purple bg-miami-bg px-6 py-2 text-xl font-display font-800 text-miami-purple uppercase tracking-widest hover:bg-miami-purple hover:text-white transition-all hover:shadow-[0_0_20px_rgba(117,16,255,0.5)] flex items-center gap-3"
          >
            <FolderOpen className="w-6 h-6" />
            VAULT ({savedVault.length})
          </button>
          <div className="font-mono text-xl font-bold text-miami-pink tracking-widest uppercase hidden md:block drop-shadow-[0_0_10px_rgba(255,16,122,0.5)]">
            SYSTEM: ONLINE
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-12 grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
        {/* INPUT COLUMN */}
        <div className="space-y-12">
          
          <div className="bg-miami-panel border-4 border-miami-panel-border rounded-[2rem] p-8 shadow-[0_8px_32px_rgba(43,13,71,0.5)]">
            <h2 className="font-display font-800 text-3xl text-miami-cyan uppercase tracking-widest mb-8 flex items-center gap-4">
              <span className="bg-miami-cyan w-4 h-12 inline-block rounded-full shadow-[0_0_15px_rgba(13,240,227,0.8)]"></span>
              1. REFERENCE LYRICS
            </h2>
            
            <textarea
              className="w-full bg-miami-bg border-4 border-miami-panel-border rounded-3xl p-8 text-xl font-mono text-white focus:outline-none focus:border-miami-pink focus:shadow-[0_0_25px_rgba(255,16,122,0.4)] transition-all resize-y min-h-[300px] placeholder:text-miami-panel-border/80"
              placeholder="PASTE ORIGINAL LYRICS HERE..."
              value={referenceLyrics}
              onChange={(e) => setReferenceLyrics(e.target.value)}
            />
          </div>

          <div className="bg-miami-panel border-4 border-miami-panel-border rounded-[2rem] p-8 shadow-[0_8px_32px_rgba(43,13,71,0.5)]">
            <h2 className="font-display font-800 text-3xl text-miami-purple uppercase tracking-widest mb-8 flex items-center gap-4">
              <span className="bg-miami-purple w-4 h-12 inline-block rounded-full shadow-[0_0_15px_rgba(117,16,255,0.8)]"></span>
              2. NEW TOPIC
            </h2>
            
            <input
              type="text"
              className="w-full bg-miami-bg border-4 border-miami-panel-border rounded-full px-8 py-6 text-2xl font-sans text-white focus:outline-none focus:border-miami-cyan focus:shadow-[0_0_25px_rgba(13,240,227,0.4)] transition-all placeholder:text-miami-panel-border/80"
              placeholder="E.G. WINNING A CHAMPIONSHIP"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* CONTROLS */}
          <div className="flex flex-col md:flex-row gap-6 items-center bg-miami-panel border-4 border-miami-panel-border rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(43,13,71,0.5)]">
            
            <div className="flex-1 flex items-center gap-6 px-4">
              <button
                type="button"
                onClick={() => setDebugMode(!debugMode)}
                className={cn(
                  "relative inline-flex h-12 w-24 items-center rounded-full transition-colors focus:outline-none",
                  debugMode ? "bg-miami-cyan shadow-[0_0_20px_rgba(13,240,227,0.6)]" : "bg-miami-bg border-4 border-miami-panel-border"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-8 w-8 transform rounded-full bg-white transition-transform duration-300",
                    debugMode ? "translate-x-14" : "translate-x-2"
                  )}
                />
              </button>
              <span className="font-display font-800 text-2xl text-white uppercase tracking-widest">
                DEBUG MODE
              </span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !referenceLyrics.trim()}
              className="w-full md:w-auto flex-2 rounded-full bg-gradient-to-r from-miami-pink to-miami-purple px-10 py-6 text-2xl font-display font-800 uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(255,16,122,0.8)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:grayscale"
            >
              {isGenerating ? "GENERATING..." : "EXECUTE ENGINE"}
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#2a0000] border-4 border-red-500 rounded-[2rem] p-8 text-center"
            >
              <p className="font-display font-800 text-3xl text-red-500 uppercase tracking-widest">{error}</p>
            </motion.div>
          )}

        </div>

        {/* OUTPUT COLUMN */}
        <div className="bg-miami-panel border-4 border-miami-panel-border rounded-[2rem] shadow-[0_8px_32px_rgba(43,13,71,0.5)] flex flex-col min-h-[800px] overflow-hidden">
          
          <div className="border-b-4 border-miami-panel-border p-8 bg-[#11051F] flex flex-wrap gap-4 justify-between items-center">
             <h2 className="font-display font-800 text-3xl text-miami-pink uppercase tracking-widest flex items-center gap-4">
              <span className="bg-miami-pink w-4 h-12 inline-block rounded-full shadow-[0_0_15px_rgba(255,16,122,0.8)]"></span>
              OUTPUT RUN
            </h2>
            
            {result && (
              <div className="flex items-center gap-4 flex-wrap">
                <button 
                  onClick={copyToClipboard}
                  className="rounded-full border-4 border-miami-cyan bg-miami-bg px-6 py-3 text-xl font-display font-800 text-miami-cyan uppercase tracking-widest hover:bg-miami-cyan hover:text-miami-bg transition-all hover:shadow-[0_0_20px_rgba(13,240,227,0.5)] flex items-center gap-3"
                >
                  {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  {copied ? 'COPIED!' : 'COPY'}
                </button>
                <button 
                  onClick={downloadTxt}
                  className="rounded-full border-4 border-miami-cyan bg-miami-bg px-6 py-3 text-xl font-display font-800 text-miami-cyan uppercase tracking-widest hover:bg-miami-cyan hover:text-miami-bg transition-all hover:shadow-[0_0_20px_rgba(13,240,227,0.5)] flex items-center gap-3"
                >
                  <Download className="w-6 h-6" />
                  TXT
                </button>
                <button 
                  onClick={saveToVault}
                  className="rounded-full border-4 border-miami-purple bg-miami-bg px-6 py-3 text-xl font-display font-800 text-miami-purple uppercase tracking-widest hover:bg-miami-purple hover:text-white transition-all hover:shadow-[0_0_20px_rgba(117,16,255,0.5)] flex items-center gap-3"
                >
                  {saved ? <Check className="w-6 h-6" /> : <Save className="w-6 h-6" />}
                  {saved ? 'SAVED!' : 'SAVE TO VAULT'}
                </button>
              </div>
            )}
          </div>

          <div className="p-8 flex-1 flex flex-col">
            
            {!result && !isGenerating && (
              <div className="flex-1 flex items-center justify-center">
                <span className="font-display font-800 text-4xl text-miami-panel-border uppercase tracking-widest">AWAITING SYSTEM</span>
              </div>
            )}

            {isGenerating && (
              <div className="flex-1 flex flex-col items-center justify-center gap-8">
                <div className="flex gap-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ["30px", "100px", "30px"] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                      className="w-6 bg-miami-cyan rounded-full shadow-[0_0_20px_rgba(13,240,227,0.8)]"
                    />
                  ))}
                </div>
                <p className="font-display font-800 text-3xl text-miami-cyan tracking-widest uppercase">RECONSTRUCTING DNA...</p>
              </div>
            )}

            {result && (
              <div className="space-y-12">
                <div className="bg-miami-bg border-4 border-miami-panel-border rounded-3xl p-10">
                  <pre className="font-sans text-2xl md:text-3xl font-600 text-white whitespace-pre-wrap leading-[2.5] md:leading-[2.5]">
                    {result.lyrics}
                  </pre>
                </div>

                <AnimatePresence>
                  {debugMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-8 pt-8 border-t-4 border-miami-panel-border">
                         <h3 className="font-display font-800 text-2xl text-miami-purple uppercase tracking-widest mb-8 drop-shadow-[0_0_10px_rgba(117,16,255,0.8)]">
                           FLOW BLUEPRINT
                         </h3>
                         <div className="grid gap-6">
                           <BlueprintCard title="RHYME SCHEME" value={result.flowBlueprint.rhymeSchemeMap} color="pink" />
                           <BlueprintCard title="SYLLABLE COUNT" value={result.flowBlueprint.syllableCountPerBar} color="cyan" />
                           <BlueprintCard title="CADENCE NOTES" value={result.flowBlueprint.cadenceNotes} color="purple" />
                           <BlueprintCard title="STRESS PATTERNS" value={result.flowBlueprint.stressPatternNotes} color="pink" />
                           <BlueprintCard title="PATTERN SHIFTS" value={result.flowBlueprint.patternShifts} color="cyan" />
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* VAULT MODAL */}
      <AnimatePresence>
        {showVault && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }} 
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] bg-miami-bg/95 flex flex-col p-8 overflow-y-auto"
          >
            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-12 border-b-4 border-miami-panel-border pb-6">
                 <h2 className="font-display font-800 text-5xl text-miami-cyan uppercase tracking-widest flex items-center gap-6 drop-shadow-[0_0_10px_rgba(13,240,227,0.5)]">
                  <div className="p-4 bg-miami-cyan text-miami-bg rounded-2xl">
                    <FolderOpen className="w-10 h-10" />
                  </div>
                  SAVED VAULT
                </h2>
                <button onClick={() => setShowVault(false)} className="text-miami-pink hover:text-white transition-colors bg-miami-panel border-4 border-miami-pink rounded-full p-4 hover:shadow-[0_0_20px_rgba(255,16,122,0.6)]">
                  <X className="w-8 h-8" />
                </button>
              </div>

              {savedVault.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center">
                   <div className="w-32 h-32 rounded-full border-8 border-miami-panel-border flex items-center justify-center mb-8">
                     <FolderOpen className="w-16 h-16 text-miami-panel-border" />
                   </div>
                   <span className="font-display font-800 text-4xl text-miami-panel-border uppercase tracking-widest">VAULT IS EMPTY</span>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
                   {savedVault.map(entry => (
                     <div 
                       key={entry.id} 
                       onClick={() => loadFromVault(entry)} 
                       className="bg-miami-panel border-4 border-miami-panel-border rounded-[2rem] p-8 cursor-pointer hover:border-miami-cyan hover:shadow-[0_0_30px_rgba(13,240,227,0.4)] transition-all group relative flex flex-col"
                     >
                       <button 
                         onClick={(e) => deleteFromVault(entry.id, e)} 
                         className="absolute top-6 right-6 p-3 bg-miami-bg border-4 border-miami-panel-border rounded-xl text-miami-panel-border hover:border-miami-pink hover:text-miami-pink transition-colors z-10"
                       >
                         <Trash2 className="w-6 h-6" />
                       </button>
                       <h3 className="font-display font-800 text-3xl text-miami-purple uppercase tracking-widest mb-4 pr-16 truncate drop-shadow-[0_0_10px_rgba(117,16,255,0.3)]">
                         {entry.topic === 'UNTITLED' ? 'NO TOPIC' : entry.topic}
                       </h3>
                       <p className="font-mono text-miami-cyan/60 text-lg mb-8 font-bold">
                         {new Date(entry.timestamp).toLocaleString()}
                       </p>
                       <div className="flex-1 bg-miami-bg rounded-2xl p-6 border-4 border-miami-panel-border/50 group-hover:border-miami-cyan/30 transition-colors">
                         <p className="font-sans text-xl text-white/80 line-clamp-4 leading-relaxed font-600">
                           {entry.response.lyrics}
                         </p>
                       </div>
                     </div>
                   ))}
                 </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BlueprintCard({ title, value, color }: { title: string, value: string, color: 'pink' | 'cyan' | 'purple' }) {
  const borderColors = {
    pink: "border-miami-pink shadow-[0_0_15px_rgba(255,16,122,0.3)]",
    cyan: "border-miami-cyan shadow-[0_0_15px_rgba(13,240,227,0.3)]",
    purple: "border-miami-purple shadow-[0_0_15px_rgba(117,16,255,0.3)]"
  };

  const textColors = {
    pink: "text-miami-pink",
    cyan: "text-miami-cyan",
    purple: "text-miami-purple"
  };

  return (
    <div className={cn("bg-miami-bg border-4 rounded-3xl p-8", borderColors[color])}>
      <h4 className={cn("font-display font-800 text-2xl uppercase tracking-widest mb-4", textColors[color])}>
        {title}
      </h4>
      <p className="text-xl font-mono text-white/90 leading-relaxed whitespace-pre-wrap">{value}</p>
    </div>
  );
}


