// Fichier src/api/crypto-api.ts

/**
 * Code partiellement généré par ChatGPT et GitHub Copilot.
 * @see https://chatgpt.com/
 */

let prixCryptosCache: { [key: string]: number } = {}; // Cache pour stocker les prix des cryptomonnaies et éviter les appels répétés à l'API CoinGecko 

const API_BASE_URL = 'https://api.coingecko.com/api/v3'; // URL de base de l'API CoinGecko 

/**
 * Fonction générique pour récupérer les données depuis l'API CoinGecko.
 * 
 * @param endpoint Endpoint de l'API à appeler
 * @returns Les données récupérées depuis l'API
 */
const fetchCryptos = async (endpoint: string): Promise<any> => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`); // Appel à l'API CoinGecko
        const data = await response.json(); // Conversion de la réponse en JSON
        return data; // Renvoie des données récupérées depuis l'API
    } catch (error) {
        console.error(`Erreur lors de la récupération des données depuis ${endpoint}:`, error);
        throw error;
    }
};

/**
 * Initialise le cache des prix des cryptomonnaies du top 1000 en appelant l'API CoinGecko.
 * 
 * Cette fonction est exécutée une seule fois, lors du démarrage de l'application.
 * Elle permet de précharger les prix des cryptomonnaies en tranche 250 par 250.
 * Les prix sont stockés dans le cache pour éviter les appels répétés à l'API.
 */
export const initialiserPrixCryptosCache = async (): Promise<void> => {
    try {
        const endpoints = [
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1',
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=2',
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=3',
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=4'
        ];

        // Récupération des données depuis l'API CoinGecko et fusion des résultats en un seul tableau
        const data = (await Promise.all(endpoints.map(fetchCryptos))).flat();  

        data.forEach((crypto: any) => { // Parcours des données pour stocker les prix des cryptomonnaies dans le cache
            if (crypto.symbol) { // Vérification de la présence du symbole de la cryptomonnaie
                prixCryptosCache[crypto.symbol.toLowerCase()] = crypto.current_price; // Stockage du prix de la cryptomonnaie dans le cache
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du cache des prix des cryptomonnaies:', error);
    }
};

/**
 * Fonction pour rafraîchir le prix d'une cryptomonnaie en appelant l'API CoinGecko.
 * 
 * @param cryptoId Identifiant de la cryptomonnaie
 * @returns Le prix actuel de la cryptomonnaie
 */
export const rafraichirPrixCrypto = async (cryptoId: string): Promise<number> => {
    try {
        const endpoint = `/coins/markets?vs_currency=usd&ids=${cryptoId}`; // Endpoint pour récupérer le prix de la cryptomonnaie spécifique 
        const data = await fetchCryptos(endpoint); // Appel à l'API CoinGecko pour récupérer les données de la cryptomonnaie
        if (data.length > 0) { // Vérification de la présence de données
            const crypto = data[0]; // Récupération des données de la cryptomonnaie
            prixCryptosCache[cryptoId.toLowerCase()] = crypto.current_price; // Mise à jour du prix de la cryptomonnaie dans le cache
            return crypto.current_price; // Renvoie du prix actuel de la cryptomonnaie 
        } else { // Si aucune donnée n'est retournée
            return 0; // Renvoie du prix 0
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération du prix pour ${cryptoId}:`, error);
        return 0;
    }
};

/**
 * Fonction pour obtenir le prix d'une cryptomonnaie à partir du cache ou en appelant l'API CoinGecko.
 * 
 * @param cryptoId Identifiant de la cryptomonnaie
 * @returns Le prix actuel de la cryptomonnaie
 */
export const obtenirPrixCrypto = async (cryptoId: string): Promise<number> => {
    if (!prixCryptosCache[cryptoId.toLowerCase()]) { // Vérification de la présence du prix de la cryptomonnaie dans le cache
        return await rafraichirPrixCrypto(cryptoId); // Appel à la fonction pour rafraîchir le prix de la cryptomonnaie
    }
    return prixCryptosCache[cryptoId.toLowerCase()]; // Renvoie du prix de la cryptomonnaie depuis le cache, toLowerCase() pour éviter les erreurs de casse
};

/**
 * Fonction pour obtenir toutes les cryptomonnaies avec leurs prix en USD.
 * 
 * @returns Un tableau contenant les données de toutes les cryptomonnaies avec leurs prix en USD
 */
export const obtenirToutesLesCryptosAvecPrix = async (): Promise<any[]> => {
    try {
        const endpoints = [ // Endpoints pour récupérer les cryptomonnaies par tranche de 250 par page, jusqu'à 1000, soit 4 pages
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1',
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=2',
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=3',
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=4'
        ];

        const data = await Promise.all(endpoints.map(fetchCryptos)); // Récupération des données depuis l'API CoinGecko
        return data.flat(); // Fusion des résultats en un seul tableau et renvoi des données des cryptomonnaies avec leurs prix en USD 
    } catch (error) {
        console.error('Erreur lors de la récupération des cryptomonnaies:', error);
        return [];
    }
};

/**
 * Fonction pour obtenir les cryptomonnaies avec leurs prix en USD.
 * 
 * @returns Un tableau contenant les données des 100 premières cryptomonnaies avec leurs prix en USD
 */
export const obtenirToutesLesCryptos = async (): Promise<any[]> => {
    return await fetchCryptos('/coins/list'); // Appel à l'API CoinGecko pour récupérer les données des 100 premières cryptomonnaies avec leurs prix en USD
};

/**
 * Fonction pour obtenir les 1000 premières cryptomonnaies avec leurs prix en USD.
 * 
 * @returns Un tableau contenant les données des 100 premières cryptomonnaies avec leurs prix en USD
 */
export const obtenirTopCryptos = async (): Promise<any[]> => {
    try {
        const endpoints = [
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1',
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=2',
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=3',
            '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=4'
        ];

        const data = await Promise.all(endpoints.map(fetchCryptos)); // Récupération des données depuis l'API CoinGecko 
        return data.flat(); // Fusion des résultats en un seul tableau et renvoi des données des 1000 premières cryptomonnaies avec leurs prix en USD
    } catch (error) {
        console.error('Erreur lors de la récupération des cryptomonnaies:', error);
        return [];
    }
};

/**
 * Fonction pour obtenir les cryptomonnaies par page avec leurs prix en USD.
 * 
 * @param page Numéro de la page à récupérer
 * @returns Un tableau contenant les données des cryptomonnaies de la page spécifiée avec leurs prix en USD
 */
export const obtenirCryptosParPage = async (page: number): Promise<any[]> => {
    const endpoint = `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}`; // Endpoint pour récupérer les cryptomonnaies par page 
    return await fetchCryptos(endpoint); // Appel à l'API CoinGecko pour récupérer les données des cryptomonnaies de la page spécifiée avec leurs prix en USD
};

/**
 * Fonction pour rechercher les cryptomonnaies par nom ou acronyme.
 * 
 * @param query Terme de recherche pour les cryptomonnaies
 * @returns Un tableau contenant les données des cryptomonnaies correspondant à la recherche
 */
export const rechercherCryptos = async (query: string): Promise<any[]> => {
    console.log("rechercherCryptos: query =", query); // Affichage du terme de recherche dans la console
    const endpoint = `/search?query=${query}`; // Endpoint pour rechercher les cryptomonnaies par nom ou acronyme
    const data = await fetchCryptos(endpoint); // Appel à l'API CoinGecko pour rechercher les cryptomonnaies
    console.log("rechercherCryptos: raw results =", data); // Affichage des résultats bruts dans la console
    if (data.coins && data.coins.length > 0) { // Vérification de la présence de données de cryptomonnaies dans les résultats
        return data.coins; // Renvoi des données des cryptomonnaies correspondant à la recherche 
    }
    return []; // Renvoi d'un tableau vide si aucune donnée n'est trouvée 
};

/**
 * Fonction pour obtenir les détails d'une cryptomonnaie spécifique.
 * 
 * @param cryptoId Identifiant de la cryptomonnaie
 * @returns Les détails de la cryptomonnaie spécifique
 */
export const obtenirDetailsCrypto = async (cryptoId: string): Promise<any> => {
    try {
        const endpoint = `/coins/markets?vs_currency=usd&ids=${cryptoId}`; // Endpoint pour récupérer les détails de la cryptomonnaie spécifique
        const data = await fetchCryptos(endpoint); // Appel à l'API CoinGecko pour récupérer les détails de la cryptomonnaie
        if (data.status && data.status.error_code === 429) { // Vérification du dépassement de la limite de taux pour l'API CoinGecko 
            console.error("obtenirDetailsCrypto: Rate limit exceeded for", cryptoId); // Affichage d'un message d'erreur dans la console 
            return null; // Renvoi de null si la limite de taux est dépassée 
        }
        console.log("obtenirDetailsCrypto: details data for", cryptoId, "=", data); // Affichage des détails de la cryptomonnaie dans la console
        return data[0];
    } catch (error) {
        console.error(`Erreur lors de la récupération des détails pour ${cryptoId}:`, error);
        return null;
    }
};
