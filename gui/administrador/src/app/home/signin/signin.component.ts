import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginInfo } from '../login-info';
import { LoginService } from './login.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit, AfterViewInit {

  loginForm: FormGroup;

  erroDeLogin = '';

  constructor(private elementRef: ElementRef,
              private formBuilder: FormBuilder,
              private loginService: LoginService,
              private router: Router
) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      senha: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'lightblue';
  }

  signin() {
    if (this.loginForm.valid) {
      const loginInfo = this.loginForm.getRawValue() as LoginInfo;
      this.loginService.logarUsuario(loginInfo)
        .subscribe(
          (response) => {
            console.log('Sucesso!');
            console.log(response);
            this.erroDeLogin = '';
            this.router.navigate(['dashboard', response]);
          },
          err => {
            console.log('Erro!');
            console.log(err);

            if (typeof(err) === 'undefined'
              || typeof(err.error) === 'undefined'
              || typeof(err.error.Error) === 'undefined') {
                this.erroDeLogin = 'Desculpe, o sistema está fora do ar, tente novamente mais tarde';
            } else if (err.error.Error.includes('err001')) {
              this.erroDeLogin = 'Senha incorreta';
            } else if (err.error.Error.includes('err002')) {
              this.erroDeLogin = 'O login não está cadastrado no sistema';
            } else {
              this.erroDeLogin = 'Houve um erro no servidor, tente novamente';
            }
          }
        );
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.loginForm.controls[controlName].hasError(errorName);
  }

}
