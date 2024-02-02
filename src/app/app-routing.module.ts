import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {LoginPage} from './pages/login/login.page';

const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {
        path: 'login',
        component: LoginPage
    },
    {path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)}
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
