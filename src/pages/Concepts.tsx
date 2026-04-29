import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, EyeOff, Eye, FileDown,
  Code2, BookOpen, Brain, FlaskConical, Calculator,
  Languages, Music, Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AreaFormModal } from '@/components/areas/AreaFormModal';
import { ConceptFormModal } from '@/components/areas/ConceptFormModal';
import { ImportConceptsModal } from '@/components/areas/ImportConceptsModal';
import { ConceptDetail } from '@/components/concepts/ConceptDetail';
import { useAreas } from '@/hooks/useAreas';
import { useConcepts } from '@/hooks/useConcepts';
import { useSessions } from '@/hooks/useSessions';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useAppStore } from '@/store/useAppStore';
import type { Area, AreaColor, AreaIcon, Concept, ConceptStatus } from '@/domain/types';

const COLOR_MAP: Record<AreaColor, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200' },
  pink:   { bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200' },
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

const STATUS_COLUMNS: {
  status: ConceptStatus;
  label: string;
  headerBg: string;
  headerText: string;
  dot: string;
}[] = [
  { status: 'new',       label: 'New',       headerBg: 'bg-gray-50',   headerText: 'text-gray-600',  dot: 'bg-gray-400' },
  { status: 'learning',  label: 'Learning',  headerBg: 'bg-blue-50',   headerText: 'text-blue-700',  dot: 'bg-blue-500' },
  { status: 'reviewing', label: 'Reviewing', headerBg: 'bg-amber-50',  headerText: 'text-amber-700', dot: 'bg-amber-500' },
  { status: 'mastered',  label: 'Mastered',  headerBg: 'bg-green-50',  headerText: 'text-green-700', dot: 'bg-green-500' },
];

const STATUS_BADGE_VARIANT: Record<ConceptStatus, 'default' | 'info' | 'warning' | 'success'> = {
  new:       'default',
  learning:  'info',
  reviewing: 'warning',
  mastered:  'success',
};

function ConceptCard({
  concept,
  flashcardCount,
  dot,
  onClick,
}: {
  concept: Concept;
  flashcardCount: number;
  dot: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 cursor-pointer
                 hover:border-brand-200 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-2">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${dot}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 leading-snug group-hover:text-brand-700 transition-colors">
            {concept.title}
          </p>
          {concept.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{concept.description}</p>
          )}
          {flashcardCount > 0 && (
            <p className="text-xs text-gray-300 mt-1">
              {flashcardCount} card{flashcardCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Concepts() {
  const { areas, createArea, editArea, toggleArea, deleteArea } = useAreas();
  const { concepts, createConcept }              = useConcepts();
  useSessions();
  useFlashcards();

  const flashcards = useAppStore((s) => s.flashcards);

  const activeAreas = areas.filter((a) => a.isActive);

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [areaModal, setAreaModal]           = useState<'new' | Area | null>(null);
  const [conceptModal, setConceptModal]     = useState<string | null>(null);
  const [importModal, setImportModal]       = useState<Area | null>(null);
  const [deletingArea, setDeletingArea]     = useState<string | null>(null);
  const [detailConcept, setDetailConcept]   = useState<Concept | null>(null);

  // Auto-select first active area
  useEffect(() => {
    if (!selectedAreaId && activeAreas.length > 0) {
      setSelectedAreaId(activeAreas[0].id);
    }
  }, [activeAreas, selectedAreaId]);

  const selectedArea = areas.find((a) => a.id === selectedAreaId);

  const areaConcepts = concepts.filter((c) => c.areaId === selectedAreaId);

  const handleSaveArea = async (data: { name: string; color: AreaColor; icon: AreaIcon }) => {
    if (areaModal === 'new') {
      const newArea = await createArea(data);
      setSelectedAreaId(newArea.id);
    } else if (areaModal) {
      await editArea(areaModal.id, data);
    }
  };

  const handleDeleteArea = async (id: string) => {
    setDeletingArea(id);
    await deleteArea(id);
    setDeletingArea(null);
    if (selectedAreaId === id) {
      const remaining = activeAreas.filter((a) => a.id !== id);
      setSelectedAreaId(remaining[0]?.id ?? null);
    }
  };

  const handleBatchImport = async (
    areaId: string,
    items: { title: string; description?: string; status?: ConceptStatus }[]
  ) => {
    for (const item of items) {
      await createConcept({ areaId, ...item });
    }
  };

  const detailArea = detailConcept
    ? areas.find((a) => a.id === detailConcept.areaId)
    : undefined;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Concepts</h1>
        <Button onClick={() => setAreaModal('new')}>
          <Plus className="w-4 h-4" />
          New area
        </Button>
      </div>

      {/* Area tabs */}
      {activeAreas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Create your first area to start organizing concepts.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {activeAreas.map((area) => {
              const colors = COLOR_MAP[area.color] ?? COLOR_MAP.blue;
              const Icon   = ICON_MAP[area.icon] ?? BookOpen;
              const isSelected = selectedAreaId === area.id;
              return (
                <button
                  key={area.id}
                  onClick={() => setSelectedAreaId(area.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
                    border transition-all
                    ${isSelected
                      ? `${colors.bg} ${colors.text} ${colors.border}`
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {area.name}
                  <span className="text-xs opacity-60">
                    {concepts.filter((c) => c.areaId === area.id).length}
                  </span>
                </button>
              );
            })}

            {/* Archived areas toggle */}
            {areas.filter((a) => !a.isActive).length > 0 && (
              <span className="text-xs text-gray-400 ml-1">
                {areas.filter((a) => !a.isActive).length} archived
              </span>
            )}
          </div>

          {/* Area action bar */}
          {selectedArea && (
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex-1">
                {areaConcepts.length} concept{areaConcepts.length !== 1 ? 's' : ''}
              </span>
              <button
                title="Import concepts"
                onClick={() => setImportModal(selectedArea)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <FileDown className="w-4 h-4" />
              </button>
              <button
                title="Edit area"
                onClick={() => setAreaModal(selectedArea)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                title={selectedArea.isActive ? 'Archive area' : 'Reactivate area'}
                onClick={() => toggleArea(selectedArea.id, !selectedArea.isActive)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {selectedArea.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                title="Delete area"
                onClick={() => handleDeleteArea(selectedArea.id)}
                disabled={deletingArea === selectedArea.id}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Kanban columns */}
          {selectedArea && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STATUS_COLUMNS.map((col) => {
                const colConcepts = areaConcepts.filter((c) => c.status === col.status);
                return (
                  <div key={col.status} className="flex flex-col gap-2 min-h-[200px]">
                    {/* Column header */}
                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${col.headerBg}`}>
                      <span className={`text-xs font-semibold ${col.headerText}`}>
                        {col.label}
                      </span>
                      <Badge variant={STATUS_BADGE_VARIANT[col.status]}>
                        {colConcepts.length}
                      </Badge>
                    </div>

                    {/* Concept cards */}
                    <div className="flex-1 space-y-2">
                      {colConcepts.map((concept) => {
                        const cardCount = flashcards.filter(
                          (f) => f.conceptId === concept.id
                        ).length;
                        return (
                          <ConceptCard
                            key={concept.id}
                            concept={concept}
                            flashcardCount={cardCount}
                            dot={col.dot}
                            onClick={() => setDetailConcept(concept)}
                          />
                        );
                      })}
                    </div>

                    {/* Add concept (New column only) */}
                    {col.status === 'new' && (
                      <button
                        onClick={() => setConceptModal(selectedArea.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-gray-400
                                   hover:text-brand-600 hover:bg-brand-50 border border-dashed border-gray-200
                                   hover:border-brand-300 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add concept
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modals */}
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

      {/* Concept detail drawer */}
      {detailConcept !== null && (
        <ConceptDetail
          concept={detailConcept}
          area={detailArea}
          onClose={() => setDetailConcept(null)}
        />
      )}
    </div>
  );
}
