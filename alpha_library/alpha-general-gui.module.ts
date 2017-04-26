/**
 * Created by connerbx on 4/19/2017.
 */
import { CommonModule } from '@angular/common';
import {NgModule} from '@angular/core';

import {AlphaMessageBoxComponent} from './alpha-message-box/alpha-message-box.component';
import {AlphaTableBasicComponent} from './alpha-table-basic/alpha-table-basic.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AlphaMessageBoxComponent,
    AlphaTableBasicComponent

  ],
  exports: [
    CommonModule,
    AlphaMessageBoxComponent,
    AlphaTableBasicComponent],
  providers: [],
})

export class AlphaGeneralGUIModule {}
