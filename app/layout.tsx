import type { Metadata } from 'next';
import '../styles/globals.css';
import { ConditionalWeb3Provider } from '@/components/web3/ConditionalWeb3Provider';

export const metadata: Metadata = {
  title: 'Mental Wealth Academy',
  description: 'Mental Wealth Academy is a virtual learning platform for the next generation. It\'s an online school where students can take classes, complete quests, earn rewards, and learn together. We use blockchain and cryptocurrency to make learning more engaging and rewarding.',
  icons: {
    icon: '/icons/favicon.png',
  },
  openGraph: {
    title: 'Mental Wealth Academy',
    description: 'Mental Wealth Academy is a virtual learning platform for the next generation. It\'s an online school where students can take classes, complete quests, earn rewards, and learn together. We use blockchain and cryptocurrency to make learning more engaging and rewarding.',
    images: [
      {
        url: '/icons/embbedBanner.png',
        width: 1200,
        height: 630,
        alt: 'Mental Wealth Academy - Next Gen Micro-University',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mental Wealth Academy',
    description: 'Mental Wealth Academy is a virtual learning platform for the next generation. It\'s an online school where students can take classes, complete quests, earn rewards, and learn together. We use blockchain and cryptocurrency to make learning more engaging and rewarding.',
    images: ['/icons/embbedBanner.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="base:app_id" content="693c68f5e6be54f5ed71d80f" />
      </head>
      <body>
        <ConditionalWeb3Provider>{children}</ConditionalWeb3Provider>
      </body>
    </html>
  );
}

