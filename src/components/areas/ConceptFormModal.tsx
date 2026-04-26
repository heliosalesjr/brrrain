import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  areaId: string;
  onSave: (data: { areaId: string; title: string; description?: string }) => Promise<void>;
  onClose: () => void;
}

export function ConceptFormModal({ areaId, onSave, onClose }: Props) {
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [saving, setSaving]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ areaId, title: title.trim(), description: description.trim() || undefined });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Novo conceito</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Closures em JavaScript"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Uma breve descrição do que você quer aprender…"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim() || saving}>
              {saving ? 'Salvando…' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
