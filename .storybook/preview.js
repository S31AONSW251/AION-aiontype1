import '../src/App.css';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: { expanded: true },
  backgrounds: {
    default: 'dark',
    values: [
      { name: 'dark', value: 'var(--bg-page)' },
      { name: 'light', value: 'var(--bg-page)' },
    ],
  },
};
