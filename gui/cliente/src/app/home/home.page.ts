import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public items: any;

  constructor(
    public navCtrl: NavController,
    public http: HttpClient,
  ) {
    this.getData();
  }

  getData() {
    let url = 'https://jsonplaceholder.typicode.com/photos';
    let data: Observable<any> = this.http.get(url);
    data.subscribe(
      result => {
        console.log(result);
      }
    );   
  }
}
