/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
// FIX: Add explicit imports for Jest globals to resolve type errors.
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useTheme, ThemeProvider, ThemeName } from '../useTheme';

// A test component that displays the current theme name and has a button to change it.
const TestComponent = () => {
  const { theme, switchTheme } = useTheme();

  return (
    <div>
      <div data-testid="theme-name">{theme.name}</div>
      <div data-testid="theme-background">{theme.background}</div>
      <button onClick={() => switchTheme('dark')}>Switch to Dark</button>
      <button onClick={() => switchTheme('faith')}>Switch to Faith</button>
    </div>
  );
};

describe('useTheme Hook and ThemeProvider', () => {
  
  // Suppress console.error output for the intentional error test
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('should provide the default theme (light) to child components', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-name')).toHaveTextContent('light');
    expect(screen.getByTestId('theme-background')).toHaveTextContent('bg-white');
  });

  test('should allow switching the theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initial theme is 'light'
    expect(screen.getByTestId('theme-name')).toHaveTextContent('light');

    // Switch to 'dark' theme
    act(() => {
      screen.getByText('Switch to Dark').click();
    });

    expect(screen.getByTestId('theme-name')).toHaveTextContent('dark');
    expect(screen.getByTestId('theme-background')).toHaveTextContent('bg-gray-900');

    // Switch to 'faith' theme
     act(() => {
      screen.getByText('Switch to Faith').click();
    });

    expect(screen.getByTestId('theme-name')).toHaveTextContent('faith');
    expect(screen.getByTestId('theme-background')).toHaveTextContent('bg-gradient-to-br from-blue-700 to-blue-900');
  });

  test('should throw an error if useTheme is used outside of a ThemeProvider', () => {
    // This component will throw an error because it's not wrapped in ThemeProvider
    const ComponentWithoutProvider = () => {
      useTheme();
      return <div>Will not render</div>;
    };
    
    // We expect the render to throw an error
    expect(() => render(<ComponentWithoutProvider />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
  });
});