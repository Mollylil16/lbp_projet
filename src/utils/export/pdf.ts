import jsPDF from 'jspdf'
// @ts-ignore - jspdf-autotable n'a pas de types officiels
import autoTable from 'jspdf-autotable'
import type { TableData } from './types'

export interface PDFExportOptions {
  title?: string
  orientation?: 'portrait' | 'landscape'
  fontSize?: number
  headerColor?: [number, number, number]
  headerTextColor?: [number, number, number]
}

/**
 * Exporte des données tabulaires en PDF
 */
export const exportTableToPDF = (
  data: TableData,
  filename: string = 'export',
  options: PDFExportOptions = {}
) => {
  const {
    title = 'Export',
    orientation = 'portrait',
    fontSize = 10,
    headerColor = [52, 73, 94],
    headerTextColor = [255, 255, 255],
  } = options

  const doc = new jsPDF(orientation)

  // Ajouter le titre
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(title, 14, 20)

  // Ajouter la date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  const date = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  doc.text(`Généré le : ${date}`, 14, 30)

  // Ajouter le tableau
  autoTable(doc, {
    head: [data.headers],
    body: data.rows,
    startY: 40,
    styles: {
      fontSize: fontSize,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: headerColor,
      textColor: headerTextColor,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 40 },
  })

  // Sauvegarder le fichier
  doc.save(`${filename}_${Date.now()}.pdf`)
}

/**
 * Exporte un graphique en PDF (image)
 */
export const exportChartToPDF = (
  chartImage: string | HTMLCanvasElement,
  filename: string = 'graphique',
  title?: string
) => {
  const doc = new jsPDF('landscape', 'mm', 'a4')
  const imgWidth = 280
  const imgHeight = 180

  // Ajouter le titre si fourni
  if (title) {
    doc.setFontSize(16)
    doc.text(title, 14, 20)
    doc.setFontSize(10)
    doc.text(
      `Généré le : ${new Date().toLocaleDateString('fr-FR')}`,
      14,
      30
    )
  }

  let imgData: string

  if (typeof chartImage === 'string') {
    imgData = chartImage
  } else {
    imgData = chartImage.toDataURL('image/png')
  }

  doc.addImage(imgData, 'PNG', 14, title ? 35 : 14, imgWidth, imgHeight)
  doc.save(`${filename}_${Date.now()}.pdf`)
}

/**
 * Exporte un dashboard complet en PDF avec plusieurs graphiques
 */
export const exportDashboardToPDF = (
  charts: Array<{ image: string; title: string }>,
  filename: string = 'dashboard'
) => {
  const doc = new jsPDF('landscape', 'mm', 'a4')
  const imgWidth = 280
  const imgHeight = 180

  charts.forEach((chart, index) => {
    if (index > 0) {
      doc.addPage()
    }

    // Titre
    doc.setFontSize(16)
    doc.text(chart.title, 14, 20)

    // Date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Généré le : ${new Date().toLocaleDateString('fr-FR')}`,
      14,
      30
    )

    // Graphique
    doc.addImage(chart.image, 'PNG', 14, 35, imgWidth, imgHeight)
  })

  doc.save(`${filename}_${Date.now()}.pdf`)
}
