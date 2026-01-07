export default {
  '*.{ts,tsx,js,jsx}': (files) => {
    // Filter out files in packages/ui/scripts and lintstagedrc files
    const filteredFiles = files.filter(
      file => !file.includes('packages/ui/scripts/') && !file.includes('.lintstagedrc')
    );
    
    if (filteredFiles.length === 0) return [];
    
    return [
      `eslint --fix ${filteredFiles.join(' ')}`,
      `prettier -w ${filteredFiles.join(' ')}`
    ];
  },
  '*.{json,md,css,scss}': 'prettier -w'
};