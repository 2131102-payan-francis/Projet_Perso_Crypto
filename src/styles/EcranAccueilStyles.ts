// Fichier src/styles/EcranAccueilStyles.ts

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 50,
    },
    button: {
        marginVertical: 10,
        width: '65%',
        alignSelf: 'center',
        backgroundColor: '#000', // Fond noir
        borderWidth: 1, // Liseré
        borderColor: 'white', // Couleur du liseré
    },
    buttonText: {
        color: '#fff', // Écriture blanche
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        position: 'absolute',
        top: 100,
        width: '100%',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
});
