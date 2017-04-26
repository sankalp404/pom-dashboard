/**
 * Created by connerbx on 4/18/2017.
 */
import {Component, Input} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'alpha-message-box',
  templateUrl: 'alpha-message-box.component.html',
  styleUrls: ['alpha-message-box.component.css']
})

/**
 * Accepts an array of strings for each message array.
 * an Optional AlphaMessages class is provided external processing.
 * When using the class, you must still bind the attributes individually
 * and not as a full class.
 */
export class AlphaMessageBoxComponent {
  @Input() private messages: Array<string>;
  @Input() private warnings: Array<string>;
  @Input() private errors: Array<string>;
  @Input() private scrollMinHeight: string = '200px'; //default
}
