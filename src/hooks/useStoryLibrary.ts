import { useState } from 'react';
import { defaultProfile } from '../engine/storyEngine';
import { loadState, saveState } from '../utils/storage';
import type { Profile, Story } from '../types';
export function useStoryLibrary() {
  const [initial] = useState(loadState);
  const [profile, setProfile] = useState<Profile>(initial.state?.profile ?? defaultProfile);
  const [stories, setStories] = useState<Story[]>(initial.state?.stories ?? []);
  const [activeId, setActiveId] = useState<string | null>(initial.state?.activeId ?? null);
  const [warning, setWarning] = useState(initial.warning);
  function persist(p: Profile, list: Story[], id: string | null) {
    if (!saveState({ profile: p, stories: list, activeId: id }))
      setWarning('当前浏览器无法保存数据。本次仍可阅读，关闭后进度可能丢失。');
  }
  function updateProfile(p: Profile) {
    setProfile(p);
    persist(p, stories, activeId);
  }
  function saveStory(story: Story) {
    const list = [story, ...stories.filter((s) => s.id !== story.id)].slice(0, 12);
    setStories(list);
    setActiveId(story.id);
    setProfile(story.profile);
    persist(story.profile, list, story.id);
  }
  function goHome() {
    setActiveId(null);
    persist(profile, stories, null);
  }
  return {
    profile,
    stories,
    active: stories.find((s) => s.id === activeId) ?? null,
    warning,
    updateProfile,
    saveStory,
    goHome,
  };
}
