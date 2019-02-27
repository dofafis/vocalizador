import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Token } from '../token';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentToken: Token;

  constructor(private route: ActivatedRoute,
            private router: Router) { }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.currentToken = params as Token;
      if (typeof(this.currentToken.id) === 'undefined') {
        this.router.navigate(['login']);
      }
    });

  }

}
