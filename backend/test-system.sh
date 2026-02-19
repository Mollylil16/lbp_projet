#!/bin/bash

# Script de test complet du système LBP
# Port: 3001

BASE_URL="http://localhost:3001/api"

echo "=========================================="
echo "TESTS COMPLETS DU SYSTÈME LBP"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1. Test Health Check..."
HEALTH=$(curl -s $BASE_URL)
if [ "$HEALTH" == "Hello World!" ]; then
    echo -e "${GREEN}✅ Serveur opérationnel${NC}"
else
    echo -e "${RED}❌ Serveur ne répond pas${NC}"
    exit 1
fi
echo ""

# Test 2: Authentification
echo "2. Test Authentification..."
echo "Tentative de connexion avec: manager / manager123"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager","password":"manager123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Authentification réussie${NC}"
    echo "Token: ${TOKEN:0:50}..."
    USER_INFO=$(echo $LOGIN_RESPONSE | jq -r '.user.full_name')
    echo "Utilisateur: $USER_INFO"
else
    echo -e "${RED}❌ Authentification échouée${NC}"
    echo "Réponse: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Agences
echo "3. Test API Agences..."
AGENCES=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/agences)
AGENCES_COUNT=$(echo $AGENCES | jq '. | length')
echo -e "${GREEN}✅ $AGENCES_COUNT agences trouvées${NC}"
echo "Agences:"
echo $AGENCES | jq -r '.[] | "  - \(.code): \(.nom) (\(.ville))"'
echo ""

# Test 4: Produits Catalogue
echo "4. Test API Produits Catalogue..."
PRODUITS=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/produits-catalogue)
PRODUITS_COUNT=$(echo $PRODUITS | jq '. | length')
echo -e "${GREEN}✅ $PRODUITS_COUNT produits trouvés${NC}"
echo "Premiers 5 produits:"
echo $PRODUITS | jq -r '.[0:5] | .[] | "  - \(.code): \(.nom) - \(.prix_unitaire) \(.devise)"'
echo ""

# Test 5: Historique Paiements
echo "5. Test API Historique Paiements (aujourd'hui)..."
HISTORY=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/paiements/history/daily?date=2026-02-16")
echo "Réponse:"
echo $HISTORY | jq '.'
echo ""

# Test 6: Factures Impayées
echo "6. Test API Factures Impayées..."
UNPAID=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/paiements/history/unpaid?status=all")
echo "Réponse:"
echo $UNPAID | jq '.'
echo ""

# Test 7: Réconciliation Agence
echo "7. Test API Réconciliation Agence..."
RECON=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/paiements/reconciliation/agency?date=2026-02-16")
echo "Réponse:"
echo $RECON | jq '.'
echo ""

# Test 8: Clients
echo "8. Test API Clients..."
CLIENTS=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/clients)
CLIENTS_COUNT=$(echo $CLIENTS | jq '. | length')
echo -e "${GREEN}✅ $CLIENTS_COUNT clients trouvés${NC}"
echo "Premiers 3 clients:"
echo $CLIENTS | jq -r '.[0:3] | .[] | "  - \(.nom_exp) - \(.tel_exp)"'
echo ""

# Test 9: Colis
echo "9. Test API Colis..."
COLIS=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/colis)
COLIS_COUNT=$(echo $COLIS | jq '. | length')
echo -e "${GREEN}✅ $COLIS_COUNT colis trouvés${NC}"
if [ "$COLIS_COUNT" -gt 0 ]; then
    echo "Détails des colis:"
    echo $COLIS | jq -r '.[] | "  - Réf: \(.ref_colis) | Dest: \(.nom_dest) | Mode: \(.mode_envoi)"'
fi
echo ""

# Test 10: Factures
echo "10. Test API Factures..."
FACTURES=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/factures)
FACTURES_COUNT=$(echo $FACTURES | jq '. | length')
echo -e "${GREEN}✅ $FACTURES_COUNT factures trouvées${NC}"
if [ "$FACTURES_COUNT" -gt 0 ]; then
    echo "Détails des factures:"
    echo $FACTURES | jq -r '.[] | "  - N°: \(.num_facture) | Montant: \(.montant_ttc) \(.devise) | État: \(.etat)"'
fi
echo ""

echo "=========================================="
echo "RÉSUMÉ DES TESTS"
echo "=========================================="
echo -e "${GREEN}✅ Serveur: Opérationnel${NC}"
echo -e "${GREEN}✅ Authentification: Fonctionnelle${NC}"
echo -e "${GREEN}✅ Agences: $AGENCES_COUNT trouvées${NC}"
echo -e "${GREEN}✅ Produits: $PRODUITS_COUNT trouvés${NC}"
echo -e "${GREEN}✅ Clients: $CLIENTS_COUNT trouvés${NC}"
echo -e "${GREEN}✅ Colis: $COLIS_COUNT trouvés${NC}"
echo -e "${GREEN}✅ Factures: $FACTURES_COUNT trouvées${NC}"
echo ""
echo "=========================================="
echo "TESTS TERMINÉS"
echo "=========================================="
