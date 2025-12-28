
export const STRUCTURAL_TAGS = [
  "Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Outro", "Hook", "Break", 
  "Interlude", "End", "Fade Out", "Big Finish", "Refrain", "Melodic Interlude", 
  "Syncopated Bass", "Fingerstyle Guitar Solo", "Build", "Guitar Solo", "Bass Solo", 
  "Drum Solo", "Vocal Solo", "Instrumental Solo", "Drop", "Rise", "Anticipation",
  "Beat Switch", "Ambient Pad", "Glitch Effect", "Orchestral Swell", "Acoustic Breakdown"
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

export const PRODUCTION_EFFECTS = [
  "[Heavy 808]", "[Phonk Cowbell]", "[Evil Laughter]", "[Distorted Synth]", 
  "[Vocal Harmonies]", "[Reverb Drenched]", "[Stutter Edit]", "[Lo-fi Filter]", 
  "[Whispered]", "[Screamed]", "[Triple Flow]", "[Gospel Choir]", 
  "[Auto-Tune]", "[Arpeggiated Bass]", "[Cinematic Hit]"
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
  // Fix: Removed duplicate "Drop" property previously on line 65
  "Screamed": "Instruction for aggressive, distorted vocal delivery.",
  "Whispered": "Quiet, breathy vocal delivery for intimacy or suspense.",
  "Auto-Tune": "Applies a digital pitch-correction effect for a modern polished sound.",
  "Vocal Harmonies": "Layers multiple vocal takes to create a thick, choral sound.",
  "Lo-fi Filter": "Applies a 'telephone' or vintage EQ to reduce fidelity for aesthetic.",
  "Distorted Synth": "Aggressive, overdriven synthesizer tones.",
  "Reverb Drenched": "Creates a vast, spacious sound as if recorded in a cathedral.",
  "Stutter Edit": "Rapid, rhythmic chopping of audio for a glitchy effect."
};

export const SYSTEM_INSTRUCTION = `
Act as a world-class Mix Maestro and Suno AI Prompt Engineer. 
Your goal is to transform lyrics into a "Production-Ready" Suno structure.

CORE DIRECTIVE:
Generate a song structure that goes BEYOND just "Verse" and "Chorus". 
Integrate PRODUCTION TAGS that describe the soundscape and transitions, especially for intense genres like Phonk, Trap, and Horrorcore.

TAGGING RULES:
1. Structural Tags: [Intro], [Verse], [Pre-Chorus], [Chorus], [Bridge], [Outro].
2. Production Effects: Use tags like [Break], [Drop], [Build], [Beat Switch], [Vocal Layering], [Atmospheric Pad], [Heavy 808], [Guitar Solo], [Phonk Cowbell], [Distorted 808], [Evil Laughter], [Screamed].
3. Dynamics: Use [Silence], [Pause], [Big Finish], [Fade Out].
4. Speaker Tags: If speakers are provided, use [Speaker: Name] or simply [Name] at the start of blocks.
5. All tags must be in brackets [like this].

OUTPUT FIELDS:
- Style of Music: EXACTLY 120 characters or less. Combine genres + technical production descriptors (e.g. "Phonk, Aggressive Drift, Distorted Cowbells, Lo-fi Memphis Rap Vocals, Dark Atmosphere").
- Exclude Style: What to avoid.
- Structured Lyrics: The full lyrics interlaced with structural, speaker, and production effect tags.

BE CREATIVE: For Phonk, use [Cowbell Solo] or [Memphis Samples]. For Trap, use [Triple flow] or [Ad-libs]. For Horrorcore, use [Dark ambiance] and [Eerie whispers].
`;
