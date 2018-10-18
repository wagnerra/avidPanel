# SW Devel Challenge - Central Panel Server

This server software developed in node.js using websocket library main purpose is 
to group and archve data from cleaning Robots doing basically these functions:
- Communicate with Cleaning Robots receiving current status in near real time.
- Execute remote commands on Cleaning Robots
  - START: Start a cleaning job
  - STOP: Stop current cleaning job
  - RESUME: Resume a stopped cleaning job
  - CANCEL: Cancel a cleaning job
- Communicate with Client Web Navigator allowing the user execute commands
  - SELECT: Select a Remote Cleaning Robot to begin near real time interaction
  - START: Start a cleaning job on SELECTED Robot
  - STOP: Stop current cleaning job on SELECTED Robot
  - RESUME: Resume a stopped cleaning job on SELECTED Robot
  - CANCEL: Cancel a cleaning job on SELECTED Robot
- Allow multiple clients interacting with multiple Robots

### DEPLOY INSTRUCTIONS

- OS requirements: Linux Ubuntu 14.X (or equivalent)
- Machine requirements: 10 Gb Disk Space, 1GB RAM
- SW requirements: npm 6.4.1 and node.js 10.12.0
- Extract avidPanel.tar.gz on /usr/local
- Create a user panelsw on OS
- chown -R panelsw.panelsw /usr/local/avidPanel

### RUN INSTRUCTIONS  

- Login as robotsw user
```
cd /usr/local/avidPanel
export SERVER_PORT=8080
node server.js
```
OBS: Actual version working only on 8080 TCP port, do not change.

### TESTING

