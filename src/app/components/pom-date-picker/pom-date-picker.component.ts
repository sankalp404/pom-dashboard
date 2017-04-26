/**
 * Created by Sankalp Sharma on 2/2/2017.
 */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'date-picker',
    templateUrl: 'pom-date-picker.component.html',
    styleUrls:['pom-date-picker.component.css']
})
export class DatePickerComponent implements OnInit{
    @Input() private startDate: any;
    @Input() private endDate: any;
    private yesterday;

    @Output() startChanged: EventEmitter<any> = new EventEmitter();
    @Output() endChanged: EventEmitter<any> = new EventEmitter();

    ngOnInit(){
      this.yesterday = this.endDate;
    }

  startDateChanged(date:any){
    this.startChanged.emit(date);
  }

  endDateChanged(date:any){
    this.endChanged.emit(date);
  }

}
