// Fichier src/styles/EcranAjoutCryptoStyles.ts

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 20,
    marginBottom: 60,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#ffffff', // Fond blanc
    color: 'black',
    borderWidth: 1, // Liseré bleu
    borderColor: '#007bff', // Couleur du liseré bleu
  },
  button: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#000', // Fond noir
    borderRadius: 10, // Coins arrondis
    alignItems: 'center',
    borderWidth: 1, // Liseré doré
    borderColor: 'gold', // Couleur du liseré doré
  },
  buttonText: {
    color: '#ffffff', // Texte blanc
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fond noir à 80% transparent
    borderColor: 'white', // Bordure dorée
    marginVertical: 10,
  },
  dropDownContainer: {
    maxHeight: 200, // Réduit la hauteur pour afficher 3 éléments
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fond noir à 80% transparent
    borderColor: 'white', // Bordure dorée
  },
  dropDownText: {
    color: '#fff', // Texte blanc pour les éléments de la liste déroulante
    textAlign: 'center', // Centre le texte
  },
  searchInput: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#ffffff', // Fond blanc
    color: 'black', // Texte noir pour la recherche
    borderWidth: 1, // Liseré bleu
    borderColor: '#007bff', // Couleur du liseré bleu
  },
  prixActuel: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#ffffff', // Texte blanc pour être visible sur l'arrière-plan
  },
});
