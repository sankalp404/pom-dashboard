/**
 * Created by Sankalp Sharma on 2/11/2017.
 */

import {Component, Input} from '@angular/core';
import {single} from './charts';

@Component({
  selector: 'pom-barchart-horizontal',
  templateUrl: 'pom-barchart-horizontal.component.html',
  styleUrls: ['pom-barchart-horizontal.component.css']
})

export class PomBarchartHorizontalComponent {
  single: any[];

  // options
  @Input() xAxisLabel: String;
  showXAxis = true;
  showYAxis = false;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = true;

  colorScheme = {
    domain: ['red']
  };

  constructor() {
    Object.assign(this, {single})
  }

  onSelect(event) {
    console.log(event);
  }
}
