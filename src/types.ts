export interface InputSchema {
  signInPageURL: string;
  steps: Step[];
  cookieDomains: string[];
  gotoTimeout?: number;
  proxyConfiguration?: ProxyConfig;
  forceCloud?: boolean;
  userAgent?: string;
  headless?: boolean;
  storageName?: string;
  totpSecret?: string;
}

export interface Step {
  action: 'click' | 'type' | 'sleep' | 'totp';
  selector?: string;
  value?: string | number;
  eq?: 'first' | 'last' | number;
  visible?: boolean;
  pressEnter?: boolean;
  waitForNavigation?: boolean;
}

export interface ProxyConfig {
  useApifyProxy?: boolean;
  apifyProxyGroups?: string[];
}

declare module 'totp-generator' {
  export default function totp(secret: string): string;
}
