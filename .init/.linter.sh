#!/bin/bash
cd /home/kavia/workspace/code-generation/weather-insights-dashboard-225702-225711/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

