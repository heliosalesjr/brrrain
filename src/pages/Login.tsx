import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isConfigured } from '@/firebase/config';

// Google "G" SVG icon (official colors)
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function Login() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If not configured, skip to dashboard
  if (!isConfigured) return <Navigate to="/" replace />;

  // Already authenticated
  if (!loading && user) return <Navigate to="/" replace />;

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao entrar com Google';
      // User closed the popup — not a real error
      if (!msg.includes('popup-closed')) setError(msg);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-brand-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-sm text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">brrrain</span>
        </div>
        <p className="text-sm text-gray-500 mb-8">Plataforma de aprendizado pessoal</p>

        {/* Sign-in */}
        <button
          onClick={handleSignIn}
          disabled={signingIn || loading}
          className="
            w-full flex items-center justify-center gap-3
            px-4 py-3 rounded-xl border border-gray-200
            bg-white text-gray-700 font-medium text-sm
            hover:bg-gray-50 hover:border-gray-300
            transition-colors
            disabled:opacity-60 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
          "
        >
          <GoogleIcon />
          {signingIn ? 'Entrando...' : 'Entrar com Google'}
        </button>

        {error && (
          <p className="mt-4 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <p className="mt-6 text-xs text-gray-400">
          Acesso restrito. Apenas contas autorizadas.
        </p>
      </div>
    </div>
  );
}
