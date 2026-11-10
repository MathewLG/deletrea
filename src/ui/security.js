// @ts-check
/**
 * Records CSP violations so the error screen can show what the browser blocked
 * under "Detalles técnicos" (SPEC section 2).
 */

/** @type {{uri: string, directive: string}[]} */
const violations = [];
let installed = false;

export function installViolationLog() {
  if (installed) return;
  installed = true;
  document.addEventListener('securitypolicyviolation', (e) => {
    violations.push({ uri: e.blockedURI || '(inline)', directive: e.effectiveDirective || e.violatedDirective });
    if (violations.length > 20) violations.shift();
  });
}

export function getViolations() {
  return violations.slice();
}
