/**
 * Created by Sankalp Sharma on 2/5/2017.
 */

import {Component, Input} from '@angular/core';

@Component({
  selector: 'pom-barchart-vertical',
  templateUrl: 'pom-barchart-vertical.component.html',
  styleUrls: ['pom-barchart-vertical.component.css']
})

export class PomBarchartVerticalComponent {
  // options
  @Input() yAxisLabel: String;
  @Input() xAxisLabel: String;
  @Input() colors;
  @Input() showXAxis = false;
  @Input() showYAxis = false;
  @Input() gradient = false;
  @Input() showLegend = false;
  @Input() showXAxisLabel = true;
  @Input() showYAxisLabel = true;
  @Input() data: any;


  constructor() {}

  onSelect(event) {
    console.log(event);
  }
}
