import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, Observable, tap, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { StorageService } from "./storage.service";

export interface MsisdnDevice {
  id: string;
  created?: string;
  updated?: string;
  msisdn: string;
  serial: string;
  mno: string;
  status: string;
}

export interface PosDevice {
  id: string;
  serial: string;
  description: string;
  status: string;
}

export interface LinkToPosPayload {
  id: string;         // terminal id
  pos: {
    id: string;       // selected pos device id
    serial: string;
    description: string;
    status: string;
  };
  msisdn: {
    id: string;       // selected msisdn id
    msisdn: string;
    serial: string;
    mno: string;
    status: string;
  };
}

@Injectable({ providedIn: "root" })
export class LinkingService {

  constructor(private http: HttpClient,private storageService: StorageService) {}

  private base = environment.apiUrl; // http://192.x.x.x:8099/posman

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

    getPosDevices(): Observable<any> {
    return this.http.get(`${this.base}/posman/application/pos/IDLE`, { headers: this.getHeaders() }).pipe(
      tap(res => console.log('POS devices:', res)),
      catchError(err => { console.error('POS devices error:', err); return throwError(() => err); })
    );
  }

  getMsisdnList(): Observable<any> {
    return this.http.get(`${this.base}/posman/application/msisdn/IDLE`, { headers: this.getHeaders() }).pipe(
      tap(res => console.log('MSISDN list:', res)),
      catchError(err => { console.error('MSISDN list error:', err); return throwError(() => err); })
    );
  }




  getPendingLinking(): Observable<any> {
    const url = `${this.base}/posman/application/merchants/pending-linking`;
    return this.http.get(url, { headers: this.getHeaders() }).pipe(
      tap(response => console.log(' pending:', response)),
      catchError(error => {
        console.error('error :', error);
        return throwError(() => error);
      })
    );
    
  }

   

  linkToPos(payload: LinkToPosPayload): Observable<any> {
      const url = `${this.base}/posman/application/link-to-pos`;
    
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
