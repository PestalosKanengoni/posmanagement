import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { ApplicationsResponse, AuthorisePayload, ChargeCode } from "../models/teller.model";
import { StorageService } from "./storage.service";

export interface ChargeCodeResponse {
  data: ChargeCode[];
  responseCode: string;
  responseDescription: string;
}

@Injectable({ providedIn: "root" })
export class ManagerService {

  constructor(private http: HttpClient,private storageService: StorageService) {}

  private getHeaders(): HttpHeaders {
    const token = this.storageService.getToken();

    if (!token) {
      console.warn('No authentication token found');
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private base = environment.apiUrl;


  /** GET /posman/application/my-applications/AWAITING_TELLER_APPROVAL */
  getApplications(): Observable<ApplicationsResponse> {
  const url = `${this.base}/posman/application/my-applications/AWAITING_BM_APPROVAL`
    return this.http.get<ApplicationsResponse>(url, { headers: this.getHeaders()}).pipe(
        map((response: any) => {
          console.log('requests fetched:', response);
          return response
        }),
        catchError(error => {
        console.error('Error fetching MCCs:', error);
        return throwError(() => error);
      })
      );
    }

    getChargeCodes(): Observable<ChargeCodeResponse> {
  const url = `${this.base}/posman/application/chargeCode`;
  return this.http.get<ChargeCodeResponse>(url, { headers: this.getHeaders() }).pipe(
    tap(res => console.log('Charge codes fetched:', res)),
    catchError(err => {
      console.error('Error fetching charge codes:', err);
      return throwError(() => err);
    })
  );
}

getAllApplications(): Observable<ApplicationsResponse> {
  const url = `${this.base}/posman/application/my-applications/ALL`;
  return this.http.get<ApplicationsResponse>(url, { headers: this.getHeaders() }).pipe(
    map((response: any) => response),
    catchError(error => throwError(() => error))
  );
}
   
  

  /** POST /posman/application/authorise */
  authorise(payload: AuthorisePayload): Observable<any> {
    const url = `${this.base}/posman/application/authorise`;
  
  // Pass the headers as the third argument
  return this.http.post(url, payload, { headers: this.getHeaders() }).pipe(
    tap(response => console.log('Authorisation successful:', response)),
    catchError(error => {
      console.error('Authorisation error:', error);
      return throwError(() => error);
    })
  );
  }
}
