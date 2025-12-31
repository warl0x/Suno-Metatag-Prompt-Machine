
export interface GeneratedPrompt {
  styleOfMusic: string;
  excludeStyle: string;
  structuredLyrics: string;
}

export interface Speaker {
  id: string;
  name: string;
  voice: string;
}

export interface TagCategory {
  title: string;
  tags: string[];
}

export type ImageSize = "1K" | "2K" | "4K";
