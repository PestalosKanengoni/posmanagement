import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, Observable, tap, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { StorageService } from "./storage.service";

export interface CreatePosPayload {
  serial: string;
  description: string;
  status: string;
}

export interface CreateMsisdnPayload {
  msisdn: string;
  serial: string;
  mno: string;
  status: string;
}

@Injectable({ providedIn: "root" })
export class DevicesService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient, private storageService: StorageService) {}

  private getHeaders(): HttpHeaders {
    const token = this.storageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createPos(payload: CreatePosPayload): Observable<any> {
    return this.http.post(`${this.base}/posman/application/create-pos`, payload, { headers: this.getHeaders() }).pipe(
      tap(res => console.log('Create POS:', res)),
      catchError(err => { console.error('Create POS error:', err); return throwError(() => err); })
    );
  }

  createMsisdn(payload: CreateMsisdnPayload): Observable<any> {
    return this.http.post(`${this.base}/posman/application/create-msisdn`, payload, { headers: this.getHeaders() }).pipe(
      tap(res => console.log('Create MSISDN:', res)),
      catchError(err => { console.error('Create MSISDN error:', err); return throwError(() => err); })
    );
  }
}