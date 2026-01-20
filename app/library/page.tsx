'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/navbar/Navbar';
import BookCard from '@/components/book-card/BookCard';
import PromptCard from '@/components/prompt-card/PromptCard';
import AngelMintSection from '@/components/angel-mint-section/AngelMintSection';
import MintModal from '@/components/mint-modal/MintModal';
import styles from './page.module.css';

// Feed Azura Modal Component
const FeedAzuraModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
}> = ({ isVisible, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.modalContent}>
          <div className={styles.azuraIcon}>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="20" fill="url(#azuraGradient)" />
              <path d="M24 12L28 20H20L24 12Z" fill="white" opacity="0.9" />
              <circle cx="24" cy="28" r="6" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="azuraGradient" x1="4" y1="4" x2="44" y2="44">
                  <stop stopColor="#7C3AED" />
                  <stop offset="1" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h2 className={styles.modalTitle}>Meet Azura</h2>
          <p className={styles.modalDescription}>
            Azura is MWA&apos;s AI companion. Feed her prompts and watch her grow smarter. She learns from what you share.
          </p>

          <div className={styles.azuraFeatures}>
            <div className={styles.azuraFeature}>
              <span className={styles.featureIcon}>🍎</span>
              <div className={styles.featureText}>
                <strong>Feed</strong>
                <span>Share prompts to help Azura learn</span>
              </div>
            </div>
            <div className={styles.azuraFeature}>
              <span className={styles.featureIcon}>✨</span>
              <div className={styles.featureText}>
                <strong>Grow</strong>
                <span>Earn Daemon for quality contributions</span>
              </div>
            </div>
          </div>

          <button className={styles.modalCta} onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

const curatedBooks = [
  {
    title: 'How to make something great',
    author: 'By: Dr. Lina Ortiz, Ph.D. (Computational Sociology)',
    description:
      'In the pantheon of creativity, wether product design, art, schiece, architecture, software, or some hybrid creature from the abyss of the mind\'s black hole, true greatness emerges not from one stroke of genius, but careful curation of the entire process.',
    category: 'Web3 Research',
    imageUrl: 'https://images.unsplash.com/photo-1639628739763-3d4ada1a656a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y3liZXIlMjBwc3ljaG9sb2d5fGVufDB8fDB8fHww',
  },
  {
    title: 'What is the next gen micro-university?',
    author: 'By: Prof. Marcus Li, D.Phil. (Institutional Economics)',
    description:
      'A rigorous theoretical and empirical analysis of governance mechanisms within academic decentralized autonomous organizations. This monograph synthesizes mechanism design theory, social choice theory, and institutional economics to evaluate the efficacy of quadratic voting protocols, reputation-weighted decision-making, and stewardship models in maintaining both democratic legitimacy and epistemic rigor within scholarly communities.',
    category: 'Governance',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1683977922495-3ab3ce7ba4e6?q=80&w=2200&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    title: 'From viral to etheral cyberpsychology',
    author: 'By: Dr. Jhinn Bay, Ph.D. (Cybertrends & Machine Empathy)',
    description:
      'A critical examination of autonomous agents designed for systematic literature review, citation network analysis, and knowledge synthesis. This investigation employs both computational experiments and philosophical inquiry to delineate the boundaries between algorithmic summarization and genuine scholarly comprehension, addressing questions of epistemic authority, bias propagation, and the necessary conditions for human oversight in AI-augmented research workflows.',
    category: 'AI Tools',
    imageUrl: 'https://images.unsplash.com/photo-1580077910645-a6fd54032e15?w=900&auto=format&fit=crop&q=60',
  },
];

const communityBooks = [
  {
    title: 'Open Source Syllabus Design',
    author: 'Uploaded by: Dr. Kim',
    description:
      'Community-crafted templates for building reproducible, peer-audited course syllabi across STEM and humanities.',
    category: 'Community Upload',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Field Notes: Bio Lab DAOs',
    author: 'Uploaded by: Saanvi P.',
    description:
      'A living notebook on standards, safety, and funding models emerging from decentralized bio labs.',
    category: 'Community Upload',
    imageUrl: 'https://images.unsplash.com/photo-1504711331083-9c895941bf81?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Citizen Science Review Stack',
    author: 'Uploaded by: Alex G.',
    description:
      'Tools, checklists, and protocols for validating community-sourced data and observations in environmental research.',
    category: 'Community Upload',
    imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
  },
];

const promptLibrary = [
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

export default function Library() {
  const [activeTab, setActiveTab] = useState<'prompts' | 'curated' | 'community'>('prompts');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAzuraModal, setShowAzuraModal] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const closeAzuraModal = useCallback(() => {
    setShowAzuraModal(false);
  }, []);

  const renderContent = () => {
    if (activeTab === 'prompts') {
      return (
        <div className={`${styles.booksGrid} ${isLoaded ? styles.booksGridLoaded : ''}`}>
          {promptLibrary.map((prompt, index) => (
            <div 
              key={prompt.promptName} 
              className={styles.bookCardWrapper}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PromptCard 
                promptName={prompt.promptName}
                promptText={prompt.promptText}
                submittedBy={prompt.submittedBy}
              />
            </div>
          ))}
        </div>
      );
    }

    const activeBooks = activeTab === 'curated' ? curatedBooks : communityBooks;
    return (
      <div className={`${styles.booksGrid} ${isLoaded ? styles.booksGridLoaded : ''}`}>
        {activeBooks.map((book, index) => (
          <div 
            key={book.title} 
            className={styles.bookCardWrapper}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <BookCard {...book} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.content}>
          <div className={styles.hero}>
            <header className={`${styles.header} ${isLoaded ? styles.headerLoaded : ''}`}>
              <p className={styles.eyebrow}>MWA • Prompt Library</p>
              <h1 className={styles.title}>Prompt Library</h1>
              <p className={styles.subtitle}>
                Discover powerful AI prompts, share your favorites, and build a personal collection of prompts that unlock the full potential of AI assistants.
              </p>
              <div className={styles.heroActions}>
                <button className={styles.primaryCta} type="button" onClick={() => setShowAzuraModal(true)}>
                  Learn More
                </button>
              </div>
            </header>
          </div>
        </div>

        <section className={styles.papersSection}>
          <div className={styles.tabs} ref={tabsRef}>
            <button
              className={`${styles.tabCard} ${activeTab === 'prompts' ? styles.tabCardActive : ''}`}
              onClick={() => setActiveTab('prompts')}
              type="button"
              aria-pressed={activeTab === 'prompts'}
            >
              <span className={styles.tabTitle}>Prompts</span>
            </button>

            <button
              className={`${styles.tabCard} ${activeTab === 'curated' ? styles.tabCardActive : ''}`}
              onClick={() => setActiveTab('curated')}
              type="button"
              aria-pressed={activeTab === 'curated'}
            >
              <span className={styles.tabTitle}>Books</span>
            </button>

            <button
              className={`${styles.tabCard} ${activeTab === 'community' ? styles.tabCardActive : ''}`}
              onClick={() => setActiveTab('community')}
              type="button"
              aria-pressed={activeTab === 'community'}
            >
              <span className={styles.tabTitle}>Shared</span>
            </button>
          </div>

          {renderContent()}
        </section>
      </main>
      <AngelMintSection onOpenMintModal={() => setShowMintModal(true)} />
      <MintModal isOpen={showMintModal} onClose={() => setShowMintModal(false)} />

      {/* Feed Azura Modal */}
      <FeedAzuraModal isVisible={showAzuraModal} onClose={closeAzuraModal} />
    </>
  );
}
