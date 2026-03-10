import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/FormInput';
import { cn } from '../../utils/cn';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/department/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = await login(email, password);
      toast.success(`Welcome back, ${userData.name}!`);
      
      const destination = userData.role === 'admin' ? '/admin/dashboard' : '/department/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl border border-border relative z-10 flex flex-col">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <ShieldCheck size={40} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Welcome Back</h1>
          <p className="text-sm text-text-muted mt-1 text-center">
            Sign in to Police Commissionerate<br/>Inventory Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FormInput
            id="email"
            type="email"
            label="Email Address"
            placeholder="admin@police.gov.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <FormInput
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-medium text-sm transition-all",
              "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5"
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
