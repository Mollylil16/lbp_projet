#!/bin/bash

# Script de test avec SUCCÈS et ÉCHECS pour évaluer la précision de l'IA
# Ce script teste intentionnellement des cas valides ET invalides

BASE_URL="http://localhost:3001/api"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "TESTS DE PRÉCISION DE L'IA"
echo "Scénarios de SUCCÈS et d'ÉCHEC"
echo "=========================================="
echo ""

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Fonction pour tester et afficher le résultat
test_endpoint() {
    local test_name="$1"
    local expected_result="$2"  # "SUCCESS" ou "FAIL"
    local http_code="$3"
    local response="$4"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo "Test #$TOTAL_TESTS: $test_name"
    echo "Attendu: $expected_result"
    
    if [ "$expected_result" == "SUCCESS" ]; then
        if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
            echo -e "${GREEN}✅ SUCCÈS - Code HTTP: $http_code${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ ÉCHEC INATTENDU - Code HTTP: $http_code${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        if [ "$http_code" -ge 400 ]; then
            echo -e "${GREEN}✅ ÉCHEC ATTENDU - Code HTTP: $http_code${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${RED}❌ SUCCÈS INATTENDU - Code HTTP: $http_code${NC}"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    fi
    
    echo "Réponse: $(echo $response | head -c 150)..."
    echo ""
}

echo "=========================================="
echo "PARTIE 1: TESTS D'AUTHENTIFICATION"
echo "=========================================="
echo ""

# Test 1: Authentification avec mauvais mot de passe (DOIT ÉCHOUER)
echo -e "${BLUE}Test 1: Authentification avec mauvais mot de passe${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager","password":"MAUVAIS_MDP"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Auth avec mauvais mot de passe" "FAIL" "$HTTP_CODE" "$BODY"

# Test 2: Authentification avec utilisateur inexistant (DOIT ÉCHOUER)
echo -e "${BLUE}Test 2: Authentification avec utilisateur inexistant${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"utilisateur_qui_nexiste_pas","password":"test123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Auth avec utilisateur inexistant" "FAIL" "$HTTP_CODE" "$BODY"

# Test 3: Authentification avec données manquantes (DOIT ÉCHOUER)
echo -e "${BLUE}Test 3: Authentification sans mot de passe${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Auth sans mot de passe" "FAIL" "$HTTP_CODE" "$BODY"

# Test 4: Authentification correcte (DOIT RÉUSSIR)
echo -e "${BLUE}Test 4: Authentification avec bonnes credentials${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager","password":"manager123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Auth avec bonnes credentials" "SUCCESS" "$HTTP_CODE" "$BODY"

# Extraire le token pour les tests suivants
TOKEN=$(echo $BODY | jq -r '.token')

echo "=========================================="
echo "PARTIE 2: TESTS D'AUTORISATION"
echo "=========================================="
echo ""

# Test 5: Accès sans token (DOIT ÉCHOUER)
echo -e "${BLUE}Test 5: Accès à une ressource protégée sans token${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" $BASE_URL/agences)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Accès sans token" "FAIL" "$HTTP_CODE" "$BODY"

# Test 6: Accès avec token invalide (DOIT ÉCHOUER)
echo -e "${BLUE}Test 6: Accès avec token invalide${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer TOKEN_INVALIDE_123" $BASE_URL/agences)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Accès avec token invalide" "FAIL" "$HTTP_CODE" "$BODY"

# Test 7: Accès avec token valide (DOIT RÉUSSIR)
echo -e "${BLUE}Test 7: Accès avec token valide${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" $BASE_URL/agences)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Accès avec token valide" "SUCCESS" "$HTTP_CODE" "$BODY"

echo "=========================================="
echo "PARTIE 3: TESTS DE VALIDATION DES DONNÉES"
echo "=========================================="
echo ""

# Test 8: Historique avec date invalide (DOIT ÉCHOUER ou retourner vide)
echo -e "${BLUE}Test 8: Historique paiements avec date invalide${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/paiements/history/daily?date=DATE_INVALIDE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Historique avec date invalide" "FAIL" "$HTTP_CODE" "$BODY"

# Test 9: Historique avec date future (DOIT RÉUSSIR mais vide)
echo -e "${BLUE}Test 9: Historique paiements avec date future${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/paiements/history/daily?date=2030-12-31")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Historique avec date future" "SUCCESS" "$HTTP_CODE" "$BODY"

# Test 10: Historique avec date valide (DOIT RÉUSSIR)
echo -e "${BLUE}Test 10: Historique paiements avec date valide${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/paiements/history/daily?date=2026-02-16")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Historique avec date valide" "SUCCESS" "$HTTP_CODE" "$BODY"

echo "=========================================="
echo "PARTIE 4: TESTS DE RESSOURCES INEXISTANTES"
echo "=========================================="
echo ""

# Test 11: Accès à un endpoint inexistant (DOIT ÉCHOUER)
echo -e "${BLUE}Test 11: Accès à un endpoint qui n'existe pas${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/endpoint_qui_nexiste_pas")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Endpoint inexistant" "FAIL" "$HTTP_CODE" "$BODY"

# Test 12: Accès à une facture inexistante (DOIT ÉCHOUER)
echo -e "${BLUE}Test 12: Accès à une facture qui n'existe pas${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/factures/99999")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Facture inexistante" "FAIL" "$HTTP_CODE" "$BODY"

# Test 13: Accès à une facture existante (DOIT RÉUSSIR)
echo -e "${BLUE}Test 13: Accès à une facture existante${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/factures/1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Facture existante" "SUCCESS" "$HTTP_CODE" "$BODY"

echo "=========================================="
echo "PARTIE 5: TESTS DE FILTRES ET PARAMÈTRES"
echo "=========================================="
echo ""

# Test 14: Factures impayées avec statut invalide (DOIT ÉCHOUER ou ignorer)
echo -e "${BLUE}Test 14: Factures impayées avec statut invalide${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/paiements/history/unpaid?status=STATUT_INVALIDE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Filtre statut invalide" "FAIL" "$HTTP_CODE" "$BODY"

# Test 15: Factures impayées avec statut valide (DOIT RÉUSSIR)
echo -e "${BLUE}Test 15: Factures impayées avec statut 'overdue'${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/paiements/history/unpaid?status=overdue")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Filtre statut 'overdue'" "SUCCESS" "$HTTP_CODE" "$BODY"

# Test 16: Agence avec ID invalide (DOIT ÉCHOUER)
echo -e "${BLUE}Test 16: Réconciliation avec agenceId invalide${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/paiements/reconciliation/agency?date=2026-02-16&agenceId=ABC")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "AgenceId invalide (ABC)" "FAIL" "$HTTP_CODE" "$BODY"

# Test 17: Agence avec ID valide (DOIT RÉUSSIR)
echo -e "${BLUE}Test 17: Réconciliation avec agenceId valide${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/paiements/reconciliation/agency?date=2026-02-16&agenceId=1")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "AgenceId valide (1)" "SUCCESS" "$HTTP_CODE" "$BODY"

echo "=========================================="
echo "PARTIE 6: TESTS DE MÉTHODES HTTP"
echo "=========================================="
echo ""

# Test 18: GET sur endpoint qui attend POST (DOIT ÉCHOUER)
echo -e "${BLUE}Test 18: GET sur /auth/login (attend POST)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/auth/login)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "Mauvaise méthode HTTP" "FAIL" "$HTTP_CODE" "$BODY"

# Test 19: POST sans Content-Type (DOIT ÉCHOUER)
echo -e "${BLUE}Test 19: POST sans Content-Type header${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/auth/login \
  -d '{"username":"manager","password":"manager123"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "POST sans Content-Type" "FAIL" "$HTTP_CODE" "$BODY"

# Test 20: GET sur liste produits (DOIT RÉUSSIR)
echo -e "${BLUE}Test 20: GET sur /produits-catalogue${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" \
  $BASE_URL/produits-catalogue)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
test_endpoint "GET produits catalogue" "SUCCESS" "$HTTP_CODE" "$BODY"

echo ""
echo "=========================================="
echo "RÉSUMÉ FINAL"
echo "=========================================="
echo -e "Total de tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Tests réussis: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Tests échoués: ${RED}$FAILED_TESTS${NC}"
echo ""

SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo -e "Taux de réussite: ${BLUE}$SUCCESS_RATE%${NC}"

if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "${GREEN}✅ EXCELLENT - L'IA a correctement géré les scénarios${NC}"
elif [ $SUCCESS_RATE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  BON - Quelques améliorations possibles${NC}"
else
    echo -e "${RED}❌ ATTENTION - Plusieurs problèmes détectés${NC}"
fi

echo ""
echo "=========================================="
echo "ANALYSE DE PRÉCISION"
echo "=========================================="
echo ""
echo "L'IA a été testée sur:"
echo "- Gestion des erreurs d'authentification"
echo "- Validation des autorisations"
echo "- Validation des données d'entrée"
echo "- Gestion des ressources inexistantes"
echo "- Validation des filtres et paramètres"
echo "- Gestion des méthodes HTTP"
echo ""
echo "Ces tests montrent si l'IA:"
echo "✓ Rejette correctement les requêtes invalides"
echo "✓ Accepte les requêtes valides"
echo "✓ Retourne les bons codes HTTP"
echo "✓ Gère les cas limites (edge cases)"
echo ""
