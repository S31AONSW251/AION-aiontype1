import React from 'react';
import MemoryManager from './MemoriesPanel';

const sample = [
  { id: 'm1', text: 'This memory mentions unicorns and rainbows in a long story about a journey.', score: 0.92, metadata: { timestamp: '2025-10-26', type: 'episodic' } },
  { id: 'm2', text: 'Another memory referencing dragons and legends with unicorn sightings.', score: 0.81, metadata: { timestamp: '2025-10-25', type: 'episodic' } },
  { id: 'm3', text: 'Procedural memory: how to bake bread and other kitchen tricks.', score: 0.55, metadata: { timestamp: '2024-12-12', type: 'procedural' } },
];

export default {
  title: 'Panels/MemoriesPanel',
  component: MemoryManager,
};

const Template = (args) => <MemoryManager {...args} />;

export const Default = Template.bind({});
Default.args = {
  soulState: {},
  onMemoryRetrieval: async (q) => {
    // return filtered sample results
    return sample.filter(s => s.text.toLowerCase().includes(q.toLowerCase()));
  },
  onMemoryUpdate: async (m) => { console.log('updated', m); },
  onMemoryConsolidation: async () => {},
};

export const WithPinned = Template.bind({});
WithPinned.args = {
  ...Default.args,
  onMemoryRetrieval: async (q) => sample,
};

export const LightTheme = Template.bind({});
LightTheme.args = { ...Default.args };
LightTheme.decorators = [(Story) => <div className="light-theme" style={{padding:20}}><Story/></div>];
