import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from './registration-component/registration-component.component';
import { SigninComponent } from './signin/signin.component';
import { MyMaterialModule } from '../material.module';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule, MatIconModule, MatDialogModule, MatButtonModule } from '@angular/material';
import { DarkenOnHoverModule } from '../darken-on-hover/darken-on-hover.module';
import { DialogComponent } from './dialog/dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [ RegistrationComponent, SigninComponent, DashboardComponent, DialogComponent ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MyMaterialModule,
        HttpClientModule,
        MatGridListModule,
        MatCardModule,
        MatIconModule,
        DarkenOnHoverModule,
        MatDialogModule,
        MatButtonModule,
        BrowserAnimationsModule
    ],
    entryComponents: [
        DialogComponent
    ]
})
export class HomeModule {}
