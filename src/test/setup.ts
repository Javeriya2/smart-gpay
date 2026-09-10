import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock canvas-confetti for JSDOM
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Web Speech API if not in environment
if (typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
  class MockSpeechRecognition {
    continuous = false;
    interimResults = false;
    lang = 'en-US';
    onstart: (() => void) | null = null;
    onresult: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    onend: (() => void) | null = null;
    start() {
      if (this.onstart) this.onstart();
    }
    stop() {
      if (this.onend) this.onend();
    }
    abort() {
      if (this.onend) this.onend();
    }
  }
  (window as any).SpeechRecognition = MockSpeechRecognition;
  (window as any).webkitSpeechRecognition = MockSpeechRecognition;
}
