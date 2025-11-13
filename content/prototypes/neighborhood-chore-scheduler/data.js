// Mock Data for Prototype

const mockData = {
    user: {
        id: 1,
        name: "Alex Johnson",
        age: 14,
        rating: 4.8,
        completedChores: 12,
        totalEarned: 240,
        activeChores: 3
    },
    
    availableChores: [
        {
            id: 1,
            type: "weeding",
            typeEmoji: "🌱",
            neighbor: "Mrs. Smith",
            address: "123 Oak St",
            date: "2024-11-15",
            time: "3:00 PM",
            payment: 20,
            frequency: "Weekly",
            instructions: "Weed the front flower bed and around the mailbox",
            distance: "0.3 miles"
        },
        {
            id: 2,
            type: "trash",
            typeEmoji: "🗑️",
            neighbor: "Mr. Johnson",
            address: "145 Maple Ave",
            date: "2024-11-14",
            time: "7:00 AM",
            payment: 10,
            frequency: "Weekly",
            instructions: "Take trash and recycling bins to curb",
            distance: "0.5 miles"
        },
        {
            id: 3,
            type: "sweeping",
            typeEmoji: "🧹",
            neighbor: "Ms. Davis",
            address: "89 Pine Rd",
            date: "2024-11-16",
            time: "2:00 PM",
            payment: 15,
            frequency: "Bi-weekly",
            instructions: "Sweep driveway and front walkway",
            distance: "0.2 miles"
        },
        {
            id: 4,
            type: "weeding",
            typeEmoji: "🌱",
            neighbor: "Mr. Brown",
            address: "201 Elm St",
            date: "2024-11-17",
            time: "4:00 PM",
            payment: 25,
            frequency: "Monthly",
            instructions: "Weed entire front yard garden",
            distance: "0.7 miles"
        },
        {
            id: 5,
            type: "trash",
            typeEmoji: "🗑️",
            neighbor: "Mrs. Wilson",
            address: "67 Cedar Ln",
            date: "2024-11-15",
            time: "6:30 AM",
            payment: 12,
            frequency: "Weekly",
            instructions: "Trash bins to curb, recycling next week",
            distance: "0.4 miles"
        },
        {
            id: 6,
            type: "sweeping",
            typeEmoji: "🧹",
            neighbor: "Mr. Taylor",
            address: "134 Birch Dr",
            date: "2024-11-18",
            time: "1:00 PM",
            payment: 18,
            frequency: "Weekly",
            instructions: "Sweep driveway and clean front porch",
            distance: "0.6 miles"
        }
    ],
    
    mySchedule: [
        {
            id: 101,
            type: "weeding",
            typeEmoji: "🌱",
            neighbor: "Mrs. Anderson",
            address: "56 Willow Way",
            date: "2024-11-13",
            time: "3:00 PM",
            payment: 22,
            status: "upcoming",
            instructions: "Weed front flower beds"
        },
        {
            id: 102,
            type: "trash",
            typeEmoji: "🗑️",
            neighbor: "Mr. Martinez",
            address: "78 Spruce St",
            date: "2024-11-12",
            time: "7:00 AM",
            payment: 10,
            status: "completed",
            instructions: "Take trash to curb",
            completedDate: "2024-11-12"
        },
        {
            id: 103,
            type: "sweeping",
            typeEmoji: "🧹",
            neighbor: "Ms. Lee",
            address: "92 Ash Ave",
            date: "2024-11-14",
            time: "2:00 PM",
            payment: 15,
            status: "upcoming",
            instructions: "Sweep driveway"
        }
    ],
    
    paymentHistory: [
        {
            id: 201,
            chore: "Weeding - Mrs. Thompson",
            date: "2024-11-10",
            amount: 20,
            status: "paid"
        },
        {
            id: 202,
            chore: "Trash Cans - Mr. Garcia",
            date: "2024-11-08",
            amount: 10,
            status: "paid"
        },
        {
            id: 203,
            chore: "Driveway Sweeping - Ms. White",
            date: "2024-11-05",
            amount: 15,
            status: "paid"
        },
        {
            id: 204,
            chore: "Weeding - Mr. Harris",
            date: "2024-11-03",
            amount: 25,
            status: "paid"
        },
        {
            id: 205,
            chore: "Trash Cans - Mrs. Clark",
            date: "2024-11-01",
            amount: 12,
            status: "paid"
        }
    ],
    
    reviews: [
        {
            id: 301,
            reviewer: "Mrs. Thompson",
            rating: 5,
            date: "2024-11-10",
            text: "Alex did a fantastic job weeding my garden! Very thorough and polite. Highly recommend!"
        },
        {
            id: 302,
            reviewer: "Mr. Garcia",
            rating: 5,
            date: "2024-11-08",
            text: "Always on time and reliable. Great kid!"
        },
        {
            id: 303,
            reviewer: "Ms. White",
            rating: 4,
            date: "2024-11-05",
            text: "Good work, driveway looks great. Will hire again."
        }
    ]
};

// Calculate totals
function calculateTotals() {
    const completed = mockData.paymentHistory.length;
    const total = mockData.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
    const thisMonth = mockData.paymentHistory
        .filter(p => {
            const date = new Date(p.date);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        })
        .reduce((sum, p) => sum + p.amount, 0);
    
    return { completed, total, thisMonth };
}

