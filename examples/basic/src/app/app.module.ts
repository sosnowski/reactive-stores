import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppStore } from './core/stores/app.store';
import { provideAsRoot } from '../store/angular/factory';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
  ],
  providers: [
    provideAsRoot(AppStore)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
