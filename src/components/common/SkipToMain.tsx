/**
 * Composant "Skip to main content" pour l'accessibilité
 * Permet aux utilisateurs de clavier de sauter directement au contenu principal
 */

import React from 'react'
import './SkipToMain.css'

export const SkipToMain: React.FC<{ mainId?: string }> = ({ mainId = 'main-content' }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const mainElement = document.getElementById(mainId)
    if (mainElement) {
      mainElement.focus()
      mainElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <a href={`#${mainId}`} className="skip-to-main" onClick={handleClick}>
      Passer au contenu principal
    </a>
  )
}
