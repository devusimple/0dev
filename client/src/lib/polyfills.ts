// Browser polyfills for Node.js specific globals
if (typeof window !== 'undefined') {
  // Provide a global object if it doesn't exist (for browser environment)
  if (typeof global === 'undefined') {
    (window as any).global = window;
  }

  // Add process.env polyfill if needed
  if (typeof process === 'undefined') {
    (window as any).process = { env: {} };
  } else if (!process.env) {
    process.env = {};
  }
}

export {};