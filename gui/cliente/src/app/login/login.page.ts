import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  ) {
    this.loginForm = this.formBuilder.group({
      'login': ['', Validators.required],
      'senha': ['', Validators.required],
    });
  }

  ngOnInit() {

    

  }

  logar() {
    console.log('hihihi');
    if(this.loginForm.valid) {
    }
  }

}
