/**
 * CSS Purging Utilities
 * Tools for removing unused CSS and optimizing stylesheets
 */

// CSS purging configuration
const PURGE_CONFIG = {
  // Selectors to always keep (even if not found in HTML)
  safelist: [
    // State classes that might be added dynamically
    /^(is-|has-|show-|hide-|active|inactive|disabled|enabled)/,
    /^(loading|loaded|error|success|warning|info)/,
    /^(open|closed|expanded|collapsed|visible|hidden)/,
    
    // Animation classes
    /^(animate-|transition-|duration-|ease-)/,
    
    // Responsive classes
    /^(sm:|md:|lg:|xl:|2xl:)/,
    
    // Focus and hover states
    /^(hover:|focus:|focus-visible:|active:)/,
    
    // Dark mode classes
    /^(dark:)/,
    
    // Print classes
    /^(print:)/
  ],
  
  // Content patterns to scan for class names
  contentPatterns: [
    /class\s*=\s*["']([^"']+)["']/g,
    /className\s*=\s*["']([^"']+)["']/g,
    /className\s*=\s*{[^}]*["']([^"']+)["'][^}]*}/g,
    /classList\.add\s*\(\s*["']([^"']+)["']\s*\)/g,
    /classList\.toggle\s*\(\s*["']([^"']+)["']\s*\)/g
  ]
};

export class CSSPurger {
  constructor(config = {}) {
    this.config = { ...PURGE_CONFIG, ...config };
    this.usedSelectors = new Set();
    this.purgedCSS = '';
  }

  // Extract used selectors from content
  extractSelectorsFromContent(content) {
    const selectors = new Set();
    
    this.config.contentPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const classNames = match[1].split(/\s+/).filter(cls => cls.length > 0);
        classNames.forEach(cls => {
          selectors.add(`.${cls}`);
          this.usedSelectors.add(`.${cls}`);
        });
      }
    });

    return selectors;
  }

  // Check if selector should be kept
  shouldKeepSelector(selector) {
    // Always keep selectors in safelist
    if (this.config.safelist.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(selector);
      }
      return selector.includes(pattern);
    })) {
      return true;
    }

    // Keep if selector is used
    return this.usedSelectors.has(selector);
  }

  // Parse CSS and extract selectors
  parseCSSSelectors(css) {
    const selectors = new Set();
    
    // Remove comments first
    const cleanCSS = css.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Match CSS rules
    const rulePattern = /([^{}]+)\s*\{[^{}]*\}/g;
    let match;
    
    while ((match = rulePattern.exec(cleanCSS)) !== null) {
      const selectorText = match[1].trim();
      
      // Split multiple selectors (comma-separated)
      const individualSelectors = selectorText.split(',').map(s => s.trim());
      
      individualSelectors.forEach(selector => {
        // Extract class selectors
        const classMatches = selector.match(/\.[a-zA-Z][\w-]*/g);
        if (classMatches) {
          classMatches.forEach(cls => selectors.add(cls));
        }
        
        // Also add the full selector
        selectors.add(selector);
      });
    }
    
    return selectors;
  }

  // Purge CSS based on used selectors
  purgeCSS(css, content) {
    // Extract selectors from content
    if (content) {
      this.extractSelectorsFromContent(content);
    }

    // Parse CSS to find all selectors
    const allSelectors = this.parseCSSSelectors(css);
    
    // Remove unused rules
    let purgedCSS = css;
    
    // Remove comments
    purgedCSS = purgedCSS.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Process CSS rules
    const rulePattern = /([^{}]+)\s*\{([^{}]*)\}/g;
    
    purgedCSS = purgedCSS.replace(rulePattern, (match, selectors, declarations) => {
      const selectorList = selectors.split(',').map(s => s.trim());
      
      // Filter out unused selectors
      const usedSelectorList = selectorList.filter(selector => {
        // Check if any class in the selector is used
        const classMatches = selector.match(/\.[a-zA-Z][\w-]*/g);
        if (classMatches) {
          return classMatches.some(cls => this.shouldKeepSelector(cls));
        }
        
        // Keep non-class selectors (elements, IDs, etc.)
        return !selector.includes('.');
      });
      
      // Return rule if any selectors are used
      if (usedSelectorList.length > 0) {
        return `${usedSelectorList.join(', ')} { ${declarations.trim()} }`;
      }
      
      return ''; // Remove unused rule
    });

    // Clean up extra whitespace
    purgedCSS = purgedCSS
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, ' { ')
      .replace(/\s*}\s*/g, ' } ')
      .replace(/\s*;\s*/g, '; ')
      .trim();

    this.purgedCSS = purgedCSS;
    return purgedCSS;
  }

  // Generate purge report
  generateReport(originalCSS, purgedCSS) {
    const originalSize = new Blob([originalCSS]).size;
    const purgedSize = new Blob([purgedCSS]).size;
    const savings = originalSize - purgedSize;
    const savingsPercentage = ((savings / originalSize) * 100).toFixed(2);

    const originalRules = (originalCSS.match(/\{[^}]*\}/g) || []).length;
    const purgedRules = (purgedCSS.match(/\{[^}]*\}/g) || []).length;
    const removedRules = originalRules - purgedRules;

    return {
      originalSize,
      purgedSize,
      savings,
      savingsPercentage: parseFloat(savingsPercentage),
      originalRules,
      purgedRules,
      removedRules,
      usedSelectors: Array.from(this.usedSelectors).sort(),
      recommendations: this.generateRecommendations(savings, savingsPercentage)
    };
  }

  // Generate optimization recommendations
  generateRecommendations(savings, savingsPercentage) {
    const recommendations = [];

    if (savingsPercentage > 50) {
      recommendations.push({
        type: 'high-savings',
        severity: 'high',
        message: `Significant CSS reduction achieved (${savingsPercentage}%)`,
        action: 'Consider implementing CSS purging in your build process'
      });
    } else if (savingsPercentage > 25) {
      recommendations.push({
        type: 'medium-savings',
        severity: 'medium',
        message: `Moderate CSS reduction possible (${savingsPercentage}%)`,
        action: 'Review unused styles and consider purging'
      });
    } else if (savingsPercentage < 10) {
      recommendations.push({
        type: 'low-savings',
        severity: 'low',
        message: `Minimal unused CSS found (${savingsPercentage}%)`,
        action: 'CSS is already well-optimized'
      });
    }

    if (savings > 50000) { // 50KB
      recommendations.push({
        type: 'large-savings',
        severity: 'high',
        message: `Large file size reduction possible (${(savings / 1024).toFixed(1)}KB)`,
        action: 'Implement CSS purging to improve load times'
      });
    }

    return recommendations;
  }
}

// CSS minification utilities
export const minifyCSS = (css) => {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove unnecessary whitespace
    .replace(/\s+/g, ' ')
    // Remove whitespace around specific characters
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    // Remove trailing semicolons before closing braces
    .replace(/;}/g, '}')
    // Remove leading/trailing whitespace
    .trim();
};

// Critical CSS extraction
export const extractCriticalCSS = async (css, viewport = { width: 1200, height: 800 }) => {
  const criticalSelectors = new Set();
  
  // Get all elements currently visible in viewport
  const elements = document.querySelectorAll('*');
  
  elements.forEach(element => {
    const rect = element.getBoundingClientRect();
    
    // Check if element is in viewport
    if (rect.top < viewport.height && 
        rect.bottom > 0 && 
        rect.left < viewport.width && 
        rect.right > 0) {
      
      // Add element's classes to critical selectors
      if (element.className && typeof element.className === 'string') {
        const classes = element.className.split(/\s+/).filter(cls => cls.length > 0);
        classes.forEach(cls => criticalSelectors.add(`.${cls}`));
      }
    }
  });

  // Extract critical CSS rules
  const purger = new CSSPurger({
    safelist: [
      // Always include base styles
      /^(html|body|\*)/,
      // Include critical layout classes
      /^(container|wrapper|main|header|footer|nav)/,
      // Include critical utility classes
      /^(sr-only|visually-hidden|clearfix)/
    ]
  });

  // Set used selectors to critical ones
  purger.usedSelectors = criticalSelectors;
  
  return purger.purgeCSS(css);
};

// Bundle analyzer for CSS
export const analyzeCSSBundle = (css) => {
  const analysis = {
    totalSize: new Blob([css]).size,
    gzippedSize: 0, // Would need compression library
    rules: (css.match(/\{[^}]*\}/g) || []).length,
    selectors: (css.match(/[^{}]+(?=\s*\{)/g) || []).length,
    properties: (css.match(/[^{}:;]+\s*:/g) || []).length,
    mediaQueries: (css.match(/@media[^{]+\{/g) || []).length,
    keyframes: (css.match(/@keyframes[^{]+\{/g) || []).length,
    imports: (css.match(/@import[^;]+;/g) || []).length,
    duplicates: findDuplicateRules(css),
    recommendations: []
  };

  // Generate recommendations
  if (analysis.duplicates.length > 0) {
    analysis.recommendations.push({
      type: 'duplicate-rules',
      message: `${analysis.duplicates.length} duplicate CSS rules found`,
      impact: 'medium'
    });
  }

  if (analysis.totalSize > 100000) { // 100KB
    analysis.recommendations.push({
      type: 'large-bundle',
      message: 'CSS bundle is quite large, consider code splitting',
      impact: 'high'
    });
  }

  if (analysis.mediaQueries > 20) {
    analysis.recommendations.push({
      type: 'many-media-queries',
      message: 'Consider consolidating media queries',
      impact: 'low'
    });
  }

  return analysis;
};

// Find duplicate CSS rules
const findDuplicateRules = (css) => {
  const rules = new Map();
  const duplicates = [];
  
  const rulePattern = /([^{}]+)\s*\{([^{}]*)\}/g;
  let match;
  
  while ((match = rulePattern.exec(css)) !== null) {
    const selector = match[1].trim();
    const declarations = match[2].trim();
    const key = `${selector}:${declarations}`;
    
    if (rules.has(key)) {
      duplicates.push({ selector, declarations });
    } else {
      rules.set(key, true);
    }
  }
  
  return duplicates;
};

// Global CSS purger instance
export const cssPurger = new CSSPurger();

// Utility functions
export const purgeUnusedCSS = (css, content) => cssPurger.purgeCSS(css, content);
export const generatePurgeReport = (originalCSS, purgedCSS) => 
  cssPurger.generateReport(originalCSS, purgedCSS);

export default CSSPurger;