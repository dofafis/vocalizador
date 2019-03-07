import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Usuario } from '../usuario';
import { RegistrationService } from './registration.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration-component',
  templateUrl: './registration-component.component.html',
  styleUrls: ['./registration-component.component.css']
})
export class RegistrationComponent implements OnInit, AfterViewInit {

  registrationForm: FormGroup;

  erroDeCadastro = '';

  constructor(private elementRef: ElementRef,
              private formBuilder: FormBuilder,
              private registrationService: RegistrationService,
              private router: Router) { }

  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
      nome: ['', Validators.required],
      sobrenome: ['', Validators.required],
      login: ['', Validators.required],
      email: ['', Validators.required],
      senha: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'lightblue';
  }

  register() {
    if (this.registrationForm.valid) {
      const usuario = this.registrationForm.getRawValue() as Usuario;
      this.registrationService.criarUsuario(usuario)
        .subscribe(
          (status) => {
            this.erroDeCadastro = '';
            this.router.navigate(['login']);
          },
          response => {
            console.log(response.error.Error);
            if (typeof(response) === 'undefined'
            || typeof(response.error) === 'undefined'
            || typeof(response.error.Error) === 'undefined') {
              this.erroDeCadastro = 'Desculpe, o sistema está fora do ar, tente novamente mais tarde.';
            } else if (response.error.Error.includes('err001')) {
              this.erroDeCadastro = 'O login ou email já foram cadastrados.';
            } else {
              this.erroDeCadastro = 'Houve algum problema, atualize a página ou verifique sua conexão.';
            }
          }
        );
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.registrationForm.controls[controlName].hasError(errorName);
  }


}
