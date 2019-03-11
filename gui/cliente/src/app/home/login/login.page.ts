import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { LoginInfo } from '../../models/login-info';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      'login': ['', Validators.required],
      'senha': ['', Validators.required],
    });
  }

  ngOnInit() {

  }

  logar() {
    if (this.loginForm.valid) {
      const loginInfo = this.loginForm.getRawValue() as LoginInfo;

      this.loginService.logarUsuario(loginInfo).subscribe(
        (result) => {
          // token de acesso
          const token = result;
          this.router.navigate(['/dashboard', token]);
        },
        err => {
          // erro
        }
      );
    }
  }

}
