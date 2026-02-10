# Claude Code Guidelines for FIS-Video Client

## Angular Best Practices

### No Template Functions

Never use method calls in Angular templates. They are an anti-pattern because they run on every change detection cycle, causing performance issues.

**Bad:**

```html
<div [class.active]="isActive(item)">
  <span>{{ formatValue(data) }}</span>
</div>
```

**Good alternatives:**

1. **Precompute values** - Add computed properties to your data models/interfaces
2. **Use pipes** - Create pure pipes for transformations
3. **Use signals/computed** - For reactive computed values

### Component Patterns

- Prefer `inject()` over constructor injection
- Use `OnPush` change detection where possible
- Keep templates simple - complex logic belongs in the component class

## Functional Declarative Patterns

### General Principles

- Prefer pure functions over methods with side effects
- Use immutable data structures - never mutate state directly
- Compose small, focused functions rather than large procedural blocks
- Declare what should happen, not how it should happen

### RxJS Best Practices

**Prefer declarative streams over imperative subscriptions:**

**Bad:**

```typescript
ngOnInit() {
  this.service.getData().subscribe(data => {
    this.data = data;
    this.processedData = this.processData(data);
  });
}
```

**Good:**

```typescript
data$ = this.service.getData();
processedData$ = this.data$.pipe(map((data) => this.processData(data)));
```

**Use higher-order mapping operators:**

- `switchMap` - Cancel previous, use latest (searches, navigation)
- `mergeMap` - Run in parallel (independent operations)
- `concatMap` - Queue sequentially (order matters)
- `exhaustMap` - Ignore new until current completes (form submissions)

**Combine streams declaratively:**

```typescript
// Combine latest values from multiple streams
vm$ = combineLatest([this.user$, this.settings$, this.data$]).pipe(
  map(([user, settings, data]) => ({ user, settings, data })),
);
```

**Avoid nested subscriptions - use flattening operators instead:**

**Bad:**

```typescript
this.user$.subscribe((user) => {
  this.dataService.getDataForUser(user.id).subscribe((data) => {
    this.data = data;
  });
});
```

**Good:**

```typescript
data$ = this.user$.pipe(switchMap((user) => this.dataService.getDataForUser(user.id)));
```

### NgRx Best Practices

**Use feature state with `createFeature`:**

```typescript
export const videosFeature = createFeature({
  name: 'videos',
  reducer: createReducer(
    initialState,
    on(VideosActions.loadSuccess, (state, { videos }) => ({
      ...state,
      videos,
      loading: false,
    })),
  ),
});

// Auto-generates selectors: selectVideosState, selectVideos, selectLoading
```

**Use functional effects with `createEffect`:**

```typescript
loadVideos$ = createEffect(() =>
  this.actions$.pipe(
    ofType(VideosActions.load),
    exhaustMap(() =>
      this.videoService.getAll().pipe(
        map((videos) => VideosActions.loadSuccess({ videos })),
        catchError((error) => of(VideosActions.loadFailure({ error }))),
      ),
    ),
  ),
);
```

**Selector composition:**

```typescript
// Base selectors from feature
const { selectVideos, selectLoading } = videosFeature;

// Composed selectors
export const selectPublishedVideos = createSelector(selectVideos, (videos) => videos.filter((v) => v.published));

export const selectVideoById = (id: string) =>
  createSelector(selectVideos, (videos) => videos.find((v) => v.id === id));
```

**Component store for local state:**

```typescript
@Injectable()
export class VideoPlayerStore extends ComponentStore<VideoPlayerState> {
  readonly isPlaying$ = this.select((state) => state.isPlaying);
  readonly currentTime$ = this.select((state) => state.currentTime);

  readonly play = this.updater((state) => ({ ...state, isPlaying: true }));
  readonly pause = this.updater((state) => ({ ...state, isPlaying: false }));

  readonly seek = this.effect<number>((time$) => time$.pipe(tap((time) => this.patchState({ currentTime: time }))));
}
```

### Signals (Angular 16+)

**Prefer signals for synchronous reactive state:**

```typescript
// Component-level reactive state
count = signal(0);
doubleCount = computed(() => this.count() * 2);

// From observables
data = toSignal(this.data$, { initialValue: [] });
```

**Use `computed` for derived state:**

```typescript
filteredItems = computed(() => this.items().filter((item) => item.name.includes(this.searchTerm())));
```

## Summary

1. **Declare, don't imperiate** - Use streams and signals to declare data flow
2. **Compose, don't nest** - Build complex behavior from simple, composable pieces
3. **Immutable updates** - Always return new objects/arrays, never mutate
4. **Single source of truth** - Store state in NgRx, derive everything else
5. **Push, don't pull** - Let data flow to consumers via observables/signals
