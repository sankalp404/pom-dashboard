/**
 * Created by Sankalp Sharma on 2/2/2017.
 */

import {Component, Input} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'date-picker',
    templateUrl: 'pom-date-picker.component.html',
    styleUrls:['pom-date-picker.component.css']
})
export class DatePickerComponent{
    @Input() private startDate: any;
    @Input() private endDate: any;
}
