/**
 * Created by Sankalp Sharma on 2/6/2017.
 */
import {Component, OnInit, Input, Inject, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import {TreeFilterService} from "../../services/tree-filter.service";
import {FormGroup, FormBuilder} from "@angular/forms";
import * as _ from 'lodash';

@Component({
  moduleId: module.id,
  selector: 'pom-filter-panel',
  templateUrl: 'pom-filter-panel.component.html',
  styleUrls: ['pom-filter-panel.component.css'],
  providers: [TreeFilterService]
})
export class PomFilterPanelComponent implements OnInit, OnChanges {
  //todo: for english to native file from the parent
  regionTitle: string = 'Region';
  areaTitle: string = 'Area';
  hubTitle: string = 'Hub';

  filterSelectionForm: FormGroup;

  private dataStore: any[];

  private uiRegions: any[];
  private uiAreas: any[];
  private uiHubs: any[];

  @Input() private region;
  @Input() private area;
  @Input() private hub;

  @Output() regionChanged: EventEmitter<string> = new EventEmitter();
  @Output() areaChanged: EventEmitter<string> = new EventEmitter();
  @Output() hubChanged: EventEmitter<string> = new EventEmitter();

  constructor(private treeFilterService: TreeFilterService,
              @Inject(FormBuilder) private fBuilder: FormBuilder) {
    this.uiRegions = [];
    this.uiAreas = [];
    this.uiHubs = [];
    this.loadTree();
  }

  ngOnInit() {
    this.filterSelectionForm = this.fBuilder.group({
      region: '',
      area: '',
      hub: ''
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['region'] && this.region) {
      this.getAreaNames(this.region);
      if (this.area) {
        this.getHubNames(this.region, this.area);
      }
    }
  }

  loadTree() {
    this.treeFilterService.loadData()
      .subscribe(
        response => {
          this.dataStore = response['regions'];
        });
  }

  getRegionNames(): string[] {
    this.uiRegions = _.map(this.dataStore, 'regionName');
    return this.uiRegions;
  }

  getAreaNames(region: string): void {
    if (!region) {
      PomFilterPanelComponent.disableControl(this.filterSelectionForm.controls['area']);
      PomFilterPanelComponent.disableControl(this.filterSelectionForm.controls['hub']);
      return;
    }
    try {
      let results = _.find(this.dataStore, {'regionName': region});
      this.uiAreas = _.map(results.areas, 'areaName');
      PomFilterPanelComponent.enableControl(this.filterSelectionForm.controls['area']);
      PomFilterPanelComponent.disableControl(this.filterSelectionForm.controls['hub']);
    } catch (error) {
      console.log("Error getting areas:" + error);
    }
  }

  getHubNames(region: string, area: string): void {
    if (!region || !area) {
      PomFilterPanelComponent.disableControl(this.filterSelectionForm.controls['hub']);
      return;
    }
    try {
      let foundRegion = _.find(this.dataStore, {'regionName': region});
      let foundArea = _.find(foundRegion.areas, {'areaName': area});
      this.uiHubs = foundArea['hubs'];
      PomFilterPanelComponent.enableControl(this.filterSelectionForm.controls['hub']);
    } catch (error) {
      console.log("Error getting hubs:" + error);
    }
  }

  onRegionChange(region: string) {
    this.regionChanged.emit(region);
    this.onAreaChange("");
  }

  onAreaChange(area: string) {
    this.areaChanged.emit(area);
    this.onHubChange("");
  }

  onHubChange(hub: string) {
    this.hubChanged.emit(hub);
  }

  static disableControl(control): void {
    control.disable();
    control.setValue("");
  }

  static enableControl(control): void {
    control.enable();
    control.setValue("");
  }

}
