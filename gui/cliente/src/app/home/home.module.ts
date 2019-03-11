import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { HomePage } from './home.page';
import { LoginPage } from './login/login.page';
import { DashboardPage } from './dashboard/dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      },
      {
        path: 'login',
        component: LoginPage
      },
      {
        path: 'dashboard',
        component: DashboardPage
      }
    ])
  ],
  declarations: [HomePage, LoginPage, DashboardPage]
})
export class HomePageModule {}
