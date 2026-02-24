/**
 * SelfKnowledgeEngine — Unit Tests: Utils
 */

import { generateEvidenceId, isProjectRoot, loadConfig } from '../src/utils';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('Utils', () => {
  describe('generateEvidenceId', () => {
    it('should generate deterministic hash', () => {
      const id1 = generateEvidenceId('/path/to/file', 'arquivo', 'desc');
      const id2 = generateEvidenceId('/path/to/file', 'arquivo', 'desc');
      expect(id1).toBe(id2);
    });

    it('should generate different hashes for different inputs', () => {
      const id1 = generateEvidenceId('/path/a', 'arquivo', 'desc');
      const id2 = generateEvidenceId('/path/b', 'arquivo', 'desc');
      expect(id1).not.toBe(id2);
    });

    it('should return 16-char hex string', () => {
      const id = generateEvidenceId('fonte', 'tipo', 'desc');
      expect(id).toMatch(/^[0-9a-f]{16}$/);
    });
  });

  describe('isProjectRoot', () => {
    const testDir = join(tmpdir(), 'ske-test-isproject-' + Date.now());

    beforeAll(() => {
      mkdirSync(testDir, { recursive: true });
    });

    afterAll(() => {
      rmSync(testDir, { recursive: true, force: true });
    });

    it('should return true for directory with package.json', () => {
      writeFileSync(join(testDir, 'package.json'), '{}');
      expect(isProjectRoot(testDir)).toBe(true);
    });

    it('should return false for empty directory', () => {
      const emptyDir = join(testDir, 'empty');
      mkdirSync(emptyDir, { recursive: true });
      expect(isProjectRoot(emptyDir)).toBe(false);
    });
  });

  describe('loadConfig', () => {
    it('should return default config when no config file exists', () => {
      const config = loadConfig('/nonexistent/path.json');
      expect(config.scan_paths).toBeDefined();
      expect(config.output_dir).toBeDefined();
      expect(config.file_extensions.length).toBeGreaterThan(0);
      expect(config.ignore_patterns.length).toBeGreaterThan(0);
      expect(config.max_depth).toBeGreaterThan(0);
    });

    it('should merge user config with defaults', () => {
      const testDir = join(tmpdir(), 'ske-test-config-' + Date.now());
      mkdirSync(testDir, { recursive: true });
      const configPath = join(testDir, 'config.json');
      writeFileSync(configPath, JSON.stringify({
        scan_paths: ['/custom/path'],
        github_username: 'testuser',
      }));

      const config = loadConfig(configPath);
      expect(config.scan_paths).toEqual(['/custom/path']);
      expect(config.github_username).toBe('testuser');
      expect(config.file_extensions.length).toBeGreaterThan(0); // Defaults preserved

      rmSync(testDir, { recursive: true, force: true });
    });
  });
});
