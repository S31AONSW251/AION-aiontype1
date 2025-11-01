/* eslint-disable jest/expect-expect */
import React from 'react';
import { render, fireEvent, screen, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// Mock mathjs used by MathPanel
jest.mock('mathjs', () => ({
  evaluate: jest.fn((expr) => {
    // very small evaluator stub
    if (expr === '2+2') return 4;
    return 42;
  }),
  parse: jest.fn((e) => ({ toTex: () => `\\(${e}\\)` })),
  compile: jest.fn(() => ({ evaluate: () => 1 }))
}));

import MathPanel from '../MathPanel';

describe('MathPanel UI', () => {
  beforeEach(() => {
    // clear localStorage and clipboard mock
    localStorage.clear();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn() },
      configurable: true
    });
  });

  function makeCanvasRef() {
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 400;
    // stub getContext used by the component
    canvas.getContext = () => ({
      setTransform: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      stroke: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      fillText: jest.fn(),
      rect: jest.fn(),
      fill: jest.fn(),
      strokeStyle: '',
      lineWidth: 1
    });
    return { current: canvas };
  }

  it('renders problem and solution', async () => {
    const mockSolution = {
      problem: 'Solve 2x + 5 = 13',
      solution: 'x = 4',
      expression: '2*x + 5',
      steps: ['Rearrange terms', 'Solve for x'],
      type: 'algebra',
      graphable: true
    };

    render(
      <MathPanel
        mathSolution={mockSolution}
        settings={{ showMathSteps: true }}
        mathCanvasRef={makeCanvasRef()}
        setActiveTab={() => {}}
        onSolveCustomProblem={() => {}}
        setParentMathSolution={() => {}}
      />
    );

    expect(screen.getByText(/Advanced Mathematical Problem Solver/)).toBeInTheDocument();
    // problem and solution should render
  await waitFor(() => expect(screen.getByText(/Problem:/)).toBeInTheDocument());
  expect(screen.getByText('Solve 2x + 5 = 13')).toBeInTheDocument();
    expect(screen.getByText(/x = 4/)).toBeInTheDocument();
  });

  it('shows steps and copies a step to clipboard', async () => {
    const mockSolution = {
      problem: 'Simple',
      solution: 'Done',
      expression: 'x',
      steps: ['Step A', 'Step B'],
      type: 'algebra'
    };

    render(
      <MathPanel
        mathSolution={mockSolution}
        settings={{ showMathSteps: true }}
        mathCanvasRef={makeCanvasRef()}
        setActiveTab={() => {}}
        onSolveCustomProblem={() => {}}
        setParentMathSolution={() => {}}
      />
    );

    // click Steps tab
    const stepsTab = screen.getByRole('button', { name: /Steps/i });
    fireEvent.click(stepsTab);

    // first step should be visible
    await waitFor(() => expect(screen.getByText(/Step A/)).toBeInTheDocument());

    // click copy button for first step (title="Copy step")
    const copyButtons = screen.getAllByTitle('Copy step');
    expect(copyButtons.length).toBeGreaterThan(0);
    fireEvent.click(copyButtons[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Step A');
  });

  it('evaluates REPL input and persists history', async () => {
    const mockSolution = { problem: 'None', solution: '', expression: '' };

    render(
      <MathPanel
        mathSolution={mockSolution}
        settings={{ showMathSteps: false }}
        mathCanvasRef={makeCanvasRef()}
        setActiveTab={() => {}}
        onSolveCustomProblem={() => {}}
        setParentMathSolution={() => {}}
      />
    );

    // go to Calculator tab
    const calcTab = screen.getByRole('button', { name: /Calculator/i });
    fireEvent.click(calcTab);

    const panel = screen.getByText('Advanced Calculator').closest('div');
    const { getByPlaceholderText, getByTitle } = within(panel);
    const input = getByPlaceholderText(/Enter expression/i);

    fireEvent.change(input, { target: { value: '2+2' } });
    const evalBtn = getByTitle('Evaluate');
    fireEvent.click(evalBtn);

    // REPL history should show result 4
    await waitFor(() => expect(screen.getByText(/REPL History/)).toBeInTheDocument());
    expect(screen.getByText(/2\+2/)).toBeInTheDocument();
    expect(screen.getByText(/4/)).toBeInTheDocument();

    // persisted to localStorage
    const raw = localStorage.getItem('aion_math_repl_history');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0].expr).toBe('2+2');
  });
});
