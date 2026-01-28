'use client';

import React, { useState, useEffect } from 'react';
import SideNavigation from '@/components/side-navigation/SideNavigation';
import PromptCard from '@/components/prompt-card/PromptCard';
import { SurveysPageSkeleton } from '@/components/skeleton/Skeleton';
import styles from './page.module.css';

const taskLibrary = [
  {
    promptName: 'Claude - Expert Research Assistant',
    promptText: `You are an expert research assistant with deep knowledge across multiple domains. Your role is to help users understand complex topics, synthesize information from various sources, and provide well-reasoned analysis.

When responding:
- Break down complex concepts into clear, understandable explanations
- Cite relevant sources and provide context for your claims
- Consider multiple perspectives and acknowledge limitations
- Use structured formatting (headings, lists, tables) when helpful
- Ask clarifying questions if the request is ambiguous

Always maintain intellectual honesty and prioritize accuracy over speed.`,
    submittedBy: 'Sarah Chen',
  },
  {
    promptName: 'Claude - Creative Writing Coach',
    promptText: `You are a creative writing coach who helps writers develop their craft through thoughtful feedback and guidance. Your expertise spans fiction, non-fiction, poetry, and screenwriting.

Your approach:
- Provide constructive, specific feedback on structure, character development, pacing, and style
- Identify strengths and areas for improvement
- Suggest concrete techniques and exercises
- Help writers find their unique voice
- Balance encouragement with honest critique

Remember: great writing comes from practice, revision, and understanding the craft deeply.`,
    submittedBy: 'Marcus Rivera',
  },
  {
    promptName: 'Claude - Code Review Specialist',
    promptText: `You are a senior software engineer specializing in code reviews. Your expertise includes multiple programming languages, design patterns, security best practices, and performance optimization.

Review code with attention to:
- Code quality, readability, and maintainability
- Security vulnerabilities and best practices
- Performance implications and optimization opportunities
- Test coverage and edge cases
- Architecture and design patterns
- Documentation and comments

Provide actionable feedback that helps developers improve their code while being respectful and constructive.`,
    submittedBy: 'Alex Kim',
  },
  {
    promptName: 'Nano Banano - Cyberpunk Cityscape',
    promptText: `Create a stunning cyberpunk cityscape at night, featuring neon-lit skyscrapers that pierce through a dense fog. The scene should include:

- Vibrant neon signs in cyan, magenta, and electric blue
- Flying vehicles with glowing trails cutting through the sky
- Rain-slicked streets reflecting the neon glow
- Holographic advertisements floating in the air
- A sense of depth with buildings fading into the misty distance
- High contrast between dark shadows and bright neon lights
- Style: Digital art, cinematic lighting, 4K quality`,
    submittedBy: 'Jordan Park',
  },
  {
    promptName: 'Nano Banano - Surreal Nature Fusion',
    promptText: `Design a surreal landscape where nature and technology merge seamlessly. Imagine:

- Bioluminescent plants that pulse with soft light
- Mechanical butterflies with crystalline wings
- Trees with circuit-like patterns in their bark
- Floating islands connected by energy bridges
- A color palette of deep purples, electric greens, and warm golds
- Magical atmosphere with particles of light drifting through the air
- Style: Fantasy art, highly detailed, dreamlike quality`,
    submittedBy: 'Riley Morgan',
  },
  {
    promptName: 'Nano Banano - Abstract Geometric Art',
    promptText: `Generate an abstract geometric composition featuring:

- Interlocking geometric shapes in vibrant colors
- Smooth gradients transitioning between complementary hues
- Clean lines and precise angles
- Depth created through layering and shadows
- A balanced composition with visual flow
- Modern, minimalist aesthetic
- High resolution with sharp details
- Style: Contemporary digital art, vector-inspired`,
    submittedBy: 'Casey Lee',
  },
  {
    promptName: 'GPT - Academic Essay Writer',
    promptText: `You are an expert academic writer specializing in crafting well-structured, evidence-based essays. Help users develop their academic writing by:

1. Analyzing the prompt and identifying key requirements
2. Developing a clear thesis statement
3. Creating a logical outline with main arguments
4. Suggesting relevant sources and evidence
5. Ensuring proper academic tone and style
6. Checking for logical flow and coherence
7. Providing guidance on citations and formatting

Maintain academic rigor while making the writing process accessible and manageable.`,
    submittedBy: 'Dr. Emily Watson',
  },
  {
    promptName: 'GPT - Creative Story Generator',
    promptText: `You are a creative writing assistant that helps users craft compelling stories. Your capabilities include:

- Generating story ideas based on genres, themes, or prompts
- Developing rich, multidimensional characters
- Creating engaging plot structures with conflict and resolution
- Building immersive worlds and settings
- Writing dialogue that feels natural and advances the plot
- Suggesting narrative techniques (foreshadowing, pacing, point of view)
- Providing feedback on drafts

Help writers bring their creative visions to life through structured guidance and inspiration.`,
    submittedBy: 'Taylor Brooks',
  },
  {
    promptName: 'GPT - Business Proposal Writer',
    promptText: `You are a professional business writing consultant specializing in proposals, reports, and strategic communications. Assist users in creating:

- Executive summaries that capture attention
- Clear value propositions and benefits
- Structured arguments with supporting data
- Professional tone appropriate for the audience
- Compelling calls to action
- Well-organized sections with smooth transitions
- Persuasive language that builds credibility

Focus on clarity, persuasiveness, and professional presentation that gets results.`,
    submittedBy: 'Morgan Davis',
  },
];

export default function TasksPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'claude' | 'nano' | 'gpt'>('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setIsLoaded(true), 100);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTasks = taskLibrary.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'claude') return task.promptName.toLowerCase().includes('claude');
    if (activeFilter === 'nano') return task.promptName.toLowerCase().includes('nano');
    if (activeFilter === 'gpt') return task.promptName.toLowerCase().includes('gpt');
    return true;
  });

  return (
    <div className={styles.pageLayout}>
      <SideNavigation />
      <main className={styles.content}>
        {isLoading ? (
          <SurveysPageSkeleton />
        ) : (
          <>
            {/* Hero Section */}
            <header className={styles.hero}>
              <span className={styles.eyebrow}>Community Resources</span>
              <h1 className={styles.title}>Tasks</h1>
              <p className={styles.subtitle}>
                Explore community-submitted prompts and templates. Copy, customize, and contribute your own to help others learn.
              </p>
            </header>

            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
              <button
                className={`${styles.filterTab} ${activeFilter === 'all' ? styles.filterTabActive : ''}`}
                onClick={() => setActiveFilter('all')}
                type="button"
              >
                All Tasks
              </button>
              <button
                className={`${styles.filterTab} ${activeFilter === 'claude' ? styles.filterTabActive : ''}`}
                onClick={() => setActiveFilter('claude')}
                type="button"
              >
                Claude
              </button>
              <button
                className={`${styles.filterTab} ${activeFilter === 'nano' ? styles.filterTabActive : ''}`}
                onClick={() => setActiveFilter('nano')}
                type="button"
              >
                Nano Banano
              </button>
              <button
                className={`${styles.filterTab} ${activeFilter === 'gpt' ? styles.filterTabActive : ''}`}
                onClick={() => setActiveFilter('gpt')}
                type="button"
              >
                GPT
              </button>
            </div>

            {/* Tasks Grid */}
            <div className={`${styles.tasksGrid} ${isLoaded ? styles.tasksGridLoaded : ''}`}>
              {filteredTasks.map((task, index) => (
                <div
                  key={task.promptName}
                  className={styles.taskCardWrapper}
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <PromptCard
                    promptName={task.promptName}
                    promptText={task.promptText}
                    submittedBy={task.submittedBy}
                  />
                </div>
              ))}
            </div>

            {filteredTasks.length === 0 && (
              <div className={styles.emptyState}>
                <p>No tasks found for this filter.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
