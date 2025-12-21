/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// FIX: Add explicit imports for Jest globals to resolve type errors.
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { HashRouter } from 'react-router-dom';
import CodeAssistantPage from '../CodeAssistantPage';
import { ThemeProvider } from '../../hooks/useTheme';

// Mock the @google/genai library
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Speech Recognition API
const mockRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  onstart: () => {},
  onend: () => {},
  onerror: (event: any) => {},
  onresult: (event: any) => {},
  continuous: false,
  interimResults: false,
};
const mockSpeechRecognition = jest.fn(() => mockRecognition);


describe('CodeAssistantPage Component', () => {

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    localStorageMock.clear();
    // Provide a basic mock for PrismJS and JSHINT
    window.Prism = { highlightElement: jest.fn() };
    window.JSHINT = jest.fn(() => true);
    // Assign the mock to the window object for the component to use
    window.SpeechRecognition = mockSpeechRecognition;
    window.webkitSpeechRecognition = mockSpeechRecognition;
  });

  const renderComponent = () => {
    return render(
      <HashRouter>
        <ThemeProvider>
          <CodeAssistantPage />
        </ThemeProvider>
      </HashRouter>
    );
  };
  
  test('renders the initial UI correctly', () => {
    renderComponent();
    expect(screen.getByText('Code Assistant')).toBeInTheDocument();
    expect(screen.getByLabelText('What would you like to create?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate Code' })).toBeInTheDocument();
    expect(screen.getByText('Your generation history will appear here.')).toBeInTheDocument();
  });

  test('allows user to type in the prompt textarea', () => {
    renderComponent();
    const textarea = screen.getByLabelText('What would you like to create?');
    fireEvent.change(textarea, { target: { value: 'a login form' } });
    expect(textarea).toHaveValue('a login form');
  });

  test('handles successful code generation', async () => {
    const generatedCode = '<!DOCTYPE html><html><body><h1>Login</h1></body></html>';
    mockGenerateContent.mockResolvedValue({
      text: '```html\n' + generatedCode + '\n```',
    });

    renderComponent();
    
    const textarea = screen.getByLabelText('What would you like to create?');
    fireEvent.change(textarea, { target: { value: 'a login form' } });

    const generateButton = screen.getByRole('button', { name: 'Generate Code' });
    
    act(() => {
      fireEvent.click(generateButton);
    });

    expect(screen.getByText('Generating...')).toBeInTheDocument();

    await waitFor(() => {
      // Switches to the preview tab
      expect(screen.getByRole('tab', { name: 'Preview & Edit', selected: true })).toBeInTheDocument();
    });

    // CodeEditor's textarea will contain the code
    const editorTextarea = screen.getByRole('textbox', { name: /Live Code Editor/i });
    expect(editorTextarea).toHaveValue(generatedCode);
    
    // Check if history is updated
    act(() => {
      screen.getByRole('tab', { name: 'Assistant' }).click();
    });
    expect(await screen.findByText('a login form')).toBeInTheDocument();
  });

   test('handles API errors gracefully', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Error'));

    renderComponent();
    
    fireEvent.change(screen.getByLabelText('What would you like to create?'), { target: { value: 'a button' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate Code' }));

    await waitFor(() => {
        expect(screen.getByText(/Failed to generate code/)).toBeInTheDocument();
    });
  });

  test('history is persisted in localStorage', async () => {
    const generatedCode = '<div></div>';
    mockGenerateContent.mockResolvedValue({ text: '```html\n' + generatedCode + '\n```' });

    // First render and generation
    const { unmount } = renderComponent();
    fireEvent.change(screen.getByLabelText('What would you like to create?'), { target: { value: 'a simple div' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate Code' }));
    await waitFor(() => expect(screen.getByText('a simple div')).toBeInTheDocument());
    
    // Unmount and remount to simulate page refresh
    unmount();
    renderComponent();

    // Check if history is loaded from localStorage
    expect(screen.getByText('a simple div')).toBeInTheDocument();
  });

  test('clicking a history item populates the prompt and code editor', async () => {
    const historyItem = {
      id: '1',
      prompt: 'a card component',
      code: '<div>Card</div>',
    };
    localStorageMock.setItem('codeAssistantHistory', JSON.stringify([historyItem]));
    
    renderComponent();

    const historyButton = screen.getByRole('button', { name: 'a card component' });
    fireEvent.click(historyButton);

    expect(screen.getByLabelText('What would you like to create?')).toHaveValue('a card component');
    
    // Switch to preview tab to check code
    act(() => {
      screen.getByRole('tab', { name: 'Preview & Edit' }).click();
    });
    
    const editorTextarea = screen.getByRole('textbox', { name: /Live Code Editor/i });
    await waitFor(() => {
        expect(editorTextarea).toHaveValue('<div>Card</div>');
    });
  });

  test('copy code button works correctly', async () => {
    renderComponent();
    
    // Generate some code first
    mockGenerateContent.mockResolvedValue({ text: '```html\n<p>test</p>\n```' });
    fireEvent.change(screen.getByLabelText('What would you like to create?'), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Generate Code' }));

    await waitFor(() => screen.getByRole('tab', { name: 'Preview & Edit', selected: true }));

    const copyButton = screen.getByRole('button', { name: /Copy Code/i });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('<p>test</p>');
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
    
    // Check if the button text reverts after timeout
    await waitFor(() => expect(screen.queryByText('Copied!')).not.toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByRole('button', { name: /Copy Code/i })).toBeInTheDocument();
  });

  describe('Speech Recognition', () => {
    test('microphone button toggles listening state', () => {
      renderComponent();
      const micButton = screen.getByRole('button', { name: 'Start listening' });

      // Start listening
      fireEvent.click(micButton);
      expect(mockRecognition.start).toHaveBeenCalledTimes(1);

      // Simulate the onstart event to update the UI
      act(() => {
        mockRecognition.onstart();
      });

      expect(screen.getByRole('button', { name: 'Stop listening' })).toBeInTheDocument();

      // Stop listening
      fireEvent.click(micButton);
      expect(mockRecognition.stop).toHaveBeenCalledTimes(1);
      
      // Simulate the onend event to update the UI
      act(() => {
        mockRecognition.onend();
      });
      
      expect(screen.getByRole('button', { name: 'Start listening' })).toBeInTheDocument();
    });

    test('appends recognized speech to the prompt', async () => {
      renderComponent();
      const textarea = screen.getByLabelText('What would you like to create?');
      fireEvent.change(textarea, { target: { value: 'Create' } });

      const micButton = screen.getByRole('button', { name: 'Start listening' });
      fireEvent.click(micButton);

      act(() => {
        mockRecognition.onresult({
          resultIndex: 0,
          results: [{ 0: { transcript: ' a button' }, isFinal: true }],
        });
      });
      
      await waitFor(() => {
        expect(textarea).toHaveValue('Create a button');
      });
    });

    test('handles microphone permission denied error', () => {
      renderComponent();
      const micButton = screen.getByRole('button', { name: 'Start listening' });
      fireEvent.click(micButton);

      act(() => {
        mockRecognition.onerror({ error: 'not-allowed' });
      });

      expect(screen.getByText(/Microphone access was denied/)).toBeInTheDocument();
    });

    test('shows an error if speech recognition is not supported', () => {
      // Undefine SpeechRecognition for this test
      // @ts-ignore
      window.SpeechRecognition = undefined;
      // @ts-ignore
      window.webkitSpeechRecognition = undefined;

      renderComponent();

      expect(screen.getByText('Speech recognition is not supported by your browser.')).toBeInTheDocument();
      const micButton = screen.getByRole('button', { name: 'Start listening' });
      expect(micButton).toBeDisabled();
    });
  });

  describe('Tab Switching', () => {
    test('switches between Assistant and Preview tabs correctly', () => {
      renderComponent();

      // Initially on Assistant tab
      expect(screen.getByRole('tab', { name: 'Assistant', selected: true })).toBeInTheDocument();
      expect(screen.getByLabelText('What would you like to create?')).toBeVisible();

      // Switch to Preview tab
      const previewTab = screen.getByRole('tab', { name: 'Preview & Edit' });
      fireEvent.click(previewTab);

      expect(previewTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel', { name: 'Assistant' })).not.toBeVisible();
      expect(screen.getByText('Nothing to preview')).toBeInTheDocument();

      // Switch back to Assistant tab
      const assistantTab = screen.getByRole('tab', { name: 'Assistant' });
      fireEvent.click(assistantTab);
      
      expect(assistantTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel', { name: 'Assistant' })).toBeVisible();
      expect(screen.queryByText('Nothing to preview')).not.toBeInTheDocument();
    });
  });

  describe('History Management', () => {
    test('clears history when "Clear History" is clicked and confirmed', async () => {
      window.confirm = jest.fn(() => true); // Mock confirm to return true
      const historyItem = { id: '1', prompt: 'a test prompt', code: '<code>' };
      localStorageMock.setItem('codeAssistantHistory', JSON.stringify([historyItem]));

      renderComponent();

      // History should be visible
      expect(await screen.findByText('a test prompt')).toBeInTheDocument();
      
      const clearButton = screen.getByRole('button', { name: 'Clear History' });
      fireEvent.click(clearButton);

      expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to clear your entire history? This cannot be undone.");
      
      // History should be gone
      expect(screen.queryByText('a test prompt')).not.toBeInTheDocument();
      expect(screen.getByText('Your generation history will appear here.')).toBeInTheDocument();
      expect(localStorageMock.getItem('codeAssistantHistory')).toBe('[]');
    });
  });

  describe('Code Actions', () => {
    beforeEach(async () => {
      // Generate some code to work with for these tests
      mockGenerateContent.mockResolvedValue({ text: '```html\n<p>Action Test</p>\n```' });
      renderComponent();
      fireEvent.change(screen.getByLabelText('What would you like to create?'), { target: { value: 'action test' } });
      fireEvent.click(screen.getByRole('button', { name: 'Generate Code' }));
      await waitFor(() => screen.getByRole('tab', { name: 'Preview & Edit', selected: true }));
    });

    test('save to file button triggers a download', () => {
      // Mock URL and link methods
      window.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-url');
      window.URL.revokeObjectURL = jest.fn();
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
      const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName): any => {
        if (tagName === 'a') return mockLink;
        // @ts-ignore
        return jest.requireActual('react-dom-factories').a();
      });

      const saveButton = screen.getByRole('button', { name: /Save as File/i });
      fireEvent.click(saveButton);

      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toMatch(/action-test\.html/);
      expect(mockLink.click).toHaveBeenCalledTimes(1);
      
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    test('email code button opens a mailto link', () => {
      // Mock window.location.href
      const originalLocation = window.location;
      // @ts-ignore
      delete window.location;
      // @ts-ignore
      window.location = { ...originalLocation, href: '' };

      const emailButton = screen.getByRole('button', { name: /Email Code/i });
      fireEvent.click(emailButton);

      expect(window.location.href).toContain('mailto:support@crestview.edu.ng');
      expect(window.location.href).toContain('subject=Generated%20Code');
      expect(window.location.href).toContain(encodeURIComponent('<p>Action Test</p>'));
      
      // Restore original window.location
      window.location = originalLocation;
    });
  });
  
  describe('Code Linting', () => {
    test('displays linting errors for invalid JavaScript', async () => {
        const mockError = { line: 1, character: 1, reason: "Undeclared variable 'x'.", code: 'W117' };
        // @ts-ignore
        window.JSHINT = jest.fn((code, options) => {
            if (code.includes('x = 5;')) {
                // @ts-ignore
                window.JSHINT.errors = [mockError];
                return false;
            }
             // @ts-ignore
            window.JSHINT.errors = [];
            return true;
        });
         // @ts-ignore
        window.JSHINT.errors = [];
        
        renderComponent();
        
        // Go to preview tab and set some code
        fireEvent.click(screen.getByRole('tab', { name: 'Preview & Edit' }));
        const editor = screen.getByRole('textbox', { name: /Live Code Editor/i });

        fireEvent.change(editor, { target: { value: '<script>x = 5;</script>' } });
        
        // Wait for debounce and check for error
        await waitFor(() => {
            expect(screen.getByText(/Undeclared variable 'x'/)).toBeInTheDocument();
        });
        
        // Fix the code
        fireEvent.change(editor, { target: { value: '<script>var x = 5;</script>' } });
        
        // Wait for debounce and check that error is gone
         await waitFor(() => {
            expect(screen.queryByText(/Undeclared variable 'x'/)).not.toBeInTheDocument();
        });
    });
  });
});