# Server Management Guide

This project includes a convenient shell script to manage the development server.

## Quick Start

```bash
# Start the server
./server.sh start

# Stop the server
./server.sh stop

# Restart the server
./server.sh restart

# Check server status
./server.sh status

# View live logs
./server.sh logs
```

## Available Commands

### `./server.sh start`
Starts the Next.js development server in the background.
- Creates a PID file (`.server.pid`) to track the process
- Logs output to `.server.log`
- Server runs at `http://localhost:3000`

### `./server.sh stop`
Stops the running development server gracefully.
- Attempts graceful shutdown first
- Force kills if needed after 10 seconds
- Cleans up PID file

### `./server.sh restart`
Convenience command to stop and start the server.
- Useful when you've made configuration changes
- Ensures clean restart with fresh state

### `./server.sh status`
Shows the current status of the server.
- Displays PID if running
- Shows server URL
- Displays last 5 log entries

### `./server.sh logs`
Shows live server logs (tail -f).
- Real-time log viewing
- Press `Ctrl+C` to exit

## Server Files

- `.server.pid` - Contains the process ID of the running server
- `.server.log` - Contains all server output and errors

Both files are automatically ignored by git.

## Troubleshooting

### Server won't start
```bash
# Check the logs
./server.sh logs

# Or view the log file directly
cat .server.log
```

### Port already in use
```bash
# Kill any process using port 3000
lsof -ti:3000 | xargs kill -9

# Then start the server
./server.sh start
```

### Stale PID file
```bash
# The script automatically cleans up stale PID files
# If issues persist, manually remove:
rm .server.pid

# Then start fresh
./server.sh start
```

### Permission denied
```bash
# Make sure the script is executable
chmod +x server.sh
```

## Alternative: npm scripts

You can still use the standard npm commands:

```bash
# Development (foreground)
npm run dev

# Production build
npm run build

# Production server
npm start

# Linting
npm run lint

# Code formatting
npm run format
```

## Production Deployment

For production, don't use the `server.sh` script. Instead:

```bash
# Build the application
npm run build

# Start production server
npm start
```

Or deploy to platforms like:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Railway**
- **Docker** containers

## Tips

1. **Development Workflow**
   ```bash
   ./server.sh start     # Start once in the morning
   ./server.sh logs      # Keep logs open in a terminal
   # Work on your code...
   ./server.sh restart   # Restart when needed
   ./server.sh stop      # Stop at end of day
   ```

2. **Clean Restart**
   ```bash
   ./server.sh stop
   rm -rf .next          # Clear Next.js cache
   ./server.sh start
   ```

3. **Multiple Terminal Windows**
   - Terminal 1: Run `./server.sh logs` for live logs
   - Terminal 2: Your code editor
   - Terminal 3: Running git commands, etc.

## Windows Users

For Windows, create a `server.bat` file:

```batch
@echo off
if "%1"=="start" (
    start /B npm run dev > .server.log 2>&1
    echo Server started
) else if "%1"=="stop" (
    taskkill /F /IM node.exe
    echo Server stopped
) else (
    echo Usage: server.bat [start^|stop]
)
```

Or use the npm scripts directly in PowerShell/CMD.
