import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from '../models/token';
import { Observable } from 'rxjs';
import { Painel } from '../models/painel';

const API = 'http://93.188.167.70';

@Injectable({ providedIn: 'root' })
export class PainelService {

  constructor(private http: HttpClient) {}

  getPaineisUsuario(token: Token, id_usuario: number) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'token': token.id,
      })
    };

    return this.http.get(API + '/paineis?id_usuario=' + id_usuario, httpOptions);
  }

  getPainel(token: Token, id_usuario: number, id: number) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'token': token.id,
      })
    };

    return this.http.get(API + '/paineis?id_usuario=' + id_usuario + '&&id=' + id, httpOptions);
  }


  cadastrarPainel(token: Token, painel: Painel) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'token': token.id
      })
    };
    console.log(painel);
    return this.http
      .post(API + '/paineis', painel, httpOptions);
  }

  addCartaoPainel(token: Token, id_painel: number, id_cartao: number) {
    const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'token': token.id
        })
      };
  
      return this.http
        .post(API + '/paineis?addcartao=true', { 'id_painel': id_painel, 'id_cartao': id_cartao }, httpOptions);
  }

  editarPainel(token: Token, painel: Painel) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'token': token.id
      })
    };

    return this.http
      .put(API + '/paineis', painel, httpOptions);
  }

  deletarPainel(token: Token, id_usuario: number, id_painel: number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'token': token.id
      })
    };

    return this.http
      .delete(API + '/paineis?id_usuario=' + id_usuario + '&&id=' + id_painel, httpOptions);
  }

  deletarCartaoDoPainel(token: Token, id_usuario: number, id_cartao: number, id_painel: number) {
    const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'token': token.id
        })
    };
  
    return this.http
        .delete(API + '/paineis?id_usuario=' + id_usuario + '&&id=' + id_painel + '&&id_cartao=' + id_cartao, httpOptions);
  }
}
