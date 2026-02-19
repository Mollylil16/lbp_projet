/**
 * Utilitaires pour les fonctionnalités "IA" du frontend
 */

/**
 * Calcule la distance de Levenshtein entre deux chaînes
 * Utilisé pour le Fuzzy Matching dans les recherches
 */
export function getLevenshteinDistance(a: string, b: string): number {
    const tmp = []
    for (let i = 0; i <= a.length; i++) {
        tmp[i] = [i]
    }
    for (let j = 0; j <= b.length; j++) {
        tmp[0][j] = j
    }
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            tmp[i][j] = Math.min(
                tmp[i - 1][j] + 1,
                tmp[i][j - 1] + 1,
                tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            )
        }
    }
    return tmp[a.length][b.length]
}

/**
 * Calcule un score de similarité entre 0 et 1
 */
export function getSimilarityScore(a: string, b: string): number {
    const distance = getLevenshteinDistance(a.toLowerCase(), b.toLowerCase())
    const maxLength = Math.max(a.length, b.length)
    if (maxLength === 0) return 1
    return 1 - distance / maxLength
}

/**
 * Filtre et trie une liste d'objets selon une recherche floue
 */
export function fuzzySearch<T>(
    query: string,
    items: T[],
    accessors: Array<(item: T) => string>,
    minScore = 0.4
): T[] {
    if (!query) return items

    return items
        .map((item) => {
            // Trouver le meilleur score parmi tous les accesseurs (nom, tel, etc.)
            const bestScore = Math.max(
                ...accessors.map((acc) => getSimilarityScore(query, acc(item)))
            )
            return { item, score: bestScore }
        })
        .filter((res) => res.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .map((res) => res.item)
}

/**
 * Prédit le volume futur basé sur un historique récent
 * Utilise une régression linéaire simple pour projeter la tendance
 */
export function predictFutureVolume(history: number[]): {
    prediction: number,
    trend: 'up' | 'down' | 'stable',
    confidence: number
} {
    if (history.length < 2) {
        return { prediction: history[0] || 0, trend: 'stable', confidence: 0.1 }
    }

    // Calcul de la tendance (pente simple)
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumXX = 0
    const n = history.length

    for (let i = 0; i < n; i++) {
        sumX += i
        sumY += history[i]
        sumXY += i * history[i]
        sumXX += i * i
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Prédiction pour le point suivant (n)
    const prediction = Math.round(Math.max(0, slope * n + intercept))
    const trend = slope > 1 ? 'up' : slope < -1 ? 'down' : 'stable'

    // Confiance basée sur la quantité de données
    const confidence = Math.min(0.9, 0.2 + (n * 0.1))

    return { prediction, trend, confidence }
}
