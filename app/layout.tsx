'use client';

import { HeroUIProvider } from '@heroui/react';
import { ReactNode } from 'react';
import './globals.css';

interface ProvidersProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </body>
    </html>
  );
}