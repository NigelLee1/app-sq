import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import {TokenService} from '../cache/token.service';
import {NavController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class JWTGuard implements CanActivate {

  constructor(private tokenService: TokenService,
              private navController: NavController) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.tokenService.getToken() === null) {
      this.navController.navigateRoot('login');
      return false;
    }
    return true;
  }

}
