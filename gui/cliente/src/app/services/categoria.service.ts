import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Token } from '../models/token';
import { Categoria } from '../models/categoria';
import { Observable } from 'rxjs';

const API = 'http://93.188.167.70';

@Injectable({ providedIn: 'root' })
export class CategoriaService {

    constructor(private http: HttpClient) {}

    getTodasCategorias() {

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        })
      };

      return this.http
        .get(API + '/categorias', httpOptions);

    }

    getCategoria(id_categoria: number) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        })
      };

      return this.http
        .get(API + '/categorias?id=' + id_categoria, httpOptions);

    }

    getImagemCategoria(token: Token, id_categoria: string): Observable<Blob> {
      const httpOptions = {
        responseType: 'blob' as 'json',
        headers: new HttpHeaders({
          'Content-Type': 'multipart/form-data',
          'token': token.id,
        })
      };

      return this.http.get<Blob>(API + '/arquivos/categorias?id=' + id_categoria, httpOptions);
    }

    cadastrarCategoria(token: Token, categoria: Categoria) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'token': token.id
        })
      };

      return this.http
        .post(API + '/categorias', categoria, httpOptions);
    }

    cadastrarImagemCategoria(token: Token, categoria: Categoria, imagemCategoria: File) {
      const uploadData = new FormData();
      const id = categoria.id.toString();
      uploadData.append('id', id);
      uploadData.append('imagem', imagemCategoria);

      const httpOptions = {
        headers: new HttpHeaders({
          'token': token.id
        })
      };

      return this.http.post(API + '/arquivos/categorias', uploadData, httpOptions);
    }

    editarCategoria(token: Token, categoria: Categoria) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'token': token.id
        })
      };

      return this.http
        .put(API + '/categorias', categoria, httpOptions);
    }

    editarImagemCategoria(token: Token, categoria: Categoria, imagemCategoria: File) {
      const uploadData = new FormData();
      const id = categoria.id.toString();
      uploadData.append('id', id);
      uploadData.append('imagem', imagemCategoria);

      const httpOptions = {
        headers: new HttpHeaders({
          'token': token.id
        })
      };

      return this.http.put(API + '/arquivos/categorias', uploadData, httpOptions);
    }

    deletarCategoria(token: Token, id_categoria: number) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'token': token.id
        })
      };

      return this.http
        .delete(API + '/categorias?id=' + id_categoria, httpOptions);
    }

}
