#!/bin/bash
cd /home/kavia/workspace/code-generation/manufacturing-defect-management-system-370/web_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

