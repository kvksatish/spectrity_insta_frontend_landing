#!/bin/bash

# Server Management Script for Spectrity Insights Landing Page
# Usage: ./server.sh [start|stop|restart|status]

PID_FILE=".server.pid"
LOG_FILE=".server.log"
PORT_FILE=".server.port"
DEFAULT_PORT=3001

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to find an available port
find_available_port() {
    local port=$DEFAULT_PORT
    local max_attempts=20
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if ! lsof -i:$port > /dev/null 2>&1; then
            echo $port
            return 0
        fi
        echo -e "${YELLOW}Port $port is in use, trying $((port + 1))...${NC}" >&2
        port=$((port + 1))
        attempt=$((attempt + 1))
    done

    echo -e "${RED}Could not find an available port after $max_attempts attempts${NC}" >&2
    return 1
}

# Function to start the server
start_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}Server is already running with PID $PID${NC}"
            exit 1
        else
            rm "$PID_FILE"
        fi
    fi

    echo -e "${GREEN}Starting development server...${NC}"

    # Find an available port
    AVAILABLE_PORT=$(find_available_port)
    if [ $? -ne 0 ]; then
        exit 1
    fi

    echo -e "${GREEN}Using port $AVAILABLE_PORT${NC}"
    echo $AVAILABLE_PORT > "$PORT_FILE"

    PORT=$AVAILABLE_PORT npm run dev > "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > "$PID_FILE"

    sleep 3

    if ps -p "$SERVER_PID" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Server started successfully with PID $SERVER_PID${NC}"
        echo -e "${GREEN}✓ Server is running at http://localhost:$AVAILABLE_PORT${NC}"
        echo -e "${GREEN}✓ Logs are being written to $LOG_FILE${NC}"
    else
        echo -e "${RED}✗ Failed to start server. Check $LOG_FILE for errors${NC}"
        rm "$PID_FILE"
        rm "$PORT_FILE"
        exit 1
    fi
}

# Function to stop the server
stop_server() {
    if [ ! -f "$PID_FILE" ]; then
        echo -e "${YELLOW}No server PID file found. Server may not be running.${NC}"
        # Try to find and kill any running Next.js dev servers
        pkill -f "next dev"
        exit 0
    fi

    PID=$(cat "$PID_FILE")

    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping server (PID: $PID)...${NC}"
        kill "$PID"

        # Wait for process to terminate
        for i in {1..10}; do
            if ! ps -p "$PID" > /dev/null 2>&1; then
                break
            fi
            sleep 1
        done

        # Force kill if still running
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}Force stopping server...${NC}"
            kill -9 "$PID"
        fi

        rm "$PID_FILE"
        [ -f "$PORT_FILE" ] && rm "$PORT_FILE"
        echo -e "${GREEN}✓ Server stopped successfully${NC}"
    else
        echo -e "${YELLOW}Server process not found. Cleaning up PID file.${NC}"
        rm "$PID_FILE"
        [ -f "$PORT_FILE" ] && rm "$PORT_FILE"
    fi

    # Clean up any remaining Next.js processes
    pkill -f "next dev"
}

# Function to restart the server
restart_server() {
    echo -e "${YELLOW}Restarting server...${NC}"
    stop_server
    sleep 2
    start_server
}

# Function to show server status
show_status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            PORT=$DEFAULT_PORT
            if [ -f "$PORT_FILE" ]; then
                PORT=$(cat "$PORT_FILE")
            fi
            echo -e "${GREEN}✓ Server is running${NC}"
            echo -e "  PID: $PID"
            echo -e "  URL: http://localhost:$PORT"
            echo -e "  Log: $LOG_FILE"

            # Show last few lines of log
            if [ -f "$LOG_FILE" ]; then
                echo -e "\n${YELLOW}Recent logs:${NC}"
                tail -5 "$LOG_FILE"
            fi
        else
            echo -e "${RED}✗ Server is not running (stale PID file found)${NC}"
            rm "$PID_FILE"
            [ -f "$PORT_FILE" ] && rm "$PORT_FILE"
        fi
    else
        echo -e "${RED}✗ Server is not running${NC}"
    fi
}

# Function to show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo -e "${YELLOW}Showing server logs (Ctrl+C to exit):${NC}"
        tail -f "$LOG_FILE"
    else
        echo -e "${RED}No log file found${NC}"
    fi
}

# Main script logic
case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the development server"
        echo "  stop    - Stop the development server"
        echo "  restart - Restart the development server"
        echo "  status  - Check server status"
        echo "  logs    - View server logs (live tail)"
        exit 1
        ;;
esac

exit 0
