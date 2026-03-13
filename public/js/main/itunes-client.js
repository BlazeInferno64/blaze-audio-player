"use strict";

const version = '1.0';

class BaseITunesError extends Error {
    constructor(message) {
        super(message);
        this.guess = null;
        this.isRecoverable = false;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status || null,
            timestamp: this.timestamp,
            ...(this.guess && { hint: this.guess }),
            ...(this.isRecoverable && { recoverable: true })
        };
    }
}

class RequestAbortedError extends BaseITunesError {
    constructor(reason = "The request was cancelled by the user!") {
        super(reason);
        this.name = "Request_Aborted_Error";
        this.isRecoverable = true;
    }
}

class OfflineError extends BaseITunesError {
    constructor(message = "No internet connection detected!") {
        super(message);
        this.name = "Offline_Error";
        this.code = "ENOTFOUND";
        this.isRecoverable = true;
    }
}

class InvalidRequestError extends BaseITunesError {
    constructor(status, message = "The request was invalid!") {
        super(message);
        this.name = "Invalid_Request_Error";
        this.status = status;
    }
}

class RateLimitError extends BaseITunesError {
    constructor(message = "Too many requests!") {
        super(message);
        this.name = "Rate_Limit_Error";
        this.status = 429;
        this.retryAfter = 3000;
    }
}

class ITunesServerError extends BaseITunesError {
    constructor(status, message = "iTunes service is currently unavailable!") {
        super(`${message} (Status: ${status})`);
        this.name = "ITunes_Server_Error";
        this.status = status;
        this.guess = `Apple's servers might be down. Try again later.`;
    }
}

class ITunesClient {
    constructor() {
        this.baseURL = `https://itunes.apple.com`;
        this.activeController = null;
    }

    /**
     * Cancels any in-flight request.
     * @param {string} [reason] - Optional reason for cancellation.
     */
    cancel(reason = null) {
        if (this.activeController) {
            this.activeController.abort(reason ?? "Request cancelled.");
            this.activeController = null;
        }
    }

    /**
     * Searches the iTunes API.
     * NOTE: This client is not safe for concurrent use. Calling search() while
     * a request is in-flight will cancel the previous request automatically.
     * @param {string} query - The search term.
     * @param {object} options
     * @param {number} [options.limit=1] - Max results to return.
     * @param {string} [options.entity='song'] - The type of results to return.
     * @param {string|null} [options.userAgent=null] - Custom User-Agent header.
     * @param {AbortSignal|null} [options.signal=null] - External abort signal.
     * @param {number} [options.timeout=8000] - Request timeout in ms.
     */
    async search(query, { limit = 1, entity = 'song', userAgent = null, signal = null, timeout = 8000 } = {}) {
        this.cancel("New search initiated.");

        this.activeController = new AbortController();
        const timeoutId = setTimeout(() => {
            this.activeController?.abort("Request timed out.");
        }, timeout);

        const combinedSignal = signal
            ? AbortSignal.any([signal, this.activeController.signal])
            : this.activeController.signal;

        try {
            if (!query || query.trim() === "") {
                throw new InvalidRequestError(400, "Search term is required!");
            }

            const response = await fetch(
                `${this.baseURL}/search?term=${encodeURIComponent(query)}&limit=${limit}&entity=${entity}`,
                {
                    signal: combinedSignal,
                    headers: {
                        "User-Agent": userAgent || `iTunesClient/${version}`,
                    }
                }
            );

            clearTimeout(timeoutId);

            if (response.status === 429) throw new RateLimitError();
            if (response.status >= 500) throw new ITunesServerError(response.status);
            if (response.status >= 400) throw new InvalidRequestError(response.status);
            if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                const abortReasonRaw = combinedSignal.reason || error.message;
                const abortReason = abortReasonRaw?.trim()
                    ? abortReasonRaw
                    : "Request aborted (no reason provided).";

                console.log("AbortError caught:", {
                    name: error.name,
                    message: error.message,
                    reason: abortReason,
                    source: signal?.aborted ? "external signal" : "internal controller"
                });

                throw new RequestAbortedError(abortReason);
            }

            if (error instanceof TypeError) {
                throw new OfflineError("Network connection interrupted!");
            }

            throw error;

        } finally {
            this.activeController = null;
        }
    }
}