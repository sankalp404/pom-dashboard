/**
 * Created by Sankalp Sharma on 2/11/2017.
 */

import {Component, OnInit} from '@angular/core';
import {MapDataService} from './services/map-data.service';
import {Device} from './shared/classes/device.class';
import * as moment from 'moment';

@Component({
  moduleId: module.id,
  selector: 'pom-dashboard',
  templateUrl: './pom-dashboard.component.html',
  styleUrls: ['./pom-dashboard.component.css']
})

export class PomDashboardComponent implements OnInit {

  title = 'Power Outage Monitor Dashboard';
  devices: Device[]=[];
  pie_charts: any;
  outageData: any;
  runtimeRemainingData: any;
  isLiveView: boolean = true;
  generatorCheck: boolean = false;
  legendDefinitions: Object;
  baseLatitude: number;
  baseLongitude: number;

  noOutageColor: string = '#007E00';
  outageColor: string = '#FCFC00';
  lostCommColor: string = '#FCA300';
  failedColor: string = '#FC0000';

  outageColors = {
    domain: [this.noOutageColor, this.outageColor, this.lostCommColor, this.failedColor]
  };

  runTimeColors = {
    domain: [this.outageColor]
  };
  loadedData = {
    filters: {
      region: "",
      area: "",
      hub: "",
    },
    startDate: {
      "year": 2017,
      "month": 4,
      "day": 1
    },
    endDate: {
      "year": 2017,
      "month": 4,
      "day": 6
    },
    mapLatitude: 40.447118,
    mapLongitude: -79.99313
  };

  constructor(private mapDataService: MapDataService) {
  }

  ngOnInit(): void {
    this.baseLatitude = this.loadedData.mapLatitude;
    this.baseLongitude = this.loadedData.mapLongitude;
    this.getLastConfig();
  }

  getLastConfig() {
    this.mapDataService.loadLastConfig()
      .subscribe(
        response => {
          this.loadedData.filters.region = response['region'];
          this.loadedData.filters.area = response['area'];
          this.loadedData.filters.hub = response['hub'];
        });
  }

  getData() {
    this.legendDefinitions = this.getLegend(this.isLiveView);
    this.clearData();
    if (this.isLiveView) {
      this.getRealTimeData();
    } else {
      this.getHistoricData();
    }
  }

  getRealTimeData() {
    this.mapDataService.loadRealTimeData(this.loadedData.filters)
      .subscribe(
        response => {
          this.devices = response['devices'];
          this.pie_charts = response['pie_charts'];
          this.outageData = response['outages'];
          this.runtimeRemainingData = response['runtime_remaining_chart'];
        });
  }

  getHistoricData() {
    this.mapDataService.loadHistoricalData(this.loadedData.filters, moment(this.loadedData.startDate).valueOf(), moment(this.loadedData.endDate).valueOf())
      .subscribe(
        response => {
          this.devices = response['devices'];
          this.pie_charts = response['pie_charts'];
          this.outageData = response['outages'];
          this.runtimeRemainingData = response['runtime_remaining_chart'];
        });
  }

  getLegend(live: boolean): Object {
    let definitions = [{
      color: this.noOutageColor,
      label: 'Normal'
    }, {
      color: this.outageColor,
      label: 'Invertor On'
    }, {
      color: this.lostCommColor,
      label: 'Lost Communication'
    }];

    if (!live) {
      definitions.push({
        color: this.failedColor,
        label: 'Failed'
      });
    }
    return definitions;
  }

  updateRegion(region: string) {
    this.loadedData.filters.region = region;
    this.clearData();
  }

  updateArea(area: string) {
    this.loadedData.filters.area = area;
    this.clearData();
  }

  updateHub(hub: string) {
    this.loadedData.filters.hub = hub;
    this.clearData();
  }

  clearData() {
    this.devices = [];
    this.pie_charts = null;
    this.outageData = null;
    this.runtimeRemainingData = null;
  }

  switchToCurrent():void{
    this.isLiveView=true;
  }
  switchToHistoric():void{
    this.isLiveView=false;
  }

  debug(): void {
    console.log(this.loadedData.filters);
    console.log(this.devices);
    console.log(this.loadedData.startDate);
    console.log(this.loadedData.endDate);
  }

}
