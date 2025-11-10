const chalk = require('chalk');
const boxen = require('boxen');
const { AGENT_TYPES } = require('../bin/create-lucid-agent');

/**
 * List available agent templates
 * @param {Object} options - Options for filtering templates
 */
async function listTemplates(options = {}) {
  const { type } = options;
  
  console.log(chalk.blue.bold('📋 Template Agent yang Tersedia\n'));
  
  // Show all templates or filtered by type
  const templatesToShow = type && AGENT_TYPES[type] 
    ? { [type]: AGENT_TYPES[type] }
    : AGENT_TYPES;
  
  // Display templates
  let templateIndex = 1;
  for (const [typeKey, template] of Object.entries(templatesToShow)) {
    await displayTemplate(typeKey, template, templateIndex);
    templateIndex++;
  }
  
  // Show usage examples
  showUsageExamples();
  
  // Show customization options
  showCustomizationOptions();
}

/**
 * Display a single template
 */
async function displayTemplate(typeKey, template, index) {
  const templateName = `${index}. ${template.icon} ${template.name}`;
  const color = getTemplateColor(template.color);
  const header = chalk[color].bold(templateName);
  
  const templateInfo = `
${header}

${chalk.gray('Deskripsi:')} ${template.description}

${chalk.gray('Jenis:')} ${typeKey}

${chalk.gray('Fitur utama:')}
${getTemplateFeatures(typeKey).map(feature => `  • ${feature}`).join('\n')}

${chalk.gray('Use cases:')}
${getUseCases(typeKey).map(useCase => `  • ${useCase}`).join('\n')}

${chalk.gray('Teknologi yang digunakan:')}
${getTechnologies(typeKey).map(tech => `  • ${tech}`).join('\n')}`;

  console.log(boxen(templateInfo, { 
    padding: 1, 
    borderColor: color,
    borderStyle: 'round',
    margin: 1
  }));
}

/**
 * Get template color for display
 */
function getTemplateColor(color) {
  const colorMap = {
    blue: 'blue',
    green: 'green', 
    purple: 'magenta',
    magenta: 'magenta',
    yellow: 'yellow'
  };
  
  return colorMap[color] || 'gray';
}

/**
 * Get template features based on type
 */
function getTemplateFeatures(type) {
  const features = {
    macro: [
      'Task scheduling and automation',
      'Multi-step workflow processing',
      'Error handling and retry logic',
      'State persistence',
      'Event-driven architecture',
      'Plugin system for extensions'
    ],
    arbitrage: [
      'Real-time market data analysis',
      'Multi-exchange monitoring',
      'Profit opportunity detection',
      'Risk assessment algorithms',
      'Automated execution engine',
      'Portfolio management'
    ],
    game: [
      'Game state monitoring',
      'Strategy optimization',
      'Performance analytics',
      'Anti-detection mechanisms',
      'Adaptive behavior patterns',
      'Multi-game support'
    ],
    creative: [
      'Content generation algorithms',
      'Style transfer capabilities',
      'Multi-format output support',
      'Creative prompt optimization',
      'Quality assessment tools',
      'Batch processing support'
    ],
    'e-commerce': [
      'Product catalog management',
      'Order processing automation',
      'Price optimization algorithms',
      'Customer service integration',
      'Inventory management',
      'Sales analytics and reporting'
    ]
  };
  
  return features[type] || [
    'Customizable behavior',
    'Extensible architecture',
    'Performance monitoring',
    'Error handling',
    'Documentation tools'
  ];
}

/**
 * Get use cases for each template type
 */
function getUseCases(type) {
  const useCases = {
    macro: [
      'Automated report generation',
      'Data backup and synchronization',
      'Email marketing campaigns',
      'System maintenance tasks',
      'Content management workflows',
      'Customer support automation'
    ],
    arbitrage: [
      'Cryptocurrency trading opportunities',
      'Currency exchange rate arbitrage',
      'Stock price differences across markets',
      'Commodity trading strategies',
      'Sports betting opportunities',
      'Price comparison across platforms'
    ],
    game: [
      'Gaming performance optimization',
      'Automated farming and grinding',
      'Strategy testing and refinement',
      'Multi-character management',
      'Competitive gameplay assistance',
      'Achievement hunting automation'
    ],
    creative: [
      'Social media content creation',
      'Blog post and article writing',
      'Image and video generation',
      'Brand story development',
      'Marketing material creation',
      'Personalized content at scale'
    ],
    'e-commerce': [
      'Dynamic pricing optimization',
      'Inventory forecasting and management',
      'Customer behavior analysis',
      'Automated customer support',
      'Product recommendation systems',
      'Sales funnel optimization'
    ]
  };
  
  return useCases[type] || [
    'Process automation',
    'Data analysis and reporting',
    'Integration with external services',
    'User interaction handling',
    'Performance monitoring'
  ];
}

/**
 * Get technologies used by each template
 */
function getTechnologies(type) {
  const technologies = {
    macro: [
      'Task queues (Bull/Bee-Queue)',
      'Scheduler (node-cron)',
      'State management (Redux/Pinia)',
      'API integration (Axios)',
      'Database ORM (Prisma/Sequelize)',
      'Authentication (Passport.js)'
    ],
    arbitrage: [
      'Real-time data streaming (WebSockets)',
      'Market data APIs (Yahoo Finance, Alpha Vantage)',
      'Trading APIs (Binance, CCXT)',
      'Database (PostgreSQL/MongoDB)',
      'Machine learning (TensorFlow.js)',
      'Risk management tools'
    ],
    game: [
      'Game API integration',
      'Computer vision (OpenCV.js)',
      'Image processing libraries',
      'Game state analysis',
      'Performance monitoring',
      'Anti-detection techniques'
    ],
    creative: [
      'AI/ML APIs (OpenAI, Hugging Face)',
      'Image processing (Sharp/Canvas)',
      'Content management systems',
      'Template engines (Handlebars)',
      'Media optimization tools',
      'Version control for content'
    ],
    'e-commerce': [
      'E-commerce platform APIs',
      'Payment processing (Stripe, PayPal)',
      'Product catalog management',
      'Customer relationship management',
      'Analytics and reporting tools',
      'Marketing automation platforms'
    ]
  };
  
  return technologies[type] || [
    'Node.js runtime',
    'Modern JavaScript/TypeScript',
    'RESTful API integration',
    'Database connectivity',
    'Authentication systems',
    'Logging and monitoring'
  ];
}

/**
 * Show usage examples
 */
function showUsageExamples() {
  const examples = chalk.cyan.bold('\n💡 Contoh Penggunaan:\n');
  console.log(examples);
  
  const exampleCommands = [
    {
      command: 'lucid-agent create my-macro-agent --type macro',
      description: 'Buat agent macro dengan nama my-macro-agent'
    },
    {
      command: 'lucid-agent create --interactive',
      description: 'Buat agent dengan mode interaktif (akan ditanya semua opsi)'
    },
    {
      command: 'lucid-agent list-templates --type arbitrage',
      description: 'Tampilkan hanya template arbitrage'
    },
    {
      command: 'lucid-agent create crypto-arbitrage --type arbitrage --typescript',
      description: 'Buat agent arbitrage dengan TypeScript'
    },
    {
      command: 'lucid-agent create content-bot --type creative --features api,database,auth',
      description: 'Buat agent creative dengan fitur API, database, dan auth'
    }
  ];
  
  exampleCommands.forEach(({ command, description }) => {
    console.log(chalk.yellow(`  ${command}`));
    console.log(chalk.gray(`    → ${description}`));
    console.log();
  });
}

/**
 * Show customization options
 */
function showCustomizationOptions() {
  const customization = chalk.magenta.bold('\n⚙️ Opsi Kustomisasi:\n');
  console.log(customization);
  
  const customOptions = [
    {
      option: 'Bahasa Pemrograman',
      choices: ['JavaScript', 'TypeScript'],
      description: 'Pilih bahasa untuk development'
    },
    {
      option: 'Fitur Tambahan',
      choices: [
        'API Integration - Integrasi dengan API eksternal',
        'Database Integration - Koneksi ke database',
        'Authentication - Sistem otentikasi',
        'Logging System - Sistem logging terstruktur',
        'Testing Setup - Setup testing otomatis'
      ],
      description: 'Pilih fitur yang ingin diaktifkan'
    },
    {
      option: 'Project Configuration',
      choices: [
        'Package manager (npm/yarn)',
        'Testing framework (Jest/Mocha)',
        'Linting tools (ESLint/Prettier)',
        'Documentation format (JSDoc/TypeDoc)',
        'Deployment target (local/cloud)'
      ],
      description: 'Konfigurasi tools dan libraries'
    }
  ];
  
  customOptions.forEach(({ option, choices, description }) => {
    console.log(chalk.bold(`${option}:`));
    console.log(chalk.gray(`  ${description}`));
    
    if (Array.isArray(choices)) {
      choices.forEach(choice => {
        if (choice.includes(' - ')) {
          const [feature, detail] = choice.split(' - ');
          console.log(`  • ${chalk.cyan(feature)} - ${chalk.gray(detail)}`);
        } else {
          console.log(`  • ${chalk.cyan(choice)}`);
        }
      });
    }
    
    console.log();
  });
  
  // Show additional resources
  const resources = chalk.blue.bold('\n📚 Sumber Daya Tambahan:\n');
  console.log(resources);
  
  const resourceLinks = [
    '📖 Documentation: https://docs.lucid-agents.com',
    '🎯 Examples: https://github.com/lucid-agents/examples',
    '💬 Community: https://discord.gg/lucid-agents',
    '🐛 Issues: https://github.com/lucid-agents/cli/issues',
    '📧 Support: support@lucid-agents.com'
  ];
  
  resourceLinks.forEach(link => {
    console.log(`  ${link}`);
  });
  
  console.log();
}

/**
 * Show template comparison
 */
function showTemplateComparison() {
  const comparison = chalk.yellow.bold('\n🔍 Perbandingan Template:\n');
  console.log(comparison);
  
  const comparisonTable = `
┌─────────────┬──────────┬──────────────┬──────────────┐
│ Template    │ Kompleks │ Learning     │ Use Cases    │
├─────────────┼──────────┼──────────────┼──────────────┤
│ Macro       │ ⭐⭐⭐    │ ⭐⭐         │ Automation   │
│ Arbitrage   │ ⭐⭐⭐⭐⭐  │ ⭐⭐⭐⭐⭐     │ Trading      │
│ Game        │ ⭐⭐⭐⭐   │ ⭐⭐⭐⭐      │ Gaming       │
│ Creative    │ ⭐⭐⭐    │ ⭐⭐⭐       │ Content      │
│ E-commerce  │ ⭐⭐⭐⭐   │ ⭐⭐⭐       │ Business     │
└─────────────┴──────────┴──────────────┴──────────────┘
  `;
  
  console.log(comparisonTable);
  
  const legend = chalk.gray(`
Legenda:
⭐ = Level kompleksitas/pembelajaran (1-5 bintang)
  `);
  console.log(legend);
}

module.exports = {
  listTemplates
};