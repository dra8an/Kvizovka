/**
 * Device Detection Utilities
 *
 * Utilities for detecting device type, touch support, and screen size.
 * Used to provide different layouts and interactions for mobile vs desktop.
 */

/**
 * Check if the device supports touch events
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Check if the screen is considered "small" (mobile phone)
 * Uses 768px as the breakpoint (matches Tailwind's md breakpoint)
 */
export function isSmallScreen(): boolean {
  return window.innerWidth < 768
}

/**
 * Check if the device should use mobile layout
 * Returns true if it's a touch device AND has a small screen
 */
export function isMobileDevice(): boolean {
  return isTouchDevice() && isSmallScreen()
}

/**
 * Get the current device type
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function getDeviceType(): DeviceType {
  const width = window.innerWidth
  const isTouch = isTouchDevice()

  if (isTouch && width < 768) {
    return 'mobile'
  } else if (isTouch && width < 1024) {
    return 'tablet'
  }
  return 'desktop'
}

/**
 * Check if device is in landscape orientation
 */
export function isLandscape(): boolean {
  return window.innerWidth > window.innerHeight
}

/**
 * React hook for responsive device detection
 * Re-renders when device type changes (e.g., window resize)
 */
import { useState, useEffect } from 'react'

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType())

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceType
}

export function useIsMobile(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'mobile'
}

export function useIsLandscape(): boolean {
  const [landscape, setLandscape] = useState<boolean>(isLandscape())

  useEffect(() => {
    const handleResize = () => {
      setLandscape(isLandscape())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return landscape
}
