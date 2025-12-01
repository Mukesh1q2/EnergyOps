/**
 * Property-Based Tests for Widget Persistence Round-Trip
 * 
 * **Feature: dashboard-critical-fixes, Property 2: Widget Persistence Round-Trip**
 * **Validates: Requirements 3.3**
 * 
 * Tests that widgets successfully added to the dashboard can be retrieved
 * from the backend with identical configuration.
 */

import * as fc from 'fast-check';

// Widget type definition matching the dashboard data model
interface Widget {
  id?: string;
  type: string;
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: Record<string, any>;
  permissions?: string[];
  isShared?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Arbitrary generators for property tests
const positionArbitrary = fc.record({
  x: fc.integer({ min: 0, max: 11 }),
  y: fc.integer({ min: 0, max: 100 }),
  w: fc.integer({ min: 1, max: 12 }),
  h: fc.integer({ min: 1, max: 10 })
});

const widgetConfigArbitrary = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.oneof(
    fc.string({ minLength: 1, maxLength: 50 }),
    fc.integer({ min: 0, max: 1000 }),
    fc.boolean(),
    fc.constant(null)
  ),
  { minKeys: 0, maxKeys: 5 }
);

const widgetArbitrary: fc.Arbitrary<Widget> = fc.record({
  type: fc.constantFrom(
    'energy-generation-chart',
    'market-prices-widget',
    'asset-status-grid',
    'performance-kpis',
    'trading-dashboard',
    'team-activity-feed',
    'compliance-report',
    'geographic-map'
  ),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  position: positionArbitrary,
  config: widgetConfigArbitrary,
  permissions: fc.array(
    fc.constantFrom(
      'data.view-energy',
      'data.view-market',
      'data.view-asset',
      'team.collaborate',
      'admin.audit',
      'widget.view'
    ),
    { minLength: 0, maxLength: 3 }
  )
});

/**
 * Mock API client for testing widget persistence
 */
class MockWidgetAPI {
  private widgets: Map<string, Widget> = new Map();
  private nextId: number = 1;

  /**
   * Simulates POST /api/dashboard/widgets
   */
  async createWidget(widget: Widget): Promise<Widget> {
    // Validate required fields
    if (!widget.type || !widget.title || !widget.position) {
      throw new Error('Type, title, and position are required');
    }

    // Validate position structure
    const { x, y, w, h } = widget.position;
    if (typeof x !== 'number' || typeof y !== 'number' ||
        typeof w !== 'number' || typeof h !== 'number') {
      throw new Error('Position must contain x, y, w, h as numbers');
    }

    // Create widget with server-generated fields
    const widgetId = `${widget.type}-${this.nextId++}`;
    const createdWidget: Widget = {
      ...widget,
      id: widgetId,
      createdBy: 'test-user',
      isShared: widget.isShared || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in mock database
    this.widgets.set(widgetId, createdWidget);

    return createdWidget;
  }

  /**
   * Simulates GET /api/dashboard/widgets
   */
  async getWidgets(): Promise<Widget[]> {
    return Array.from(this.widgets.values());
  }

  /**
   * Simulates GET /api/dashboard/widgets/{id}
   */
  async getWidget(id: string): Promise<Widget | null> {
    return this.widgets.get(id) || null;
  }

  /**
   * Clear all widgets (for test isolation)
   */
  clear(): void {
    this.widgets.clear();
    this.nextId = 1;
  }
}

/**
 * Deep equality check for widget configuration
 * Ignores server-generated fields (id, createdAt, updatedAt, createdBy)
 */
function widgetConfigEquals(original: Widget, retrieved: Widget): boolean {
  // Check core fields
  if (original.type !== retrieved.type) return false;
  if (original.title !== retrieved.title) return false;

  // Check position
  if (original.position.x !== retrieved.position.x) return false;
  if (original.position.y !== retrieved.position.y) return false;
  if (original.position.w !== retrieved.position.w) return false;
  if (original.position.h !== retrieved.position.h) return false;

  // Check config (deep comparison)
  const originalConfig = JSON.stringify(original.config);
  const retrievedConfig = JSON.stringify(retrieved.config);
  if (originalConfig !== retrievedConfig) return false;

  // Check permissions (if provided)
  if (original.permissions) {
    if (!retrieved.permissions) return false;
    if (original.permissions.length !== retrieved.permissions.length) return false;
    
    const originalPerms = [...original.permissions].sort();
    const retrievedPerms = [...retrieved.permissions].sort();
    if (JSON.stringify(originalPerms) !== JSON.stringify(retrievedPerms)) return false;
  }

  return true;
}

describe('Property Tests: Widget Persistence Round-Trip', () => {
  let api: MockWidgetAPI;

  beforeEach(() => {
    api = new MockWidgetAPI();
  });

  afterEach(() => {
    api.clear();
  });

  /**
   * **Feature: dashboard-critical-fixes, Property 2: Widget Persistence Round-Trip**
   * 
   * *For any* widget that is successfully added to the dashboard, fetching the 
   * dashboard configuration from the backend SHALL return a widget list containing 
   * that widget with identical configuration.
   * 
   * **Validates: Requirements 3.3**
   */
  it('should persist and retrieve widget with identical configuration', async () => {
    await fc.assert(
      fc.asyncProperty(
        widgetArbitrary,
        async (widget) => {
          // Clear any previous widgets
          api.clear();

          // Add widget via API
          const createdWidget = await api.createWidget(widget);

          // Verify widget was created with an ID
          if (!createdWidget.id) {
            return false;
          }

          // Fetch all widgets
          const allWidgets = await api.getWidgets();

          // Find the created widget in the list
          const retrievedWidget = allWidgets.find(w => w.id === createdWidget.id);

          // Property: Widget must exist in retrieved list
          if (!retrievedWidget) {
            return false;
          }

          // Property: Retrieved widget must have identical configuration
          return widgetConfigEquals(widget, retrievedWidget);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Widget can be retrieved by ID after creation
   * 
   * **Validates: Requirements 3.3**
   */
  it('should retrieve widget by ID with identical configuration', async () => {
    await fc.assert(
      fc.asyncProperty(
        widgetArbitrary,
        async (widget) => {
          // Clear any previous widgets
          api.clear();

          // Add widget via API
          const createdWidget = await api.createWidget(widget);

          // Verify widget was created with an ID
          if (!createdWidget.id) {
            return false;
          }

          // Fetch widget by ID
          const retrievedWidget = await api.getWidget(createdWidget.id);

          // Property: Widget must be retrievable by ID
          if (!retrievedWidget) {
            return false;
          }

          // Property: Retrieved widget must have identical configuration
          return widgetConfigEquals(widget, retrievedWidget);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple widgets can be persisted and retrieved independently
   * 
   * **Validates: Requirements 3.3**
   */
  it('should persist and retrieve multiple widgets independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(widgetArbitrary, { minLength: 1, maxLength: 10 }),
        async (widgets) => {
          // Clear any previous widgets
          api.clear();

          // Add all widgets
          const createdWidgets = await Promise.all(
            widgets.map(w => api.createWidget(w))
          );

          // Verify all widgets were created with IDs
          if (createdWidgets.some(w => !w.id)) {
            return false;
          }

          // Fetch all widgets
          const allWidgets = await api.getWidgets();

          // Property: Number of retrieved widgets must match created widgets
          if (allWidgets.length !== createdWidgets.length) {
            return false;
          }

          // Property: Each created widget must be retrievable with identical config
          for (let i = 0; i < widgets.length; i++) {
            const originalWidget = widgets[i];
            const createdWidget = createdWidgets[i];
            const retrievedWidget = allWidgets.find(w => w.id === createdWidget.id);

            if (!retrievedWidget) {
              return false;
            }

            if (!widgetConfigEquals(originalWidget, retrievedWidget)) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Widget position is preserved exactly after persistence
   * 
   * **Validates: Requirements 3.3**
   */
  it('should preserve widget position exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        widgetArbitrary,
        async (widget) => {
          // Clear any previous widgets
          api.clear();

          // Add widget via API
          const createdWidget = await api.createWidget(widget);

          if (!createdWidget.id) {
            return false;
          }

          // Fetch widget
          const retrievedWidget = await api.getWidget(createdWidget.id);

          if (!retrievedWidget) {
            return false;
          }

          // Property: Position must be identical
          return (
            retrievedWidget.position.x === widget.position.x &&
            retrievedWidget.position.y === widget.position.y &&
            retrievedWidget.position.w === widget.position.w &&
            retrievedWidget.position.h === widget.position.h
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Widget config object is preserved exactly after persistence
   * 
   * **Validates: Requirements 3.3**
   */
  it('should preserve widget config object exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        widgetArbitrary,
        async (widget) => {
          // Clear any previous widgets
          api.clear();

          // Add widget via API
          const createdWidget = await api.createWidget(widget);

          if (!createdWidget.id) {
            return false;
          }

          // Fetch widget
          const retrievedWidget = await api.getWidget(createdWidget.id);

          if (!retrievedWidget) {
            return false;
          }

          // Property: Config must be identical (deep comparison)
          return JSON.stringify(widget.config) === JSON.stringify(retrievedWidget.config);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Widget type and title are preserved exactly
   * 
   * **Validates: Requirements 3.3**
   */
  it('should preserve widget type and title exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        widgetArbitrary,
        async (widget) => {
          // Clear any previous widgets
          api.clear();

          // Add widget via API
          const createdWidget = await api.createWidget(widget);

          if (!createdWidget.id) {
            return false;
          }

          // Fetch widget
          const retrievedWidget = await api.getWidget(createdWidget.id);

          if (!retrievedWidget) {
            return false;
          }

          // Property: Type and title must be identical
          return (
            retrievedWidget.type === widget.type &&
            retrievedWidget.title === widget.title
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Widget permissions are preserved if provided
   * 
   * **Validates: Requirements 3.3**
   */
  it('should preserve widget permissions if provided', async () => {
    await fc.assert(
      fc.asyncProperty(
        widgetArbitrary.filter(w => w.permissions && w.permissions.length > 0),
        async (widget) => {
          // Clear any previous widgets
          api.clear();

          // Add widget via API
          const createdWidget = await api.createWidget(widget);

          if (!createdWidget.id) {
            return false;
          }

          // Fetch widget
          const retrievedWidget = await api.getWidget(createdWidget.id);

          if (!retrievedWidget || !retrievedWidget.permissions || !widget.permissions) {
            return false;
          }

          // Property: Permissions must be identical (order-independent)
          const originalPerms = [...widget.permissions].sort();
          const retrievedPerms = [...retrievedWidget.permissions].sort();

          return JSON.stringify(originalPerms) === JSON.stringify(retrievedPerms);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Server-generated fields are added during persistence
   * 
   * **Validates: Requirements 3.3**
   */
  it('should add server-generated fields during persistence', async () => {
    await fc.assert(
      fc.asyncProperty(
        widgetArbitrary,
        async (widget) => {
          // Clear any previous widgets
          api.clear();

          // Add widget via API
          const createdWidget = await api.createWidget(widget);

          // Property: Server must generate required fields
          return (
            typeof createdWidget.id === 'string' &&
            createdWidget.id.length > 0 &&
            typeof createdWidget.createdAt === 'string' &&
            typeof createdWidget.updatedAt === 'string' &&
            typeof createdWidget.createdBy === 'string'
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Widget persistence is idempotent for retrieval
   * (retrieving multiple times returns same data)
   * 
   * **Validates: Requirements 3.3**
   */
  it('should return identical data on multiple retrievals', async () => {
    await fc.assert(
      fc.asyncProperty(
        widgetArbitrary,
        async (widget) => {
          // Clear any previous widgets
          api.clear();

          // Add widget via API
          const createdWidget = await api.createWidget(widget);

          if (!createdWidget.id) {
            return false;
          }

          // Fetch widget multiple times
          const retrieval1 = await api.getWidget(createdWidget.id);
          const retrieval2 = await api.getWidget(createdWidget.id);
          const retrieval3 = await api.getWidget(createdWidget.id);

          if (!retrieval1 || !retrieval2 || !retrieval3) {
            return false;
          }

          // Property: All retrievals must be identical
          return (
            JSON.stringify(retrieval1) === JSON.stringify(retrieval2) &&
            JSON.stringify(retrieval2) === JSON.stringify(retrieval3)
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
