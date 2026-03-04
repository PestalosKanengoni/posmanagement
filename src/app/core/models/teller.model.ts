
export interface PosCategory {
  id: string;
  name: string;
  description: string;
}

export interface PosRequest {
  id: string;
  category: PosCategory;
  tradeName: string;
  location: string;
  merchantCategoryCode: string;
  account: string | null;
  status: string;
  remarks: string;
  approvedAt: string | null;
  chargeCodes: ChargeCode[];
  accounts: Account[];
}

export interface PosApplication {
  id:string;
  remarks: string;
  approvedAt: string | null;
  approvalStatus: string;
  requests: PosRequest[];
  chargeCodes: ChargeCode[];
}

export interface ApplicationsResponse {
  data: PosApplication[];
  responseCode: string;
  responseDescription: string;
}

export interface ChargeCode {
  id: string;
  code: string;
  description: string;
  percentage: string;
  currency: string;
  created?: string;
  updated?: string;
}

export interface AuthorisePayload {
  remarks: string;
  status: 'APPROVED' | 'REJECTED';
  applicationId: string;
  chargeCodes: ChargeCode[];
}

export interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  customerId: string;
  isPrimary: boolean;
}
