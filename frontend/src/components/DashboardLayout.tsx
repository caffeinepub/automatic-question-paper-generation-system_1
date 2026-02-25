import { useLocation } from '@tanstack/react-router';
import Sidebar from './Sidebar';
import { Bell, User } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const location = useLocation();
  const teacherName = localStorage.getItem('qpg_teacher_name') || 'Teacher';

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath={location.pathname} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="lg:block hidden">
            {title && (
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            )}
          </div>
          <div className="lg:hidden w-8" /> {/* Spacer for mobile hamburger */}

          <div className="flex items-center gap-4 ml-auto">
            <button className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <User size={16} className="text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  Welcome, {teacherName}
                </p>
                <p className="text-xs text-muted-foreground">Teacher</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto animate-fade-in">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card px-6 py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Automatic Question Paper Generation System &nbsp;·&nbsp;{' '}
          Built with <span className="text-red-500">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'qpg-system')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
