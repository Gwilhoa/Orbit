# TimeSync42 Agent Guidelines

## Commands
- **Build**: `npm run build` (no-op for manifest v3)
- **Dev**: Load extension in Chrome developer mode
- **Lint**: `npx eslint main.js` (ESLint configured, requires Node.js 18+)
- **Test**: No tests configured
- **Zip**: `npm run zip` (creates Chrome distribution archive)
- **XPI**: `npm run xpi` (creates Firefox .xpi package using jar format)
- **Sign**: `npm run sign` (signs extension for AMO distribution)

## Code Style
- **Language**: ES6+ JavaScript for Chrome extension
- **Naming**: camelCase for functions/variables, PascalCase for classes
- **Imports**: ES6 modules, no external dependencies
- **Async**: Use async/await, try/catch for error handling
- **DOM**: Use document fragments, inline styles for dynamic elements
- **Storage**: localStorage for persistence, chrome.storage for extension data
- **Comments**: Section dividers with `===` banners, minimal inline comments

## ESLint Rules
- Extends `eslint:recommended`
- `no-console`: warn
- `no-unused-vars`: error
- Browser + webextensions environment

## Project Structure
- Content script runs on `https://profile.intra.42.fr/*`
- Uses Bitume2000 API for transit data
- Assets in `/assets/` directory
- Manifest v3 extension format (requires browser_specific_settings.gecko.id for Firefox)
- Firefox extensions require signing for permanent installation (use temporary loading for development)