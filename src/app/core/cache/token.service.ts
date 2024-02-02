import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TokenService {

    constructor() {
    }

    getToken() {
        return window.localStorage.getItem('token');
    }

    setUser(user: any) {
        if (user.token) {
            window.localStorage.setItem('token', user.token);
            window.localStorage.setItem('account', user.username);
            delete user.access_token;
        }
        window.localStorage.setItem('user', JSON.stringify(user));
    }

    getUser(): any {
      const user = window.localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }

    getLastLoginAccount(): string {
        return window.localStorage.getItem('account');
    }

    clear() {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('user');
    }
}
