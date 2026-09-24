## What changed?

<!-- Explain the problem and the implementation. Keep scope focused. -->

## Why?

<!-- Link an issue when one exists and describe the user/engineering impact. -->

## Verification

- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] I exercised the affected source type or visualization path
- [ ] I added or updated tests for behavior changes
- [ ] I updated documentation/examples when configuration semantics changed
- [ ] I did not add secrets, production endpoints, or private data

## Reliability checklist

If this changes HTTP/WebSocket lifecycle behavior:

- [ ] failed responses do not overwrite valid state
- [ ] polling cannot overlap unexpectedly
- [ ] timers, sockets, and requests are cleaned up on unmount
- [ ] retry behavior remains bounded and observable

## Screenshots / demo

<!-- Add before/after evidence for visual changes. -->
