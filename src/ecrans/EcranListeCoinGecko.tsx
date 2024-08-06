// Fichier src/ecrans/EcranListeCoinGecko.tsx

/**
 * Code partiellement généré par ChatGPT et GitHub Copilot.
 * @see https://chatgpt.com/
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Image, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obtenirCryptosParPage, rechercherCryptos } from '../api/crypto-api';
import { styles } from '../styles/EcranListeCoinGeckoStyles';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Écran permettant d'afficher une liste de cryptomonnaies provenant de l'API CoinGecko.
 * 
 * L'utilisateur peut rechercher une cryptomonnaie par son nom ou son acronyme.
 * La liste des cryptomonnaies est paginée pour améliorer les performances.
 */
const EcranListeCoinGecko = () => {
    const [cryptos, setCryptos] = useState<{ id: string, symbol: string, name: string, current_price: number, market_cap_rank: number, image: string }[]>([]); // Liste des cryptomonnaies affichées 
    const [searchText, setSearchText] = useState(''); // Texte de recherche pour filtrer les cryptomonnaies 
    const [initialLoading, setInitialLoading] = useState(true); // Chargement initial de la liste des cryptomonnaies 
    const [moreLoading, setMoreLoading] = useState(false); // Chargement des pages suivantes de la liste des cryptomonnaies
    const [error, setError] = useState<string | null>(null); // Erreur lors de la récupération des cryptomonnaies
    const [page, setPage] = useState(1); // Numéro de la page courante de la liste des cryptomonnaies 
    const [hasMore, setHasMore] = useState(true); // Indicateur de présence de pages suivantes 

    /**
     * Récupère les cryptomonnaies à afficher en fonction de la page courante.
     * 
     * Cette fonction est appelée lors du premier affichage de l'écran et lors du chargement des pages suivantes.
     * Elle permet de récupérer les données depuis l'API CoinGecko et de les afficher dans la liste.
     * @param isInitialLoad - Indique s'il s'agit du premier chargement de la liste des cryptomonnaies
     */
    const fetchCryptos = async (isInitialLoad = false) => { // Fonction asynchrone pour récupérer les cryptomonnaies à afficher 
        if (isInitialLoad) { // Si c'est le premier chargement, le chargement initial est activé 
            setInitialLoading(true); // Affichage de l'indicateur de chargement initial 
        } else {
            setMoreLoading(true); // Affichage de l'indicateur de chargement des pages suivantes 
        }
        setError(null); // Réinitialisation de l'erreur 
        try {
            const data = await obtenirCryptosParPage(page); // Récupération des cryptomonnaies pour la page courante 
            if (data.length > 0) { // Si des données sont retournées 
                setCryptos(prevCryptos => { // Mise à jour de la liste des cryptomonnaies affichées 
                    const newCryptos = data.filter(crypto => !prevCryptos.some(existingCrypto => existingCrypto.id === crypto.id)); // Filtrage des doublons 
                    const allCryptos = isInitialLoad ? newCryptos : [...prevCryptos, ...newCryptos]; // Ajout des nouvelles cryptomonnaies à la liste existante 
                    AsyncStorage.setItem('cryptos', JSON.stringify(allCryptos)); // Enregistrement des cryptomonnaies dans le stockage local 
                    return allCryptos; // Retourne la liste complète des cryptomonnaies 
                });
                setPage(prevPage => prevPage + 1); // Mise à jour du numéro de page courante 
            } else {
                setHasMore(false); // setHasMore sert à arrêter le chargement des pages suivantes 
            }
        } catch (error) {
            setError("Erreur lors de la récupération des cryptomonnaies. Veuillez réessayer.");
            console.error("Erreur lors de la récupération des cryptomonnaies :", error);
        } finally {
            if (isInitialLoad) { // Si c'est le premier chargement, le chargement initial est désactivé afin de masquer l'indicateur de chargement
                setInitialLoading(false); // Désactivation de l'indicateur de chargement initial
            } else {
                setMoreLoading(false); // Désactivation de l'indicateur de chargement des pages suivantes 
            }
        }
    };

    /**
     * Gère le chargement des pages suivantes de la liste des cryptomonnaies.
     * 
     * Cette fonction est appelée lorsque l'utilisateur atteint la fin de la liste.
     * Elle permet de charger les données de la page suivante pour afficher plus de cryptomonnaies.
     * La fonction est bloquée si le chargement est déjà en cours ou s'il n'y a plus de pages à charger.
     */
    useFocusEffect(
        useCallback(() => { // Fonction de rappel pour gérer le chargement des pages suivantes lors du focus sur l'écran 
            const loadCachedCryptos = async () => { // Fonction asynchrone pour charger les cryptomonnaies enregistrées dans le stockage local 
                const cachedCryptos = await AsyncStorage.getItem('cryptos'); // Récupération des cryptomonnaies depuis le stockage local
                if (cachedCryptos) { // Si des cryptomonnaies sont trouvées dans le stockage local 
                    setCryptos(JSON.parse(cachedCryptos)); // Mise à jour de la liste des cryptomonnaies avec les données enregistrées
                    setInitialLoading(false); // Désactivation de l'indicateur de chargement initial
                } else { // Si aucune cryptomonnaie n'est trouvée dans le stockage local
                    setCryptos([]); // Initialisation de la liste des cryptomonnaies
                    setPage(1); // Réinitialisation du numéro de page courante
                    setHasMore(true); // Réinitialisation de l'indicateur de présence de pages suivantes
                    fetchCryptos(true); // Chargement initial des cryptomonnaies
                }
            };
            loadCachedCryptos(); // Appel de la fonction pour charger les cryptomonnaies enregistrées dans le stockage local 

            /**
             * Récupère les cryptomonnaies à intervalles réguliers pour mettre à jour les données.
             * 
             * Cet intervalle est défini à 1 heure (3600000 ms).
             * Les données sont mises à jour automatiquement pour refléter les changements du marché.
             * L'intervalle est nettoyé lors du démontage de l'écran pour éviter les fuites de mémoire avec clearInterval.
             * @returns - Fonction de nettoyage de l'intervalle
             */
            const intervalId = setInterval(() => {
                fetchCryptos(true); // Appel de la fonction pour récupérer les cryptomonnaies à intervalles réguliers 
            }, 3600000); // 3600000 ms = 1 heure

            return () => clearInterval(intervalId); // Nettoyage de l'intervalle lors du démontage de l'écran 
        }, []) // Le tableau vide [] en deuxième argument indique que cette fonction doit être exécutée une seule fois, lors du premier affichage de l'écran
    );

    /**
     * Gère le chargement des pages suivantes de la liste des cryptomonnaies.
     * 
     * Cette fonction est appelée lorsque l'utilisateur atteint la fin de la liste.
     * Elle permet de charger les données de la page suivante pour afficher plus de cryptomonnaies.
     * La fonction est bloquée si le chargement est déjà en cours ou s'il n'y a plus de pages à charger.
     */
    const handleLoadMore = () => {
        if (!moreLoading && hasMore) { // Si le chargement des pages suivantes n'est pas en cours et qu'il reste des pages à charger
            fetchCryptos(); // Appel de la fonction pour charger les pages suivantes de la liste des cryptomonnaies
        }
    };

    /**
     * Rafraîchit manuellement la liste des cryptomonnaies.
     * 
     * Cette fonction est appelée lorsque l'utilisateur appuie sur le bouton "Rafraîchir".
     * Elle permet de recharger toutes les pages de la liste des cryptomonnaies.
     */
    const handleManualRefresh = async () => {
        setPage(1); // Réinitialisation du numéro de page courante 
        setHasMore(true); // Réinitialisation de l'indicateur de présence de pages suivantes
        setCryptos([]); // Réinitialisation de la liste des cryptomonnaies
        await fetchAllCryptos(); // Appel de la fonction pour rafraîchir manuellement la liste des cryptomonnaies
    };

    /**
     * Récupère toutes les cryptomonnaies disponibles depuis l'API CoinGecko.
     * 
     * Cette fonction est appelée lors du premier chargement de l'écran pour afficher toutes les cryptomonnaies.
     * Elle permet de récupérer les données de toutes les pages de la liste des cryptomonnaies.
     * Les données sont enregistrées dans le stockage local pour une utilisation hors ligne.
     * L'indicateur de chargement initial est activé pendant le processus.
     * L'indicateur de présence de pages suivantes est désactivé à la fin du processus.
     * En cas d'erreur, un message d'erreur est affiché à l'utilisateur.
     * @returns - Liste de toutes les cryptomonnaies disponibles
     */
    const fetchAllCryptos = async () => {
        let currentPage = 1; // Numéro de la page courante
        let allCryptos: any[] = []; // Liste de toutes les cryptomonnaies disponibles 
        let hasMorePages = true; // Indicateur de présence de pages suivantes 
        setInitialLoading(true); // Activation de l'indicateur de chargement initial 
        while (hasMorePages) { // Tant qu'il reste des pages à charger
            try { // Tentative de récupération des cryptomonnaies pour la page courante
                const data = await obtenirCryptosParPage(currentPage); // Récupération des cryptomonnaies pour la page courante
                if (data.length > 0) { // Si des données sont retournées
                    allCryptos = [...allCryptos, ...data]; // Ajout des nouvelles cryptomonnaies à la liste existante
                    currentPage += 1; // Incrémentation du numéro de page courante
                } else { // Si aucune donnée n'est retournée
                    hasMorePages = false; // Désactivation de l'indicateur de présence de pages suivantes
                }
            } catch (error) {
                setError("Erreur lors de la récupération des cryptomonnaies. Veuillez réessayer.");
                console.error("Erreur lors de la récupération des cryptomonnaies :", error);
                hasMorePages = false;
            }
        }
        setCryptos(allCryptos); // Mise à jour de la liste des cryptomonnaies affichées 
        AsyncStorage.setItem('cryptos', JSON.stringify(allCryptos)); // Enregistrement des cryptomonnaies dans le stockage local
        setPage(currentPage); // Mise à jour du numéro de page courante
        setHasMore(false); // Désactivation de l'indicateur de présence de pages suivantes
        setInitialLoading(false); // Désactivation de l'indicateur de chargement initial
    };

    /**
     * Filtrage des cryptomonnaies en fonction du texte de recherche.
     * 
     * Cette fonction est appelée à chaque changement du texte de recherche.
     * Elle permet de filtrer les cryptomonnaies affichées en fonction du nom ou de l'acronyme.
     * Les cryptomonnaies dont le nom ou l'acronyme contiennent le texte de recherche sont affichées.
     * @param crypto - Cryptomonnaie à filtrer
     * @returns - Indicateur de correspondance avec le texte de recherche
     * @returns - Liste des cryptomonnaies filtrées
     */
    const filteredCryptos = cryptos.filter(crypto => // Filtrage des cryptomonnaies en fonction du texte de recherche
        (crypto.name && crypto.name.toLowerCase().includes(searchText.toLowerCase())) || // Filtrage par nom, insensible à la casse, pour correspondance partielle
        (crypto.symbol && crypto.symbol.toLowerCase().includes(searchText.toLowerCase())) // Filtrage par acronyme, insensible à la casse, pour correspondance partielle
    );

    /**
     * Affichage des informations d'une cryptomonnaie dans une ligne de la liste.
     * 
     * Cette fonction est appelée pour chaque cryptomonnaie affichée dans la liste.
     * Elle permet de structurer l'affichage des données de la cryptomonnaie.
     * @param item - Cryptomonnaie à afficher
     * @returns - Composant contenant les informations de la cryptomonnaie
     */
    const renderItem = ({ item }: { item: { id: string, symbol: string, name: string, current_price: number, market_cap_rank: number, image: string } }) => (
        <View style={styles.row}> 
            <Text style={styles.text}>{item.market_cap_rank || '-'}</Text>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/50' }} style={styles.logo} />
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.text}>{item.symbol.toUpperCase()}</Text>
            <Text style={styles.text}>${item.current_price || '-'}</Text>
        </View>
    );

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => fetchCryptos(true)}>
                    <Text style={styles.buttonText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    /**
     * Affichage de la liste des cryptomonnaies avec un champ de recherche et un bouton de rafraîchissement.
     * 
     * Les cryptomonnaies sont affichées sous forme de liste avec des informations détaillées.
     * L'utilisateur peut rechercher une cryptomonnaie par son nom ou son acronyme.
     * Un indicateur de chargement est affiché pendant le chargement initial et des pages suivantes.
     */
    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Rechercher une crypto"
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <TouchableOpacity style={styles.refreshButton} onPress={handleManualRefresh}>
                    <Text style={styles.refreshButtonText}>Rafraîchir</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.tableHeader}>
                <Text style={styles.headerText}>Rang</Text>
                <Text style={styles.headerText}>Logo</Text>
                <Text style={styles.headerText}>Nom</Text>
                <Text style={styles.headerText}>Acronyme</Text>
                <Text style={styles.headerText}>Prix Actuel</Text>
            </View>
            {initialLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList 
                    data={filteredCryptos} 
                    renderItem={renderItem} 
                    keyExtractor={item => item.id} 
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={() => moreLoading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
                />
            )}
        </View>
    );
};

export default EcranListeCoinGecko;
