require('dotenv').config();
const mongoose = require('mongoose');
const dbconnection = require('../db');
const User = require('../models/users');


const adminData = {
    name: "System Administrator",
    email: "admin@gmail.com",
    password: "Pass@123*", 
    role: "admin" 
};

const seedAdmin = async () => {
    try {

        await dbconnection();
        console.log('🔗 Connected to database...');

        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('⚠️ Admin with this email already exists. Skipping...');
            process.exit(0);
        }
        const newAdmin= await User.create(adminData);
        console.log('✅ Admin user created successfully!');
        console.log(`📧 Email: ${adminData.email}`);
        console.log(`🔑 Password: ${adminData.password} (stored as hash)`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();