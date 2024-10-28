import '@testing-library/jest-dom';

// Mocking console.error to avoid printing error messages during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((message) => {
    // Uncomment the line below if you want to allow error messages only if they contain specific text
    // if (message.includes('Expected error message substring')) return;
    // Otherwise, do nothing
  });

  // Mocking console.warn to avoid printing warning messages during tests
  jest.spyOn(console, 'warn').mockImplementation((message) => {
    // Uncomment the line below if you want to allow warning messages only if they contain specific text
    // if (message.includes('Expected warning message substring')) return;
    // Otherwise, do nothing
  });
});
