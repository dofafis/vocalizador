import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Usuario } from '../usuario';

const API = 'http://93.188.167.70';

@Injectable({ providedIn: 'root' })
export class RegistrationService {

    constructor(private http: HttpClient) {}

    criarUsuario(usuario: Usuario) {

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        })
      };

      usuario.adm = 'ldc2396';
      
      return this.http
        .post<Usuario>(API + '/usuarios', usuario, httpOptions);

    }

}
