'use client';

import { MenuItem } from '@/types';

interface Props {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export default function MenuCard({ item, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(item)}
      className="menu-card group w-full text-left"
      aria-label={`Ver ${item.name}`}
    >
      {/* Emoji & category badge */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-4xl leading-none">{item.emoji}</span>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${
            item.category === 'hot'
              ? 'bg-amber-fire/20 text-amber-fire border border-amber-fire/30'
              : 'bg-forest-medium/20 text-forest-light border border-forest-medium/30'
          }`}
        >
          {item.category === 'hot' ? 'Caliente' : 'Frío'}
        </span>
      </div>

      {/* Name */}
      <h3 className="font-playfair text-lg font-bold text-wood-pale mb-1 group-hover:text-amber-glow transition-colors">
        {item.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-stone-light leading-relaxed mb-4 line-clamp-2">
        {item.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-wood-medium/40 text-stone-pale capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="font-playfair text-xl font-bold text-amber-glow">
          ${item.price}
        </span>
      </div>
    </button>
  );
}
