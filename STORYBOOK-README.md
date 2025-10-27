Storybook setup for AION interface

What I added:

- .storybook/main.js
- .storybook/preview.js
- src/components/panels/MemoriesPanel.stories.js
- package.json scripts: `storybook` and `build-storybook`

How to install Storybook (one-time):

Open a terminal in `c:\Users\riyar\AION\aion_interface` and run (Windows PowerShell):

```powershell
# install Storybook deps (v7 recommended)
npm install --save-dev @storybook/react @storybook/addon-essentials
```

If you prefer installing a pinned set of packages (recommended):

```powershell
npm install --save-dev @storybook/react@^7.0.0 @storybook/addon-essentials@^7.0.0
```

Run Storybook:

```powershell
npm run storybook
```

Build static Storybook:

```powershell
npm run build-storybook
```

Notes & next steps:

- I imported `src/App.css` into `.storybook/preview.js` so stories render with the app's global styles.
- The stories use a mocked `onMemoryRetrieval` to show sample data; you can edit `MemoriesPanel.stories.js` to change scenarios.
- For automated visual regression you can integrate Chromatic (paid) or use Playwright/Puppeteer to capture screenshots of story snapshots and compare.

If you'd like, I can also:
- Add a Playwright script that loads the Storybook static build and captures PNG snapshots for a simple visual-diff pipeline.
- Add GitHub Actions workflow to build Storybook and run visual diffs using Pixelmatch or Playwright.
