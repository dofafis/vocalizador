import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from '../models/token';
import { Observable } from 'rxjs';
import { Cartao } from '../models/cartao';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class CartaoService {

  constructor(private http: HttpClient) {}

  getTodosCartoes(token: Token) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'token': token.id,
      })
    };

    return this.http.get(API + '/cartoes', httpOptions);
  }

  getImagemCartao(token: Token, id_cartao: string) : Observable<Blob> {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
        'token': token.id,
      })
    };

    return this.http.get<Blob>(API + '/arquivos/cartoes?id=' + id_cartao, httpOptions);
  }

  cadastrarCartao(token: Token, cartao: Cartao) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'token': token.id
      })
    };

    return this.http
      .post(API + '/cartoes', cartao, httpOptions);
  }

  cadastrarImagemCartao(token: Token, cartao: Cartao, imagemCartao: File) {
    const uploadData = new FormData();
    const id = cartao.id.toString();
    uploadData.append('id', id);
    uploadData.append('imagem', imagemCartao);

    const httpOptions = {
      headers: new HttpHeaders({
        'token': token.id
      })
    };

    return this.http.post(API + '/arquivos/cartoes', uploadData, httpOptions);
  }

  editarCartao(token: Token, cartao: Cartao) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'token': token.id
      })
    };

    return this.http
      .put(API + '/cartoes', cartao, httpOptions);
  }

  editarImagemCartao(token: Token, cartao: Cartao, imagemCartao: File) {
    const uploadData = new FormData();
    const id = cartao.id.toString();
    uploadData.append('id', id);
    uploadData.append('imagem', imagemCartao);

    const httpOptions = {
      headers: new HttpHeaders({
        'token': token.id
      })
    };

    return this.http.put(API + '/arquivos/cartoes', uploadData, httpOptions);
  }

  deletarCartao(token: Token, id_cartao: number) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'token': token.id
      })
    };

    return this.http
      .delete(API + '/cartoes?id=' + id_cartao, httpOptions);
  }
}
