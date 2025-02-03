import readline from "node:readline";

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, (answer) => resolve(answer));
    });
};
