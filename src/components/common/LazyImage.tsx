/**
 * Composant Image avec lazy loading et placeholder blur-up
 * Optimise le chargement des images
 */

import React, { useState, useEffect, useRef } from 'react'
import { Skeleton } from 'antd'
import './LazyImage.css'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string // URL de l'image placeholder (petite, blur)
  fallback?: string // URL de fallback en cas d'erreur
  loading?: 'lazy' | 'eager'
  onError?: () => void
  skeleton?: boolean // Afficher un skeleton pendant le chargement
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  fallback,
  loading = 'lazy',
  skeleton = true,
  onError,
  className = '',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // Si on a un placeholder, charger d'abord l'image complète
    if (placeholder && imageSrc === placeholder) {
      const img = new Image()
      img.src = src

      img.onload = () => {
        setImageSrc(src)
        setIsLoading(false)
      }

      img.onerror = () => {
        if (fallback) {
          setImageSrc(fallback)
        } else {
          setHasError(true)
        }
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [src, placeholder, fallback, imageSrc])

  const handleError = () => {
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback)
    } else {
      setHasError(true)
      if (onError) {
        onError()
      }
    }
  }

  if (hasError) {
    return (
      <div className={`lazy-image-error ${className}`} {...props}>
        <span className="error-icon">🖼️</span>
        <span className="error-text">Image non disponible</span>
      </div>
    )
  }

  return (
    <div className={`lazy-image-container ${className}`}>
      {isLoading && skeleton && (
        <Skeleton.Image
          active
          style={{ width: '100%', height: '100%' }}
          className="lazy-image-skeleton"
        />
      )}

      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        onLoad={() => setIsLoading(false)}
        className={`lazy-image ${isLoading ? 'loading' : 'loaded'} ${className}`}
        {...props}
      />
    </div>
  )
}
