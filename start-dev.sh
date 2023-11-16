#!/bin/bash

# Start a new tmux session and create the first window (tab)
tmux new-session -d -s gymrat -n sqld 'sqld -l 127.0.0.1:3030 --disable-namespaces'

# Set mouse support and increase scrollback buffer for this session
tmux set -t gymrat mouse on
tmux set -t gymrat history-limit 10000

# Create additional windows (tabs) for other commands
tmux new-window -t gymrat -n tunnel 'cloudflared tunnel --config ~/.cloudflared/gymrat.yaml run --protocol http2'
tmux new-window -t gymrat -n next 'bun run dev'

# Customize the status bar for this session
tmux set -t gymrat status-right ''

# Select the 'next' tab as default
tmux select-window -t gymrat:next

# Attach to the tmux session
tmux attach-session -t gymrat
