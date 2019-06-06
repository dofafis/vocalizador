import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, Inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Token } from '../token';
import { CategoriaService } from './categoria.service';
import { CartaoService } from './cartao.service';
import { Categoria } from '../categoria';
import { Cartao } from '../cartao';
import { DomSanitizer } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  currentToken: Token;
  categorias: Categoria[];
  cartoes: Cartao[];
  mostrarCartoes: number;

  criandoCategoria: boolean;
  criarCategoriaForm: FormGroup;
  erroCriarCategoria = '';

  criandoCartao: boolean;
  criarCartaoForm: FormGroup;
  erroCriarCartao = '';

  editandoCategoria: boolean;
  editarCategoriaForm: FormGroup;
  erroEditarCategoria = '';

  editandoCartao: boolean;
  editarCartaoForm: FormGroup;
  erroEditarCartao = '';

  breakpoint: any;
  arquivoSelecionado: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriaService: CategoriaService,
    private cartaoService: CartaoService,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private elementRef: ElementRef,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'white';
  }

  ngOnDestroy() {
    localStorage.setItem('mostrarCartoes', '0');
    localStorage.setItem('criandoCategoria', 'false');
    localStorage.setItem('criandoCartao', 'false');
    localStorage.setItem('editandoCategoria', 'false');
    localStorage.setItem('editandoCartao', 'false');
    this.erroCriarCategoria = '';
    this.erroCriarCartao = '';
    this.erroEditarCategoria = '';
    this.erroEditarCartao = '';

    this.criandoCategoria = localStorage.getItem('criandoCategoria') === 'true' ? true : false;
    this.criandoCartao = localStorage.getItem('criandoCartao') === 'true' ? true : false;
    this.editandoCategoria = localStorage.getItem('editandoCategoria') === 'true' ? true : false;
    this.editandoCartao = localStorage.getItem('editandoCartao') === 'true' ? true : false;

    this.mostrarCartoes = localStorage.getItem('criandoCategoria') ?  parseInt(localStorage.getItem('mostrarCartoes'), 10) : 0;
    this.mostrarCartoes = localStorage.getItem('criandoCartao') ?  parseInt(localStorage.getItem('mostrarCartoes'), 10) : 0;
    this.mostrarCartoes = localStorage.getItem('editandoCategoria') ?  parseInt(localStorage.getItem('mostrarCartoes'), 10) : 0;
    this.mostrarCartoes = localStorage.getItem('editandoCartao') ?  parseInt(localStorage.getItem('mostrarCartoes'), 10) : 0;
  }

  ngOnInit() {

    this.erroCriarCategoria = '';
    this.erroCriarCartao = '';
    this.erroEditarCategoria = '';
    this.erroEditarCartao = '';

    this.criandoCategoria = localStorage.getItem('criandoCategoria') === 'true' ? true : false;
    this.criandoCartao = localStorage.getItem('criandoCartao') === 'true' ? true : false;
    this.editandoCategoria = localStorage.getItem('editandoCategoria') === 'true' ? true : false;
    this.editandoCartao = localStorage.getItem('editandoCartao') === 'true' ? true : false;

    this.mostrarCartoes = localStorage.getItem('criandoCategoria') ?  parseInt(localStorage.getItem('mostrarCartoes'), 10) : 0;
    this.mostrarCartoes = localStorage.getItem('criandoCartao') ?  parseInt(localStorage.getItem('mostrarCartoes'), 10) : 0;
    this.mostrarCartoes = localStorage.getItem('editandoCategoria') ?  parseInt(localStorage.getItem('mostrarCartoes'), 10) : 0;
    this.mostrarCartoes = localStorage.getItem('editandoCartao') ?  parseInt(localStorage.getItem('mostrarCartoes'), 10) : 0;

    this.route.params.subscribe(params => {

      this.currentToken = params as Token;
      const currentDate = new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' ');
      if (typeof(this.currentToken.id) === 'undefined' || ( this.currentToken.validade < currentDate ) ) {
        this.router.navigate(['login']);
        this.openSnackBar('Faça login para utilizar o sistema!', 'X', 'snack-bar-loading', 7000);
      } else {
        this.categoriaService.getTodasCategorias()
          .subscribe(
            (response) => {
              this.categorias = response as Categoria[];

              // Já que conseguiu pegar as categorias, pegar as imagens por id de cada uma
              this.openSnackBar('Carregando...', 'X', 'snack-bar-loading', 1500);
              for (let i = 0; i < this.categorias.length; i++) {
                this.categoriaService.getImagemCategoria(this.currentToken, this.categorias[i].id.toString())
                  .subscribe(imagem => {
                    const imagemURL = URL.createObjectURL(imagem);
                    this.categorias[i].imagem = this.sanitizer.bypassSecurityTrustUrl(imagemURL);

                  },
                  error => {
                    this.openSnackBar('Erro ao carregar imagem da categoria "' + this.categorias[i].nome + '"', 'X', 'snack-bar-error', 7000);
                  }
                );
              }
            },
            (error) => {
              // @TODO Tratar erros e mensagens de erro
              this.openSnackBar('Erro ao carregar categorias', 'X', 'snack-bar-error', 7000);
            }
          );

        this.cartaoService.getTodosCartoes(this.currentToken)
          .subscribe(
            (response) => {
              this.cartoes = response as Cartao[];

              // Já que conseguiu pegar os cartões, pegar as imagens por id de cada cartão
              for (let i = 0; i < this.cartoes.length; i++ ) {
                this.cartaoService.getImagemCartao(this.currentToken, this.cartoes[i].id.toString())
                  .subscribe(imagem => {
                    const imagemURL = URL.createObjectURL(imagem);
                    this.cartoes[i].imagem = this.sanitizer.bypassSecurityTrustUrl(imagemURL);
                  },
                  error => {
                    console.log('Problema em pegar imagens dos cartões');
                    this.openSnackBar('Erro ao carregar imagem do cartão "' + this.cartoes[i].nome + '"', 'X', 'snack-bar-error', 7000);
                    // @TODO tratar erros e mensagens de erro
                  });
              }
            },
            (error) => {
              // @TODO Tratar erros e mensagens de erro
              this.openSnackBar('Erro ao carregar cartões', 'X', 'snack-bar-error', 7000);
            }
          );

        this.breakpoint = (window.innerWidth <= 400) ? 1 : 4;

        this.criarCategoriaForm = this.formBuilder.group({
          nome: ['', Validators.required],
          descricao: ['', Validators.required]
        });

        this.criarCartaoForm = this.formBuilder.group({
          id_categoria: ['', Validators.required],
          nome: ['', Validators.required]
        });

        this.editarCategoriaForm = this.formBuilder.group({
          id: ['', Validators.required],
          nome: ['', Validators.required],
          descricao: ['', Validators.required]
        });

        this.editarCartaoForm = this.formBuilder.group({
          id: ['', Validators.required],
          id_categoria: ['', Validators.required],
          nome: ['', Validators.required]
        });
      }

    });

  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 4;
  }

  selecionarCategoria(id_categoria: number) {
    this.mostrarCartoes = id_categoria;
    localStorage.setItem('mostrarCartoes', JSON.stringify(this.mostrarCartoes));
  }

  voltarParaCategorias() {
    if(!(this.criandoCartao || this.editandoCartao)) {
      this.mostrarCartoes = 0;
      localStorage.setItem('mostrarCartoes', '0');
    }

    this.criandoCategoria = false;
    this.criandoCartao = false;
    this.editandoCartao = false;
    localStorage.setItem('criandoCategoria', 'false');
    localStorage.setItem('criandoCartao', 'false');
    localStorage.setItem('editandoCategoria', 'false');
    localStorage.setItem('editandoCartao', 'false');

    this.erroCriarCategoria = '';
    this.erroEditarCategoria = '';

  }

  voltarParaCartoes() {

    this.criandoCategoria = false;
    this.criandoCartao = false;
    this.editandoCategoria = false;
    this.editandoCartao = false;
    localStorage.setItem('criandoCategoria', 'false');
    localStorage.setItem('criandoCartao', 'false');
    localStorage.setItem('editandoCategoria', 'false');
    localStorage.setItem('editandoCartao', 'false');

    this.erroCriarCategoria = '';
    this.erroEditarCategoria = '';

  }

  criarCategoria(categoria: Categoria) {
    this.criandoCategoria = true;
    localStorage.setItem('criandoCategoria', 'true');
  }
  criarCartao(cartao: Cartao) {
    this.criandoCartao = true;
    localStorage.setItem('criandoCartao', 'true');

    this.criarCartaoForm.setValue({
      'id_categoria': this.mostrarCartoes,
      'nome': ''
    });
  }

  cadastrarCategoria() {
    if (this.criarCategoriaForm.valid) {
      const categoria = this.criarCategoriaForm.getRawValue() as Categoria;
      if (categoria && this.arquivoSelecionado) {
        this.categoriaService.cadastrarCategoria(this.currentToken, categoria)
          .subscribe(
            (response) => {
              categoria.id = response['id'];
              // Já que foi criada com sucesso fazer upload da imagem
              this.categoriaService.cadastrarImagemCategoria(this.currentToken, categoria, this.arquivoSelecionado)
                .subscribe(
                  () => {
                    this.openSnackBar('Categoria cadastrada com sucesso!', 'X', 'snack-bar-success', 5000);
                    this.criarCategoriaForm.reset();
                    // Fez o que tinha que fazer agora limpa o arquivo selecionado
                    this.arquivoSelecionado = null;
                    // Fez tudo agora retorna pras categorias
                    this.atualizaCategoriasECartoesAposCadastro();
                    this.voltarParaCategorias();
                  },
                  error => {
                    this.erroCriarCategoria = 'Não foi possível cadastrar imagem, tente novamente';
                    // Já que não deu pra cadastrar imagem, deleta categoria
                    this.categoriaService.deletarCategoria(this.currentToken, categoria.id)
                      .subscribe(
                        () => {
                          // Tudo certo categoria deletada
                          console.log('Cadastro de categoria cancelado...');
                        },
                        err => {
                          // Erro ao deletar a categoria
                          console.log('Não foi possível cancelar o cadastro da categoria, atualize a página e tente novamente...');
                        }
                      );
                  }
                );
            },
            err => {
              // Não foi possível criar a categoria
              if (err.status === 404) {
                this.erroCriarCategoria = 'Não foi possível cadastrar a categoria';
              }
              if (err.status !== 404) {
                this.erroCriarCategoria = 'Categoria já existente';
              }
            }
          );

      } else {
        // Não foi selecionada uma imagem para a categoria
        this.erroCriarCategoria = 'Selecione uma imagem para a categoria';
      }
    }
  }

  cadastrarCartao() {
    if (this.criarCartaoForm.valid) {
      const cartao = this.criarCartaoForm.getRawValue() as Cartao;
      if (cartao && this.arquivoSelecionado) {
        this.cartaoService.cadastrarCartao(this.currentToken, cartao)
          .subscribe(
            (response) => {
              cartao.id = response['id'];
              // Já que foi criada com sucesso fazer upload da imagem
              this.cartaoService.cadastrarImagemCartao(this.currentToken, cartao, this.arquivoSelecionado)
                .subscribe(
                  () => {
                    this.openSnackBar('Cartão cadastrado com sucesso!', 'X', 'snack-bar-success', 5000);
                    this.criarCartaoForm.reset();
                    // Fez o que tinha que fazer agora limpa o arquivo selecionado
                    this.arquivoSelecionado = null;
                    // Fez tudo agora retorna pras categorias
                    this.voltarParaCartoes();
                    this.atualizaCategoriasECartoesAposCadastro();

                  },
                  error => {
                    this.erroCriarCartao = 'Não foi possível cadastrar imagem, tente novamente';
                    // Já que não deu pra cadastrar imagem, deleta categoria
                    this.cartaoService.deletarCartao(this.currentToken, cartao.id)
                      .subscribe(
                        () => {
                          // Tudo certo categoria deletada
                          console.log('Cadastro de cartão cancelado...');
                        },
                        err => {
                          // Erro ao deletar a categoria
                          console.log('Não foi possível cancelar o cadastro do cartão, atualize a página e tente novamente...');
                        }
                      );
                  }
                );
            },
            err => {
              // Não foi possível criar a categoria
              if (err.status === 404) {
                this.erroCriarCategoria = 'Não foi possível cadastrar o cartao';
              }
              if (err.status !== 404) {
                this.erroCriarCategoria = 'Cartao já existente';
              }
            }
          );

      } else {
        // Não foi selecionada uma imagem para a categoria
        this.erroCriarCartao = 'Selecione uma imagem para o cartao';
      }
    }
  }

  public hasErrorCriarCategoria = (controlName: string, errorName: string) => {
    return this.criarCategoriaForm.controls[controlName].hasError(errorName);
  }
  public hasErrorCriarCartao = (controlName: string, errorName: string) => {
    return this.criarCartaoForm.controls[controlName].hasError(errorName);
  }

  public hasErrorEditarCartao = (controlName: string, errorName: string) => {
    return this.criarCartaoForm.controls[controlName].hasError(errorName);
  }

  public hasErrorEditarCategoria = (controlName: string, errorName: string) => {
    return this.criarCategoriaForm.controls[controlName].hasError(errorName);
  }

  public onFileChanged(event) {
    const file = event.target.files[0];
    this.arquivoSelecionado = file;
  }

  editarCategoria(categoria: Categoria) {
    this.editandoCategoria = true;
    this.editarCategoriaForm.setValue({
      'id': categoria.id,
      'nome': categoria.nome,
      'descricao': categoria.descricao
    });
    localStorage.setItem('editandoCategoria', 'true');
  }

  editarCartao(cartao: Cartao) {
    this.editandoCartao = true;
    this.editarCartaoForm.setValue({
      'id': cartao.id,
      'id_categoria': cartao.id_categoria,
      'nome': cartao.nome,
    });
    localStorage.setItem('editandoCartao', 'true');
  }

  cadastrarEdicaoCategoria() {
    if (this.editarCategoriaForm.valid) {
      const categoria = this.editarCategoriaForm.getRawValue() as Categoria;
      if (categoria) {
        this.categoriaService.editarCategoria(this.currentToken, categoria)
        .subscribe(
          () => {
            // Já que foi editada com sucesso, ver se uma imagem foi escolhida e alterá-la também
            if(this.arquivoSelecionado) {
              this.categoriaService.editarImagemCategoria(this.currentToken, categoria, this.arquivoSelecionado)
              .subscribe(
                () => {
                  this.openSnackBar('Categoria editada com sucesso', 'X', 'snack-bar-success', 5000);
                  // Fez o que tinha que fazer agora limpa o arquivo selecionado
                  this.arquivoSelecionado = null;
                  // Fez tudo agora retorna pras categorias
                  this.ngOnDestroy();
                  this.atualizaCategoriasECartoesAposEdicao(categoria, null);
                },
                error => {
                  this.erroCriarCategoria = 'Não foi possível editar imagem, tente novamente';
                }
                );

            }else {
              // Fez o que tinha que fazer agora limpa o arquivo selecionado
              this.arquivoSelecionado = null;
              // Fez tudo agora retorna pras categorias
              this.ngOnDestroy();
              this.atualizaCategoriasECartoesAposEdicao(categoria, null);
            }
          },
          err => {
            // Não foi possível editar a categoria
            this.erroCriarCategoria = 'Não foi possível editar a categoria, tente novamente';
          }
        );

      } else {
        // Não foi selecionada uma imagem para a categoria
        this.erroCriarCategoria = 'Não foi selecionada uma imagem para a categoria';
      }
    }
  }

  cadastrarEdicaoCartao() {
    if (this.editarCartaoForm.valid) {
      const cartao = this.editarCartaoForm.getRawValue() as Cartao;
      if (cartao) {
        this.cartaoService.editarCartao(this.currentToken, cartao)
        .subscribe(
          () => {
            // Já que foi editada com sucesso, ver se uma imagem foi escolhida e alterá-la também
            if(this.arquivoSelecionado) {
              this.cartaoService.editarImagemCartao(this.currentToken, cartao, this.arquivoSelecionado)
              .subscribe(
                () => {
                  this.openSnackBar('Cartão editado com sucesso', 'X', 'snack-bar-success', 5000);
                  // Fez o que tinha que fazer agora limpa o arquivo selecionado
                  this.arquivoSelecionado = null;
                  // Fez tudo agora retorna pras categorias
                  this.voltarParaCartoes();
                  this.atualizaCategoriasECartoesAposEdicao(null, cartao);
                },
                error => {
                  this.erroCriarCartao = 'Não foi possível editar imagem, tente novamente';
                }
              );

            } else {
              // Fez o que tinha que fazer agora limpa o arquivo selecionado
              this.arquivoSelecionado = null;
              // Fez tudo agora retorna pras categorias
              this.voltarParaCartoes();
              this.atualizaCategoriasECartoesAposEdicao(null, cartao);
            }
          },
          err => {
            // Não foi possível editar a categoria
            this.erroCriarCartao = 'Não foi possível editar imagem, tente novamente';
          }
        );

      } else {
        // Não foi selecionada uma imagem para a categoria
        this.erroCriarCartao = 'Não foi selecionada uma imagem para o cartão';
      }
    }
  }


  excluirCategoria(categoria: Categoria) {
    this.categoriaService.deletarCategoria(this.currentToken, categoria.id)
      .subscribe(
        () => {
          this.openSnackBar('Categoria excluída com sucesso', 'X', 'snack-bar-success', 5000);
          this.ngOnDestroy();
          this.atualizaCategoriasECartoesAposExclusao(categoria, null);
        },
        err => {
          this.openSnackBar('Não foi possível excluir a categoria', 'X', 'snack-bar-error', 5000);
        }
      );
  }
  excluirCartao(cartao: Cartao) {
    this.cartaoService.deletarCartao(this.currentToken, cartao.id)
      .subscribe(
        () => {
          this.openSnackBar('Cartão excluído com sucesso', 'X', 'snack-bar-success', 5000);
          this.atualizaCategoriasECartoesAposExclusao(null, cartao);
        },
        err => {
          this.openSnackBar('Não foi possível excluir o cartão', 'X', 'snack-bar-error', 5000);
        }
      );
  }

  confirmarExcluirCategoria(categoria: Categoria) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      title: 'Confimação',
      content: 'Você tem certeza de que deseja excluir a categoria?'
    };
    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resposta => {
      if(resposta) {
        this.excluirCategoria(categoria);
      }
    });
  }
  confirmarExcluirCartao(cartao: Cartao) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: 1,
      title: 'Confimação',
      content: 'Você tem certeza de que deseja excluir o cartao?'
    };
    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resposta => {
      if(resposta) {
        this.excluirCartao(cartao);
      }
    });
  }

  public openSnackBar(message: string, action: string, theme: string, time: number) {
    setTimeout(() => {
      this._snackBar.open(message, action, {
        duration: time,
        verticalPosition: 'top',
        panelClass: theme
      });
    });
  }

  // Verifica se há mais um cartão cadastrado, e faz o download na api se necessário
  atualizaCategoriasECartoesAposCadastro() {
    this.categoriaService.getTodasCategorias().subscribe(
      (response) => {
        let categorias = response as Categoria[];
        if (categorias.length > this.categorias.length) {
          categorias.sort();
          this.categorias.sort();

          let i = 0;
          while ( i < categorias.length && this.categorias[i] && categorias[i].id === this.categorias[i].id) {
            i++;
          }

          this.categorias.push(categorias[i]);

          this.categoriaService.getImagemCategoria(this.currentToken, categorias[i].id.toString()).subscribe(
            imagem => {
              const imagemURL = URL.createObjectURL(imagem);
              this.categorias[this.categorias.length - 1].imagem = this.sanitizer.bypassSecurityTrustUrl(imagemURL);
            },
            error => {
              this.openSnackBar('Erro ao carregar imagem da categoria "' + this.categorias[this.categorias.length - 1].nome + '"', 'X', 'snack-bar-error', 7000);
            }
          );
        }
      },
      err => {
        this.openSnackBar('Erro ao carregar as informações, atualize a página por favor', 'X', 'snack-bar-error', 7000);
      }
    );

    this.cartaoService.getTodosCartoes(this.currentToken).subscribe(
      (response) => {
        let cartoes = response as Cartao[];
        if (cartoes.length > this.cartoes.length) {
          cartoes.sort();
          this.cartoes.sort();

          let i = 0;
          while ( i < cartoes.length && this.cartoes[i] && cartoes[i].id === this.cartoes[i].id) {
            i++;
          }

          this.cartoes.push(cartoes[i]);

          this.cartaoService.getImagemCartao(this.currentToken, cartoes[i].id.toString()).subscribe(
            imagem => {
              const imagemURL = URL.createObjectURL(imagem);
              this.cartoes[this.cartoes.length - 1].imagem = this.sanitizer.bypassSecurityTrustUrl(imagemURL);
            },
            error => {
              this.openSnackBar('Erro ao carregar imagem do cartão "' + this.cartoes[this.cartoes.length - 1].nome + '"', 'X', 'snack-bar-error', 7000);
            }
          );
        }
      },
      (err) => {
        this.openSnackBar('Erro ao carregar as informações, atualize a página por favor', 'X', 'snack-bar-error', 7000);
      }
    );
  }

  atualizaCategoriasECartoesAposEdicao (categoria: Categoria, cartao: Cartao) {
    if (categoria) {
      this.categoriaService.getCategoria(categoria.id).subscribe(
        (response) => {
          categoria = response as Categoria;
          for (let i = 0; i < this.categorias.length; i++) {
            if (this.categorias[i].id === categoria.id) {
              this.categorias[i] = categoria;
              this.categoriaService.getImagemCategoria(this.currentToken, categoria.id.toString()).subscribe(
                (imagem) => {
                  const imagemURL = URL.createObjectURL(imagem);
                  this.categorias[i].imagem = this.sanitizer.bypassSecurityTrustUrl(imagemURL);
                },
                err => {

                }
              );
            }
          }
        },
        error => {

        }
      );
    }

    if (cartao) {
      this.cartaoService.getCartao(cartao.id).subscribe(
        (response) => {
          cartao = response as Cartao;
          for (let i = 0; i < this.cartoes.length; i++) {
            if (this.cartoes[i].id === cartao.id) {
              this.cartoes[i] = cartao;
              this.cartaoService.getImagemCartao(this.currentToken, cartao.id.toString()).subscribe(
                (imagem) => {
                  const imagemURL = URL.createObjectURL(imagem);
                  this.cartoes[i].imagem = this.sanitizer.bypassSecurityTrustUrl(imagemURL);
                },
                err => {

                }
              );
            }
          }
        },
        error => {

        }
      );
    }
  }

  atualizaCategoriasECartoesAposExclusao (categoria: Categoria, cartao: Cartao) {
    if (categoria) {
      for (let i = 0; i < this.categorias.length; i++) {
        if (this.categorias[i].id === categoria.id) {
          this.categorias.splice(i, 1);
        }
      }
    }

    if (cartao) {
      for (let i = 0; i < this.cartoes.length; i++) {
        if (this.cartoes[i].id === cartao.id) {
          this.cartoes.splice(i, 1);
        }
      }
    }
  }

}
