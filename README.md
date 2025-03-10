# **Session Extractor**

🚀 **Automates login flows and extracts session data** 
- cookies (including httpOnly)
- localStorage
- sessionStorage

## **🔹 Features**

- **Automates user actions** (click, type)
- **Extracts session data**
- 😍 **Saves screenshots before interactions** - makes debugging easier 
- **Supports custom User-Agent & Apify Proxy**

## **📥 Input Example**

```json
{
  "signInPageURL": "https://example.com/login",
  "steps": [
    { "action": "type", "selector": "#username", "value": "myUsername" },
    { "action": "type", "selector": "#password", "value": "mySecurePassword" },
    { "action": "click", "selector": "#login-button" }
  ],
  "cookieDomains": ["example.com"],
  "userAgent": "Mozilla/5.0 ..."
}
```

Session data will be stored in the default key-value store under the name `SESSION_DATA`.\
(storage name can be customized)

### Input options:

```aiignore
export interface InputSchema {
  // URL of the sign-in page
  signInPageURL: string;

  // List of user actions to perform
  steps: Step[];

  // List of domains to extract cookies from
  cookieDomains: string[];

  // Timeout for each page navigation
  gotoTimeout?: number;

  // Custom proxy configuration
  proxyConfiguration?: ProxyConfig;

  // Whether to use Apify Proxy
  forceCloud?: boolean;

  // Custom User-Agent
  userAgent?: string;

  // Whether to run in headless mode (default: false)
  headless?: boolean;
  
  // Custom storage name (default: 'SESSION_DATA')
  storageName?: string;
}
```

```
export interface Step {
  action: 'click' | 'type' | 'sleep';
  selector?: string;
  value?: string | number;
  
  // Element index if multiple elements are found
  eq?: 'first' | 'last' | number;
  
  // Whether element should be visible (default: true)
  visible?: boolean;
  
  // Press enter after typing value (default: false)
  pressEnter?: boolean;
  
  // Wait for navigation after step (default: false)
  waitForNavigation?: boolean;
}
```

```
export interface ProxyConfig {
  useApifyProxy?: boolean;
  apifyProxyGroups?: string[];
}
```
