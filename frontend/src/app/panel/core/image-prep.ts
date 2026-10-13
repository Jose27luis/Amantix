const LADO_MAXIMO = 1920;
const CALIDAD = 0.86;
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

export interface ImagenPreparada {
  readonly archivo: File;
  readonly ancho: number;
  readonly alto: number;
}

export function tipoAceptado(archivo: File): boolean {
  return TIPOS.includes(archivo.type);
}

export async function prepararImagen(archivo: File): Promise<ImagenPreparada> {
  const mapa = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
  const escala = Math.min(1, LADO_MAXIMO / Math.max(mapa.width, mapa.height));
  const ancho = Math.round(mapa.width * escala);
  const alto = Math.round(mapa.height * escala);

  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;

  const contexto = lienzo.getContext('2d');
  if (contexto === null) {
    mapa.close();
    throw new Error('El navegador no pudo procesar la imagen.');
  }

  contexto.fillStyle = '#ffffff';
  contexto.fillRect(0, 0, ancho, alto);
  contexto.drawImage(mapa, 0, 0, ancho, alto);
  mapa.close();

  const blob = await new Promise<Blob>((resolver, rechazar) => {
    lienzo.toBlob(
      (resultado: Blob | null) => (resultado ? resolver(resultado) : rechazar(new Error('No se pudo convertir la imagen.'))),
      'image/jpeg',
      CALIDAD,
    );
  });

  const nombre = archivo.name.replace(/\.[^.]+$/u, '') + '.jpg';

  return { archivo: new File([blob], nombre, { type: 'image/jpeg' }), ancho, alto };
}
