
import React, { useState, useRef } from 'react';
import { generateSunoPrompt, generateAudioPreview, decodeBase64, decodeAudioData } from './services/geminiService';
import { GeneratedPrompt, Speaker } from './types';
import { STRUCTURAL_TAGS, PREBUILT_VOICES, GENRE_PRESETS, PRODUCTION_EFFECTS, TAG_DESCRIPTIONS } from './constants';
import TagBadge from './components/TagBadge';

const InteractiveTag: React.FC<{ text: string; colorClass: string }> = ({ text, colorClass }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Extract tag name without brackets for lookup
  const tagName = text.replace(/[\[\]]/g, '').split(':')[0].trim();
  const description = TAG_DESCRIPTIONS[tagName] || "A structural or stylistic instruction for the AI model.";

  return (
    <div 
      className="relative group block my-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`${colorClass} font-bold block py-1 border-y border-slate-800/30 cursor-help transition-colors hover:bg-slate-800/20`}>
        {text}
      </span>
      {showTooltip && (
        <div className="absolute left-0 -top-12 z-50 w-64 p-3 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <div className="flex items-start gap-2">
            <div className={`w-1 h-full min-h-[20px] rounded-full mt-1 ${colorClass.replace('text-', 'bg-')}`}></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-tighter text-slate-500 mb-1">Metatag Guide</p>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">{description}</p>
            </div>
          </div>
          <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-950 border-r border-b border-slate-700 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [lyrics, setLyrics] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(GENRE_PRESETS[0]);
  const [customGenre, setCustomGenre] = useState('');
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const addSpeaker = () => {
    const id = crypto.randomUUID();
    const voiceCount = speakers.length + 1;
    setSpeakers([...speakers, { 
      id, 
      name: `Singer ${voiceCount}`, 
      voice: PREBUILT_VOICES[voiceCount % PREBUILT_VOICES.length].id 
    }]);
  };

  const removeSpeaker = (id: string) => {
    setSpeakers(speakers.filter(s => s.id !== id));
  };

  const updateSpeaker = (id: string, updates: Partial<Speaker>) => {
    setSpeakers(speakers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleGenerate = async () => {
    if (!lyrics.trim()) {
      setError("Please provide some lyrics first!");
      return;
    }
    setLoading(true);
    setError(null);
    const theme = selectedGenre === "Custom..." ? customGenre : selectedGenre;
    try {
      const data = await generateSunoPrompt(lyrics, theme, speakers);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const playVocalPreview = async () => {
    if (!result) return;
    setAudioLoading(true);
    setError(null);
    try {
      const base64 = await generateAudioPreview(result.structuredLyrics, speakers);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const audioBytes = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch (err: any) {
      setError("Failed to generate vocal preview. " + err.message);
    } finally {
      setAudioLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
          SUNO METATAG MACHINE
        </h1>
        <p className="text-slate-400 text-lg">
          Professional songwriting structure with advanced production metatags.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config */}
        <section className="lg:col-span-5 space-y-6">
          {/* Lyrics Input */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
              1. Lyrics
            </label>
            <textarea
              className="w-full h-56 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none font-mono text-sm"
              placeholder="Enter your verses and choruses here..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
            />
          </div>

          {/* Speaker Management */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-semibold text-purple-400 uppercase tracking-wider">
                2. Voices & Characters
              </label>
              <button 
                onClick={addSpeaker}
                className="text-xs bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-lg hover:bg-purple-600/30 transition-all"
              >
                + Add Character
              </button>
            </div>
            
            <div className="space-y-3">
              {speakers.length === 0 && (
                <p className="text-slate-500 text-xs italic">Single voice by default. Add more for duets/groups.</p>
              )}
              {speakers.map((speaker) => (
                <div key={speaker.id} className="flex gap-2 items-center bg-slate-950 p-3 rounded-xl border border-slate-800 group">
                  <input
                    type="text"
                    value={speaker.name}
                    placeholder="Name"
                    onChange={(e) => updateSpeaker(speaker.id, { name: e.target.value })}
                    className="bg-transparent border-b border-slate-700 text-sm focus:border-cyan-500 outline-none w-28 px-1"
                  />
                  <select
                    value={speaker.voice}
                    onChange={(e) => updateSpeaker(speaker.id, { voice: e.target.value })}
                    className="bg-slate-800 text-xs rounded border border-slate-700 p-1 outline-none text-slate-300 flex-grow cursor-pointer"
                  >
                    {PREBUILT_VOICES.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => removeSpeaker(speaker.id)}
                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Genre/Theme Dropdown */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <label className="block text-sm font-semibold text-pink-400 mb-3 uppercase tracking-wider">
              3. Theme & Musical Direction
            </label>
            <div className="space-y-4">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all cursor-pointer"
              >
                {GENRE_PRESETS.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              {selectedGenre === "Custom..." && (
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all animate-in slide-in-from-top-2 duration-300"
                  placeholder="e.g., Psychedelic Synth-Pop with heavy distortion..."
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                />
              )}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-5 rounded-xl font-black text-xl shadow-lg transition-all transform active:scale-[0.98] ${
              loading 
                ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                : 'bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:brightness-110 text-white shadow-cyan-500/20'
            }`}
          >
            {loading ? 'ANALYZING HARMONIES...' : 'GENERATE PRODUCTION PROMPT'}
          </button>
        </section>

        {/* Right Column: Output */}
        <section className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800">
              <div className="w-24 h-24 mb-6 text-slate-800">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </div>
              <h2 className="text-slate-400 font-bold text-xl mb-2">Ready for Mastering</h2>
              <p className="text-slate-500 italic max-w-sm">
                Paste your lyrics and select your vibe to generate a professional Suno metadata map.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              {/* Audio Preview Controls */}
              <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${audioLoading ? 'bg-indigo-500 animate-pulse' : 'bg-indigo-600/20 text-indigo-400'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-indigo-200 font-bold text-lg leading-tight">Mastering Preview</h3>
                    <p className="text-slate-400 text-xs">Hear the pacing and character distribution.</p>
                  </div>
                </div>
                <button
                  onClick={playVocalPreview}
                  disabled={audioLoading}
                  className={`px-10 py-4 rounded-full font-black text-sm uppercase transition-all flex items-center gap-3 ${
                    audioLoading ? 'bg-slate-700 text-slate-400' : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/30 active:scale-95'
                  }`}
                >
                  {audioLoading ? 'PROCESSING...' : 'PLAY VOCAL PREVIEW'}
                </button>
              </div>

              {/* Style Tags */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl group">
                <div className="bg-slate-800/50 px-6 py-4 flex justify-between items-center border-b border-slate-800">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Suno Prompt: Style of Music</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{result.styleOfMusic.length}/120</span>
                    <button onClick={() => copyToClipboard(result.styleOfMusic)} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded hover:bg-cyan-500/20 transition-all">Copy</button>
                  </div>
                </div>
                <div className="p-6 font-mono text-cyan-200 text-xl leading-relaxed bg-slate-950/30 group-hover:bg-slate-950/50 transition-colors">
                  {result.styleOfMusic}
                </div>
              </div>

              {/* Structured Lyrics */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl group">
                <div className="bg-slate-800/50 px-6 py-4 flex justify-between items-center border-b border-slate-800">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Master Production Layout</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 hidden md:inline">Hover tags for details</span>
                    <button onClick={() => copyToClipboard(result.structuredLyrics)} className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-1.5 rounded hover:bg-purple-500/20 transition-all font-bold">Copy All Lyrics</button>
                  </div>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-950/40 relative">
                  <pre className="font-mono text-slate-300 whitespace-pre-wrap text-sm leading-7">
                    {result.structuredLyrics.split('\n').map((line, i) => {
                      const trimmed = line.trim();
                      const isTag = trimmed.startsWith('[') && trimmed.endsWith(']');
                      let colorClass = 'text-cyan-400';
                      
                      if (trimmed.includes('Chorus')) colorClass = 'text-pink-400';
                      else if (trimmed.includes('Drop') || trimmed.includes('Solo')) colorClass = 'text-yellow-400';
                      else if (trimmed.includes('Verse')) colorClass = 'text-purple-400';
                      else if (trimmed.includes('Break')) colorClass = 'text-red-400';

                      if (isTag) {
                        return <InteractiveTag key={i} text={trimmed} colorClass={colorClass} />;
                      }

                      return (
                        <span key={i} className="block">
                          {line}
                          {'\n'}
                        </span>
                      );
                    })}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Footer / Knowledge Base */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="p-8 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl">
          <h4 className="text-cyan-400 text-xs font-bold uppercase mb-4 tracking-widest">Master Structural Tags</h4>
          <div className="flex flex-wrap gap-2">
            {STRUCTURAL_TAGS.map(tag => <TagBadge key={tag} label={tag} />)}
          </div>
        </div>

        <div className="p-8 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl">
          <h4 className="text-pink-400 text-xs font-bold uppercase mb-4 tracking-widest">Production Texture Tags</h4>
          <div className="flex flex-wrap gap-2">
            {PRODUCTION_EFFECTS.map(tag => (
              <span key={tag} className="px-2 py-1 text-xs font-mono bg-slate-950 text-pink-300 border border-pink-500/20 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-20 py-10 border-t border-slate-800 text-center text-slate-600 text-sm">
        <p className="font-bold mb-2">SUNO METATAG MACHINE v2.1</p>
        <p>Optimized for Multi-Speaker Songs & Interactive Studio Production.</p>
      </footer>

      {error && (
        <div className="fixed bottom-6 right-6 p-4 bg-red-900 border border-red-500 text-white rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 hover:text-red-200">Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
