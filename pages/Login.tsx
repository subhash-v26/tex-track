import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (error) setError(''); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid login credentials');
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-10">
          <div className="text-center mb-10">
            <h1 className="text-[44px] font-black text-[#5850EC] tracking-tight mb-2">TexFlow</h1>
            <p className="text-slate-400 font-medium text-lg">Welcome back to your factory</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => handleInputChange(setEmail, e.target.value)}
              placeholder="name@factory.com"
              required
              autoFocus
              className="rounded-xl border-slate-200 h-12"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => handleInputChange(setPassword, e.target.value)}
              placeholder="••••••••"
              required
              className="rounded-xl border-slate-200 h-12"
            />
            
            {error && (
              <div className="p-5 rounded-2xl bg-[#FFF5F5] border border-[#FEE2E2] text-[#EF4444] text-sm flex items-center gap-4 font-semibold animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle size={26} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl text-base font-bold bg-[#4F46E5] text-white shadow-[0_10px_25px_rgba(79,70,229,0.35)] hover:bg-[#4338CA] transition-all border-none" 
                isLoading={loading}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-400 font-medium">
              New to TexFlow?{' '}
              <Link to="/signup" className="text-[#4F46E5] font-bold hover:underline transition-colors">
                Create an account
              </Link>
            </p>
          </div>
          
          <div className="mt-8 p-6 bg-slate-50 rounded-2xl text-[10px] text-slate-400 font-medium leading-relaxed">
            <p className="uppercase tracking-[0.1em] mb-3 text-slate-400 font-bold">Demo Credentials</p>
            <p className="mb-1">
              Email: <span className="text-slate-500">admin@texflow.com</span>
            </p>
            <p>
              Password: <span className="text-slate-500">password</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};