/**
 * Created by Sankalp Sharma on 1/19/2017.
 */
import {Component, OnInit, OnChanges, Input, SimpleChanges} from '@angular/core';
import {ViewEncapsulation} from '@angular/core';
import {Map as lMap} from 'leaflet';

import {Device} from '../../shared/classes/device.class';
import {MapQuestService} from "../../services/mapquest.service";
import {PomGeneratorAttachedPipe} from '../../shared/pipes/pom-generator-attached.pipe';

@Component({
  moduleId: module.id,
  selector: 'pom-cluster-map',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'pom-cluster-map.component.html',
  styleUrls: [
    'pom-cluster-map.component.css',
    '../../../assets/vendor/leaflet.markercluster/dist/MarkerCluster.css',
    '../../../assets/vendor/leaflet/dist/leaflet.css'
  ],
  providers: [MapQuestService]
})

export class PomClusterMapComponent implements OnInit, OnChanges {
  errorMessage: string;
  map: lMap;
  @Input() private devices: Device[];
  @Input() private longitude: number;
  @Input() private latitude: number;
  @Input() private generatorsOnly:boolean = false;

  private iconFiles: Map<number,Object>;

  constructor(private mqService: MapQuestService, private generatorAttachedPipe: PomGeneratorAttachedPipe) {
  }

  ngOnInit(): void {
    this.initializeMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    //when devices change
     if(changes['devices']){
       if(this.generatorsOnly){
         this.mqService.getPowerSupplies(this.getFilteredDevices(changes['devices'].currentValue));
       }else{
          this.mqService.getPowerSupplies(changes['devices'].currentValue);
       }
     }

     //when the toggle value has changed
     if(changes['generatorsOnly'] && this.devices){
       if(this.generatorsOnly){
         this.mqService.getPowerSupplies(this.getFilteredDevices(this.devices));
       }else {
         this.mqService.getPowerSupplies(this.devices);
       }
     }
  }

  getFilteredDevices(devices:Device[]):Device[]{
    return this.generatorAttachedPipe.transform(devices);
  }

  initializeMap(): void {
    //Map settings
    //todo: consider sending classname instead of url to clean up the code
    this.iconFiles = new Map<number,Object>();

    this.iconFiles.set(0, {
      normalImage: '/webclient/angular/dist/assets/images/marker-shadow.png',
      generatorImage: null
    }); //shadow icon
    this.iconFiles.set(1, {
      normalImage: '/webclient/angular/dist/assets/images/marker-icon-green.png',
      generatorImage: '/webclient/angular/dist/assets/images/marker-icon-green-generator.png'
    });
    this.iconFiles.set(2, {
      normalImage: '/webclient/angular/dist/assets/images/marker-icon-yellow.png',
      generatorImage: '/webclient/angular/dist/assets/images/marker-icon-yellow-generator.png'
    });
    this.iconFiles.set(3, {
      normalImage: '/webclient/angular/dist/assets/images/marker-icon-orange.png',
      generatorImage: '/webclient/angular/dist/assets/images/marker-icon-orange-generator.png'
    });
    this.iconFiles.set(4, {
      normalImage: '/webclient/angular/dist/assets/images/marker-icon-red.png',
      generatorImage: '/webclient/angular/dist/assets/images/marker-icon-red-generator.png'
    });
    this.iconFiles.set(5, {
      normalImage: '/webclient/angular/dist/assets/images/marker-icon-x.png',
      generatorImage: null
    }); //error icon

    /*
    this.iconFiles.set(0, {normalImage: '../../../assets/images/marker-shadow.png', generatorImage: null}); //shadow icon
    this.iconFiles.set(1, {normalImage: '../../../assets/images/marker-icon-green.png', generatorImage: '../../../assets/images/marker-icon-green-generator.png'});
    this.iconFiles.set(2, {normalImage: '../../../assets/images/marker-icon-yellow.png', generatorImage: '../../../assets/images/marker-icon-yellow-generator.png'});
    this.iconFiles.set(3, {normalImage: '../../../assets/images/marker-icon-orange.png', generatorImage: '../../../assets/images/marker-icon-orange-generator.png'});
    this.iconFiles.set(4, {normalImage: '../../../assets/images/marker-icon-red.png', generatorImage: '../../../assets/images/marker-icon-red-generator.png'});
    this.iconFiles.set(5, {normalImage: '../../../assets/images/marker-icon-x.png', generatorImage: null}); //error icon
  */
    this.map = this.mqService.getMap('map-details', this.iconFiles, this.latitude, this.longitude, 12);
  }

  clearMap(): void {
    this.mqService.clearMap();
    this.mqService.resetMapPosition();
  }

}
