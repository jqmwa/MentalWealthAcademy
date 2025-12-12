export type DemoCategory = {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type DemoThread = {
  id: string;
  categorySlug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  author: { username: string; avatarUrl: string | null };
  posts: Array<{
    id: string;
    body: string;
    attachmentUrl: string | null;
    attachmentMime: string | null;
    createdAt: string;
    author: { username: string; avatarUrl: string | null };
  }>;
};

// Lightweight demo content so the forum UI isn't empty without DB config.
// As soon as MySQL is configured, the real DB-backed data will be used.
const NOW = new Date();
function isoMinutesAgo(mins: number) {
  return new Date(NOW.getTime() - mins * 60_000).toISOString();
}

export const demoCategories: DemoCategory[] = [
  {
    slug: 'general-discussion',
    name: 'General Discussion',
    description: 'Join the community conversation and share updates.',
    sortOrder: 10,
  },
  {
    slug: 'design',
    name: 'Design',
    description: 'UI/UX, visual design, product feedback, and inspiration.',
    sortOrder: 20,
  },
  {
    slug: 'education',
    name: 'Education',
    description: 'Learning resources, study groups, and questions.',
    sortOrder: 30,
  },
  {
    slug: 'art',
    name: 'Art',
    description: 'Creative work, sharing, critique, and collaboration.',
    sortOrder: 40,
  },
  {
    slug: 'quest-discussions',
    name: 'Quest Discussions',
    description: 'Talk about quests, progress, and strategies.',
    sortOrder: 50,
  },
  {
    slug: 'token-talk',
    name: 'Token Talk',
    description: 'Token/NFT discussions, best practices, and trends.',
    sortOrder: 60,
  },
];

export const demoThreads: DemoThread[] = [
  {
    id: 'demo-general-welcome',
    categorySlug: 'general-discussion',
    title: 'Welcome to the Community Forum',
    createdAt: isoMinutesAgo(240),
    updatedAt: isoMinutesAgo(30),
    author: { username: 'Admin', avatarUrl: null },
    posts: [
      {
        id: 'demo-post-1',
        body: 'Introduce yourself, share what you’re building, and say hello.',
        attachmentUrl: null,
        attachmentMime: null,
        createdAt: isoMinutesAgo(240),
        author: { username: 'Admin', avatarUrl: null },
      },
      {
        id: 'demo-post-2',
        body: 'Excited to be here — looking forward to learning with everyone!',
        attachmentUrl: null,
        attachmentMime: null,
        createdAt: isoMinutesAgo(45),
        author: { username: 'Guest', avatarUrl: null },
      },
    ],
  },
  {
    id: 'demo-design-feedback',
    categorySlug: 'design',
    title: 'Share design feedback and UI ideas',
    createdAt: isoMinutesAgo(180),
    updatedAt: isoMinutesAgo(90),
    author: { username: 'Pixel', avatarUrl: null },
    posts: [
      {
        id: 'demo-post-3',
        body: 'Drop screenshots or gifs and ask for critique — keep it constructive.',
        attachmentUrl: null,
        attachmentMime: null,
        createdAt: isoMinutesAgo(180),
        author: { username: 'Pixel', avatarUrl: null },
      },
    ],
  },
  {
    id: 'demo-education-resources',
    categorySlug: 'education',
    title: 'Best learning resources you recommend',
    createdAt: isoMinutesAgo(300),
    updatedAt: isoMinutesAgo(120),
    author: { username: 'Sage', avatarUrl: null },
    posts: [
      {
        id: 'demo-post-4',
        body: 'Share books, courses, or guides that genuinely helped you level up.',
        attachmentUrl: null,
        attachmentMime: null,
        createdAt: isoMinutesAgo(300),
        author: { username: 'Sage', avatarUrl: null },
      },
    ],
  },
  {
    id: 'demo-art-gallery',
    categorySlug: 'art',
    title: 'Art gallery thread (post your work)',
    createdAt: isoMinutesAgo(90),
    updatedAt: isoMinutesAgo(15),
    author: { username: 'Muse', avatarUrl: null },
    posts: [
      {
        id: 'demo-post-5',
        body: 'Share what you made this week — sketches, renders, anything.',
        attachmentUrl: null,
        attachmentMime: null,
        createdAt: isoMinutesAgo(90),
        author: { username: 'Muse', avatarUrl: null },
      },
    ],
  },
  {
    id: 'demo-quests',
    categorySlug: 'quest-discussions',
    title: 'Quest strategies and progress check-ins',
    createdAt: isoMinutesAgo(210),
    updatedAt: isoMinutesAgo(65),
    author: { username: 'Runner', avatarUrl: null },
    posts: [
      {
        id: 'demo-post-6',
        body: 'What quest are you working on and what’s your next step?',
        attachmentUrl: null,
        attachmentMime: null,
        createdAt: isoMinutesAgo(210),
        author: { username: 'Runner', avatarUrl: null },
      },
    ],
  },
  {
    id: 'demo-token-talk',
    categorySlug: 'token-talk',
    title: 'Token Talk: best practices and safety',
    createdAt: isoMinutesAgo(360),
    updatedAt: isoMinutesAgo(200),
    author: { username: 'Analyst', avatarUrl: null },
    posts: [
      {
        id: 'demo-post-7',
        body: 'Share lessons learned and patterns you look for (not financial advice).',
        attachmentUrl: null,
        attachmentMime: null,
        createdAt: isoMinutesAgo(360),
        author: { username: 'Analyst', avatarUrl: null },
      },
    ],
  },
];

export function demoThreadsForCategory(slug: string) {
  return demoThreads.filter((t) => t.categorySlug === slug);
}

export function demoThreadById(threadId: string) {
  return demoThreads.find((t) => t.id === threadId) || null;
}

export function demoCategoryStats() {
  const threadsByCat = new Map<string, number>();
  const postsByCat = new Map<string, number>();

  for (const t of demoThreads) {
    threadsByCat.set(t.categorySlug, (threadsByCat.get(t.categorySlug) || 0) + 1);
    postsByCat.set(t.categorySlug, (postsByCat.get(t.categorySlug) || 0) + t.posts.length);
  }

  return { threadsByCat, postsByCat };
}
