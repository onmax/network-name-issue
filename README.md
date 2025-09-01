# Network name parsing fails for non-CamelCase formats

## Description

ClientConfiguration only accepts CamelCase network names (`MainAlbatross`, `mainAlbatross`). Non-CamelCase formats like kebab-case (`main-albatross`, `test-albatross`) and lowercase (`testalbatross`) fail to parse correctly.

## Expected Behavior

All equivalent network name formats should work:
- `MainAlbatross` / `mainAlbatross` ✅ (currently working)
- `main-albatross` / `test-albatross` ❌ (should work)
- `testalbatross` ❌ (should work)

## Actual Behavior

Non-CamelCase network names cause connection failures during client initialization.

## Reproduction

```typescript
const config = new ClientConfiguration()
config.network('main-albatross') // fails
config.network('MainAlbatross')  // works
```

## Error on console

```
worker-D-AmvxC0.js:285 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'toUpperCase')
    at worker-D-AmvxC0.js:285:110
    at worker-D-AmvxC0.js:1600:5
    at worker-D-AmvxC0.js:1601:3
```

## Reference

Network name definitions: https://github.com/nimiq/core-rs-albatross/blob/023ef4c9f441cc3c26a57040873d4d879f6e663a/primitives/src/networks.rs#L73-L85
