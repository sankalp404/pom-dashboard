import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {MapDataService} from "../../services/map-data.service";
import {ReportData} from "../../shared/classes/report.data.model";

@Component({
  selector: 'pom-report-view',
  templateUrl: './pom-report-view.component.html',
  styleUrls: ['./pom-report-view.component.css']
})
export class PomReportViewComponent implements OnInit, OnDestroy {
  data:ReportData;
  rowNames:string[];
  headers:string[];
  isHistoric:boolean;
  private localSubscription:any;

  constructor(
    private route: ActivatedRoute,
    private mapDataService: MapDataService
  ) {
    this.isHistoric=false;
  }

  ngOnInit() {
    let historicCheck = false;

    this.localSubscription = this.route.params
      .switchMap((params:Params) => {
        if(params['startTime'] != null && params['stopTime']!= null){
          historicCheck = true;
          this.rowNames=[
                       'display_name',
                       'location',
                       'ip_address',
                       'mac_address',
                       'gen_attached',
                       'gen_status',
                       'gen_startTime',
                       'gen_stopTime',
                       'gen_elapsed_runtime',
                       'gen_string_volts',
                       'gen_input_volts',
                       'gen_output_volts',
                       'gen_output_current',
                       'temperature'
                     ];
                     this.headers=[
                       'Display Name',
                       'Location',
                       'IP Address',
                       'Mac Address',
                       'Generator Attached',
                       'Generator Status',
                       'Generator Start time',
                       'Generator Stop time',
                       'Generator Elapsed Runtime',
                       'Generator String Volts',
                       'Generator Input Volts',
                       'Generator Output Volts',
                       'Generator Output Current',
                       'Temperature'
                     ];

          return this.mapDataService.getDrillDownDataHistoric(params['node'], +params['startTime'], +params['stopTime'], +params['severity']);
        }else{
          this.rowNames=['mac_address', 'ip_address', 'gen_attached', 'location','display_name'];
          this.headers=['Mac Address', 'IP Address', 'Generator Attached', 'Location', 'Display Name'];
          return this.mapDataService.getDrillDownDataLive(params['node'], +params['severity']);
        }
      }
      )
      .subscribe((data: any)=> {
          this.data = data;
          this.isHistoric = historicCheck;
      });

  }

  ngOnDestroy(){
    this.localSubscription.unsubscribe();
  }

}
