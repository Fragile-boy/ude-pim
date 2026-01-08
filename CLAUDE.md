# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UDE-PIM** is a full-stack project and process information management system with a Vue.js 2 frontend and Java backend. It provides comprehensive project tracking, KPI management, team performance analytics, and approval workflows for managing projects, sub-processes, tasks, and team member scores.

## Common Development Commands

### Setup and Installation
```bash
npm install                    # Install all dependencies
```

### Development
```bash
npm run serve                  # Start dev server on http://localhost (port 80)
                               # Proxies API calls to http://localhost:8080
```

### Build
```bash
npm run build                  # Build for production
                               # Output: ude-pim/ directory
```

### Docker
```bash
docker build -t ude-pim .     # Build Docker image
docker run -p 80:80 ude-pim   # Run container
```

## Architecture Overview

### High-Level Architecture

**Frontend Stack:**
- Vue.js 2 SPA with Vue Router for client-side routing
- Vuex for centralized state management
- Element UI for UI components
- ECharts for data visualization
- Axios for HTTP communication with JWT authentication

**Backend Integration:**
- REST API communication via Axios
- JWT token stored in localStorage, sent in Authorization header
- Base URL: `http://localhost:8080` (dev) or `/api` (production, proxied by Nginx)
- 60-second request timeout

**Deployment:**
- Docker multi-stage build (Node.js builder → Nginx runtime)
- Nginx serves frontend and proxies `/api/` requests to backend on port 8080
- Relative public path (`./`) for flexible deployment

### Directory Structure

```
src/
├── api/                    # 25 API service modules organized by feature
│                           # Each module exports functions for API calls
│                           # Examples: case.js, caseSub.js, kpi.js, user.js
├── components/             # Reusable Vue components
│                           # Organized by feature: CaseComponents/, KpiComponents/, etc.
├── views/                  # Page-level components organized by feature
│                           # CaseViews/, CheckViews/, dataViews/, ManageViews/, UserViews/
├── store/                  # Vuex state management
│                           # Root store + modules: caseM.js, apply.js, log.js, etc.
├── router/                 # Vue Router configuration
├── plugins/                # Vue plugins (element.js, service.js for Axios)
├── utils/                  # Utility functions (common.js, exportExcel.js, storage.js)
├── css/                    # Global styles
├── main.js                 # Application entry point
└── App.vue                 # Root component
```

### Key Architectural Patterns

**API Layer Pattern:**
- Each feature has a dedicated API module in `src/api/`
- API functions use Axios with automatic JWT token injection
- Response interceptor handles authentication errors and returns data directly

**Component Organization:**
- Reusable components in `src/components/` (organized by feature)
- Page-level components in `src/views/` (organized by feature)
- Components use props for data input and emit events for communication

**State Management:**
- Root store manages user info and UI state (sidebar collapse)
- Feature modules in `src/store/modules/` manage feature-specific state
- Actions fetch data from API, mutations update state

**Routing:**
- Nested routes under `/common` for authenticated pages
- `/login` for authentication
- `/404` and `/403` for error pages

## Core Features

1. **Project Management** - Create, track, and manage projects/cases with status tracking
2. **Sub-process Management** - Break down projects into sub-processes with assignments
3. **Task Management** - Task assignment and tracking with approval workflows
4. **Approval Workflows** - Multi-step approvals for delays, exceptions, and completions
5. **KPI Tracking** - Individual and team KPI dashboards with trend analysis
6. **Score Management** - Track and manage team member scores and rankings
7. **Data Analytics** - Monthly analysis, case analysis, and team performance metrics
8. **User Management** - User administration and project assignments
9. **Issue Tracking** - Issue creation, discussion, and resolution
10. **Excel Export** - Export data to Excel format for reporting

## Technology Stack

**Frontend:**
- Vue.js 2.6.14 - Core framework
- Vue Router 3.5.1 - Client-side routing
- Vuex 3.6.2 - State management
- Element UI 2.4.5 - UI component library
- Axios 1.4.0 - HTTP client
- ECharts 5.4.3 - Data visualization
- Less 4.2.0 - CSS preprocessor
- xlsx 0.18.5 - Excel handling
- @kangc/v-md-editor 1.7.12 - Markdown editor

**Build & Deployment:**
- Vue CLI 5.0.0 - Build tooling
- Node.js 18 - Runtime
- Docker - Containerization
- Nginx - Web server and reverse proxy

## Environment Configuration

**Development (.env.development):**
```
VUE_APP_API_BASE_URL=http://localhost:8080
VUE_APP_IMAGE_DOWNLOAD_URL=http://localhost:8080/common/download?name=
```

**Production (.env.production):**
```
VUE_APP_API_BASE_URL=/api
VUE_APP_IMAGE_DOWNLOAD_URL=/api/common/download?name=
```

## Important Implementation Details

### HTTP Service (src/plugins/service.js)
- Automatically injects JWT token from localStorage into Authorization header
- Handles "NOTLOGIN" responses by redirecting to login
- Returns response data directly (not wrapped in response object)
- 60-second timeout for all requests

### Vuex Store Pattern
- Root store: User info, UI state
- Feature modules: Feature-specific state, actions, mutations
- Actions call API functions and commit mutations
- Getters provide computed state values

### Component Communication
- Parent to child: Props
- Child to parent: Events (emit)
- Sibling/global: Vuex store
- HTTP: Axios via API modules

### Routing
- Nested routes under `/common` for authenticated pages
- Route guards should check user authentication via store
- 404 and 403 pages for error handling

## Common Patterns and Conventions

**API Module Pattern:**
```javascript
// src/api/example.js
import service from '@/plugins/service'

export function getExample() {
  return service.get('/example')
}

export function createExample(data) {
  return service.post('/example', data)
}
```

**Component Pattern:**
```vue
<template>
  <div class="component">
    <!-- Template -->
  </div>
</template>

<script>
import { getExample } from '@/api/example'

export default {
  name: 'ExampleComponent',
  props: {
    // Props
  },
  data() {
    return {
      // Data
    }
  },
  methods: {
    async loadData() {
      const data = await getExample()
      // Handle data
    }
  }
}
</script>

<style scoped>
/* Styles */
</style>
```

**Vuex Module Pattern:**
```javascript
// src/store/modules/example.js
const state = {
  items: []
}

const mutations = {
  setItems(state, items) {
    state.items = items
  }
}

const actions = {
  async fetchItems({ commit }) {
    const items = await getExample()
    commit('setItems', items)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
```

## Git Workflow

**Current Branch:** `designeHome`
**Main Branch:** `master`

Recent commits focus on KPI features, project tracking, and team management enhancements. Build artifacts are generated in the `ude-pim/` directory.

## Notes for Future Development

- **No testing framework** is currently configured. Consider adding Jest or Vitest if testing is needed.
- **API modules** are well-organized by feature. Follow the existing pattern when adding new API endpoints.
- **Component organization** by feature makes it easy to locate related components.
- **Vuex modules** are namespaced. Use `mapState`, `mapActions`, etc. with module names when accessing store.
- **Environment variables** are used for API configuration. Update `.env.development` and `.env.production` when changing API endpoints.
- **Docker deployment** uses Nginx to proxy API requests. Ensure backend is accessible at `http://pim:8080` in production.
