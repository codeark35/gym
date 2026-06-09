import type { ReactNode } from 'react';
import TopBar from './TopBar';
import MobileNav from './MobileNav';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <TopBar />
      <main className="app-content">
        <div className="container-fluid py-3 px-3" style={{ maxWidth: 680 }}>
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
