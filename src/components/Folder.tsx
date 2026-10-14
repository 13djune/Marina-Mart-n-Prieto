import React, { useState } from 'react';

interface FolderProps {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
}

/**
 * 100% Native Interactive Folder Component
 * Built from scratch with strict Mobile-First layout and hardcoded CSS properties (no CSS variables).
 */
export const Folder: React.FC<FolderProps> = ({
  color = '#5227FF',
  size = 1,
  items = [],
  className = '',
}) => {
  const maxItems = 3;
  const papers = items.slice(0, maxItems);
  while (papers.length < maxItems) {
    papers.push(null);
  }

  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  );

  const handleClick = () => {
    setOpen((prev) => !prev);
    if (open) {
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
    }
  };

  const handlePaperMouseMove = (e: React.MouseEvent, index: number) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperMouseLeave = (index: number) => {
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 };
      return newOffsets;
    });
  };

  // Fixed hardcoded color tones without CSS variables
  const backColor = color === '#5227FF' ? '#401ecc' : color;
  const paperColors = ['#e6e6e6', '#f2f2f2', '#ffffff'];

  return (
    <div
      className={`inline-block select-none touch-manipulation ${className}`}
      style={{
        transform: `scale(${size})`,
        transformOrigin: 'center',
      }}
    >
      <div
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-label={open ? 'Close folder' : 'Open folder'}
        className="relative cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white"
        style={{
          width: '100px',
          height: '80px',
        }}
      >
        {/* Folder Back with Tab */}
        <div
          className="relative w-[100px] h-[80px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]"
          style={{
            backgroundColor: backColor,
          }}
        >
          {/* Top Folder Tab */}
          <div
            className="absolute bottom-full left-0 w-[30px] h-[10px] rounded-t-[5px]"
            style={{
              backgroundColor: backColor,
            }}
          />

          {/* Stored Paper Sheets */}
          {papers.map((item, i) => {
            const paperWidth = i === 0 ? '70%' : i === 1 ? '80%' : '90%';
            const paperHeight = i === 0 ? '80%' : i === 1 ? '70%' : '60%';
            const openTransform =
              i === 0
                ? `translate(calc(-120% + ${paperOffsets[i]?.x || 0}px), calc(-70% + ${paperOffsets[i]?.y || 0}px)) rotate(-15deg)`
                : i === 1
                ? `translate(calc(10% + ${paperOffsets[i]?.x || 0}px), calc(-70% + ${paperOffsets[i]?.y || 0}px)) rotate(15deg)`
                : `translate(calc(-50% + ${paperOffsets[i]?.x || 0}px), calc(-100% + ${paperOffsets[i]?.y || 0}px)) rotate(5deg)`;

            return (
              <div
                key={i}
                onMouseMove={(e) => handlePaperMouseMove(e, i)}
                onMouseLeave={() => handlePaperMouseLeave(i)}
                className="absolute z-[2] bottom-[10%] left-1/2 rounded-[10px] overflow-hidden transition-all duration-300 shadow-md"
                style={{
                  width: paperWidth,
                  height: paperHeight,
                  backgroundColor: paperColors[i],
                  transform: open ? openTransform : 'translate(-50%, 10%)',
                }}
              >
                {item}
              </div>
            );
          })}

          {/* Folder Front Flap */}
          <div
            className="absolute inset-0 z-[3] rounded-tl-[5px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px] origin-bottom transition-all duration-300"
            style={{
              backgroundColor: color,
              transform: open ? 'skew(15deg) scaleY(0.6)' : 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Folder;
