import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RegistrationComponent } from './registration-component/registration-component.component';
import { SigninComponent } from './signin/signin.component';
import { MyMaterialModule } from '../material.module';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
    declarations: [ RegistrationComponent, SigninComponent, DashboardComponent ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MyMaterialModule,
        HttpClientModule
    ]
})
export class HomeModule {}
