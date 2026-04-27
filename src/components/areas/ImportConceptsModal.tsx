import { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle2, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { ConceptStatus } from '@/domain/types';
import reactCurriculum from '@/data/curricula/react.json';

interface ConceptInput {
  title: string;
  description?: string;
  status?: ConceptStatus;
}

interface Props {
  areaId: string;
  areaName: string;
  onImport: (concepts: ConceptInput[]) => Promise<void>;
  onClose: () => void;
}

const STATUS_BADGE: Record<ConceptStatus, { label: string; variant: 'default' | 'info' | 'warning' | 'success' }> = {
  new:       { label: 'New',       variant: 'default' },
  learning:  { label: 'Learning',  variant: 'info' },
  reviewing: { label: 'Reviewing', variant: 'warning' },
  mastered:  { label: 'Mastered',  variant: 'success' },
};

const VALID_STATUSES: ConceptStatus[] = ['new', 'learning', 'reviewing', 'mastered'];

const PRESETS: { label: string; data: ConceptInput[] }[] = [
  { label: 'React', data: reactCurriculum as ConceptInput[] },
];

function parseInput(raw: string): { concepts: ConceptInput[]; error: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) return { concepts: [], error: null };

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return { concepts: [], error: 'Expected a JSON array [ ... ]' };

    const concepts: ConceptInput[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (typeof item !== 'object' || !item) {
        return { concepts: [], error: `Item ${i + 1} is not an object` };
      }
      if (typeof item.title !== 'string' || !item.title.trim()) {
        return { concepts: [], error: `Item ${i + 1} is missing a "title" string` };
      }
      if (item.status && !VALID_STATUSES.includes(item.status)) {
        return { concepts: [], error: `Item ${i + 1} has invalid status "${item.status}". Valid: new, learning, reviewing, mastered` };
      }
      concepts.push({
        title: item.title.trim(),
        description: typeof item.description === 'string' ? item.description.trim() : undefined,
        status: item.status ?? 'new',
      });
    }

    return { concepts, error: null };
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : 'Invalid JSON';
    return { concepts: [], error: msg };
  }
}

type Mode = 'preset' | 'paste';

export function ImportConceptsModal({ areaId: _areaId, areaName, onImport, onClose }: Props) {
  const [mode, setMode]           = useState<Mode>('preset');
  const [raw, setRaw]             = useState('');
  const [importing, setImporting] = useState(false);
  const [imported, setImported]   = useState<number | null>(null);

  const { concepts: parsedConcepts, error } = parseInput(raw);

  const handlePresetImport = async (data: ConceptInput[]) => {
    setImporting(true);
    await onImport(data);
    setImporting(false);
    setImported(data.length);
  };

  const handlePasteImport = async () => {
    if (!parsedConcepts.length || importing) return;
    setImporting(true);
    await onImport(parsedConcepts);
    setImporting(false);
    setImported(parsedConcepts.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Import concepts</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Into <span className="font-medium text-gray-600">{areaName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {imported !== null ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
              <p className="font-semibold text-gray-800">
                {imported} concept{imported !== 1 ? 's' : ''} imported successfully
              </p>
              <Button onClick={onClose}>Done</Button>
            </div>
          ) : (
            <>
              {/* Mode tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                {(['preset', 'paste'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${mode === m ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {m === 'preset' ? 'Presets' : 'Paste JSON'}
                  </button>
                ))}
              </div>

              {/* Preset mode */}
              {mode === 'preset' && (
                <div className="space-y-2">
                  {PRESETS.map((preset) => (
                    <div
                      key={preset.label}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{preset.label}</p>
                          <p className="text-xs text-gray-400">{preset.data.length} concepts</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePresetImport(preset.data)}
                        disabled={importing}
                      >
                        {importing
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing...</>
                          : <><Upload className="w-3.5 h-3.5" /> Import</>
                        }
                      </Button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 pt-1">
                    More presets can be added to <code className="bg-gray-100 px-1 rounded">src/data/curricula/</code>
                  </p>
                </div>
              )}

              {/* Paste mode */}
              {mode === 'paste' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Paste your JSON
                    </label>
                    <textarea
                      autoFocus
                      value={raw}
                      onChange={(e) => setRaw(e.target.value)}
                      placeholder={`[\n  {\n    "title": "Custom Hooks",\n    "description": "Reusable stateful logic — video · 45 min",\n    "status": "new"\n  }\n]`}
                      rows={10}
                      spellCheck={false}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono
                                 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500
                                 focus:border-transparent bg-gray-50"
                    />
                  </div>

                  <p className="text-xs text-gray-400">
                    Fields: <code className="bg-gray-100 px-1 rounded">title</code> (required),{' '}
                    <code className="bg-gray-100 px-1 rounded">description</code>,{' '}
                    <code className="bg-gray-100 px-1 rounded">status</code> — new · learning · reviewing · mastered
                  </p>

                  {error && raw.trim() && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="text-xs">{error}</p>
                    </div>
                  )}

                  {parsedConcepts.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview — {parsedConcepts.length} concept{parsedConcepts.length !== 1 ? 's' : ''} found
                      </p>
                      <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-100 rounded-xl">
                        {parsedConcepts.map((c, i) => {
                          const s = c.status ?? 'new';
                          const { label, variant } = STATUS_BADGE[s];
                          return (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
                              <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                                {c.description && (
                                  <p className="text-xs text-gray-400 truncate">{c.description}</p>
                                )}
                              </div>
                              <Badge variant={variant}>{label}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer — only for paste mode */}
        {imported === null && mode === 'paste' && (
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handlePasteImport}
              disabled={!parsedConcepts.length || !!error || importing}
            >
              {importing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</>
                : <><Upload className="w-4 h-4" /> Import {parsedConcepts.length || ''} concepts</>
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
