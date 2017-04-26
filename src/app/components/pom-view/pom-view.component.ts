import {Component, OnInit} from '@angular/core';
import {MapDataService} from '../../services/map-data.service';
import {Device} from '../..//shared/classes/device.class';
import * as moment from 'moment';
import {AlphaMessages} from "../../../../alpha_library/alpha-message-box/alpha-messages.class";
import { Router } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'pom-view',
  templateUrl: './pom-view.component.html',
  styleUrls: ['./pom-view.component.css']
})

export class PomViewComponent implements OnInit {
  today: number = Date.now();
  title = 'Power Outage Monitor Dashboard';
  devices: Device[] = [];
  pie_charts: any;
  outageData: any;
  runtimeRemainingData: any;
  isLiveView: boolean = true;
  generatorCheck: boolean = false;
  legendDefinitions: Object;
  baseLatitude: number;
  baseLongitude: number;

  displayMessages: AlphaMessages;
  maxSeverityLevel: number = 4;

  noOutageColor: string = '#007E00';
  outageColor: string = '#FCFC00';
  lostCommColor: string = '#FCA300';
  failedColor: string = '#FC0000';

  outageColors:any;

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
      "year": 0,
      "month": 0,
      "day": 0
    },
    endDate: {
      "year": 0,
      "month": 0,
      "day": 0
    },
    mapLatitude: 40.447118,
    mapLongitude: -79.99313
  };

  constructor(private mapDataService: MapDataService, private router:Router) {
    this.displayMessages = new AlphaMessages();
  }

  ngOnInit(): void {
    this.baseLatitude = this.loadedData.mapLatitude;
    this.baseLongitude = this.loadedData.mapLongitude;
    this.getLastConfig();
    this.generateDates();
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

  private generateDates() {
    let today = moment().format('L');
    let lastMonth = moment().subtract(1, 'months').format('L');
    this.loadedData.startDate = {
      "year": moment(lastMonth).year(),
      "month": moment(lastMonth).month() + 1,
      "day": moment(lastMonth).date()
    };
    this.loadedData.endDate = {
      "year": moment(today).year(),
      "month": moment(today).month() + 1,
      "day": moment(today).date()
    };
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
          this.displayMessages = this.mapDataService.validateDevices(this.devices, this.maxSeverityLevel);
        });
  }

  getHistoricData() {
    this.mapDataService.loadHistoricalData(this.loadedData.filters, moment(this.loadedData.startDate).subtract(1, 'months').valueOf(),
      moment(this.loadedData.endDate).subtract(1, 'months').valueOf())
      .subscribe(
        response => {
          this.devices = response['devices'];
          this.pie_charts = response['pie_charts'];
          this.outageData = response['outages'];
          this.runtimeRemainingData = response['runtime_remaining_chart'];

          this.displayMessages = this.mapDataService.validateDevices(this.devices, this.maxSeverityLevel);
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
      color: this.failedColor,
      label: 'Failed'
    }
    ];

    if (!live) {
      let last = definitions.pop();
      definitions.push({
        color: this.lostCommColor,
        label: 'Lost Communication'
      });
      definitions.push(last);
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

  updateStartDate(date: any) {
    this.loadedData.startDate = date;
  }

  updateEndDate(date: any) {
    this.loadedData.endDate = date;
  }

  clearData() {
    this.devices = [];
    this.pie_charts = null;
    this.outageData = null;
    this.runtimeRemainingData = null;
    this.displayMessages.clear();
  }

  switchToCurrent(): void {
    this.isLiveView = true;
  }

  switchToHistoric(): void {
    this.isLiveView = false;
  }

  debug(): void {
    // console.log(this.loadedData.filters);
        // console.log(this.devices);
        // console.log(this.loadedData.startDate);
        // console.log(this.loadedData.endDate);
  }

}
