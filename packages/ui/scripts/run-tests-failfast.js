#!/usr/bin/env node

import { runStorybookTestsFailFast } from './storybook.js';

const url = process.env.STORYBOOK_URL || 'http://localhost:6006';
const tag = (process.argv[2] || '').split(',').map((t) => t.trim());
const watchMode = process.argv.includes('--watch');

runStorybookTestsFailFast(url, tag, watchMode);
