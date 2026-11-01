import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../services/DataService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const Signup: React.FC = () => {
  const { signup } = useData();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await signup(formData.email, formData.password, formData.name);
    
    if (!result.success) {
      setError(result.error || 'Failed to create account.');
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-slate-200/80 overflow-hidden border border-white">
        <div className="p-8 md:p-12">
          <div className="mb-8">
             <Link to="/login" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
               <ArrowLeft size={14} className="mr-2" /> BACK TO LOGIN
             </Link>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-indigo-600 tracking-tight mb-2">Create Account</h1>
            <p className="text-slate-400 font-medium">Start managing your textile production</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="name@factory.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="••••••••"
              required
            />
            
            {error && (
              <div className="p-5 rounded-2xl bg-red-50/50 border border-red-100 text-red-600 text-sm flex items-center gap-3 font-semibold animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle size={22} className="shrink-0 text-red-500" />
                {error}
              </div>
            )}

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all bg-indigo-600 border-none" 
                isLoading={loading}
              >
                Register Now
              </Button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};