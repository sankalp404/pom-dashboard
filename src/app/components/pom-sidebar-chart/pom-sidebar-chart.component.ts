/**
 * Created by Sankalp Sharma on 2/11/2017.
 */
import {Component, OnInit, Input} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'pom-sidebar-chart',
  templateUrl: 'pom-sidebar-chart.component.html',
  styleUrls: ['pom-sidebar-chart.component.css']
})
export class PomSidebarChartComponent implements OnInit {

  private chartType: string;
  private chartLegend: boolean;
  @Input() private chartColors: Array<any>;
  @Input() private chartData: number[];
  @Input() private chartTitle: string;
  @Input() private chartLabels: string[];

  constructor() {
  }

  ngOnInit(): void {
    this.chartType = 'doughnut';
    this.chartLegend = false;
    this.chartColors = [{
      backgroundColor: ['#007E00', '#FCFC00', '#FCA300', '#FC0000']
    }];
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }


}
