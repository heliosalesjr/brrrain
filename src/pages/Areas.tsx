import { useState } from 'react';
import {
  Plus, ChevronDown, ChevronUp, Pencil, Trash2,
  EyeOff, Eye, Code2, BookOpen, Brain, FlaskConical,
  Calculator, Languages, Music, Palette, FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AreaFormModal } from '@/components/areas/AreaFormModal';
import { ConceptFormModal } from '@/components/areas/ConceptFormModal';
import { ImportConceptsModal } from '@/components/areas/ImportConceptsModal';
import { useAreas } from '@/hooks/useAreas';
import { useConcepts } from '@/hooks/useConcepts';
import type { Area, AreaColor, AreaIcon, ConceptStatus } from '@/domain/types';

const COLOR_MAP: Record<AreaColor, { bg: string; text: string; dot: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500' },
  pink:   { bg: 'bg-pink-50',   text: 'text-pink-700',   dot: 'bg-pink-500' },
};

const ICON_MAP: Record<AreaIcon, React.FC<{ className?: string }>> = {
  code:     Code2,
  book:     BookOpen,
  brain:    Brain,
  flask:    FlaskConical,
  math:     Calculator,
  language: Languages,
  music:    Music,
  art:      Palette,
};

const STATUS_BADGE: Record<ConceptStatus, { label: string; variant: 'default' | 'info' | 'warning' | 'success' }> = {
  new:       { label: 'New',       variant: 'default' },
  learning:  { label: 'Learning',  variant: 'info' },
  reviewing: { label: 'Reviewing', variant: 'warning' },
  mastered:  { label: 'Mastered',  variant: 'success' },
};

export function Areas() {
  const { areas, createArea, editArea, toggleArea, deleteArea } = useAreas();
  const { concepts, createConcept, deleteConcept }              = useConcepts();

  const [expanded, setExpanded]         = useState<Set<string>>(new Set());
  const [areaModal, setAreaModal]       = useState<'new' | Area | null>(null);
  const [conceptModal, setConceptModal] = useState<string | null>(null);
  const [importModal, setImportModal]   = useState<Area | null>(null);
  const [deletingArea, setDeletingArea] = useState<string | null>(null);

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSaveArea = async (data: { name: string; color: AreaColor; icon: AreaIcon }) => {
    if (areaModal === 'new') {
      await createArea(data);
    } else if (areaModal) {
      await editArea(areaModal.id, data);
    }
  };

  const confirmDelete = async (id: string) => {
    setDeletingArea(id);
    await deleteArea(id);
    setDeletingArea(null);
  };

  const handleBatchImport = async (
    areaId: string,
    items: { title: string; description?: string; status?: ConceptStatus }[]
  ) => {
    for (const item of items) {
      await createConcept({ areaId, ...item });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Study areas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {areas.length === 0 ? 'No areas yet' : `${areas.length} area${areas.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <Button onClick={() => setAreaModal('new')}>
          <Plus className="w-4 h-4" />
          New area
        </Button>
      </div>

      {areas.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Create your first study area to get started.</p>
        </div>
      )}

      {areas.map((area) => {
        const colors   = COLOR_MAP[area.color] ?? COLOR_MAP.blue;
        const Icon     = ICON_MAP[area.icon] ?? BookOpen;
        const areaConc = concepts.filter((c) => c.areaId === area.id);
        const isOpen   = expanded.has(area.id);

        return (
          <div
            key={area.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-opacity
              ${area.isActive ? 'border-gray-100 opacity-100' : 'border-gray-200 opacity-60'}`}
          >
            <div className="flex items-center gap-3 px-5 py-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{area.name}</p>
                <p className="text-xs text-gray-400">
                  {areaConc.length} concept{areaConc.length !== 1 ? 's' : ''}
                  {' · '}
                  {areaConc.filter((c) => c.status === 'mastered').length} mastered
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  title={area.isActive ? 'Archive area' : 'Reactivate area'}
                  onClick={() => toggleArea(area.id, !area.isActive)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {area.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  title="Import concepts"
                  onClick={() => setImportModal(area)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                </button>
                <button
                  title="Edit area"
                  onClick={() => setAreaModal(area)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  title="Delete area"
                  onClick={() => confirmDelete(area.id)}
                  disabled={deletingArea === area.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleExpanded(area.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-1"
                >
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="border-t border-gray-50 px-5 py-3 space-y-1">
                {areaConc.length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No concepts yet.</p>
                ) : (
                  areaConc.map((concept) => {
                    const { label, variant } = STATUS_BADGE[concept.status];
                    return (
                      <div
                        key={concept.id}
                        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 group"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{concept.title}</p>
                          {concept.description && (
                            <p className="text-xs text-gray-400 truncate">{concept.description}</p>
                          )}
                        </div>
                        <Badge variant={variant}>{label}</Badge>
                        <button
                          onClick={() => deleteConcept(concept.id)}
                          className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50
                                     opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}

                <button
                  onClick={() => setConceptModal(area.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-400
                             hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add concept
                </button>
              </div>
            )}
          </div>
        );
      })}

      {areaModal !== null && (
        <AreaFormModal
          initial={areaModal === 'new' ? undefined : areaModal}
          onSave={handleSaveArea}
          onClose={() => setAreaModal(null)}
        />
      )}

      {conceptModal !== null && (
        <ConceptFormModal
          areaId={conceptModal}
          onSave={createConcept}
          onClose={() => setConceptModal(null)}
        />
      )}

      {importModal !== null && (
        <ImportConceptsModal
          areaId={importModal.id}
          areaName={importModal.name}
          onImport={(items) => handleBatchImport(importModal.id, items)}
          onClose={() => setImportModal(null)}
        />
      )}
    </div>
  );
}
