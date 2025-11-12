const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'arorayug07@gmail.com' }
        });

        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            return existingAdmin;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('yugyugyug', 10);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                username: 'admin_yug',
                email: 'arorayug07@gmail.com',
                password: hashedPassword,
                role: 'admin'
            }
        });

        console.log('✅ Admin user created successfully!');
        console.log('   Email: arorayug07@gmail.com');
        console.log('   Password: yugyugyug');
        console.log('   Role: admin');

        return admin;
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        throw error;
    }
}

module.exports = { createAdminUser };

// Run if called directly
if (require.main === module) {
    createAdminUser()
        .then(() => {
            console.log('Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
