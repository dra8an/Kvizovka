/**
 * Online Game Component (Wrapper)
 *
 * This component detects the device type and renders the appropriate
 * layout component:
 * - Desktop: DesktopOnlineGame (3-column layout with scoresheet, chat)
 * - Mobile: MobileOnlineGame (vertical stack, simplified UI)
 *
 * The mobile detection is based on:
 * - Touch support (ontouchstart or maxTouchPoints)
 * - Screen width (< 768px considered mobile)
 */

import { useIsMobile } from '../../utils/device-detection'
import { DesktopOnlineGame } from './DesktopOnlineGame'
import { MobileOnlineGame } from './MobileOnlineGame'

export function OnlineGame() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileOnlineGame />
  }

  return <DesktopOnlineGame />
}
