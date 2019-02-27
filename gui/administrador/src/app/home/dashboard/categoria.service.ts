import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

const API = 'http://localhost:3000';

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

}
