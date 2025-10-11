import * as React from 'react'
import { MotionDiv } from './motion-wrapper'
import { cn } from '@/lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'default' | 'ai-prism' | 'outline'
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      xs: 'h-6 w-6',
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
      '2xl': 'h-20 w-20'
    }

    const variantClasses = {
      default: 'bg-silver/10 border border-silver/20',
      'ai-prism': 'bg-gradient-to-br from-prism-teal/10 to-lavender-mist/10 border-2 border-prism-teal/30 shadow-prism-glow',
      outline: 'border-2 border-silver/30 bg-transparent'
    }

    return (
      <MotionDiv
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        <div
          className={cn(
            'relative flex shrink-0 overflow-hidden rounded-full',
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
          ref={ref}
          {...props}
        />
      </MotionDiv>
    )
  }
)
Avatar.displayName = "Avatar"

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt = "", ...props }, ref) => (
    <img
      className={cn('aspect-square h-full w-full object-cover', className)}
      alt={alt}
      ref={ref}
      {...props}
    />
  )
)
AvatarImage.displayName = "AvatarImage"

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-prism-teal/20 to-lavender-mist/20 text-obsidian dark:text-pearl font-semibold',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

// Utility function to get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// AI Interview Platform specific avatar variants
export interface UserAvatarProps extends Omit<AvatarProps, 'children'> {
  src?: string
  name: string
  fallbackDelay?: number
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ src, name, fallbackDelay = 600, className, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [showFallback, setShowFallback] = React.useState(!src)

    React.useEffect(() => {
      if (!src) {
        setShowFallback(true)
        return
      }

      const timer = setTimeout(() => {
        if (!imageLoaded) {
          setShowFallback(true)
        }
      }, fallbackDelay)

      return () => clearTimeout(timer)
    }, [src, imageLoaded, fallbackDelay])

    return (
      <Avatar className={className} ref={ref} {...props}>
        {src && !showFallback && (
          <AvatarImage
            src={src}
            alt={name}
            onLoad={() => setImageLoaded(true)}
            onError={() => setShowFallback(true)}
          />
        )}
        {showFallback && (
          <AvatarFallback>
            {getInitials(name)}
          </AvatarFallback>
        )}
      </Avatar>
    )
  }
)
UserAvatar.displayName = "UserAvatar"

export { Avatar, AvatarImage, AvatarFallback, UserAvatar }