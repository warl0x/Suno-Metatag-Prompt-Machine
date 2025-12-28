
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
