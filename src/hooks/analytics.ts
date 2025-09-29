// src/utils/analytics.ts
import type { ConsentPreferences } from '@/contexts/CookieConsentContext';

interface WindowWithAnalytics extends Window {
  gtag?: (...args: any[]) => void;
  _gaq?: any;
  dataLayer?: any[];
}

declare const window: WindowWithAnalytics;

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private consentPreferences: ConsentPreferences | null = null;

  private constructor() {
    // Listen for consent updates
    if (typeof window !== 'undefined') {
      window.addEventListener('consentUpdate', (event: Event) => {
        const customEvent = event as CustomEvent<ConsentPreferences>;
        this.updateConsent(customEvent.detail);
      });
    }
  }

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  updateConsent(preferences: ConsentPreferences): void {
    this.consentPreferences = preferences;
    
    // Update Google Analytics consent
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': preferences.analytics ? 'granted' : 'denied',
        'ad_storage': preferences.marketing ? 'granted' : 'denied',
      });
    }

    // Handle other analytics platforms
    if (!preferences.analytics) {
      this.disableAnalytics();
    } else {
      this.enableAnalytics();
    }
  }

  trackEvent(category: string, action: string, label?: string, value?: number): void {
    if (!this.consentPreferences?.analytics) {
      console.log('Analytics tracking blocked by user consent');
      return;
    }

    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }

  trackPageView(path?: string): void {
    if (!this.consentPreferences?.analytics) {
      console.log('Page view tracking blocked by user consent');
      return;
    }

    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path || window.location.pathname,
      });
    }
  }

  private enableAnalytics(): void {
    // Re-enable analytics scripts
    document.querySelectorAll('script[data-consent="analytics"]').forEach((script) => {
      const newScript = document.createElement('script');
      Array.from(script.attributes).forEach((attr) => {
        if (attr.name !== 'data-consent') {
          newScript.setAttribute(attr.name, attr.value);
        }
      });
      script.parentNode?.replaceChild(newScript, script);
    });
  }

  private disableAnalytics(): void {
    // Disable Google Analytics
    (window as any)[`ga-disable-${import.meta.env.PUBLIC_GA_ID}`] = true;
    
    // Clear cookies
    document.cookie.split(';').forEach((c) => {
      const cookie = c.trim();
      if (cookie.startsWith('_ga') || cookie.startsWith('_gid')) {
        document.cookie = `${cookie.split('=')[0]}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  }
}

// Export singleton instance
export const analytics = AnalyticsManager.getInstance();