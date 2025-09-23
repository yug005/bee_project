const seedTrains = async (prisma) => {
    try {
        const existingTrains = await prisma.train.findMany();
        if (existingTrains.length === 0) {
            const trains = [
                { name: "Superfast Express", source: "Mumbai", destination: "Bangalore", totalSeats: 20, availableSeats: 20, time: "08:00 AM" },
                { name: "Intercity Express", source: "Pune", destination: "Mumbai", totalSeats: 50, availableSeats: 50, time: "09:30 AM" },
                { name: "Chennai Mail", source: "Bangalore", destination: "Chennai", totalSeats: 35, availableSeats: 35, time: "11:00 AM" },
                { name: "Lucknow Express", source: "New Delhi", destination: "Lucknow", totalSeats: 40, availableSeats: 40, time: "01:45 PM" },
                { name: "Gujarat Queen", source: "Mumbai", destination: "Ahmedabad", totalSeats: 60, availableSeats: 60, time: "06:20 PM" },
                { name: "Pune Junction", source: "Pune", destination: "Nagpur", totalSeats: 25, availableSeats: 25, time: "07:30 PM" }
            ];
            await prisma.train.createMany({ data: trains });
            console.log("Database seeded with initial train data.");
        } else {
            console.log("Database already contains trains. Skipping seed.");
        }
    } catch (e) {
        console.error("Error seeding database:", e);
    }
};

module.exports = { seedTrains };