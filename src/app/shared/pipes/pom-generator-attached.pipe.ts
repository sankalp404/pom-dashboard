import { Pipe, PipeTransform } from '@angular/core';
import {Device} from '../classes/device.class';

@Pipe({ name: 'pomGeneratorAttached' })
export class PomGeneratorAttachedPipe implements PipeTransform {
  transform(devices: Device[]) {
    return devices.filter(device => device.gen_attached);
  }
}
