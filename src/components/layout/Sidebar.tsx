import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  Layers,
  Brain,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/review', icon: RotateCcw, label: 'Revisões' },
  { to: '/session/new', icon: BookOpen, label: 'Sessão' },
  { to: '/areas', icon: Layers, label: 'Áreas' },
];

const areaColorMap: Record<string, string> = {
  blue:   '#3b82f6',
  green:  '#22c55e',
  purple: '#a855f7',
  orange: '#f97316',
  red:    '#ef4444',
  yellow: '#eab308',
  teal:   '#14b8a6',
  pink:   '#ec4899',
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const allAreas    = useAppStore((s) => s.areas);
  const activeAreaId = useAppStore((s) => s.activeAreaId);
  const setActiveAreaId = useAppStore((s) => s.setActiveAreaId);

  const areas = allAreas.filter((a) => a.isActive);

  const handleAreaClick = (id: string) => {
    setActiveAreaId(activeAreaId === id ? null : id);
  };

  return (
    <aside
      className={`
        flex flex-col bg-gray-900 text-white transition-all duration-200 flex-shrink-0
        ${collapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <Brain className="w-6 h-6 text-brand-500 flex-shrink-0" />
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">brrrain</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors
              ${isActive
                ? 'bg-brand-500 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }
            `}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* Active areas — selectable */}
        {areas.length > 0 && (
          <div className={`pt-4 mt-4 border-t border-gray-700 ${collapsed ? '' : ''}`}>
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Áreas ativas
              </p>
            )}
            {areas.slice(0, 8).map((area) => {
              const color = areaColorMap[area.color] ?? '#6b7280';
              const isSelected = activeAreaId === area.id;

              return (
                <button
                  key={area.id}
                  onClick={() => handleAreaClick(area.id)}
                  title={area.name}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs
                    transition-colors text-left
                    ${isSelected
                      ? 'bg-gray-700 text-white font-semibold'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}
                  `}
                >
                  {/* Color dot — bigger + ring when selected */}
                  <span
                    className={`flex-shrink-0 rounded-full transition-all
                      ${isSelected ? 'w-2.5 h-2.5 ring-2 ring-offset-1 ring-offset-gray-900' : 'w-2 h-2'}`}
                    style={{ backgroundColor: color, ...(isSelected ? { ringColor: color } : {}) }}
                  />
                  {!collapsed && (
                    <span className="truncate">{area.name}</span>
                  )}
                  {!collapsed && isSelected && (
                    <span className="ml-auto text-gray-400 text-[10px] font-normal">ativa</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center p-3 border-t border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
