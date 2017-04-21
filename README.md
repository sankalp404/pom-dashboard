# PomDashboard

Angular Frontend for POM dashboard. Java backend is checked into cvs.

These files are just for back-up purposes. These files are part of the new POM dashboard feature for AlphaXD.
The two .java files are just to give a reference to the business logic.
They will not run/compile as they are part of a much bigger system.

# Features
* Ability to filter power supplies by region, area or hub.
* Ability to view either real-time or historical data.
* Historical view will have the capability to filter by date range.
* Map power supplies onto map.
* Cluster map capability which clusters map markers into their individual clusters based on the severity when zoomed out.
* Distinct map markers for devices with no generators vs devices with generators attached. 
* Real-time view also allows for "generators only" mapping.
* Each filtered selection also shows the following:
    * Outage chart for all the outages in the selection.
    * Pie charts for individual area/hub containers in the selection.
    * Ability to click on the chart to launch a more detailed data-table.
    * Real-time view includes a run-time remaining chart for power supplies as well.

Property of ALPHA TECHNOLOGIES

## Getting Started

### Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`.
The app will automatically reload if you change any of the source files.

#### MapQuest Comparability
Since MapQuest requires leaflet.js and chart.js to be present, a script has been added to the package.json to copy
leaflet from the node_ modules into a vendor folder. Currently, this script is run anytime you run `npm start`.
However, we can adjust this as needed.
<br><br>
## Additional Documentation
#### Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

#### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

#### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

#### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

#### Deploying to GitHub Pages

Run `ng github-pages:deploy` to deploy to GitHub Pages.

#### Further help

To get more help on the `angular-cli` use `ng help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
