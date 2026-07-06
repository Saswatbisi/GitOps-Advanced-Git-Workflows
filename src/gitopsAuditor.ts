// Orion LMS GitOps & Branch strategies configurations auditor

export interface AuditReport {
  valid: boolean;
  violations: string[];
}

export class GitopsAuditor {
  // 1. Audit ArgoCD declarative application manifests files
  auditArgoCDApplication(content: string): AuditReport {
    const violations: string[] = [];

    if (!content.includes("kind: Application")) {
      violations.push("Configuration Error: ArgoCD file must define a resource of 'kind: Application'.");
    }

    if (!content.includes("syncPolicy:") || !content.includes("automated:")) {
      violations.push("Best Practice Violation: GitOps applications should enable 'syncPolicy.automated' configurations.");
    } else {
      if (!content.includes("selfHeal: true")) {
        violations.push("Security/Drift Violation: Automated sync policy must enable 'selfHeal: true' to auto-correct manual cluster changes.");
      }
      if (!content.includes("prune: true")) {
        violations.push("Optimization Warning: Automated sync policy should enable 'prune: true' to garbage collect deleted resources.");
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  // 2. Audit developer branching names according to Trunk-Based guidelines
  auditBranchName(branchName: string): AuditReport {
    const violations: string[] = [];

    // Rules: trunk-based development relies on short-lived branches mapping patterns
    const allowedPatterns = [
      /^main$/,
      /^dev$/,
      /^feature\/[a-zA-Z0-9\-_]+$/,
      /^bugfix\/[a-zA-Z0-9\-_]+$/,
      /^hotfix\/[a-zA-Z0-9\-_]+$/
    ];

    const matches = allowedPatterns.some(pattern => pattern.test(branchName));
    if (!matches) {
      violations.push(`Conventions Violation: Branch name '${branchName}' does not match permitted trunk-based patterns (e.g. main, dev, feature/*, bugfix/*, hotfix/*).`);
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }
}
