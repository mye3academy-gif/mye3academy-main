/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');

// Manually created debug log
const logFile = path.join(__dirname, 'debug_error_log.txt');
fs.writeFileSync(logFile, '--- App Started (Debug Mode) ---\n');

process.on('uncaughtException', (err) => {
    fs.appendFileSync(logFile, 'UNCAUGHT EXCEPTION: ' + err.stack + '\n');
});

process.on('unhandledRejection', (reason) => {
    fs.appendFileSync(logFile, 'UNHANDLED REJECTION: ' + (reason ? reason.stack || reason : 'unknown') + '\n');
});

async function loadApp() {
    try {
        fs.appendFileSync(logFile, 'Importing index.js...\n');
        await import('./index.js');
        fs.appendFileSync(logFile, 'Import index.js successful!\n');
    } catch (error) {
        fs.appendFileSync(logFile, 'IMPORT ERROR: ' + error.stack + '\n');
    }
}
loadApp();
