import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimatedHeroText from '../animated-hero';

// Mock setTimeout to control timing in tests
jest.useFakeTimers();

describe('AnimatedHeroText', () => {
  const defaultProps = {
    text: 'Hello World',
    emphasis: [0, 6] // Emphasize 'H' and 'W'
  };

  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('renders the component with initial state', () => {
    render(<AnimatedHeroText {...defaultProps} />);
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
  });

  it('displays all characters after animation completes', () => {
    render(<AnimatedHeroText {...defaultProps} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent('H');
    expect(heading).toHaveTextContent('e');
    expect(heading).toHaveTextContent('l');
    expect(heading).toHaveTextContent('o');
    expect(heading).toHaveTextContent('W');
    expect(heading).toHaveTextContent('r');
    expect(heading).toHaveTextContent('d');
  });

  it('handles empty text', () => {
    render(<AnimatedHeroText text="" emphasis={[]} />);
    const heading = screen.getByRole('heading');
    expect(heading).toBeEmptyDOMElement();
  });

  it('handles text with line breaks', () => {
    render(<AnimatedHeroText text="HelloCWorld" emphasis={[]} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent('Hello');
    expect(heading).toHaveTextContent('World');
  });

  it('applies emphasis styling to specified characters', () => {
    render(<AnimatedHeroText {...defaultProps} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const heading = screen.getByRole('heading');
    const emphasizedChars = heading.querySelectorAll('.font-bold');
    expect(emphasizedChars).toHaveLength(2);
  });

  it('handles special characters and spaces', () => {
    render(<AnimatedHeroText text="Hello! World" emphasis={[]} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent('H');
    expect(heading).toHaveTextContent('e');
    expect(heading).toHaveTextContent('l');
    expect(heading).toHaveTextContent('o');
    expect(heading).toHaveTextContent('!');
    expect(heading).toHaveTextContent('W');
    expect(heading).toHaveTextContent('r');
    expect(heading).toHaveTextContent('d');
  });

  it('cleans up timeouts on unmount', () => {
    const { unmount } = render(<AnimatedHeroText {...defaultProps} />);
    
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  // Test animation states
  it('shows animating state for characters', () => {
    render(<AnimatedHeroText {...defaultProps} />);
    
    act(() => {
      jest.advanceTimersByTime(50);
    });

    const heading = screen.getByRole('heading');
    const animatingChars = heading.querySelectorAll('.bg-black');
    expect(animatingChars.length).toBeGreaterThan(0);
  });

  it('handles animation timing correctly', () => {
    render(<AnimatedHeroText {...defaultProps} />);
    
    let heading = screen.getByRole('heading');
    expect(heading.querySelectorAll('.opacity-0').length).toBeGreaterThan(0);
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    heading = screen.getByRole('heading');
    const visibleChars = heading.querySelectorAll('.text-black, .text-white');
    expect(visibleChars.length).toBeGreaterThan(0);
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    heading = screen.getByRole('heading');
    expect(heading.querySelectorAll('.opacity-0').length).toBe(0);
  });

  // Test different animation patterns
  it('handles different animation patterns', () => {
    const originalRandom = Math.random;
    const patterns = [0.1, 0.3, 0.6, 0.8]; // Test all four patterns
    
    patterns.forEach(pattern => {
      Math.random = jest.fn(() => pattern);
      
      const { unmount } = render(<AnimatedHeroText {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('H');
      expect(heading).toHaveTextContent('e');
      expect(heading).toHaveTextContent('l');
      expect(heading).toHaveTextContent('o');
      expect(heading).toHaveTextContent('W');
      expect(heading).toHaveTextContent('r');
      expect(heading).toHaveTextContent('d');
      
      unmount();
    });
    
    Math.random = originalRandom;
  });

  // Test emphasis with different indices
  it('handles emphasis with different character indices', () => {
    const props = {
      text: 'Hello World',
      emphasis: [1, 3, 5, 7] // Emphasize 'e', 'l', ' ', 'o'
    };
    
    render(<AnimatedHeroText {...props} />);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    const heading = screen.getByRole('heading');
    const emphasizedChars = heading.querySelectorAll('.font-bold');
    expect(emphasizedChars).toHaveLength(4);
  });
}); 
