const fs = require('fs').promises;
const path = require('path');

class SelfUpgradeEngine {
  constructor(opts = {}) {
    this.root = opts.root || path.resolve(process.cwd());
  }

  async scanProjectStructure(depth = 2) {
    const files = [];
    const walk = async (dir, level) => {
      if (level < 0) return;
      let entries = [];
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch (e) {
        return;
      }
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (['node_modules', '.git', 'build'].includes(e.name)) continue;
          await walk(p, level - 1);
        } else {
          if (/\.(js|jsx|ts|json|md|py|java)$/.test(e.name)) {
            try {
              const stat = await fs.stat(p);
              let content = '';
              if (stat.size < 20000) {
                try { content = await fs.readFile(p, 'utf8'); } catch (e) { content = ''; }
              }
              files.push({ path: path.relative(this.root, p), size: stat.size, content });
            } catch (e) {
              // ignore unreadable file
            }
          }
        }
      }
    };
    await walk(this.root, depth);
    return files;
  }

  async suggestUpgradePlan() {
    const files = await this.scanProjectStructure(2);
    const issues = files.filter(f => /TODO|FIXME|HACK/i.test(f.content || ''));
    const smallFiles = files.filter(f => f.size < 500 && /\.js$/.test(f.path));
    const suggestions = [];
    if (issues.length) suggestions.push({ type: 'code-comments', count: issues.length, files: issues.map(f => f.path).slice(0, 10), suggestion: 'Review TODO/FIXME comments and add tasks or tests.' });
    if (smallFiles.length) suggestions.push({ type: 'small-files', count: smallFiles.length, files: smallFiles.map(f => f.path).slice(0, 10), suggestion: 'Consider consolidating tiny modules or adding unit tests.' });
    suggestions.push({ type: 'general', suggestion: 'Run static analysis (ESLint), add unit tests, and create backups before changes.' });
    return { suggestions, scannedFilesCount: files.length };
  }
}

module.exports = SelfUpgradeEngine;
