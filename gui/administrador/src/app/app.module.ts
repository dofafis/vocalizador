import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyMaterialModule } from './material.module';
import { HomeModule } from './home/home.module';
import { RegistrationComponent } from './home/registration-component/registration-component.component';
import { SigninComponent } from './home/signin/signin.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { MatIconModule } from '@angular/material';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MyMaterialModule,
    HomeModule,
    MatIconModule,
    RouterModule.forRoot([
      { path: '', redirectTo: '/', pathMatch: 'full' },
      { path: 'register', component: RegistrationComponent },
      { path: 'login', component: SigninComponent },
      { path: 'dashboard', component: DashboardComponent },
    ], { useHash: true })
  ],
  providers: [ MatSnackBar ],
  bootstrap: [AppComponent]
})
export class AppModule { }
