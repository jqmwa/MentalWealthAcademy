'use client';

import React, { useState } from 'react';
import styles from './PromptCatalog.module.css';

interface PromptRow {
  id: string;
  uploader: string;
  dataAdded: string;
  category: string;
  rewardsEarned: number;
  downvotes: number;
  timesCopied: number;
}

const PromptCatalog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Available categories
  const categories = ['All', 'Ai', 'Web3', 'Writing', 'Defi', 'NFT', 'DAO', 'Poetry', 'Art'];

  // Sample data
  const [prompts] = useState<PromptRow[]>([
    {
      id: '1',
      uploader: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      dataAdded: '2024-01-15',
      category: 'AI',
      rewardsEarned: 1250,
      downvotes: 3,
      timesCopied: 342,
    },
    {
      id: '2',
      uploader: '0x8ba1f109551bD432803012645Hac136c22C1729',
      dataAdded: '2024-01-20',
      category: 'Web3',
      rewardsEarned: 890,
      downvotes: 1,
      timesCopied: 201,
    },
    {
      id: '3',
      uploader: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
      dataAdded: '2024-01-22',
      category: 'Writing',
      rewardsEarned: 2100,
      downvotes: 5,
      timesCopied: 567,
    },
    {
      id: '4',
      uploader: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      dataAdded: '2024-01-18',
      category: 'DeFi',
      rewardsEarned: 1560,
      downvotes: 2,
      timesCopied: 423,
    },
    {
      id: '5',
      uploader: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      dataAdded: '2024-01-19',
      category: 'NFT',
      rewardsEarned: 980,
      downvotes: 4,
      timesCopied: 289,
    },
    {
      id: '6',
      uploader: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      dataAdded: '2024-01-16',
      category: 'DAO',
      rewardsEarned: 1875,
      downvotes: 6,
      timesCopied: 512,
    },
    {
      id: '7',
      uploader: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      dataAdded: '2024-01-21',
      category: 'Poetry',
      rewardsEarned: 2340,
      downvotes: 2,
      timesCopied: 678,
    },
    {
      id: '8',
      uploader: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      dataAdded: '2024-01-17',
      category: 'Art',
      rewardsEarned: 1450,
      downvotes: 1,
      timesCopied: 389,
    },
    {
      id: '9',
      uploader: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      dataAdded: '2024-01-23',
      category: 'AI',
      rewardsEarned: 3200,
      downvotes: 8,
      timesCopied: 891,
    },
    {
      id: '10',
      uploader: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      dataAdded: '2024-01-14',
      category: 'DeFi',
      rewardsEarned: 1120,
      downvotes: 3,
      timesCopied: 334,
    },
    {
      id: '11',
      uploader: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
      dataAdded: '2024-01-24',
      category: 'Web3',
      rewardsEarned: 2780,
      downvotes: 4,
      timesCopied: 756,
    },
    {
      id: '12',
      uploader: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      dataAdded: '2024-01-13',
      category: 'Writing',
      rewardsEarned: 1650,
      downvotes: 2,
      timesCopied: 445,
    },
    {
      id: '13',
      uploader: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
      dataAdded: '2024-01-25',
      category: 'NFT',
      rewardsEarned: 1980,
      downvotes: 5,
      timesCopied: 567,
    },
    {
      id: '14',
      uploader: '0x3845badAde8e6dDD04FcF2E8F3a5F96d2B398851',
      dataAdded: '2024-01-12',
      category: 'DAO',
      rewardsEarned: 1340,
      downvotes: 1,
      timesCopied: 298,
    },
    {
      id: '15',
      uploader: '0x2ba592F78dB6436527729929AAf6c908497cB200',
      dataAdded: '2024-01-26',
      category: 'Poetry',
      rewardsEarned: 2890,
      downvotes: 7,
      timesCopied: 823,
    },
  ]);

  // Map category names for filtering
  const categoryMap: { [key: string]: string[] } = {
    'All': ['AI', 'Web3', 'Writing', 'DeFi', 'NFT', 'DAO', 'Poetry', 'Art'],
    'Ai': ['AI'],
    'Web3': ['Web3'],
    'Writing': ['Writing'],
    'Defi': ['DeFi'],
    'NFT': ['NFT'],
    'DAO': ['DAO'],
    'Poetry': ['Poetry'],
    'Art': ['Art'],
  };

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.uploader.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory !== null && selectedCategory !== 'All') {
      const mappedCategories = categoryMap[selectedCategory] || [];
      matchesCategory = mappedCategories.includes(prompt.category);
    }
    
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (category: string) => {
    if (category === 'All') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  return (
    <div className={styles.promptCatalog}>
      <h1 className={styles.title}>Prompt Catalog</h1>
      <div className={styles.container}>
        <div className={styles.searchWrapper}>
          <div className={styles.searchContainer}>
            <div className={styles.inputWrapper}>
              <div className={styles.searchIcon}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="5.5" stroke="#9CA3AF" strokeWidth="1.2"/>
                  <path d="M11 11L14 14" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <div className={styles.inputRight}>
                <span className={styles.inputAddon}>⌘K</span>
              </div>
            </div>
          </div>
          <div className={styles.badgesContainer}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.badge} ${
                  (selectedCategory === null && category === 'All') || selectedCategory === category
                    ? styles.badgeActive
                    : ''
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                <span className={styles.badgeText}>
                  {category === 'All' 
                    ? 'All' 
                    : category === 'NFT' || category === 'DAO'
                    ? category
                    : category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
                  }
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Prompt Uploader</th>
                <th>Data Added</th>
                <th>Category</th>
                <th>Rewards Earned</th>
                <th>Blasted</th>
                <th>Times Copied</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrompts.map((prompt) => (
                <tr key={prompt.id}>
                  <td className={styles.addressCell}>{prompt.uploader}</td>
                  <td className={styles.tableCell}>{prompt.dataAdded}</td>
                  <td className={styles.categoryCell}>{prompt.category}</td>
                  <td className={styles.tableCell}>{prompt.rewardsEarned.toLocaleString()}</td>
                  <td className={styles.tableCell}>{prompt.downvotes}</td>
                  <td className={styles.tableCell}>{prompt.timesCopied.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromptCatalog;

