import {FirebaseParameter} from "../models/firebase-parameter";

export const admin = require('firebase-admin');

// Verifica se a variável de ambiente existe
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK inicializado usando JSON de variável de ambiente.');
} else {
    // Fallback para GOOGLE_APPLICATION_CREDENTIALS ou erro
    console.warn('Variável FIREBASE_SERVICE_ACCOUNT_JSON não encontrada. Tentando GOOGLE_APPLICATION_CREDENTIALS...');
    admin.initializeApp(); // Tentará GOOGLE_APPLICATION_CREDENTIALS
}

export const getParametersByGroup = async (groupName: string): Promise<any> => {
    const template = await admin.remoteConfig().getTemplate();
    const groups = template.parameterGroups;

    const group = groups[groupName];

    if (!group) {
        return null; // grupo não encontrado
    }

    const parsed: Array<FirebaseParameter> = [];

    for (const key in group.parameters) {
        const parametro = group.parameters[key];
            const param = {
                nome: key,
                defaultValue: parametro.defaultValue.value,
            } as FirebaseParameter;

            parsed.push(param);
    }

    return parsed;
}

export const FirebaseService = {
    getParametersByGroup
}