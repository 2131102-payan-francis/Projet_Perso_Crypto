// Fichier permissions.ts

/**
 Code inspiré de : - https://stackoverflow.com/questions/70715018/android-storage-and-camera-permission
                   - https://github.com/facebook/react-native/issues/36714
 */

import { PermissionsAndroid } from 'react-native';

/**
    * Fonction demanderPermissionsStockage
    * Demande à l'utilisateur les permissions d'accès au stockage
    * Retourne une promesse résolue avec un booléen indiquant si les permissions ont été accordées
    * ou une promesse rejetée avec un booléen indiquant si les permissions ont été refusées
    * ou une promesse rejetée avec une erreur si une erreur est survenue
    *
 */
export async function demanderPermissionsStockage(): Promise<boolean> {
    try {
        const autorisationsAccordees = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return autorisationsAccordees['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
            && autorisationsAccordees['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.warn(err);
        return false;
    }
}

/**
    * Fonction demanderPermissionCamera
    * Demande à l'utilisateur les permissions d'accès à la caméra
    * Retourne une promesse résolue avec un booléen indiquant si les permissions ont été accordées
    * ou une promesse rejetée avec un booléen indiquant si les permissions ont été refusées
    * ou une promesse rejetée avec une erreur si une erreur est survenue
    *
 */
export async function demanderPermissionCamera(): Promise<boolean> {
    try {
        const accordée = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
                title: "Permission d'accès à la caméra",
                message: "Cette application a besoin d'accéder à votre caméra.",
                buttonNeutral: "Demander plus tard",
                buttonNegative: "Annuler",
                buttonPositive: "OK"
            }
        );
        return accordée === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.warn(err);
        return false;
    }
}
