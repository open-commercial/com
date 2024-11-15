import { Injectable } from '@angular/core';
import * as crypto from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  getItem(key: string) {
    return this.decrypt(localStorage.getItem(key));
  }

  setItem(key: string, data: any) {
    localStorage.setItem(key, this.encrypt(data));
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }

  private static getSK() {
    return 'OtraVezMaritoPagaElAsado2025!';
  }

  private encrypt(data: any): string {
    return crypto.AES.encrypt(JSON.stringify(data), StorageService.getSK()).toString();
  }

  private decrypt(data: string) {
    if (data === null || data === undefined) { return null; }
    const bytes = crypto.AES.decrypt(data, StorageService.getSK());
    return JSON.parse(bytes.toString(crypto.enc.Utf8));
  }
}
