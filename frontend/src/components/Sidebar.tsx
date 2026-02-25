import { Link, useRouter } from '@tanstack/react-router';
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  FileText,
  Files,
  LogOut,
  GraduationCap,
  Menu,
  X,
  BookMarked,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Add Questions', path: '/add-question', icon: <PlusCircle size={18} /> },
  { label: 'Question Bank', path: '/question-bank', icon: <BookOpen size={18} /> },
  { label: 'Manage Subjects', path: '/manage-subjects', icon: <BookMarked size={18} /> },
  { label: 'Generate Paper', path: '/generate-paper', icon: <FileText size={18} /> },
  { label: 'Generated Papers', path: '/generated-papers', icon: <Files size={18} /> },
];

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('qpg_session');
    localStorage.removeItem('qpg_teacher_name');
    router.navigate({ to: '/' });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <GraduationCap size={22} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight">QPG System</p>
          <p className="text-white/60 text-xs truncate">Question Paper Generator</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="nav-link nav-link-inactive w-full text-left text-red-300 hover:text-red-200 hover:bg-red-900/30"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar min-h-screen flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Hamburger */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 bg-primary text-primary-foreground hover:bg-primary/90 shadow-button rounded-lg"
        >
          <Menu size={20} />
        </Button>

        {/* Mobile Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-sidebar z-50 transform transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <X size={20} />
          </button>
          <SidebarContent />
        </aside>
      </div>
    </>
  );
}
