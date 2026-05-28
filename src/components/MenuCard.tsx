'use client';

import { MenuItem } from '@/types';
import { Flame, Snowflake, ChevronRight, Coffee, Droplets } from 'lucide-react';

interface Props {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  index?: number;
}

const CARD_IMAGES: Record<string, string> = {
  'americano-pino':    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&q=75',
  'latte-cabana':      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop&q=75',
  'cappuccino-sierra': 'https://images.unsplash.com/photo-1534687941688-651ccaafbff8?w=600&h=400&fit=crop&q=75',
  'taza-rica-montana': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&q=75',
  'miel-abeto':        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop&q=75',
  'mocha-cumbre':      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop&q=75',
  'cold-brew-bosque':  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop&q=75',
  'iced-latte-sierra': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop&q=75',
  'frappe-lena':       'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop&q=75',
  'cold-honey-haze':   'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop&q=75',
};

export default function MenuCard({ item, onSelect, index = 0 }: Props) {
  const imageUrl = CARD_IMAGES[item.id];
  const isHot = item.category === 'hot';

  return (
    <button
      onClick={() => onSelect(item)}
      className="menu-card group w-full text-left"
      aria-label={`Ver ${item.name}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Image header */}
      <div className="relative h-44 overflow-hidden flex-shrink-0">
        {/* Photo */}
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
        />
        {/* Category colour tint overlay */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            isHot
              ? 'bg-gradient-to-br from-amber-900/50 via-wood-warm/10 to-transparent'
              : 'bg-gradient-to-br from-forest-deep/65 via-forest-medium/10 to-transparent'
          }`}
        />
        {/* Bottom fade into card body */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-wood-deep to-transparent pointer-events-none" />

        {/* Category badge */}
        <div
          className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${
            isHot
              ? 'bg-wood-dark/60 text-amber-soft border-amber-fire/40'
              : 'bg-wood-dark/60 text-forest-light border-forest-light/40'
          }`}
        >
          {isHot ? <Flame size={11} /> : <Snowflake size={11} />}
          {isHot ? 'Caliente' : 'Frío'}
        </div>

        {/* Drink icon pill (bottom-left, overlapping content) */}
        <div
          className={`absolute bottom-3 left-4 w-9 h-9 rounded-xl flex items-center justify-center ${
            isHot
              ? 'bg-amber-fire/25 border border-amber-fire/40'
              : 'bg-forest-medium/35 border border-forest-light/35'
          }`}
        >
          {isHot
            ? <Coffee size={17} className="text-amber-glow" />
            : <Droplets size={17} className="text-forest-light" />
          }
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
        <h3 className="font-playfair text-lg font-bold text-wood-pale mb-1.5 group-hover:text-amber-glow transition-colors leading-tight">
          {item.name}
        </h3>
        <p className="text-sm text-stone-light leading-relaxed mb-4 line-clamp-2 flex-1">
          {item.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
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
          <ChevronRight
            size={15}
            className="text-stone-dark group-hover:text-amber-glow transition-colors flex-shrink-0"
          />
        </div>
      </div>
    </button>
  );
}
