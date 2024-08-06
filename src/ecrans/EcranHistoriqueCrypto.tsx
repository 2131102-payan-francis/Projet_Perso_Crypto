// Fichier EcranHistoriqueCrypto.tsx

/**
 * Code partiellement généré par ChatGPT et GitHub Copilot.
 * @see https://chatgpt.com/
 */

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ImageBackground, TouchableOpacity, Modal, TextInput, Button, Platform, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../../App';
import { getDBConnection, obtenirAchats, obtenirVentes, mettreAJourAchat, mettreAJourVente, supprimerAchat, supprimerVente, obtenirCryptos, ajouterVente } from '../database/db-service';
import { Achat, Vente, Crypto } from '../modeles/Crypto';
import { styles } from '../styles/EcranHistoriqueCryptoStyles';
import { obtenirPrixCrypto } from '../api/crypto-api';

type EcranHistoriqueCryptoRouteProp = RouteProp<RootStackParamList, 'HistoriqueCrypto'>; // Définit le type de la route HistoriqueCrypto de l'application (RootStackParamList) pour TypeScript 

/**
 * Écran permettant de visualiser l'historique des achats et des ventes d'une crypto-monnaie.
 * 
 * L'utilisateur peut voir la liste des achats et des ventes effectués pour une crypto-monnaie spécifique.
 * Il peut également modifier ou supprimer un achat ou une vente existant.
 * L'écran affiche les détails de chaque achat et vente, y compris la date, le prix et le montant.
 * L'utilisateur peut également ajouter une vente de la crypto-monnaie USDC si un achat de la crypto-monnaie sélectionnée est supprimé.
 */
const EcranHistoriqueCrypto = () => { // Composant fonctionnel EcranHistoriqueCrypto 
  const [achats, setAchats] = useState<Achat[]>([]); // État local achats : tableau d'achats (initialisé à un tableau vide)
  const [ventes, setVentes] = useState<Vente[]>([]); // État local ventes : tableau de ventes (initialisé à un tableau vide)
  const [modalVisible, setModalVisible] = useState(false); // État local modalVisible : booléen indiquant si la modal est visible (initialisé à faux)
  const [showDatePicker, setShowDatePicker] = useState(false); // État local showDatePicker : booléen indiquant si le date picker est visible (initialisé à faux)
  const [selectedItem, setSelectedItem] = useState<Achat | Vente | null>(null); // État local selectedItem : achat ou vente sélectionné (initialisé à null) 
  const [type, setType] = useState<'achat' | 'vente' | null>(null); // État local type : type de l'élément sélectionné (achat ou vente) (initialisé à null)
  const [date, setDate] = useState(new Date()); // État local date : date de l'élément sélectionné (initialisé à la date actuelle)
  const [prix, setPrix] = useState(''); // État local prix : prix de l'élément sélectionné (initialisé à une chaîne vide) 
  const [montant, setMontant] = useState(''); // État local montant : montant de l'élément sélectionné (initialisé à une chaîne vide)
  const [usdcCrypto, setUsdcCrypto] = useState<Crypto | null>(null); // État local usdcCrypto : crypto-monnaie USDC (initialisé à null)
  const [usdcAmount, setUsdcAmount] = useState<number>(0); // État local usdcAmount : montant de la crypto-monnaie USDC (initialisé à 0)
  const route = useRoute<EcranHistoriqueCryptoRouteProp>(); // Récupère la route HistoriqueCrypto de l'application 
  const { cryptoId, cryptoNom } = route.params;

  /**
   * useEffect : Hook d'effet pour effectuer des actions après le rendu de l'écran
   * 
   * useEffect prend une fonction de rappel qui sera exécutée après le rendu de l'écran.
   * Le hook useEffect est déclenché lorsque l'identifiant de la crypto-monnaie change.
   */
  useEffect(() => {
    fetchData(); // Appel à la fonction fetchData pour récupérer les données d'achats et de ventes
    fetchUSDC(); // Appel à la fonction fetchUSDC pour récupérer les données de la crypto-monnaie USDC 
  }, [cryptoId]); // Déclenche l'effet lorsque l'identifiant de la crypto-monnaie change 


  /**
   * Fonction fetchData : récupère les données des achats et des ventes de la crypto-monnaie
   * 
   * La fonction fetchData est une fonction asynchrone qui se connecte à la base de données,
   * récupère les achats et les ventes de la crypto-monnaie spécifiée, les trie par date décroissante
   * et met à jour les états achats et ventes avec les données récupérées.
   */
  const fetchData = async () => {
    try {
      const db = await getDBConnection(); // Connexion à la base de données 
      const achats = await obtenirAchats(db, cryptoId); // Récupération des achats de la crypto-monnaie 
      const ventes = await obtenirVentes(db, cryptoId); // Récupération des ventes de la crypto-monnaie

      achats.sort((a, b) => new Date(b.dateAchat).getTime() - new Date(a.dateAchat).getTime()); // Tri des achats par date décroissante, a et b sont des achats qui sont comparés par date de façon décroissante 
      ventes.sort((a, b) => new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime()); // Tri des ventes par date décroissante, a et b sont des ventes qui sont comparées par date de façon décroissante

      setAchats(achats); // Mise à jour de l'état achats avec les données récupérées 
      setVentes(ventes); // Mise à jour de l'état ventes avec les données récupérées 
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

  /**
   * Fonction fetchUSDC : récupère les données de la crypto-monnaie USDC
   * 
   * La fonction fetchUSDC est une fonction asynchrone qui se connecte à la base de données,
   * récupère les données de la crypto-monnaie USDC, les stocke dans l'état usdcCrypto
   * et récupère le prix actuel de la crypto-monnaie USDC, stocké dans l'état usdcAmount.
   */
  const fetchUSDC = async () => {
    try {
      const db = await getDBConnection(); // Connexion à la base de données
      const cryptos = await obtenirCryptos(db); // Récupération des crypto-monnaies 
      const usdc = cryptos.find(crypto => crypto.acronyme.toLowerCase() === 'usdc'); // Recherche de la crypto-monnaie USDC dans la liste des crypto-monnaies 
      if (usdc) { // Si la crypto-monnaie USDC est trouvée 
        setUsdcCrypto(usdc); // Mise à jour de l'état usdcCrypto avec les données de la crypto-monnaie USDC 
        setUsdcAmount(await obtenirPrixCrypto('usdc')); // Mise à jour de l'état usdcAmount avec le prix de la crypto-monnaie USDC
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des USDC :", error);
    }
  };

  /**
   * Fonction openModal : ouvre la modal de modification de l'achat ou de la vente sélectionné
   * 
   * @param {Achat | Vente} item Achat ou vente sélectionné
   * @param {'achat' | 'vente'} type Type de l'élément sélectionné (achat ou vente)
   * 
   * La fonction openModal prend un achat ou une vente et le type de l'élément sélectionné.
   * Elle met à jour les états selectedItem, type, date, prix et montant avec les données de l'élément sélectionné
   * et affiche la modal de modification.
   */
  const openModal = (item: Achat | Vente, type: 'achat' | 'vente') => {
    setSelectedItem(item); // Mise à jour de l'élément sélectionné avec l'achat ou la vente 
    setType(type); // Mise à jour du type de l'élément sélectionné (achat ou vente) 
    setDate(type === 'achat' ? new Date((item as Achat).dateAchat) : new Date((item as Vente).dateVente)); // Mise à jour de la date de l'élément sélectionné 
    setPrix(type === 'achat' ? (item as Achat).prixAchat.toString() : (item as Vente).prixVente.toString()); // Mise à jour du prix de l'élément sélectionné 
    setMontant(type === 'achat' ? (item as Achat).montantInvesti.toString() : (item as Vente).montantVendu.toString()); // Mise à jour du montant de l'élément sélectionné 
    setModalVisible(true);
  };

  /**
   * Fonction handleSave : met à jour l'achat ou la vente sélectionné
   * 
   * La fonction handleSave est une fonction asynchrone qui se connecte à la base de données,
   * met à jour l'achat ou la vente sélectionné avec les nouvelles données de date, prix et montant,
   * ajoute une vente de la crypto-monnaie USDC si l'achat de la crypto-monnaie USDC est modifié,
   * puis masque la modal et rafraîchit les données.
   */
  const handleSave = async () => {
    try {
      const db = await getDBConnection(); // Connexion à la base de données
      if (selectedItem && type) { // Si un élément et un type sont sélectionnés 
        const newPrixAchat = parseFloat(prix); // Conversion du prix en nombre flottant 
        const newMontantInvesti = parseFloat(montant); // Conversion du montant en nombre flottant 
        if (type === 'achat') { // Si le type est un achat 
          await mettreAJourAchat(db, { // Mise à jour de l'achat dans la base de données 
            ...selectedItem, // Copie des données de l'achat sélectionné dans l'objet à mettre à jour 
            dateAchat: date.toISOString().split('T')[0], // Mise à jour de la date de l'achat 
            prixAchat: isNaN(newPrixAchat) ? 0 : newPrixAchat, // Mise à jour du prix de l'achat 
            montantInvesti: isNaN(newMontantInvesti) ? 0 : newMontantInvesti, // Mise à jour du montant de l'achat 
          });
          if (usdcCrypto && (selectedItem as Achat).cryptoId === usdcCrypto.id) { // Si la crypto-monnaie USDC est sélectionnée 
            const venteUSDC: Vente = { // Création d'une vente de la crypto-monnaie USDC 
              id: 0, // Identifiant de la vente initialisé à 0 pour l'ajout 
              cryptoId: usdcCrypto.id, // Identifiant de la crypto-monnaie USDC 
              prixVente: 1, // Prix de vente de la crypto-monnaie USDC (1 USD par USDC), car c'est une crypto stable "stablecoin"
              montantVendu: parseFloat(montant), // Montant vendu de la crypto-monnaie USDC 
              dateVente: date.toISOString().split('T')[0], // Date de vente de la crypto-monnaie USDC 
            };
            await ajouterVente(db, venteUSDC); // Ajout de la vente de la crypto-monnaie USDC dans la base de données 
          }
        } else { // Si le type est une vente 
          const newPrixVente = parseFloat(prix); // Conversion du prix en nombre flottant 
          const newMontantVendu = parseFloat(montant); // Conversion du montant en nombre flottant 
          await mettreAJourVente(db, { // Mise à jour de la vente dans la base de données 
            ...selectedItem, // Copie des données de la vente sélectionnée dans l'objet à mettre à jour
            dateVente: date.toISOString().split('T')[0], // Mise à jour de la date de la vente, date convertie en chaîne de caractères, T est le séparateur entre la date et l'heure; 0 est l'indice de la date 
            prixVente: isNaN(newPrixVente) ? 0 : newPrixVente, // Mise à jour du prix de la vente, isNaN vérifie si la valeur n'est pas un nombre, si c'est le cas, la valeur est 0 
            montantVendu: isNaN(newMontantVendu) ? 0 : newMontantVendu, // Mise à jour du montant de la vente
          });
        }
        setModalVisible(false); // Masque la modal après la mise à jour 
        await fetchData(); // Rafraîchit les données après la mise à jour 
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
    }
  };

  /**
   * Fonction handleDelete : supprime l'achat ou la vente sélectionné 
   * après confirmation de la suppression, une alerte de confirmation s'affiche 
   * pour demander à l'utilisateur de confirmer la suppression
   * 
   * Si l'utilisateur confirme la suppression, l'élément est supprimé de la base de données
   * et les données sont rafraîchies
   */
  const handleDelete = async () => {
    try {
      const db = await getDBConnection();
      if (selectedItem && type) { // Si un élément et un type sont sélectionnés
        if (type === 'achat') { // Si le type est un achat 
          await supprimerAchat(db, selectedItem.id); // Suppression de l'achat dans la base de données 
          if (usdcCrypto && (selectedItem as Achat).cryptoId === usdcCrypto.id) { // Si la crypto-monnaie USDC est sélectionnée 
            const venteUSDC: Vente = { // Création d'une vente de la crypto-monnaie USDC 
              id: 0, // Identifiant de la vente initialisé à 0 pour l'ajout
              cryptoId: usdcCrypto.id, // Identifiant de la crypto-monnaie USDC
              prixVente: 1, // Prix de vente de la crypto-monnaie USDC (1 USD par USDC), car c'est une crypto stable "stablecoin"
              montantVendu: (selectedItem as Achat).montantInvesti, // Montant vendu de la crypto-monnaie USDC, selectItem permet de récupérer les données de l'achat sélectionné 
              dateVente: (selectedItem as Achat).dateAchat, // Date de vente de la crypto-monnaie USDC
            };
            await ajouterVente(db, venteUSDC); // Ajout de la vente de la crypto-monnaie USDC dans la base de données 
          }
        } else { // Si le type est une vente 
          await supprimerVente(db, selectedItem.id); // Suppression de la vente dans la base de données 
        }
        setModalVisible(false); // Masque la modal après la suppression 
        await fetchData(); // Refresh data after delete
      }
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
    }
  };

  /**
   * Fonction confirmDelete : affiche une alerte de confirmation pour demander à l'utilisateur de confirmer la suppression
   */
  const confirmDelete = () => {
    Alert.alert(
      'Confirmation de suppression',
      'Êtes-vous sûr de vouloir supprimer cet enregistrement ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: handleDelete,
          style: 'destructive',
        },
      ],
      { cancelable: false } // L'utilisateur ne peut pas annuler l'alerte en appuyant à l'extérieur de celle-ci 
    );
  };

  /**
   * Fonction onChangeDate : met à jour la date de l'élément sélectionné 
   * lorsque la date est modifiée dans le date picker 
   * 
   * @param {any} event Événement de changement de date
   * @param {Date} selectedDate Date sélectionnée dans le date picker 
   */
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date; // Si la date sélectionnée est définie, elle est utilisée, sinon la date actuelle est utilisée
    setShowDatePicker(Platform.OS === 'ios'); // Affiche le date picker sur iOS 
    setDate(currentDate); // Mise à jour de la date de l'élément sélectionné 
  };

  /**
   * Fonction renderAchatItem : rendu d'un élément de la liste des achats 
   * 
   * @param {{ item: Achat }} param0 Propriétés de l'élément à afficher, Achat est un achat de crypto-monnaie 
   * @return {JSX.Element} Élément JSX représentant un achat de crypto-monnaie
   */
  const renderAchatItem = ({ item }: { item: Achat }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => openModal(item, 'achat')}>
      <Text style={styles.itemText}><Text style={styles.itemLabel}>Achat : </Text>{item.dateAchat}</Text>
      <Text style={styles.itemText}><Text style={styles.itemLabel}>Prix : </Text>{item.prixAchat} $</Text>
      <Text style={styles.itemText}><Text style={styles.itemLabel}>Montant : </Text>{item.montantInvesti} $</Text>
    </TouchableOpacity>
  );

  /**
   * Fonction renderVenteItem : rendu d'un élément de la liste des ventes
   * 
   * @param {{ item: Vente }} param0 Propriétés de l'élément à afficher, Vente est une vente de crypto-monnaie 
   * @return {JSX.Element} Élément JSX représentant une vente de crypto-monnaie
   */
  const renderVenteItem = ({ item }: { item: Vente }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => openModal(item, 'vente')}> 
      <Text style={styles.itemText}><Text style={styles.itemLabel}>Vente : </Text>{item.dateVente}</Text> 
      <Text style={styles.itemText}><Text style={styles.itemLabel}>Prix : </Text>{item.prixVente} $</Text> 
      <Text style={styles.itemText}><Text style={styles.itemLabel}>Montant : </Text>{item.montantVendu} $</Text>
    </TouchableOpacity>
  );

  /**
   * Rendu de l'écran EcranHistoriqueCrypto
   */
  return (
    <ImageBackground source={require('../../images/fond_20.png')} style={styles.backgroundImage}> 
      <View style={styles.container}> 
        <Text style={styles.title}>Historique de {cryptoNom}</Text> 
        <Text style={styles.subtitle}>Achats</Text> 
        <FlatList 
          data={achats}
          renderItem={renderAchatItem} 
          keyExtractor={item => item.id.toString()}  
          numColumns={2} 
        />
        <Text style={styles.subtitle}>Ventes</Text>
        <FlatList
          data={ventes}
          renderItem={renderVenteItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
        />
      </View>
      
      {selectedItem && ( 
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)} 
        >
          <View style={styles.modalView}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modifier {type === 'achat' ? 'Achat' : 'Vente'}</Text> 
              <Text style={styles.inputLabel}>Date actuelle: {date.toISOString().split('T')[0]}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <Text style={styles.dateText}>{date.toISOString().split('T')[0]}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onChangeDate} 
                />
              )}
              <Text style={styles.inputLabel}>Prix actuel</Text>
              <TextInput
                style={styles.input}
                value={prix}
                onChangeText={text => setPrix(text.replace(/[^0-9.]/g, ''))}
                placeholder="Prix"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>Montant actuel</Text>
              <TextInput
                style={styles.input}
                value={montant}
                onChangeText={text => setMontant(text.replace(/[^0-9.]/g, ''))}
                placeholder="Montant"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.buttonSave]} onPress={handleSave}>
                  <Text style={styles.buttonText}>Enregistrer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonDelete]} onPress={confirmDelete}>
                  <Text style={styles.buttonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ImageBackground>
  );
};

export default EcranHistoriqueCrypto;
