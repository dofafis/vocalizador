import { SafeUrl } from '@angular/platform-browser';

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  imagem: SafeUrl;
}
