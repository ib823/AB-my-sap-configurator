const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/components/AppProvider.jsx', 'utf8');

// Remove all TypeScript type annotations
content = content
  // Remove interface declarations
  .replace(/interface \w+\s*{[^}]*}/g, '')
  // Remove type annotations from parameters
  .replace(/:\s*(string|number|boolean|any|void|\w+\[\]|'[^']*'|Array<[^>]*>|{[^}]*})/g, '')
  // Remove generic type parameters
  .replace(/<[A-Za-z, {}:\s|'"]*>/g, '')
  // Remove type declarations
  .replace(/type \w+\s*=\s*[^;]+;/g, '')
  // Remove 'as' type assertions
  .replace(/\s+as\s+\w+/g, '')
  // Clean up React.FC
  .replace(/:\s*React\.FC/g, '')
  // Remove Omit, Partial, etc.
  .replace(/Omit<[^>]*>|Partial<[^>]*>/g, 'Object')
  // Fix const definitions
  .replace(/const (\w+): \w+ = /g, 'const $1 = ');

// Write cleaned file
fs.writeFileSync('src/components/AppProvider.jsx', content);
console.log('✅ TypeScript syntax removed');
