/**
 * This service uses MapQuest API
 * Requires global access to the leaflet library and global access to the
 * MapQuest api url/key. This can be achieved by adding script links to index.html
 *
 */
import {Injectable} from '@angular/core';
import {Map as lMap} from 'leaflet';
import {Device} from '../shared/classes/device.class';
import Layer = L.Layer;
declare let MQ: any;

@Injectable()
export class MapQuestService {
  public map: lMap;
  private icons: Map<number,Object>;
  private baseLat: number;
  private baseLon: number;
  private zoom: number;
  private clusterOffset: number;
  private clusterGroups: Map<string, L.MarkerClusterGroup>;
  private masterGroup:L.FeatureGroup;

  //todo: refactor to make this generic see Refactor Notes below
  private normalStatusName = 'normal';
  private invertorStatusName = 'invertorOn';
  private failedStatusName = 'failed';
  private outageGreaterThan2Name = 'outageGreaterThan2';
  private errorStatusName = 'default';

  constructor() {
    this.clusterGroups = new Map<string, L.MarkerClusterGroup>();
  }

  getMap(eleName: string, iconMap: Map<number,Object>, latitude: number, longitude: number, clusterOffset:number=0, zoom:number=10): lMap {

    this.clusterOffset=clusterOffset;

    //todo: Refactor Notes: refactor to make this generic. Dynamically determine the offset around a center and accept the name, class params from the method attributes
    this.clusterGroups.set(this.normalStatusName,this.createMarkerLayer('greenCluster', 0, -this.clusterOffset));
    this.clusterGroups.set(this.invertorStatusName, this.createMarkerLayer('goldCluster', -this.clusterOffset, 0));
    this.clusterGroups.set(this.failedStatusName, this.createMarkerLayer('redCluster',0, this.clusterOffset));
    this.clusterGroups.set(this.outageGreaterThan2Name, this.createMarkerLayer('orangeCluster', this.clusterOffset, 0));
    this.clusterGroups.set(this.errorStatusName, this.createMarkerLayer('errorCluster', 0, 0));


    this.masterGroup = L.featureGroup([
      this.clusterGroups.get(this.normalStatusName),
      this.clusterGroups.get(this.invertorStatusName),
      this.clusterGroups.get(this.failedStatusName),
      this.clusterGroups.get(this.outageGreaterThan2Name),
      this.clusterGroups.get(this.errorStatusName)
    ]);

    //set Base Map properties
    this.icons = new Map(iconMap);
    this.baseLat = latitude;
    this.baseLon = longitude;
    this.zoom = zoom;

    //create map
    this.map = L.map(eleName, {
      layers: MQ.mapLayer(),
      center: [this.baseLat, this.baseLon],
      zoom: this.zoom
    });

    return this.map;
  }

  getPowerSupplies(devices: Device[]): void {

    if (devices.length>0) {
      this.clearMap();

      for (let device of devices) {

        if(device.latitude && device.longitude) {
          let severityColor = device.severity ? device.severity : 5;
          let shadowImage = this.icons.get(0)['normalImage'];
          let iconImage = device.gen_attached ? this.icons.get(severityColor)['generatorImage'] : this.icons.get(severityColor)['normalImage'];

          let icon = L.icon({
            iconUrl: iconImage,
            shadowUrl: shadowImage
          });

          //create individual markers
          let marker = L.marker(L.latLng(device.latitude, device.longitude), {title: device.display_name, icon: icon, zIndexOffset:-9999});
          marker.bindPopup(`
          <div name="${device.id}">
            <h4>${device.display_name}</h4>
            <label>Mac Address:</label> ${device.mac_address}<br>
            <label>IP Address:</label> ${device.ip_address}<br>
            <label>Severity:</label> ${severityColor == 5 ? 'Unknown' : severityColor}<br>
          </div>
          `
          );

          //place marker in appropriate clusterGroup
          switch (severityColor) {
            case 1:
              this.clusterGroups.get(this.normalStatusName).addLayer(marker);
              break;
            case 2:
              this.clusterGroups.get(this.invertorStatusName).addLayer(marker);
              break;
            case 3:
              this.clusterGroups.get(this.outageGreaterThan2Name).addLayer(marker);
              break;
            case 4:
              this.clusterGroups.get(this.failedStatusName).addLayer(marker);
              break;
            default:
              console.error("Error: Some devices have missing or null severity levels");
              this.clusterGroups.get(this.errorStatusName).addLayer(marker);
          }
        }else{
          console.error(device.display_name +" has missing coordinates and is not displayed.")
        }
      }

      try{
        this.map.addLayer(this.masterGroup);
        this.map.fitBounds(this.masterGroup.getBounds());
      }catch(ex){
        console.error("No longitude or latitude coordinates found for any of the devices.")
      }

    }else{
      this.clearMap();
    }
  }

  clearMap(): void {
    try{
      for (let group of this.clusterGroups.values()){
        group.clearLayers();
      }
      this.map.removeLayer(this.masterGroup);
    }catch(ex){
      //fires when there is nothing to clear
    }

  }

  resetMapPosition():void{
    this.map.panTo(L.latLng(this.baseLat, this.baseLon));
    this.map.setZoom(this.zoom);
  }

  private createMarkerLayer(className:string, x:number , y:number, markerSize:number=40): L.MarkerClusterGroup{
    let markerLayer = L.markerClusterGroup({
          iconCreateFunction: function (cluster) {
            let centerFactor = markerSize/2;
            let markers = cluster.getAllChildMarkers();
            let iconForCluster = L.divIcon({
              className: className,
              iconSize: L.point(markerSize, markerSize),
              html: `<div class="clusterLabel" >${markers.length.toString()} </div>`,
              iconAnchor: L.point(x+centerFactor,y+centerFactor),
            });

            return iconForCluster;
          },
          showCoverageOnHover: false
    });

    return markerLayer;
  }

}
