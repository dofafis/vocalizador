import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from './registration-component/registration-component.component';
import { SigninComponent } from './signin/signin.component';
import { MyMaterialModule } from '../material.module';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule, MatIconModule } from '@angular/material';
import { DarkenOnHoverModule } from '../darken-on-hover/darken-on-hover.module';
import { FileSelectDirective } from 'ng2-file-upload';

@NgModule({
    declarations: [ RegistrationComponent, SigninComponent, DashboardComponent, FileSelectDirective ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MyMaterialModule,
        HttpClientModule,
        MatGridListModule,
        MatCardModule,
        MatIconModule,
        DarkenOnHoverModule,
    ]
})
export class HomeModule {}
