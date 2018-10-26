import { Component } from '@angular/core';
import { AppStore } from './core/stores/app.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'basic';

    /**
     * Just inject the Store as any other component dependency
     */
    constructor(private appStore: AppStore) {
    }
}
