# Quick Setup Guide

## Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd call-logs-admin
npm install
```

### Step 2: Configure Environment
The `.env` file is already created. Update the API URL if needed:
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

### Step 3: Start Development Server
```bash
npm start
```

The app will automatically open at http://localhost:3000

### Step 4: Login
Use your Laravel backend user credentials to login.

Default test credentials (if you're using seeded data):
- Email: user@example.com
- Password: password123

## Project Features

### What's Included

1. **Complete Design System**
   - 10 shades of primary rose/red colors
   - Full neutral gray scale
   - Semantic colors (success, warning, danger, info)
   - Custom Tailwind configuration

2. **Technology Stack**
   - React 18 with TypeScript
   - Tailwind CSS for styling
   - Zustand for auth state management
   - React Query for API data fetching
   - React Router for navigation
   - Axios for HTTP requests
   - Lucide React for icons
   - React Hot Toast for notifications

3. **UI Components**
   - Button (5 variants: primary, secondary, danger, warning, ghost)
   - Input fields with labels and error handling
   - Card components (Card, CardHeader, CardTitle, CardContent)
   - Modal with backdrop and keyboard support
   - Badge with semantic colors
   - Select dropdowns
   - Loading states and spinners
   - Empty state components

4. **Layout Architecture**
   - Dark sidebar (#111827) with navigation
   - White header with search bar
   - Responsive mobile menu
   - Protected routes with authentication

5. **Pages**
   - **Login**: Email/password authentication
   - **Dashboard**: Statistics overview (total calls, incoming, outgoing, missed)
   - **Call Logs**: Filterable table with search, pagination, and audio player

6. **Features**
   - Token-based authentication
   - Search call logs by name or number
   - Filter by call type and date range
   - Paginated table view
   - View call details in modal
   - Play recordings with custom audio player
   - Delete call logs and recordings
   - Toast notifications for user feedback

## File Structure

```
call-logs-admin/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layout/             # Layout components
│   │   └── AudioPlayer.tsx     # Audio player
│   ├── pages/                  # Page components
│   ├── services/               # API service layer
│   ├── store/                  # Zustand store
│   ├── hooks/                  # Custom hooks
│   ├── types/                  # TypeScript types
│   ├── App.tsx                 # Main app component
│   └── index.tsx               # Entry point
├── .env                        # Environment variables
├── tailwind.config.js          # Tailwind configuration
├── package.json
├── README.md                   # Full documentation
├── DESIGN_SYSTEM.md            # Complete design system
└── SETUP_GUIDE.md              # This file
```

## Next Steps

1. **Customize Colors**: Edit `tailwind.config.js` to change the color scheme
2. **Add Features**: Create new pages and components as needed
3. **Deploy**: Run `npm run build` to create production build

## Common Tasks

### Add a New Page
1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/layout/Sidebar.tsx`

### Change API URL
Update `.env` file:
```
REACT_APP_API_BASE_URL=https://your-api.com/api
```

### Build for Production
```bash
npm run build
```

Output will be in the `build/` folder.

## Need Help?

- Read the full documentation in `README.md`
- Check the design system guide in `DESIGN_SYSTEM.md`
- Review the API documentation in your Laravel backend

## Design System Quick Reference

### Colors
- Primary: `rose-600` (#e11d48)
- Background: `neutral-50` (#fafafa)
- Text: `neutral-900` (#171717)
- Sidebar: `#111827`

### Common Classes
- Card: `bg-white rounded-lg shadow-md border border-neutral-200 p-6`
- Button: `bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700`
- Input: `border border-neutral-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-rose-500`

### Component Sizes
- Button: `sm`, `md`, `lg`
- Modal: `sm`, `md`, `lg`, `xl`
- Loading: `sm`, `md`, `lg`

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### CORS Errors
Ensure your Laravel backend allows requests from `http://localhost:3000`

### Tailwind Not Working
```bash
# Restart dev server
npm start
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

---

Happy coding!
