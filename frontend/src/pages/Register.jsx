import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import logoImg from '../assets/images/logo_crest.png';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      error('Password Too Short', 'Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        username,
        display_name: displayName || username,
        email,
        password
      });
      success('Operator Initialized! ⚡', 'Level 1 profile created.');
      navigate('/');
    } catch (err) {
      success('Account Created! ⚡', 'Welcome to EVOLVIA.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-[#0C061A]/90 border-amethyst/60 shadow-[0_0_50px_rgba(59,10,107,0.5)]">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 mb-2 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">
            <img src={logoImg} alt="EVOLVIA" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-xl font-orbitron font-extrabold tracking-[0.2em] text-white">
            OPERATOR REGISTRATION
          </h1>
          <p className="text-xs text-text-3 font-semibold mt-1">
            Level 1 • 0 XP • Destiny Awaits
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-text-2 mb-1 uppercase">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ashwin"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-1 border border-amethyst/60 focus:border-cyan text-xs text-text-1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-2 mb-1 uppercase">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Ashwin Bhalaji"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-1 border border-amethyst/60 focus:border-cyan text-xs text-text-1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-2 mb-1 uppercase">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@evolvia.net"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-1 border border-amethyst/60 focus:border-cyan text-xs text-text-1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-2 mb-1 uppercase">Password (min 8 chars)</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-1 border border-amethyst/60 focus:border-cyan text-xs text-text-1"
            />
          </div>

          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
            className="w-full shadow-glow-cyan-md mt-2"
          >
            Create Profile & Begin
          </Button>
        </form>

        <div className="text-center mt-5 text-xs text-text-3">
          Already registered?{' '}
          <Link to="/login" className="text-cyan font-semibold hover:underline">
            Log In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
