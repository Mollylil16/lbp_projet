import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Facture } from './entities/facture.entity';
import { Colis } from '../colis/entities/colis.entity';
import { LienPaiement, LienPaiementStatut } from '../paiements/entities/lien-paiement.entity';

@Injectable()
export class FacturesService {
    constructor(
        @InjectRepository(Facture)
        private factureRepository: Repository<Facture>,
        @InjectRepository(Colis)
        private colisRepository: Repository<Colis>,
        @InjectRepository(LienPaiement)
        private lienRepository: Repository<LienPaiement>,
        private dataSource: DataSource,
    ) { }

    async createProforma(colis: Colis, userId: string): Promise<Facture> {
        const numFacture = await this.generateReference();

        // Calcul des montants basés sur les marchandises du colis
        let montantHT = 0;
        if (colis.marchandises) {
            montantHT = colis.marchandises.reduce((acc, m) => {
                // ✅ CORRECTION: Utiliser nbre_colis au lieu de nbre_articles
                const totalLigne =
                    Number(m.prix_unit) * Number(m.nbre_colis) +
                    Number(m.prix_emballage || 0) +
                    Number(m.prix_assurance || 0) +
                    Number(m.prix_agence || 0);
                return acc + totalLigne;
            }, 0);
        }

        const agencyCurrency = colis.agence?.devise || 'XOF';

        const facture = this.factureRepository.create({
            num_facture: numFacture,
            colis: colis,
            montant_ht: montantHT,
            montant_ttc: montantHT,
            montant_paye: 0,
            etat: 0,
            devise: agencyCurrency,
            taux_change: 1, // Par défaut 1, sera ajustable par l'IA ou admin
            date_facture: new Date(),
            code_user: userId,
        });

        return await this.factureRepository.save(facture);
    }

    private async generateReference(): Promise<string> {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yy = String(now.getFullYear()).slice(-2);
        const datePart = `${mm}${yy}`;

        const lastFacture = await this.factureRepository
            .createQueryBuilder('facture')
            .where('facture.num_facture LIKE :pattern', { pattern: `FCO-${datePart}-%` })
            .orderBy('facture.id', 'DESC')
            .getOne();

        let nextNumber = 1;
        if (lastFacture) {
            const lastRef = lastFacture.num_facture;
            const parts = lastRef.split('-');
            const lastNum = parseInt(parts[2], 10);
            nextNumber = lastNum + 1;
        }

        const numPart = String(nextNumber).padStart(3, '0');
        return `FCO-${datePart}-${numPart}`;
    }

    async findAll(agenceId?: number): Promise<Facture[]> {
        const where: any = {};
        if (agenceId) {
            where.colis = { agence: { id: agenceId } };
        }
        return this.factureRepository.find({
            where,
            relations: ['colis', 'colis.client'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Facture> {
        const facture = await this.factureRepository.findOne({
            where: { id },
            relations: ['colis', 'colis.client', 'colis.marchandises'],
        });
        if (!facture) {
            throw new NotFoundException(`Facture #${id} not found`);
        }
        return facture;
    }

    async validateProforma(id: number): Promise<Facture> {
        const facture = await this.findOne(id);
        facture.etat = 1; // Définitive
        return await this.factureRepository.save(facture);
    }

    async findByColisRef(refColis: string): Promise<Facture | null> {
        return this.factureRepository.findOne({
            where: { colis: { ref_colis: refColis } },
            relations: ['colis', 'colis.client'],
        });
    }

    async cancelFacture(id: number): Promise<void> {
        const facture = await this.findOne(id);
        facture.etat = 2; // Annulée
        await this.factureRepository.save(facture);
    }

    /**
     * ✅ AJOUT: Générer une facture depuis un colis
     */
    async generateFromColis(colisId: number, userId: string): Promise<Facture> {
        // Vérifier que le colis existe
        const colis = await this.colisRepository.findOne({
            where: { id: colisId },
            relations: ['client', 'marchandises'],
        });

        if (!colis) {
            throw new NotFoundException(`Colis #${colisId} not found`);
        }

        // Vérifier qu'il n'existe pas déjà une facture pour ce colis
        const existingFacture = await this.factureRepository.findOne({
            where: { colis: { id: colisId } },
        });

        if (existingFacture) {
            throw new BadRequestException(
                `Une facture existe déjà pour ce colis (${existingFacture.num_facture})`
            );
        }

        // Créer la facture proforma
        return await this.createProforma(colis, userId);
    }

    /**
     * ✅ AMÉLIORATION: Génération PDF réelle avec PDFKit
     */
    /**
     * ✅ AMÉLIORATION: Génération PDF réelle avec PDFKit et images
     */
    async generatePDF(id: number): Promise<Buffer> {
        const facture = await this.findOne(id);
        const PDFDocument = require('pdfkit');
        const QRCode = require('qrcode');
        const path = require('path');
        const fs = require('fs');

        return new Promise(async (resolve, reject) => {
            try {
                // Création du document A4 sans marges par défaut pour laisser les images remplir le bord si besoin
                // Mais on garde des marges pour le texte
                const doc = new PDFDocument({ margin: 0, size: 'A4' });
                const chunks: Buffer[] = [];

                doc.on('data', (chunk: Buffer) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Couleurs de la charte
                const PRIMARY_COLOR = '#1A365D';
                const SECONDARY_COLOR = '#3182CE';
                const ACCENT_COLOR = '#E53E3E';
                const GRAY_LIGHT = '#F7FAFC';
                const GRAY_DARK = '#4A5568';

                const trackingUrl = `https://labelleporte.net/track/${facture.colis.ref_colis}`;

                const publicDir = path.join(process.cwd(), '..', 'public');
                const headerPath = path.join(publicDir, 'images', 'entete_lbp.png');
                const footerPath = path.join(publicDir, 'images', 'footer_lbp.png');

                // --- HEADER IMAGE ---
                let contentStartY = 50;
                if (fs.existsSync(headerPath)) {
                    // Utiliser l'image d'en-tête sur toute la largeur, en conservant le ratio
                    doc.image(headerPath, 0, 0, { width: doc.page.width, height: 120 });
                    contentStartY = 140; // Ajuster selon la hauteur réelle de votre image
                } else {
                    // Fallback si pas d'image
                    doc.rect(0, 0, doc.page.width, 100).fill(GRAY_LIGHT);
                    doc.fontSize(24).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('LBP LOGISTICS', 40, 40);
                    contentStartY = 120;
                }

                // Bloc Facture (en haut à droite pour ne pas gaspiller de place)
                const invoiceBoxX = 400;
                const invoiceBoxY = contentStartY + 10;
                doc.roundedRect(invoiceBoxX, invoiceBoxY, 160, 80, 5).lineWidth(0).fill('#FFFFFF');
                doc.rect(invoiceBoxX, invoiceBoxY, 5, 80).fill(PRIMARY_COLOR);

                doc.fontSize(10).font('Helvetica-Bold').fillColor(SECONDARY_COLOR).text('FACTURE N°', invoiceBoxX + 15, invoiceBoxY + 10);
                doc.fontSize(14).fillColor(PRIMARY_COLOR).text(facture.num_facture, invoiceBoxX + 15, invoiceBoxY + 25);

                doc.fontSize(9).font('Helvetica').fillColor(GRAY_DARK).text('Date:', invoiceBoxX + 15, invoiceBoxY + 50);
                doc.font('Helvetica-Bold').text(new Date(facture.date_facture).toLocaleDateString('fr-FR'), invoiceBoxX + 45, invoiceBoxY + 50);

                doc.fontSize(9).font('Helvetica').fillColor(GRAY_DARK).text('Statut:', invoiceBoxX + 15, invoiceBoxY + 65);
                const statutText = facture.etat === 0 ? 'PROFORMA' : facture.etat === 1 ? 'PAYÉE - DÉFINITIVE' : 'ANNULÉE';
                const statutColor = facture.etat === 1 ? '#38A169' : ACCENT_COLOR;
                doc.fillColor(statutColor).text(statutText, invoiceBoxX + 45, invoiceBoxY + 65);

                // --- INFO CLIENTS ---
                const baseY = contentStartY + 60;
                doc.font('Helvetica');

                // Boite Expéditeur
                doc.roundedRect(40, baseY, 240, 90, 4).lineWidth(1).strokeColor('#E2E8F0').stroke();
                doc.rect(40, baseY, 240, 25).fill('#EBF8FF');
                doc.fontSize(10).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('EXPÉDITEUR', 50, baseY + 8);

                doc.font('Helvetica').fontSize(10).fillColor('#2D3748');
                doc.text(facture.colis.client.nom_exp.substring(0, 35), 50, baseY + 35);
                doc.fontSize(9).fillColor(GRAY_DARK);
                doc.text(facture.colis.client.tel_exp, 50, baseY + 50);
                if (facture.colis.client.email_exp) doc.text(facture.colis.client.email_exp, 50, baseY + 63);

                // Boite Destinataire
                doc.roundedRect(300, baseY, 250, 90, 4).lineWidth(1).strokeColor('#E2E8F0').stroke();
                doc.rect(300, baseY, 250, 25).fill('#EBF8FF');
                doc.fontSize(10).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('DESTINATAIRE', 310, baseY + 8);

                doc.font('Helvetica').fontSize(10).fillColor('#2D3748');
                doc.text(facture.colis.nom_dest, 310, baseY + 35);
                doc.text(facture.colis.lieu_dest || 'Destination inconnue', 310, baseY + 50);
                doc.fontSize(9).fillColor(GRAY_DARK).text(facture.colis.tel_dest, 310, baseY + 65);

                // --- INFO COLIS ---
                const colisY = baseY + 110;
                doc.fontSize(11).font('Helvetica-Bold').fillColor(PRIMARY_COLOR).text('DÉTAILS DU COLIS', 40, colisY);
                doc.moveTo(40, colisY + 15).lineTo(550, colisY + 15).lineWidth(1).strokeColor(SECONDARY_COLOR).stroke();

                doc.fontSize(10).font('Helvetica').fillColor(GRAY_DARK);
                doc.text(`Réf. Colis : ${facture.colis.ref_colis}`, 40, colisY + 25);
                doc.text(`Envoi : ${facture.colis.mode_envoi} - ${new Date(facture.colis.date_envoi).toLocaleDateString()}`, 250, colisY + 25);

                // --- TABLEAU MARCHANDISES ---
                const tableTop = colisY + 50;
                const col1 = 40;
                const col2 = 250;
                const col3 = 300;
                const col4 = 400;
                const col5 = 480;

                doc.rect(40, tableTop, 510, 25).fill(PRIMARY_COLOR);
                doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
                doc.text('DÉSIGNATION', col1 + 10, tableTop + 8);
                doc.text('QTÉ', col2, tableTop + 8);
                doc.text('PRIX UNIT.', col3, tableTop + 8);
                doc.text('FRAIS', col4, tableTop + 8);
                doc.text('TOTAL', col5, tableTop + 8);

                let y = tableTop + 30;
                const currency = facture.devise || 'XOF';
                let rowIndex = 0;

                doc.font('Helvetica').fontSize(9).fillColor('#2D3748');

                facture.colis.marchandises.forEach((m: any) => {
                    if (rowIndex % 2 === 0) {
                        doc.rect(40, y - 5, 510, 20).fill(GRAY_LIGHT);
                    }
                    doc.fillColor('#2D3748');

                    const nomMarchandise = m.nom_marchandise || 'Marchandise diverse';
                    const totalLigne =
                        Number(m.prix_unit) * Number(m.nbre_colis) +
                        Number(m.prix_emballage || 0) +
                        Number(m.prix_assurance || 0) +
                        Number(m.prix_agence || 0);

                    const frais = Number(m.prix_emballage || 0) + Number(m.prix_assurance || 0) + Number(m.prix_agence || 0);

                    doc.text(nomMarchandise.substring(0, 35), col1 + 10, y);
                    doc.text(m.nbre_colis.toString(), col2, y);
                    doc.text(`${m.prix_unit}`, col3, y);
                    doc.text(`${frais}`, col4, y);
                    doc.font('Helvetica-Bold').text(`${totalLigne}`, col5, y);
                    doc.font('Helvetica');

                    y += 20;
                    rowIndex++;

                    if (y > 620) { // Un peu plus tôt pour laisser de la place au footer
                        doc.addPage();
                        y = 50;
                    }
                });

                doc.moveTo(40, y).lineTo(550, y).strokeColor('#E2E8F0').stroke();

                // --- TOTAUX ---
                y += 20;
                const totalsX = 350;
                const valuesX = 470; // Réduit de 480 à 470 pour plus de marge
                const valueWidth = 80; // Largeur fixe pour l'alignement à droite

                doc.font('Helvetica').fontSize(10).fillColor(GRAY_DARK);
                doc.text('Total HT', totalsX, y);
                doc.text(`${facture.montant_ht} ${currency}`, valuesX, y, { width: valueWidth, align: 'right' });
                y += 20;

                doc.text('Total TTC', totalsX, y);
                doc.font('Helvetica-Bold').fontSize(12).fillColor(PRIMARY_COLOR);
                doc.text(`${facture.montant_ttc} ${currency}`, valuesX, y - 2, { width: valueWidth, align: 'right' });
                y += 30; // Augmenté de 25 à 30 pour plus d'espace

                // Pavé "A PAYER" avec marges améliorées
                doc.roundedRect(totalsX - 10, y, 200, 45, 5).fill(GRAY_LIGHT); // Largeur réduite de 210 à 200
                const reste = Number(facture.montant_ttc) - Number(facture.montant_paye);
                const isPaid = reste <= 0;
                doc.fillColor(isPaid ? '#38A169' : ACCENT_COLOR).font('Helvetica-Bold').fontSize(11);
                doc.text(isPaid ? 'SOLDE PAYÉ' : 'RESTE À PAYER', totalsX, y + 12);
                doc.fontSize(14).text(`${reste} ${currency}`, valuesX, y + 12, { width: valueWidth, align: 'right' });

                // --- FOOTER IMAGE & QR ---
                // S'assurer qu'il y a assez d'espace avant le footer
                y += 60; // Espace après le bloc "RESTE À PAYER"
                const minFooterY = Math.max(y, doc.page.height - 150); // Position minimum du footer
                const footerY = minFooterY;

                // QR Code Suivi - Redirige vers labelleporte.net
                const qrCodeBuffer = await QRCode.toBuffer(trackingUrl, {
                    errorCorrectionLevel: 'H',
                    margin: 1,
                    width: 80,
                    color: { dark: PRIMARY_COLOR, light: '#FFFFFF' }
                });
                doc.image(qrCodeBuffer, 50, footerY - 20, { width: 70 }); // Ajusté de -30 à -20
                doc.fontSize(8).font('Helvetica').fillColor(GRAY_DARK).text('Suivre mon colis', 45, footerY + 55, { width: 80, align: 'center' });

                // Zone QR Code Paiement (si dispo)
                const activeLien = await this.lienRepository.findOne({
                    where: {
                        facture: { id: facture.id },
                        statut: LienPaiementStatut.EN_ATTENTE
                    },
                    order: { created_at: 'DESC' }
                });

                if (activeLien) {
                    const payUrl = `https://labelleporte.net/pay/${activeLien.token}`;
                    const payQrBuffer = await QRCode.toBuffer(payUrl, {
                        errorCorrectionLevel: 'M',
                        margin: 1,
                        width: 80,
                        color: { dark: '#DD6B20', light: '#FFFFFF' }
                    });
                    doc.image(payQrBuffer, 150, footerY - 20, { width: 70 }); // Ajusté de -30 à -20
                    doc.text('Payer en ligne', 145, footerY + 55, { width: 80, align: 'center' });
                }

                // Footer Banner - positionné plus bas pour éviter le chevauchement
                if (fs.existsSync(footerPath)) {
                    doc.image(footerPath, 0, footerY + 70, { width: doc.page.width, height: 60 }); // Ajusté de +10 à +70, hauteur de 80 à 60
                } else {
                    doc.fontSize(7).fillColor('#A0AEC0');
                    const footerTextFallback = "LBP LOGISTICS - SARL au capital de 1.000.000 FCFA - CC: 1234567 A - Siège: Abidjan, Cocody\nCe document est une facture électronique générée automatiquement.";
                    doc.text(footerTextFallback, 0, footerY + 80, { align: 'center', width: doc.page.width });
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
}
