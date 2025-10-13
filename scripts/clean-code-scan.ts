#!/usr/bin/env tsx
/**
 * Clean Code Scanner - Detects naming violations and generates change proposals
 * Based on CLEAN CODE Charter naming conventions
 */

import * as fs from 'fs';
import * as path from 'path';

interface ChangeProposal {
  oldPath: string;
  newPath: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  type: 'file' | 'directory';
  importers: string[];
}

interface ScanResult {
  changes: ChangeProposal[];
  conflicts: string[];
  summary: {
    totalFiles: number;
    violations: number;
    conflicts: number;
  };
}

class CleanCodeScanner {
  private rootDir: string;
  private excludeDirs = [
    'node_modules',
    '.next',
    '.git',
    'uploads',
    'prisma/migrations',
    'reports',
  ];
  private stableNames = new Set([
    'AppShell.tsx',
    'DashboardView.tsx',
    'ScreenComponents.tsx',
    'test-execution.schema.ts',
    'evidence-upload.schema.ts',
    'storage-manager.ts',
    'file-hash-manager.ts',
    'antivirus-scanner.ts',
    'ocr-service.ts',
    's3-presigned-service.ts',
    'evidence-processing-service.ts',
  ]);

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async scan(): Promise<ScanResult> {
    console.log('🔍 Scanning for naming violations...');

    const changes: ChangeProposal[] = [];
    const conflicts: string[] = [];
    const allFiles = this.getAllFiles(this.rootDir);

    console.log(`Found ${allFiles.length} files to analyze`);

    for (const file of allFiles) {
      const relativePath = path.relative(this.rootDir, file);
      const fileName = path.basename(file);

      // Skip stable names unless there's a clear violation
      if (this.stableNames.has(fileName)) {
        continue;
      }

      const violation = this.detectNamingViolation(file, relativePath);
      if (violation) {
        const importers = await this.findImporters(file);
        changes.push({ ...violation, importers });
      }
    }

    // Check for conflicts
    for (const change of changes) {
      if (fs.existsSync(path.join(this.rootDir, change.newPath))) {
        conflicts.push(`${change.oldPath} → ${change.newPath}`);
        // Add -v2 suffix for temporary resolution
        change.newPath = this.addVersionSuffix(change.newPath);
      }
    }

    const result: ScanResult = {
      changes,
      conflicts,
      summary: {
        totalFiles: allFiles.length,
        violations: changes.length,
        conflicts: conflicts.length,
      },
    };

    await this.saveResults(result);
    this.printSummary(result);

    return result;
  }

  private getAllFiles(dir: string, files: string[] = []): string[] {
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!this.excludeDirs.includes(entry)) {
          this.getAllFiles(fullPath, files);
        }
      } else if (this.isRelevantFile(fullPath)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private isRelevantFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }

  private detectNamingViolation(
    filePath: string,
    relativePath: string,
  ): Omit<ChangeProposal, 'importers'> | null {
    const fileName = path.basename(filePath);
    const dirName = path.dirname(relativePath);
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);

    // React Components should be PascalCase
    if (ext === '.tsx' && this.isComponent(filePath)) {
      if (!this.isPascalCase(baseName)) {
        return {
          oldPath: relativePath,
          newPath: path.join(dirName, this.toPascalCase(baseName) + ext),
          reason: 'React component should be PascalCase',
          severity: 'high',
          type: 'file',
        };
      }
    }

    // Hooks and utilities should be camelCase
    if (ext === '.ts' && (baseName.startsWith('use') || this.isUtility(filePath))) {
      if (!this.isCamelCase(baseName) && !this.isKebabCase(baseName)) {
        return {
          oldPath: relativePath,
          newPath: path.join(dirName, this.toCamelCase(baseName) + ext),
          reason: 'Hook/utility should be camelCase',
          severity: 'medium',
          type: 'file',
        };
      }
    }

    // Schemas and forms should have descriptive names with suffixes
    if (this.isSchema(filePath) || this.isForm(filePath)) {
      if (!baseName.includes('.') && !baseName.includes('-')) {
        const newName = this.suggestDescriptiveName(baseName, filePath);
        if (newName !== baseName) {
          return {
            oldPath: relativePath,
            newPath: path.join(dirName, newName + ext),
            reason: 'Schema/form should have descriptive name with suffix',
            severity: 'medium',
            type: 'file',
          };
        }
      }
    }

    // Directories should be kebab-case
    const dirParts = relativePath.split(path.sep);
    for (let i = 0; i < dirParts.length - 1; i++) {
      const part = dirParts[i];
      if (!this.isKebabCase(part) && !this.isSpecialDir(part)) {
        const newPart = this.toKebabCase(part);
        const newPath = [...dirParts];
        newPath[i] = newPart;
        return {
          oldPath: relativePath,
          newPath: newPath.join(path.sep),
          reason: 'Directory should be kebab-case',
          severity: 'low',
          type: 'directory',
        };
      }
    }

    return null;
  }

  private async findImporters(filePath: string): Promise<string[]> {
    const importers: string[] = [];
    const relativePath = path.relative(this.rootDir, filePath);
    const allFiles = this.getAllFiles(this.rootDir);

    for (const file of allFiles) {
      if (file === filePath) continue;

      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(relativePath, path.extname(relativePath));

        // Check for imports
        if (content.includes(fileName) || content.includes(relativePath)) {
          importers.push(path.relative(this.rootDir, file));
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return importers;
  }

  private isComponent(filePath: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return (
        /export\s+default\s+function|export\s+function|const\s+\w+\s*=.*=>/m.test(content) &&
        /import.*react/i.test(content)
      );
    } catch {
      return false;
    }
  }

  private isUtility(filePath: string): boolean {
    const fileName = path.basename(filePath);
    return (
      fileName.includes('util') ||
      fileName.includes('helper') ||
      fileName.includes('service') ||
      fileName.includes('manager')
    );
  }

  private isSchema(filePath: string): boolean {
    return filePath.includes('schema') || filePath.includes('validation');
  }

  private isForm(filePath: string): boolean {
    return filePath.includes('form') || filePath.includes('input');
  }

  private isSpecialDir(dirName: string): boolean {
    return ['app', 'api', 'components', 'lib', 'features', 'types', 'styles', '(app)'].includes(
      dirName,
    );
  }

  private isPascalCase(str: string): boolean {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }

  private isCamelCase(str: string): boolean {
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
  }

  private isKebabCase(str: string): boolean {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^./, char => char.toUpperCase());
  }

  private toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^./, char => char.toLowerCase());
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  private suggestDescriptiveName(baseName: string, filePath: string): string {
    // Extract context from path and suggest descriptive names
    const pathParts = filePath.split(path.sep);

    if (baseName.includes('schema')) return baseName;
    if (baseName.includes('form')) return baseName;

    // Try to infer from path context
    if (pathParts.includes('evidence')) {
      return `evidence-${baseName}.schema`;
    }
    if (pathParts.includes('fieldwork')) {
      return `fieldwork-${baseName}.schema`;
    }
    if (pathParts.includes('pbc')) {
      return `pbc-${baseName}.schema`;
    }

    return baseName;
  }

  private addVersionSuffix(filePath: string): string {
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const dirName = path.dirname(filePath);
    return path.join(dirName, `${baseName}-v2${ext}`);
  }

  private async saveResults(result: ScanResult): Promise<void> {
    const outputPath = path.join(this.rootDir, 'reports', 'clean_code_changes.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`📄 Results saved to: ${outputPath}`);
  }

  private printSummary(result: ScanResult): void {
    console.log('\n📊 SCAN SUMMARY');
    console.log('================');
    console.log(`Total files scanned: ${result.summary.totalFiles}`);
    console.log(`Naming violations found: ${result.summary.violations}`);
    console.log(`Name conflicts detected: ${result.summary.conflicts}`);

    if (result.changes.length > 0) {
      console.log('\n🔧 PROPOSED CHANGES:');
      result.changes.forEach((change, i) => {
        console.log(`${i + 1}. ${change.oldPath} → ${change.newPath}`);
        console.log(`   Reason: ${change.reason} (${change.severity})`);
        console.log(`   Importers: ${change.importers.length}`);
      });
    }

    if (result.conflicts.length > 0) {
      console.log('\n⚠️  CONFLICTS:');
      result.conflicts.forEach(conflict => {
        console.log(`   ${conflict}`);
      });
    }
  }
}

// Main execution
async function main() {
  const rootDir = process.cwd();
  const scanner = new CleanCodeScanner(rootDir);

  try {
    await scanner.scan();
    console.log('\n✅ Scan completed successfully!');
  } catch (error) {
    console.error('❌ Scan failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { type ChangeProposal, CleanCodeScanner, type ScanResult };
