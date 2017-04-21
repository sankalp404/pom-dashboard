/**
 * Created by Sankalp Sharma on 2/11/2017.
 */

import {Component, OnInit, Input} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'pom-sidebar',
  templateUrl: './pom-sidebar.component.html',
  styleUrls: ['./pom-sidebar.component.css']
})
export class PomSidebarComponent implements OnInit {

  @Input() charts:any[];

  constructor() {

  }

  ngOnInit() {
  }

}
