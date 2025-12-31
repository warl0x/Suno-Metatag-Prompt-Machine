
export const STRUCTURAL_TAGS = [
  "Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Outro", "Hook", "Break", 
  "Interlude", "End", "Fade Out", "Big Finish", "Refrain", "Melodic Interlude", 
  "Syncopated Bass", "Fingerstyle Guitar Solo", "Build", "Guitar Solo", "Bass Solo", 
  "Drum Solo", "Vocal Solo", "Instrumental Solo", "Drop", "Rise", "Anticipation",
  "Beat Switch", "Ambient Pad", "Glitch Effect", "Orchestral Swell", "Acoustic Breakdown",
  "Ad-lib Layer", "Background Vocals", "Vocal Run", "Crowd Noise", "Chanted"
];

export const VOCAL_STYLE_EFFECTS = [
  "Whispered", "Screamed", "Gritty", "Ethereal", "Robotic", "Auto-Tune",
  "Vibrato", "Falsetto", "Childlike", "Deep Voice", "Layered Vocals", "Gospel Choir",
  "Aggressive", "Soft Spoken", "Rapping", "Melodic Singing", "Reverb Drenched", "Dry"
];

export const CATEGORIZED_VOCAL_EFFECTS = [
  {
    category: "Dynamics",
    icon: "M3 15v4m0 0h4m-4 0l4-4m11 4h4m0 0v-4m0 4l-4-4M3 9v-4m0 0h4m-4 0l4 4m11-4h4m0 0v4m0-4l-4 4",
    color: "red",
    effects: ["Whispered", "Screamed", "Soft Spoken", "Aggressive"]
  },
  {
    category: "Timbre & Texture",
    icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3",
    color: "purple",
    effects: ["Gritty", "Ethereal", "Childlike", "Deep Voice", "Robotic"]
  },
  {
    category: "Pitch & Melody",
    icon: "M9 17v-2m3 2v-4m3 4v-6m3 6V7",
    color: "blue",
    effects: ["Auto-Tune", "Vibrato", "Falsetto", "Rapping", "Melodic Singing"]
  },
  {
    category: "Layering & Harmonies",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.002 3.002 0 012.288-2.542M11.857 16.143a3.001 3.001 0 012.288 2.542",
    color: "pink",
    effects: ["Layered Vocals", "Gospel Choir", "Background Vocals"]
  },
  {
    category: "Studio Processing",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    color: "cyan",
    effects: ["Reverb Drenched", "Dry"]
  }
];

export const PREBUILT_VOICES = [
  { id: 'Kore', name: 'Kore (Bright/Feminine)', gender: 'Female' },
  { id: 'Zephyr', name: 'Zephyr (Friendly/Neutral)', gender: 'Neutral' },
  { id: 'Puck', name: 'Puck (Playful/Young)', gender: 'Neutral' },
  { id: 'Charon', name: 'Charon (Deep/Masculine)', gender: 'Male' },
  { id: 'Fenrir', name: 'Fenrir (Powerful/Bass)', gender: 'Male' },
  { id: 'Aoede', name: 'Aoede (Classic/Soulful)', gender: 'Female' },
  { id: 'Muses', name: 'Muses (Chorus/Group)', gender: 'Group' },
];

export const GENRE_PRESETS = [
  "Modern Trap / 808 Heavy",
  "Aggressive Phonk / Drift Phonk",
  "Horrorcore / Dark Trap",
  "90s Boom Bap Hip Hop",
  "Dark Cinematic Industrial",
  "Future Bass / Melodic Dubstep",
  "Synthwave / Retrowave",
  "Acoustic Folk / Fingerstyle",
  "Cyberpunk Techno",
  "Dreamy Lo-fi / Chillhop",
  "Epic Orchestral Trailer Music",
  "K-Pop / Bubblegum Dance",
  "Hard Rock / Grunge",
  "Modern Soul / Neo-Soul",
  "Reggaeton / Latin Trap",
  "Custom..."
];

export const AD_LIB_SAMPLES = [
  "skrrt skrrt", "yeah yeah", "what!", "aye", "brrrr", "straight up", "it's lit", 
  "okay!", "let's go", "woo!", "uh-huh", "pow pow", "grrrrt", "facts", "no cap"
];

export const PRODUCTION_EFFECTS = [
  "[Heavy 808]", "[Phonk Cowbell]", "[Evil Laughter]", "[Distorted Synth]", 
  "[Vocal Harmonies]", "[Reverb Drenched]", "[Stutter Edit]", "[Lo-fi Filter]", 
  "[Whispered]", "[Screamed]", "[Triple Flow]", "[Gospel Choir]", 
  "[Auto-Tune]", "[Arpeggiated Bass]", "[Cinematic Hit]", "[Ad-libs: On]"
];

export const TAG_DESCRIPTIONS: Record<string, string> = {
  "Intro": "Sets the initial mood and instrumentation. Usually 4-8 bars of music.",
  "Verse": "Narrative storytelling section. Usually lower energy than the chorus.",
  "Pre-Chorus": "Builds tension and energy to transition smoothly into the hook.",
  "Chorus": "The main melodic hook. Highest energy and most memorable part of the song.",
  "Bridge": "A contrasting section that provides a break from the verse/chorus cycle.",
  "Outro": "Closing section. Often used for fading out or a final melodic resolution.",
  "Break": "A brief instrumental pause or sudden reduction in complexity.",
  "Drop": "High-impact transition typical in EDM/Trap where the full beat enters.",
  "Build": "Gradual increase in intensity, volume, or rhythmic density.",
  "Heavy 808": "Sub-bass driven kick drums with high saturation for a modern trap feel.",
  "Phonk Cowbell": "The signature chromatic percussion sound of Drift Phonk.",
  "Evil Laughter": "Dark, atmospheric vocal sample often used in Horrorcore.",
  "Triple Flow": "Fast-paced, triplet-based vocal delivery style common in Trap.",
  "Beat Switch": "A total change in rhythm or genre mid-song for dramatic effect.",
  "Vocal Solo": "Focuses the track purely on the singer, often reducing instrumentation.",
  "Guitar Solo": "A featured instrumental section highlighting melodic lead guitar.",
  "Fade Out": "Gradual decrease in volume to end the song smoothly.",
  "Big Finish": "A loud, climactic end to the song with sustained instruments.",
  "Screamed": "Instruction for aggressive, distorted vocal delivery.",
  "Whispered": "Quiet, breathy vocal delivery for intimacy or suspense.",
  "Auto-Tune": "Applies a digital pitch-correction effect for a modern polished sound.",
  "Vocal Harmonies": "Layers multiple vocal takes to create a thick, choral sound.",
  "Lo-fi Filter": "Applies a 'telephone' or vintage EQ to reduce fidelity for aesthetic.",
  "Distorted Synth": "Aggressive, overdriven synthesizer tones.",
  "Reverb Drenched": "Creates a vast, spacious sound as if recorded in a cathedral.",
  "Stutter Edit": "Rapid, rhythmic chopping of audio for a glitchy effect.",
  "Ad-lib Layer": "Adds rhythmic vocal accents, interjections, or sound effects (skrrt, yeah) to fill space.",
  "Background Vocals": "Harmonic or repetitive vocal lines that support the lead singer.",
  "Vocal Run": "A rapid series of notes sung on a single syllable, showing vocal agility.",
  "Gritty": "Adds a raspy, distorted texture to the voice, common in rock or horrorcore.",
  "Ethereal": "Adds a dreamy, spacious quality with heavy reverb and delay.",
  "Speaker": "Assigns the following lyrics to a specific, named character/singer.",
  "Reverb": "Applies a localized reverb effect with a specific intensity (0-100%).",
  "Delay": "Applies a localized echo/delay effect with a specific timing in milliseconds.",
  "Pause": "Instructs the vocalist to pause for a specific duration (e.g., 0.5s)."
};

export const SYSTEM_INSTRUCTION = `
Act as a world-class Mix Maestro and AD-LIB ARCHITECT. 
Your goal is to transform lyrics into a "Production-Ready" Suno structure with a focus on rhythmic ad-lib placement and vocal textures.

AD-LIB ARCHITECTURE RULES:
1. Ad-libs: Place interjections in parentheses, e.g., "I'm on the top (straight up) / Never going down (no cap)".
2. Ad-lib Density:
   - Low: Only at the ends of major sections.
   - Medium: At the end of every 2nd line.
   - High: Interspersed throughout the lines and between lines.
   - Extreme: Migos-style chaos, ad-libs every few words.
3. Tagging: Use [Ad-lib Layer] to introduce sections with heavy background interjections.
4. Call and Response: Use [Background Vocals] or [Crowd] for repetitive response lines.

BEAT SWITCH RULES:
1. If the lyrics contain [Beat Switch], you MUST treat it as a hard transition.
2. The Style of Music should reflect both parts, separated by " / " or " then ".
3. Use tags like [Tempo Change], [Key Shift], or [Genre Switch] near the [Beat Switch] tag to guide Suno.

CORE DIRECTIVE:
Generate a song structure that integrates PRODUCTION TAGS and AD-LIBS that describe the soundscape and transitions.

TAGGING RULES:
1. Structural Tags: [Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro], [Beat Switch].
2. Production Effects: Use tags like [Break], [Drop], [Build], [Beat Switch], [Vocal Layering], [Atmospheric Pad], [Heavy 808], [Guitar Solo], [Phonk Cowbell], [Distorted 808], [Evil Laughter], [Screamed].
3. Dynamics: Use [Silence], [Pause], [Big Finish], [Fade Out].
4. Speaker Tags: If speakers are provided, use [Speaker: Name] at the start of blocks.
5. All tags must be in brackets [like this].

OUTPUT FIELDS:
- Style of Music: EXACTLY 120 characters or less. Combine genres + ad-lib descriptors (e.g. "Trap, Heavy Ad-libs, Aggressive, 808s").
- Exclude Style: What to avoid.
- Structured Lyrics: The full lyrics interlaced with structural, speaker, production effect tags, AND PARENTHETICAL AD-LIBS.
`;

export const VOCAL_STYLER_INSTRUCTION = `
Act as a Vocal Style Engineer. Your goal is to apply specific vocal effects, speaker assignments, and granular processing parameters to raw lyrics.

RULES:
1. Apply Speaker Tags: If speakers are provided, add [Speaker: Name] at the beginning of their lines or sections.
2. Apply Effect Tags: For each line or group of lines, prepend the requested vocal effect tags, like [Whispered], [Gritty], [Auto-Tune].
3. Parameter Integration: If granular Reverb or Delay settings are provided, use tags like [Reverb: X%] or [Delay: Xms] where appropriate to describe the intensity.
4. DO NOT Add Structural Tags: You MUST NOT add tags like [Verse], [Chorus], [Intro], etc.
5. DO NOT Add Ad-libs: Do not add parenthetical ad-libs unless they are already in the original lyrics.
6. Preserve Lyrics: The user's original lyrics must remain unchanged.
7. Combine Tags: It's okay to combine multiple tags for a single line, e.g., "[Speaker: Devil] [Gritty] [Reverb: 80%] I am the shadow."

OUTPUT:
- Return only the styled lyrics as a single string.
`;
