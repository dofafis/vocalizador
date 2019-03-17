import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { LoginInfo } from '../login-info';

const API = 'http://93.188.167.70';

@Injectable({ providedIn: 'root' })
export class LoginService {

    constructor(private http: HttpClient) {}

    logarUsuario(loginInfo: LoginInfo) {

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        })
      };

      return this.http
        .post<LoginInfo>(API + '/tokens', loginInfo, httpOptions);

    }

}
