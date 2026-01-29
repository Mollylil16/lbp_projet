# 📄 CONFIGURATION TEMPLATE FACTURE - BACKEND

## 🎯 IMAGES À UTILISER

Le frontend LBP utilise deux images pour les factures :
- **En-tête**: `/public/images/entete_lbp.png`
- **Pied de page**: `/public/images/footer_lbp.png`

Ces images doivent être intégrées dans le template PDF généré côté backend (NestJS).

---

## 📋 STRUCTURE DU TEMPLATE FACTURE

### 1. **En-tête de facture**

L'en-tête doit afficher :
- Image `entete_lbp.png` (centrée, largeur max 100%)
- Type de facture : "FACTURE PROFORMA" ou "FACTURE DÉFINITIVE"
- Numéro de facture (ex: `FCO0124/001`)
- Date de facture

**Position dans le PDF :**
- Hauteur recommandée : 150px (à ajuster selon l'image)
- Marge top : 20px
- Centré horizontalement

---

### 2. **Corps de la facture**

**Informations facture :**
- N° Facture
- Date
- Référence Colis

**Informations expéditeur/destinataire :**
- Expéditeur (nom, téléphone, email)
- Destinataire (nom, lieu, téléphone, email)

**Tableau détail marchandise :**
- Description
- Quantité
- Unité (Colis)
- Poids (Kg)
- Prix unitaire
- Montant

**Totaux :**
- Montant HT
- TVA (si applicable)
- **Montant TTC** (en gras, couleur bleue, taille 16-24px)

---

### 3. **Pied de page**

Le pied de page doit afficher :
- Image `footer_lbp.png` (centrée, largeur max 100%)
- Informations complémentaires (conditions de paiement, validité)
- Date de génération et utilisateur

**Position dans le PDF :**
- Hauteur recommandée : 100px (à ajuster selon l'image)
- Marge bottom : 20px
- Centré horizontalement
- Position fixed en bas de page

---

## 🔧 CONFIGURATION BACKEND NESTJS

### Exemple avec Puppeteer ou jsPDF + html2canvas

```typescript
// facture.service.ts (Backend NestJS)

import * as path from 'path'
import * as fs from 'fs'

export class FactureService {
  private readonly IMAGES_PATH = {
    HEADER: path.join(process.cwd(), 'public', 'images', 'entete_lbp.png'),
    FOOTER: path.join(process.cwd(), 'public', 'images', 'footer_lbp.png'),
  }

  async generatePDF(facture: FactureColis, colis: Colis): Promise<Buffer> {
    // Vérifier que les images existent
    if (!fs.existsSync(this.IMAGES_PATH.HEADER)) {
      throw new Error('Image en-tête non trouvée: entete_lbp.png')
    }
    if (!fs.existsSync(this.IMAGES_PATH.FOOTER)) {
      throw new Error('Image pied de page non trouvée: footer_lbp.png')
    }

    // Générer le HTML du template
    const html = this.generateHTMLTemplate(facture, colis)

    // Convertir en PDF avec Puppeteer
    const pdf = await this.convertHTMLToPDF(html)

    return pdf
  }

  private generateHTMLTemplate(facture: FactureColis, colis: Colis): string {
    const headerImage = this.IMAGES_PATH.HEADER
    const footerImage = this.IMAGES_PATH.FOOTER

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px 40px;
            }
            .header {
              text-align: center;
              margin-bottom: 32px;
            }
            .header img {
              max-width: 100%;
              height: auto;
            }
            .footer {
              position: fixed;
              bottom: 20px;
              left: 0;
              right: 0;
              text-align: center;
              margin-top: 48px;
            }
            .footer img {
              max-width: 100%;
              height: auto;
            }
            /* ... autres styles ... */
          </style>
        </head>
        <body>
          <!-- En-tête -->
          <div class="header">
            <img src="${headerImage}" alt="En-tête LBP" />
            <div>${facture.etat === 0 ? 'FACTURE PROFORMA' : 'FACTURE DÉFINITIVE'}</div>
          </div>

          <!-- Corps de la facture -->
          <div class="content">
            <!-- Informations facture, colis, tableau, totaux -->
          </div>

          <!-- Pied de page -->
          <div class="footer">
            <img src="${footerImage}" alt="Pied de page LBP" />
          </div>
        </body>
      </html>
    `
  }

  private async convertHTMLToPDF(html: string): Promise<Buffer> {
    // Utiliser Puppeteer pour convertir HTML en PDF
    // ou jsPDF + html2canvas
    // ...
  }
}
```

---

## 📁 STRUCTURE DES FICHIERS

```
lbp-backend/
├── src/
│   ├── factures/
│   │   ├── facture.service.ts
│   │   ├── templates/
│   │   │   └── facture.hbs (ou facture.html)
│   │   └── facture.controller.ts
│   └── ...
├── public/
│   └── images/
│       ├── entete_lbp.png  ← Image en-tête
│       └── footer_lbp.png  ← Image pied de page
└── ...
```

---

## ✅ VÉRIFICATIONS

### Avant de générer le PDF

1. ✅ Vérifier que `entete_lbp.png` existe dans `/public/images/`
2. ✅ Vérifier que `footer_lbp.png` existe dans `/public/images/`
3. ✅ Vérifier les dimensions des images (recommandé: header 800x150px, footer 800x100px)
4. ✅ Tester l'affichage des images dans le PDF
5. ✅ Vérifier la position du footer (fixed en bas de page)

### Chemins des images

**Frontend (pour preview):**
- `/images/entete_lbp.png`
- `/images/footer_lbp.png`

**Backend (pour PDF):**
- `process.cwd() + '/public/images/entete_lbp.png'`
- `process.cwd() + '/public/images/footer_lbp.png'`

---

## 📝 NOTES IMPORTANTES

1. **Format des images**: PNG recommandé (avec transparence si nécessaire)
2. **Taille des images**: Optimiser pour le web (< 500KB chacune)
3. **Dimensions**: En-tête ~800x150px, Footer ~800x100px (à ajuster)
4. **Couleurs**: Respecter la charte graphique LBP (bleu #1890ff)
5. **Responsive**: Le template doit s'adapter au format A4

---

## 🚀 PROCHAINES ÉTAPES

1. **Backend NestJS:**
   - Installer Puppeteer ou jsPDF + html2canvas
   - Créer le service `FactureService` avec génération PDF
   - Intégrer les images en-tête et pied de page
   - Tester la génération PDF avec les images

2. **Frontend React:**
   - ✅ Template de preview créé (`FactureTemplate.tsx`)
   - ✅ Constantes créées (`constants/facture.ts`)
   - ✅ Intégration dans `FacturesListPage.tsx`
   - ⏳ Vérifier l'affichage des images dans le preview

3. **Tests:**
   - Tester la génération PDF avec différentes factures
   - Vérifier l'affichage des images
   - Tester l'impression
   - Vérifier le téléchargement PDF

---

**STATUS**: ✅ **TEMPLATE FRONTEND CRÉÉ** - ⏳ **BACKEND À IMPLÉMENTER**
