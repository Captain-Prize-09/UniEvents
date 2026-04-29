// Fix datetimepicker module resolution issue
const fs = require('fs');
const path = require('path');

const indexPath = path.join(
  __dirname,
  'node_modules',
  '@react-native-community',
  'datetimepicker',
  'src',
  'index.js'
);

try {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Add .js extensions to all relative imports
  content = content.replace(
    /from ['"]\.\/(\w+)['"]/g,
    "from './$1.js'"
  );
  
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('✓ Fixed datetimepicker module imports');
} catch (error) {
  console.warn('⚠ Could not fix datetimepicker imports:', error.message);
}
