
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
}

export interface PosApplication {
  id:string;
  remarks: string;
  approvedAt: string | null;
  approvalStatus: string;
  requests: PosRequest[];
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
  status: 'APPROVED' | 'DECLINED';
  applicationId: string;
  chargeCodes: ChargeCode[];
}
