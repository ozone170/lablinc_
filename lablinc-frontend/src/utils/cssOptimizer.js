/**
 * CSS Optimization Utilities
 * Tools for analyzing and optimizing CSS usage
 */

// CSS class usage analyzer
export class CSSAnalyzer {
  constructor() {
    this.usedClasses = new Set();
    this.definedClasses = new Set();
    this.observer = null;
    this.isAnalyzing = false;
  }

  // Start analyzing CSS usage
  startAnalysis() {
    if (this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    this.usedClasses.clear();
    
    // Analyze existing DOM
    this.analyzeDOM();
    
    // Set up mutation observer for dynamic content
    this.setupMutationObserver();
    
    console.log('🔍 CSS Analysis started');
  }

  // Stop analysis and generate report
  stopAnalysis() {
    if (!this.isAnalyzing) return;
    
    this.isAnalyzing = false;
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    const report = this.generateReport();
    console.log('📊 CSS Analysis Report:', report);
    
    return report;
  }

  // Analyze current DOM for used classes
  analyzeDOM() {
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
      if (element.className && typeof element.className === 'string') {
        const classes = element.className.split(/\s+/).filter(cls => cls.length > 0);
        classes.forEach(cls => this.usedClasses.add(cls));
      }
    });
  }

  // Set up mutation observer to track dynamic class usage
  setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        // Check added nodes
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.analyzeElement(node);
            // Analyze child elements
            const children = node.querySelectorAll('*');
            children.forEach(child => this.analyzeElement(child));
          }
        });

        // Check attribute changes
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          this.analyzeElement(mutation.target);
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  // Analyze individual element
  analyzeElement(element) {
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(/\s+/).filter(cls => cls.length > 0);
      classes.forEach(cls => this.usedClasses.add(cls));
    }
  }

  // Extract defined classes from CSS
  async extractDefinedClasses() {
    this.definedClasses.clear();
    
    // Get all stylesheets
    const stylesheets = Array.from(document.styleSheets);
    
    for (const stylesheet of stylesheets) {
      try {
        await this.analyzeStylesheet(stylesheet);
      } catch (error) {
        console.warn('Could not analyze stylesheet:', stylesheet.href, error);
      }
    }
  }

  // Analyze individual stylesheet
  async analyzeStylesheet(stylesheet) {
    try {
      const rules = Array.from(stylesheet.cssRules || stylesheet.rules || []);
      
      rules.forEach(rule => {
        if (rule.type === CSSRule.STYLE_RULE) {
          this.extractClassesFromSelector(rule.selectorText);
        } else if (rule.type === CSSRule.MEDIA_RULE) {
          // Analyze rules inside media queries
          const mediaRules = Array.from(rule.cssRules || []);
          mediaRules.forEach(mediaRule => {
            if (mediaRule.type === CSSRule.STYLE_RULE) {
              this.extractClassesFromSelector(mediaRule.selectorText);
            }
          });
        }
      });
    } catch (error) {
      // Cross-origin stylesheets may not be accessible
      console.warn('Could not access stylesheet rules:', error);
    }
  }

  // Extract class names from CSS selector
  extractClassesFromSelector(selectorText) {
    if (!selectorText) return;
    
    // Match class selectors (.class-name)
    const classMatches = selectorText.match(/\.[a-zA-Z][\w-]*/g);
    
    if (classMatches) {
      classMatches.forEach(match => {
        // Remove the leading dot
        const className = match.substring(1);
        this.definedClasses.add(className);
      });
    }
  }

  // Generate usage report
  async generateReport() {
    await this.extractDefinedClasses();
    
    const usedArray = Array.from(this.usedClasses);
    const definedArray = Array.from(this.definedClasses);
    
    const unusedClasses = definedArray.filter(cls => !this.usedClasses.has(cls));
    const undefinedClasses = usedArray.filter(cls => !this.definedClasses.has(cls));
    
    const usagePercentage = definedArray.length > 0 
      ? ((definedArray.length - unusedClasses.length) / definedArray.length * 100).toFixed(2)
      : 0;

    return {
      totalDefined: definedArray.length,
      totalUsed: usedArray.length,
      unusedClasses: unusedClasses.sort(),
      undefinedClasses: undefinedClasses.sort(),
      usagePercentage: parseFloat(usagePercentage),
      recommendations: this.generateRecommendations(unusedClasses, undefinedClasses)
    };
  }

  // Generate optimization recommendations
  generateRecommendations(unusedClasses, undefinedClasses) {
    const recommendations = [];

    if (unusedClasses.length > 0) {
      recommendations.push({
        type: 'unused-css',
        severity: 'medium',
        message: `${unusedClasses.length} unused CSS classes found`,
        details: unusedClasses.slice(0, 10), // Show first 10
        action: 'Consider removing unused classes to reduce bundle size'
      });
    }

    if (undefinedClasses.length > 0) {
      recommendations.push({
        type: 'undefined-classes',
        severity: 'low',
        message: `${undefinedClasses.length} classes used but not defined in CSS`,
        details: undefinedClasses.slice(0, 10),
        action: 'These might be utility classes or dynamically generated'
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
    // Remove trailing semicolons
    .replace(/;}/g, '}')
    // Remove leading/trailing whitespace
    .trim();
};

// Critical CSS extraction
export const extractCriticalCSS = async (viewport = { width: 1200, height: 800 }) => {
  const criticalSelectors = new Set();
  
  // Get all elements in the viewport
  const elements = document.elementsFromPoint(viewport.width / 2, viewport.height / 2);
  
  // Also check elements in the initial viewport
  const viewportElements = document.querySelectorAll('*');
  
  viewportElements.forEach(element => {
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
      
      // Add element's tag selector
      criticalSelectors.add(element.tagName.toLowerCase());
    }
  });

  return Array.from(criticalSelectors);
};

// CSS performance analyzer
export const analyzeCSSPerformance = () => {
  const stylesheets = Array.from(document.styleSheets);
  const analysis = {
    totalStylesheets: stylesheets.length,
    totalRules: 0,
    externalStylesheets: 0,
    inlineStyles: 0,
    mediaQueries: 0,
    keyframes: 0,
    performance: {
      loadTime: 0,
      renderTime: 0,
      recommendations: []
    }
  };

  stylesheets.forEach(stylesheet => {
    if (stylesheet.href) {
      analysis.externalStylesheets++;
    } else {
      analysis.inlineStyles++;
    }

    try {
      const rules = Array.from(stylesheet.cssRules || []);
      analysis.totalRules += rules.length;

      rules.forEach(rule => {
        if (rule.type === CSSRule.MEDIA_RULE) {
          analysis.mediaQueries++;
        } else if (rule.type === CSSRule.KEYFRAMES_RULE) {
          analysis.keyframes++;
        }
      });
    } catch (error) {
      // Cross-origin stylesheets
    }
  });

  // Generate performance recommendations
  if (analysis.totalStylesheets > 5) {
    analysis.performance.recommendations.push({
      type: 'too-many-stylesheets',
      message: 'Consider combining stylesheets to reduce HTTP requests',
      impact: 'medium'
    });
  }

  if (analysis.totalRules > 1000) {
    analysis.performance.recommendations.push({
      type: 'too-many-rules',
      message: 'Large number of CSS rules may impact performance',
      impact: 'medium'
    });
  }

  if (analysis.inlineStyles > analysis.externalStylesheets) {
    analysis.performance.recommendations.push({
      type: 'too-many-inline-styles',
      message: 'Consider moving inline styles to external stylesheets',
      impact: 'low'
    });
  }

  return analysis;
};

// Global CSS analyzer instance
export const cssAnalyzer = new CSSAnalyzer();

// Utility functions
export const startCSSAnalysis = () => cssAnalyzer.startAnalysis();
export const stopCSSAnalysis = () => cssAnalyzer.stopAnalysis();
export const getCSSReport = () => cssAnalyzer.generateReport();

export default cssAnalyzer;