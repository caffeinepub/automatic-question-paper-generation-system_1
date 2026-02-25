import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Eye, EyeOff, GraduationCap, Lock, Mail, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitBackend } from '../hooks/useQueries';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initBackend = useInitBackend();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      // Simulate auth delay
      await new Promise((r) => setTimeout(r, 800));
      // Extract teacher name from email
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      localStorage.setItem('qpg_session', 'true');
      localStorage.setItem('qpg_teacher_name', name);
      // Initialize backend subjects if first time
      try {
        await initBackend.mutateAsync();
      } catch {
        // Already initialized, ignore
      }
      toast.success('Login successful! Welcome back.');
      router.navigate({ to: '/dashboard' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast.info('Password reset link sent to your registered email address.');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/generated/login-bg.dim_1920x1080.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" />

      {/* Decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Band */}
          <div className="bg-primary px-8 pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/generated/college-logo.dim_200x200.png"
                  alt="College Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                      '<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>';
                  }}
                />
              </div>
            </div>
            <h1 className="text-white font-bold text-xl leading-tight mb-1">
              Automatic Question Paper
            </h1>
            <h2 className="text-white font-bold text-xl leading-tight mb-2">
              Generation System
            </h2>
            <p className="text-white/70 text-sm">Engineering College Portal</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen size={18} className="text-primary" />
              <h3 className="text-foreground font-semibold text-base">Teacher Login</h3>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email / Username
                </Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="teacher@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 rounded-lg border-border focus:border-accent"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 rounded-lg border-border focus:border-accent"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-button transition-all hover:shadow-card-hover"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <GraduationCap size={18} />
                    Login to System
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Use any email and password to access the system
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-xs mt-4">
          © {new Date().getFullYear()} QPG System &nbsp;·&nbsp; Built with{' '}
          <span className="text-red-400">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'qpg-system')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
