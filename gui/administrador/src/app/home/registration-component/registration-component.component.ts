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

  constructor(private elementRef: ElementRef,
              private formBuilder: FormBuilder,
              private registrationService: RegistrationService,
              private router: Router
) { }

  ngOnInit() {
    this.registrationForm = this.formBuilder.group({
      nome: ['', Validators.required],
      sobrenome: ['', Validators.required],
      login: ['', Validators.required],
      email: ['', Validators.required],
      senha: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'lightblue';
  }

  register() {
    if(this.registrationForm.valid) {
      console.log('whatahell!!??');
      const usuario = this.registrationForm.getRawValue() as Usuario;
      this.registrationService.criarUsuario(usuario)
        .subscribe(
          (status) => console.log(status),
          err => console.log(err)
        );
    }
  }
}
