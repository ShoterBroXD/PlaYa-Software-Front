export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',//'https://playa-software.onrender.com/api/v1',
  uploadsUrl: 'https://playa-software.onrender.com/uploads', // Para archivos multimedia
  wsUrl: 'wss://playa-software.onrender.com/ws', // Para notificaciones en tiempo real (opcional)
  cloudinary: {
    cloudName: 'dqlmwemvr',
    uploadPreset: 'PlaYaUpload',
    folder: 'playa/songs',
  },
};
