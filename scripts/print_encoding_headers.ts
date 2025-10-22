import fs from 'fs';
import path from 'path';

function checkFileEncoding(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  // Check for UTF-8 BOM
  const hasBOM = buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
  // Try to decode as UTF-8
  try {
    buffer.toString('utf8');
    return { file: filePath, utf8: true, bom: hasBOM };
  } catch {
    return { file: filePath, utf8: false, bom: hasBOM };
  }
}

function walk(dir: string, exts = ['.ts', '.tsx', '.js', '.json', '.css', '.md']) {
  let results: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walk(full, exts));
    } else if (exts.includes(path.extname(full))) {
      results.push(full);
    }
  }
  return results;
}

const root = path.resolve(process.cwd());
const files = walk(root);
const encodings = files.map(checkFileEncoding);
fs.writeFileSync(
  path.join(root, 'diagnostics', 'file_encodings.json'),
  JSON.stringify(encodings, null, 2),
);
console.log('Encoding check complete. Results in diagnostics/file_encodings.json');
