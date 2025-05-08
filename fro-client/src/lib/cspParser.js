/**
 * Parses and analyzes Content Security Policy (CSP) headers
 */

// List of all CSP directives (including deprecated ones for backward compatibility)
const CSP_DIRECTIVES = [
    'child-src',
    'connect-src',
    'default-src',
    'font-src',
    'frame-src',
    'img-src',
    'manifest-src',
    'media-src',
    'object-src',
    'prefetch-src',
    'script-src',
    'script-src-elem',
    'script-src-attr',
    'style-src',
    'style-src-elem',
    'style-src-attr',
    'worker-src',
    'base-uri',
    'sandbox',
    'form-action',
    'frame-ancestors',
    'navigate-to',
    'report-uri',
    'report-to',
    'block-all-mixed-content',
    'referrer',
    'require-sri-for',
    'require-trusted-types-for',
    'trusted-types',
    'upgrade-insecure-requests'
  ];
  
  /**
   * Parses a CSP header string into a structured object
   * @param {string} cspHeader - The CSP header string
   * @returns {Object} Parsed CSP policy
   */
  function parseCSP(cspHeader) {
    if (!cspHeader || typeof cspHeader !== 'string') {
      throw new Error('Invalid CSP header: must be a non-empty string');
    }
  
    const policy = {};
    const directiveStrings = cspHeader.split(';').map(s => s.trim()).filter(Boolean);
  
    for (const directiveStr of directiveStrings) {
      const [directive, ...values] = directiveStr.split(/\s+/).filter(Boolean);
      const normalizedDirective = directive.toLowerCase();
  
      if (!CSP_DIRECTIVES.includes(normalizedDirective)) {
        console.warn(`Unknown CSP directive: ${directive}`);
        continue;
      }
  
      policy[normalizedDirective] = values;
    }
  
    return policy;
  }
  
  /**
   * Analyzes a parsed CSP policy for common security issues
   * @param {Object} cspPolicy - Parsed CSP policy
   * @returns {Object} Analysis results
   */
  function analyzeCSP(cspPolicy) {
    const analysis = {
      warnings: [],
      errors: [],
      recommendations: [],
      hasUnsafeInline: false,
      hasUnsafeEval: false,
      hasWildcards: false,
      missingDirectives: []
    };
  
    // Check for common insecure patterns
    for (const [directive, values] of Object.entries(cspPolicy)) {
      // Check for 'unsafe-inline'
      if (values.includes("'unsafe-inline'")) {
        analysis.hasUnsafeInline = true;
        analysis.warnings.push(`'unsafe-inline' is allowed in ${directive}`);
      }
  
      // Check for 'unsafe-eval'
      if (values.includes("'unsafe-eval'")) {
        analysis.hasUnsafeEval = true;
        analysis.warnings.push(`'unsafe-eval' is allowed in ${directive}`);
      }
  
      // Check for wildcards
      if (values.includes("*")) {
        analysis.hasWildcards = true;
        analysis.errors.push(`Wildcard (*) source is allowed in ${directive}`);
      }
    }
  
    // Check for missing important directives
    const importantDirectives = ['default-src', 'script-src', 'object-src'];
    for (const directive of importantDirectives) {
      if (!cspPolicy[directive]) {
        analysis.missingDirectives.push(directive);
        analysis.recommendations.push(`Consider adding ${directive} directive`);
      }
    }
  
    // Special check for object-src which should typically be 'none'
    if (cspPolicy['object-src'] && !cspPolicy['object-src'].includes("'none'")) {
      analysis.recommendations.push("Consider setting object-src to 'none' to prevent plugin attacks");
    }
  
    // Check if default-src is present (acts as fallback)
    if (!cspPolicy['default-src']) {
      analysis.warnings.push("No default-src directive found. Other directives won't fall back to a default");
    }
  
    return analysis;
  }
  
  /**
   * Validates CSP against common security best practices
   * @param {Object} cspPolicy - Parsed CSP policy
   * @returns {boolean} True if CSP is considered secure
   */
  function validateCSP(cspPolicy) {
    const analysis = analyzeCSP(cspPolicy);
    return analysis.errors.length === 0 && !analysis.hasUnsafeInline && !analysis.hasWildcards;
  }
  
  /**
   * Generates a CSP header string from a policy object
   * @param {Object} cspPolicy - Parsed CSP policy
   * @returns {string} CSP header string
   */
  function generateCSP(cspPolicy) {
    return Object.entries(cspPolicy)
      .map(([directive, values]) => `${directive} ${values.join(' ')}`)
      .join('; ');
  }
  
  module.exports = {
    parseCSP,
    analyzeCSP,
    validateCSP,
    generateCSP,
    CSP_DIRECTIVES
  };