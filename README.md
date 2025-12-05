# 42Companion

Browser extension providing essential tools for 42 students including logtime tracking and bus schedules.

## Features

- **Logtime Tracking**: Displays current logtime with progress bar and target time calculation
- **Bus Schedule**: Shows next departures for TCL lines 5 and 86 from stop TCLFR:95258
- **Smart Timing**: Option to restrict workday to start at 8:00 AM
- **Real-time Updates**: Live bus departure information with real-time indicators

## Installation

### Chrome
1. Download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

### Firefox
**Option 1: Temporary Installation (Recommended for Development)**
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox" in the sidebar
3. Click "Load Temporary Add-on"
4. Select the `42companion.xpi` file
5. The extension will work until you restart Firefox

**Option 2: Permanent Installation**
1. Download the .xpi file (`npm run xpi`)
2. Open Firefox and go to `about:addons`
3. Click the gear icon and select "Install Add-on From File"
4. Select the `42companion.xpi` file
5. **Note**: For permanent installation, you may need to disable signature verification:
   - Go to `about:config`
   - Set `xpinstall.signatures.required` to `false`

**Option 3: Sign the Extension (for Distribution)**
1. Create an account on [addons.mozilla.org](https://addons.mozilla.org)
2. Set environment variables: `AMO_API_KEY` and `AMO_API_SECRET`
3. Run `npm run sign` to submit and sign your extension
4. Download the signed .xpi from AMO

**Note**: Firefox requires `browser_specific_settings.gecko.id` in manifest.json for MV3 extensions

## Usage

The extension automatically activates on `https://profile.intra.42.fr/*` and displays:
- Current logtime with color-coded progress bar
- Target time for reaching 7 hours
- Next bus departures with real-time status

## Development

```bash
# Install dependencies (none currently)
npm install

# Load extension in developer mode
npm run dev

# Create Chrome distribution zip
npm run zip

# Create Firefox .xpi package (JAR format with proper META-INF)
npm run xpi
```

## Files

- `manifest.json` - Extension configuration
- `main.js` - Main extension logic
- `assets/` - Bus line icons and transit logo

## API

Uses the Bitume2000 API for TCL transit data:
`https://api.bitume2000.fr/api/transit/next-bus?stopId=TCLFR:95258`