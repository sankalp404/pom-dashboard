import {Routes, RouterModule} from '@angular/router';
import {NgModule} from "@angular/core";
import {PomViewComponent} from "./components/pom-view/pom-view.component";
import {PomReportViewComponent} from "./components/pom-report-view/pom-report-view.component";

// Development path: 'webclient/pomdashboard/pomdashboard.html'
// Final path: 'webclient/common/jsp/facesMainLayoutWrapper.jsp?url=/webclient/pomdashboard/pomdashboard.html&childTab=POMDashboard&selectedTab=Fault'
export const pomRoutes: Routes = [
  {
    path: '',
    redirectTo: 'pomdashboard',
    pathMatch: 'full'
  },{
    path: 'pomdashboard',
    component: PomViewComponent,
  },{
    path:'reportview/:node/:severity',
    component: PomReportViewComponent
  },{
    path: 'reportview/:node/:startTime/:stopTime/:severity',
    component: PomReportViewComponent
  }
  // todo make a page not found component: { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(pomRoutes) ],
  exports: [RouterModule]
})

export class PomDashboardRoutingModule{}
export const routedComponents = [PomViewComponent, PomReportViewComponent];
