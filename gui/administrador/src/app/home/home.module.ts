import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RegistrationComponent } from './registration-component/registration-component.component';
import { SigninComponent } from './signin/signin.component';
import { MyMaterialModule } from '../material.module';

@NgModule({
    declarations: [ RegistrationComponent, SigninComponent ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MyMaterialModule
    ]
})
export class HomeModule {}
