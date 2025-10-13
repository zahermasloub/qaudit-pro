/**
 * Clean Code Refactor - Safe renaming with ts-morph and reference updates
 * Implements automatic renaming and import path updates
 */

import * as fs from 'fs';
import * as path from 'path';
import type { SourceFile } from 'ts-morph';
import { Node, Project } from 'ts-morph';

import type { ChangeProposal, ScanResult } from './clean-code-scan';

interface RefactorResult {
  appliedChanges: ChangeProposal[];
  failedChanges: ChangeProposal[];
  updatedFiles: string[];
  errors: string[];
}

class CleanCodeRefactor {
  private rootDir: string;
  private project: Project;
  private excludeDirs = [
    'node_modules',
    '.next',
    '.git',
    'uploads',
    'prisma/migrations',
    'reports',
  ];

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.project = new Project({
      tsConfigFilePath: path.join(rootDir, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: false,
    });
  }

  async refactor(): Promise<RefactorResult> {
    console.log('🔧 Starting Clean Code Refactoring...');

    const result: RefactorResult = {
      appliedChanges: [],
      failedChanges: [],
      updatedFiles: [],
      errors: [],
    };

    // Load change proposals
    const changesPath = path.join(this.rootDir, 'reports', 'clean_code_changes.json');
    let scanResult: ScanResult;

    if (fs.existsSync(changesPath)) {
      scanResult = JSON.parse(fs.readFileSync(changesPath, 'utf8'));
    } else {
      console.log('📄 No changes file found, running scan first...');
      const { CleanCodeScanner } = await import('./clean-code-scan');
      const scanner = new CleanCodeScanner(this.rootDir);
      scanResult = await scanner.scan();
    }

    console.log(`Found ${scanResult.changes.length} changes to apply`);

    // Process changes in batches
    const batches = this.createBatches(scanResult.changes);

    for (let i = 0; i < batches.length; i++) {
      console.log(`\n🔄 Processing batch ${i + 1}/${batches.length}...`);

      for (const change of batches[i]) {
        try {
          await this.applyChange(change, result);
        } catch (error) {
          result.errors.push(`Failed to apply change ${change.oldPath}: ${error}`);
          result.failedChanges.push(change);
        }
      }

      // Run linting and type check after each batch
      await this.runLintAndFormat(result);
      const typeErrors = await this.checkTypes();

      if (typeErrors.length > 0) {
        console.log(`⚠️  Type errors detected after batch ${i + 1}:`);
        typeErrors.slice(0, 5).forEach(error => console.log(`   ${error}`));

        // Try to auto-fix some common issues
        await this.fixCommonIssues(result);
      }
    }

    await this.saveResults(result);
    this.printSummary(result);

    return result;
  }

  private createBatches(changes: ChangeProposal[]): ChangeProposal[][] {
    // Group changes by type and dependency
    const directoryChanges = changes.filter(c => c.type === 'directory');
    const fileChanges = changes.filter(c => c.type === 'file');

    // Sort by severity and number of importers (fewer importers first)
    fileChanges.sort((a, b) => {
      const severityOrder = { low: 0, medium: 1, high: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return a.importers.length - b.importers.length;
    });

    // Create batches of maximum 5 changes each
    const batches: ChangeProposal[][] = [];
    const batchSize = 5;

    // Process directories first
    if (directoryChanges.length > 0) {
      batches.push(directoryChanges);
    }

    // Then process files in batches
    for (let i = 0; i < fileChanges.length; i += batchSize) {
      batches.push(fileChanges.slice(i, i + batchSize));
    }

    return batches;
  }

  private async applyChange(change: ChangeProposal, result: RefactorResult): Promise<void> {
    console.log(`  📝 ${change.oldPath} → ${change.newPath}`);

    const oldFullPath = path.join(this.rootDir, change.oldPath);
    const newFullPath = path.join(this.rootDir, change.newPath);

    // Check if old path exists
    if (!fs.existsSync(oldFullPath)) {
      throw new Error(`Source path does not exist: ${oldFullPath}`);
    }

    // Ensure target directory exists
    const newDir = path.dirname(newFullPath);
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }

    // Handle conflicts
    if (fs.existsSync(newFullPath)) {
      const conflictPath = this.resolveConflict(newFullPath);
      console.log(`    ⚠️  Conflict resolved: ${conflictPath}`);
      change.newPath = path.relative(this.rootDir, conflictPath);
    }

    // Update all references before renaming
    await this.updateReferences(change);

    // Perform the rename
    if (change.type === 'directory') {
      fs.renameSync(oldFullPath, path.join(this.rootDir, change.newPath));
    } else {
      fs.renameSync(oldFullPath, path.join(this.rootDir, change.newPath));
    }

    result.appliedChanges.push(change);

    // Track all files that might need updates
    result.updatedFiles.push(change.newPath);
    result.updatedFiles.push(...change.importers);
  }

  private async updateReferences(change: ChangeProposal): Promise<void> {
    const oldPath = change.oldPath;
    const newPath = change.newPath;

    // Update imports in all files
    const allSourceFiles = this.project.getSourceFiles();

    for (const sourceFile of allSourceFiles) {
      let hasChanges = false;

      // Update import declarations
      const importDeclarations = sourceFile.getImportDeclarations();
      for (const importDecl of importDeclarations) {
        const moduleSpecifier = importDecl.getModuleSpecifier();
        const importPath = moduleSpecifier.getLiteralValue();

        if (this.shouldUpdateImportPath(importPath, oldPath)) {
          const newImportPath = this.calculateNewImportPath(
            sourceFile.getFilePath(),
            oldPath,
            newPath,
            importPath,
          );

          moduleSpecifier.setLiteralValue(newImportPath);
          hasChanges = true;
        }
      }

      // Update dynamic imports
      sourceFile.forEachDescendant(node => {
        if (Node.isCallExpression(node)) {
          const expression = node.getExpression();
          if (Node.isIdentifier(expression) && expression.getText() === 'import') {
            const args = node.getArguments();
            if (args.length > 0 && Node.isStringLiteral(args[0])) {
              const importPath = args[0].getLiteralValue();
              if (this.shouldUpdateImportPath(importPath, oldPath)) {
                const newImportPath = this.calculateNewImportPath(
                  sourceFile.getFilePath(),
                  oldPath,
                  newPath,
                  importPath,
                );
                args[0].setLiteralValue(newImportPath);
                hasChanges = true;
              }
            }
          }
        }
      });

      // Update comments that reference files
      const fullText = sourceFile.getFullText();
      const updatedText = this.updateCommentsAndStrings(fullText, oldPath, newPath);
      if (fullText !== updatedText) {
        sourceFile.replaceWithText(updatedText);
        hasChanges = true;
      }

      if (hasChanges) {
        await sourceFile.save();
      }
    }
  }

  private shouldUpdateImportPath(importPath: string, oldPath: string): boolean {
    const oldBaseName = path.basename(oldPath, path.extname(oldPath));
    const oldDirName = path.dirname(oldPath);

    return (
      importPath.includes(oldBaseName) ||
      importPath.includes(oldPath) ||
      importPath.includes(oldDirName)
    );
  }

  private calculateNewImportPath(
    sourceFilePath: string,
    oldPath: string,
    newPath: string,
    currentImportPath: string,
  ): string {
    // If it's already using @ alias, update it accordingly
    if (currentImportPath.startsWith('@/')) {
      return currentImportPath.replace(oldPath, newPath);
    }

    // Calculate relative path from source to new target
    const sourceDir = path.dirname(path.relative(this.rootDir, sourceFilePath));
    const targetPath = path.relative(this.rootDir, newPath);
    const relativePath = path.relative(sourceDir, targetPath);

    // Convert Windows paths to forward slashes
    let normalizedPath = relativePath.replace(/\\\\/g, '/');

    // Ensure relative path starts with ./ or ../
    if (!normalizedPath.startsWith('.')) {
      normalizedPath = './' + normalizedPath;
    }

    // Remove .ts/.tsx extension for imports
    normalizedPath = normalizedPath.replace(/\\.(ts|tsx)$/, '');

    return normalizedPath;
  }

  private updateCommentsAndStrings(content: string, oldPath: string, newPath: string): string {
    // Update file path references in comments
    const oldFileName = path.basename(oldPath);
    const newFileName = path.basename(newPath);

    let updated = content;

    // Update comments that reference the old file name
    updated = updated.replace(new RegExp(`/\\*\\*[^*]*\\*+(?:[^/*][^*]*\\*+)*/`, 'g'), match =>
      match.replace(new RegExp(oldFileName, 'g'), newFileName),
    );

    // Update single line comments
    updated = updated.replace(new RegExp(`//.*${oldFileName}.*$`, 'gm'), match =>
      match.replace(new RegExp(oldFileName, 'g'), newFileName),
    );

    return updated;
  }

  private resolveConflict(conflictPath: string): string {
    const ext = path.extname(conflictPath);
    const baseName = path.basename(conflictPath, ext);
    const dirName = path.dirname(conflictPath);

    let version = 2;
    let newPath: string;

    do {
      newPath = path.join(dirName, `${baseName}-v${version}${ext}`);
      version++;
    } while (fs.existsSync(newPath));

    return newPath;
  }

  private async runLintAndFormat(result: RefactorResult): Promise<void> {
    try {
      console.log('    🔍 Running ESLint fix...');
      await this.execCommand('npm run fix');
    } catch (error) {
      result.errors.push(`Lint/format failed: ${error}`);
    }
  }

  private async checkTypes(): Promise<string[]> {
    try {
      console.log('    🔎 Checking TypeScript...');
      const output = await this.execCommand('npx tsc --noEmit --skipLibCheck');
      return [];
    } catch (error) {
      const errorOutput = String(error);
      return errorOutput
        .split('\\n')
        .filter((line: string) => line.includes('error TS') && !line.includes('node_modules'));
    }
  }

  private async fixCommonIssues(result: RefactorResult): Promise<void> {
    // Try to fix common import issues automatically
    console.log('    🔧 Attempting to fix common import issues...');

    const sourceFiles = this.project.getSourceFiles();

    for (const sourceFile of sourceFiles) {
      let hasChanges = false;

      // Fix missing imports
      const diagnostics = sourceFile.getPreEmitDiagnostics();
      for (const diagnostic of diagnostics) {
        const message = diagnostic.getMessageText();
        if (typeof message === 'string' && message.includes('Cannot find module')) {
          // Try to auto-fix common missing imports
          hasChanges = (await this.autoFixMissingImport(sourceFile, message)) || hasChanges;
        }
      }

      if (hasChanges) {
        await sourceFile.save();
      }
    }
  }

  private async autoFixMissingImport(
    sourceFile: SourceFile,
    errorMessage: string,
  ): Promise<boolean> {
    // Extract module name from error message
    const moduleMatch = errorMessage.match(/'([^']+)'/);
    if (!moduleMatch) return false;

    const moduleName = moduleMatch[1];

    // Try to find the correct path using @ alias
    if (
      !moduleName.startsWith('@/') &&
      !moduleName.startsWith('./') &&
      !moduleName.startsWith('../')
    ) {
      const possiblePath = `@/${moduleName}`;
      const fullPath = path.join(this.rootDir, moduleName);

      if (fs.existsSync(fullPath + '.ts') || fs.existsSync(fullPath + '.tsx')) {
        // Update the import to use @ alias
        const importDecls = sourceFile.getImportDeclarations();
        for (const importDecl of importDecls) {
          if (importDecl.getModuleSpecifier().getLiteralValue() === moduleName) {
            importDecl.getModuleSpecifier().setLiteralValue(possiblePath);
            return true;
          }
        }
      }
    }

    return false;
  }

  private async execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(command, { cwd: this.rootDir }, (error: any, stdout: any, _stderr: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  private async saveResults(result: RefactorResult): Promise<void> {
    const outputPath = path.join(this.rootDir, 'reports', 'clean_code_refactor_result.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`📄 Refactor results saved to: ${outputPath}`);
  }

  private printSummary(result: RefactorResult): void {
    console.log('\\n📊 REFACTOR SUMMARY');
    console.log('===================');
    console.log(`Applied changes: ${result.appliedChanges.length}`);
    console.log(`Failed changes: ${result.failedChanges.length}`);
    console.log(`Updated files: ${Array.from(new Set(result.updatedFiles)).length}`);
    console.log(`Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\\n❌ ERRORS:');
      result.errors.slice(0, 10).forEach(error => {
        console.log(`   ${error}`);
      });
    }

    if (result.appliedChanges.length > 0) {
      console.log('\\n✅ APPLIED CHANGES:');
      result.appliedChanges.forEach((change, i) => {
        console.log(`${i + 1}. ${change.oldPath} → ${change.newPath}`);
      });
    }

    if (result.failedChanges.length > 0) {
      console.log('\\n❌ FAILED CHANGES:');
      result.failedChanges.forEach((change, i) => {
        console.log(`${i + 1}. ${change.oldPath} → ${change.newPath}`);
      });
    }
  }
}

// Main execution
async function main() {
  const rootDir = process.cwd();
  const refactor = new CleanCodeRefactor(rootDir);

  try {
    await refactor.refactor();
    console.log('\\n✅ Refactoring completed!');
  } catch (error) {
    console.error('❌ Refactoring failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { CleanCodeRefactor, type RefactorResult };
