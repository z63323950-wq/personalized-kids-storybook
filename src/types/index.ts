export type ThemeId = 'forest' | 'space' | 'ocean';
export interface Profile {
  name: string;
  age: number;
  interests: string;
  theme: ThemeId;
}
export type Choice = 0 | 1;
export interface Story {
  id: string;
  createdAt: string;
  profile: Profile;
  seed: number;
  choices: Partial<Record<1 | 3, Choice>>;
  page: number;
}
export interface Scene {
  title: string;
  paragraphs: string[];
  question?: string;
  options?: [string, string];
}
export interface Theme {
  id: ThemeId;
  name: string;
  english: string;
  tagline: string;
  description: string;
  badge: string;
  friend: string;
  place: string;
  mission: string;
  routes: [string, string];
  routeResults: [string, string];
  solutions: [string, string];
  endings: [string, string];
}
