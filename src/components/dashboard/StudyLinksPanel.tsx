import { useState } from 'react';
import {
  Plus, Trash2, Video, FileText, BookOpen,
  Headphones, GraduationCap, Globe, File, ExternalLink, Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStudyLinks } from '@/hooks/useStudyLinks';
import type { LinkMediaType } from '@/domain/types';

interface Props {
  areaId: string | null;
}

const MEDIA_TYPES: { value: LinkMediaType; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { value: 'video',   label: 'Video',   Icon: Video },
  { value: 'article', label: 'Article', Icon: FileText },
  { value: 'pdf',     label: 'PDF',     Icon: File },
  { value: 'book',    label: 'Book',    Icon: BookOpen },
  { value: 'audio',   label: 'Audio',   Icon: Headphones },
  { value: 'course',  label: 'Course',  Icon: GraduationCap },
  { value: 'website', label: 'Website', Icon: Globe },
];

const MEDIA_ICON: Record<LinkMediaType, React.FC<{ className?: string }>> = {
  video:   Video,
  article: FileText,
  pdf:     File,
  book:    BookOpen,
  audio:   Headphones,
  course:  GraduationCap,
  website: Globe,
};

export function StudyLinksPanel({ areaId }: Props) {
  const { links, createLink, deleteLink } = useStudyLinks(areaId ?? undefined);
  const [adding, setAdding]       = useState(false);
  const [title, setTitle]         = useState('');
  const [url, setUrl]             = useState('');
  const [mediaType, setMediaType] = useState<LinkMediaType>('website');
  const [saving, setSaving]       = useState(false);

  const reset = () => { setTitle(''); setUrl(''); setMediaType('website'); setAdding(false); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !areaId) return;
    setSaving(true);
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    await createLink({ areaId, title: title.trim(), url: fullUrl, mediaType });
    setSaving(false);
    reset();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-gray-400" />
          Study materials
        </h2>
        {!adding && areaId && (
          <button
            onClick={() => setAdding(true)}
            className="p-1 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {!areaId && (
        <p className="text-xs text-gray-400 py-4 text-center">
          Select an area from the sidebar to see its materials.
        </p>
      )}

      {adding && (
        <form onSubmit={handleSave} className="mb-4 space-y-3 bg-gray-50 rounded-xl p-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Material name"
            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <div className="flex gap-1 flex-wrap">
            {MEDIA_TYPES.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMediaType(value)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-all
                  ${mediaType === value
                    ? 'border-brand-500 bg-brand-50 text-brand-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={reset} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!title.trim() || !url.trim() || saving} className="flex-1">
              {saving ? 'Saving...' : 'Add'}
            </Button>
          </div>
        </form>
      )}

      {areaId && links.length === 0 && !adding && (
        <p className="text-xs text-gray-400 py-4 text-center">
          No materials yet. Click + to add one.
        </p>
      )}

      <div className="space-y-1">
        {links.map((link) => {
          const Icon = MEDIA_ICON[link.mediaType] ?? Globe;
          return (
            <div key={link.id} className="flex items-center gap-2 group rounded-xl px-2 py-1.5 hover:bg-gray-50">
              <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-gray-700 hover:text-brand-600 truncate flex items-center gap-1 min-w-0"
              >
                <span className="truncate">{link.title}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-60" />
              </a>
              <button
                onClick={() => deleteLink(link.id)}
                className="p-1 rounded text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
