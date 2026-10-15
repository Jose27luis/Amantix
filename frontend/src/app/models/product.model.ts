export interface ProductFeature {
  readonly title: string;
  readonly description: string;
}

export interface ProductScreenshot {
  readonly title: string;
  readonly description: string;
  readonly image: string;
}

export interface PreguntaFrecuente {
  readonly pregunta: string;
  readonly respuesta: string;
}

export interface Product {
  readonly slug: string;
  readonly code: string;
  readonly systemRef: 'pro8' | 'mozo4' | 'agente';
  readonly name: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly image: string;
  readonly heroImage: string;
  readonly features: readonly ProductFeature[];
  readonly screenshots: readonly ProductScreenshot[];
  readonly faqs: readonly PreguntaFrecuente[];
  readonly productionUrl: string;
}
