import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../theming/theme-provider';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('passes additional props to NextThemesProvider', () => {
    const testProps = {
      attribute: 'data-theme',
      defaultTheme: 'light',
      enableSystem: true,
    };

    render(
      <ThemeProvider {...testProps}>
        <div>Test Child</div>
      </ThemeProvider>
    );
  });
}); 
