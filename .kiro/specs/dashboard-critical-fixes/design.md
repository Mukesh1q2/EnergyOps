# Design Document

## Overview

This design document outlines the technical approach to resolving five critical production-blocking issues in the OptiBid Energy Dashboard application. The dashboard is a React-based Next.js application using TypeScript, featuring a modular widget system with drag-and-drop layout capabilities powered by react-grid-layout. The application follows a client-server architecture with RESTful API endpoints for data persistence.

The critical issues stem from three main categories:
1. **Code Quality Issues**: Syntax errors and improper error handling
2. **State Management Problems**: Inconsistent state synchronization between UI and backend
3. **API Integration Gaps**: Missing or incomplete API request/response handling

This design focuses on minimal, surgical fixes to restore production readiness while maintaining existing functionality and avoiding architectural changes.

## Architecture

### Current System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
├─────────────────────────────────────────────────────────────┤
│  Dashboard Page (page.tsx)                                   │
│    ├── DashboardLayout Component                             │
│    │     ├── WidgetRenderer (displays widgets)               │
│    │     ├── DashboardSettings Modal                         │
│    │     ├── FeatureSettings Modal                           │
│    │     └── ShareDashboard Modal                            │
│    ├── WidgetLibrary Modal                                   │
│    └── TeamCollaboration Panel                               │
├─────────────────────────────────────────────────────────────┤
│                   State Management                           │
│    ├── React useState hooks                                  │
│    ├── useAuth context                                       │
│    └── useFeatureFlags context                               │
├─────────────────────────────────────────────────────────────┤
│                     API Layer                                │
│    ├── /api/dashboard/user-config (GET, POST, PUT, DELETE)  │
│    ├── /api/dashboard/widgets (GET, POST, PUT, DELETE)      │
│    ├── /api/dashboard/layout (GET, POST, PUT, DELETE)       │
│    └── /api/dashboard/config (POST)                         │
├─────────────────────────────────────────────────────────────┤
│                   Backend Services                           │
│    ├── Authentication (verifyAuthToken)                     │
│    ├── Feature Flag Service                                 │
│    └── Mock Data Stores (in-memory)                         │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action → Component Event Handler → State Update → API Call → Backend Processing → Response → State Update → UI Re-render
```

**Current Problem**: This flow is broken at multiple points:
- Event handlers trigger unintended state mutations (scroll events)
- API calls are not being made (widget addition)
- API responses are not updating state (settings persistence)
- Error boundaries are missing (share component)

## Components and Interfaces

### 1. Dashboard Page Component (`page.tsx`)

**Current Issues**:
- No compilation errors found in current code (reported issue may be stale)
- Widget addition handler exists but state update may not trigger re-render
- Settings update handler calls wrong endpoint

**Key Functions**:
```typescript
loadDashboardData(): Promise<void>
  - Fetches user dashboard configuration
  - Updates dashboardData state
  - Issue: May not handle all response formats

handleWidgetAdd(widgetConfig: any): Promise<void>
  - Creates new widget via API
  - Updates local state with new widget
  - Issue: State update may not trigger re-render

handleLayoutUpdate(newLayout: any): Promise<void>
  - Saves dashboard configuration
  - Issue: Calls /api/dashboard/config instead of /api/dashboard/user-config
```

### 2. DashboardLayout Component

**Current Issues**:
- Scroll events in modals may trigger layout recalculations
- Share component lacks error boundary
- Settings modal doesn't properly propagate updates

**Key Functions**:
```typescript
handleLayoutChange(layout: any, layouts: any): void
  - Updates widget positions
  - Calls onLayoutUpdate callback
  - Issue: May be called during scroll events

handleWidgetAction(widgetId: string, action: string, data?: any): void
  - Handles widget operations (resize, delete, duplicate)
  - Issue: Some actions may not persist
```

### 3. DashboardSettings Component

**Current Issues**:
- Settings changes update local state but don't persist
- onUpdate callback receives settings but doesn't save to backend

**Key State**:
```typescript
interface Settings {
  name: string
  description: string
  theme: string
  language: string
  timezone: string
  currency: string
  autoRefresh: string
  notifications: { [key: string]: boolean }
  privacy: { [key: string]: boolean }
  performance: { [key: string]: any }
  accessibility: { [key: string]: any }
}
```

**Issue**: `handleSave()` calls `onUpdate(settings)` which calls `onLayoutUpdate()` in parent, but this only updates layout, not full configuration.

### 4. FeatureSettings Component

**Current Issues**:
- Feature toggles update local state but may not persist to backend
- Scroll events in modal may trigger parent component issues

**Key Functions**:
```typescript
handleFeatureToggle(featureId: string, enabled: boolean): Promise<void>
  - Updates local state
  - Should call featureFlagService.setFeature()
  - Issue: May not be persisting

handleSaveChanges(): Promise<void>
  - Bulk saves all feature changes
  - Calls featureFlagService.setBulkFeatures()
  - Issue: May not be awaiting completion
```

### 5. ShareDashboard Component

**Current Issue**: Component crashes when rendered

**Required Fix**: Add error boundary wrapper or implement graceful fallback

## Data Models

### Widget Model
```typescript
interface Widget {
  id: string                    // Unique identifier
  type: string                  // Widget type (e.g., 'energy-generation-chart')
  title: string                 // Display title
  position: {                   // Grid position
    x: number
    y: number
    w: number                   // Width in grid units
    h: number                   // Height in grid units
  }
  config: any                   // Widget-specific configuration
  permissions: string[]         // Required permissions
  isShared?: boolean           // Sharing status
  createdBy?: string           // Creator user ID
  createdAt?: string           // ISO timestamp
  updatedAt?: string           // ISO timestamp
}
```

### Dashboard Configuration Model
```typescript
interface DashboardConfig {
  id: string
  name: string
  description?: string
  widgets: Widget[]
  layout: 'grid' | 'flex'
  theme: 'light' | 'dark' | 'auto'
  autoRefresh?: string         // '30s' | '1m' | '5m' | '15m' | '30m' | '1h' | 'off'
  language?: string
  timezone?: string
  currency?: string
  permissions: string[]
  sharedWith?: string[]
  createdAt: string
  updatedAt: string
}
```

### API Response Models
```typescript
interface APIResponse<T> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

interface WidgetAPIResponse extends APIResponse<Widget> {}
interface DashboardAPIResponse extends APIResponse<DashboardConfig> {}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Scroll/Interaction State Immutability

*For any* dashboard state containing widgets, when scroll events or non-modifying user interactions occur within modals (Feature Settings, Dashboard Settings), the widget array and widget configurations SHALL remain unchanged.

**Validates: Requirements 2.1, 2.3, 2.4**

### Property 2: Widget Persistence Round-Trip

*For any* widget that is successfully added to the dashboard, fetching the dashboard configuration from the backend SHALL return a widget list containing that widget with identical configuration.

**Validates: Requirements 3.3**

### Property 3: Widget Addition Display Update

*For any* successful widget creation API response, the dashboard widget count SHALL increase by exactly one, and the rendered dashboard SHALL display the newly added widget.

**Validates: Requirements 3.2, 3.6**

### Property 4: Settings Persistence Round-Trip

*For any* dashboard settings (name, language, timezone, currency) that are saved via the Save Changes button, reopening the Dashboard Settings modal SHALL display those exact saved values.

**Validates: Requirements 4.1, 4.2, 4.5**

### Property 5: Feature Flag Persistence Round-Trip

*For any* feature flag toggle that is saved successfully, reloading the page and opening Feature Settings SHALL display the saved toggle state.

**Validates: Requirements 5.2, 5.3**

### Property 6: Share Modal Stability

*For any* dashboard state, clicking the Share button SHALL not throw errors, SHALL maintain chart data visibility, and closing the modal SHALL return to normal dashboard operation without state changes.

**Validates: Requirements 6.1, 6.3, 6.5**

### Property 7: Error Boundary Fallback

*For any* error thrown within the Share component, the error boundary SHALL catch the error and display a fallback error message instead of crashing the application.

**Validates: Requirements 6.2**

### Property 8: API Error Message Display

*For any* API request that returns an error response, the system SHALL display a user-friendly error message to the user.

**Validates: Requirements 7.1**

### Property 9: Authentication Failure Redirect

*For any* API response with status code 401 (Unauthorized), the system SHALL redirect the user to the login page.

**Validates: Requirements 7.3**

### Property 10: Optimistic Update Rollback

*For any* optimistic UI update followed by an API request failure, the system SHALL revert the UI state to the value before the optimistic update.

**Validates: Requirements 8.5**

### Property 11: Authorization Header Format

*For any* fetch request that includes authentication, the Authorization header SHALL be formatted as "Bearer {token}" where {token} is a valid JWT string.

**Validates: Requirements 1.3**

### Property 12: Widget API Request Validation

*For any* widget configuration submitted via the Add Widget flow, the API request body SHALL contain all required fields: type, title, position (with x, y, w, h), and config.

**Validates: Requirements 3.5**

## Error Handling

### Error Handling Strategy

The dashboard implements a multi-layer error handling approach:

#### 1. Component-Level Error Boundaries

```typescript
// ErrorBoundary wrapper for crash-prone components
class DashboardErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard component error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
```

#### 2. API Error Handling

```typescript
// Centralized API error handler
async function handleAPIResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    if (response.status === 503) {
      throw new Error('Service temporarily unavailable. Please try again.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${response.status}`);
  }
  return response.json();
}
```

#### 3. State Update Error Handling

```typescript
// Safe state update with rollback
async function safeStateUpdate<T>(
  optimisticUpdate: () => void,
  apiCall: () => Promise<T>,
  rollback: () => void
): Promise<T> {
  optimisticUpdate();
  try {
    return await apiCall();
  } catch (error) {
    rollback();
    throw error;
  }
}
```

### Error Types and Responses

| Error Type | HTTP Status | User Message | Action |
|------------|-------------|--------------|--------|
| Authentication | 401 | "Session expired" | Redirect to login |
| Authorization | 403 | "Permission denied" | Show error toast |
| Validation | 400 | Field-specific messages | Highlight fields |
| Not Found | 404 | "Resource not found" | Show error state |
| Server Error | 500 | "Something went wrong" | Show retry option |
| Network | N/A | "Connection lost" | Show retry option |
| Service Unavailable | 503 | "Service unavailable" | Show retry with countdown |

## Testing Strategy

### Dual Testing Approach

This project uses both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property-based tests** verify universal properties that should hold across all inputs

### Testing Framework

- **Unit Testing**: Jest with React Testing Library
- **Property-Based Testing**: fast-check (JavaScript PBT library)
- **Minimum Iterations**: 100 runs per property test

### Unit Test Coverage

#### Component Tests

```typescript
// Example: DashboardSettings component test
describe('DashboardSettings', () => {
  it('should call onUpdate with new settings when Save is clicked', async () => {
    const onUpdate = jest.fn();
    render(<DashboardSettings settings={mockSettings} onUpdate={onUpdate} />);
    
    fireEvent.change(screen.getByLabelText('Dashboard Name'), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByText('Save Changes'));
    
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' }));
  });
});
```

#### API Integration Tests

```typescript
// Example: Widget addition API test
describe('Widget Addition', () => {
  it('should POST widget configuration to API', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    await addWidget(mockWidgetConfig);
    
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/dashboard/widgets',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining(mockWidgetConfig.type)
      })
    );
  });
});
```

### Property-Based Test Coverage

Each correctness property from the design document will be implemented as a property-based test using fast-check.

```typescript
// Example: Property 1 - Scroll/Interaction State Immutability
import * as fc from 'fast-check';

describe('Property Tests', () => {
  // **Feature: dashboard-critical-fixes, Property 1: Scroll/Interaction State Immutability**
  it('should preserve widget state during scroll events', () => {
    fc.assert(
      fc.property(
        fc.array(widgetArbitrary, { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 1000 }),
        (widgets, scrollPosition) => {
          const initialState = { widgets: [...widgets] };
          simulateScroll(scrollPosition);
          const finalState = getWidgetState();
          
          return deepEqual(initialState.widgets, finalState.widgets);
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Feature: dashboard-critical-fixes, Property 4: Settings Persistence Round-Trip**
  it('should persist and retrieve settings correctly', () => {
    fc.assert(
      fc.property(
        settingsArbitrary,
        async (settings) => {
          await saveSettings(settings);
          const retrieved = await loadSettings();
          
          return (
            retrieved.name === settings.name &&
            retrieved.language === settings.language &&
            retrieved.timezone === settings.timezone &&
            retrieved.currency === settings.currency
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Feature: dashboard-critical-fixes, Property 11: Authorization Header Format**
  it('should format Authorization header correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 500 }),
        (token) => {
          const header = formatAuthHeader(token);
          return header === `Bearer ${token}` && header.startsWith('Bearer ');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Arbitraries (Generators)

```typescript
// Widget arbitrary for property tests
const widgetArbitrary = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('energy-generation-chart', 'market-prices', 'asset-status', 'performance-kpis'),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  position: fc.record({
    x: fc.integer({ min: 0, max: 11 }),
    y: fc.integer({ min: 0, max: 100 }),
    w: fc.integer({ min: 1, max: 12 }),
    h: fc.integer({ min: 1, max: 10 })
  }),
  config: fc.object()
});

// Settings arbitrary for property tests
const settingsArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  language: fc.constantFrom('en', 'es', 'fr', 'hi'),
  timezone: fc.constantFrom('UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata'),
  currency: fc.constantFrom('USD', 'EUR', 'GBP', 'INR')
});
```

### Test Organization

```
enterprise-marketing/
├── __tests__/
│   ├── unit/
│   │   ├── components/
│   │   │   ├── DashboardSettings.test.tsx
│   │   │   ├── FeatureSettings.test.tsx
│   │   │   ├── ShareDashboard.test.tsx
│   │   │   └── WidgetLibrary.test.tsx
│   │   └── api/
│   │       ├── dashboard-config.test.ts
│   │       └── widgets.test.ts
│   └── property/
│       ├── state-immutability.property.test.ts
│       ├── persistence-roundtrip.property.test.ts
│       ├── error-handling.property.test.ts
│       └── api-validation.property.test.ts
└── jest.config.js
```

### Test Execution

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- --testPathPattern=unit

# Run property tests only
npm test -- --testPathPattern=property

# Run with coverage
npm test -- --coverage
```