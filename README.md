# **Session Extractor**

🚀 **Automates login flows and extracts session data** 
- cookies (including httpOnly)
- localStorage
- sessionStorage

## **🔹 Features**

- **Automates user actions** (click, type, sleep, TOTP)
- **Extracts session data**
- 😍 **Saves screenshots before interactions** - makes debugging easier 
- **Supports custom User-Agent & Apify Proxy**
- **Smart element selection** - handles multiple elements with index or position
- **Two-Factor Authentication** - supports TOTP code generation

## **📥 Input Example**

```json
{
  "signInPageURL": "https://example.com/login",
  "steps": [
    { "action": "type", "selector": "#username", "value": "myUsername" },
    { "action": "type", "selector": "#password", "value": "mySecurePassword" },
    { "action": "click", "selector": "#login-button" },
    { "action": "sleep", "value": 2000 },
    { "action": "totp", "selector": "#totp-input", "pressEnter": true }
  ],
  "cookieDomains": ["example.com"],
  "userAgent": "Mozilla/5.0 ...",
  "totpSecret": "YOUR_TOTP_SECRET"
}
```

Session data will be stored in the default key-value store under the name `SESSION_DATA`.\
(storage name can be customized)

### Input options:

```typescript
export interface InputSchema {
  // URL of the sign-in page
  signInPageURL: string;

  // List of user actions to perform
  steps: Step[];

  // List of domains to extract cookies from
  cookieDomains: string[];

  // Timeout for each page navigation (default: 30)
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

  // Secret key for TOTP code generation
  totpSecret?: string;
}
````

```typescript
export interface Step {
  // Action to perform: 'click', 'type', 'sleep', or 'totp'
  action: 'click' | 'type' | 'sleep' | 'totp';

  // CSS selector for the element
  selector?: string;

  // Value to type or sleep duration in milliseconds
  value?: string | number;
  
  // Element index if multiple elements are found
  // Can be a number, 'first', or 'last'
  eq?: 'first' | 'last' | number;
  
  // Whether element should be visible (default: true)
  visible?: boolean;
  
  // Press enter after typing value (default: false)
  pressEnter?: boolean;
  
  // Wait for navigation after step (default: false)
  waitForNavigation?: boolean;

  // Whether the step is optional (won't fail if element not found)
  optional?: boolean;
}
```

```typescript
export interface ProxyConfig {
  useApifyProxy?: boolean;
  apifyProxyGroups?: string[];
}
```

## **🔍 Action Examples**

### Click Action
```json
// Simple click
{ "action": "click", "selector": "#submit-button" }

// Click second element when multiple matches exist
{ "action": "click", "selector": ".login-button", "eq": 1 }

// Click last element in a list
{ "action": "click", "selector": ".pagination-item", "eq": "last" }

// Click and wait for navigation
{ "action": "click", "selector": "#submit", "waitForNavigation": true }

// Optional click (won't fail if element not found)
{ "action": "click", "selector": "#cookie-banner", "optional": true }
```

### Type Action
```json
// Simple typing
{ "action": "type", "selector": "#username", "value": "user@example.com" }

// Type and press Enter
{ "action": "type", "selector": "#password", "value": "password123", "pressEnter": true }

// Type into a specific input when multiple exist
{ "action": "type", "selector": ".input-field", "eq": "first", "value": "test" }

// Optional type (won't fail if element not found)
{ "action": "type", "selector": "#optional-field", "value": "test", "optional": true }

// Type and wait for navigation (useful for forms)
{ "action": "type", "selector": "#search", "value": "query", "pressEnter": true, "waitForNavigation": true }
```

### Sleep Action
```json
// Wait for 2 seconds
{ "action": "sleep", "value": 2000 }

// Wait for 5 seconds (e.g., for animations or loading)
{ "action": "sleep", "value": 5000 }
```

### TOTP Action
```json
// Generate and enter TOTP code
{ "action": "totp", "selector": "#totp-input" }

// Generate TOTP code, enter it, and press Enter
{ "action": "totp", "selector": "#totp-input", "pressEnter": true }

// Generate TOTP code and wait for navigation after submission
{ "action": "totp", "selector": "#totp-input", "pressEnter": true, "waitForNavigation": true }
```

## **📸 Screenshots**

The actor automatically takes screenshots before each interaction, making it easier to debug issues. Screenshots are saved with timestamps in the key-value store:
```
screenshot_1234567890.png
```

## **🔐 Session Data Example**

The extracted session data will look like this:
```json
{
  "cookies": {
    "example.com": [
      {
        "name": "sessionId",
        "value": "abc123",
        "domain": "example.com",
        "path": "/",
        "expires": 1234567890,
        "httpOnly": true,
        "secure": true
      }
    ]
  },
  "localStorage": {
    "theme": "dark",
    "user": "{\"id\":123,\"name\":\"John\"}"
  },
  "sessionStorage": {
    "lastPage": "/dashboard"
  }
}
```

## **🚀 Advanced Usage**

### Multi-Step Authentication
```json
{
  "signInPageURL": "https://example.com/login",
  "steps": [
    { "action": "type", "selector": "#username", "value": "user@example.com" },
    { "action": "type", "selector": "#password", "value": "password123", "pressEnter": true },
    { "action": "sleep", "value": 2000 },
    { "action": "totp", "selector": "#totp-input", "pressEnter": true, "waitForNavigation": true }
  ],
  "cookieDomains": ["example.com"],
  "totpSecret": "YOUR_TOTP_SECRET"
}
```

### Multiple Domain Session Extraction
```json
{
  "signInPageURL": "https://app.example.com/login",
  "steps": [
    { "action": "type", "selector": "#email", "value": "user@example.com" },
    { "action": "type", "selector": "#password", "value": "password123" },
    { "action": "click", "selector": "#submit" }
  ],
  "cookieDomains": [
    "app.example.com",
    "api.example.com",
    "auth.example.com"
  ]
}
```

### Custom Element Selection
```json
{
  "steps": [
    // Select first matching element
    { "action": "click", "selector": ".login-option", "eq": "first" },
    
    // Select last matching element
    { "action": "click", "selector": ".consent-button", "eq": "last" },
    
    // Select element by index (0-based)
    { "action": "type", "selector": ".input-field", "eq": 2, "value": "test" }
  ]
}
```

### Optional Steps Example
```json
{
  "signInPageURL": "https://example.com/login",
  "steps": [
    // Handle cookie consent popup if present
    { "action": "click", "selector": "#accept-cookies", "optional": true },
    
    // Close promotional overlay if it appears
    { "action": "click", "selector": ".promo-close-button", "optional": true },
    
    // Proceed with normal login flow
    { "action": "type", "selector": "#email", "value": "user@example.com" },
    { "action": "type", "selector": "#password", "value": "password123" },
    
    // Some sites have an optional 2FA reminder skip button
    { "action": "click", "selector": "#skip-2fa-setup", "optional": true },
    
    { "action": "click", "selector": "#login-button", "waitForNavigation": true }
  ],
  "cookieDomains": ["example.com"]
}
```
