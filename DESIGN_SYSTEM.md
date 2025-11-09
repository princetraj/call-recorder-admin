# Call Logs Admin - Complete Design System Documentation

## Table of Contents
1. [Color Palette](#color-palette)
2. [Technology Stack](#technology-stack)
3. [Design System Components](#design-system-components)
4. [Layout Architecture](#layout-architecture)
5. [Typography & Spacing](#typography--spacing)
6. [UI Patterns](#ui-patterns)
7. [Implementation Guide](#implementation-guide)
8. [Design Principles](#design-principles)

---

## 1. 🎨 Color Palette

### Primary Colors (Rose/Red)
The primary color scheme uses rose/red tones to convey importance and create a vibrant, modern interface.

| Shade | Hex Code | Usage |
|-------|----------|-------|
| rose-50 | `#fff1f2` | Lightest background, hover states |
| rose-100 | `#ffe4e6` | Light backgrounds, badges |
| rose-200 | `#fecdd3` | Borders, dividers |
| rose-300 | `#fda4af` | Disabled states, secondary text |
| rose-400 | `#fb7185` | Hover states, accents |
| rose-500 | `#f43f5e` | Primary brand color, links |
| rose-600 | `#e11d48` | **Primary buttons, main actions** |
| rose-700 | `#be123c` | Button hover states |
| rose-800 | `#9f1239` | Button active states, dark accents |
| rose-900 | `#881337` | Darkest accents, headings |

### Neutral Colors (Gray Scale)
Used for text, backgrounds, borders, and neutral UI elements.

| Shade | Hex Code | Usage |
|-------|----------|-------|
| neutral-50 | `#fafafa` | Page background, subtle highlights |
| neutral-100 | `#f5f5f5` | Card backgrounds, secondary backgrounds |
| neutral-200 | `#e5e5e5` | Borders, dividers, disabled backgrounds |
| neutral-300 | `#d4d4d4` | Input borders, inactive elements |
| neutral-400 | `#a3a3a3` | Placeholder text, icons |
| neutral-500 | `#737373` | Secondary text, captions |
| neutral-600 | `#525252` | Body text, labels |
| neutral-700 | `#404040` | Headings, important text |
| neutral-800 | `#262626` | Primary text, emphasis |
| neutral-900 | `#171717` | Highest contrast text |

### Semantic Colors
Purpose-specific colors for different states and feedback.

#### Success (Green)
- **Light**: `#10b981` - Success backgrounds, hover states
- **Default**: `#059669` - Success icons, primary success actions
- **Dark**: `#047857` - Success text, dark mode

#### Warning (Amber/Orange)
- **Light**: `#f59e0b` - Warning backgrounds, hover states
- **Default**: `#d97706` - Warning icons, primary warning actions
- **Dark**: `#b45309` - Warning text, dark mode

#### Danger (Red)
- **Light**: `#ef4444` - Error backgrounds, hover states
- **Default**: `#dc2626` - Error icons, destructive actions
- **Dark**: `#b91c1c` - Error text, dark mode

#### Info (Blue)
- **Light**: `#3b82f6` - Info backgrounds, hover states
- **Default**: `#2563eb` - Info icons, informational actions
- **Dark**: `#1d4ed8` - Info text, dark mode

### Dark Sidebar
- **Default**: `#111827` - Sidebar background
- **Hover**: `#1f2937` - Sidebar hover states

### Usage Guidelines
- Use **rose-600** for primary call-to-action buttons
- Use **neutral-50** for main page backgrounds
- Use semantic colors consistently (green for success, red for errors, etc.)
- Maintain WCAG AA contrast ratio for accessibility (4.5:1 for normal text)
- Use darker shades (700-900) for text on light backgrounds
- Use lighter shades (50-200) for backgrounds and subtle highlights

---

## 2. 💻 Full Technology Stack

### Core Framework
- **React**: v18.2.0 - UI library for building components
- **TypeScript**: v4.9.5 - Type-safe JavaScript
- **React Router DOM**: v6.x - Client-side routing

### Styling
- **Tailwind CSS**: v3.x - Utility-first CSS framework
- **PostCSS**: v8.x - CSS processing
- **Autoprefixer**: v10.x - CSS vendor prefixing

### State Management
- **Zustand**: v4.x - Lightweight state management for auth
- **TanStack React Query**: v5.x - Server state management, data fetching, caching

### HTTP Client
- **Axios**: v1.x - Promise-based HTTP client with interceptors

### UI Components & Icons
- **Lucide React**: v0.x - Beautiful, consistent icon set
- **React Hot Toast**: v2.x - Elegant toast notifications

### Build Tools
- **Create React App**: v5.x - Zero-config React setup
- **Webpack**: v5.x (via CRA) - Module bundler
- **Babel**: v7.x (via CRA) - JavaScript compiler

### Development Tools
- **ESLint**: Code linting
- **TypeScript Compiler**: Type checking

### Specialized Features
1. **Audio Player**: Custom-built HTML5 audio player with controls
2. **Modal System**: Custom modal with backdrop and keyboard support
3. **Toast Notifications**: react-hot-toast for user feedback
4. **Protected Routes**: Custom route guards for authentication
5. **Form Validation**: Client-side validation with error handling
6. **Responsive Design**: Mobile-first responsive layouts

---

## 3. 🧩 Design System Components

### Button Component
Located: `src/components/ui/Button.tsx`

#### Variants
1. **Primary** (`variant="primary"`)
   - Background: rose-600
   - Hover: rose-700
   - Active: rose-800
   - Text: white
   - Use: Main actions, form submissions

2. **Secondary** (`variant="secondary"`)
   - Background: neutral-100
   - Hover: neutral-200
   - Active: neutral-300
   - Text: neutral-900
   - Border: neutral-300
   - Use: Secondary actions, cancel buttons

3. **Danger** (`variant="danger"`)
   - Background: #dc2626
   - Hover: #b91c1c
   - Text: white
   - Use: Destructive actions, delete operations

4. **Warning** (`variant="warning"`)
   - Background: #d97706
   - Hover: #b45309
   - Text: white
   - Use: Warning actions, confirmation needed

5. **Ghost** (`variant="ghost"`)
   - Background: transparent
   - Hover: neutral-100
   - Active: neutral-200
   - Text: neutral-700
   - Use: Subtle actions, icon buttons

#### Sizes
- **Small** (`size="sm"`): `px-3 py-1.5 text-sm`
- **Medium** (`size="md"`): `px-4 py-2 text-base` (default)
- **Large** (`size="lg"`): `px-6 py-3 text-lg`

#### Props
- `variant`: Button style variant
- `size`: Button size
- `loading`: Show loading spinner
- `icon`: Icon element to display
- `disabled`: Disable button
- All standard HTML button props

#### CSS Specifications
```css
/* Base styles */
- Border radius: 0.375rem (md)
- Font weight: 500 (medium)
- Transition: colors 200ms
- Focus ring: 2px rose-500 with offset

/* States */
- Disabled: opacity-50, cursor-not-allowed
- Loading: Shows spinner, disables interaction
```

### Input Component
Located: `src/components/ui/Input.tsx`

#### Features
- Optional label above input
- Optional icon on the left
- Error message display below input
- Full TypeScript support

#### CSS Specifications
```css
/* Base styles */
- Padding: 1rem (px-4 py-2)
- Border: 1px neutral-300
- Border radius: 0.375rem (md)
- Font size: 1rem (base)

/* With icon */
- Left padding: 2.5rem (pl-10)
- Icon position: absolute left-3

/* Focus state */
- Ring: 2px rose-500
- Border: transparent

/* Error state */
- Border color: #dc2626
- Ring color: #dc2626
- Error text: text-sm, color #dc2626

/* Disabled state */
- Background: neutral-100
- Cursor: not-allowed
```

### Card Components
Located: `src/components/ui/Card.tsx`

#### Components
1. **Card** - Container with shadow and border
2. **CardHeader** - Header section with spacing
3. **CardTitle** - Styled title text
4. **CardContent** - Main content area

#### CSS Specifications
```css
/* Card */
- Background: white
- Border radius: 0.5rem (lg)
- Shadow: medium (shadow-md)
- Border: 1px neutral-200

/* Padding options */
- Small: 1rem (p-4)
- Medium: 1.5rem (p-6) - default
- Large: 2rem (p-8)

/* CardTitle */
- Font size: 1.25rem (xl)
- Font weight: 600 (semibold)
- Color: neutral-900
```

### Modal Component
Located: `src/components/ui/Modal.tsx`

#### Features
- Backdrop with click-to-close
- ESC key support
- Body scroll lock when open
- Responsive sizing

#### Sizes
- **Small**: max-w-md (28rem)
- **Medium**: max-w-lg (32rem) - default
- **Large**: max-w-2xl (42rem)
- **Extra Large**: max-w-4xl (56rem)

#### CSS Specifications
```css
/* Backdrop */
- Background: black with 50% opacity
- Position: fixed, inset-0
- Z-index: 50

/* Modal */
- Background: white
- Border radius: 0.5rem (lg)
- Shadow: xl
- Max height: 90vh
- Margin: 1rem

/* Header */
- Padding: 1.5rem (px-6 py-4)
- Border bottom: 1px neutral-200
- Font size: 1.25rem (xl)
- Font weight: 600

/* Content */
- Padding: 1.5rem (px-6 py-4)
- Overflow: auto
- Max height: calc(90vh - 100px)
```

### Badge Component
Located: `src/components/ui/Badge.tsx`

#### Variants
- **Default**: neutral-100 background, neutral-700 text
- **Success**: green-100 background, green-700 text
- **Warning**: yellow-100 background, yellow-700 text
- **Danger**: red-100 background, red-700 text
- **Info**: blue-100 background, blue-700 text

#### CSS Specifications
```css
- Padding: 0.125rem 0.625rem (px-2.5 py-0.5)
- Border radius: 9999px (full)
- Font size: 0.75rem (xs)
- Font weight: 500 (medium)
- Display: inline-flex
- Align: items-center
```

#### CallTypeBadge
Special badge for call types:
- **Incoming**: Success variant (green)
- **Outgoing**: Info variant (blue)
- **Missed**: Danger variant (red)
- **Rejected**: Warning variant (yellow)

### Select Component
Located: `src/components/ui/Select.tsx`

#### CSS Specifications
```css
/* Similar to Input */
- Padding: 1rem (px-4 py-2)
- Border: 1px neutral-300
- Border radius: 0.375rem (md)
- Focus ring: 2px rose-500
```

### Loading Components
Located: `src/components/ui/Loading.tsx`

#### Components
1. **Loading** - Full loading state with text
2. **LoadingSpinner** - Just the spinner icon

#### Sizes
- **Small**: w-4 h-4
- **Medium**: w-8 h-8 (default)
- **Large**: w-12 h-12

### Empty State Component
Located: `src/components/ui/EmptyState.tsx`

#### Features
- Optional icon
- Title text
- Optional description
- Optional action button

---

## 4. 🏗️ Layout Architecture

### Visual Structure
```
┌─────────────────────────────────────────────┐
│                                             │
│  ┌──────────┐  ┌─────────────────────────┐ │
│  │          │  │       Header            │ │
│  │          │  │  (white, border-b)      │ │
│  │          │  └─────────────────────────┘ │
│  │ Sidebar  │                              │
│  │ (#111827)│  ┌─────────────────────────┐ │
│  │          │  │                         │ │
│  │  Nav     │  │   Main Content Area     │ │
│  │  Items   │  │   (neutral-50 bg)       │ │
│  │          │  │                         │ │
│  │          │  │   Cards, Tables, etc.   │ │
│  │          │  │                         │ │
│  │  User    │  │                         │ │
│  └──────────┘  └─────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### Sidebar Design
Located: `src/components/layout/Sidebar.tsx`

#### Specifications
- **Width**: 16rem (256px)
- **Background**: #111827 (sidebar color)
- **Position**: Fixed on desktop, slide-in on mobile
- **Z-index**: 50

#### Sections
1. **Header** (px-6 py-5)
   - Logo and app name
   - Border bottom: neutral-700

2. **Navigation** (px-4 py-6)
   - Nav items with icons
   - Active state: sidebar-hover background, rose-500 text
   - Hover: sidebar-hover background, white text
   - Spacing: 0.5rem between items

3. **User Section** (px-4 py-4)
   - Border top: neutral-700
   - User avatar (circular, rose-600 background)
   - User name and email
   - Logout button

#### Mobile Behavior
- Hidden by default (translate-x-full)
- Overlay backdrop when open
- Slide in animation (300ms)
- Close button visible

### Header Design
Located: `src/components/layout/Header.tsx`

#### Specifications
- **Height**: Auto (px-6 py-4)
- **Background**: white
- **Border**: 1px bottom neutral-200
- **Position**: Sticky top-0
- **Z-index**: 30

#### Sections
1. **Left**: Menu button (mobile) + Page title
2. **Center**: Search bar (optional, hidden on mobile)
3. **Right**: Additional actions

### Main Layout
Located: `src/components/layout/Layout.tsx`

#### Structure
- Flex container (flex h-screen)
- Sidebar (fixed width)
- Content area (flex-1)
  - Header (sticky)
  - Main content (overflow-y-auto)
    - Container (mx-auto px-6 py-8)

---

## 5. 📐 Typography & Spacing

### Font Sizes
| Size | Rem | Pixels | Line Height | Usage |
|------|-----|--------|-------------|-------|
| xs | 0.75rem | 12px | 1rem | Badges, tiny labels |
| sm | 0.875rem | 14px | 1.25rem | Small text, captions |
| base | 1rem | 16px | 1.5rem | Body text, inputs |
| lg | 1.125rem | 18px | 1.75rem | Large body, subheadings |
| xl | 1.25rem | 20px | 1.75rem | Card titles, headings |
| 2xl | 1.5rem | 24px | 2rem | Page titles, large headings |
| 3xl | 1.875rem | 30px | 2.25rem | Hero text, main titles |

### Font Weights
- **Normal** (400): Body text
- **Medium** (500): Buttons, labels
- **Semibold** (600): Card titles, emphasis
- **Bold** (700): Page headings, important text

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
             'Helvetica Neue', sans-serif;
```

### Spacing Scale (Tailwind)
| Class | Rem | Pixels | Usage |
|-------|-----|--------|-------|
| 0 | 0 | 0px | No spacing |
| 1 | 0.25rem | 4px | Tiny gaps |
| 2 | 0.5rem | 8px | Small spacing |
| 3 | 0.75rem | 12px | Compact spacing |
| 4 | 1rem | 16px | Standard spacing |
| 5 | 1.25rem | 20px | Comfortable spacing |
| 6 | 1.5rem | 24px | Card padding, sections |
| 8 | 2rem | 32px | Large spacing |
| 10 | 2.5rem | 40px | Extra large spacing |
| 12 | 3rem | 48px | Section separators |
| 16 | 4rem | 64px | Page sections |
| 20 | 5rem | 80px | Major sections |
| 24 | 6rem | 96px | Hero spacing |

### Border Radius
| Size | Value | Usage |
|------|-------|-------|
| sm | 0.25rem | Small elements |
| default | 0.375rem | Buttons, inputs |
| md | 0.5rem | Cards, modals |
| lg | 0.75rem | Large cards |
| xl | 1rem | Hero elements |
| 2xl | 1.5rem | Feature cards |
| full | 9999px | Circles, badges, pills |

### Box Shadows
| Size | Values | Usage |
|------|--------|-------|
| sm | 0 1px 2px rgba(0,0,0,0.05) | Subtle elevation |
| default | 0 1px 3px rgba(0,0,0,0.1) | Standard cards |
| md | 0 4px 6px rgba(0,0,0,0.1) | Elevated cards |
| lg | 0 10px 15px rgba(0,0,0,0.1) | Modals, dropdowns |
| xl | 0 20px 25px rgba(0,0,0,0.1) | Hero elements |

---

## 6. 🎯 UI Patterns

### Navigation States
#### Sidebar Navigation
- **Default**: text-neutral-300
- **Hover**: bg-sidebar-hover, text-white
- **Active**: bg-sidebar-hover, text-rose-500

### Loading States
1. **Spinner**: Rotating Loader2 icon (rose-600)
2. **Skeleton**: Animated gray placeholders (future enhancement)
3. **Full page**: Centered spinner with text

### Toast Notifications
Located: `src/App.tsx` (Toaster component)

#### Configuration
- **Position**: top-right
- **Duration**: 3000ms (3 seconds)
- **Success icon**: Green (#10b981)
- **Error icon**: Red (#ef4444)

#### Usage
```typescript
import toast from 'react-hot-toast';

toast.success('Operation successful!');
toast.error('Something went wrong');
toast.loading('Processing...');
```

### Table Design
Pattern used in: `src/pages/CallLogs.tsx`

#### Structure
- **Header**: bg-neutral-50, border-b, uppercase text-xs
- **Row**: hover:bg-neutral-50 transition
- **Cell**: px-4 py-4, appropriate text sizes
- **Actions**: Right-aligned, ghost buttons

### Pagination
- **Layout**: Flex justify-between
- **Buttons**: Secondary variant
- **Info**: Centered text showing current page

### Form Patterns
- **Labels**: text-sm, font-medium, text-neutral-700, mb-1
- **Errors**: text-sm, text-danger, mt-1
- **Groups**: space-y-6 for vertical spacing
- **Submit**: Full width on mobile, primary button

### Empty States
- **Icon**: Large, neutral-400
- **Title**: text-lg, font-semibold
- **Description**: text-neutral-600, centered
- **Action**: Optional button below

### Responsive Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px (sidebar becomes fixed)
- **xl**: 1280px
- **2xl**: 1536px

---

## 7. 🛠️ Implementation Guide

### Step 1: Project Setup
```bash
# Create React app
npx create-react-app call-logs-admin --template typescript

# Navigate to project
cd call-logs-admin

# Install dependencies
npm install tailwindcss postcss autoprefixer @tanstack/react-query axios zustand react-router-dom lucide-react react-hot-toast
```

### Step 2: Tailwind Configuration
Create `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rose: { /* colors */ },
        neutral: { /* colors */ },
        // ... other colors
      }
    }
  }
}
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 3: Project Structure
```
src/
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Select.tsx
│   │   ├── Loading.tsx
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   ├── layout/           # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── index.ts
│   └── AudioPlayer.tsx   # Audio player component
├── pages/                # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── CallLogs.tsx
│   └── index.ts
├── services/             # API services
│   └── api.ts
├── store/                # State management
│   └── authStore.ts
├── hooks/                # Custom React hooks
│   └── useCallLogs.ts
├── types/                # TypeScript types
│   └── index.ts
├── utils/                # Utility functions
├── App.tsx               # Main app component
└── index.tsx             # Entry point
```

### Step 4: Environment Setup
Create `.env` file:
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

### Step 5: Component Examples

#### Sidebar Component (`src/components/layout/Sidebar.tsx`)
```tsx
<aside className="fixed top-0 left-0 h-full w-64 bg-sidebar">
  {/* Header */}
  <div className="px-6 py-5 border-b border-neutral-700">
    <Phone className="w-6 h-6 text-rose-500" />
    <span className="text-xl font-bold text-white">CallLogs</span>
  </div>

  {/* Navigation */}
  <nav className="px-4 py-6 space-y-2">
    <NavLink to="/dashboard"
             className="flex items-center gap-3 px-4 py-3
                        rounded-md text-neutral-300
                        hover:bg-sidebar-hover">
      Dashboard
    </NavLink>
  </nav>
</aside>
```

#### Button Component Usage
```tsx
// Primary action
<Button variant="primary" size="md">
  Save Changes
</Button>

// With icon
<Button variant="primary" icon={<Save className="w-4 h-4" />}>
  Save
</Button>

// Loading state
<Button variant="primary" loading={isLoading}>
  Submit
</Button>

// Danger action
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>
```

#### Card Component Usage
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

#### Modal Component Usage
```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  <p>Modal content</p>
</Modal>
```

### Step 6: Authentication Setup
```typescript
// In App.tsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Step 7: API Integration
```typescript
// services/api.ts
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 8. 📊 Design Principles

### Consistency
- Use the same color for similar actions across the app
- Maintain consistent spacing (multiples of 4px)
- Apply the same border radius to similar elements
- Use consistent icon sizes within contexts

### Accessibility
- Maintain WCAG AA contrast ratios (4.5:1 for text)
- Provide focus states for all interactive elements
- Support keyboard navigation
- Include aria-labels where appropriate
- Test with screen readers

### Responsiveness
- **Mobile-first approach**: Design for mobile, enhance for desktop
- **Breakpoint strategy**:
  - < 768px: Single column, stacked layout, hamburger menu
  - 768px - 1024px: Adaptive columns, visible sidebar option
  - > 1024px: Full layout, fixed sidebar, multi-column grids
- **Touch targets**: Minimum 44x44px for mobile interactions

### Performance
- **Lazy loading**: Load routes on demand with React.lazy()
- **Image optimization**: Use appropriate formats and sizes
- **Code splitting**: Separate vendor and app bundles
- **Memoization**: Use React.memo for expensive components
- **React Query**: Automatic caching and background refetching

### User Experience
- **Feedback**: Show loading states, success/error messages
- **Progressive disclosure**: Show advanced options only when needed
- **Sensible defaults**: Pre-fill forms where possible
- **Error prevention**: Validate inputs, confirm destructive actions
- **Empty states**: Guide users when no data is available

### Code Quality
- **TypeScript**: Full type safety across the application
- **Component composition**: Build complex UIs from simple components
- **Single responsibility**: Each component has one clear purpose
- **DRY principle**: Reuse components and utilities
- **Documentation**: Comment complex logic, document props

---

## Quick Reference

### Common Color Uses
- **Primary Action**: rose-600
- **Text**: neutral-900 (headings), neutral-600 (body)
- **Backgrounds**: white (cards), neutral-50 (page)
- **Borders**: neutral-200
- **Hover**: rose-700 (buttons), neutral-100 (ghost)

### Common Spacing
- **Component gap**: 1rem (4)
- **Card padding**: 1.5rem (6)
- **Section spacing**: 1.5rem (6)
- **Page padding**: 2rem (8)

### Common Sizes
- **Button height**: 2.5rem (sm), 2.75rem (md), 3.5rem (lg)
- **Input height**: 2.75rem
- **Icon size**: 1.25rem (5) - standard
- **Sidebar width**: 16rem (64)

---

## Additional Resources

### Icons
- **Library**: Lucide React
- **Import**: `import { IconName } from 'lucide-react'`
- **Usage**: `<Phone className="w-5 h-5" />`

### Fonts
- System font stack for optimal loading
- No external font loading required

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ required
- CSS Grid and Flexbox support required

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Maintained by**: Call Logs Admin Team
