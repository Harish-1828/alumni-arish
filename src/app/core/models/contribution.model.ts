export type TransactionMode =
  | 'online'
  | 'upi'
  | 'netbanking'
  | 'card'
  | 'cheque'
  | 'cash';

export interface Contribution {
  _id?: string;
  id?: string;
  fundId: string;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  transactionMode: TransactionMode;
  notes?: string;
  anonymous?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface CreateContributionDto {
  fundId: string;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  transactionMode: TransactionMode;
  notes?: string;
  anonymous?: boolean;
}

export interface ContributionResponse {
  success: boolean;
  message: string;
  contributionId?: string;
}
