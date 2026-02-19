import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Exporter une liste de colis en PDF
 */
export const exportColisToPDF = (colis: any[], title: string = 'Liste des Colis') => {
    const doc = new jsPDF();

    // Titre
    doc.setFontSize(16);
    doc.text(title, 14, 20);

    // Date d'export
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

    // Tableau
    const tableData = colis.map((c) => [
        c.ref_colis,
        c.client?.nom_exp || '-',
        c.nom_dest,
        new Date(c.date_envoi).toLocaleDateString('fr-FR'),
        c.etat_validation === 1 ? 'Validé' : 'Brouillon',
    ]);

    autoTable(doc, {
        head: [['Référence', 'Client', 'Destination', 'Date', 'Statut']],
        body: tableData,
        startY: 35,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`colis-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporter une liste de factures en PDF
 */
export const exportFacturesToPDF = (factures: any[], title: string = 'Liste des Factures') => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(title, 14, 20);

    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

    const tableData = factures.map((f) => [
        f.num_facture,
        f.colis?.ref_colis || '-',
        f.colis?.client?.nom_exp || '-',
        `${f.montant_ttc?.toLocaleString()} FCFA`,
        `${f.montant_paye?.toLocaleString()} FCFA`,
        f.etat === 0 ? 'Proforma' : f.etat === 1 ? 'Définitive' : 'Annulée',
    ]);

    autoTable(doc, {
        head: [['N° Facture', 'Colis', 'Client', 'Montant TTC', 'Payé', 'Statut']],
        body: tableData,
        startY: 35,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [46, 204, 113] },
    });

    doc.save(`factures-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Exporter un rapport de caisse en Excel
 */
export const exportCaisseToExcel = (
    mouvements: any[],
    rapport: any,
    filename: string = 'rapport-caisse'
) => {
    const wb = XLSX.utils.book_new();

    // Feuille 1: Résumé
    const summaryData = [
        ['RAPPORT DE CAISSE'],
        ['Date', new Date().toLocaleDateString('fr-FR')],
        [],
        ['RÉSUMÉ'],
        ['Solde initial', `${rapport?.solde_initial || 0} FCFA`],
        ['Total entrées', `${rapport?.total_entrees || 0} FCFA`],
        ['Total sorties', `${rapport?.total_sorties || 0} FCFA`],
        ['Solde final', `${rapport?.solde_final || 0} FCFA`],
        [],
        ['DÉTAILS PAR TYPE'],
        ['Entrées espèces', `${rapport?.entrees_espece || 0} FCFA`],
        ['Entrées chèques', `${rapport?.entrees_cheque || 0} FCFA`],
        ['Entrées virements', `${rapport?.entrees_virement || 0} FCFA`],
        ['Approvisionnements', `${rapport?.appros || 0} FCFA`],
        ['Décaissements', `${rapport?.decaissements || 0} FCFA`],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');

    // Feuille 2: Mouvements détaillés
    const mouvementsData = mouvements.map((m) => ({
        Date: new Date(m.date_mouvement).toLocaleDateString('fr-FR'),
        Type: m.type_mouvement,
        Libellé: m.libelle,
        'Mode Règlement': m.mode_reglement || '-',
        Client: m.nom_client || '-',
        'N° Dossier': m.num_dossier || '-',
        Montant: m.montant,
        Utilisateur: m.code_user,
    }));

    const wsMovements = XLSX.utils.json_to_sheet(mouvementsData);
    XLSX.utils.book_append_sheet(wb, wsMovements, 'Mouvements');

    // Télécharger
    XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exporter des données génériques en Excel
 */
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Données') => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Exporter des données génériques en CSV
 */
export const exportToCSV = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
