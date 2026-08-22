const fs = require('fs');
const path = require('path');

const headerPath = path.join(__dirname, '../frontend/public/images/bast_header.png');
const footerPath = path.join(__dirname, '../frontend/public/images/bast_footer.png');
const outputPath = path.join(__dirname, '../frontend/src/assets/bastTemplates.js');

const headerBase64 = fs.readFileSync(headerPath).toString('base64');
const footerBase64 = fs.readFileSync(footerPath).toString('base64');

const content = `// Auto-generated BAST Header & Footer Base64 Templates
export const DEFAULT_BAST_HEADER = "data:image/png;base64,${headerBase64}";

export const DEFAULT_BAST_FOOTER = "data:image/png;base64,${footerBase64}";
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, content, 'utf8');
console.log('Successfully created bastTemplates.js! Header length:', headerBase64.length, 'Footer length:', footerBase64.length);
