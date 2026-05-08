import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        navigate('/secure-admin-dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-grow flex items-center justify-center bg-[#F4F7F6] p-4 h-full min-h-screen"
    >
      <div className="w-full max-w-md bg-white p-10 border border-slate-200 shadow-xl rounded-sm">
        <div className="mb-10 text-center">
          <div className="w-14 h-14 bg-[#006633] text-white flex items-center justify-center font-serif italic text-2xl mx-auto mb-5 rounded-full shadow-md">
            AJ
          </div>
          <h2 className="text-3xl font-serif text-slate-900 leading-none">Admin Portal</h2>
          <p className="text-sm text-slate-400 mt-2 tracking-wide">Sign in to manage portfolio</p>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.1em] mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-[#006633] focus:border-[#006633] outline-none transition-colors bg-slate-50 focus:bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.1em] mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-[#006633] focus:border-[#006633] outline-none transition-colors bg-slate-50 focus:bg-white"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#006633] text-white font-bold py-3.5 px-4 mt-8 hover:bg-[#008844] transition-colors disabled:opacity-50 text-sm tracking-[0.15em] uppercase rounded-sm shadow-md"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
