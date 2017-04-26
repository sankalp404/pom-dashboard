/**
 * Created by Sankalp Sharma on 2/11/2017.
 */
import {Component, OnInit, Input} from '@angular/core';
import {Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  moduleId: module.id,
  selector: 'pom-sidebar-chart',
  templateUrl: 'pom-sidebar-chart.component.html',
  styleUrls: ['pom-sidebar-chart.component.css']
})
export class PomSidebarChartComponent implements OnInit {

  private chartType: string;
  private chartLegend: boolean;
  private chartColors: Array<any>;
  private chartLabels: string[];

  @Input() private isLive: boolean;
  @Input() startDate:any;
  @Input() endDate:any;
  @Input() private chartData: number[];
  @Input() private chartTitle: string;

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.chartType = 'doughnut';
    this.chartLegend = false;
    this.initializeCharts();
  }

  private initializeCharts():void{
    if(this.isLive){
      this.chartColors = [{
        backgroundColor: ['#007E00', '#FCFC00', '#FC0000']
      }];
      this.chartLabels = ['Normal: ','Invertor On: ','Failed: '];
    } else {
      this.chartColors = [{
        backgroundColor: ['#007E00', '#FCFC00', '#FCA300', '#FC0000']
      }];
      this.chartLabels = ['Normal: ','Invertor On: ','Lost Communication: ','Failed: '];
    }
  }

  // events
  public chartClicked(e: any): void {
    // We can use the router here to open the new tab
    console.log(e.active[0]._index);
    let severity = e.active[0]._index + 1;

    if(this.isLive){
      this.router.navigate(['/reportview', this.chartTitle, severity]);
    } else {
      let startDate = moment(this.startDate).subtract(1, 'months').valueOf();
      let endDate = moment(this.endDate).subtract(1, 'months').valueOf();
      this.router.navigate(['/reportview', this.chartTitle, startDate, endDate, severity]);
    }
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }


}
