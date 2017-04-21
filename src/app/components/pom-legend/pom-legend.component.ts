import {Component, Input} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'pom-legend',
    templateUrl: 'pom-legend.component.html',
    styleUrls: ['pom-legend.component.css']
})
export class PomLegendComponent {
  @Input() private colorLabelPairs;
}

