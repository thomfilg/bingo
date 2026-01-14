#!/usr/bin/env node

// This hook reminds the AI to use the project-coordinator agent when coordination keywords are detected
// It runs before the user prompt is submitted

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let inputData = '';

rl.on('line', (line) => {
    inputData += line + '\n';
});

rl.on('close', () => {
    try {
        const input = JSON.parse(inputData);

        // Get the user's message from the input
        const userMessage = input.user_message || '';

        // Define coordination-related keywords and synonyms
        const coordinationKeywords = [
            'coordinate',
            'orchestrate',
            'organize',
            'manage multiple',
            'delegate',
            'synchronize',
            'align',
            'harmonize',
            'oversee',
            'supervise',
            'conduct',
            'direct multiple',
            'collaborate across',
            'multi-agent',
            'multiple agents',
            'complex workflow',
            'break down into',
            'distribute tasks',
            'parallel work',
            'concurrent tasks'
        ];

        // Check if the user message contains any coordination keywords
        const lowerMessage = userMessage.toLowerCase();
        const hasCoordinationKeyword = coordinationKeywords.some(keyword =>
            lowerMessage.includes(keyword.toLowerCase())
        );

        if (hasCoordinationKeyword) {
            // Output a reminder to use the project-coordinator agent
            console.log(JSON.stringify({
                permissionDecision: "allow",
                continue: true,
                message: "REMINDER: Use the project-coordinator agent to orchestrate multiple specialized agents for complex tasks. This agent excels at breaking down requirements, delegating to appropriate agents, ensuring quality, and maintaining context throughout the workflow."
            }));
        } else {
            // Allow without reminder
            console.log(JSON.stringify({
                permissionDecision: "allow",
                continue: true
            }));
        }
    } catch (error) {
        // If JSON parsing fails, allow the command
        console.log(JSON.stringify({
            permissionDecision: "allow",
            continue: true
        }));
    }
});