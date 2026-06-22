import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { getErrorMessage } from '../utils/apiError';

// Returns { score: 0-3, label, color } for a given password string.
function getPasswordStrength(pwd) {
  if (pwd.length < 8) return { score: 0, label: 'Too Short', color: '#ef4444' };
  let score = 0;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score === 0) return { score: 1, label: 'Weak', color: '#f97316' };
  if (score === 1) return { score: 2, label: 'Medium', color: '#eab308' };
  return { score: 3, label: 'Strong', color: '#22c55e' };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Reset all fields and switch mode
  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setError('');
  };

  const strength = !isLogin ? getPasswordStrength(password) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.message);
        toast.error(result.message);
      } else {
        navigate('/dashboard');
      }
    } else {
      // --- Client-side validation ---
      if (!EMAIL_REGEX.test(email)) {
        const message = 'Please enter a valid email address.';
        setError(message);
        toast.error(message);
        return;
      }
      if (password.length < 8 || password.length > 12) {
        const message = 'Password must be between 8 and 12 characters.';
        setError(message);
        toast.error(message);
        return;
      }
      if (password !== confirmPassword) {
        const message = 'Passwords do not match.';
        setError(message);
        toast.error(message);
        return;
      }

      try {
        await api.post('/auth/signup', { username, email, password });
        toast.success('Account created! Signing you in...');
        const result = await login(username, password);
        if (!result.success) {
          const message = 'Account created, but sign-in failed. Please try logging in.';
          setError(message);
          toast.error(message);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        const message = getErrorMessage(err, 'Signup failed');
        setError(message);
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neonBlue/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neonPurple/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 max-w-md w-full relative z-10"
      >
        <div className="text-center mb-8">
          <Activity className="w-12 h-12 mx-auto mb-4 text-neonBlue" />
          <h1 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join Progress Tracker'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Sign in to track your productivity.' : 'Create an account to start tracking.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/50 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue transition-colors"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue transition-colors"
            />

            {/* Password strength meter — signup only */}
            {!isLogin && password.length > 0 && strength && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className="h-1.5 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          strength.score >= step ? strength.color : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password — signup only */}
          {!isLogin && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neonBlue transition-colors"
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match.</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-neonBlue to-neonPurple text-white font-bold hover:opacity-90 transition-opacity"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-neonBlue hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}