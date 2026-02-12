/* ============================================================
   seed-users.js — Generate data/users.csv with hashed passwords
   ============================================================ */

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const SALT_ROUNDS = 10;

const users = [
    { username: 'test', password: 'test', display_name: 'Test User', role: 'Premium' },
    { username: 'krishna', password: 'welcome1', display_name: 'Krishna Gupta', role: 'Premium' },
    { username: 'jane', password: 'finance2', display_name: 'Jane Mitchell', role: 'Standard' },
];

async function seed() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const header = 'username,password_hash,display_name,role';
    const rows = [header];

    for (const u of users) {
        const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
        rows.push(`${u.username},${hash},${u.display_name},${u.role}`);
    }

    const filePath = path.join(dataDir, 'users.csv');
    fs.writeFileSync(filePath, rows.join('\n'), 'utf-8');
    console.log(`✅  Created ${filePath} with ${users.length} users:`);
    users.forEach(u => console.log(`    • ${u.username} / ${u.password}`));

    // Also create empty contacts.csv if it doesn't exist
    const contactsPath = path.join(dataDir, 'contacts.csv');
    if (!fs.existsSync(contactsPath)) {
        fs.writeFileSync(contactsPath, 'timestamp,name,email,subject,message\n', 'utf-8');
        console.log(`✅  Created ${contactsPath}`);
    }
}

seed().catch(console.error);
