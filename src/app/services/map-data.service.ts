import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class MapDataService {

  private realTimeUrl: string;
  private historicalUrl: string;
  private lastConfigUrl: string;

  constructor(private http: Http) {
    this.realTimeUrl = 'POMDashboard/POMDashboardServices/GetPOMDashboardRealtime';
    this.historicalUrl = 'POMDashboard/POMDashboardServices/GetPOMDashboardHistorical';
    this.lastConfigUrl = 'POMDashboard/POMDashboardServices/GetLastConfig';
    //this.lastConfigUrl = '/webclient/pomdashboard/dist/assets/data/getLastConfig.json';//debug purposes
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

}
