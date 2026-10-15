import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';

@Injectable()
export class ParamReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(futura: ActivatedRouteSnapshot, actual: ActivatedRouteSnapshot): boolean {
    if (futura.routeConfig !== actual.routeConfig) {
      return false;
    }

    const claves = new Set([...Object.keys(futura.params), ...Object.keys(actual.params)]);

    for (const clave of claves) {
      if (futura.params[clave] !== actual.params[clave]) {
        return false;
      }
    }

    return true;
  }
}
