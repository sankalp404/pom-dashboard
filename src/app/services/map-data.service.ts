import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {Device} from '../shared/classes/device.class';
import {AlphaMessages} from "../../../alpha_library/alpha-message-box/alpha-messages.class";

@Injectable()
export class MapDataService {

  private realTimeUrl: string;
  private historicalUrl: string;
  private lastConfigUrl: string;
  private drillDownDataLiveUrl: string;
  private drillDownDataHistoricUrl: string;

  constructor(private http: Http) {
    this.realTimeUrl = 'POMDashboard/POMDashboardServices/GetPOMDashboardRealtime';
    this.historicalUrl = 'POMDashboard/POMDashboardServices/GetPOMDashboardHistorical';
    this.lastConfigUrl = 'POMDashboard/POMDashboardServices/GetLastConfig';
    this.drillDownDataLiveUrl = 'POMDashboard/POMDashboardServices/GetPOMDrilldownDataLive';
    this.drillDownDataHistoricUrl = 'POMDashboard/POMDashboardServices/GetPOMDrilldownDataHistorical';

    //local debug
    //this.realTimeUrl = 'assets/data/realTimeUrlDebugData.json';
    //this.lastConfigUrl = 'assets/data/lastConfigUrlDebugData.json';
    //this.drillDownDataLiveUrl = 'assets/data/drillDownUrlDebugData.json';
    //this.drillDownDataHistoricUrl = 'assets/data/drillDownUrlDebugHistoricData.json';
  }

  loadLastConfig(): Observable<any> {
    return this.http.get(this.lastConfigUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  loadRealTimeData(parameters: any): Observable<any> {
    let params = `region=${parameters.region}&area=${parameters.area}&hub=${parameters.hub}`;
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let options = new RequestOptions({headers: headers, search: new URLSearchParams(params)});

    return this.http.get(this.realTimeUrl, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  loadHistoricalData(parameters: any, startTime, stopTime): Observable<any> {
    let params = `region=${parameters.region}&area=${parameters.area}&hub=${parameters.hub}&startTime=${startTime}&stopTime=${stopTime}`;
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let options = new RequestOptions({headers: headers, search: new URLSearchParams(params)});

    return this.http.get(this.historicalUrl, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getDrillDownDataLive(node: string, severity: number): Observable<any> {
    let params = `node=${node}&severity=${severity}`;
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let options = new RequestOptions({headers: headers, search: new URLSearchParams(params)});

    console.log("getDrillDownDataLive called");
    return this.http.get(this.drillDownDataLiveUrl, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getDrillDownDataHistoric(node: string, startTime, stopTime, severity: number): Observable<any> {
    let params = `node=${node}&startTime=${startTime}&stopTime=${stopTime}&severity=${severity}`;
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let options = new RequestOptions({headers: headers, search: new URLSearchParams(params)});

    console.log("getDrillDownDataHistorical called");
    return this.http.get(this.drillDownDataHistoricUrl, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(response: Response) {
    let body = response.json();
    return body.data || {};
  }

  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  validateDevices(devices: Device[], maxSeverity: number): AlphaMessages {
    let messages = new AlphaMessages();
    let missingCoord: number = 0;
    let missingSeverity: number = 0;
    let severityOutOfRange: number = 0;

    //check for no devices
    if (devices.length == 0) {
      messages.messages.push('No devices found.');
    }

    for (let device of devices) {
      //count devices missing coordinates
      if (!device.latitude || !device.longitude) {
        missingCoord = missingCoord + 1;
      }
      //count devices missing severity levels
      if (device.severity <= 0) {
        missingSeverity = missingSeverity + 1;
      }
      //count devices with severity levels greater than the range we are examining (i.e 9999)
      if (device.severity > maxSeverity) {
        severityOutOfRange = severityOutOfRange + 1;
      }
    }

    if (missingCoord > 0) {
      messages.errors.push(missingCoord + ' device(s) cannot be displayed (missing coordinates)');
    }

    if (missingSeverity > 0) {
      messages.errors.push(missingSeverity + ' device(s) have missing severity levels.');
    }

    if (severityOutOfRange) {
      messages.errors.push(severityOutOfRange + ' device(s) have an incompatible severity level.');
    }

    return messages;
  }


}
