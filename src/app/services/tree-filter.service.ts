/**
 * Created by Sankalp Sharma on 2/7/2017.
 */
import { Injectable } from '@angular/core';
import {Http, RequestOptions, Response, Headers} from "@angular/http";
import {Observable} from "rxjs";

@Injectable()
export class TreeFilterService {
  private treeUrl: string;

  constructor( private http: Http) {
    this.treeUrl = 'POMDashboard/POMDashboardServices/GetRegionsAreasHubs';
    //this.treeUrl = 'assets/data/tree.json';//debug purposes
  }

  loadData(): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    let options = new RequestOptions({headers: headers});

    return this.http.get(this.treeUrl, options)
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

  // getRegions():string[]{
  //   return  _.map(this.dataStore, 'regionName');
  // }
  //
  // getAreas(region:string):string[]{
  //   let results = _.find(this.dataStore, { 'regionName': region });
  //   return _.map(results.areas, 'areaName');
  // }
  //
  // getHubs(region:string, area:string):string[] {
  //   let foundRegion = _.find(this.dataStore, { 'regionName': region });
  //   let foundArea = _.find(foundRegion.areas, {'areaName': area });
  //
  //   return foundArea['hubs'];
  // }
  //
  // loadData(){
  //   this.http.get(this.treeUrl)
  //     .map((response:Response)=> response.json())
  //     .subscribe(res => {
  //       this.dataStore = res.data['regions'];
  //
  //     }, error => console.error('Unable to load the drop-down menu data for Region, Area, and Hub '));
  // }
}
