const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================================================
// ==========================================================================
// MYSQL CONNECTION POOL CONFIGURATION & IN-MEMORY MOCK FALLBACK
// ==========================================================================
let pool;
let isMockDb = false;

const mockDb = {
    users: [
        { id: 1, username: 'admin', password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', fullName: 'Alex Stryker', role: 'Facility Manager' },
        { id: 2, username: 'staff', password: '12552801538b33f9fcf8f3a388a101e4a64d1f278eb17604f32e9faee6e1cb1f', fullName: 'Sarah Jenkins', role: 'Front Desk Staff' }
    ],
    members: [
        { id: 'MEM-9402', firstName: 'Dorian', lastName: 'Yates', email: 'dyates@heavy-duty.com', plan: 'VIP Elite', status: 'active', renewalDate: '2026-08-12', lastCheckin: '2026-06-24 07:15:00' },
        { id: 'MEM-8114', firstName: 'Franco', lastName: 'Columbu', email: 'f.columbu@sardinia.org', plan: 'Barbell Pro', status: 'active', renewalDate: '2026-07-19', lastCheckin: '2026-06-24 06:30:00' },
        { id: 'MEM-3320', firstName: 'Larry', lastName: 'Wheels', email: 'larry@wheels-lift.com', plan: 'VIP Elite', status: 'active', renewalDate: '2026-09-02', lastCheckin: '2026-06-23 16:45:00' },
        { id: 'MEM-1209', firstName: 'Jay', lastName: 'Cutler', email: 'jcutler@quads.com', plan: 'Barbell Pro', status: 'active', renewalDate: '2026-06-30', lastCheckin: '2026-06-24 08:12:00' },
        { id: 'MEM-7741', firstName: 'Serge', lastName: 'Nubret', email: 'snubret@paris-gym.fr', plan: 'Standard Fit', status: 'suspended', renewalDate: '2026-06-15', lastCheckin: '2026-06-14 09:00:00' },
        { id: 'MEM-4882', firstName: 'Reg', lastName: 'Park', email: 'reg@park-iron.co.uk', plan: 'Barbell Pro', status: 'active', renewalDate: '2026-10-05', lastCheckin: '2026-06-24 08:35:00' },
        { id: 'MEM-5012', firstName: 'Ronnie', lastName: 'Coleman', email: 'rcoleman@lightweight.com', plan: 'VIP Elite', status: 'active', renewalDate: '2026-06-29', lastCheckin: '2026-06-24 05:00:00' },
        { id: 'MEM-2940', firstName: 'Rich', lastName: 'Gaspari', email: 'rich@gaspari-nutr.com', plan: 'Standard Fit', status: 'expired', renewalDate: '2026-06-20', lastCheckin: '2026-06-19 18:15:00' },
        { id: 'MEM-6691', firstName: 'Tom', lastName: 'Platz', email: 'squatking@platz-quads.net', plan: 'Barbell Pro', status: 'active', renewalDate: '2026-07-28', lastCheckin: '2026-06-24 08:48:00' },
        { id: 'MEM-1052', firstName: 'Mike', lastName: 'Mentzer', email: 'mentzer@heavy-duty.com', plan: 'Standard Fit', status: 'expired', renewalDate: '2026-06-10', lastCheckin: '2026-06-09 08:00:00' },
        { id: 'MEM-1994', firstName: 'Chris', lastName: 'Bumstead', email: 'cbum@cbum-classic.ca', plan: 'VIP Elite', status: 'active', renewalDate: '2026-11-22', lastCheckin: '2026-06-23 14:22:00' },
        { id: 'MEM-2091', firstName: 'Ed', lastName: 'Coan', email: 'edcoan@powerlifting.org', plan: 'VIP Elite', status: 'active', renewalDate: '2026-12-01', lastCheckin: '2026-06-24 06:05:00' },
        { id: 'MEM-3301', firstName: 'Bill', lastName: 'Pearl', email: 'bpearl@pearl-strength.com', plan: 'Standard Fit', status: 'active', renewalDate: '2026-07-05', lastCheckin: '2026-06-22 10:10:00' },
        { id: 'MEM-8802', firstName: 'Lenda', lastName: 'Murray', email: 'lmurray@pro-physique.com', plan: 'Barbell Pro', status: 'active', renewalDate: '2026-09-14', lastCheckin: '2026-06-23 11:30:00' }
    ],
    classes: [
        { id: 1, name: 'Barbell Strength Foundations', trainer: 'Coach Stryker', capacity: 20, booked: 18, day: 'Mon', time_slot: '08:00 AM' },
        { id: 2, name: 'Powerlifting Heavy Duty', trainer: 'Coach Yates', capacity: 12, booked: 12, day: 'Mon', time_slot: '06:00 PM' },
        { id: 3, name: 'Mobility & Squat Depth', trainer: 'Coach Platz', capacity: 25, booked: 14, day: 'Tue', time_slot: '08:00 AM' },
        { id: 4, name: 'Olympic Weightlifting Tech', trainer: 'Coach Murray', capacity: 15, booked: 9, day: 'Tue', time_slot: '04:00 PM' },
        { id: 5, name: 'HIIT Conditioning', trainer: 'Coach Wheels', capacity: 30, booked: 21, day: 'Wed', time_slot: '08:00 AM' },
        { id: 6, name: 'Heavy Bench & Deadlift Day', trainer: 'Coach Stryker', capacity: 20, booked: 20, day: 'Wed', time_slot: '06:00 PM' },
        { id: 7, name: 'Barbell Strength Foundations', trainer: 'Coach Stryker', capacity: 20, booked: 15, day: 'Thu', time_slot: '08:00 AM' },
        { id: 8, name: 'High Intensity Fatigue Intro', trainer: 'Coach Mentzer', capacity: 10, booked: 8, day: 'Thu', time_slot: '04:00 PM' },
        { id: 9, name: 'Strongman Carry & Pulls', trainer: 'Coach Wheels', capacity: 16, booked: 15, day: 'Fri', time_slot: '06:00 PM' },
        { id: 10, name: 'Weekend Powerlifting Prep', trainer: 'Coach Yates', capacity: 15, booked: 11, day: 'Sat', time_slot: '10:00 AM' },
        { id: 11, name: 'Sunday Recovery & Stretch', trainer: 'Coach Platz', capacity: 25, booked: 5, day: 'Sun', time_slot: '12:00 PM' }
    ],
    invoices: [
        { id: 'INV-1845', member_id: 'MEM-9402', amount: 120.00, due_date: '2026-06-25', status: 'Paid' },
        { id: 'INV-1844', member_id: 'MEM-8114', amount: 65.00, due_date: '2026-06-24', status: 'Paid' },
        { id: 'INV-1843', member_id: 'MEM-1209', amount: 65.00, due_date: '2026-06-24', status: 'Paid' },
        { id: 'INV-1842', member_id: 'MEM-7741', amount: 45.00, due_date: '2026-06-15', status: 'Pending' },
        { id: 'INV-1841', member_id: 'MEM-2940', amount: 45.00, due_date: '2026-06-20', status: 'Overdue' },
        { id: 'INV-1840', member_id: 'MEM-1052', amount: 45.00, due_date: '2026-06-10', status: 'Overdue' },
        { id: 'INV-1839', member_id: 'MEM-5012', amount: 120.00, due_date: '2026-06-08', status: 'Paid' },
        { id: 'INV-1838', member_id: 'MEM-6691', amount: 65.00, due_date: '2026-06-05', status: 'Paid' },
        { id: 'INV-1837', member_id: 'MEM-1994', amount: 120.00, due_date: '2026-05-22', status: 'Paid' },
        { id: 'INV-1836', member_id: 'MEM-4882', amount: 65.00, due_date: '2026-05-15', status: 'Overdue' }
    ],
    checkins: [
        { id: 1, member_id: 'MEM-9402', checkin_time: '2026-06-24 07:15:00' },
        { id: 2, member_id: 'MEM-8114', checkin_time: '2026-06-24 06:30:00' },
        { id: 3, member_id: 'MEM-1209', checkin_time: '2026-06-24 08:12:00' },
        { id: 4, member_id: 'MEM-4882', checkin_time: '2026-06-24 08:35:00' },
        { id: 5, member_id: 'MEM-6691', checkin_time: '2026-06-24 08:48:00' }
    ]
};

function executeMockQuery(sql, params = []) {
    const query = sql.replace(/\s+/g, " ").trim();
    
    if (query.includes("FROM users WHERE username = ? AND password = ?")) {
        const u = mockDb.users.find(x => x.username === params[0] && x.password === params[1]);
        return [u ? [u] : []];
    }
    
    if (query.includes("SELECT COUNT(*) as count FROM members WHERE status = 'active'")) {
        const count = mockDb.members.filter(x => x.status === 'active').length;
        return [[{ count }]];
    }
    
    if (query.includes("SELECT COUNT(*) as count FROM checkins WHERE DATE(checkin_time) = CURDATE()")) {
        const count = mockDb.checkins.filter(x => x.checkin_time.startsWith("2026-06-24")).length;
        return [[{ count }]];
    }
    
    if (query.includes("SELECT SUM(amount) as total FROM invoices WHERE status = 'Paid'")) {
        const total = mockDb.invoices.filter(x => x.status === 'Paid').reduce((sum, x) => sum + parseFloat(x.amount), 0);
        return [[{ total }]];
    }
    
    if (query.includes("SELECT SUM(amount) as total FROM invoices WHERE status = 'Overdue'")) {
        const total = mockDb.invoices.filter(x => x.status === 'Overdue').reduce((sum, x) => sum + parseFloat(x.amount), 0);
        return [[{ total }]];
    }
    
    if (query.includes("SELECT COUNT(*) as count FROM invoices WHERE status = 'Pending'")) {
        const count = mockDb.invoices.filter(x => x.status === 'Pending').length;
        return [[{ count }]];
    }
    
    if (query.includes("SELECT c.member_id as memberId, CONCAT(m.first_name, ' ', m.last_name) as name, DATE_FORMAT(c.checkin_time, '%h:%i %p') as time FROM checkins c JOIN members m ON c.member_id = m.id")) {
        const results = mockDb.checkins.map(c => {
            const m = mockDb.members.find(x => x.id === c.member_id);
            const parts = c.checkin_time.split(" ")[1].split(":");
            let hours = parseInt(parts[0]);
            const minutes = parts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return {
                memberId: c.member_id,
                name: m ? `${m.firstName} ${m.lastName}` : "Unknown Member",
                time: `${hours}:${minutes} ${ampm}`,
                checkin_time: c.checkin_time
            };
        });
        results.sort((a, b) => b.checkin_time.localeCompare(a.checkin_time));
        return [results.slice(0, 5)];
    }
    
    if (query.includes("SELECT DAYNAME(checkin_time) as day_name, COUNT(*) as count FROM checkins")) {
        const counts = { 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0 };
        mockDb.checkins.forEach(c => {
            if (c.checkin_time.startsWith("2026-06-24")) {
                counts['Wednesday']++;
            } else if (c.checkin_time.startsWith("2026-06-23")) {
                counts['Tuesday']++;
            } else if (c.checkin_time.startsWith("2026-06-22")) {
                counts['Monday']++;
            }
        });
        const rows = Object.keys(counts).map(day => ({
            day_name: day,
            count: counts[day]
        }));
        return [rows];
    }
    
    if (query.includes("FROM members WHERE 1=1")) {
        let list = [...mockDb.members];
        let pIdx = 0;
        
        if (query.includes("AND (id LIKE ?")) {
            const search = params[pIdx].replace(/%/g, "").toLowerCase();
            list = list.filter(m => 
                m.id.toLowerCase().includes(search) ||
                m.firstName.toLowerCase().includes(search) ||
                m.lastName.toLowerCase().includes(search) ||
                m.email.toLowerCase().includes(search)
            );
            pIdx += 4;
        }
        
        if (query.includes("AND status = ?")) {
            const status = params[pIdx++];
            list = list.filter(m => m.status === status);
        }
        
        if (query.includes("AND plan = ?")) {
            const plan = params[pIdx++];
            list = list.filter(m => m.plan === plan);
        }
        
        if (query.startsWith("SELECT COUNT(*)")) {
            return [[{ count: list.length }]];
        }
        
        list.sort((a, b) => b.id.localeCompare(a.id));
        
        if (query.includes("LIMIT ? OFFSET ?")) {
            const limit = params[pIdx++];
            const offset = params[pIdx++];
            list = list.slice(offset, offset + limit);
        }
        
        const mapped = list.map(m => ({
            id: m.id,
            first_name: m.firstName,
            last_name: m.lastName,
            email: m.email,
            plan: m.plan,
            status: m.status,
            renewal_date: m.renewalDate,
            last_checkin: m.lastCheckin
        }));
        return [mapped];
    }
    
    if (query.includes("SELECT * FROM members WHERE id = ?")) {
        const m = mockDb.members.find(x => x.id === params[0]);
        if (m) {
            return [[{
                id: m.id,
                first_name: m.firstName,
                last_name: m.lastName,
                email: m.email,
                plan: m.plan,
                status: m.status,
                renewal_date: m.renewalDate,
                last_checkin: m.lastCheckin
            }]];
        }
        return [[]];
    }
    
    if (query.includes("INSERT INTO members")) {
        const [id, firstName, lastName, email, plan, status, renewal_date] = params;
        if (mockDb.members.some(x => x.email === email)) {
            const err = new Error("Email exists");
            err.code = 'ER_DUP_ENTRY';
            throw err;
        }
        mockDb.members.push({
            id, firstName, lastName, email, plan, status, renewalDate: renewal_date, lastCheckin: null
        });
        return [{ affectedRows: 1 }];
    }
    
    if (query.includes("INSERT INTO invoices")) {
        const [id, member_id, amount, due_date, status] = params;
        mockDb.invoices.push({
            id, member_id, amount: parseFloat(amount), due_date, status
        });
        return [{ affectedRows: 1 }];
    }
    
    if (query.includes("UPDATE members SET first_name")) {
        const [firstName, lastName, email, plan, status, id] = params;
        const m = mockDb.members.find(x => x.id === id);
        if (m) {
            m.firstName = firstName;
            m.lastName = lastName;
            m.email = email;
            m.plan = plan;
            m.status = status;
        }
        return [{ affectedRows: 1 }];
    }
    
    if (query.includes("DELETE FROM members WHERE id = ?")) {
        const [id] = params;
        mockDb.members = mockDb.members.filter(x => x.id !== id);
        mockDb.invoices = mockDb.invoices.filter(x => x.member_id !== id);
        mockDb.checkins = mockDb.checkins.filter(x => x.member_id !== id);
        return [{ affectedRows: 1 }];
    }
    
    if (query.includes("SELECT * FROM classes")) {
        return [mockDb.classes];
    }
    
    if (query.includes("INSERT INTO classes")) {
        const [name, trainer, capacity, day, time_slot] = params;
        const newId = mockDb.classes.length + 1;
        mockDb.classes.push({
            id: newId, name, trainer, capacity, booked: 0, day, time_slot
        });
        return [{ affectedRows: 1 }];
    }
    
    if (query.includes("SELECT booked, capacity FROM classes WHERE id = ?")) {
        const cls = mockDb.classes.find(x => x.id == params[0]);
        return [cls ? [cls] : []];
    }
    
    if (query.includes("UPDATE classes SET booked = booked + ? WHERE id = ?")) {
        const [inc, id] = params;
        const cls = mockDb.classes.find(x => x.id == id);
        if (cls) {
            cls.booked += inc;
        }
        return [{ affectedRows: 1 }];
    }
    
    if (query.includes("FROM invoices i JOIN members m ON i.member_id = m.id")) {
        let list = mockDb.invoices.map(i => {
            const m = mockDb.members.find(x => x.id === i.member_id);
            return {
                id: i.id,
                memberId: i.member_id,
                memberName: m ? `${m.firstName} ${m.lastName}` : "Unknown Member",
                plan: m ? m.plan : "Standard Fit",
                dueDate: i.due_date,
                amount: parseFloat(i.amount),
                status: i.status
            };
        });
        if (query.includes("WHERE i.status = ?")) {
            const status = params[0];
            list = list.filter(x => x.status === status);
        }
        list.sort((a, b) => b.id.localeCompare(a.id));
        return [list];
    }
    
    if (query.includes("SELECT member_id, amount FROM invoices WHERE id = ?")) {
        const inv = mockDb.invoices.find(x => x.id === params[0]);
        return [inv ? [inv] : []];
    }
    
    if (query.includes("UPDATE invoices SET status = 'Paid' WHERE id = ?")) {
        const inv = mockDb.invoices.find(x => x.id === params[0]);
        if (inv) {
            inv.status = 'Paid';
        }
        return [{ affectedRows: 1 }];
    }
    
    if (query.includes("UPDATE members SET status = 'active', renewal_date = ? WHERE id = ? AND status != 'active'")) {
        const [renewalDate, memberId] = params;
        const m = mockDb.members.find(x => x.id === memberId && x.status !== 'active');
        if (m) {
            m.status = 'active';
            m.renewalDate = renewalDate;
        }
        return [{ affectedRows: 1 }];
    }
    
    if (query.includes("INSERT INTO checkins")) {
        const [memberId] = params;
        const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
        mockDb.checkins.push({
            id: mockDb.checkins.length + 1,
            member_id: memberId,
            checkin_time: nowStr
        });
        return [{ affectedRows: 1 }];
    }
    
    if (query.includes("UPDATE members SET last_checkin = NOW() WHERE id = ?")) {
        const [id] = params;
        const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const m = mockDb.members.find(x => x.id === id);
        if (m) {
            m.lastCheckin = nowStr;
        }
        return [{ affectedRows: 1 }];
    }
    
    console.error(`[Mock Database] Unhandled query: ${query}`);
    return [[]];
}

function initMockDb() {
    isMockDb = true;
    console.log("[Database Fallback] Real MySQL Connection unavailable. Activating In-Memory Sandbox Mock Database.");
    pool = {
        async getConnection() {
            return {
                async release() {}
            };
        },
        async query(sql, params = []) {
            try {
                return executeMockQuery(sql, params);
            } catch (err) {
                console.error(`[Mock Database Error] query failed: ${sql}`, err);
                throw err;
            }
        }
    };
}

try {
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'apex_gym_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    });
    console.log(`[Database] Connection pool initialized for database: ${process.env.DB_NAME || 'apex_gym_db'}`);
    
    // Test connection on startup
    (async () => {
        try {
            const connection = await pool.getConnection();
            connection.release();
            console.log("[Database] Real MySQL connection verified successfully.");
        } catch (err) {
            console.warn(`[Database Warning] Real MySQL connection failed: ${err.message}. Switching to In-Memory Sandbox Mock Database.`);
            initMockDb();
        }
    })();
} catch (err) {
    console.error(`[Database Error] Pool creation failure: ${err.message}. Initializing fallback mock database.`);
    initMockDb();
}

// Database connectivity verification middleware
async function checkDbConnection(req, res, next) {
    if (isMockDb) {
        return next();
    }
    try {
        const connection = await pool.getConnection();
        connection.release();
        next();
    } catch (err) {
        console.warn(`[Database Error] Request failed connection check: ${err.message}. Initializing fallback mock database.`);
        initMockDb();
        next();
    }
}

// Apply DB connection check to all API endpoints
app.use('/api', checkDbConnection);

// In-memory active session tokens cache
const activeSessions = new Set();

// ==========================================================================
// 0. AUTHENTICATION ENDPOINT
// ==========================================================================
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        // Hash password with SHA-256
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        
        // Query users table
        const [rows] = await pool.query(
            "SELECT id, username, full_name as fullName, role FROM users WHERE username = ? AND password = ?",
            [username, hashedPassword]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const user = rows[0];
        
        // Generate simple hexadecimal token
        const token = crypto.randomBytes(32).toString('hex');
        activeSessions.add(token);

        res.json({
            message: "Login successful",
            token: token,
            user: {
                username: user.username,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error", detail: err.message });
    }
});

// Authentication verification middleware
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!activeSessions.has(token)) {
        return res.status(401).json({ error: "Session expired or invalid" });
    }

    next();
}

// Protect all subsequent API endpoints
app.use('/api', requireAuth);


// ==========================================================================
// 1. OVERVIEW ENDPOINTS
// ==========================================================================
app.get('/api/overview', async (req, res) => {
    try {
        // Fetch Active Members Count
        const [activeRes] = await pool.query("SELECT COUNT(*) as count FROM members WHERE status = 'active'");
        const activeCount = activeRes[0].count;

        // Fetch Today's Checkins Count
        const [checkinsRes] = await pool.query("SELECT COUNT(*) as count FROM checkins WHERE DATE(checkin_time) = CURDATE()");
        const checkinsCount = checkinsRes[0].count;

        // Fetch Total Revenue MTD (Paid invoices sum)
        const [revenueRes] = await pool.query("SELECT SUM(amount) as total FROM invoices WHERE status = 'Paid'");
        const revenueValue = revenueRes[0].total || 0;

        // Fetch Outstanding Overdue Sum
        const [overdueRes] = await pool.query("SELECT SUM(amount) as total FROM invoices WHERE status = 'Overdue'");
        const overdueValue = overdueRes[0].total || 0;

        // Fetch Pending Invoices Count
        const [pendingInvoicesRes] = await pool.query("SELECT COUNT(*) as count FROM invoices WHERE status = 'Pending'");
        const pendingCount = pendingInvoicesRes[0].count;

        // Fetch Live Check-in Stream (Last 5 check-ins)
        const [liveStream] = await pool.query(`
            SELECT c.member_id as memberId, 
                   CONCAT(m.first_name, ' ', m.last_name) as name, 
                   DATE_FORMAT(c.checkin_time, '%h:%i %p') as time 
            FROM checkins c 
            JOIN members m ON c.member_id = m.id 
            ORDER BY c.checkin_time DESC 
            LIMIT 5
        `);

        // Fetch Attendance trend for chart (aggregate past 7 days checkin volumes)
        // Average attendance constant mapping (Mon -> Sun)
        const averageTrend = [85, 92, 104, 78, 95, 115, 60];
        const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const currentTrend = [0, 0, 0, 0, 0, 0, 0];

        // Fetch checkins for this week to map counts
        const [weeklyCheckins] = await pool.query(`
            SELECT DAYNAME(checkin_time) as day_name, COUNT(*) as count
            FROM checkins
            WHERE YEARWEEK(checkin_time, 1) = YEARWEEK(CURDATE(), 1)
            GROUP BY DAYNAME(checkin_time)
        `);

        // Map English day names to abbreviated calendar array index
        const dayMap = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };
        weeklyCheckins.forEach(row => {
            const index = dayMap[row.day_name];
            if (index !== undefined) {
                currentTrend[index] = row.count;
            }
        });

        // Simulating Wednesday as current day context matching seed logs
        // If currentTrend Wednesday matches index 2, fill others as simulated fallback if empty
        if (currentTrend.reduce((a, b) => a + b, 0) === 0) {
            currentTrend[0] = 12; // simulated Monday
            currentTrend[1] = 18; // simulated Tuesday
            currentTrend[2] = checkinsCount; // live today checkins
        }

        res.json({
            stats: {
                activeMembers: activeCount,
                checkinsToday: checkinsCount,
                monthlyRevenue: parseFloat(revenueValue),
                overdueOutstanding: parseFloat(overdueValue),
                pendingInvoices: pendingCount
            },
            liveCheckins: liveStream,
            attendanceChart: {
                days: weekdays,
                average: averageTrend,
                current: currentTrend
            },
            isMockDb: isMockDb
        });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error", detail: err.message });
    }
});


// ==========================================================================
// 2. MEMBER REGISTRY CRUD ENDPOINTS
// ==========================================================================

// Get Members (Search, Filter, Paginate)
app.get('/api/members', async (req, res) => {
    try {
        const search = req.query.search || '';
        const status = req.query.status || 'all';
        const plan = req.query.plan || 'all';
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '8');
        const offset = (page - 1) * limit;

        let query = "SELECT *, DATE_FORMAT(last_checkin, '%Y-%m-%d %h:%i %p') as lastCheckin, DATE_FORMAT(renewal_date, '%Y-%m-%d') as renewalDate FROM members WHERE 1=1";
        let countQuery = "SELECT COUNT(*) as count FROM members WHERE 1=1";
        let params = [];
        let countParams = [];

        if (search) {
            const searchWildcard = `%${search}%`;
            const searchFilter = " AND (id LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)";
            query += searchFilter;
            countQuery += searchFilter;
            params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
            countParams.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
        }

        if (status !== 'all') {
            query += " AND status = ?";
            countQuery += " AND status = ?";
            params.push(status);
            countParams.push(status);
        }

        if (plan !== 'all') {
            query += " AND plan = ?";
            countQuery += " AND plan = ?";
            params.push(plan);
            countParams.push(plan);
        }

        // Add Sorting & Pagination to main query
        query += " ORDER BY id DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        // Fetch counts and records
        const [countRes] = await pool.query(countQuery, countParams);
        const [membersRes] = await pool.query(query, params);

        res.json({
            total: countRes[0].count,
            members: membersRes.map(m => ({
                id: m.id,
                firstName: m.first_name,
                lastName: m.last_name,
                email: m.email,
                plan: m.plan,
                status: m.status,
                renewalDate: m.renewalDate,
                lastCheckin: m.lastCheckin
            }))
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch members", detail: err.message });
    }
});

// Create Member
app.post('/api/members', async (req, res) => {
    const { firstName, lastName, email, plan, status } = req.body;
    
    if (!firstName || !lastName || !email || !plan || !status) {
        return res.status(400).json({ error: "Missing required profile parameters" });
    }

    try {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const newId = `MEM-${randomNum}`;
        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + 1); // 1 month out
        const renewalStr = renewalDate.toISOString().split('T')[0];

        // Insert member record
        await pool.query(
            "INSERT INTO members (id, first_name, last_name, email, plan, status, renewal_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [newId, firstName, lastName, email, plan, status, renewalStr]
        );

        // Auto generate first billing invoice for new member
        let amt = 65.00;
        if (plan === "VIP Elite") amt = 120.00;
        if (plan === "Standard Fit") amt = 45.00;

        const invNum = Math.floor(1846 + Math.random() * 100);
        const invoiceId = `INV-${invNum}`;

        await pool.query(
            "INSERT INTO invoices (id, member_id, amount, due_date, status) VALUES (?, ?, ?, ?, ?)",
            [invoiceId, newId, amt, renewalStr, "Pending"]
        );

        res.status(201).json({ id: newId, message: "Member profile generated successfully." });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "A member with this email address already exists." });
        }
        res.status(500).json({ error: "Failed to insert member record", detail: err.message });
    }
});

// Update Member Profile
app.put('/api/members/:id', async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, plan, status } = req.body;

    try {
        await pool.query(
            "UPDATE members SET first_name = ?, last_name = ?, email = ?, plan = ?, status = ? WHERE id = ?",
            [firstName, lastName, email, plan, status, id]
        );
        res.json({ message: "Profile updated successfully." });
    } catch (err) {
        res.status(500).json({ error: "Failed to update record", detail: err.message });
    }
});

// Delete Member Record
app.delete('/api/members/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM members WHERE id = ?", [id]);
        res.json({ message: "Record removed successfully." });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete record", detail: err.message });
    }
});


// ==========================================================================
// 3. SCHEDULER ENDPOINTS
// ==========================================================================

// Get All Classes
app.get('/api/classes', async (req, res) => {
    try {
        const [classesRes] = await pool.query("SELECT * FROM classes");
        res.json(classesRes);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch classes schedule", detail: err.message });
    }
});

// Create New Session Slot
app.post('/api/classes', async (req, res) => {
    const { name, trainer, capacity, day, timeSlot } = req.body;
    try {
        await pool.query(
            "INSERT INTO classes (name, trainer, capacity, booked, day, time_slot) VALUES (?, ?, ?, 0, ?, ?)",
            [name, trainer, capacity, day, timeSlot]
        );
        res.status(201).json({ message: "Session slot published." });
    } catch (err) {
        res.status(500).json({ error: "Failed to publish schedule", detail: err.message });
    }
});

// Class Session Booking / Cancellation Toggle
app.post('/api/classes/:id/book', async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'book' or 'cancel'

    try {
        const increment = action === 'book' ? 1 : -1;
        
        // Fetch current session details
        const [rows] = await pool.query("SELECT booked, capacity FROM classes WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Class session not found" });
        }
        
        const currentBooked = rows[0].booked;
        const capacity = rows[0].capacity;

        if (action === 'book' && currentBooked >= capacity) {
            return res.status(400).json({ error: "Registration failed. Class is fully booked." });
        }

        if (action === 'cancel' && currentBooked <= 0) {
            return res.status(400).json({ error: "Cancellation invalid. Booked count is zero." });
        }

        await pool.query("UPDATE classes SET booked = booked + ? WHERE id = ?", [increment, id]);
        
        res.json({ message: `Class reservation updated. Action: ${action}` });
    } catch (err) {
        res.status(500).json({ error: "Failed to adjust booking stats", detail: err.message });
    }
});


// ==========================================================================
// 4. BILLING & TRANSACTION ENDPOINTS
// ==========================================================================

// Get All Invoices (Status Filter)
app.get('/api/invoices', async (req, res) => {
    try {
        const status = req.query.status || 'all';
        let query = `
            SELECT i.id, i.member_id as memberId, 
                   CONCAT(m.first_name, ' ', m.last_name) as memberName, 
                   m.plan, DATE_FORMAT(i.due_date, '%Y-%m-%d') as dueDate, 
                   i.amount, i.status 
            FROM invoices i
            JOIN members m ON i.member_id = m.id
        `;
        let params = [];

        if (status !== 'all') {
            query += " WHERE i.status = ?";
            params.push(status);
        }
        
        query += " ORDER BY i.id DESC";

        const [invoicesRes] = await pool.query(query, params);
        
        // Format decimal values
        const formattedInvoices = invoicesRes.map(inv => ({
            id: inv.id,
            memberId: inv.memberId,
            memberName: inv.memberName,
            plan: inv.plan,
            dueDate: inv.dueDate,
            amount: parseFloat(inv.amount),
            status: inv.status
        }));

        res.json(formattedInvoices);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch transaction invoices", detail: err.message });
    }
});

// Pay Invoice & Settle Member Account Status
app.post('/api/invoices/:id/pay', async (req, res) => {
    const { id } = req.params;

    try {
        const [invRes] = await pool.query("SELECT member_id, amount FROM invoices WHERE id = ?", [id]);
        if (invRes.length === 0) {
            return res.status(404).json({ error: "Invoice record not found" });
        }

        const memberId = invRes[0].member_id;

        // Set status to Paid
        await pool.query("UPDATE invoices SET status = 'Paid' WHERE id = ?", [id]);

        // Auto-reactive member if they were suspended or expired
        const renewalDate = new Date();
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        const renewalStr = renewalDate.toISOString().split('T')[0];

        await pool.query(
            "UPDATE members SET status = 'active', renewal_date = ? WHERE id = ? AND status != 'active'",
            [renewalStr, memberId]
        );

        res.json({ message: `Payment verified. Member ${memberId} account status synchronized.` });
    } catch (err) {
        res.status(500).json({ error: "Failed to process database payment transaction", detail: err.message });
    }
});


// ==========================================================================
// 5. GATED ACCESS CHECK-IN GATEWAY ENDPOINT
// ==========================================================================
app.post('/api/checkin', async (req, res) => {
    const { memberId } = req.body;
    
    if (!memberId) {
        return res.status(400).json({ error: "Member ID parameter is missing" });
    }

    try {
        // Query member profile
        const [rows] = await pool.query("SELECT * FROM members WHERE id = ?", [memberId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Profile ID invalid or unregistered." });
        }

        const member = rows[0];

        if (member.status !== 'active') {
            return res.status(403).json({ 
                error: "Access Denied", 
                message: `Gym access blocked: membership card is ${member.status.toUpperCase()}.` 
            });
        }

        // Insert new checkin transaction record
        await pool.query("INSERT INTO checkins (member_id, checkin_time) VALUES (?, NOW())", [memberId]);

        // Update member profile last check-in timestamp
        await pool.query("UPDATE members SET last_checkin = NOW() WHERE id = ?", [memberId]);

        res.json({
            message: "Access Granted",
            memberName: `${member.first_name} ${member.last_name}`,
            plan: member.plan
        });
    } catch (err) {
        res.status(500).json({ error: "Check-in transaction failure", detail: err.message });
    }
});


// ==========================================================================
// SERVE STATIC CLIENT BUILD IN PRODUCTION
// ==========================================================================
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(PORT, () => {
    console.log(`[Backend Server] Server running successfully on port ${PORT}`);
});
