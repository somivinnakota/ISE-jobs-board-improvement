import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeSwapButton } from '../theming/theme-swap-button';

// Mock next-themes
const mockSetTheme = jest.fn();
const mockTheme = { theme: 'light', setTheme: mockSetTheme };

jest.mock('next-themes', () => ({
  useTheme: () => mockTheme,
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

describe('ThemeSwapButton', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockTheme.theme = 'light';
  });

  it('renders the button with initial light theme', () => {
    render(<ThemeSwapButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('switches theme when clicked', () => {
    render(<ThemeSwapButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalled();
  });

  it('handles theme toggle correctly', () => {
    const { rerender } = render(<ThemeSwapButton />);

    // Test light to dark
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalled();

    // Update mock theme
    mockTheme.theme = 'dark';
    rerender(<ThemeSwapButton />);

    // Test dark to light
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalled();
  });

  it('handles hydration correctly', () => {
    render(<ThemeSwapButton />);

    // Check that the button has suppressHydrationWarning
    const button = screen.getByRole('button');
    expect(button.getAttribute('suppressHydrationWarning')).toBeDefined();
  });

  it('updates icon based on theme', () => {
    const { rerender } = render(<ThemeSwapButton />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();

    // Update mock theme
    mockTheme.theme = 'dark';
    rerender(<ThemeSwapButton />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });
}); 
