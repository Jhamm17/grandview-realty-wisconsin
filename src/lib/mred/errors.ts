export class APIError extends Error {
    constructor(
        message: string,
        public statusCode: number
    ) {
        super(message);
        this.name = 'APIError';
    }
}

export class RateLimitError extends Error {
    constructor() {
        super('Rate limit exceeded');
        this.name = 'RateLimitError';
    }
}

class ErrorHandler {
    private static instance: ErrorHandler;

    private constructor() {}

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    public async handleError(error: Error, context: string): Promise<never> {
        console.error(`Error in ${context}:`, {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        if (error instanceof RateLimitError) {
            throw new Error(`Rate limit exceeded in ${context}. Please try again later.`);
        }

        if (error instanceof APIError) {
            throw new Error(`API Error (${error.statusCode}): ${error.message}`);
        }

        throw new Error(`Unexpected error in ${context}: ${error.message}`);
    }
}

export const errorHandler = ErrorHandler.getInstance(); 