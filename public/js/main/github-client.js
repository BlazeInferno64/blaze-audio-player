"use strict";

class GitHubClient {
    constructor() {
        this.baseUrl = 'https://api.github.com';
    }
    async getUserRepos(username) {
        const response = await fetch(`${this.baseUrl}/users/${username}/repos`);
        if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (!response.ok) {
            throw new Error(`Error fetching repositories for user ${username}: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }

    async getSpecificRepo(username, repoName) {
        const url = `${this.baseUrl}/repos/${username}/${repoName}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "User-Agent": (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : "GithubClient/1.0",
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching repository ${repoName} for user ${username}: ${response.statusText}`);
        }
        if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        const data = await response.json();
        return data;
    }

    async getUser(username) {
        const response = await fetch(`${this.baseUrl}/users/${username}`);
        if (!response.ok) {
            throw new Error(`Error fetching user ${username}: ${response.statusText}`);
        }
        if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }
        const data = await response.json();
        return data;
    }
}

const client = new GitHubClient();
