/**
 * Created by Sankalp Sharma on 2/5/2017.
 */

import {Component, Input, OnInit} from '@angular/core';
import {Router } from '@angular/router';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'pom-barchart-vertical',
  templateUrl: 'pom-barchart-vertical.component.html',
  styleUrls: ['pom-barchart-vertical.component.css']
})

export class PomBarchartVerticalComponent implements OnInit{
  // Chart options
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

  // For Drilldown
  @Input() private isLiveView: boolean;
  @Input() region:string;
  @Input() area:string;
  @Input() hub:string;
  @Input() startDate:any;
  @Input() endDate:any;

  noOutageColor: string = '#007E00';
  outageColor: string = '#FCFC00';
  lostCommColor: string = '#FCA300';
  failedColor: string = '#FC0000';

  constructor(private router: Router) {}

  ngOnInit(){
    if(this.isLiveView){
      this.colors = {
        domain: [this.noOutageColor, this.outageColor, this.failedColor]
      };
    }else{
      this.colors = {
        domain: [this.noOutageColor, this.outageColor, this.lostCommColor, this.failedColor]
      };
    }
  }

  onSelect(event) {
    let node = this.getNode();
    let severity = this.getSeverity(event);

    if(this.isLiveView){
      this.router.navigate(['/reportview', node, severity]);
    } else {
      let startDate = moment(this.startDate).subtract(1, 'months').valueOf();
      let endDate = moment(this.endDate).subtract(1, 'months').valueOf();
      this.router.navigate(['/reportview', node, startDate, endDate, severity]);
    }
  }

  private getNode():string{
    if(this.hub != null && this.hub != "") {
      return this.hub;
    }else if(this.area != null && this.area != ""){
      return this.area;
    }
    return this.region;
  }

  private getSeverity(node):number{
    let verticalBar = _.find(this.data, ['name', node.name]);
    return verticalBar.severity;
  }
}
