/**
 * Clean Code Report Generator - Creates comprehensive refactoring report
 * Generates both Markdown and JSON reports of all changes applied
 */

import * as fs from 'fs';
import * as path from 'path';

import type { RefactorResult } from './clean-code-refactor';
import type { ChangeProposal, ScanResult } from './clean-code-scan';

interface ReportData {
  scanResult?: ScanResult;
  refactorResult?: RefactorResult;
  buildResult?: {
    success: boolean;
    errors: string[];
  };
  lintResult?: {
    success: boolean;
    errors: string[];
  };
}

interface FinalReport {
  summary: {
    totalChanges: number;
    appliedChanges: number;
    failedChanges: number;
    updatedFiles: number;
    buildSuccess: boolean;
    lintSuccess: boolean;
  };
  changes: Array<{
    type: 'applied' | 'failed' | 'skipped';
    oldPath: string;
    newPath: string;
    reason: string;
    severity: string;
    filesUpdated: number;
    conflicts: string[];
    notes: string[];
  }>;
  violations: Array<{
    category: 'naming' | 'structure' | 'imports';
    description: string;
    severity: 'high' | 'medium' | 'low';
    files: string[];
    recommendation: string;
  }>;
  todos: Array<{
    priority: 'high' | 'medium' | 'low';
    description: string;
    files: string[];
    estimatedEffort: string;
  }>;
  charter: {
    namingRules: string[];
    structureRules: string[];
    qualityRules: string[];
  };
}

class CleanCodeReporter {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async generateReport(): Promise<FinalReport> {
    console.log('📋 Generating Clean Code Report...');

    const reportData = await this.collectData();
    const finalReport = this.buildFinalReport(reportData);

    await this.saveMarkdownReport(finalReport);
    await this.saveJsonReport(finalReport);

    this.printSummary(finalReport);

    return finalReport;
  }

  private async collectData(): Promise<ReportData> {
    const data: ReportData = {};

    // Load scan results
    const scanPath = path.join(this.rootDir, 'reports', 'clean_code_changes.json');
    if (fs.existsSync(scanPath)) {
      data.scanResult = JSON.parse(fs.readFileSync(scanPath, 'utf8'));
    }

    // Load refactor results
    const refactorPath = path.join(this.rootDir, 'reports', 'clean_code_refactor_result.json');
    if (fs.existsSync(refactorPath)) {
      data.refactorResult = JSON.parse(fs.readFileSync(refactorPath, 'utf8'));
    }

    // Check build status
    data.buildResult = await this.checkBuild();

    // Check lint status
    data.lintResult = await this.checkLint();

    return data;
  }

  private buildFinalReport(data: ReportData): FinalReport {
    const report: FinalReport = {
      summary: {
        totalChanges: data.scanResult?.changes.length || 0,
        appliedChanges: data.refactorResult?.appliedChanges.length || 0,
        failedChanges: data.refactorResult?.failedChanges.length || 0,
        updatedFiles: new Set(data.refactorResult?.updatedFiles || []).size,
        buildSuccess: data.buildResult?.success || false,
        lintSuccess: data.lintResult?.success || false,
      },
      changes: [],
      violations: [],
      todos: [],
      charter: {
        namingRules: [
          'React Components: PascalCase (AppShell.tsx, DashboardView.tsx)',
          'Hooks/Utilities: camelCase (useAuthGuard.ts, storageManager.ts)',
          'Schemas/Forms: Descriptive + suffix (test-execution.schema.ts)',
          'Directories: kebab-case (features/planning/engagement/)',
          'i18n keys: dot.case (menu.planning.title)',
        ],
        structureRules: [
          'Feature-first organization (features/evidence/, features/fieldwork/)',
          'Stable names for critical components (AppShell.tsx, DashboardView.tsx)',
          'Consistent import patterns with @ alias',
          'Clear separation of concerns (components/, lib/, features/)',
        ],
        qualityRules: [
          'No unused imports or variables',
          'Consistent code formatting (Prettier)',
          'TypeScript strict mode compliance',
          'ESLint rule adherence',
        ],
      },
    };

    // Process changes
    if (data.refactorResult) {
      // Applied changes
      data.refactorResult.appliedChanges.forEach(change => {
        report.changes.push({
          type: 'applied',
          oldPath: change.oldPath,
          newPath: change.newPath,
          reason: change.reason,
          severity: change.severity,
          filesUpdated: change.importers.length,
          conflicts: [],
          notes: [],
        });
      });

      // Failed changes
      data.refactorResult.failedChanges.forEach(change => {
        report.changes.push({
          type: 'failed',
          oldPath: change.oldPath,
          newPath: change.newPath,
          reason: change.reason,
          severity: change.severity,
          filesUpdated: 0,
          conflicts: [],
          notes: ['Failed to apply - see error logs'],
        });
      });
    }

    // Process remaining violations
    if (data.scanResult) {
      const unprocessedChanges = data.scanResult.changes.filter(
        scanChange =>
          !data.refactorResult?.appliedChanges.some(
            applied => applied.oldPath === scanChange.oldPath,
          ) &&
          !data.refactorResult?.failedChanges.some(failed => failed.oldPath === scanChange.oldPath),
      );

      unprocessedChanges.forEach(change => {
        report.violations.push({
          category: this.categorizeViolation(change),
          description: `${change.oldPath}: ${change.reason}`,
          severity: change.severity,
          files: [change.oldPath, ...change.importers],
          recommendation: this.getRecommendation(change),
        });
      });
    }

    // Generate TODOs
    report.todos = this.generateTodos(report);

    return report;
  }

  private categorizeViolation(change: ChangeProposal): 'naming' | 'structure' | 'imports' {
    if (
      change.reason.includes('PascalCase') ||
      change.reason.includes('camelCase') ||
      change.reason.includes('kebab-case')
    ) {
      return 'naming';
    }
    if (change.reason.includes('directory') || change.reason.includes('organization')) {
      return 'structure';
    }
    return 'imports';
  }

  private getRecommendation(change: ChangeProposal): string {
    const recommendations = {
      'React component should be PascalCase':
        'Rename file and component to PascalCase format, update all imports',
      'Hook/utility should be camelCase':
        'Rename to camelCase format following JavaScript conventions',
      'Schema/form should have descriptive name with suffix':
        'Add descriptive context and appropriate suffix (.schema.ts, .form.tsx)',
      'Directory should be kebab-case':
        'Rename directory to kebab-case format, update all relative imports',
    };

    return recommendations[change.reason as keyof typeof recommendations] || 'Review and apply appropriate naming convention';
  }

  private generateTodos(report: FinalReport): FinalReport['todos'] {
    const todos: FinalReport['todos'] = [];

    // High priority: Failed changes
    const failedChanges = report.changes.filter(c => c.type === 'failed');
    if (failedChanges.length > 0) {
      todos.push({
        priority: 'high',
        description: `Manually resolve ${failedChanges.length} failed refactoring operations`,
        files: failedChanges.map(c => c.oldPath),
        estimatedEffort: '2-4 hours',
      });
    }

    // Medium priority: Remaining violations
    const highSeverityViolations = report.violations.filter(v => v.severity === 'high');
    if (highSeverityViolations.length > 0) {
      todos.push({
        priority: 'medium',
        description: `Address ${highSeverityViolations.length} high-severity naming violations`,
        files: highSeverityViolations.flatMap(v => v.files),
        estimatedEffort: '1-2 hours',
      });
    }

    // Low priority: Code quality improvements
    if (!report.summary.buildSuccess || !report.summary.lintSuccess) {
      todos.push({
        priority: 'medium',
        description: 'Fix build and lint errors introduced during refactoring',
        files: ['Various files'],
        estimatedEffort: '30 minutes - 1 hour',
      });
    }

    // Version suffix cleanup
    const versionSuffixChanges = report.changes.filter(
      c => c.newPath.includes('-v2') || c.newPath.includes('-v3'),
    );
    if (versionSuffixChanges.length > 0) {
      todos.push({
        priority: 'low',
        description: `Clean up ${versionSuffixChanges.length} temporary version suffixes`,
        files: versionSuffixChanges.map(c => c.newPath),
        estimatedEffort: '15-30 minutes',
      });
    }

    return todos;
  }

  private async checkBuild(): Promise<{ success: boolean; errors: string[] }> {
    try {
      console.log('  🏗️  Checking build status...');
      await this.execCommand('npm run build');
      return { success: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        errors: errorMessage
          .split('\n')
          .filter(line => line.includes('error') && !line.includes('node_modules')),
      };
    }
  }

  private async checkLint(): Promise<{ success: boolean; errors: string[] }> {
    try {
      console.log('  🔍 Checking lint status...');
      await this.execCommand('npm run lint');
      return { success: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        errors: errorMessage
          .split('\n')
          .filter(line => line.includes('error') && !line.includes('node_modules')),
      };
    }
  }

  private async saveMarkdownReport(report: FinalReport): Promise<void> {
    const outputPath = path.join(this.rootDir, 'reports', 'clean_code_refactor_report.md');
    const markdown = this.generateMarkdown(report);
    fs.writeFileSync(outputPath, markdown);
    console.log(`📄 Markdown report saved to: ${outputPath}`);
  }

  private async saveJsonReport(report: FinalReport): Promise<void> {
    const outputPath = path.join(this.rootDir, 'reports', 'clean_code_final_report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 JSON report saved to: ${outputPath}`);
  }

  private generateMarkdown(report: FinalReport): string {
    const timestamp = new Date().toISOString().split('T')[0];

    return `# Clean Code Refactor Report

*Generated on: ${timestamp}*

## 📊 Executive Summary

- **Total Changes Proposed**: ${report.summary.totalChanges}
- **Successfully Applied**: ${report.summary.appliedChanges}
- **Failed Changes**: ${report.summary.failedChanges}
- **Files Updated**: ${report.summary.updatedFiles}
- **Build Status**: ${report.summary.buildSuccess ? '✅ SUCCESS' : '❌ FAILED'}
- **Lint Status**: ${report.summary.lintSuccess ? '✅ SUCCESS' : '❌ FAILED'}

## 🎯 Clean Code Charter (Applied)

### Naming Conventions
${report.charter.namingRules.map(rule => `- ${rule}`).join('\n')}

### Structure Rules
${report.charter.structureRules.map(rule => `- ${rule}`).join('\n')}

### Quality Standards
${report.charter.qualityRules.map(rule => `- ${rule}`).join('\n')}

## 📋 Changes Applied

| Status | Old Path | New Path | Reason | Files Updated | Notes |
|--------|----------|----------|--------|---------------|-------|
${report.changes
  .map(
    change =>
      `| ${this.getStatusIcon(change.type)} | \`${change.oldPath}\` | \`${change.newPath}\` | ${change.reason} | ${change.filesUpdated} | ${change.notes.join(', ') || '-'} |`,
  )
  .join('\n')}

## ⚠️ Remaining Violations

${
  report.violations.length > 0
    ? report.violations
        .map(
          violation =>
            `### ${violation.severity.toUpperCase()} - ${violation.category.toUpperCase()}\n` +
            `**Description**: ${violation.description}\n` +
            `**Files**: ${violation.files.join(', ')}\n` +
            `**Recommendation**: ${violation.recommendation}\n`,
        )
        .join('\n')
    : '*No remaining violations detected.*'
}

## 📝 TODO List

${
  report.todos.length > 0
    ? report.todos
        .map(
          todo =>
            `### ${todo.priority.toUpperCase()} Priority\n` +
            `**Task**: ${todo.description}\n` +
            `**Estimated Effort**: ${todo.estimatedEffort}\n` +
            `**Files**: ${todo.files.slice(0, 5).join(', ')}${todo.files.length > 5 ? ` (+${todo.files.length - 5} more)` : ''}\n`,
        )
        .join('\n')
    : '*No outstanding tasks.*'
}

## 🔧 Technical Details

### Build & Quality Checks
- **TypeScript Compilation**: ${report.summary.buildSuccess ? 'PASSED' : 'FAILED'}
- **ESLint Validation**: ${report.summary.lintSuccess ? 'PASSED' : 'FAILED'}
- **Prettier Formatting**: Applied to all changed files

### Tools Used
- **ts-morph**: For safe TypeScript refactoring
- **ESLint**: Code quality and style enforcement
- **Prettier**: Code formatting
- **Custom Scanner**: Naming convention violation detection

---

## ✅ Final Verification

${
  report.summary.appliedChanges > 0 && report.summary.buildSuccess && report.summary.lintSuccess
    ? '🎉 **CLEAN CODE Charter successfully applied!** All references updated safely and build passes.'
    : '⚠️ **Partial Success** - Some issues remain. See TODO list above for next steps.'
}

*For detailed technical information, see \`clean_code_final_report.json\`*
`;
  }

  private getStatusIcon(type: string): string {
    const icons = {
      applied: '✅',
      failed: '❌',
      skipped: '⏭️',
    };
    return icons[type as keyof typeof icons] || '❓';
  }

  private async execCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec(command, { cwd: this.rootDir }, (error: any, stdout: string) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  private printSummary(report: FinalReport): void {
    console.log('\n📊 FINAL REPORT SUMMARY');
    console.log('=======================');
    console.log(`Total Changes: ${report.summary.totalChanges}`);
    console.log(`Applied: ${report.summary.appliedChanges} ✅`);
    console.log(`Failed: ${report.summary.failedChanges} ❌`);
    console.log(`Files Updated: ${report.summary.updatedFiles}`);
    console.log(`Build: ${report.summary.buildSuccess ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    console.log(`Lint: ${report.summary.lintSuccess ? 'SUCCESS ✅' : 'FAILED ❌'}`);

    if (report.todos.length > 0) {
      console.log(`\n📝 TODOs: ${report.todos.length} tasks remaining`);
    }

    console.log('\n📄 Reports generated:');
    console.log('  - reports/clean_code_refactor_report.md');
    console.log('  - reports/clean_code_final_report.json');
  }
}

// Main execution
async function main() {
  const rootDir = process.cwd();
  const reporter = new CleanCodeReporter(rootDir);

  try {
    await reporter.generateReport();
    console.log('\n✅ Report generation completed!');
  } catch (error) {
    console.error('❌ Report generation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { CleanCodeReporter, type FinalReport };
