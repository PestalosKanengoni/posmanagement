import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { ApplicationsResponse } from "../models/teller.model";
import { StorageService } from "./storage.service";

export interface ActionPayload {
  remarks: string;
  status: string;
  applicationId: string;
  chargeCodes: any[];
}

@Injectable({ providedIn: "root" })
export class MerchantAnalystService {

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

  getApplications(): Observable<any> {
    const url = `${this.base}/posman/application/my-applications/AWAITING_MSA_ACTIONING`
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

  actionApplication(payload: ActionPayload): Observable<any> {
    const url = `${this.base}/posman/application/action`;
      
      // Pass the headers as the third argument
      return this.http.post(url, payload, { headers: this.getHeaders() }).pipe(
        tap(response => console.log('Authorisation Response:', response)),
        catchError(error => {
          console.error('Authorisation error:', error);
          return throwError(() => error);
        })
      );
      }
    // return this.http.post<any>(`${this.base}/application/action`, payload);
  

  getAllApplications(): Observable<ApplicationsResponse> {
    const url = `${this.base}/posman/application/my-applications/ALL`;
    return this.http.get<ApplicationsResponse>(url, { headers: this.getHeaders() }).pipe(
      map((response: any) => response),
      catchError(error => throwError(() => error))
    );
  }
}
