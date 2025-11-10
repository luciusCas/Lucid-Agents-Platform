#!/usr/bin/env node

/**
 * 🔍 Deployment Data Verification Script
 * Cek dimana data tersimpan setelah deployment
 * 
 * Usage: node verify-deployment.js
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'bright');
    console.log('='.repeat(60) + '\n');
}

async function checkDatabase() {
    section('📊 DATABASE VERIFICATION');

    const dbPath = path.join(__dirname, 'lucid-agents-backend/data/agents.db');

    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
        log(`❌ Database file not found: ${dbPath}`, 'red');
        return;
    }

    log(`✓ Database file found: ${dbPath}`, 'green');

    // Get file stats
    const stats = fs.statSync(dbPath);
    log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`, 'cyan');
    log(`  Last modified: ${stats.mtime.toLocaleString()}`, 'cyan');

    // Open database and query
    const db = new sqlite3.Database(dbPath);

    return new Promise((resolve) => {
        db.all('SELECT * FROM agents ORDER BY updated_at DESC LIMIT 5', (err, rows) => {
            if (err) {
                log(`❌ Error querying database: ${err.message}`, 'red');
                db.close();
                resolve();
                return;
            }

            if (!rows || rows.length === 0) {
                log('ℹ No agents found in database', 'yellow');
            } else {
                log(`✓ Found ${rows.length} agent(s) in database:`, 'green');
                console.log('');

                rows.forEach((agent, index) => {
                    log(`Agent #${index + 1}:`, 'blue');
                    log(`  Name: ${agent.name}`, 'cyan');
                    log(`  Type: ${agent.type || 'N/A'}`, 'cyan');
                    log(`  Status: ${agent.status}`, agent.status === 'running' ? 'green' : 'yellow');
                    log(`  Created: ${agent.created_at}`, 'cyan');
                    log(`  Updated: ${agent.updated_at}`, 'cyan');
                    console.log('');
                });
            }

            db.close();
            resolve();
        });
    });
}

function checkAgentFiles() {
    section('📁 AGENT FILES VERIFICATION');

    const agentsDir = path.join(__dirname, 'agents');

    // Check if agents directory exists
    if (!fs.existsSync(agentsDir)) {
        log(`ℹ Agents directory not found: ${agentsDir}`, 'yellow');
        return;
    }

    log(`✓ Agents directory found: ${agentsDir}`, 'green');

    // List all agent directories
    const agents = fs.readdirSync(agentsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    if (agents.length === 0) {
        log('ℹ No agent directories found', 'yellow');
        return;
    }

    log(`✓ Found ${agents.length} agent directory(ies):`, 'green');
    console.log('');

    agents.forEach((agent) => {
        const agentPath = path.join(agentsDir, agent);
        const files = fs.readdirSync(agentPath);

        log(`Agent: ${agent}`, 'blue');
        log(`  Path: ${agentPath}`, 'cyan');
        log(`  Files: ${files.join(', ')}`, 'cyan');

        // Check for config and manifest
        const hasConfig = files.includes('config.json');
        const hasManifest = files.includes('manifest.json');

        log(`  ✓ config.json: ${hasConfig ? 'Present' : 'Missing'}`, hasConfig ? 'green' : 'yellow');
        log(`  ✓ manifest.json: ${hasManifest ? 'Present' : 'Missing'}`, hasManifest ? 'green' : 'yellow');
        console.log('');
    });
}

function checkLogs() {
    section('📝 LOGS VERIFICATION');

    const logsDir = path.join(__dirname, 'lucid-agents-backend/logs');

    if (!fs.existsSync(logsDir)) {
        log(`ℹ Logs directory not found: ${logsDir}`, 'yellow');
        return;
    }

    log(`✓ Logs directory found: ${logsDir}`, 'green');

    const logFiles = fs.readdirSync(logsDir);

    if (logFiles.length === 0) {
        log('ℹ No log files found', 'yellow');
        return;
    }

    log(`✓ Found ${logFiles.length} log file(s):`, 'green');
    console.log('');

    logFiles.forEach((file) => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);

        log(`File: ${file}`, 'blue');
        log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`, 'cyan');
        log(`  Last modified: ${stats.mtime.toLocaleString()}`, 'cyan');
        console.log('');
    });
}

function checkEnvironment() {
    section('🌍 ENVIRONMENT CHECK');

    // Check Node version
    log(`Node.js: ${process.version}`, 'cyan');

    // Check npm version
    const { execSync } = require('child_process');
    try {
        const npmVersion = execSync('npm -v', { encoding: 'utf-8' }).trim();
        log(`npm: ${npmVersion}`, 'cyan');
    } catch (e) {
        log('npm: Not found', 'yellow');
    }

    // Check key dependencies
    const packageJsonPath = path.join(__dirname, 'lucid-agents-backend/package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        log(`\n✓ Backend dependencies:`, 'green');
        const keyDeps = ['express', 'socket.io', 'sqlite3'];
        keyDeps.forEach(dep => {
            const version = packageJson.dependencies[dep];
            log(`  ${dep}: ${version || 'Not installed'}`, version ? 'green' : 'yellow');
        });
    }
}

async function printSummary() {
    section('📋 DEPLOYMENT DATA LOCATIONS');

    const locations = [
        {
            name: 'Database (SQLite)',
            path: 'lucid-agents-backend/data/agents.db',
            contains: 'Agent metadata, status, config'
        },
        {
            name: 'Agent Files',
            path: 'agents/{agentName}/',
            contains: 'config.json, manifest.json, source code'
        },
        {
            name: 'Logs',
            path: 'lucid-agents-backend/logs/',
            contains: 'Deployment logs, error logs'
        },
        {
            name: 'Terminal Output',
            path: 'Browser Memory (Session)',
            contains: 'Real-time messages, can be downloaded'
        }
    ];

    locations.forEach((loc) => {
        log(`${loc.name}:`, 'blue');
        log(`  📍 Path: ${loc.path}`, 'cyan');
        log(`  📦 Contains: ${loc.contains}`, 'cyan');
        console.log('');
    });
}

async function main() {
    log('\n🔍 DEPLOYMENT DATA VERIFICATION TOOL\n', 'bright');
    log('Checking where deployment data is stored...\n', 'cyan');

    try {
        await checkEnvironment();
        await checkDatabase();
        checkAgentFiles();
        checkLogs();
        await printSummary();

        section('✅ VERIFICATION COMPLETE');
        log('All data storage locations checked successfully!', 'green');
        log('\nTo query database directly:', 'cyan');
        log('  sqlite3 lucid-agents-backend/data/agents.db', 'yellow');
        log('  > SELECT * FROM agents;', 'yellow');
        log('\n');

    } catch (error) {
        log(`\n❌ Error during verification: ${error.message}`, 'red');
        console.error(error);
    }
}

main();
