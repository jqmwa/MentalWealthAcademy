export type IdeaCategory = 'mental-health' | 'productivity' | 'wealth';
export type IdeaDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type SwipeDirection = 'left' | 'right' | 'up' | null;

export interface IdeaCard {
  id: string;
  category: IdeaCategory;
  title: string;
  microContent: string;
  expertCommentary?: string;
  difficulty: IdeaDifficulty;
  relatedQuestId: string | null;
}

export interface CategoryInfo {
  name: string;
  color: string;
  icon: string;
}

export interface IdeaCardsData {
  version: string;
  categories: Record<IdeaCategory, CategoryInfo>;
  cards: IdeaCard[];
}

export interface SwipeAction {
  cardId: string;
  direction: SwipeDirection;
  timestamp: number;
}

export interface UserProgress {
  learnedIds: string[];
  savedIds: string[];
  skippedIds: string[];
  streak: number;
  lastActiveDate: string | null;
}
