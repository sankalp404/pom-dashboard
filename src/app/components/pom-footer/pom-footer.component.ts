import {Component, OnInit} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'pom-footer',
  templateUrl: 'pom-footer.component.html',
  styleUrls: ['pom-footer.component.css']
})
export class PomFooterComponent implements OnInit {

  outageColors = {
    domain: ['#5cb85c', '#5bc0de', '#f0ad4e', '#d9534f']
  };

  runTimeColors = {
    domain: ['#5cb85c']
  };

  constructor() {
  }

  ngOnInit() {
  }

}
