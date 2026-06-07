import { initializeFirebase } from "@/firebase";

// Centraliza o uso do Firebase usando a inicialização padronizada do projeto
// Isso evita erros de chaves de API inválidas e conflitos de instâncias.
const { auth, db } = initializeFirebase();

export { auth, db };