// Comprehensive Indian Railway Location Data

const locationData = {
    states: [
        { name: "Maharashtra", code: "MH" },
        { name: "Delhi", code: "DL" },
        { name: "Karnataka", code: "KA" },
        { name: "Tamil Nadu", code: "TN" },
        { name: "West Bengal", code: "WB" },
        { name: "Gujarat", code: "GJ" },
        { name: "Rajasthan", code: "RJ" },
        { name: "Uttar Pradesh", code: "UP" },
        { name: "Kerala", code: "KL" },
        { name: "Telangana", code: "TG" },
        { name: "Madhya Pradesh", code: "MP" },
        { name: "Punjab", code: "PB" },
        { name: "Andhra Pradesh", code: "AP" },
        { name: "Goa", code: "GA" },
        { name: "Bihar", code: "BR" }
    ],
    
    cities: {
        "MH": [
            { name: "Mumbai", stations: [
                { name: "Mumbai Central", code: "MMCT" },
                { name: "Chhatrapati Shivaji Terminus", code: "CSMT" },
                { name: "Dadar", code: "DR" },
                { name: "Bandra Terminus", code: "BDTS" },
                { name: "Lokmanya Tilak Terminus", code: "LTT" }
            ]},
            { name: "Pune", stations: [
                { name: "Pune Junction", code: "PUNE" },
                { name: "Shivajinagar", code: "SVJR" }
            ]},
            { name: "Nagpur", stations: [
                { name: "Nagpur Junction", code: "NGP" }
            ]},
            { name: "Nashik", stations: [
                { name: "Nashik Road", code: "NK" }
            ]},
            { name: "Aurangabad", stations: [
                { name: "Aurangabad", code: "AWB" }
            ]}
        ],
        "DL": [
            { name: "New Delhi", stations: [
                { name: "New Delhi Railway Station", code: "NDLS" },
                { name: "Old Delhi Railway Station", code: "DLI" },
                { name: "Hazrat Nizamuddin", code: "NZM" },
                { name: "Anand Vihar Terminal", code: "ANVT" }
            ]}
        ],
        "KA": [
            { name: "Bangalore", stations: [
                { name: "Bangalore City Junction", code: "SBC" },
                { name: "Bangalore Cantonment", code: "BNC" },
                { name: "Yeshwantpur Junction", code: "YPR" }
            ]},
            { name: "Mysore", stations: [
                { name: "Mysore Junction", code: "MYS" }
            ]},
            { name: "Hubli", stations: [
                { name: "Hubli Junction", code: "UBL" }
            ]},
            { name: "Mangalore", stations: [
                { name: "Mangalore Central", code: "MAQ" }
            ]}
        ],
        "TN": [
            { name: "Chennai", stations: [
                { name: "Chennai Central", code: "MAS" },
                { name: "Chennai Egmore", code: "MS" },
                { name: "Tambaram", code: "TBM" }
            ]},
            { name: "Coimbatore", stations: [
                { name: "Coimbatore Junction", code: "CBE" }
            ]},
            { name: "Madurai", stations: [
                { name: "Madurai Junction", code: "MDU" }
            ]},
            { name: "Trichy", stations: [
                { name: "Tiruchirappalli Junction", code: "TPJ" }
            ]}
        ],
        "WB": [
            { name: "Kolkata", stations: [
                { name: "Howrah Junction", code: "HWH" },
                { name: "Sealdah", code: "SDAH" },
                { name: "Kolkata", code: "KOAA" }
            ]},
            { name: "Siliguri", stations: [
                { name: "New Jalpaiguri", code: "NJP" }
            ]},
            { name: "Asansol", stations: [
                { name: "Asansol Junction", code: "ASN" }
            ]}
        ],
        "GJ": [
            { name: "Ahmedabad", stations: [
                { name: "Ahmedabad Junction", code: "ADI" }
            ]},
            { name: "Surat", stations: [
                { name: "Surat", code: "ST" }
            ]},
            { name: "Vadodara", stations: [
                { name: "Vadodara Junction", code: "BRC" }
            ]},
            { name: "Rajkot", stations: [
                { name: "Rajkot Junction", code: "RJT" }
            ]}
        ],
        "RJ": [
            { name: "Jaipur", stations: [
                { name: "Jaipur Junction", code: "JP" }
            ]},
            { name: "Jodhpur", stations: [
                { name: "Jodhpur Junction", code: "JU" }
            ]},
            { name: "Ajmer", stations: [
                { name: "Ajmer Junction", code: "AII" }
            ]},
            { name: "Udaipur", stations: [
                { name: "Udaipur City", code: "UDZ" }
            ]}
        ],
        "UP": [
            { name: "Lucknow", stations: [
                { name: "Lucknow Junction", code: "LKO" },
                { name: "Lucknow Charbagh", code: "LJN" }
            ]},
            { name: "Kanpur", stations: [
                { name: "Kanpur Central", code: "CNB" }
            ]},
            { name: "Varanasi", stations: [
                { name: "Varanasi Junction", code: "BSB" }
            ]},
            { name: "Agra", stations: [
                { name: "Agra Cantonment", code: "AGC" }
            ]},
            { name: "Allahabad", stations: [
                { name: "Prayagraj Junction", code: "PRYJ" }
            ]},
            { name: "Gorakhpur", stations: [
                { name: "Gorakhpur Junction", code: "GKP" }
            ]}
        ],
        "KL": [
            { name: "Thiruvananthapuram", stations: [
                { name: "Trivandrum Central", code: "TVC" }
            ]},
            { name: "Kochi", stations: [
                { name: "Ernakulam Junction", code: "ERS" }
            ]},
            { name: "Kozhikode", stations: [
                { name: "Kozhikode", code: "CLT" }
            ]},
            { name: "Kannur", stations: [
                { name: "Kannur", code: "CAN" }
            ]}
        ],
        "TG": [
            { name: "Hyderabad", stations: [
                { name: "Secunderabad Junction", code: "SC" },
                { name: "Hyderabad Deccan", code: "HYB" },
                { name: "Kacheguda", code: "KCG" }
            ]}
        ],
        "MP": [
            { name: "Bhopal", stations: [
                { name: "Bhopal Junction", code: "BPL" }
            ]},
            { name: "Indore", stations: [
                { name: "Indore Junction", code: "INDB" }
            ]},
            { name: "Jabalpur", stations: [
                { name: "Jabalpur Junction", code: "JBP" }
            ]},
            { name: "Gwalior", stations: [
                { name: "Gwalior Junction", code: "GWL" }
            ]}
        ],
        "PB": [
            { name: "Amritsar", stations: [
                { name: "Amritsar Junction", code: "ASR" }
            ]},
            { name: "Ludhiana", stations: [
                { name: "Ludhiana Junction", code: "LDH" }
            ]},
            { name: "Jalandhar", stations: [
                { name: "Jalandhar City", code: "JUC" }
            ]}
        ],
        "AP": [
            { name: "Vijayawada", stations: [
                { name: "Vijayawada Junction", code: "BZA" }
            ]},
            { name: "Visakhapatnam", stations: [
                { name: "Visakhapatnam Junction", code: "VSKP" }
            ]},
            { name: "Tirupati", stations: [
                { name: "Tirupati", code: "TPTY" }
            ]}
        ],
        "GA": [
            { name: "Margao", stations: [
                { name: "Madgaon Junction", code: "MAO" }
            ]},
            { name: "Vasco", stations: [
                { name: "Vasco Da Gama", code: "VSG" }
            ]}
        ],
        "BR": [
            { name: "Patna", stations: [
                { name: "Patna Junction", code: "PNBE" }
            ]},
            { name: "Gaya", stations: [
                { name: "Gaya Junction", code: "GAYA" }
            ]},
            { name: "Muzaffarpur", stations: [
                { name: "Muzaffarpur Junction", code: "MFP" }
            ]}
        ]
    }
};

module.exports = { locationData };
