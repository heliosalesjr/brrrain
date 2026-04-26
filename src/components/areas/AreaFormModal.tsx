import { useState } from 'react';
import {
  Code2, BookOpen, Brain, FlaskConical, Calculator,
  Languages, Music, Palette, X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Area, AreaColor, AreaIcon } from '@/domain/types';

interface Props {
  initial?: Area;
  onSave: (data: { name: string; color: AreaColor; icon: AreaIcon }) => Promise<void>;
  onClose: () => void;
}

const COLORS: { value: AreaColor; bg: string; ring: string }[] = [
  { value: 'blue',   bg: 'bg-blue-500',   ring: 'ring-blue-400' },
  { value: 'green',  bg: 'bg-green-500',  ring: 'ring-green-400' },
  { value: 'purple', bg: 'bg-purple-500', ring: 'ring-purple-400' },
  { value: 'orange', bg: 'bg-orange-500', ring: 'ring-orange-400' },
  { value: 'red',    bg: 'bg-red-500',    ring: 'ring-red-400' },
  { value: 'yellow', bg: 'bg-yellow-400', ring: 'ring-yellow-300' },
  { value: 'teal',   bg: 'bg-teal-500',   ring: 'ring-teal-400' },
  { value: 'pink',   bg: 'bg-pink-500',   ring: 'ring-pink-400' },
];

const ICONS: { value: AreaIcon; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { value: 'code',     label: 'Código',    Icon: Code2 },
  { value: 'book',     label: 'Livro',     Icon: BookOpen },
  { value: 'brain',    label: 'Cérebro',   Icon: Brain },
  { value: 'flask',    label: 'Ciência',   Icon: FlaskConical },
  { value: 'math',     label: 'Matemática',Icon: Calculator },
  { value: 'language', label: 'Idioma',    Icon: Languages },
  { value: 'music',    label: 'Música',    Icon: Music },
  { value: 'art',      label: 'Arte',      Icon: Palette },
];

export function AreaFormModal({ initial, onSave, onClose }: Props) {
  const [name, setName]   = useState(initial?.name ?? '');
  const [color, setColor] = useState<AreaColor>(initial?.color ?? 'blue');
  const [icon, setIcon]   = useState<AreaIcon>(initial?.icon ?? 'book');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), color, icon });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {initial ? 'Editar área' : 'Nova área'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Programação, Biologia..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(({ value, bg, ring }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColor(value)}
                  className={`w-8 h-8 rounded-full ${bg} transition-all
                    ${color === value ? `ring-2 ring-offset-2 ${ring}` : 'opacity-60 hover:opacity-100'}`}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
            <div className="grid grid-cols-4 gap-2">
              {ICONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIcon(value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all
                    ${icon === value
                      ? 'border-brand-500 bg-brand-50 text-brand-600'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || saving}>
              {saving ? 'Salvando…' : initial ? 'Salvar' : 'Criar área'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
