import React from 'react';
import { getRarityShadowColor } from '../../utils/rarityConfig';

/**
 * TintedItemImage Component
 * 
 * Renders an item image with a colored tint based on its rarity.
 * Uses a drop-shadow technique with translation for the color overlay.
 */
interface TintedItemImageProps {
  src: string;
  alt: string;
  rarity?: string;
  className?: string;
}

const TintedItemImage: React.FC<TintedItemImageProps> = ({ 
  src, 
  alt, 
  rarity = '', 
  className = "w-full h-full" 
}) => {
  const shadowColor = getRarityShadowColor(rarity);
  const filterStyle = `drop-shadow(0px 1000px 0 ${shadowColor})`;

  return (
    <div className={`relative ${className}`}>
      {/* Original image (bottom layer) */}
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-contain absolute inset-0"
      />
      
      {/* Tinted image (top layer with opacity) */}
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-contain relative opacity-50"
        style={{ 
          filter: filterStyle,
          transform: 'translateY(-1000px)'
        }}
      />
    </div>
  );
};

export default TintedItemImage; 