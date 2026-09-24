# Security Policy

## Supported versions

Security fixes are applied to the latest revision on the `main` branch. Historical
commits and old release artifacts are not maintained unless explicitly stated.

## Reporting a vulnerability

Please do **not** open a public issue for a suspected vulnerability.

Use GitHub's private vulnerability reporting feature when it is available for this
repository. If private reporting is unavailable, contact the maintainer through the
contact method listed on the GitHub profile and include:

- affected revision or release;
- minimal reproduction steps;
- expected security boundary and observed behavior;
- impact and realistic attack conditions;
- any suggested mitigation.

Do not include real credentials, access tokens, private dashboards, or production data.

## Project-specific security boundaries

ScreenWeaver renders configuration-driven data sources and visualizations. Treat remote
HTTP/WebSocket payloads and configuration values as untrusted input.

Security-sensitive changes should preserve the following properties:

- no secrets committed to source control or example configuration;
- remote source failures must not silently replace trusted state with invalid payloads;
- cleanup must close sockets, abort in-flight requests, and clear timers;
- user-controlled values must not be converted into executable code;
- dependencies and GitHub Actions should remain pinned and reviewable through CI.

## Disclosure

A report will be acknowledged after review. Remediation timelines depend on severity,
reproducibility, and whether the issue affects the documented project scope.
