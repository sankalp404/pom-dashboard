import {Injectable} from "@angular/core";
@Injectable()
export class AlphaMessages {
  messages: Array<string>;
  warnings: Array<string>;
  errors: Array<string>;

  constructor(){
    this.messages = new Array<string>();
    this.warnings = new Array<string>();
    this.errors = new Array<string>();
  }

  clear():void{
    this.messages=[];
    this.warnings = [];
    this.errors = [];
  }
}
