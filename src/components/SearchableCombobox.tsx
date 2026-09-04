import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Plus } from 'lucide-react';

export const DEFAULT_GASTRONOMY_CATEGORIES = [
  'Carnes, Achuras & Pollo',
  'Verdulería, Frutas & Hortalizas',
  'Bebidas, Vinos, Licores & Cervezas',
  'Lácteos, Quesos & Cremas',
  'Fiambres & Embutidos',
  'Panadería, Pastelería & Bollería',
  'Pescadería, Mariscos & Congelados',
  'Almacén, Secos, Salsas & Especias',
  'Café, Té, Barismo & Infusiones',
  'Helados, Postres & Insumos Dulces',
  'Limpieza, Químicos, Higiene & Sanidad',
  'Desechables, Packaging, Bobinas & Mantelería',
  'Equipamiento, Vajilla & Utensilios',
  'Mantenimiento, Servicios Técnicos & Reparaciones',
  'Gas, Electricidad, Agua & Combustibles',
  'Marketing, Diseño & Publicidad',
  'Servicios Profesionales, Honorarios & Asesoría',
  'Insumos de Caja, Papelería & Impresión',
  'Uniformes & Indumentaria de Personal',
  'Varios & Gastos Generales'
];

interface SearchableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  allowCustom?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Buscar o seleccionar...',
  label,
  required = false,
  allowCustom = true,
  className = '',
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const isExactMatch = options.some(
    opt => opt.toLowerCase().trim() === searchQuery.toLowerCase().trim()
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchQuery(text);
    onChange(text);
    setIsOpen(true);
  };

  const handleSelectOption = (opt: string) => {
    onChange(opt);
    setSearchQuery(opt);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="text-xs text-slate-400 block mb-1">{label}</label>}

      <div className="relative">
        <div className="absolute left-3 top-2.5 text-slate-500 flex items-center pointer-events-none">
          {icon || <Search className="w-3.5 h-3.5" />}
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white focus:border-amber-500 outline-none font-medium"
        />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-52 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
          {allowCustom && searchQuery.trim() !== '' && !isExactMatch && (
            <button
              type="button"
              onClick={() => handleSelectOption(searchQuery.trim())}
              className="w-full text-left p-2.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors flex items-center gap-2 font-bold"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Usar categoría nueva: <strong>"{searchQuery.trim()}"</strong></span>
            </button>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const isSelected = value.toLowerCase().trim() === opt.toLowerCase().trim();
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left p-2.5 text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'hover:bg-slate-800/70 text-slate-200'
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })
          ) : (
            !allowCustom && (
              <div className="p-3 text-center text-xs text-slate-500 italic">
                No hay opciones que coincidan
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
