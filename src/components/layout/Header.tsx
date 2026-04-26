import { format } from 'date-fns';
import { Bell, LogOut } from 'lucide-react';
import { useScheduler } from '@/hooks/useScheduler';
import { useAuth } from '@/contexts/AuthContext';
import { isConfigured } from '@/firebase/config';

export function Header() {
  const { dueReviewsToday } = useScheduler();
  const { user, signOut } = useAuth();
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 capitalize">{today}</h1>
        <p className="text-sm text-gray-500">Personal learning platform</p>
      </div>

      <div className="flex items-center gap-2">
        {dueReviewsToday.length > 0 && (
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        )}

        {isConfigured && user && (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? 'User'}
                className="w-8 h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                {user.displayName?.charAt(0) ?? '?'}
              </div>
            )}
            <span className="text-sm text-gray-700 hidden sm:block">
              {user.displayName?.split(' ')[0]}
            </span>
            <button
              onClick={signOut}
              title="Sign out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
