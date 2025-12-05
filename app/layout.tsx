import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Mental Wealth Academy',
  description: 'A pedagogical educational toolbox for small IRL communities looking to safely digitize their community and assets.',
  icons: {
    icon: '/icons/ethlogo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

