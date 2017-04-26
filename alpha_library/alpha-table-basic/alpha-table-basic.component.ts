/**
 * Created by connerbx on 4/17/2017.
 */
import {Component, Input, OnInit} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'alpha-table-basic',
  templateUrl: 'alpha-table-basic.component.html',
  styleUrls: ['alpha-table-basic.component.css']
})
export class AlphaTableBasicComponent implements OnInit {
  @Input() private columnHeaders: Array<string>;
  @Input() private rowNames:Array<string>;
  @Input() private rows:Array<any>;
  @Input() private footer:any;
  private invalidError:boolean = false;
  private errorMessage:any = {};

  constructor() {
  }

  ngOnInit() {
    this.checkData();
  }

  checkData():void{
    if(!this.rowNames){
      this.errorMessage.error = "Table Component Error";
      this.errorMessage.text = "Table row names must be indicated!";
      this.invalidError=true;
      console.error("Row names for table component are not found. Suggestion: <table-basic [rowNames]=[Array of values]></table-basic>");
    }else{
      this.invalidError=false;
    }

    if(!this.columnHeaders){
      this.columnHeaders = this.rowNames;
    }
  }



}
