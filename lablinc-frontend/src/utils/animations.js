/**
 * Animation Utilities - Performance Optimized
 * Provides utilities for managing animations with accessibility and performance in mind
 */

// Animation configuration
export const ANIMATION_CONFIG = {
  durations: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    slowest: 750
  },
  
  easings: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get appropriate animation duration based on user preferences
export const getAnimationDuration = (duration = 'normal') => {
  if (prefersReducedMotion()) {
    return 0;
  }
  
  return ANIMATION_CONFIG.durations[duration] || ANIMATION_CONFIG.durations.normal;
};

// Animation class manager
export class AnimationManager {
  constructor() {
    this.activeAnimations = new Map();
    this.observers = new Map();
    this.reducedMotion = prefersReducedMotion();
    
    // Listen for reduced motion preference changes
    this.setupReducedMotionListener();
  }

  setupReducedMotionListener() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      this.updateAllAnimations();
    });
  }

  updateAllAnimations() {
    // Update all active animations based on reduced motion preference
    this.activeAnimations.forEach((animation, element) => {
      if (this.reducedMotion) {
        this.pauseAnimation(element);
      } else {
        this.resumeAnimation(element);
      }
    });
  }

  // Add animation to element with performance optimization
  animate(element, animationName, options = {}) {
    if (!element) return null;

    const {
      duration = 'normal',
      easing = 'easeOut',
      delay = 0,
      fillMode = 'forwards',
      iterations = 1,
      direction = 'normal',
      onComplete = null,
      onStart = null,
      useGPU = true
    } = options;

    // Skip animation if reduced motion is preferred
    if (this.reducedMotion && !options.forceAnimation) {
      if (onComplete) onComplete();
      return null;
    }

    // Optimize for GPU acceleration
    if (useGPU) {
      element.style.willChange = 'transform, opacity';
    }

    // Create animation
    const animationOptions = {
      duration: getAnimationDuration(duration),
      easing: ANIMATION_CONFIG.easings[easing] || easing,
      delay,
      fill: fillMode,
      iterations,
      direction
    };

    const animation = element.animate(
      this.getKeyframes(animationName),
      animationOptions
    );

    // Store animation reference
    this.activeAnimations.set(element, animation);

    // Handle animation events
    if (onStart) {
      animation.addEventListener('start', onStart);
    }

    animation.addEventListener('finish', () => {
      // Clean up will-change for performance
      if (useGPU) {
        element.style.willChange = 'auto';
      }
      
      this.activeAnimations.delete(element);
      
      if (onComplete) {
        onComplete();
      }
    });

    animation.addEventListener('cancel', () => {
      if (useGPU) {
        element.style.willChange = 'auto';
      }
      this.activeAnimations.delete(element);
    });

    return animation;
  }

  // Get keyframes for animation
  getKeyframes(animationName) {
    const keyframes = {
      fadeIn: [
        { opacity: 0 },
        { opacity: 1 }
      ],
      fadeOut: [
        { opacity: 1 },
        { opacity: 0 }
      ],
      slideUp: [
        { transform: 'translateY(20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ],
      slideDown: [
        { transform: 'translateY(-20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ],
      slideLeft: [
        { transform: 'translateX(20px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ],
      slideRight: [
        { transform: 'translateX(-20px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ],
      scaleIn: [
        { transform: 'scale(0.9)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 }
      ],
      scaleOut: [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0.9)', opacity: 0 }
      ],
      bounceIn: [
        { transform: 'scale(0.3)', opacity: 0 },
        { transform: 'scale(1.05)', opacity: 0.8, offset: 0.5 },
        { transform: 'scale(0.9)', opacity: 0.9, offset: 0.7 },
        { transform: 'scale(1)', opacity: 1 }
      ],
      shake: [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)', offset: 0.1 },
        { transform: 'translateX(5px)', offset: 0.2 },
        { transform: 'translateX(-5px)', offset: 0.3 },
        { transform: 'translateX(5px)', offset: 0.4 },
        { transform: 'translateX(-5px)', offset: 0.5 },
        { transform: 'translateX(5px)', offset: 0.6 },
        { transform: 'translateX(-5px)', offset: 0.7 },
        { transform: 'translateX(5px)', offset: 0.8 },
        { transform: 'translateX(-5px)', offset: 0.9 },
        { transform: 'translateX(0)' }
      ],
      pulse: [
        { opacity: 1 },
        { opacity: 0.5, offset: 0.5 },
        { opacity: 1 }
      ],
      spin: [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(360deg)' }
      ]
    };

    return keyframes[animationName] || keyframes.fadeIn;
  }

  // Pause animation
  pauseAnimation(element) {
    const animation = this.activeAnimations.get(element);
    if (animation) {
      animation.pause();
    }
  }

  // Resume animation
  resumeAnimation(element) {
    const animation = this.activeAnimations.get(element);
    if (animation && !this.reducedMotion) {
      animation.play();
    }
  }

  // Cancel animation
  cancelAnimation(element) {
    const animation = this.activeAnimations.get(element);
    if (animation) {
      animation.cancel();
      element.style.willChange = 'auto';
      this.activeAnimations.delete(element);
    }
  }

  // Cancel all animations
  cancelAllAnimations() {
    this.activeAnimations.forEach((animation, element) => {
      animation.cancel();
      element.style.willChange = 'auto';
    });
    this.activeAnimations.clear();
  }

  // Stagger animations for multiple elements
  staggerAnimate(elements, animationName, options = {}) {
    const { staggerDelay = 50, ...animationOptions } = options;
    
    return Array.from(elements).map((element, index) => {
      return this.animate(element, animationName, {
        ...animationOptions,
        delay: (animationOptions.delay || 0) + (index * staggerDelay)
      });
    });
  }

  // Intersection Observer for scroll-triggered animations
  observeIntersection(element, animationName, options = {}) {
    const {
      threshold = 0.1,
      rootMargin = '0px',
      once = true,
      ...animationOptions
    } = options;

    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animate(entry.target, animationName, animationOptions);
          
          if (once) {
            observer.unobserve(entry.target);
            this.observers.delete(element);
          }
        }
      });
    }, {
      threshold,
      rootMargin
    });

    observer.observe(element);
    this.observers.set(element, observer);

    return observer;
  }

  // Clean up observer
  unobserve(element) {
    const observer = this.observers.get(element);
    if (observer) {
      observer.unobserve(element);
      this.observers.delete(element);
    }
  }

  // Clean up all observers
  cleanup() {
    this.cancelAllAnimations();
    
    this.observers.forEach((observer, element) => {
      observer.unobserve(element);
    });
    this.observers.clear();
  }
}

// Global animation manager instance
export const animationManager = new AnimationManager();

// Utility functions for common animations
export const fadeIn = (element, options = {}) => {
  return animationManager.animate(element, 'fadeIn', options);
};

export const fadeOut = (element, options = {}) => {
  return animationManager.animate(element, 'fadeOut', options);
};

export const slideUp = (element, options = {}) => {
  return animationManager.animate(element, 'slideUp', options);
};

export const slideDown = (element, options = {}) => {
  return animationManager.animate(element, 'slideDown', options);
};

export const scaleIn = (element, options = {}) => {
  return animationManager.animate(element, 'scaleIn', options);
};

export const shake = (element, options = {}) => {
  return animationManager.animate(element, 'shake', {
    duration: 'slow',
    iterations: 1,
    ...options
  });
};

// React hook for animations
export const useAnimation = () => {
  const animate = (element, animationName, options = {}) => {
    return animationManager.animate(element, animationName, options);
  };

  const observeIntersection = (element, animationName, options = {}) => {
    return animationManager.observeIntersection(element, animationName, options);
  };

  return {
    animate,
    observeIntersection,
    fadeIn: (element, options) => fadeIn(element, options),
    fadeOut: (element, options) => fadeOut(element, options),
    slideUp: (element, options) => slideUp(element, options),
    slideDown: (element, options) => slideDown(element, options),
    scaleIn: (element, options) => scaleIn(element, options),
    shake: (element, options) => shake(element, options),
    prefersReducedMotion: prefersReducedMotion()
  };
};

// Performance monitoring
export const measureAnimationPerformance = (animationName, callback) => {
  const startTime = performance.now();
  
  const result = callback();
  
  if (result && result.then) {
    // Handle promise-based animations
    return result.then(() => {
      const endTime = performance.now();
      console.log(`Animation "${animationName}" took ${endTime - startTime} milliseconds`);
    });
  } else {
    const endTime = performance.now();
    console.log(`Animation "${animationName}" took ${endTime - startTime} milliseconds`);
    return result;
  }
};

// Cleanup function for component unmounting
export const cleanupAnimations = (element) => {
  if (element) {
    animationManager.cancelAnimation(element);
    animationManager.unobserve(element);
  }
};

export default animationManager;