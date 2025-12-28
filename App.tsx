
import React, { useState, useCallback } from 'react';
import { generateSunoPrompt } from './services/geminiService';
import { GeneratedPrompt } from './types';
import { STRUCTURAL_TAGS, GENRE_SAMPLES } from './constants';
import TagBadge from './components/TagBadge';

const App: React.FC = () => {
  const [lyrics, setLyrics] = useState('');
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!lyrics.trim()) {
      setError("Please provide some lyrics first!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await generateSunoPrompt(lyrics, theme);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple toast could go here
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          SUNO METATAG MACHINE
        </h1>
        <p className="text-slate-400 text-lg">
          Transform your raw lyrics into professional Suno AI masterpieces.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Inputs */}
        <section className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
              1. Your Lyrics
            </label>
            <textarea
              className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Paste your lyrics here..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
            />
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <label className="block text-sm font-semibold text-cyan-400 mb-2 uppercase tracking-wider">
              2. Theme or Vibes (Optional)
            </label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g., Gritty 90s underground hip hop, Synthwave with female vocals..."
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
              loading 
                ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white hover:shadow-cyan-500/20'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                MIXING YOUR TRACK...
              </span>
            ) : 'GENERATE SUNO PROMPT'}
          </button>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-xl">
              {error}
            </div>
          )}

          {/* Tag Library Quick Look */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Common Structural Tags</h3>
            <div className="flex flex-wrap">
              {STRUCTURAL_TAGS.slice(0, 15).map(tag => (
                <TagBadge key={tag} label={tag} />
              ))}
              <span className="text-slate-600 text-xs self-center ml-2">+ many more</span>
            </div>
          </div>
        </section>

        {/* Right Column: Output */}
        <section className="space-y-6">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-800">
              <div className="w-16 h-16 mb-4 text-slate-700">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                </svg>
              </div>
              <p className="text-slate-500 italic">Enter your lyrics and let the Mix Maestro analyze your song structure.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-24 bg-slate-800 rounded-xl"></div>
              <div className="h-96 bg-slate-800 rounded-xl"></div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Style of Music */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-slate-800/50 px-6 py-3 flex justify-between items-center border-b border-slate-800">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Style of Music (Copy to Suno)</h3>
                  <div className="flex items-center gap-4">
                     <span className={`text-[10px] ${result.styleOfMusic.length > 120 ? 'text-red-400' : 'text-slate-500'}`}>
                      {result.styleOfMusic.length}/120 chars
                    </span>
                    <button 
                      onClick={() => copyToClipboard(result.styleOfMusic)}
                      className="text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                      Copy
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <p className="font-mono text-cyan-200 text-lg leading-relaxed">{result.styleOfMusic}</p>
                </div>
              </div>

              {/* Structured Lyrics */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-slate-800/50 px-6 py-3 flex justify-between items-center border-b border-slate-800">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Structured Lyrics (Copy to Suno)</h3>
                  <button 
                    onClick={() => copyToClipboard(result.structuredLyrics)}
                    className="text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                    Copy All
                  </button>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                  <pre className="font-mono text-slate-300 whitespace-pre-wrap text-sm leading-relaxed whitespace-pre-line">
                    {result.structuredLyrics.split('\n').map((line, i) => {
                      const isTag = line.trim().startsWith('[') && line.trim().endsWith(']');
                      return (
                        <span key={i} className={isTag ? 'text-cyan-400 font-bold block my-2' : ''}>
                          {line}
                          {'\n'}
                        </span>
                      );
                    })}
                  </pre>
                </div>
              </div>

              {/* Exclude Style */}
              {result.excludeStyle && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Exclude Style</p>
                  <p className="text-slate-400 text-sm italic">{result.excludeStyle}</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <footer className="mt-20 py-8 border-t border-slate-800 text-center text-slate-600 text-sm">
        <p>Built for the Suno AI community. Optimized for high-fidelity generation.</p>
        <p className="mt-2">Use the generated tags to influence genre, mood, and structure.</p>
      </footer>
    </div>
  );
};

export default App;
