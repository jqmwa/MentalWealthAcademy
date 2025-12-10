import type { Metadata } from 'next';
import '../styles/globals.css';

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
      </head>
      <body>{children}</body>
    </html>
  );
}

