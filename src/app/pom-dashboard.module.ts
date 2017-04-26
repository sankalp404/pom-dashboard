/**
 * Created by sharmasx on 4/6/2017.
 */
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ChartsModule} from "ng2-charts";

import {AlphaGeneralGUIModule} from './../../alpha_library/alpha-general-gui.module';
import {PomDashboardComponent} from './pom-dashboard.component';
import {PomClusterMapComponent} from './components/pom-cluster-map/pom-cluster-map.component';
import {DatePickerComponent} from './components/pom-date-picker/pom-date-picker.component';
import {PomFilterPanelComponent} from './components/pom-filter-panel/pom-filter-panel.component';
import {PomSidebarComponent} from "./components/pom-sidebar/pom-sidebar.component";
import {PomSidebarChartComponent} from "./components/pom-sidebar-chart/pom-sidebar-chart.component";
import {PomFooterComponent} from "./components/pom-footer/pom-footer.component";
import {PomBarchartVerticalComponent} from "./components/pom-barchart-vertical/pom-barchart-vertical.component";
import {PomBarchartHorizontalComponent} from "./components/pom-barchart-horizontal/pom-barchart-horizontal.component";
import {PomLegendComponent} from './components/pom-legend/pom-legend.component';

import {PomGeneratorAttachedPipe} from "./shared/pipes/pom-generator-attached.pipe";

import {MapDataService} from "./services/map-data.service";
import {TreeFilterService} from "./services/tree-filter.service";
import {PomDashboardRoutingModule, routedComponents} from "./pom-dashboard-routing.module";



@NgModule({
  declarations: [
    PomDashboardComponent,
    PomClusterMapComponent,
    DatePickerComponent,
    PomFilterPanelComponent,
    PomSidebarComponent,
    PomSidebarChartComponent,
    PomFooterComponent,
    PomBarchartVerticalComponent,
    PomBarchartHorizontalComponent,
    PomLegendComponent,
    routedComponents,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    NgbModule.forRoot(),
    NgxChartsModule,
    ChartsModule,
    AlphaGeneralGUIModule,
    PomDashboardRoutingModule
  ],
  providers: [MapDataService, TreeFilterService, PomGeneratorAttachedPipe],
  bootstrap: [PomDashboardComponent]
})

export class PomDashboardModule {
}
