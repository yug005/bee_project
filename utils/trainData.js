// Comprehensive Train Routes Data - 100+ Trains

const trainData = [
    // Rajdhani Express Trains
    { trainNumber: "12951", name: "Mumbai Rajdhani", from: "MMCT", to: "NDLS", type: "Rajdhani", class: "AC 2-Tier", departure: "16:35", arrival: "08:35", duration: "16h 00m", price: 2500, seats: 72 },
    { trainNumber: "12301", name: "Howrah Rajdhani", from: "HWH", to: "NDLS", type: "Rajdhani", class: "AC 2-Tier", departure: "16:55", arrival: "10:05", duration: "17h 10m", price: 2100, seats: 72 },
    { trainNumber: "12431", name: "Trivandrum Rajdhani", from: "TVC", to: "NDLS", type: "Rajdhani", class: "AC 2-Tier", departure: "15:00", arrival: "11:00", duration: "44h 00m", price: 3200, seats: 72 },
    { trainNumber: "12953", name: "August Kranti Rajdhani", from: "MMCT", to: "NDLS", type: "Rajdhani", class: "AC 2-Tier", departure: "17:05", arrival: "09:20", duration: "16h 15m", price: 2600, seats: 72 },
    { trainNumber: "12423", name: "Dibrugarh Rajdhani", from: "DBRG", to: "NDLS", type: "Rajdhani", class: "AC 2-Tier", departure: "16:00", arrival: "13:15", duration: "45h 15m", price: 3500, seats: 72 },
    
    // Shatabdi Express Trains
    { trainNumber: "12001", name: "Bhopal Shatabdi", from: "NDLS", to: "BPL", type: "Shatabdi", class: "AC Chair Car", departure: "06:00", arrival: "13:45", duration: "7h 45m", price: 1850, seats: 50 },
    { trainNumber: "12009", name: "Mumbai Shatabdi", from: "MMCT", to: "ADI", type: "Shatabdi", class: "AC Chair Car", departure: "06:25", arrival: "13:40", duration: "7h 15m", price: 1500, seats: 50 },
    { trainNumber: "12011", name: "Kalka Shatabdi", from: "NDLS", to: "KLK", type: "Shatabdi", class: "AC Chair Car", departure: "07:40", arrival: "11:50", duration: "4h 10m", price: 1200, seats: 50 },
    { trainNumber: "12017", name: "Dehradun Shatabdi", from: "NDLS", to: "DDN", type: "Shatabdi", class: "AC Chair Car", departure: "06:50", arrival: "12:40", duration: "5h 50m", price: 1400, seats: 50 },
    { trainNumber: "12027", name: "Bangalore Shatabdi", from: "SBC", to: "MYS", type: "Shatabdi", class: "AC Chair Car", departure: "12:00", arrival: "14:30", duration: "2h 30m", price: 650, seats: 50 },
    
    // Duronto Express Trains
    { trainNumber: "12213", name: "Yuva Duronto", from: "HWH", to: "NDLS", type: "Duronto", class: "AC 3-Tier", departure: "15:50", arrival: "09:55", duration: "17h 05m", price: 2100, seats: 64 },
    { trainNumber: "12259", name: "Sealdah Duronto", from: "SDAH", to: "NDLS", type: "Duronto", class: "AC 3-Tier", departure: "16:05", arrival: "08:40", duration: "16h 35m", price: 2000, seats: 64 },
    { trainNumber: "12263", name: "Pune Duronto", from: "PUNE", to: "NDLS", type: "Duronto", class: "AC 3-Tier", departure: "05:00", arrival: "22:45", duration: "17h 45m", price: 2200, seats: 64 },
    { trainNumber: "12273", name: "Howrah Duronto", from: "HWH", to: "NDLS", type: "Duronto", class: "AC 2-Tier", departure: "22:30", arrival: "11:30", duration: "13h 00m", price: 2300, seats: 64 },
    
    // Vande Bharat Express Trains
    { trainNumber: "22439", name: "Vande Bharat Express", from: "NDLS", to: "BSB", type: "Vande Bharat", class: "Executive Chair", departure: "06:00", arrival: "14:00", duration: "8h 00m", price: 1800, seats: 44 },
    { trainNumber: "22435", name: "Vande Bharat Express", from: "NDLS", to: "ASR", type: "Vande Bharat", class: "Executive Chair", departure: "06:10", arrival: "12:45", duration: "6h 35m", price: 1600, seats: 44 },
    { trainNumber: "20901", name: "Vande Bharat Express", from: "MMCT", to: "ADI", type: "Vande Bharat", class: "Executive Chair", departure: "06:25", arrival: "13:00", duration: "6h 35m", price: 1700, seats: 44 },
    { trainNumber: "20833", name: "Vande Bharat Express", from: "SBC", to: "MAS", type: "Vande Bharat", class: "Executive Chair", departure: "06:00", arrival: "11:30", duration: "5h 30m", price: 1500, seats: 44 },
    
    // Garib Rath Express Trains
    { trainNumber: "12909", name: "Mumbai Garib Rath", from: "MMCT", to: "ADI", type: "Garib Rath", class: "AC 3-Tier", departure: "21:10", arrival: "06:50", duration: "9h 40m", price: 750, seats: 80 },
    { trainNumber: "12217", name: "Sampark Kranti Garib Rath", from: "SC", to: "NDLS", type: "Garib Rath", class: "AC 3-Tier", departure: "15:00", arrival: "13:15", duration: "22h 15m", price: 1500, seats: 80 },
    { trainNumber: "12229", name: "Lucknow Garib Rath", from: "LKO", to: "NDLS", type: "Garib Rath", class: "AC 3-Tier", departure: "20:45", arrival: "06:30", duration: "9h 45m", price: 800, seats: 80 },
    
    // Humsafar Express Trains
    { trainNumber: "12295", name: "Sanghamitra Humsafar", from: "SBC", to: "HWH", type: "Humsafar", class: "AC 3-Tier", departure: "18:30", arrival: "08:30", duration: "38h 00m", price: 2400, seats: 60 },
    { trainNumber: "12523", name: "New Delhi Humsafar", from: "NDLS", to: "SBC", type: "Humsafar", class: "AC 3-Tier", departure: "20:40", arrival: "22:15", duration: "33h 35m", price: 2200, seats: 60 },
    
    // Superfast Express Trains
    { trainNumber: "12163", name: "Chennai Express", from: "SBC", to: "MAS", type: "Superfast", class: "AC 2-Tier", departure: "06:30", arrival: "11:00", duration: "4h 30m", price: 650, seats: 56 },
    { trainNumber: "12123", name: "Deccan Queen", from: "MMCT", to: "PUNE", type: "Superfast", class: "AC Chair Car", departure: "07:15", arrival: "10:40", duration: "3h 25m", price: 450, seats: 40 },
    { trainNumber: "12625", name: "Kerala Express", from: "NDLS", to: "TVC", type: "Superfast", class: "Sleeper", departure: "11:00", arrival: "08:00", duration: "45h 00m", price: 1200, seats: 88 },
    { trainNumber: "12809", name: "Howrah Mail", from: "MMCT", to: "HWH", type: "Superfast", class: "AC 3-Tier", departure: "18:55", arrival: "06:40", duration: "35h 45m", price: 1950, seats: 72 },
    { trainNumber: "22119", name: "Tejas Express", from: "MMCT", to: "MAO", type: "Superfast", class: "AC Chair Car", departure: "05:00", arrival: "13:25", duration: "8h 25m", price: 1200, seats: 36 },
    
    // More Major Route Trains
    { trainNumber: "12051", name: "Dadar Madurai SF", from: "DR", to: "MDU", type: "Superfast", class: "Sleeper", departure: "21:30", arrival: "05:40", duration: "32h 10m", price: 900, seats: 88 },
    { trainNumber: "12137", name: "Punjab Mail", from: "CSMT", to: "FZR", type: "Express", class: "Sleeper", departure: "19:15", arrival: "05:30", duration: "34h 15m", price: 850, seats: 100 },
    { trainNumber: "12615", name: "Grand Trunk Express", from: "MAS", to: "NDLS", type: "Express", class: "Sleeper", departure: "18:45", arrival: "06:35", duration: "35h 50m", price: 950, seats: 100 },
    { trainNumber: "12621", name: "Tamil Nadu Express", from: "MAS", to: "NDLS", type: "Express", class: "AC 3-Tier", departure: "22:00", arrival: "07:00", duration: "33h 00m", price: 1600, seats: 72 },
    { trainNumber: "12723", name: "Telangana Express", from: "HYB", to: "NDLS", type: "Express", class: "Sleeper", departure: "17:35", arrival: "11:30", duration: "41h 55m", price: 1000, seats: 88 },
    
    // Mumbai to Various Destinations
    { trainNumber: "12101", name: "Jnaneswari Express", from: "LTT", to: "HWH", type: "Express", class: "Sleeper", departure: "23:25", arrival: "13:30", duration: "38h 05m", price: 950, seats: 100 },
    { trainNumber: "12105", name: "Vidarbha Express", from: "CSMT", to: "NGP", type: "Express", class: "Sleeper", departure: "20:45", arrival: "09:45", duration: "13h 00m", price: 550, seats: 88 },
    { trainNumber: "12109", name: "Mumbai LTT Express", from: "LTT", to: "SC", type: "Express", class: "Sleeper", departure: "15:05", arrival: "06:00", duration: "14h 55m", price: 600, seats: 88 },
    { trainNumber: "12133", name: "Mumbai Mail", from: "CSMT", to: "MAS", type: "Express", class: "Sleeper", departure: "21:40", arrival: "03:30", duration: "29h 50m", price: 850, seats: 100 },
    { trainNumber: "12157", name: "Mumbai Jaipur SF", from: "BDTS", to: "JP", type: "Superfast", class: "AC 3-Tier", departure: "19:05", arrival: "11:45", duration: "16h 40m", price: 1400, seats: 72 },
    
    // Delhi to Various Destinations
    { trainNumber: "12413", name: "Delhi Allahabad SF", from: "NDLS", to: "PRYJ", type: "Superfast", class: "AC 3-Tier", departure: "21:15", arrival: "07:00", duration: "9h 45m", price: 1100, seats: 72 },
    { trainNumber: "12419", name: "Gomti Express", from: "NDLS", to: "LKO", type: "Express", class: "Sleeper", departure: "22:15", arrival: "05:45", duration: "7h 30m", price: 450, seats: 88 },
    { trainNumber: "12445", name: "Uttar Sampark Kranti", from: "NDLS", to: "GKP", type: "Superfast", class: "AC 3-Tier", departure: "16:50", arrival: "04:30", duration: "11h 40m", price: 1200, seats: 72 },
    { trainNumber: "12449", name: "GOA Express", from: "NZM", to: "MAO", type: "Superfast", class: "AC 3-Tier", departure: "15:00", arrival: "13:00", duration: "46h 00m", price: 2000, seats: 72 },
    { trainNumber: "12469", name: "Cnb Jaipur SF", from: "CNB", to: "JP", type: "Superfast", class: "AC 3-Tier", departure: "02:20", arrival: "09:50", duration: "7h 30m", price: 900, seats: 72 },
    
    // Bangalore Routes
    { trainNumber: "12628", name: "Karnataka Express", from: "SBC", to: "NDLS", type: "Express", class: "Sleeper", departure: "20:15", arrival: "04:50", duration: "32h 35m", price: 1000, seats: 100 },
    { trainNumber: "12639", name: "Brindavan Express", from: "MAS", to: "SBC", type: "Express", class: "AC Chair Car", departure: "07:40", arrival: "13:25", duration: "5h 45m", price: 550, seats: 50 },
    { trainNumber: "12677", name: "Ernakulam Express", from: "SBC", to: "ERS", type: "Express", class: "Sleeper", departure: "15:30", arrival: "04:30", duration: "13h 00m", price: 550, seats: 88 },
    { trainNumber: "12785", name: "Kochuveli Express", from: "SBC", to: "KCVL", type: "Express", class: "Sleeper", departure: "19:30", arrival: "10:00", duration: "14h 30m", price: 600, seats: 88 },
    
    // Chennai Routes
    { trainNumber: "12633", name: "Kanniyakumari Express", from: "MAS", to: "CAPE", type: "Express", class: "Sleeper", departure: "17:30", arrival: "06:30", duration: "13h 00m", price: 500, seats: 88 },
    { trainNumber: "12635", name: "Vaigai Express", from: "MAS", to: "MDU", type: "Express", class: "AC Chair Car", departure: "12:40", arrival: "20:35", duration: "7h 55m", price: 650, seats: 50 },
    { trainNumber: "12651", name: "Sampark Kranti Express", from: "MAS", to: "NDLS", type: "Superfast", class: "AC 3-Tier", departure: "18:15", arrival: "23:20", duration: "29h 05m", price: 1600, seats: 72 },
    { trainNumber: "12655", name: "Navjeevan Express", from: "MAS", to: "ADI", type: "Express", class: "Sleeper", departure: "07:35", arrival: "13:50", duration: "30h 15m", price: 950, seats: 100 },
    
    // Kolkata Routes
    { trainNumber: "12313", name: "Sealdah Rajdhani", from: "SDAH", to: "NDLS", type: "Rajdhani", class: "AC 2-Tier", departure: "16:35", arrival: "09:55", duration: "17h 20m", price: 2100, seats: 72 },
    { trainNumber: "12321", name: "Howrah Mail", from: "HWH", to: "CSMT", type: "Express", class: "Sleeper", departure: "22:45", arrival: "10:35", duration: "35h 50m", price: 950, seats: 100 },
    { trainNumber: "12841", name: "Coromandel Express", from: "HWH", to: "MAS", type: "Superfast", class: "AC 3-Tier", departure: "14:00", arrival: "05:30", duration: "15h 30m", price: 1400, seats: 72 },
    { trainNumber: "12863", name: "Howrah Express", from: "HWH", to: "YPR", type: "Express", class: "Sleeper", departure: "23:05", arrival: "04:30", duration: "29h 25m", price: 950, seats: 88 },
    
    // Hyderabad Routes
    { trainNumber: "12701", name: "Hussainsagar Express", from: "SC", to: "CSMT", type: "Express", class: "Sleeper", departure: "21:30", arrival: "12:15", duration: "14h 45m", price: 600, seats: 88 },
    { trainNumber: "12759", name: "Charminar Express", from: "SC", to: "MAS", type: "Express", class: "Sleeper", departure: "18:35", arrival: "05:15", duration: "10h 40m", price: 500, seats: 88 },
    { trainNumber: "12764", name: "Padmavati Express", from: "SC", to: "TPTY", type: "Express", class: "Sleeper", departure: "05:30", arrival: "14:00", duration: "8h 30m", price: 450, seats: 88 },
    
    // Gujarat Routes  
    { trainNumber: "12927", name: "Gujarat SF", from: "ADI", to: "MMCT", type: "Superfast", class: "AC 3-Tier", departure: "23:00", arrival: "09:25", duration: "10h 25m", price: 850, seats: 72 },
    { trainNumber: "12933", name: "Karnavati Express", from: "ADI", to: "MMCT", type: "Express", class: "Sleeper", departure: "14:35", arrival: "22:05", duration: "7h 30m", price: 400, seats: 88 },
    { trainNumber: "12957", name: "Swarna Jayanti Express", from: "ADI", to: "NDLS", type: "Superfast", class: "AC 3-Tier", departure: "06:50", arrival: "05:25", duration: "22h 35m", price: 1500, seats: 72 },
    
    // Rajasthan Routes
    { trainNumber: "12015", name: "Ajmer Shatabdi", from: "NDLS", to: "AII", type: "Shatabdi", class: "AC Chair Car", departure: "06:15", arrival: "12:45", duration: "6h 30m", price: 1200, seats: 50 },
    { trainNumber: "12307", name: "Howrah Jodhpur SF", from: "HWH", to: "JU", type: "Superfast", class: "AC 3-Tier", departure: "10:45", arrival: "04:30", duration: "41h 45m", price: 1800, seats: 72 },
    { trainNumber: "12955", name: "Jaipur SF", from: "MMCT", to: "JP", type: "Superfast", class: "AC 3-Tier", departure: "18:50", arrival: "11:30", duration: "16h 40m", price: 1400, seats: 72 },
    
    // Punjab & Chandigarh Routes
    { trainNumber: "12029", name: "Amritsar Shatabdi", from: "NDLS", to: "ASR", type: "Shatabdi", class: "AC Chair Car", departure: "16:30", arrival: "22:50", duration: "6h 20m", price: 1400, seats: 50 },
    { trainNumber: "12053", name: "Amritsar Jan Shatabdi", from: "NDLS", to: "ASR", type: "Jan Shatabdi", class: "AC Chair Car", departure: "21:35", arrival: "05:00", duration: "7h 25m", price: 800, seats: 50 },
    { trainNumber: "12459", name: "NDLS Amritsar SF", from: "NDLS", to: "ASR", type: "Superfast", class: "AC 3-Tier", departure: "23:05", arrival: "06:45", duration: "7h 40m", price: 1000, seats: 72 },
    
    // Kerala Routes
    { trainNumber: "12617", name: "Mangala Lakshadweep", from: "ERS", to: "NDLS", type: "Superfast", class: "AC 3-Tier", departure: "10:30", arrival: "04:00", duration: "41h 30m", price: 2000, seats: 72 },
    { trainNumber: "12626", name: "Kerala Express", from: "TVC", to: "NDLS", type: "Superfast", class: "Sleeper", departure: "11:00", arrival: "08:00", duration: "45h 00m", price: 1200, seats: 88 },
    { trainNumber: "16345", name: "Netravati Express", from: "TVC", to: "LTT", type: "Express", class: "Sleeper", departure: "11:45", arrival: "05:10", duration: "41h 25m", price: 1100, seats: 88 },
    
    // More Popular Routes
    { trainNumber: "12216", name: "Garib Rath", from: "DEE", to: "SC", type: "Garib Rath", class: "AC 3-Tier", departure: "17:35", arrival: "14:00", duration: "44h 25m", price: 1600, seats: 80 },
    { trainNumber: "12230", name: "Lucknow Mail", from: "LKO", to: "MMCT", type: "Express", class: "Sleeper", departure: "14:30", arrival: "06:10", duration: "39h 40m", price: 950, seats: 88 },
    { trainNumber: "12234", name: "Begumpura Express", from: "LKO", to: "ASR", type: "Express", class: "Sleeper", departure: "19:45", arrival: "08:50", duration: "13h 05m", price: 500, seats: 88 },
    { trainNumber: "12246", name: "Duronto Express", from: "HWH", to: "YPR", type: "Duronto", class: "AC 3-Tier", departure: "08:00", arrival: "10:45", duration: "26h 45m", price: 1800, seats: 64 },
    { trainNumber: "12280", name: "Taj Express", from: "NDLS", to: "AGC", type: "Express", class: "AC Chair Car", departure: "07:10", arrival: "09:50", duration: "2h 40m", price: 450, seats: 50 },
    { trainNumber: "12302", name: "Rajdhani Express", from: "HWH", to: "NDLS", type: "Rajdhani", class: "AC 1-Tier", departure: "16:55", arrival: "10:05", duration: "17h 10m", price: 3500, seats: 48 },
    { trainNumber: "12322", name: "Howrah Mumbai Mail", from: "HWH", to: "CSMT", type: "Express", class: "AC 3-Tier", departure: "22:45", arrival: "10:35", duration: "35h 50m", price: 1600, seats: 72 },
    { trainNumber: "12334", name: "Vibhuti Express", from: "LKO", to: "ANVT", type: "Express", class: "Sleeper", departure: "06:45", arrival: "14:10", duration: "7h 25m", price: 400, seats: 88 },
    { trainNumber: "12356", name: "Archana Express", from: "JP", to: "NDLS", type: "Express", class: "Sleeper", departure: "20:10", arrival: "04:50", duration: "8h 40m", price: 450, seats: 88 },
    { trainNumber: "12430", name: "Rajdhani Express", from: "NDLS", to: "LKO", type: "Rajdhani", class: "AC 2-Tier", departure: "22:15", arrival: "05:30", duration: "7h 15m", price: 1600, seats: 72 },
    
    // Short Distance Popular Routes
    { trainNumber: "12501", name: "Poorva Express", from: "NDLS", to: "HWH", type: "Express", class: "Sleeper", departure: "16:35", arrival: "10:15", duration: "17h 40m", price: 700, seats: 88 },
    { trainNumber: "12549", name: "Jammu Superfast", from: "JAT", to: "NDLS", type: "Superfast", class: "AC 3-Tier", departure: "19:45", arrival: "07:30", duration: "11h 45m", price: 1200, seats: 72 },
    { trainNumber: "12560", name: "Swatantrata Senani", from: "JAT", to: "NDLS", type: "Superfast", class: "AC 3-Tier", departure: "14:20", arrival: "02:15", duration: "11h 55m", price: 1200, seats: 72 },
    { trainNumber: "12622", name: "Tamil Nadu Express", from: "MAS", to: "NDLS", type: "Express", class: "Sleeper", departure: "22:00", arrival: "07:00", duration: "33h 00m", price: 1000, seats: 100 },
    { trainNumber: "12647", name: "Kongu Express", from: "ERS", to: "SBC", type: "Express", class: "Sleeper", departure: "20:45", arrival: "10:00", duration: "13h 15m", price: 550, seats: 88 },
    { trainNumber: "12659", name: "Gurudev Express", from: "PNBE", to: "NDLS", type: "Express", class: "Sleeper", departure: "15:45", arrival: "05:00", duration: "13h 15m", price: 550, seats: 88 },
    { trainNumber: "12715", name: "Sachkhand Express", from: "NED", to: "ASR", type: "Express", class: "Sleeper", departure: "23:40", arrival: "19:25", duration: "19h 45m", price: 650, seats: 88 },
    { trainNumber: "12801", name: "Purushottam Express", from: "PURI", to: "NDLS", type: "Superfast", class: "AC 3-Tier", departure: "22:00", arrival: "05:50", duration: "31h 50m", price: 1400, seats: 72 },
    { trainNumber: "12815", name: "Nandan Kanan Express", from: "PURI", to: "NDLS", type: "Express", class: "Sleeper", departure: "20:30", arrival: "06:50", duration: "34h 20m", price: 950, seats: 88 },
    { trainNumber: "12859", name: "Gitanjali Express", from: "HWH", to: "CSMT", type: "Superfast", class: "AC 3-Tier", departure: "20:30", arrival: "08:25", duration: "35h 55m", price: 1600, seats: 72 },
    { trainNumber: "12861", name: "Link Dakshina Express", from: "HWH", to: "MAS", type: "Express", class: "Sleeper", departure: "10:00", arrival: "19:00", duration: "33h 00m", price: 950, seats: 88 },
    { trainNumber: "12869", name: "Chennai SF", from: "HWH", to: "MAS", type: "Superfast", class: "AC 3-Tier", departure: "12:30", arrival: "02:30", duration: "14h 00m", price: 1400, seats: 72 },
    { trainNumber: "12875", name: "Neelachal Express", from: "HWH", to: "PURI", type: "Express", class: "Sleeper", departure: "22:40", arrival: "08:30", duration: "9h 50m", price: 450, seats: 88 },
    { trainNumber: "12905", name: "Okha PBR SF", from: "PBR", to: "ADI", type: "Superfast", class: "AC 3-Tier", departure: "08:20", arrival: "12:25", duration: "4h 05m", price: 700, seats: 72 },
    { trainNumber: "12925", name: "Paschim Express", from: "ADI", to: "MMCT", type: "Express", class: "Sleeper", departure: "13:00", arrival: "20:25", duration: "7h 25m", price: 400, seats: 88 },
    { trainNumber: "12930", name: "Bhavnagar Express", from: "BVC", to: "MMCT", type: "Express", class: "Sleeper", departure: "19:15", arrival: "04:55", duration: "9h 40m", price: 450, seats: 88 },
    { trainNumber: "12952", name: "Rajdhani Express", from: "MMCT", to: "NDLS", type: "Rajdhani", class: "AC 1-Tier", departure: "16:35", arrival: "08:35", duration: "16h 00m", price: 4000, seats: 48 },
    { trainNumber: "12979", name: "Jaipur SF", from: "ADI", to: "JP", type: "Superfast", class: "AC 3-Tier", departure: "20:15", arrival: "05:35", duration: "9h 20m", price: 1000, seats: 72 },
    { trainNumber: "19023", name: "Firozpur Janata", from: "FZR", to: "MMCT", type: "Express", class: "Sleeper", departure: "08:10", arrival: "17:50", duration: "33h 40m", price: 850, seats: 100 },
    { trainNumber: "19031", name: "Yoga Express", from: "HDB", to: "MMCT", type: "Express", class: "Sleeper", departure: "16:40", arrival: "12:30", duration: "43h 50m", price: 1100, seats: 88 },
    { trainNumber: "22601", name: "Chennai SF", from: "SBC", to: "MAS", type: "Superfast", class: "AC 2-Tier", departure: "23:00", arrival: "04:45", duration: "5h 45m", price: 800, seats: 56 }
];

module.exports = { trainData };
