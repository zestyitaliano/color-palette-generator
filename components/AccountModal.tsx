
import React, { useState } from 'react';
import { XIcon, UserIcon } from './icons/Icons';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email: string } | null;
  onLogin: (email: string) => void;
  onLogout: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, user, onLogin, onLogout }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
          onLogin(email);
          setIsLoading(false);
          setEmail('');
          setPassword('');
      }, 800);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white shadow-2xl z-50 p-8 border border-gray-100 animate-in zoom-in-95 duration-200">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
            <XIcon className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mb-4">
                <UserIcon className={`w-8 h-8 ${user ? 'text-[#1982c4]' : 'text-gray-400'}`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{user ? 'Your Account' : (isLoginMode ? 'Welcome Back' : 'Create Account')}</h2>
            {!user && <p className="text-sm text-gray-500 mt-1">{isLoginMode ? 'Sign in to sync your palettes' : 'Join to save your favorites'}</p>}
        </div>

        {user ? (
            <div className="flex flex-col gap-6">
                <div className="text-center p-4 bg-gray-50 border border-gray-100">
                    <p className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">Signed in as</p>
                    <p className="font-medium text-gray-900 break-all">{user.email}</p>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 text-green-700 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Syncing is active across this browser session.</span>
                </div>

                <button 
                    onClick={() => {
                        onLogout();
                        onClose();
                    }}
                    className="w-full py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                    Sign Out
                </button>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1982c4] focus:border-transparent transition-all"
                        placeholder="name@example.com"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1982c4] focus:border-transparent transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3 mt-2 bg-[#1982c4] text-white font-bold hover:bg-[#156fba] transition-colors disabled:opacity-70"
                >
                    {isLoading ? 'Please wait...' : (isLoginMode ? 'Sign In' : 'Create Account')}
                </button>

                <div className="text-center mt-4">
                    <button 
                        type="button"
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setEmail('');
                            setPassword('');
                        }}
                        className="text-sm text-gray-500 hover:text-[#1982c4] transition-colors underline decoration-gray-300 hover:decoration-[#1982c4]"
                    >
                        {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </form>
        )}
      </div>
    </>
  );
};

export default AccountModal;
