
import React, { useState, useRef, useEffect } from 'react';
import { generateSunoPrompt, refineSunoPrompt, styleVocalTracks, generateAudioPreview, decodeBase64, decodeAudioData, generateImageFromPrompt } from './services/geminiService';
import { GeneratedPrompt, Speaker, ImageSize } from './types';
import { PREBUILT_VOICES, GENRE_PRESETS, TAG_DESCRIPTIONS, VOCAL_STYLE_EFFECTS, CATEGORIZED_VOCAL_EFFECTS } from './constants';
import TagBadge from './components/TagBadge';

const CORE_STRUCTURAL_TAGS = [
  "Intro", "Verse", "Pre-Chorus", 
  "Chorus", "Hook", "Bridge", 
  "Break", "Interlude", "Solo", 
  "Drop", "Build", "Outro"
];

const CORE_PRODUCTION_EFFECTS = [
  "[Heavy 808]", "[Phonk Cowbell]", "[Evil Laughter]", 
  "[Distorted Synth]", "[Vocal Harmonies]", "[Reverb Drenched]",
  "[Stutter Edit]", "[Lo-fi Filter]", "[Cinematic Hit]"
];

interface VocalPreset {
  id: string;
  name: string;
  effects: string[];
  reverbAmount: number;
  delayTime: number;
}

const InteractiveTag: React.FC<{ text: string; colorClass: string }> = ({ text, colorClass }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const tagName = text.replace(/[\[\]]/g, '').split(':')[0].trim();
  const description = TAG_DESCRIPTIONS[tagName] || "A structural or stylistic instruction for the AI model.";

  return (
    <div 
      className="relative group inline-block mr-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`${colorClass} font-bold px-2 py-0.5 rounded border border-slate-700/50 cursor-help transition-all hover:bg-slate-800/40 text-xs`}>
        {text}
      </span>
      {showTooltip && (
        <div className="absolute left-0 -top-14 z-50 w-64 p-3 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
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

type WorkflowMode = 'architect' | 'styler' | 'visualizer';

const App: React.FC = () => {
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>('architect');
  const [lyrics, setLyrics] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(GENRE_PRESETS[0]);
  const [customGenre, setCustomGenre] = useState('');
  const [adLibDensity, setAdLibDensity] = useState('Medium');
  const [vocalTexture, setVocalTexture] = useState('Compressed');
  const [selectedVocalEffects, setSelectedVocalEffects] = useState<string[]>([]);
  const [vocalReverbAmount, setVocalReverbAmount] = useState(30);
  const [vocalDelayTime, setVocalDelayTime] = useState(0);
  const [selectedStructuralTags, setSelectedStructuralTags] = useState<string[]>(["Intro", "Verse", "Chorus", "Outro"]);
  const [selectedProductionEffects, setSelectedProductionEffects] = useState<string[]>([]);
  const [beatSwitchStyle, setBeatSwitchStyle] = useState('');
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [vocalPresets, setVocalPresets] = useState<VocalPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [refining, setRefining] = useState(false);
  const [speakerToInject, setSpeakerToInject] = useState<string>('');

  // New states for Image Generation
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [apiKeySelected, setApiKeySelected] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const lyricsRef = useRef<HTMLTextAreaElement>(null);

  // Check for API key on mount
  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setApiKeySelected(true);
      }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    if (speakers.length > 0 && !speakerToInject) {
      setSpeakerToInject(speakers[0].name);
    }
  }, [speakers]);
  
  const handleWorkflowChange = (mode: WorkflowMode) => {
    setWorkflowMode(mode);
    if (mode === 'visualizer' && lyrics.trim()) {
      setImagePrompt(lyrics);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setError("Please provide a prompt for the image.");
      return;
    }
    
    let currentApiKeySelected = apiKeySelected;
    // @ts-ignore
    if (!currentApiKeySelected && window.aistudio) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setApiKeySelected(true);
        currentApiKeySelected = true;
      } catch (e) {
        setError("An API Key from a paid GCP project is required for image generation.");
        return;
      }
    }

    if (!currentApiKeySelected) {
       setError("An API Key from a paid GCP project is required for image generation.");
       return;
    }

    setImageLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const base64Data = await generateImageFromPrompt(imagePrompt, imageSize);
      setImageUrl(`data:image/png;base64,${base64Data}`);
    } catch (e: any) {
      if (e.message.includes("Requested entity was not found")) {
        setError("Your API Key is invalid or expired. Please select a new one.");
        setApiKeySelected(false); 
      } else {
        setError(e.message || "An error occurred during image generation.");
      }
    } finally {
      setImageLoading(false);
    }
  };

  const saveCurrentAsPreset = () => {
    if (!newPresetName.trim()) {
      setError("Please enter a name for the preset.");
      return;
    }
    const preset: VocalPreset = {
      id: crypto.randomUUID(),
      name: newPresetName.trim(),
      effects: [...selectedVocalEffects],
      reverbAmount: vocalReverbAmount,
      delayTime: vocalDelayTime
    };
    setVocalPresets([preset, ...vocalPresets]);
    setNewPresetName('');
  };

  const loadPreset = (preset: VocalPreset) => {
    setSelectedVocalEffects(preset.effects);
    setVocalReverbAmount(preset.reverbAmount ?? 30);
    setVocalDelayTime(preset.delayTime ?? 0);
  };

  const deletePreset = (id: string) => {
    setVocalPresets(vocalPresets.filter(p => p.id !== id));
  };

  const addSpeaker = () => {
    const id = crypto.randomUUID();
    const voiceCount = speakers.length + 1;
    const newSpeaker = { 
      id, 
      name: `Singer ${voiceCount}`, 
      voice: PREBUILT_VOICES[voiceCount % PREBUILT_VOICES.length].id 
    };
    setSpeakers([...speakers, newSpeaker]);
    if (!speakerToInject) {
      setSpeakerToInject(newSpeaker.name);
    }
  };

  const removeSpeaker = (id: string) => {
    setSpeakers(speakers.filter(s => s.id !== id));
  };

  const updateSpeaker = (id: string, updates: Partial<Speaker>) => {
    setSpeakers(speakers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleVocalEffectToggle = (effect: string) => {
    setSelectedVocalEffects(prev => 
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
  };

  const handleStructuralTagToggle = (tag: string) => {
    setSelectedStructuralTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleProductionEffectToggle = (effect: string) => {
    setSelectedProductionEffects(prev => 
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
  };

  const insertTag = (tag: string) => {
    if (!lyricsRef.current) return;
    const start = lyricsRef.current.selectionStart;
    const end = lyricsRef.current.selectionEnd;
    const text = lyrics;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const tagText = `[${tag}]`;
    const newText = before + (before.endsWith('\n') || before === '' ? '' : '\n') + tagText + '\n' + after;
    setLyrics(newText);
    
    setTimeout(() => {
      if (lyricsRef.current) {
        lyricsRef.current.focus();
        const newPos = start + tagText.length + (before.endsWith('\n') || before === '' ? 1 : 2);
        lyricsRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const insertBeatSwitch = () => insertTag('Beat Switch');

  const handleGenerate = async () => {
    if (!lyrics.trim()) {
      setError("Please provide some lyrics first!");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data;
      if (workflowMode === 'architect') {
        const theme = `${selectedGenre === "Custom..." ? customGenre : selectedGenre}. Ad-lib Density: ${adLibDensity}. Vocal Texture: ${vocalTexture}.`;
        data = await generateSunoPrompt(lyrics, theme, speakers, selectedStructuralTags, selectedProductionEffects, beatSwitchStyle);
      } else {
        data = await styleVocalTracks(lyrics, selectedVocalEffects, speakers, vocalReverbAmount, vocalDelayTime);
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refinementPrompt.trim() || !result) {
      setError("Please provide refinement instructions.");
      return;
    }
    setRefining(true);
    setError(null);
    try {
      const refinedData = await refineSunoPrompt(result, refinementPrompt, speakers);
      setResult(refinedData);
      setRefinementPrompt('');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during refinement.");
    } finally {
      setRefining(false);
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
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
          AD-LIB ARCHITECT
        </h1>
        <p className="text-slate-400 text-lg">
          Vocal texture mastery and structural Suno AI prompt engineering.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 space-y-6">

          <div className="flex bg-slate-900/50 border border-slate-800 rounded-xl p-1">
            <button onClick={() => handleWorkflowChange('architect')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${workflowMode === 'architect' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`}>Song Architect</button>
            <button onClick={() => handleWorkflowChange('styler')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${workflowMode === 'styler' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`}>Vocal Styler</button>
            <button onClick={() => handleWorkflowChange('visualizer')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${workflowMode === 'visualizer' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`}>Album Art</button>
          </div>

          {workflowMode !== 'visualizer' && (
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-orange-400 uppercase tracking-wider">
                  1. Raw Lyrics
                </label>
                {workflowMode === 'architect' && (
                  <button onClick={insertBeatSwitch} className="text-[10px] bg-yellow-600/20 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded hover:bg-yellow-600/30 font-bold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Insert [Beat Switch]
                  </button>
                )}
              </div>
              <textarea ref={lyricsRef} className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none font-mono text-sm" placeholder="Paste your lyrics here..." value={lyrics} onChange={(e) => setLyrics(e.target.value)} />
            </div>
          )}

          {workflowMode === 'architect' && (
             <>
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl animate-in fade-in duration-300">
                <label className="block text-sm font-semibold text-red-400 mb-4 uppercase tracking-wider">
                  2. Structural Sections
                </label>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {CORE_STRUCTURAL_TAGS.map(tag => (
                    <label key={tag} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${selectedStructuralTags.includes(tag) ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50'}`}>
                      <input type="checkbox" checked={selectedStructuralTags.includes(tag)} onChange={() => handleStructuralTagToggle(tag)} className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-red-500 focus:ring-red-600" />
                      <span className="text-xs font-medium text-slate-300">{tag}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <label className="block text-sm font-semibold text-orange-400 uppercase tracking-wider">
                    3. Production Effects
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {CORE_PRODUCTION_EFFECTS.map(effect => (
                    <label key={effect} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${selectedProductionEffects.includes(effect) ? 'bg-orange-500/20 border-orange-500/50' : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50'}`}>
                      <input type="checkbox" checked={selectedProductionEffects.includes(effect)} onChange={() => handleProductionEffectToggle(effect)} className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-orange-500 focus:ring-orange-600" />
                      <span className="text-[10px] font-medium text-slate-300">{effect.replace(/[\[\]]/g, '')}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-6 bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/20">
                  <label className="block text-[10px] font-semibold text-yellow-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Beat Switch Configuration
                  </label>
                  <input 
                    type="text" 
                    placeholder="Transition to... (e.g. Heavy DnB, Screamo)" 
                    value={beatSwitchStyle}
                    onChange={(e) => setBeatSwitchStyle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:ring-1 focus:ring-yellow-500 outline-none"
                  />
                  <p className="text-[9px] text-slate-500 mt-2 italic">Requires [Beat Switch] tag in lyrics to activate.</p>
                </div>

                <label className="block text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                  Ad-Lib Architecture
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase mb-1">Density</span>
                    <select value={adLibDensity} onChange={(e) => setAdLibDensity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 outline-none">
                      <option value="None">None</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Extreme">Extreme</option>
                    </select>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase mb-1">Texture</span>
                    <select value={vocalTexture} onChange={(e) => setVocalTexture(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 outline-none">
                      <option value="Natural">Natural</option>
                      <option value="Compressed">Compressed</option>
                      <option value="Gritty">Gritty</option>
                      <option value="Ethereal">Ethereal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl animate-in fade-in duration-300">
                <label className="block text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
                  4. Master Genre
                </label>
                <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none">
                  {GENRE_PRESETS.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                </select>
                {selectedGenre === "Custom..." && (
                  <input type="text" className="w-full mt-4 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="e.g., Gritty Memphis Rap..." value={customGenre} onChange={(e) => setCustomGenre(e.target.value)} />
                )}
              </div>
            </>
          )}

          {workflowMode === 'styler' && (
            <>
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl animate-in fade-in duration-300">
                <label className="block text-sm font-semibold text-red-400 mb-4 uppercase tracking-wider">
                  2. Vocal Arrangement Toolkit
                </label>
                
                <div className="space-y-4">
                  {CATEGORIZED_VOCAL_EFFECTS.map(cat => (
                    <details key={cat.category} className="group">
                      <summary className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer bg-slate-950/50 border border-slate-800 hover:border-${cat.color}-500/50 transition-all`}>
                        <svg className={`w-4 h-4 text-${cat.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cat.icon}></path></svg>
                        <span className="text-xs font-bold text-slate-300">{cat.category}</span>
                        <svg className="w-4 h-4 ml-auto text-slate-500 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </summary>
                      <div className={`p-3 bg-slate-950/20 border-x border-b border-slate-800 rounded-b-lg flex flex-wrap gap-1.5`}>
                        {cat.effects.map(effect => (
                           <button key={effect} onClick={() => insertTag(effect)} className={`text-[9px] bg-${cat.color}-600/10 text-${cat.color}-400 border border-${cat.color}-500/20 px-2 py-1 rounded hover:bg-${cat.color}-600/30 transition-all font-bold`}>
                            +{effect}
                          </button>
                        ))}
                      </div>
                    </details>
                  ))}
                  
                  <details className="group" open>
                     <summary className="flex items-center gap-2 p-2 rounded-lg cursor-pointer bg-slate-950/50 border border-slate-800 hover:border-indigo-500/50 transition-all">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l1.414 1.414M4.222 4.222l1.414 1.414m12.728 0l-1.414 1.414M5.636 18.364l-1.414 1.414"></path></svg>
                        <span className="text-xs font-bold text-slate-300">Granular Controls</span>
                        <svg className="w-4 h-4 ml-auto text-slate-500 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </summary>
                      <div className="p-3 bg-slate-950/20 border-x border-b border-slate-800 rounded-b-lg space-y-3">
                        <div className="flex items-center gap-2">
                           <select value={speakerToInject} onChange={e => setSpeakerToInject(e.target.value)} className="bg-slate-800 text-xs rounded border border-slate-700 p-1.5 outline-none text-slate-300 flex-grow cursor-pointer disabled:opacity-50" disabled={speakers.length === 0}>
                            {speakers.length > 0 ? speakers.map(s => <option key={s.id} value={s.name}>{s.name}</option>) : <option>Add a singer first</option>}
                           </select>
                           <button onClick={() => insertTag(`Speaker: ${speakerToInject}`)} disabled={!speakerToInject} className="text-[9px] bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-2 py-1.5 rounded hover:bg-indigo-600/30 font-bold disabled:opacity-50">Inject Speaker</button>
                        </div>
                         <div className="grid grid-cols-3 gap-2">
                          <button onClick={() => insertTag(`Reverb: ${vocalReverbAmount}%`)} className="text-[9px] text-center bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 p-1.5 rounded hover:bg-indigo-600/30 font-bold">Inject Reverb ({vocalReverbAmount}%)</button>
                          <button onClick={() => insertTag(`Delay: ${vocalDelayTime}ms`)} className="text-[9px] text-center bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 p-1.5 rounded hover:bg-indigo-600/30 font-bold">Inject Delay ({vocalDelayTime}ms)</button>
                          <button onClick={() => insertTag(`Pause: 0.5s`)} className="text-[9px] text-center bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 p-1.5 rounded hover:bg-indigo-600/30 font-bold">Inject Pause</button>
                        </div>
                      </div>
                  </details>
                </div>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <label className="block text-sm font-semibold text-pink-400 mb-4 uppercase tracking-wider">
                  3. Global Settings
                </label>
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reverb Mix</span>
                      <span className="text-xs font-mono text-cyan-400">{vocalReverbAmount}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={vocalReverbAmount} onChange={(e) => setVocalReverbAmount(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delay Time</span>
                      <span className="text-xs font-mono text-cyan-400">{vocalDelayTime}ms</span>
                    </div>
                    <input type="range" min="0" max="2000" step="50" value={vocalDelayTime} onChange={(e) => setVocalDelayTime(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                  </div>
                </div>
              </div>
            </>
          )}
          
          {workflowMode === 'visualizer' && (
            <>
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl animate-in fade-in duration-300">
                <label className="block text-sm font-semibold text-teal-400 mb-2 uppercase tracking-wider">
                  1. Image Prompt
                </label>
                <textarea className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none font-mono text-sm" placeholder="e.g., An astronaut floating in a sea of musical notes..." value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} />
              </div>
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl animate-in fade-in duration-300">
                <label className="block text-sm font-semibold text-teal-400 mb-4 uppercase tracking-wider">
                  2. Image Size
                </label>
                <div className="flex gap-2">
                  {(['1K', '2K', '4K'] as ImageSize[]).map(size => (
                    <button key={size} onClick={() => setImageSize(size)} className={`w-1/3 py-3 text-sm font-bold rounded-lg transition-all border ${imageSize === size ? 'bg-teal-500/20 border-teal-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-center shadow-xl">
                 <p className="text-[10px] text-slate-500">Image generation requires a paid Google Cloud project. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-400">Learn more about billing</a>.</p>
              </div>
            </>
          )}

          {workflowMode !== 'visualizer' && (
            <>
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-purple-400 uppercase tracking-wider">
                    {workflowMode === 'architect' ? '5.' : '4.'} Character Roster
                  </label>
                  <button onClick={addSpeaker} className="text-xs bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-lg hover:bg-purple-600/30">
                    + Add Singer
                  </button>
                </div>
                {speakers.map((speaker) => (
                  <div key={speaker.id} className="flex gap-2 items-center bg-slate-950 p-3 rounded-xl border border-slate-800 group mb-2">
                    <input type="text" value={speaker.name} placeholder="Name" onChange={(e) => updateSpeaker(speaker.id, { name: e.target.value })} className="bg-transparent border-b border-slate-700 text-sm focus:border-cyan-500 outline-none w-28 px-1" />
                    <select value={speaker.voice} onChange={(e) => updateSpeaker(speaker.id, { voice: e.target.value })} className="bg-slate-800 text-xs rounded border border-slate-700 p-1 outline-none text-slate-300 flex-grow cursor-pointer">
                      {PREBUILT_VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <button onClick={() => removeSpeaker(speaker.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                  </div>
                ))}
              </div>
            </>
          )}

          {workflowMode === 'architect' && (
            <button onClick={handleGenerate} disabled={loading} className={`w-full py-5 rounded-xl font-black text-xl shadow-lg transition-all transform active:scale-[0.98] ${ loading ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-gradient-to-r from-orange-500 via-red-600 to-purple-600 hover:brightness-110 text-white shadow-orange-500/20' }`}>
              {loading ? 'PROCESSING...' : 'CONSTRUCT PROMPT'}
            </button>
          )}
           {workflowMode === 'styler' && (
            <button onClick={handleGenerate} disabled={loading} className={`w-full py-5 rounded-xl font-black text-xl shadow-lg transition-all transform active:scale-[0.98] ${ loading ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-gradient-to-r from-orange-500 via-red-600 to-purple-600 hover:brightness-110 text-white shadow-orange-500/20' }`}>
              {loading ? 'PROCESSING...' : 'APPLY VOCAL STYLES'}
            </button>
          )}
           {workflowMode === 'visualizer' && (
            <button onClick={handleGenerateImage} disabled={imageLoading} className={`w-full py-5 rounded-xl font-black text-xl shadow-lg transition-all transform active:scale-[0.98] ${imageLoading ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:brightness-110 text-white'}`}>
              {imageLoading ? 'GENERATING...' : 'VISUALIZE ALBUM ART'}
            </button>
          )}

        </section>

        <section className="lg:col-span-7 space-y-6">
          {workflowMode === 'visualizer' ? (
            <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800 animate-in fade-in duration-300">
              {imageLoading && (
                <div className="text-center">
                   <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-500 mx-auto mb-4"></div>
                   <h3 className="text-slate-300 font-bold">Generating your masterpiece...</h3>
                   <p className="text-slate-500 text-sm">This can take a moment, especially for larger sizes.</p>
                </div>
              )}
              {!imageLoading && imageUrl && (
                 <img src={imageUrl} alt="Generated album art" className="rounded-lg shadow-2xl w-full h-full object-cover"/>
              )}
               {!imageLoading && !imageUrl && (
                <div className="text-center text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  <h2 className="text-slate-400 font-bold text-xl mb-2">Album Art Will Appear Here</h2>
                  <p className="text-slate-500 italic max-w-sm">Enter a prompt, select a size, and let your vision come to life.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800">
                  <div className="w-24 h-24 mb-6 text-slate-800"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg></div>
                  <h2 className="text-slate-400 font-bold text-xl mb-2">Awaiting Instructions</h2>
                  <p className="text-slate-500 italic max-w-sm">
                    Choose a workflow, input your lyrics, and let's create.
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-gradient-to-br from-orange-900/40 to-slate-900 border border-orange-500/30 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${audioLoading ? 'bg-orange-500 animate-pulse' : 'bg-orange-600/20 text-orange-400'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg></div>
                      <div><h3 className="text-orange-200 font-bold text-lg leading-tight">Vocal Playback</h3><p className="text-slate-400 text-xs">Simulate the rhythm and vocal effects.</p></div>
                    </div>
                    <button onClick={playVocalPreview} disabled={audioLoading} className={`px-10 py-4 rounded-full font-black text-sm uppercase transition-all flex items-center gap-3 ${ audioLoading ? 'bg-slate-700 text-slate-400' : 'bg-orange-500 hover:bg-orange-400 text-white shadow-xl shadow-orange-500/30 active:scale-95'}`}>
                      {audioLoading ? 'PROCESSING...' : 'HEAR PREVIEW'}
                    </button>
                  </div>

                  {workflowMode === 'architect' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl group">
                      <div className="bg-slate-800/50 px-6 py-4 flex justify-between items-center border-b border-slate-800"><h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Suno Prompt: Style of Music</h3><div className="flex items-center gap-3"><span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{result.styleOfMusic.length}/120</span><button onClick={() => copyToClipboard(result.styleOfMusic)} className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded hover:bg-cyan-500/20">Copy</button></div></div>
                      <div className="p-6 font-mono text-cyan-200 text-lg leading-relaxed bg-slate-950/30 group-hover:bg-slate-950/50">{result.styleOfMusic}</div>
                    </div>
                  )}

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl group">
                    <div className="bg-slate-800/50 px-6 py-4 flex justify-between items-center border-b border-slate-800"><h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest">{workflowMode === 'architect' ? 'Vocal Arrangement' : 'Styled Lyrics'}</h3><button onClick={() => copyToClipboard(result.structuredLyrics)} className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-1.5 rounded hover:bg-purple-500/20 font-bold">Copy Full Scheme</button></div>
                    <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-950/40 relative">
                      <div className="font-mono text-slate-300 whitespace-pre-wrap text-sm leading-8">
                        {result.structuredLyrics.split('\n').map((line, i) => { 
                          const trimmed = line.trim(); 
                          const isTag = trimmed.startsWith('[') && trimmed.endsWith(']'); 
                          if (isTag) { 
                            let colorClass = 'text-cyan-400'; 
                            const cleanTag = trimmed.replace(/[\[\]]/g, '').trim();
                            const tagName = cleanTag.split(':')[0].trim();
                            const isVocalEffect = VOCAL_STYLE_EFFECTS.some(e => tagName.toLowerCase() === e.toLowerCase());
                            const isGranular = ['speaker', 'reverb', 'delay', 'pause'].includes(tagName.toLowerCase());

                            if (isGranular) colorClass = 'text-indigo-400';
                            else if (trimmed.includes('Chorus')) colorClass = 'text-pink-400'; 
                            else if (trimmed.includes('Drop') || trimmed.includes('Solo')) colorClass = 'text-yellow-400'; 
                            else if (trimmed.includes('Verse')) colorClass = 'text-purple-400'; 
                            else if (trimmed.includes('Break')) colorClass = 'text-red-400'; 
                            else if (trimmed.includes('Ad-lib')) colorClass = 'text-orange-400'; 
                            else if (trimmed.includes('Beat Switch')) colorClass = 'text-yellow-500 animate-pulse';
                            else if (isVocalEffect) colorClass = 'text-emerald-400';
                            return <InteractiveTag key={i} text={trimmed} colorClass={colorClass} />; 
                          } 
                          const parts = line.split(/(\([^)]+\))/); 
                          return (
                            <div key={i} className="mb-1">
                              {parts.map((part, pi) => { 
                                if (part.startsWith('(') && part.endsWith(')')) { 
                                  return <span key={pi} className="text-orange-500 font-bold italic opacity-80">{part}</span>; 
                                } 
                                return <span key={pi}>{part}</span>; 
                              })}
                            </div>
                          ); 
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl"><h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-3">Refine & Evolve</h3><textarea className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 focus:ring-2 focus:ring-yellow-500 outline-none resize-none font-mono text-xs" placeholder="e.g., 'Make the second verse more aggressive', 'Add a guitar solo after the bridge'..." value={refinementPrompt} onChange={(e) => setRefinementPrompt(e.target.value)} /><button onClick={handleRefine} disabled={refining || !refinementPrompt.trim()} className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all ${ refining ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 disabled:bg-slate-800 disabled:text-slate-500'}`}>{refining ? 'RE-ARCHITECTING...' : 'APPLY CHANGES'}</button></div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <footer className="mt-20 py-10 border-t border-slate-800 text-center text-slate-600 text-sm">
        <p className="font-bold mb-2">AD-LIB ARCHITECT + SUNO MACHINE v3.6</p>
        <p>Advanced Songwriting with Vocal Arrangement & AI Album Art.</p>
      </footer>

      {error && (
        <div className="fixed bottom-6 right-6 p-4 bg-red-900 border border-red-500 text-white rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4"><div className="flex items-center gap-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg><span>{error}</span><button onClick={() => setError(null)} className="ml-4 hover:text-red-200">Dismiss</button></div></div>
      )}
    </div>
  );
};

export default App;
