import Hero from '@/components/hero/Hero';
import Banner from '@/components/banner/Banner';
import SideNavigation from '@/components/side-navigation/SideNavigation';
import BannerCard from '@/components/banner-card/BannerCard';
import PromptLibraryCard from '@/components/prompt-library-card/PromptLibraryCard';
import PromptCatalog from '@/components/prompt-catalog/PromptCatalog';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Hero />
      <Banner />
      <div className={styles.content}>
        <SideNavigation />
        <div className={styles.middleSection}>
          <BannerCard />
          <div className={styles.cardsRow}>
            <div className={styles.promptSection}>
              <PromptLibraryCard />
            </div>
            <div className={styles.membershipSection}>
              <div className={styles.membershipImage}>
                <Image 
                  src="https://i.imgur.com/875phfv.png" 
                  alt="Membership" 
                  fill
                  className={styles.membershipImg}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
          <PromptCatalog />
        </div>
      </div>
    </main>
  );
}

