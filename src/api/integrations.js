import { httpClient } from './httpClient';
import { auth } from './auth';

// Helper para upload multipart
async function uploadToBackend(endpoint, file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');

    // Usamos fetch direto pois httpClient pode tentar stringify JSON
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Não setar Content-Type, o browser seta com boundary
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Erro no upload');
    }

    return response.json();
}

const RealIntegration = {
    // Upload Público (imagens de produto, avatar)
    UploadFile: async (file) => {
        // file pode vir como File object ou Blob
        const result = await uploadToBackend('/uploads/public', file);
        // Lucro Certo retornava { url, fileId, ... }
        // Backend retorna { url, key }
        return {
            url: result.url,
            url_final: result.url,
            file_id: result.key
        };
    },

    // Upload Privado (docs, notas)
    UploadPrivateFile: async (file) => {
        const result = await uploadToBackend('/uploads/private', file);
        return {
            file_id: result.key,
            key: result.key
        };
    },

    // Obter URL assinada
    CreateFileSignedUrl: async (key) => {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/uploads/private/${key}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data.url; // Retorna string url direta
    },

    // Mocks restantes
    InvokeLLM: async () => { console.warn('IA não implementada'); return {}; },
    SendEmail: async () => { console.warn('Email não implementado'); return {}; },
    GenerateImage: async () => { console.warn('Gerar Imagem não implementado'); return {}; },
    ExtractDataFromUploadedFile: async () => { },
};

export const Core = RealIntegration;
export const InvokeLLM = RealIntegration.InvokeLLM;
export const SendEmail = RealIntegration.SendEmail;
export const UploadFile = RealIntegration.UploadFile;
export const GenerateImage = RealIntegration.GenerateImage;
export const ExtractDataFromUploadedFile = RealIntegration.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = RealIntegration.CreateFileSignedUrl;
export const UploadPrivateFile = RealIntegration.UploadPrivateFile;
