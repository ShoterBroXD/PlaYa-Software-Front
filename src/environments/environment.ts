export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  uploadsUrl: 'http://localhost:8080/uploads', // Para archivos multimedia
  wsUrl: 'ws://localhost:8080/ws', // Para notificaciones en tiempo real (opcional)
  cloudinary: {
    cloudName: 'dqlmwemvr',
    uploadPreset: 'PlaYaUpload',
    folder: 'playa/songs',
  },
};
