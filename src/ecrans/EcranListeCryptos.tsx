// Fichier src/ecrans/EcranListeCryptos.tsx

/**
 * Code partiellement généré par ChatGPT et GitHub Copilot.
 * @see https://chatgpt.com/
 */

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, FlatList, Alert, ImageBackground, Modal, Image, TouchableOpacity, TouchableWithoutFeedback, Text } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { getDBConnection, obtenirCryptos, obtenirAchats, obtenirVentes, supprimerCrypto } from '../database/db-service';
import { Crypto, Achat, Vente } from '../modeles/Crypto';
import { initialiserPrixCryptosCache, obtenirPrixCrypto, rafraichirPrixCrypto } from '../api/crypto-api';
import { styles } from '../styles/EcranListeCryptosStyles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useFocusEffect } from '@react-navigation/native';
import { ContexteBaseDeDonnees } from '../../App';

type EcranListeCryptosNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ListeCryptos'>;

/**
 * Écran affichant la liste des cryptomonnaies du portefeuille.
 * 
 * L'utilisateur peut voir les détails de chaque cryptomonnaie, ajouter un achat ou une vente, 
 * voir l'historique des transactions et supprimer une cryptomonnaie.
 */
const EcranListeCryptos = () => {
    const { darkMode } = useContext(ContexteBaseDeDonnees); // Contexte partagé entre les différents composants de l'application pour accéder au mode sombre
    const [cryptos, setCryptos] = useState<Crypto[]>([]); // Liste des cryptomonnaies du portefeuille
    const [modalVisible, setModalVisible] = useState(false); // État de la visibilité de la modal affichant l'image en grand
    const [selectedImageUri, setSelectedImageUri] = useState(''); // URI de l'image sélectionnée
    const [totalPortefeuille, setTotalPortefeuille] = useState(0); // Valeur totale du portefeuille
    const navigation = useNavigation<EcranListeCryptosNavigationProp>(); // Hook de navigation pour rediriger l'utilisateur vers un autre écran

    /**
     * Fonction appelée à chaque fois que l'écran est affiché.
     * 
     * Permet de charger les cryptomonnaies du portefeuille et de mettre à jour la valeur totale du portefeuille.
     * Utilise le hook useFocusEffect pour s'assurer que les données sont chargées à chaque affichage de l'écran.
     * Utilise les fonctions initialiserPrixCryptosCache et chargerCryptos pour initialiser le cache des prix des cryptomonnaies et charger les cryptomonnaies du portefeuille.
     */
    useFocusEffect(
        useCallback(() => { // Fonction de rappel pour charger les données à chaque affichage de l'écran
            const chargerDonnees = async () => { // Fonction asynchrone pour charger les données
                await initialiserPrixCryptosCache(); // Initialisation du cache des prix des cryptomonnaies
                await chargerCryptos(); // Chargement des cryptomonnaies du portefeuille
            };
            chargerDonnees(); // Appel de la fonction pour charger les données 
        }, []) // Tableau de dépendances vide pour exécuter le code une seule fois à l'affichage de l'écran
    );

    /**
     * Charge les cryptomonnaies du portefeuille.
     * 
     * Pour chaque cryptomonnaie, calcule les valeurs associées (prix actuel, montant investi, quantité restante, etc.).
     * Trie les cryptomonnaies par pourcentage du portefeuille décroissant.
     * Met à jour l'état des cryptomonnaies et la valeur totale du portefeuille.
     */
    const chargerCryptos = async () => {
        try { 
            const db = await getDBConnection(); // Connexion à la base de données
            const cryptosEnregistres = await obtenirCryptos(db); // Récupération des cryptomonnaies enregistrées dans la base de données
    
            /**
             * Calcul du pourcentage du portefeuille pour chaque cryptomonnaie.
             * 
             * Utilise la fonction Promise.all pour exécuter les appels asynchrones en parallèle.
             * Pour chaque cryptomonnaie, récupère le prix actuel, les achats et les ventes associés, puis calcule les valeurs nécessaires.
             * Trie ensuite les cryptomonnaies par pourcentage du portefeuille décroissant.
             * Met à jour l'état des cryptomonnaies et la valeur totale du portefeuille.
             * @returns la liste des cryptomonnaies avec leur pourcentage du portefeuille et la valeur totale du portefeuille.
             */
            const cryptosAvecPourcentage = await Promise.all(cryptosEnregistres.map(async crypto => {
                const prixActuel = await obtenirPrixCrypto(crypto.acronyme.toLowerCase()); // Récupération du prix actuel de la cryptomonnaie, en utilisant l'acronyme en minuscules 
                const db = await getDBConnection(); 
                const achats = await obtenirAchats(db, crypto.id); // Récupération des achats associés à la cryptomonnaie
                const ventes = await obtenirVentes(db, crypto.id); // Récupération des ventes associées à la cryptomonnaie
    
                const totalInvesti = achats.reduce((sum: number, achat: Achat) => sum + achat.montantInvesti, 0); // Calcul du montant total investi dans la cryptomonnaie 
                const totalQuantiteAchetee = achats.reduce((sum: number, achat: Achat) => sum + (achat.montantInvesti / achat.prixAchat), 0); // Calcul de la quantité totale achetée 
                const totalQuantiteVendue = ventes.reduce((sum: number, vente: Vente) => sum + (vente.montantVendu / vente.prixVente), 0); // Calcul de la quantité totale vendue
                const quantiteRestante = totalQuantiteAchetee - totalQuantiteVendue; // Calcul de la quantité restante en portefeuille
                const valeurEstimee = quantiteRestante * prixActuel; // Calcul de la valeur estimée de la cryptomonnaie en portefeuille
                
                /**
                 * Calcul de la valeur totale du portefeuille.
                 * 
                 * Utilise la fonction reduce pour calculer la valeur totale du portefeuille en fonction des cryptomonnaies en portefeuille.
                 * Utilise la fonction Promise.resolve pour initialiser la valeur totale du portefeuille à 0.
                 * @returns La valeur totale du portefeuille.
                 */
                const valeurTotalePortefeuille = await cryptosEnregistres.reduce(async (total, crypto) => {
                    const prixCrypto = await obtenirPrixCrypto(crypto.acronyme.toLowerCase()); // Récupération du prix actuel de la cryptomonnaie, en utilisant l'acronyme en minuscules
                    const db = await getDBConnection();
                    const achatsCrypto = await obtenirAchats(db, crypto.id); // Récupération des achats associés à la cryptomonnaie
                    const ventesCrypto = await obtenirVentes(db, crypto.id); // Récupération des ventes associées à la cryptomonnaie
                    const totalInvestiCrypto = achatsCrypto.reduce((sum: number, achat: Achat) => sum + achat.montantInvesti, 0);
                    const totalQuantiteAcheteeCrypto = achatsCrypto.reduce((sum: number, achat: Achat) => sum + (achat.montantInvesti / achat.prixAchat), 0);
                    const totalQuantiteVendueCrypto = ventesCrypto.reduce((sum: number, vente: Vente) => sum + (vente.montantVendu / vente.prixVente), 0);
                    const quantiteRestanteCrypto = totalQuantiteAcheteeCrypto - totalQuantiteVendueCrypto;
                    const currentValue = await total;
                    return currentValue + quantiteRestanteCrypto * prixCrypto; // Calcul de la valeur totale du portefeuille
                }, Promise.resolve(0)); // Initialisation de la valeur totale du portefeuille à 0
    
                const pourcentagePortefeuille = valeurEstimee / valeurTotalePortefeuille * 100;
                return { ...crypto, pourcentagePortefeuille }; // Retourne un objet contenant les informations de la cryptomonnaie et son pourcentage du portefeuille
            }));
    
            // Trier les cryptos par pourcentage du portefeuille décroissant
            cryptosAvecPourcentage.sort((a, b) => b.pourcentagePortefeuille - a.pourcentagePortefeuille); 
    
            setCryptos(cryptosAvecPourcentage); // Mise à jour de la liste des cryptomonnaies avec leur pourcentage du portefeuille
            calculerValeurPortefeuille(cryptosAvecPourcentage); // Calcul de la valeur totale du portefeuille
        } catch (error) {
            console.error("Erreur lors du chargement des cryptomonnaies :", error);
        }
    };
    
    /**
     * Calcule la valeur totale du portefeuille en fonction des cryptomonnaies en portefeuille.
     * 
     * Pour chaque cryptomonnaie, récupère le prix actuel, les achats et les ventes associés, puis calcule les valeurs nécessaires.
     * Ajoute ensuite la valeur de chaque cryptomonnaie au total du portefeuille.
     * Met à jour l'état de la valeur totale du portefeuille.
     * @param cryptos - Liste des cryptomonnaies du portefeuille 
     * @returns La valeur totale du portefeuille.
     */
    const calculerValeurPortefeuille = async (cryptos: Crypto[]) => {
        let valeurTotale = 0; // Initialisation de la valeur totale du portefeuille à 0
        for (const crypto of cryptos) { // Pour chaque cryptomonnaie du portefeuille
            const prixActuel = await obtenirPrixCrypto(crypto.acronyme.toLowerCase()); // Récupération du prix actuel de la cryptomonnaie, en utilisant l'acronyme en minuscules
            const db = await getDBConnection();
            const achats = await obtenirAchats(db, crypto.id); // Récupération des achats associés à la cryptomonnaie
            const ventes = await obtenirVentes(db, crypto.id);  // Récupération des ventes associées à la cryptomonnaie

            const totalQuantiteAchetee = achats.reduce((sum: number, achat: Achat) => sum + (achat.montantInvesti / achat.prixAchat), 0); // Calcul de la quantité totale achetée
            const totalQuantiteVendue = ventes.reduce((sum: number, vente: Vente) => sum + (vente.montantVendu / vente.prixVente), 0); // Calcul de la quantité totale vendue
            const quantiteRestante = totalQuantiteAchetee - totalQuantiteVendue; // Calcul de la quantité restante en portefeuille

            valeurTotale += quantiteRestante * prixActuel; // Calcul de la valeur totale de la cryptomonnaie en portefeuille
        }
        setTotalPortefeuille(valeurTotale); // Mise à jour de la valeur totale du portefeuille
    };

    /**
     * Gère la suppression d'une cryptomonnaie du portefeuille.
     * 
     * Affiche une alerte de confirmation avant de supprimer la cryptomonnaie.
     * Si l'utilisateur confirme la suppression, appelle la fonction supprimerCryptoConfirme pour supprimer la cryptomonnaie.
     * @param id - Identifiant de la cryptomonnaie à supprimer
     */
    const gererSuppression = (id: number) => {
        Alert.alert(
            "Confirmer la suppression",
            "Voulez-vous vraiment supprimer cette cryptomonnaie ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Oui", onPress: () => supprimerCryptoConfirme(id) }
            ]
        );
    };

    /**
     * Supprime une cryptomonnaie du portefeuille.
     * 
     * Appelle la fonction supprimerCrypto pour supprimer la cryptomonnaie de la base de données.
     * Recharge ensuite la liste des cryptomonnaies après la suppression.
     * @param id - Identifiant de la cryptomonnaie à supprimer
     */
    const supprimerCryptoConfirme = async (id: number) => {
        try {
            const db = await getDBConnection();
            await supprimerCrypto(db, id); // Suppression de la cryptomonnaie de la base de données
            chargerCryptos(); // Recharge la liste après la suppression
        } catch (error) {
            Alert.alert("Erreur", "Une erreur est survenue lors de la suppression de la cryptomonnaie.");
        }
    };

    /**
     * Ouvre l'image en grand dans une modal.
     * 
     * Met à jour l'URI de l'image sélectionnée et affiche la modal.
     * @param uri - URI de l'image à afficher
     */
    const ouvrirImage = (uri: string | undefined) => {
        if (uri) { // Vérifie si une image a été sélectionnée
            setSelectedImageUri(uri); // Mise à jour de l'URI de l'image sélectionnée
            setModalVisible(true); // Affichage de la modal
        }
    };

    /**
     * Gère l'ajout d'un achat pour une cryptomonnaie.
     * 
     * Redirige l'utilisateur vers l'écran d'ajout d'un achat avec l'identifiant et le nom de la cryptomonnaie sélectionnée.
     * @param cryptoId - Identifiant de la cryptomonnaie
     * @param cryptoNom - Nom de la cryptomonnaie
     */
    const gererAjoutAchat = (cryptoId: number, cryptoNom: string) => {
        navigation.navigate('AjouterAchat', { cryptoId, cryptoNom }); // Redirection vers l'écran d'ajout d'un achat avec les paramètres de la cryptomonnaie
    };

    /**
     * Gère l'ajout d'une vente pour une cryptomonnaie.
     * 
     * Redirige l'utilisateur vers l'écran d'ajout d'une vente avec l'identifiant et le nom de la cryptomonnaie sélectionnée.
     * @param cryptoId - Identifiant de la cryptomonnaie
     * @param cryptoNom - Nom de la cryptomonnaie
     */
    const gererAjoutVente = (cryptoId: number, cryptoNom: string) => {
        navigation.navigate('AjouterVente', { cryptoId, cryptoNom });
    };

    /**
     * Gère l'affichage de l'historique des transactions pour une cryptomonnaie.
     * 
     * Redirige l'utilisateur vers l'écran de l'historique des transactions avec l'identifiant et le nom de la cryptomonnaie sélectionnée.
     * @param cryptoId - Identifiant de la cryptomonnaie
     * @param cryptoNom - Nom de la cryptomonnaie
     */
    const gererVoirHistorique = (cryptoId: number, cryptoNom: string) => {
        navigation.navigate('HistoriqueCrypto', { cryptoId, cryptoNom });
    };

    /**
     * Composant représentant une cryptomonnaie dans la liste.
     * 
     * Affiche les détails de la cryptomonnaie (nom, acronyme, logo, prix actuel, montant investi, valeur estimée, etc.).
     * Affiche les boutons pour ajouter un achat, une vente, voir l'historique des transactions et supprimer la cryptomonnaie.
     */
    return (
        <ImageBackground source={require('../../imagesAjoutModifier/to_the_moon.png')} style={darkMode ? styles.backgroundImageDark : styles.backgroundImage}> 
            <View style={darkMode ? styles.floatingContainerDark : styles.floatingContainer}> 
                <Text style={darkMode ? styles.floatingTextDark : styles.floatingText}>Valeur Portefeuille : {totalPortefeuille.toLocaleString()} $</Text> 
            </View>
            <View style={styles.container}>
                <FlatList 
                    data={cryptos}
                    renderItem={({ item }) => ( 
                        <CryptoItem 
                            item={item}
                            cryptos={cryptos}
                            gererSuppression={gererSuppression}
                            gererAjoutAchat={gererAjoutAchat}
                            gererAjoutVente={gererAjoutVente}
                            gererVoirHistorique={gererVoirHistorique}
                            ouvrirImage={ouvrirImage}
                            darkMode={darkMode}
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                />
            </View>

            <Modal 
                animationType="slide" 
                transparent={false} 
                visible={modalVisible} 
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalView}>
                        <Image source={{ uri: selectedImageUri }} style={styles.modalImage} />
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ImageBackground>
    );
};

/**
 * Composant représentant une cryptomonnaie dans la liste.
 * 
 * Affiche les détails de la cryptomonnaie (nom, acronyme, logo, prix actuel, montant investi, valeur estimée, etc.).
 * Affiche les boutons pour ajouter un achat, une vente, voir l'historique des transactions et supprimer la cryptomonnaie.
 */
const CryptoItem = ({ item, cryptos, gererSuppression, gererAjoutAchat, gererAjoutVente, gererVoirHistorique, ouvrirImage, darkMode }: 
                        { item: Crypto, 
                            cryptos: Crypto[], 
                            gererSuppression: (arg0: number) => void, 
                            gererAjoutAchat: (arg0: number, arg1: string) => void, 
                            gererAjoutVente: (arg0: number, arg1: string) => void, 
                            gererVoirHistorique: (arg0: number, arg1: string) => void, 
                            ouvrirImage: (arg0: string | undefined) => void, 
                            darkMode: boolean }) => {
    const [valeursCrypto, setValeursCrypto] = useState<{ prixAchatMoyen: number; 
                                                            totalInvesti: number; 
                                                            valeurEstimee: number; 
                                                            quantiteRestante: number; 
                                                            montantVendu: number; 
                                                            pourcentagePortefeuille: number; } | null>(null);
    const [prixActuel, setPrixActuel] = useState<number>(0); // Prix actuel de la cryptomonnaie

    /**
     * Calcule les valeurs associées à la cryptomonnaie (prix d'achat moyen, montant investi, valeur estimée, quantité restante, etc.).
     * 
     * Pour chaque cryptomonnaie, récupère les achats et les ventes associés, puis calcule les valeurs nécessaires.
     * Calcule également la valeur totale du portefeuille en fonction des cryptomonnaies en portefeuille.
     */
    useEffect(() => {
        const calculerValeursCrypto = async (cryptoId: number) => { // Fonction asynchrone pour calculer les valeurs associées à la cryptomonnaie
            const db = await getDBConnection(); // Connexion à la base de données
            const achats = await obtenirAchats(db, cryptoId); // Récupération des achats associés à la cryptomonnaie
            const ventes = await obtenirVentes(db, cryptoId); // Récupération des ventes associées à la cryptomonnaie

            const totalInvesti = achats.reduce((sum: number, achat: Achat) => sum + achat.montantInvesti, 0); // Calcul du montant total investi dans la cryptomonnaie
            const totalQuantiteAchetee = achats.reduce((sum: number, achat: Achat) => sum + (achat.montantInvesti / achat.prixAchat), 0); // Calcul de la quantité totale achetée
            const totalMontantVendu = ventes.reduce((sum: number, vente: Vente) => sum + vente.montantVendu, 0); // Calcul du montant total vendu
            const totalQuantiteVendue = ventes.reduce((sum: number, vente: Vente) => sum + (vente.montantVendu / vente.prixVente), 0); // Calcul de la quantité totale vendue
            const quantiteRestante = totalQuantiteAchetee - totalQuantiteVendue; // Calcul de la quantité restante en portefeuille
            const prixAchatMoyen = totalInvesti > 0 ? totalInvesti / totalQuantiteAchetee : 0; // Calcul du prix d'achat moyen

            const prixActuel = await obtenirPrixCrypto(item.acronyme.toLowerCase()); // Récupération du prix actuel de la cryptomonnaie, en utilisant l'acronyme en minuscules
            const valeurEstimee = quantiteRestante * prixActuel; // Calcul de la valeur estimée de la cryptomonnaie en portefeuille

            /**
             * Calcul de la valeur totale du portefeuille.
             * 
             * Utilise la fonction reduce pour calculer la valeur totale du portefeuille en fonction des cryptomonnaies en portefeuille.
             * Utilise la fonction Promise.resolve pour initialiser la valeur totale du portefeuille à 0.
             * @returns La valeur totale du portefeuille.
             */
            const valeurTotalePortefeuille = await cryptos.reduce(async (total, crypto) => {
                const prixCrypto = await obtenirPrixCrypto(crypto.acronyme.toLowerCase()); // Récupération du prix actuel de la cryptomonnaie, en utilisant l'acronyme en minuscules
                const db = await getDBConnection(); 
                const achatsCrypto = await obtenirAchats(db, crypto.id); // Récupération des achats associés à la cryptomonnaie
                const ventesCrypto = await obtenirVentes(db, crypto.id); // Récupération des ventes associées à la cryptomonnaie
                const totalInvestiCrypto = achatsCrypto.reduce((sum: number, achat: Achat) => sum + achat.montantInvesti, 0); // Calcul du montant total investi dans la cryptomonnaie
                const totalQuantiteAcheteeCrypto = achatsCrypto.reduce((sum: number, achat: Achat) => sum + (achat.montantInvesti / achat.prixAchat), 0); // Calcul de la quantité totale achetée
                const totalQuantiteVendueCrypto = ventesCrypto.reduce((sum: number, vente: Vente) => sum + (vente.montantVendu / vente.prixVente), 0); // Calcul de la quantité totale vendue
                const quantiteRestanteCrypto = totalQuantiteAcheteeCrypto - totalQuantiteVendueCrypto; // Calcul de la quantité restante en portefeuille
                const currentValue = await total; // Récupération de la valeur totale actuelle
                return currentValue + quantiteRestanteCrypto * prixCrypto; // Calcul de la valeur totale du portefeuille
            }, Promise.resolve(0)); // Initialisation de la valeur totale du portefeuille à 0

            const pourcentagePortefeuille = valeurEstimee / valeurTotalePortefeuille * 100; // Calcul du pourcentage du portefeuille pour la cryptomonnaie actuelle 

            setValeursCrypto({ prixAchatMoyen, totalInvesti, valeurEstimee, quantiteRestante, montantVendu: totalMontantVendu, pourcentagePortefeuille }); // Mise à jour des valeurs associées à la cryptomonnaie
            setPrixActuel(prixActuel); // Mise à jour du prix actuel de la cryptomonnaie
        };

        calculerValeursCrypto(item.id); // Appel de la fonction pour calculer les valeurs associées à la cryptomonnaie
    }, [item.id, cryptos]); // Tableau de dépendances pour recalculer les valeurs associées à la cryptomonnaie lorsqu'elles changent

    if (!valeursCrypto) { // Vérifie si les valeurs associées à la cryptomonnaie ont été chargées
        return null; // Retourne null si les valeurs n'ont pas été chargées
    }

    /**
     * Composant représentant une carte affichant les détails d'une cryptomonnaie.
     * 
     * Affiche le nom, l'acronyme, le prix d'achat moyen, le montant investi, le montant vendu, le prix actuel, la valeur estimée, la quantité restante, etc.
     * Affiche le logo de la cryptomonnaie s'il est disponible.
     * Affiche les boutons pour ajouter un achat, une vente, voir l'historique des transactions et supprimer la cryptomonnaie.
     * Utilise les styles spécifiques pour le mode sombre.
     */
    return (
        <Card style={darkMode ? styles.cardDark : styles.card}> 
            <Card.Content style={styles.cardContent}> 
                <View style={styles.header}> 
                    <View style={styles.infoContainer}> 
                        <Title style={darkMode ? styles.titleDark : styles.title}>{item.nom} ({item.acronyme}) - {valeursCrypto.pourcentagePortefeuille.toFixed(2)}%</Title> 
                        <Paragraph style={[styles.paragraph, darkMode ? styles.boldTextDark : styles.boldText]}>Prix d'achat moyen: {valeursCrypto.prixAchatMoyen} USD</Paragraph> 
                        <Paragraph style={darkMode ? styles.paragraphDark : styles.paragraph}>Montant investi: {valeursCrypto.totalInvesti.toLocaleString()} USD</Paragraph>
                        <Paragraph style={darkMode ? styles.paragraphDark : styles.paragraph}>Montant vendu: {valeursCrypto.montantVendu.toLocaleString()} USD</Paragraph>
                        <Paragraph style={[styles.paragraph, darkMode ? styles.boldTextDark : styles.boldText]}>Prix actuel: {prixActuel.toFixed(8)} USD</Paragraph>
                        <Paragraph style={[styles.paragraph, darkMode ? styles.boldTextBleuDark : styles.boldTextBleu]}>Valeur actuelle: {valeursCrypto.valeurEstimee.toLocaleString()} USD</Paragraph>
                        <Paragraph style={darkMode ? styles.paragraphDark : styles.paragraph}>Quantité: {valeursCrypto.quantiteRestante.toFixed(6)} {item.acronyme.toUpperCase()}</Paragraph>
                    </View>
                    <View style={styles.logoContainer}>
                        {item.logo ? ( 
                            <TouchableOpacity onPress={() => ouvrirImage(item.logo)}> 
                                <Image source={{ uri: item.logo }} style={styles.logo} />
                            </TouchableOpacity>
                        ) : null} 
                        <View style={styles.buttonsColumn}>
                            <TouchableOpacity onPress={() => gererAjoutAchat(item.id, item.nom)}>
                                <Image source={require('../../assets/Bouton_Achat_2.png')} style={styles.actionIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => gererAjoutVente(item.id, item.nom)}>
                                <Image source={require('../../assets/Bouton_Vente_2.png')} style={styles.actionIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => gererSuppression(item.id)}>
                                <Image source={require('../../assets/delete-icon.png')} style={styles.deleteIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => gererVoirHistorique(item.id, item.nom)}>
                                <Text style={styles.historiqueButton}>Voir l'historique</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
};

export default EcranListeCryptos;
