import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        headers: new Headers()
    })
) as jest.Mock;

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
}); 