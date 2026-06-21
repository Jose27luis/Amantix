export interface ProductFeature {
  readonly title: string;
  readonly description: string;
}

export interface Product {
  readonly slug: string;
  readonly code: string;
  readonly systemRef: 'pro8' | 'mozo4' | 'agente';
  readonly name: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly image: string;
  readonly features: readonly ProductFeature[];
  readonly productionUrl: string;
}
