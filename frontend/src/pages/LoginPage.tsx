import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { loginUser } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';
import { AppDispatch, RootState } from '../store';

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Welcome back!' }));
      navigate('/dashboard');
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err || 'Invalid credentials' }));
    }
  };

  const fillDemoUser = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Sign in to TaskPulse</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Enter your account credentials to access your workspaces.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium">
          {error}
        </div>
      )}

      {/* Quick Demo Credentials Panel for Testers */}
      <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Quick Demo One-Click Login:
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => fillDemoUser('admin@example.com')}
            className="p-1.5 rounded bg-card hover:bg-muted text-left border text-foreground font-medium truncate"
          >
            👑 Super Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemoUser('manager@example.com')}
            className="p-1.5 rounded bg-card hover:bg-muted text-left border text-foreground font-medium truncate"
          >
            💼 Project Manager
          </button>
          <button
            type="button"
            onClick={() => fillDemoUser('editor@example.com')}
            className="p-1.5 rounded bg-card hover:bg-muted text-left border text-foreground font-medium truncate"
          >
            💻 Lead Developer
          </button>
          <button
            type="button"
            onClick={() => fillDemoUser('member@example.com')}
            className="p-1.5 rounded bg-card hover:bg-muted text-left border text-foreground font-medium truncate"
          >
            🎨 UI/UX Member
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          leftIcon={<Mail className="w-4 h-4" />}
          placeholder="name@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
};
