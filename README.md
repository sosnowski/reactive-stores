# Reactive Stores

A State Management library for Angular applications.

Partially inspired by VueX and MobX. It's designed as a developer friendly approach to state management, without a need to create a lot of biolerplate code.

#Work in progress!

## Example usage in Angular

#### Create a state and store
```TypeScript
/**
 * Define a state interface to keep type safety
 */
export interface AppState {
    counter: number;
}
/**
 * Store is simply a class that integrates easily with
 * Angular dependency injection system
 * So remember to use @Injectable
 */
@Injectable()
export class AppStore extends Store<AppState> {
    /**
     * Define initial state for the store
     */
    @State()
    private state: AppState = {
        counter: 0
    };
    /**
     * State can only be modified with actions
     * Action is simply a store method, marked with @Action decorator
     */
    @Action()
    incrementCounter(n: number = 1) {
        /**
         * You can modify state directly, don't have to worry about immutability
         * Stora will take care of it for you
         */
        this.state.counter += n;
    }

    @Action()
    decrementCounter(n: number = 1) {
        this.state.counter -= n;
    }
}
```
#### Register Store in Angular DI system
```TypeScript
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
  ],
  providers: [
    provideAsRoot(AppStore) // Register the store in the scope you will be using it
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
#### Uage in Component
```TypeScript
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
    constructor(private appStore: AppStore) {}
}
```

#### Reading state updates
Store instance provides ```updates``` attribute, which is an RxJS Observable.
```TypeScript
store.updates.map(state => state.counter).subscribe((counter) => {
    console.log(`Counter value: ${counter}`);
});
store.incrementCounter(); // Counter value: 1
store.incrementCounter(); // Counter value: 2
store.decrementCounter(2); // Counter value: 0
```

## Advanced features

### SubStores (Modules)

#### SubStore definition
```TypeScript
export interface UserState {
    name: string;
    lastName: string;
    age: number;
}

@Injectable()
export class UserStore extends SubStore<UserState> {

    @State()
    private state: UserState = {
        name: 'Damian',
        lastName: 'Sosnowski',
        age: 32
    };

    @Action()
    setName(name: string) {
        this.state.name = name;
    }
}
```

#### Add SubStore to the Root
```TypeScript
/**
 * Root State (AppState in this case), should define a property that will store
 * a SubState instance. In this case it's "user"
 */
export interface AppState {
    user?: UserState;
    counter: number;
}

@Injectable()
export class AppStore extends Store<AppState> {

    /**
     * Initial state for the sub state is defined in sub store
     */
    @State()
    private state: AppState = {
        counter: 5
    };
    
    /**
     * @SubStore decorator us used to connect SubStore with it's Parent.
     */
    @SubStore(UserStore) user!: UserStore;

    @Action()
    incrementCounter(n: number = 1) {
        this.state.counter += n;
    }
}
```

Parent has a full access to the SubStore data, but all the SubStore operations are encapsulated.
You can listen for changes on Parent and SubStore independently. However, Parent will also emit when changes are done in its SubStores.

You can nest stores as deep as you want.

## Detailed achitecture and idea behind Reactive Stores

### What is a state management and why should one use it

### One big Store, or multiple smaller ones?

### Store, State, Actions

### State immutability

### Selectors and Mappers
