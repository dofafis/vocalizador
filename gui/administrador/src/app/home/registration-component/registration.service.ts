import { HttpClient, HttpParams, HttpHeaderResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Usuario } from '../usuario';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class RegistrationService {

    constructor(private http: HttpClient) {}

    criarUsuario(usuario: Usuario) {

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        })
      };

      return this.http
        .post<Usuario>(API + '/usuarios', usuario, httpOptions);

    }

}
