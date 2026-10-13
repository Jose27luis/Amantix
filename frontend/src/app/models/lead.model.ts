export interface Lead {
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly phone: string;
  readonly productInterest: string;
  readonly message: string;
  readonly website: string;
}

export interface LeadPayload {
  readonly nombre: string;
  readonly empresa: string | null;
  readonly correo: string;
  readonly telefono: string | null;
  readonly producto: string | null;
  readonly mensaje: string;
  readonly origen: 'contacto';
  readonly sitio_web: string;
}

export interface LeadCreatedResponse {
  readonly codigo: string;
  readonly producto: string | null;
  readonly origen: string;
}

export interface LeadReceipt {
  readonly registration: string;
  readonly productLabel: string;
  readonly source: string;
}

export interface ApiValidationError {
  readonly message: string;
  readonly errors?: Readonly<Record<string, readonly string[]>>;
}
