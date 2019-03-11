import { SafeUrl } from '@angular/platform-browser';

export interface Cartao {
  id: number;
  id_categoria: number;
  nome: string;
  imagem: SafeUrl;
}
