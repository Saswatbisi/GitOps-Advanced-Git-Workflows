import { GitopsAuditor } from '../src/gitopsAuditor';

describe('Orion LMS GitOps & Branch Strategies Auditor Tests', () => {
  let auditor: GitopsAuditor;

  beforeEach(() => {
    auditor = new GitopsAuditor();
  });

  describe('ArgoCD Application manifest audits', () => {
    test('should pass validation on compliant declarative deployment profiles', () => {
      const content = `
        apiVersion: argoproj.io/v1alpha1
        kind: Application
        metadata:
          name: web-app
        spec:
          syncPolicy:
            automated:
              prune: true
              selfHeal: true
      `;
      const report = auditor.auditArgoCDApplication(content);

      expect(report.valid).toBe(true);
      expect(report.violations).toHaveLength(0);
    });

    test('should flag configurations lacking selfHeal rules', () => {
      const content = `
        apiVersion: argoproj.io/v1alpha1
        kind: Application
        spec:
          syncPolicy:
            automated:
              prune: true
              selfHeal: false
      `;
      const report = auditor.auditArgoCDApplication(content);

      expect(report.valid).toBe(false);
      expect(report.violations[0]).toContain("Automated sync policy must enable 'selfHeal: true'");
    });

    test('should flag configurations missing automated sync settings', () => {
      const content = `
        apiVersion: argoproj.io/v1alpha1
        kind: Application
        spec:
          syncPolicy: {}
      `;
      const report = auditor.auditArgoCDApplication(content);

      expect(report.valid).toBe(false);
      expect(report.violations[0]).toContain("enable 'syncPolicy.automated' configurations");
    });
  });

  describe('Trunk-Based branching strategy audits', () => {
    test('should pass validation on correct branch names', () => {
      const branches = ['main', 'dev', 'feature/add-login-flow', 'bugfix/fix-oauth-callback', 'hotfix/patch-sec-12'];
      
      for (const name of branches) {
        const report = auditor.auditBranchName(name);
        expect(report.valid).toBe(true);
      }
    });

    test('should flag branch names breaching naming patterns', () => {
      const invalidBranches = ['release-1.0', 'feature/', 'my-working-branch', 'bugfix/'];

      for (const name of invalidBranches) {
        const report = auditor.auditBranchName(name);
        expect(report.valid).toBe(false);
        expect(report.violations[0]).toContain("does not match permitted trunk-based patterns");
      }
    });
  });
});
