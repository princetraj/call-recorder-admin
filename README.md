# Call Logs Admin Panel

A modern, responsive React admin panel for managing call recordings with authentication. Built with React, TypeScript, Tailwind CSS, and integrated with Laravel backend API.

## Features

- **Authentication System**: Secure login/logout with token-based authentication
- **Dashboard**: Overview statistics of calls (incoming, outgoing, missed, rejected)
- **Call Logs Management**: View, filter, and search call logs
- **Audio Player**: Built-in audio player to play call recordings
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Type-Safe**: Full TypeScript support for better developer experience

## Technology Stack

### Core
- **React** 18.2.0 - UI library
- **TypeScript** 4.9.5 - Type-safe JavaScript
- **React Router DOM** 6.x - Client-side routing

### Styling
- **Tailwind CSS** 3.x - Utility-first CSS framework
- **Lucide React** - Beautiful icon set

### State Management
- **Zustand** - Lightweight state management for auth
- **TanStack React Query** - Server state management and data fetching

### HTTP & API
- **Axios** - Promise-based HTTP client

### UI Libraries
- **React Hot Toast** - Toast notifications

## Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- npm or yarn
- Running Laravel API backend (see API documentation)

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd call-logs-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```
   REACT_APP_API_BASE_URL=http://localhost:8000/api
   ```

   Update the `REACT_APP_API_BASE_URL` to match your Laravel API URL.

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

### `npm start`
Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for best performance.

### `npm run eject`
**Note: this is a one-way operation. Once you eject, you can't go back!**

## Project Structure

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
│   │   └── EmptyState.tsx
│   ├── layout/           # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   └── AudioPlayer.tsx   # Audio player component
├── pages/                # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── CallLogs.tsx
├── services/             # API services
│   └── api.ts
├── store/                # State management
│   └── authStore.ts
├── hooks/                # Custom React hooks
│   └── useCallLogs.ts
├── types/                # TypeScript types
│   └── index.ts
├── App.tsx               # Main app component
└── index.tsx             # Entry point
```

## API Integration

This admin panel integrates with the Call Logs API. Make sure your API backend is running and accessible.

### Required API Endpoints

- `POST /api/login` - User authentication
- `POST /api/logout` - User logout
- `GET /api/call-logs` - Fetch call logs with filters
- `GET /api/call-logs/{id}` - Fetch single call log with recordings
- `DELETE /api/call-logs/{id}` - Delete call log
- `GET /api/call-logs/{id}/recordings` - Fetch recordings for a call log
- `DELETE /api/call-recordings/{id}` - Delete recording

See `API_DOCUMENTATION.md` in the backend project for full API details.

## Features Guide

### Authentication
- Login page with email and password
- Token-based authentication stored in localStorage
- Protected routes requiring authentication
- Automatic logout on token expiration

### Dashboard
- Overview statistics (total, incoming, outgoing, missed calls)
- Total call duration
- Average call duration
- Visual cards with color-coded icons

### Call Logs
- Paginated table view of all call logs
- Search by caller name or phone number
- Filter by call type (incoming, outgoing, missed, rejected)
- Filter by date range
- View detailed call log with recordings
- Play recordings with custom audio player
- Delete call logs

### Audio Player
- Play/pause controls
- Seek bar with time display
- Volume control
- Mute/unmute
- Download recording
- File information display

## Design System

This project includes a comprehensive design system with:

- Complete color palette (primary rose/red colors + neutrals + semantic colors)
- Typography scale and spacing system
- Reusable UI components with variants and sizes
- Dark sidebar layout
- Responsive design patterns
- Accessibility features

See `DESIGN_SYSTEM.md` for full documentation.

## Customization

### Change API Base URL
Update the `.env` file:
```
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
```

### Modify Colors
Edit `tailwind.config.js` to change the color scheme:
```javascript
theme: {
  extend: {
    colors: {
      rose: {
        600: '#your-color',
        // ... other shades
      }
    }
  }
}
```

### Add New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/layout/Sidebar.tsx`

## Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Deploy to Server
1. Build the project
2. Upload the `build` folder to your web server
3. Configure your web server to serve the `index.html` for all routes
4. Ensure the API base URL is correctly set in production

### Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your Laravel backend has proper CORS configuration:
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'],
```

### API Connection Failed
- Verify the API URL in `.env` file
- Check if the backend API is running
- Ensure the API is accessible from your frontend URL

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Clear build cache: `rm -rf build`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For issues, questions, or support, please contact the development team.

---

**Built with ❤️ using React and TypeScript**
