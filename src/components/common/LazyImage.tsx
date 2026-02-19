/**
 * Composant image avec chargement différé (IntersectionObserver)
 * - Skeleton pendant le chargement
 * - Fallback sur erreur
 * - Support alt text obligatoire pour l'accessibilité
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './LazyImage.css';

interface LazyImageProps {
  src: string;
  alt: string;               // Obligatoire pour WCAG 1.1.1
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  /** Image affichée en cas d'erreur de chargement */
  fallbackSrc?: string;
  /** Déclencher le chargement avant que l'image entre dans le viewport */
  rootMargin?: string;
  /** Qualité de transition (true = fondu, false = instantané) */
  fade?: boolean;
  onClick?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  style,
  fallbackSrc,
  rootMargin = '200px',
  fade = true,
  onClick,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const startLoading = useCallback(() => {
    if (status !== 'idle') return;
    setStatus('loading');
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setStatus('loaded');
    };
    img.onerror = () => {
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setStatus('loaded');
      } else {
        setStatus('error');
      }
    };
  }, [src, fallbackSrc, status]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Si IntersectionObserver n'est pas disponible (vieux navigateurs), charger immédiatement
    if (!('IntersectionObserver' in window)) {
      startLoading();
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startLoading();
          observerRef.current?.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observerRef.current.observe(containerRef.current);

    return () => observerRef.current?.disconnect();
  }, [rootMargin, startLoading]);

  // Réinitialiser si le src change
  useEffect(() => {
    setStatus('idle');
    setCurrentSrc('');
  }, [src]);

  const containerStyle: React.CSSProperties = {
    width,
    height,
    display: 'inline-block',
    position: 'relative',
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`lazy-image-container ${className}`}
      style={containerStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Skeleton affiché pendant le chargement */}
      {(status === 'idle' || status === 'loading') && (
        <div
          className="lazy-image-skeleton"
          aria-hidden="true"
          style={{ width: '100%', height: '100%' }}
        />
      )}

      {/* Image chargée */}
      {status === 'loaded' && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={`lazy-image-img ${fade ? 'lazy-image-img--fade' : ''}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* État d'erreur sans fallback */}
      {status === 'error' && (
        <div
          className="lazy-image-error"
          role="img"
          aria-label={`Impossible de charger : ${alt}`}
        >
          <span aria-hidden="true">🖼️</span>
          <span className="lazy-image-error-text sr-only">{alt} — image non disponible</span>
        </div>
      )}
    </div>
  );
};
