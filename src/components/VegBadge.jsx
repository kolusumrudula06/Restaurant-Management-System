import React from 'react';

export const VegBadge = ({ isVegetarian, size = 'sm' }) => {
  const isSmall = size === 'sm';
  const boxClass = isSmall ? 'w-4 h-4 p-[2px]' : 'w-5 h-5 p-[2.5px]';
  const dotClass = isSmall ? 'w-2 h-2' : 'w-2.5 h-2.5';

  if (isVegetarian) {
    return (
      <span
        title="Vegetarian"
        className={`inline-flex items-center justify-center border-2 border-emerald-600 rounded-sm bg-white shadow-xs ${boxClass}`}
      >
        <span className={`rounded-full bg-emerald-600 ${dotClass}`} />
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className={`inline-flex items-center justify-center border-2 border-rose-600 rounded-sm bg-white shadow-xs ${boxClass}`}
    >
      <span className={`rounded-full bg-rose-600 ${dotClass}`} />
    </span>
  );
};

export default VegBadge;
