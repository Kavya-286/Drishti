/**
 * Data Migration Script
 * Migrates data from localStorage structure to PostgreSQL database
 * 
 * Usage: node migrate_data.js
 * 
 * Prerequisites:
 * - PostgreSQL database with schema.sql applied
 * - Environment variables configured (DATABASE_URL)
 * - npm install pg uuid
 */

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/drishti_db',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Sample localStorage data structure (this would typically come from exported localStorage data)
const sampleLocalStorageData = {
    currentUser: {
        id: "user_1234567890",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        userType: "entrepreneur",
        phone: "+1234567890",
        location: "San Francisco, CA",
        joinDate: "2024-01-15T10:30:00Z",
        planType: "Free",
        isAuthenticated: true,
        phoneVerified: true,
        experience: "3-5-years",
        interests: "Technology, AI",
        contactDetails: {
            fullName: "John Doe",
            title: "CEO & Founder",
            company: "TechStartup Inc",
            website: "https://example.com",
            shareDetails: true,
            marketingConsent: false
        }
    },
    
    validationData: {
        startupTitle: "AI Assistant App",
        problemStatement: "Small businesses struggle with customer service automation and need intelligent solutions that can handle complex inquiries while maintaining personal touch.",
        solutionDescription: "Our AI-powered platform provides intelligent customer service automation with natural language processing and machine learning capabilities.",
        targetMarket: "Small to medium businesses with 10-500 employees",
        marketSize: "large",
        customerSegments: "SMEs, e-commerce businesses, service providers",
        revenueModel: "subscription",
        currentStage: "mvp"
    },
    
    validationResults: {
        overall_score: 78,
        viability_level: "High",
        scores: [
            { category: "Problem-Solution Fit", score: 85 },
            { category: "Market Opportunity", score: 72 },
            { category: "Business Model", score: 80 },
            { category: "Competitive Advantage", score: 75 },
            { category: "Team Strength", score: 70 },
            { category: "Execution Readiness", score: 76 }
        ],
        recommendations: [
            {
                category: "Market Research",
                recommendation: "Conduct deeper customer interviews to validate problem-solution fit"
            },
            {
                category: "Business Model",
                recommendation: "Test different pricing models with early customers"
            }
        ]
    },
    
    userNotifications: [
        {
            id: "notif_1234567890",
            recipientId: "user_1234567890",
            type: "investment_interest",
            title: "🎉 New Investment Interest!",
            message: "Jane Smith has expressed interest in your startup AI Assistant App with a $100,000 investment.",
            data: {
                investmentAmount: "100000",
                investorName: "Jane Smith",
                investorEmail: "jane@investor.com",
                investorPhone: "+1987654321"
            },
            read: false,
            createdAt: "2024-01-15T14:30:00Z"
        }
    ],
    
    publicStartupIdeas: [
        {
            id: "startup_1234567890",
            ideaName: "AI Assistant App",
            description: "Revolutionary AI platform for customer service automation",
            targetMarket: "Small to medium businesses",
            industry: "Technology",
            stage: "mvp",
            validationScore: 78,
            founder: {
                id: "user_1234567890",
                firstName: "John",
                lastName: "Doe",
                contactDetails: {
                    fullName: "John Doe",
                    email: "john@example.com",
                    phone: "+1234567890"
                }
            },
            publishedAt: "2024-01-15T12:00:00Z"
        }
    ],
    
    investmentRecords: [
        {
            id: "inv_1234567890",
            startupId: "startup_1234567890",
            startupName: "AI Assistant App",
            investorId: "investor_456",
            investmentAmount: "100000",
            investmentType: "equity",
            status: "interested",
            acknowledgedAt: "2024-01-15T16:00:00Z"
        }
    ]
};

/**
 * Hash password using bcrypt (would need bcrypt library in production)
 * For demo purposes, using a simple hash
 */
function hashPassword(password) {
    // In production, use: const bcrypt = require('bcrypt'); return bcrypt.hashSync(password, 12);
    return '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeweLIp6eD8sQ/5u6'; // Demo hash
}

/**
 * Migrate user data from localStorage to database
 */
async function migrateUsers(userData) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Insert user
        const userResult = await client.query(`
            INSERT INTO users (
                id, email, password_hash, first_name, last_name, user_type, 
                phone, phone_verified, location, plan_type, auth_provider, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (email) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                phone = EXCLUDED.phone,
                phone_verified = EXCLUDED.phone_verified,
                location = EXCLUDED.location,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        `, [
            userData.id,
            userData.email,
            hashPassword('defaultPassword123'), // Would need actual password handling
            userData.firstName,
            userData.lastName,
            userData.userType,
            userData.phone,
            userData.phoneVerified || false,
            userData.location,
            userData.planType?.toLowerCase() || 'free',
            userData.authProvider || 'email',
            userData.joinDate
        ]);
        
        const userId = userResult.rows[0].id;
        
        // Insert entrepreneur profile if user is entrepreneur
        if (userData.userType === 'entrepreneur' && userData.contactDetails) {
            await client.query(`
                INSERT INTO entrepreneur_profiles (
                    user_id, experience_level, industry_interests, company_name, 
                    title, website, share_details, marketing_consent
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (user_id) DO UPDATE SET
                    experience_level = EXCLUDED.experience_level,
                    industry_interests = EXCLUDED.industry_interests,
                    company_name = EXCLUDED.company_name,
                    title = EXCLUDED.title,
                    website = EXCLUDED.website,
                    share_details = EXCLUDED.share_details,
                    marketing_consent = EXCLUDED.marketing_consent,
                    updated_at = CURRENT_TIMESTAMP
            `, [
                userId,
                userData.experience,
                userData.interests,
                userData.contactDetails.company,
                userData.contactDetails.title,
                userData.contactDetails.website,
                userData.contactDetails.shareDetails || true,
                userData.contactDetails.marketingConsent || false
            ]);
        }
        
        await client.query('COMMIT');
        console.log(`✅ Migrated user: ${userData.email}`);
        
        return userId;
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error migrating user ${userData.email}:`, error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Migrate startup and validation data
 */
async function migrateStartups(validationData, validationResults, userData) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Insert startup
        const startupId = uuidv4();
        await client.query(`
            INSERT INTO startups (
                id, founder_id, name, description, problem_statement, solution_description,
                target_market, market_size, customer_segments, revenue_model, current_stage,
                industry, is_public, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
            startupId,
            userData.id,
            validationData.startupTitle,
            validationData.solutionDescription,
            validationData.problemStatement,
            validationData.solutionDescription,
            validationData.targetMarket,
            validationData.marketSize,
            validationData.customerSegments,
            validationData.revenueModel,
            validationData.currentStage,
            extractIndustry(validationData),
            false, // Default to not public
            new Date().toISOString()
        ]);
        
        // Insert validation results
        await client.query(`
            INSERT INTO validations (
                id, startup_id, overall_score, viability_level, scores, recommendations, validated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            uuidv4(),
            startupId,
            validationResults.overall_score,
            validationResults.viability_level.toLowerCase().replace(' ', '-'),
            JSON.stringify(validationResults.scores),
            JSON.stringify(validationResults.recommendations),
            new Date().toISOString()
        ]);
        
        await client.query('COMMIT');
        console.log(`✅ Migrated startup: ${validationData.startupTitle}`);
        
        return startupId;
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error migrating startup ${validationData.startupTitle}:`, error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Migrate notifications
 */
async function migrateNotifications(notifications) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        for (const notification of notifications) {
            await client.query(`
                INSERT INTO notifications (
                    id, recipient_id, type, title, message, data, is_read, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO NOTHING
            `, [
                notification.id,
                notification.recipientId,
                notification.type,
                notification.title,
                notification.message,
                JSON.stringify(notification.data),
                notification.read,
                notification.createdAt
            ]);
        }
        
        await client.query('COMMIT');
        console.log(`✅ Migrated ${notifications.length} notifications`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error migrating notifications:`, error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Extract industry from validation data
 */
function extractIndustry(data) {
    const text = `${data.problemStatement} ${data.solutionDescription} ${data.targetMarket}`.toLowerCase();
    
    if (text.includes('healthcare') || text.includes('medical')) return 'HealthTech';
    if (text.includes('education') || text.includes('learning')) return 'EdTech';
    if (text.includes('finance') || text.includes('payment')) return 'FinTech';
    if (text.includes('food') || text.includes('restaurant')) return 'FoodTech';
    if (text.includes('ai') || text.includes('artificial intelligence')) return 'AI/ML';
    if (text.includes('environment') || text.includes('sustainable')) return 'ClimaTech';
    
    return 'Technology';
}

/**
 * Main migration function
 */
async function migrateData() {
    console.log('🚀 Starting data migration from localStorage to PostgreSQL...\n');
    
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('✅ Database connection established\n');
        
        // Migrate users
        console.log('📥 Migrating users...');
        await migrateUsers(sampleLocalStorageData.currentUser);
        
        // Migrate startups and validations
        console.log('\n📥 Migrating startups and validations...');
        await migrateStartups(
            sampleLocalStorageData.validationData,
            sampleLocalStorageData.validationResults,
            sampleLocalStorageData.currentUser
        );
        
        // Migrate notifications
        console.log('\n📥 Migrating notifications...');
        await migrateNotifications(sampleLocalStorageData.userNotifications);
        
        console.log('\n🎉 Data migration completed successfully!');
        console.log('\n📊 Migration Summary:');
        console.log('   • Users: 1 migrated');
        console.log('   • Startups: 1 migrated');
        console.log('   • Validations: 1 migrated');
        console.log(`   • Notifications: ${sampleLocalStorageData.userNotifications.length} migrated`);
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await pool.end();
    }
}

/**
 * Export localStorage data to JSON file for backup
 */
function exportLocalStorageData() {
    const fs = require('fs');
    const exportData = {
        exportedAt: new Date().toISOString(),
        data: sampleLocalStorageData
    };
    
    fs.writeFileSync('localStorage_backup.json', JSON.stringify(exportData, null, 2));
    console.log('📄 localStorage data exported to localStorage_backup.json');
}

// Command line interface
if (require.main === module) {
    const command = process.argv[2];
    
    switch (command) {
        case 'migrate':
            migrateData();
            break;
        case 'export':
            exportLocalStorageData();
            break;
        case 'backup':
            exportLocalStorageData();
            break;
        default:
            console.log('Usage:');
            console.log('  node migrate_data.js migrate  - Migrate data to database');
            console.log('  node migrate_data.js export   - Export localStorage data to JSON');
            console.log('  node migrate_data.js backup   - Backup localStorage data to JSON');
    }
}

module.exports = {
    migrateData,
    exportLocalStorageData,
    migrateUsers,
    migrateStartups,
    migrateNotifications
};
