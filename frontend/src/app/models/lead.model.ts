export interface Lead {
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly phone: string;
  readonly productInterest: string;
  readonly message: string;
}

export interface LeadReceipt {
  readonly registration: string;
  readonly productLabel: string;
  readonly source: string;
}
