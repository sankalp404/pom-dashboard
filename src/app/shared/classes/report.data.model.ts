/**
 * Created by Sankalp Sharma on 4/25/2017.
 */

// export class ReportData{
//   mac_address:string;
//   ip_address:string;
//   location:string;
//   display_name:string;
//   gen_attached:boolean;
//   gen_status:string;
//   gen_startTime:string;
//   gen_stopTime:string;
//   gen_elapsed_runtime:string;
//   gen_string_volts:string;
//   gen_input_volts:string;
//   gen_output_volts:string;
//   gen_output_current:string;
//   temperature:string;
// }

export class ReportData{
  mac_address:string;
  ip_address:string;
  location:string;
  display_name:string;
  gen_attached: boolean;
  gen_status: string;

  standby_remaining:number;
  gen_elapsed_runtime:number;
  standby_status:string;
  input_voltage:number;
  dispatch_time:number;
  event_start_time:number;
  gen_refuel_time:number;

  //historic
  gen_startTime:number;
  gen_stopTime:number;
  gen_string_volts:number;
  gen_input_volts:number;
  gen_output_volts:number;
  gen_output_current:number;
  temperature:number;

}





