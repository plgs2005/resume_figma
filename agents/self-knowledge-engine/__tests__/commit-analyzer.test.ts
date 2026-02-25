/**
 * SelfKnowledgeEngine — Unit Tests: Commit Analyzer (v3.0)
 */

import {
  CommitAnalyzer,
  EXTENSION_DOMAIN_MAP,
  DEPENDENCY_PATHS,
  SCAFFOLD_FILES,
  ASSET_EXTENSIONS,
} from '../src/commit-analyzer';
import type { CommitFileChange } from '../src/types';

describe('CommitAnalyzer', () => {
  let analyzer: CommitAnalyzer;

  beforeEach(() => {
    analyzer = new CommitAnalyzer('testuser');
  });

  // ─── File Classification ─────────────────────────────────────

  describe('classifyFile', () => {
    it('should classify TypeScript source as codigo-autoral', () => {
      const result = analyzer.classifyFile('src/services/auth.service.ts');
      expect(result.classificacao).toBe('codigo-autoral');
      expect(result.dominio).toBe('TypeScript');
      expect(result.is_dependency).toBe(false);
    });

    it('should classify React TSX as codigo-autoral with frontend domain', () => {
      const result = analyzer.classifyFile('src/components/Button.tsx');
      expect(result.classificacao).toBe('codigo-autoral');
      expect(result.dominio).toBe('React/TypeScript');
      expect(result.is_dependency).toBe(false);
    });

    it('should classify node_modules files as dependencia', () => {
      const result = analyzer.classifyFile('node_modules/react/index.js');
      expect(result.classificacao).toBe('dependencia');
      expect(result.is_dependency).toBe(true);
    });

    it('should classify vendor files as dependencia', () => {
      const result = analyzer.classifyFile('vendor/laravel/framework/src/Model.php');
      expect(result.classificacao).toBe('dependencia');
      expect(result.is_dependency).toBe(true);
    });

    it('should classify package-lock.json as scaffold', () => {
      const result = analyzer.classifyFile('package-lock.json');
      expect(result.classificacao).toBe('scaffold');
    });

    it('should classify tsconfig.json as scaffold', () => {
      const result = analyzer.classifyFile('tsconfig.json');
      expect(result.classificacao).toBe('scaffold');
    });

    it('should classify test files as teste', () => {
      const result = analyzer.classifyFile('src/__tests__/auth.test.ts');
      expect(result.classificacao).toBe('teste');
    });

    it('should classify .spec files as teste', () => {
      const result = analyzer.classifyFile('src/auth.spec.ts');
      expect(result.classificacao).toBe('teste');
    });

    it('should classify migration files as migracao', () => {
      const result = analyzer.classifyFile('database/migrations/001_create_users.sql');
      expect(result.classificacao).toBe('migracao');
    });

    it('should classify README as documentacao', () => {
      const result = analyzer.classifyFile('README.md');
      expect(result.classificacao).toBe('documentacao');
    });

    it('should classify image files as asset', () => {
      const result = analyzer.classifyFile('public/logo.png');
      expect(result.classificacao).toBe('asset');
    });

    it('should classify .svg as asset', () => {
      const result = analyzer.classifyFile('assets/icon.svg');
      expect(result.classificacao).toBe('asset');
    });

    it('should classify dist files as dependencia', () => {
      const result = analyzer.classifyFile('dist/bundle.js');
      expect(result.classificacao).toBe('dependencia');
      expect(result.is_dependency).toBe(true);
    });
  });

  // ─── Module Type Classification ──────────────────────────────

  describe('classifyFile — module type', () => {
    it('should classify domain/ as core', () => {
      const result = analyzer.classifyFile('src/domain/user.entity.ts');
      expect(result.modulo_tipo).toBe('core');
    });

    it('should classify services/ as core', () => {
      const result = analyzer.classifyFile('src/services/payment.service.ts');
      expect(result.modulo_tipo).toBe('core');
    });

    it('should classify middleware/ as core', () => {
      const result = analyzer.classifyFile('src/middleware/auth.middleware.ts');
      expect(result.modulo_tipo).toBe('core');
    });

    it('should classify auth/ as core', () => {
      const result = analyzer.classifyFile('src/auth/jwt.guard.ts');
      expect(result.modulo_tipo).toBe('core');
    });

    it('should classify infrastructure/ as core', () => {
      const result = analyzer.classifyFile('src/infrastructure/database.ts');
      expect(result.modulo_tipo).toBe('core');
    });

    it('should classify components/ as feature', () => {
      const result = analyzer.classifyFile('src/components/Header.tsx');
      expect(result.modulo_tipo).toBe('feature');
    });

    it('should classify pages/ as feature', () => {
      const result = analyzer.classifyFile('src/pages/Dashboard.tsx');
      expect(result.modulo_tipo).toBe('feature');
    });

    it('should classify __tests__/ as test', () => {
      const result = analyzer.classifyFile('src/__tests__/auth.test.ts');
      expect(result.modulo_tipo).toBe('test');
    });

    it('should classify tsconfig.json as config', () => {
      const result = analyzer.classifyFile('tsconfig.json');
      expect(result.modulo_tipo).toBe('config');
    });

    it('should classify README as docs', () => {
      const result = analyzer.classifyFile('README.md');
      expect(result.modulo_tipo).toBe('docs');
    });
  });

  // ─── Depth Level Calculation ─────────────────────────────────

  describe('calculateDepthLevel', () => {
    function makeCommitBase(overrides: Partial<{
      mensagem: string;
      arquivos_modificados: CommitFileChange[];
      linhas_adicionadas: number;
      linhas_removidas: number;
    }> = {}) {
      return {
        hash: 'abc123',
        autor: 'testuser',
        autor_email: 'test@test.com',
        data: '2025-01-01',
        mensagem: overrides.mensagem || 'fix: something',
        arquivos_modificados: overrides.arquivos_modificados || [
          analyzer.classifyFile('src/app.ts'),
        ],
        linhas_adicionadas: overrides.linhas_adicionadas ?? 10,
        linhas_removidas: overrides.linhas_removidas ?? 5,
        is_own_commit: true,
        dominios: [],
      };
    }

    it('should return depth 1 for superficial changes', () => {
      const commit = makeCommitBase({
        mensagem: 'chore: update readme',
        arquivos_modificados: [analyzer.classifyFile('README.md')],
        linhas_adicionadas: 2,
        linhas_removidas: 1,
      });
      expect(analyzer.calculateDepthLevel(commit)).toBe(1);
    });

    it('should return depth 2 for feature implementation', () => {
      const commit = makeCommitBase({
        mensagem: 'feat: add user profile component',
        arquivos_modificados: [analyzer.classifyFile('src/components/UserProfile.tsx')],
        linhas_adicionadas: 50,
        linhas_removidas: 0,
      });
      expect(analyzer.calculateDepthLevel(commit)).toBe(2);
    });

    it('should return depth 3 for refactoring', () => {
      const files = Array.from({ length: 12 }, (_, i) =>
        analyzer.classifyFile(`src/modules/module-${i}.ts`)
      );
      const commit = makeCommitBase({
        mensagem: 'refactor: restructure module system',
        arquivos_modificados: files,
        linhas_adicionadas: 300,
        linhas_removidas: 200,
      });
      expect(analyzer.calculateDepthLevel(commit)).toBeGreaterThanOrEqual(3);
    });

    it('should return depth 4 for auth/security changes', () => {
      const commit = makeCommitBase({
        mensagem: 'feat: implement JWT auth middleware',
        arquivos_modificados: [
          analyzer.classifyFile('src/middleware/auth.middleware.ts'),
          analyzer.classifyFile('src/__tests__/auth.test.ts'),
        ],
        linhas_adicionadas: 150,
        linhas_removidas: 20,
      });
      expect(analyzer.calculateDepthLevel(commit)).toBe(4);
    });

    it('should return depth 4 for database migration', () => {
      const commit = makeCommitBase({
        mensagem: 'feat: add database migration for user roles',
        arquivos_modificados: [
          analyzer.classifyFile('src/domain/user-role.entity.ts'),
          analyzer.classifyFile('src/__tests__/roles.test.ts'),
        ],
        linhas_adicionadas: 100,
        linhas_removidas: 10,
      });
      expect(analyzer.calculateDepthLevel(commit)).toBe(4);
    });

    it('should return depth 1 when only dependency files change', () => {
      const commit = makeCommitBase({
        mensagem: 'chore: update dependencies',
        arquivos_modificados: [
          analyzer.classifyFile('node_modules/something/index.js'),
          analyzer.classifyFile('package-lock.json'),
        ],
        linhas_adicionadas: 5000,
        linhas_removidas: 4000,
      });
      expect(analyzer.calculateDepthLevel(commit)).toBe(1);
    });
  });

  // ─── Architectural Weight ────────────────────────────────────

  describe('calculateArchitecturalWeight', () => {
    it('should return 0 for only dependency files', () => {
      const files = [analyzer.classifyFile('node_modules/react/index.js')];
      expect(analyzer.calculateArchitecturalWeight(files)).toBe(0);
    });

    it('should give higher weight for core module files', () => {
      const coreFiles = [
        analyzer.classifyFile('src/domain/user.entity.ts'),
        analyzer.classifyFile('src/services/auth.service.ts'),
      ];
      const featureFiles = [
        analyzer.classifyFile('src/components/Button.tsx'),
        analyzer.classifyFile('src/pages/Home.tsx'),
      ];

      const coreWeight = analyzer.calculateArchitecturalWeight(coreFiles);
      const featureWeight = analyzer.calculateArchitecturalWeight(featureFiles);

      expect(coreWeight).toBeGreaterThan(featureWeight);
    });

    it('should add weight for test files alongside core', () => {
      const withTests = [
        analyzer.classifyFile('src/services/auth.service.ts'),
        analyzer.classifyFile('src/__tests__/auth.test.ts'),
      ];
      const withoutTests = [
        analyzer.classifyFile('src/services/auth.service.ts'),
      ];

      expect(analyzer.calculateArchitecturalWeight(withTests))
        .toBeGreaterThan(analyzer.calculateArchitecturalWeight(withoutTests));
    });
  });

  // ─── Domain Extraction ───────────────────────────────────────

  describe('extractDomains', () => {
    it('should extract domains from authoral files only', () => {
      const files = [
        analyzer.classifyFile('src/services/auth.service.ts'),
        analyzer.classifyFile('src/components/Button.tsx'),
        analyzer.classifyFile('node_modules/react/index.js'),
      ];

      const domains = analyzer.extractDomains(files);

      expect(domains).toContain('TypeScript');
      expect(domains).toContain('React/TypeScript');
      // node_modules should not contribute domains
      expect(domains).not.toContain('JavaScript');
    });

    it('should not extract domains from scaffold files', () => {
      const files = [
        analyzer.classifyFile('tsconfig.json'),
        analyzer.classifyFile('package-lock.json'),
      ];

      const domains = analyzer.extractDomains(files);
      expect(domains).toEqual([]);
    });

    it('should not extract domains from asset files', () => {
      const files = [
        analyzer.classifyFile('public/logo.png'),
        analyzer.classifyFile('assets/icon.svg'),
      ];

      const domains = analyzer.extractDomains(files);
      expect(domains).toEqual([]);
    });
  });

  // ─── Extension Domain Map ────────────────────────────────────

  describe('EXTENSION_DOMAIN_MAP', () => {
    it('should map common frontend extensions', () => {
      expect(EXTENSION_DOMAIN_MAP['.tsx']?.categoria).toBe('frontend');
      expect(EXTENSION_DOMAIN_MAP['.jsx']?.categoria).toBe('frontend');
      expect(EXTENSION_DOMAIN_MAP['.vue']?.categoria).toBe('frontend');
      expect(EXTENSION_DOMAIN_MAP['.css']?.categoria).toBe('frontend');
    });

    it('should map common backend extensions', () => {
      expect(EXTENSION_DOMAIN_MAP['.php']?.categoria).toBe('backend');
      expect(EXTENSION_DOMAIN_MAP['.py']?.categoria).toBe('backend');
      expect(EXTENSION_DOMAIN_MAP['.go']?.categoria).toBe('backend');
      expect(EXTENSION_DOMAIN_MAP['.java']?.categoria).toBe('backend');
    });

    it('should map database extensions', () => {
      expect(EXTENSION_DOMAIN_MAP['.sql']?.categoria).toBe('banco-de-dados');
      expect(EXTENSION_DOMAIN_MAP['.prisma']?.categoria).toBe('banco-de-dados');
    });
  });

  // ─── Constants Validation ────────────────────────────────────

  describe('Constants', () => {
    it('should include common dependency paths', () => {
      expect(DEPENDENCY_PATHS).toContain('node_modules');
      expect(DEPENDENCY_PATHS).toContain('vendor');
      expect(DEPENDENCY_PATHS).toContain('dist');
      expect(DEPENDENCY_PATHS).toContain('build');
    });

    it('should include common scaffold files', () => {
      expect(SCAFFOLD_FILES).toContain('package-lock.json');
      expect(SCAFFOLD_FILES).toContain('tsconfig.json');
      expect(SCAFFOLD_FILES).toContain('.gitignore');
    });

    it('should include common asset extensions', () => {
      expect(ASSET_EXTENSIONS).toContain('.png');
      expect(ASSET_EXTENSIONS).toContain('.jpg');
      expect(ASSET_EXTENSIONS).toContain('.svg');
      expect(ASSET_EXTENSIONS).toContain('.pdf');
    });
  });
});
