// Fichier src/styles/EcranAjoutAchatStyles.ts

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '90%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // noir transparent à 50%
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white', // liseré
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center', // centrer le texte
  },
  input: {
    height: 40,
    borderColor: 'green', // Liseré doré
    borderWidth: 2,
    backgroundColor: '#fff', // Fond blanc
    borderRadius: 25, // Bords plus arrondis
    paddingHorizontal: 10,
    color: '#000', // Texte noir pour assurer la lisibilité
    textAlign: 'center', // centrer le texte
  },
  dateInput: {
    height: 40,
    justifyContent: 'center',
    borderColor: 'green', // Liseré doré
    borderWidth: 2,
    backgroundColor: '#fff', // Fond blanc
    borderRadius: 25, // Bords plus arrondis
    paddingHorizontal: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#000', // Texte noir
    textAlign: 'center', // centrer le texte
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#000', // Fond noir
    borderRadius: 25, // Bords plus arrondis
    borderWidth: 1, // Liseré doré
    borderColor: 'gold',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff', // Texte blanc
    fontSize: 16,
    fontWeight: 'bold',
  },
  soldeUSDC: {
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
});
