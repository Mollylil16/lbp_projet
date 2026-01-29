/**
 * Utilitaires pour exporter les graphiques Recharts
 */

/**
 * Convertit un SVG en image (PNG)
 */
export const svgToPng = (svgElement: SVGElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          const pngUrl = canvas.toDataURL('image/png')
          URL.revokeObjectURL(svgUrl)
          resolve(pngUrl)
        } else {
          reject(new Error('Could not get canvas context'))
        }
      }

      img.onerror = (error) => {
        URL.revokeObjectURL(svgUrl)
        reject(error)
      }

      img.src = svgUrl
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Capture un élément HTML (graphique Recharts) en image
 */
export const captureElementAsImage = async (
  elementId: string,
  options: { backgroundColor?: string; scale?: number } = {}
): Promise<string> => {
  const { backgroundColor = 'white', scale = 2 } = options

  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`)
  }

  // Pour Recharts, on cherche le SVG dans l'élément
  const svgElement = element.querySelector('svg') as SVGElement
  if (svgElement) {
    // Cloner le SVG pour éviter de modifier l'original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement

    // S'assurer que le SVG a une taille définie
    const widthAttr = svgElement.getAttribute('width')
    const heightAttr = svgElement.getAttribute('height')
    const width = widthAttr ? Number(widthAttr) : (svgElement.clientWidth || 800)
    const height = heightAttr ? Number(heightAttr) : (svgElement.clientHeight || 600)

    clonedSvg.setAttribute('width', String(width * scale))
    clonedSvg.setAttribute('height', String(height * scale))
    clonedSvg.setAttribute('style', `background-color: ${backgroundColor}`)

    return svgToPng(clonedSvg)
  }

  // Fallback : utiliser html2canvas si disponible (nécessite l'installation)
  throw new Error('SVG element not found in the container')
}

/**
 * Convertit un canvas en image (utilisé pour Recharts)
 */
export const canvasToImage = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/png')
}

/**
 * Exporte un graphique Recharts depuis son conteneur ResponsiveContainer
 * En passant une ref au ResponsiveContainer, on peut capturer son SVG
 */
export const exportRechartsChart = async (
  containerRef: React.RefObject<HTMLDivElement>,
  chartTitle: string = 'Graphique'
): Promise<string> => {
  if (!containerRef.current) {
    throw new Error('Container ref is not available')
  }

  const svgElement = containerRef.current.querySelector('svg') as SVGElement
  if (!svgElement) {
    throw new Error('SVG element not found in the chart container')
  }

  return svgToPng(svgElement)
}
