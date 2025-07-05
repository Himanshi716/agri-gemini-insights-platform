import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  placeholderSrc?: string
  lowQualitySrc?: string
  onLoad?: () => void
  onError?: () => void
}

export function ProgressiveImage({
  src,
  alt,
  className,
  placeholderSrc,
  lowQualitySrc,
  onLoad,
  onError,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || lowQualitySrc || '')

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Progressive loading logic
  useEffect(() => {
    if (!isInView) return

    const img = new Image()
    
    // Load low quality first
    if (lowQualitySrc && !placeholderSrc) {
      img.onload = () => {
        setCurrentSrc(lowQualitySrc)
        // Then load high quality
        loadHighQuality()
      }
      img.src = lowQualitySrc
    } else {
      loadHighQuality()
    }

    function loadHighQuality() {
      const highQualityImg = new Image()
      highQualityImg.onload = () => {
        setCurrentSrc(src)
        setIsLoaded(true)
        onLoad?.()
      }
      highQualityImg.onerror = () => {
        setHasError(true)
        onError?.()
      }
      highQualityImg.src = src
    }
  }, [isInView, src, lowQualitySrc, placeholderSrc, onLoad, onError])

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Failed to load image</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!isLoaded && (
        <Skeleton 
          className={cn(
            'absolute inset-0 z-10',
            isInView && 'animate-pulse'
          )} 
        />
      )}
      
      <img
        ref={imgRef}
        src={currentSrc || '/api/placeholder/400/300'}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        loading="lazy"
        decoding="async"
      />
      
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}

// Hook for progressive image loading
export function useProgressiveImage(src: string, lowQualitySrc?: string) {
  const [imgSrc, setImgSrc] = useState(lowQualitySrc || src)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImgSrc(src)
      setIsLoaded(true)
    }
    img.src = src
  }, [src])

  return { imgSrc, isLoaded }
}