import React, { useState, useEffect } from 'react';
import { cssAnalyzer } from '../../utils/cssOptimizer.js';
import { analyzeCSSBundle } from '../../utils/cssPurger.js';
import { isDevelopment } from '../../config/environment.js';
import './PerformanceMonitor.css';

const PerformanceMonitor = ({ 
  showInProduction = false,
  autoStart = true,
  monitorImages = true,
  monitorCSS = true,
  onReport = null
}) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [cssReport, setCssReport] = useState(null);
  const [imageReport, setImageReport] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Don't show in production unless explicitly enabled
  const shouldShow = isDevelopment() || showInProduction;

  useEffect(() => {
    if (autoStart && shouldShow) {
      startMonitoring();
    }

    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [autoStart, shouldShow]);

  // Start performance monitoring
  const startMonitoring = () => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    
    // Start CSS analysis
    if (monitorCSS) {
      cssAnalyzer.startAnalysis();
    }

    // Monitor performance metrics
    monitorPerformanceMetrics();
    
    console.log('🚀 Performance monitoring started');
  };

  // Stop monitoring and generate report
  const stopMonitoring = async () => {
    if (!isMonitoring) return;

    setIsMonitoring(false);

    const reports = {};

    // Generate CSS report
    if (monitorCSS) {
      try {
        const cssData = await cssAnalyzer.stopAnalysis();
        setCssReport(cssData);
        reports.css = cssData;
      } catch (error) {
        console.error('CSS analysis failed:', error);
      }
    }

    // Generate image report
    if (monitorImages) {
      try {
        const imageData = await analyzeImagePerformance();
        setImageReport(imageData);
        reports.images = imageData;
      } catch (error) {
        console.error('Image analysis failed:', error);
      }
    }

    // Generate overall performance report
    const perfData = await generatePerformanceReport();
    setPerformanceData(perfData);
    reports.performance = perfData;

    // Call report callback
    if (onReport) {
      onReport(reports);
    }

    console.log('📊 Performance monitoring stopped');
  };

  // Monitor performance metrics
  const monitorPerformanceMetrics = () => {
    // Use Performance Observer if available
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'paint') {
            console.log(`🎨 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
          } else if (entry.entryType === 'largest-contentful-paint') {
            console.log(`🖼️ LCP: ${entry.startTime.toFixed(2)}ms`);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  };

  // Analyze image performance
  const analyzeImagePerformance = async () => {
    const images = Array.from(document.querySelectorAll('img'));
    const imageData = {
      totalImages: images.length,
      loadedImages: 0,
      failedImages: 0,
      lazyImages: 0,
      totalSize: 0,
      averageLoadTime: 0,
      recommendations: []
    };

    const loadTimes = [];

    for (const img of images) {
      // Check if image is loaded
      if (img.complete && img.naturalHeight !== 0) {
        imageData.loadedImages++;
      } else if (img.complete && img.naturalHeight === 0) {
        imageData.failedImages++;
      }

      // Check for lazy loading
      if (img.loading === 'lazy' || img.hasAttribute('data-src')) {
        imageData.lazyImages++;
      }

      // Estimate image size (approximate)
      if (img.src && img.complete) {
        try {
          const response = await fetch(img.src, { method: 'HEAD' });
          const size = parseInt(response.headers.get('content-length') || '0');
          imageData.totalSize += size;
        } catch (error) {
          // Ignore fetch errors for cross-origin images
        }
      }
    }

    // Calculate averages
    if (loadTimes.length > 0) {
      imageData.averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    }

    // Generate recommendations
    const lazyPercentage = (imageData.lazyImages / imageData.totalImages) * 100;
    if (lazyPercentage < 50) {
      imageData.recommendations.push({
        type: 'lazy-loading',
        message: 'Consider implementing lazy loading for more images',
        impact: 'medium'
      });
    }

    if (imageData.failedImages > 0) {
      imageData.recommendations.push({
        type: 'failed-images',
        message: `${imageData.failedImages} images failed to load`,
        impact: 'high'
      });
    }

    if (imageData.totalSize > 1000000) { // 1MB
      imageData.recommendations.push({
        type: 'large-images',
        message: 'Total image size is quite large, consider optimization',
        impact: 'high'
      });
    }

    return imageData;
  };

  // Generate overall performance report
  const generatePerformanceReport = async () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    const report = {
      timestamp: new Date().toISOString(),
      navigation: navigation ? {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
      } : null,
      paint: {
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      },
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null,
      recommendations: []
    };

    // Generate performance recommendations
    if (report.paint.firstContentfulPaint > 2500) {
      report.recommendations.push({
        type: 'slow-fcp',
        message: 'First Contentful Paint is slower than recommended (>2.5s)',
        impact: 'high'
      });
    }

    if (report.navigation?.totalLoadTime > 5000) {
      report.recommendations.push({
        type: 'slow-load',
        message: 'Total page load time is slower than recommended (>5s)',
        impact: 'high'
      });
    }

    return report;
  };

  // Toggle visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Don't render in production unless explicitly enabled
  if (!shouldShow) {
    return null;
  }

  return (
    <div className={`performance-monitor ${isVisible ? 'visible' : 'collapsed'}`}>
      {/* Toggle Button */}
      <button 
        className="performance-toggle"
        onClick={toggleVisibility}
        title="Performance Monitor"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        {isMonitoring && <div className="monitoring-indicator"></div>}
      </button>

      {/* Monitor Panel */}
      {isVisible && (
        <div className="performance-panel">
          <div className="performance-header">
            <h3>Performance Monitor</h3>
            <div className="performance-controls">
              {!isMonitoring ? (
                <button className="btn btn-sm btn-primary" onClick={startMonitoring}>
                  Start Monitoring
                </button>
              ) : (
                <button className="btn btn-sm btn-secondary" onClick={stopMonitoring}>
                  Stop & Report
                </button>
              )}
            </div>
          </div>

          <div className="performance-content">
            {/* Performance Metrics */}
            {performanceData && (
              <div className="performance-section">
                <h4>Performance Metrics</h4>
                <div className="metrics-grid">
                  <div className="metric">
                    <span className="metric-label">First Paint</span>
                    <span className="metric-value">
                      {performanceData.paint.firstPaint.toFixed(0)}ms
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">FCP</span>
                    <span className="metric-value">
                      {performanceData.paint.firstContentfulPaint.toFixed(0)}ms
                    </span>
                  </div>
                  {performanceData.navigation && (
                    <div className="metric">
                      <span className="metric-label">Load Time</span>
                      <span className="metric-value">
                        {performanceData.navigation.totalLoadTime.toFixed(0)}ms
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CSS Report */}
            {cssReport && (
              <div className="performance-section">
                <h4>CSS Analysis</h4>
                <div className="css-stats">
                  <div className="stat">
                    <span>Usage: {cssReport.usagePercentage}%</span>
                  </div>
                  <div className="stat">
                    <span>Unused: {cssReport.unusedClasses.length} classes</span>
                  </div>
                </div>
                {cssReport.recommendations.length > 0 && (
                  <div className="recommendations">
                    {cssReport.recommendations.map((rec, index) => (
                      <div key={index} className={`recommendation ${rec.severity}`}>
                        {rec.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Image Report */}
            {imageReport && (
              <div className="performance-section">
                <h4>Image Analysis</h4>
                <div className="image-stats">
                  <div className="stat">
                    <span>Total: {imageReport.totalImages}</span>
                  </div>
                  <div className="stat">
                    <span>Lazy: {imageReport.lazyImages}</span>
                  </div>
                  <div className="stat">
                    <span>Failed: {imageReport.failedImages}</span>
                  </div>
                </div>
                {imageReport.recommendations.length > 0 && (
                  <div className="recommendations">
                    {imageReport.recommendations.map((rec, index) => (
                      <div key={index} className={`recommendation ${rec.impact}`}>
                        {rec.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Status */}
            <div className="performance-status">
              {isMonitoring ? (
                <span className="status monitoring">🔍 Monitoring...</span>
              ) : (
                <span className="status idle">⏸️ Idle</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;