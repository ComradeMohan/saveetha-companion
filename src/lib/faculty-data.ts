
export type Faculty = {
  id?: string;
  name: string;
  designation?: string; // Made optional as it's not in the new data
  department: string;
  subjects: string[];
  phone: string;
  roomNo?: string; // Mapped from roomNo
  room?: string; // Keep for compatibility if needed elsewhere
};

// This data is now for placeholder/reference purposes
// The app will fetch data from Firestore instead.
export const facultyData: Faculty[] = [
    {
        "name": "Dr.T.Yuvaraj",
        "phone": "9944648832",
        "department": "Power Electronics &Power Systems",
        "roomNo": "107B",
        "subjects": [
            "Protection and Switch Gear"
        ]
    },
    {
        "name": "Dr.R.Ganesan",
        "phone": "9444751780",
        "department": "Environmental and Water Resources Engineering",
        "roomNo": "414",
        "subjects": [
            "Environmental Impact Assessment"
        ]
    },
    {
        "name": "Dr. N. Senthilkumar ",
        "phone": "9944634394",
        "department": "Thermal Engineering",
        "roomNo": "Central Workshop",
        "subjects": [
            "Automotive Engines"
        ]
    },
    {
        "name": "Dr.Mary sanitha",
        "phone": "9884186752",
        "department": "Molecular Analytics",
        "roomNo": "AHS-D10(2)",
        "subjects": [
            "Genomics and Proteomics"
        ]
    },
    {
        "name": "Dr.M.S.Surender",
        "phone": "9791876953",
        "department": "Mathematics for Excellence",
        "roomNo": " ",
        "subjects": [
            "Applied Probability"
        ]
    },
    {
        "name": "Dr.Iyyappan J",
        "phone": "9600251579",
        "department": "Bioengineering",
        "roomNo": "AHS -C10(1)",
        "subjects": [
            "Instrumental Methods of Analysis"
        ]
    },
    {
        "name": "Dr. I. Praveen Kumar",
        "phone": "9788166904",
        "department": "Medical Biotechnology and Integrative Physiology",
        "roomNo": "AHS-A10(2) ",
        "subjects": [
            "Plant Biotechnology"
        ]
    },
    {
        "name": "Dr.K.Sangeetha",
        "phone": "8838930689",
        "department": "Environmental Biotechnology",
        "roomNo": "AHS-B10",
        "subjects": [
            "Cell Biology"
        ]
    },
    {
        "name": "Dr Senthil Kumar C",
        "phone": "9940580501",
        "department": "Wearable and Nano Sensors",
        "roomNo": "AHS12D2",
        "subjects": [
            "Body Area Networks"
        ]
    },
    {
        "name": "Dr Praveen R",
        "phone": "9962291255",
        "department": "Nanobiomaterial ",
        "roomNo": "AHS12D1",
        "subjects": [
            "Hospital Management"
        ]
    },
    {
        "name": "Dr Usha Rani",
        "phone": "9600071178",
        "department": "Medical Imaging",
        "roomNo": "AHS12C1",
        "subjects": [
            "Biomedical Instrumentation"
        ]
    },
    {
        "name": "Dr Geetha R",
        "phone": "8129511366",
        "department": "Medical Imaging",
        "roomNo": "AHS12C2",
        "subjects": [
            "Virtual Instrumentation design for medical systems"
        ]
    },
    {
        "name": "Dr Priya Rachel",
        "phone": "9566019530",
        "department": "Structural Engineering",
        "roomNo": "412",
        "subjects": [
            "Introduction to Civil Engineering-Societal&Global Impact"
        ]
    },
    {
        "name": "DR. SHAKILA DEVI",
        "phone": "7339403331",
        "department": " ",
        "roomNo": " ",
        "subjects": [
            "Mathematics I for Agricultural Engineering"
        ]
    },
    {
        "name": "Dr M Ramalakshmi",
        "phone": "9884241227",
        "department": "Geotechnics and Geomatics",
        "roomNo": "411",
        "subjects": [
            "Surveying"
        ]
    },
    {
        "name": "Dr. V.Savithri",
        "phone": "9841531472",
        "department": "Design",
        "roomNo": "122",
        "subjects": [
            "Fluid Mechanics and Machinery"
        ]
    },
    {
        "name": "Dr. Vasudevan",
        "phone": "8056227308",
        "department": "Design",
        "roomNo": "34",
        "subjects": [
            "Engineering Mechanics"
        ]
    },
    {
        "name": "Dr. M. Dinesh Kumar",
        "phone": "9791558517",
        "department": "Environmental and Water Resources Engineering",
        "roomNo": "13",
        "subjects": [
            "Fluid Mechanics and Machinery"
        ]
    },
    {
        "name": "Dr. B.Raja Bharathi",
        "phone": "9500891008",
        "department": "Design",
        "roomNo": "121",
        "subjects": [
            "Theory of Machines"
        ]
    },
    {
        "name": "Dr. P.R. Karthikeyan ",
        "phone": "9944218001",
        "department": "Research and Innovation",
        "roomNo": "321",
        "subjects": [
            "Analog Circuits"
        ]
    },
    {
        "name": "Dr.VIJAYAKUMARI P",
        "phone": "8754723181",
        "department": "Applied Electronics",
        "roomNo": "326",
        "subjects": [
            "Integrated Circuits"
        ]
    },
    {
        "name": "Dr.K.Vijayalakshmi ",
        "phone": "9655662491",
        "department": "Signal and Image Processing",
        "roomNo": "410",
        "subjects": [
            "Semiconductor Devices"
        ]
    },
    {
        "name": "Dr.R.Saravana kumar",
        "phone": "9894951308",
        "department": "Wireless communication",
        "roomNo": "208A",
        "subjects": [
            "Engineering Electromagnetics"
        ]
    },
    {
        "name": "Dr N P G Bhavani",
        "phone": "8778068976",
        "department": "Electronic Instrumentation Systems",
        "roomNo": "214",
        "subjects": [
            "Control Systems"
        ]
    },
    {
        "name": "Dr G Manikandan",
        "phone": "9176276410",
        "department": "Robotics",
        "roomNo": "136",
        "subjects": [
            "VLSI Design"
        ]
    },
    {
        "name": "Ms. Ashwini.S",
        "phone": "9952993184",
        "department": "Big Data and Network Security",
        "roomNo": "239",
        "subjects": [
            "C Programming"
        ]
    },
    {
        "name": "Dr. Soundara",
        "phone": "9790953181",
        "department": "Geotechnics and Geomatics",
        "roomNo": "413",
        "subjects": [
            "Biology and Environmental Science for Engineers"
        ]
    },
    {
        "name": "Dr. Shanmuga Prabha",
        "phone": "7092072387",
        "department": "Big Data and Network Security",
        "roomNo": "240",
        "subjects": [
            "C Programming"
        ]
    },
    {
        "name": "Dr. Radhika Bhaskar",
        "phone": "9710321350",
        "department": "Wireless communication",
        "roomNo": "215",
        "subjects": [
            "C Programming"
        ]
    },
    {
        "name": "Dr.R.Dhanalakshmi",
        "phone": "9884787512",
        "department": "Machine Learning",
        "roomNo": "304",
        "subjects": [
            "Data Structures"
        ]
    },
    {
        "name": "Sr. Sudha",
        "phone": "9994293489",
        "department": "Deep Learning",
        "roomNo": "119",
        "subjects": [
            "Data Structures"
        ]
    },
    {
        "name": "Dr.T.Rajesh kumar",
        "phone": "9842148424",
        "department": "Deep Learning",
        "roomNo": "120",
        "subjects": [
            "Data Structures"
        ]
    },
    {
        "name": "Dr Mahaveerakannan ",
        "phone": "9788614129",
        "department": "Artificial Intelligence",
        "roomNo": "305",
        "subjects": [
            "Data Structures"
        ]
    },
    {
        "name": "Mr.Logu",
        "phone": "9042768897",
        "department": "AR and VR",
        "roomNo": "223",
        "subjects": [
            "Operating Systems"
        ]
    },
    {
        "name": "Dr. V.Karthick ",
        "phone": "9884142182",
        "department": "Networking",
        "roomNo": "222",
        "subjects": [
            "Operating Systems"
        ]
    },
    {
        "name": "Dr.S.A.Kalaiselvan",
        "phone": "9043333903",
        "department": "Networking",
        "roomNo": "315",
        "subjects": [
            "Operating Systems"
        ]
    },
    {
        "name": "Dr.A.Gnanasoundari",
        "phone": "8248974652",
        "department": "Machine Learning",
        "roomNo": "303",
        "subjects": [
            "Operating Systems"
        ]
    },
    {
        "name": "Dr,P.Muneeshwari",
        "phone": "9788680336",
        "department": "Applied Machine Learning",
        "roomNo": "609",
        "subjects": [
            "Database Management Systems"
        ]
    },
    {
        "name": "Dr.Kesavan",
        "phone": "9444304384",
        "department": "Knowledge Engineering",
        "roomNo": "314",
        "subjects": [
            "Database Management Systems"
        ]
    },
    {
        "name": "Dr.U.Sakthi",
        "phone": "9444851523",
        "department": "Blockchain and Cybersecurity",
        "roomNo": "238",
        "subjects": [
            "Database Management Systems"
        ]
    },
    {
        "name": "Dr. U. Arul",
        "phone": "9841490831",
        "department": "Applied Machine Learning",
        "roomNo": "607",
        "subjects": [
            "Database Management Systems"
        ]
    },
    {
        "name": "Dr. VijayaBasker",
        "phone": "9443033062",
        "department": "Programming",
        "roomNo": "205",
        "subjects": [
            "Design and Analysis of Algorithms"
        ]
    },
    {
        "name": "Dr.V.Parthipan",
        "phone": "9787366908",
        "department": "Big Data and Network Security",
        "roomNo": "225",
        "subjects": [
            "Computer Networks"
        ]
    },
    {
        "name": "D. Sheela",
        "phone": "99621 07078",
        "department": "Embedded System",
        "roomNo": "424",
        "subjects": [
            "Computer Networks"
        ]
    },
    {
        "name": "Dr.M.Vanitha Lakshmi",
        "phone": "9791098344",
        "department": "Signal and image Processing with Computational Intelligence",
        "roomNo": "427",
        "subjects": [
            "Computer Networks"
        ]
    },
    {
        "name": "Dr.Jesu Jayarin",
        "phone": "9444053102",
        "department": "Data Analytics ",
        "roomNo": "404",
        "subjects": [
            "Computer Networks"
        ]
    },
    {
        "name": "Dr.Rajasekar M",
        "phone": "9677043244",
        "department": "Deep Learning",
        "roomNo": "312",
        "subjects": [
            "Python Programming"
        ]
    },
    {
        "name": "Dr. S. Kalaiarasi",
        "phone": "9444564295",
        "department": "Data Science",
        "roomNo": "401",
        "subjects": [
            "Python Programming"
        ]
    },
    {
        "name": "Dr.L. Rama Pavarthy",
        "phone": "9840184995",
        "department": "Data Science",
        "roomNo": "401",
        "subjects": [
            "Python Programming"
        ]
    },
    {
        "name": "Dr .MANIKAVELAN",
        "phone": "9600040114",
        "department": "Blockchain and Cybersecurity",
        "roomNo": "241",
        "subjects": [
            "Programming in Java"
        ]
    },
    {
        "name": "Dr Tamilselvan",
        "phone": "9994095015",
        "department": "Big Data and Network Security",
        "roomNo": "547",
        "subjects": [
            "Programming in Java"
        ]
    },
    {
        "name": "Dr.Kanimozhi",
        "phone": "9401730451",
        "department": "Computer Vision",
        "roomNo": "514",
        "subjects": [
            "Software Engineering"
        ]
    },
    {
        "name": "Dr A Shrivindhya",
        "phone": "9786197926",
        "department": "Big Data and Network Security",
        "roomNo": "134",
        "subjects": [
            "Software Engineering"
        ]
    },
    {
        "name": "Dr. Rohith Bhat.C",
        "phone": "9840546333",
        "department": "Deep Learning",
        "roomNo": "112",
        "subjects": [
            "Object Oriented Analysis and Design"
        ]
    },
    {
        "name": "Dr.Beulah David",
        "phone": "7010695064",
        "department": "Data Analytics ",
        "roomNo": "226",
        "subjects": [
            "Computer Architecture"
        ]
    },
    {
        "name": "Dr.S.Christy",
        "phone": "9884909250",
        "department": "Data Analytics ",
        "roomNo": "233",
        "subjects": [
            "Computer Architecture"
        ]
    },
    {
        "name": "Dr.M.Geetha",
        "phone": "94443 87531",
        "department": "Computer Vision",
        "roomNo": "507",
        "subjects": [
            "Theory of Computation"
        ]
    },
    {
        "name": "DrG.michael",
        "phone": "9940284723",
        "department": "Computational Intelligence",
        "roomNo": "608",
        "subjects": [
            "Compiler Design"
        ]
    },
    {
        "name": "Dr.Somasundaram",
        "phone": "9443467264",
        "department": "Knowledge Engineering",
        "roomNo": "601",
        "subjects": [
            "Cloud Computing and Big Data Analytics"
        ]
    },
    {
        "name": "DR Arumugam  S S",
        "phone": "9962223356",
        "department": "Information Security",
        "roomNo": "224",
        "subjects": [
            "Data Warehousing and Data Mining"
        ]
    },
    {
        "name": "Dr.Saravanan.M.S",
        "phone": "8190043400",
        "department": "Artificial Intelligence",
        "roomNo": "305",
        "subjects": [
            "Artificial Intelligence"
        ]
    },
    {
        "name": "Dr.Balamanigandan",
        "phone": "8220115532",
        "department": "Artificial Intelligence",
        "roomNo": "306",
        "subjects": [
            "Artificial Intelligence"
        ]
    },
    {
        "name": "Dr. S. RAMESH",
        "phone": "9629570397",
        "department": "Signal and image Processing with Computational Intelligence",
        "roomNo": "336",
        "subjects": [
            "Human Computer Interaction"
        ]
    },
    {
        "name": "Dr.Gururama",
        "phone": "9841065075",
        "department": "Programming",
        "roomNo": "235",
        "subjects": [
            "Software Testing"
        ]
    },
    {
        "name": "Dr.P.Shyamala Bharathi",
        "phone": "9840703179",
        "department": "VLSI Microelectronics",
        "roomNo": "213",
        "subjects": [
            "Internet of Things"
        ]
    },
    {
        "name": "Dr.G.R.Suresh",
        "phone": "9600983735",
        "department": "Signal and image Processing with Computational Intelligence",
        "roomNo": "428",
        "subjects": [
            "Fundamentals of Computing"
        ]
    },
    {
        "name": "Dr Femila roseline",
        "phone": "9444552840",
        "department": "Electronic Instrumentation Systems",
        "roomNo": "202",
        "subjects": [
            "Fundamentals of Computing"
        ]
    },
    {
        "name": "Dr. K. Anbazhagan",
        "phone": "6374775259",
        "department": "Computer Vision",
        "roomNo": "332",
        "subjects": [
            "Object Oriented Programming using C++"
        ]
    },
    {
        "name": "Dr. A. Selvakumar",
        "phone": "8883760180",
        "department": "Computational Intelligence",
        "roomNo": "401",
        "subjects": [
            "Object Oriented Programming using C++"
        ]
    },
    {
        "name": "Dr A Mohan",
        "phone": "9894183073",
        "department": "Information Security",
        "roomNo": "114",
        "subjects": [
            "Object Oriented Programming using C++"
        ]
    },
    {
        "name": "Dr. S. Narendran",
        "phone": "9884831644",
        "department": "NanoTechnology",
        "roomNo": "324",
        "subjects": [
            "Microprocessors and Microcontrollers"
        ]
    },
    {
        "name": "Dr.A.Raja",
        "phone": "98842 18839",
        "department": "Embedded System",
        "roomNo": "309",
        "subjects": [
            "Microprocessors and Microcontrollers"
        ]
    },
    {
        "name": "Dr. N . Bharatha Devi",
        "phone": "9965868203",
        "department": "AR and VR",
        "roomNo": "231",
        "subjects": [
            "Principles of Digital System Design"
        ]
    },
    {
        "name": "Dr.V.Nagaraju",
        "phone": "9840873669",
        "department": "Machine Learning",
        "roomNo": "333",
        "subjects": [
            "Principles of Digital System Design"
        ]
    },
    {
        "name": "Dr.S.Mahaboob Basha",
        "phone": "9841951420",
        "department": "Machine Learning",
        "roomNo": " ",
        "subjects": [
            "Basic Electrical and Electronics Engineering"
        ]
    },
    {
        "name": "Dr.J.Chenni Kumaran",
        "phone": "8825789793",
        "department": "Cloud Computing",
        "roomNo": "307",
        "subjects": [
            "Ethical Hacking"
        ]
    },
    {
        "name": "Dr. A. Prabu / Automobile",
        "phone": "9444841888",
        "department": "Autotronics",
        "roomNo": "Central Workshop",
        "subjects": [
            "Engineering Workshop"
        ]
    },
    {
        "name": "Dr. Eswar M",
        "phone": "9885506964",
        "department": "Advanced Mathematical Sciences",
        "roomNo": "518",
        "subjects": [
            "Engineering Mathematics - I"
        ]
    },
    {
        "name": "Dr. Gunaseelan",
        "phone": "9943084240",
        "department": "Advanced Mathematical Sciences",
        "roomNo": "520",
        "subjects": [
            "Engineering Mathematics - I"
        ]
    },
    {
        "name": "Dr. S. Jehoashan Kingsly",
        "phone": "9500716590",
        "department": "Applied Mathematics for Excellence",
        "roomNo": "517",
        "subjects": [
            "Discrete Mathematics"
        ]
    },
    {
        "name": "Dr.B. V. Senthil Kumar",
        "phone": "9566927114",
        "department": "Mathematics for Excellence",
        "roomNo": " ",
        "subjects": [
            "Discrete Mathematics"
        ]
    },
    {
        "name": "Dr. N. Vijaya",
        "phone": "9787180780",
        "department": "Applied Mathematics for Excellence",
        "roomNo": "516",
        "subjects": [
            "Discrete Mathematics"
        ]
    },
    {
        "name": "Dr. S. Poornavel",
        "phone": "9944361111",
        "department": "Advanced Mathematical Sciences",
        "roomNo": " ",
        "subjects": [
            "Probability and Statistics"
        ]
    },
    {
        "name": "Dr. Muthukumar. P",
        "phone": "9787082715",
        "department": "Applied Chemistry",
        "roomNo": "504",
        "subjects": [
            "Materials Chemistry"
        ]
    },
    {
        "name": "Dr M S Ravisankar",
        "phone": "7598642107",
        "department": "Physical Sciences",
        "roomNo": "533",
        "subjects": [
            "Applied Physics"
        ]
    },
    {
        "name": "Dr. M. Ashokkumar",
        "phone": "95780 82320",
        "department": "Micro and Nanoelectronics",
        "roomNo": "536",
        "subjects": [
            "Applied Physics"
        ]
    },
    {
        "name": "Dr.Shaafi.T",
        "phone": "9176096592",
        "department": "Farm Machinery and Food Engineering",
        "roomNo": "103",
        "subjects": [
            "Professional Ethics and Legal Practices"
        ]
    },
    {
        "name": "Dr.A.Rama",
        "phone": "9884477403",
        "department": "Research and Innovation",
        "roomNo": "322",
        "subjects": [
            "Internet programming"
        ]
    },
    {
        "name": "Dr.SIMON RAJ F",
        "phone": "9444045417",
        "department": "Applied Mathematics for Excellence",
        "roomNo": " ",
        "subjects": [
            "Statistics & Linear Algebra"
        ]
    },
    {
        "name": "Dr. S. Manikandan ",
        "phone": "9585153771",
        "department": "Biosciences",
        "roomNo": "AHS 11D-2",
        "subjects": [
            "Principles of Management "
        ]
    },
    {
        "name": "Dr.S.Jaanaa Rubavathy",
        "phone": "9789054625",
        "department": "Power Electronics &Power Systems",
        "roomNo": " ",
        "subjects": [
            "Transmission and Distribution"
        ]
    },
    {
        "name": "Dr. K. Prabakaran",
        "phone": "9786846377",
        "department": "Biomass and Energy Conversion",
        "roomNo": "139",
        "subjects": [
            "Biomass and its Conservation Technologies"
        ]
    },
    {
        "name": "Dr. S. Madhu",
        "phone": "9994777145",
        "department": "Autotronics",
        "roomNo": "Central Workshop",
        "subjects": [
            "Automotive Fuels and Lubricants"
        ]
    },
    {
        "name": "Dr.M.Kannan",
        "phone": "9940874029",
        "department": "Computational Biology ",
        "roomNo": "AHS -D10(1)",
        "subjects": [
            "Genetics"
        ]
    },
    {
        "name": "Dr. Arun John",
        "phone": "8270519339",
        "department": "Molecular Analytics",
        "roomNo": "AHS -C10(2)",
        "subjects": [
            "PERL Programming & BIOPERL"
        ]
    },
    {
        "name": "Dr. R. Saranya",
        "phone": "8248738062",
        "department": "Bioengineering",
        "roomNo": "AHS C11(1)",
        "subjects": [
            "Principles of Chemical Engineering"
        ]
    },
    {
        "name": "Dr. Nibedita",
        "phone": "9940317994",
        "department": "Medical Biotechnology and Integrative Physiology",
        "roomNo": "AHS-B10(1)",
        "subjects": [
            "Immunology"
        ]
    },
    {
        "name": "Dr Jenila Rani",
        "phone": "9003194033",
        "department": "Nanobiomaterial ",
        "roomNo": "AHS11A1",
        "subjects": [
            "Diagnostic and Therapeutic Equipment"
        ]
    },
    {
        "name": "Dr Neelam Sanjeev kumar",
        "phone": "7395927651",
        "department": "Wearable and Nano Sensors",
        "roomNo": "AHS12A1",
        "subjects": [
            "Biomedical Digital Signal processing"
        ]
    },
    {
        "name": "Dr Nirmala ",
        "phone": "9884420495",
        "department": "Medical Instrumentation",
        "roomNo": "AHS-B12-1",
        "subjects": [
            "Signals and Systems"
        ]
    },
    {
        "name": "Dr Vaidhegi",
        "phone": "8754170887",
        "department": "Nanobiomaterial ",
        "roomNo": "AHS11A2",
        "subjects": [
            "Bio Materials and Artificial Organs"
        ]
    },
    {
        "name": "Dr. TS Lakshmi",
        "phone": "9894733074",
        "department": "Structural Engineering",
        "roomNo": "414",
        "subjects": [
            "Structural Analysis"
        ]
    },
    {
        "name": "Dr.M.NAGARAJ",
        "phone": "9789031659",
        "department": "Farm Machinery and Food Engineering",
        "roomNo": "103",
        "subjects": [
            "Thermodynamics, Refrigeration and Air conditioning"
        ]
    },
    {
        "name": "Dr. M.Kalil Rahiman",
        "phone": "9994302469",
        "department": "Farm Machinery and Food Engineering",
        "roomNo": "104",
        "subjects": [
            "Agricultural Structures and Environmental Control"
        ]
    },
    {
        "name": "Dr. Nimel Ross",
        "phone": "9952828610",
        "department": "Manufacturing",
        "roomNo": "12",
        "subjects": [
            "Finite Element Analysis"
        ]
    },
    {
        "name": "Dr. R. Manikandan",
        "phone": "9976696620",
        "department": "Manufacturing",
        "roomNo": "20",
        "subjects": [
            "Materials Engineering and Technology"
        ]
    },
    {
        "name": "Dr Vidhya",
        "phone": "9444465345",
        "department": "Signal and Image Processing",
        "roomNo": "409",
        "subjects": [
            "Signals and Systems"
        ]
    },
    {
        "name": "Dr. RajMohan",
        "phone": "9894103232",
        "department": "Embedded System",
        "roomNo": "433",
        "subjects": [
            "Embedded Systems"
        ]
    },
    {
        "name": "Dr.E.Sivanantham",
        "phone": "9940801817",
        "department": "Robotics",
        "roomNo": "136",
        "subjects": [
            "Digital Circuits"
        ]
    },
    {
        "name": "Dr. Kavitha",
        "phone": "9566198092",
        "department": "Signal and Image Processing on Computational Intelligence",
        "roomNo": "336",
        "subjects": [
            "Microprocessors and Microcontrollers"
        ]
    },
    {
        "name": "Dr Beenarani",
        "phone": "9791802182",
        "department": "Networking",
        "roomNo": "330",
        "subjects": [
            "Computer Networks"
        ]
    },
    {
        "name": "Dr.K.Malathi ",
        "phone": "9941324901",
        "department": "Big Data and Network Security",
        "roomNo": "225",
        "subjects": [
            "C Programming"
        ]
    },
    {
        "name": "Dr. Veeramani",
        "phone": "9080381686",
        "department": "Artificial Intelligence",
        "roomNo": "337",
        "subjects": [
            "Data Structures"
        ]
    },
    {
        "name": "Dr. Saraswathi",
        "phone": "9790788111",
        "department": "Artificial Intelligence",
        "roomNo": "306",
        "subjects": [
            "Data Structures"
        ]
    },
    {
        "name": "Dr.K.Sasirekha",
        "phone": "8148912077",
        "department": "Programming",
        "roomNo": "206",
        "subjects": [
            "Data Structures"
        ]
    },
    {
        "name": "Dr. Uma Priyadarsini",
        "phone": "7200190155",
        "department": "Deep Learning",
        "roomNo": "119",
        "subjects": [
            "Data Structures"
        ]
    },
    {
        "name": "Dr Anithaashri",
        "phone": "8680974570",
        "department": "Cloud Computing",
        "roomNo": "308",
        "subjects": [
            "Data Structures"
        ]
    },
    {
        "name": "Dr.S.John Justin",
        "phone": "8940907978",
        "department": "Networking",
        "roomNo": "222",
        "subjects": [
            "Operating Systems"
        ]
    },
    {
        "name": "Dr.S.Radhika",
        "phone": "9940280798",
        "department": "Machine Learning",
        "roomNo": "304",
        "subjects": [
            "Operating Systems"
        ]
    },
    {
        "name": "Dr.Anusuya",
        "phone": "9787821102",
        "department": "Data Analytics ",
        "roomNo": "226",
        "subjects": [
            "Operating Systems"
        ]
    },
    {
        "name": "Dr K Nattar Kannan ",
        "phone": "7358359476",
        "department": "Applied Machine Learning",
        "roomNo": "609",
        "subjects": [
            "Operating Systems"
        ]
    },
    {
        "name": "Dr. Deepa",
        "phone": "9790909030",
        "department": "AR and VR",
        "roomNo": "230",
        "subjects": [
            "Database Management Systems"
        ]
    },
    {
        "name": "Dr. Padmakala",
        "phone": "8695467803",
        "department": "Machine Learning",
        "roomNo": "303",
        "subjects": [
            "Database Management Systems"
        ]
    },
    {
        "name": "Dr. Devi",
        "phone": "9841560895",
        "department": "AR and VR",
        "roomNo": "231",
        "subjects": [
            "Database Management Systems"
        ]
    },
    {
        "name": "Dr. Jaisharma",
        "phone": "9597005225",
        "department": "AR and VR",
        "roomNo": "234",
        "subjects": [
            "Database Management Systems"
        ]
    },
    {
        "name": "Dr.S.Pradeep Kumar",
        "phone": "9941221988",
        "department": "Block Chain and Cybersecurity",
        "roomNo": "238",
        "subjects": [
            "Design and Analysis of Algorithms"
        ]
    },
    {
        "name": "Dr.G.Anitha",
        "phone": "9952286913",
        "department": "VLSI Microelectronics",
        "roomNo": "325",
        "subjects": [
            "Computer Networks"
        ]
    },
    {
        "name": "Dr.Charlyn",
        "phone": "9150963017",
        "department": "Knowledge Engineering",
        "roomNo": "603",
        "subjects": [
            "Computer Networks"
        ]
    },
    {
        "name": "Dr. N.Nalini",
        "phone": "9941201779",
        "department": "VLSI Microelectronics",
        "roomNo": "327",
        "subjects": [
            "Computer Networks"
        ]
    },
    {
        "name": "Dr.P. Sriramya",
        "phone": "9176290854",
        "department": "Data Science",
        "roomNo": "401",
        "subjects": [
            "Python Programming"
        ]
    },
    {
        "name": "Dr. C. Sherin Shibi",
        "phone": "9962533314",
        "department": "Data Science",
        "roomNo": "401",
        "subjects": [
            "Python Programming"
        ]
    },
    {
        "name": "Dr. Rachel N",
        "phone": "9841313799",
        "department": "Data Science",
        "roomNo": "430",
        "subjects": [
            "Python Programming"
        ]
    },
    {
        "name": "Dr. Magesh Kumar.S",
        "phone": "9789724877",
        "department": "Big Data and Network Security",
        "roomNo": "240",
        "subjects": [
            "Programming in Java"
        ]
    },
    {
        "name": "Dr S Ashokkumar",
        "phone": "8220493137",
        "department": "Big Data and Network Security",
        "roomNo": "239",
        "subjects": [
            "Software Engineering"
        ]
    },
    {
        "name": "Dr Dhalapthy Rajasekar",
        "phone": "9445452697",
        "department": "Big Data and Network Security",
        "roomNo": "547",
        "subjects": [
            "Software Engineering"
        ]
    },
    {
        "name": "DR.PALANIKUMAR(KE)",
        "phone": "9445522700",
        "department": "Knowledge Engineering",
        "roomNo": "314",
        "subjects": [
            "Object Oriented Analysis and Design"
        ]
    },
    {
        "name": "Dr.Rashmita Khilar",
        "phone": "9940220629",
        "department": "Data Analytics ",
        "roomNo": "233",
        "subjects": [
            "Computer Architecture"
        ]
    },
    {
        "name": "Dr.Gokul Krishna",
        "phone": "9894751429",
        "department": "Data Analytics ",
        "roomNo": "404",
        "subjects": [
            "Computer Architecture"
        ]
    },
    {
        "name": "Dr.Thinakaran",
        "phone": "9894475486",
        "department": "Deep Learning",
        "roomNo": "120",
        "subjects": [
            "Theory of Computation"
        ]
    },
    {
        "name": "Dr W Deva Priya",
        "phone": "9442112071",
        "department": "Cloud Computing",
        "roomNo": "422",
        "subjects": [
            "Compiler Design"
        ]
    },
    {
        "name": "Dr.J.Pravin Chander",
        "phone": "9786491044",
        "department": "Computer Vision",
        "roomNo": "507",
        "subjects": [
            "Cloud Computing and Big Data Analytics"
        ]
    },
    {
        "name": "Ms. P.Malathi",
        "phone": "82486 17994",
        "department": "Computer Vision",
        "roomNo": "514",
        "subjects": [
            "Data Warehousing and Data Mining"
        ]
    },
    {
        "name": "Dr.Velu",
        "phone": "9380607095",
        "department": "Networking",
        "roomNo": "315",
        "subjects": [
            "Artificial Intelligence"
        ]
    },
    {
        "name": "Mr Sridhar",
        "phone": "7708534360",
        "department": "Big Data and Network Security",
        "roomNo": "134",
        "subjects": [
            "Artificial Intelligence"
        ]
    },
    {
        "name": "Dr M Gunasekaran",
        "phone": "9486564226",
        "department": "AR and VR",
        "roomNo": "223",
        "subjects": [
            "Graphics and Animation"
        ]
    },
    {
        "name": "Dr.Jagadeesan",
        "phone": "9865640964",
        "department": "Knowledge Engineering",
        "roomNo": "601",
        "subjects": [
            "Mobile Commerce"
        ]
    },
    {
        "name": "Dr.S.Sobitha Ahila",
        "phone": "9444221394",
        "department": "Information Security",
        "roomNo": "329",
        "subjects": [
            "Cryptography and Network Security"
        ]
    },
    {
        "name": "Dr. C. Mohan",
        "phone": "8056983152",
        "department": "Nano Electronics Materials and Sensors",
        "roomNo": "216",
        "subjects": [
            "Fundamentals of Computing"
        ]
    },
    {
        "name": "Dr. ANNIE GRACE VIMALA",
        "phone": "9841540605",
        "department": "Signal and Image Processing",
        "roomNo": "215",
        "subjects": [
            "Fundamentals of Computing"
        ]
    },
    {
        "name": "Dr. AKILANDESWARI",
        "phone": "9962560706",
        "department": "Signal and Image Processing",
        "roomNo": "214",
        "subjects": [
            "Fundamentals of Computing"
        ]
    },
    {
        "name": "Dr A Prabhu Chakkaravarthy",
        "phone": "9003256754",
        "department": "Information Security",
        "roomNo": "114",
        "subjects": [
            "Object Oriented Programming using C++"
        ]
    },
    {
        "name": "Dr. TERRANCE FREDERICK",
        "phone": "9944129501",
        "department": "Information Security",
        "roomNo": "224",
        "subjects": [
            "Object Oriented Programming using C++"
        ]
    },
    {
        "name": "Dr.G.Kumaran",
        "phone": "9962100958",
        "department": "Blockchain and Cybersecurity",
        "roomNo": "207",
        "subjects": [
            "Microprocessors and Microcontrollers"
        ]
    },
    {
        "name": "Dr. yuvaraj.R",
        "phone": "96266 19498",
        "department": "Embedded System",
        "roomNo": "433",
        "subjects": [
            "Microprocessors and Microcontrollers"
        ]
    },
    {
        "name": "Dr. S. Roji Marjorie",
        "phone": "9.19E+11",
        "department": "Materials Physics",
        "roomNo": "537",
        "subjects": [
            "Principles of Digital System Design"
        ]
    },
    {
        "name": "Dr.K.Chanthirasekaran",
        "phone": "9444462663",
        "department": "RF and Communication System",
        "roomNo": "208C",
        "subjects": [
            "Principles of Digital System Design"
        ]
    },
    {
        "name": "DR.SWAMINATHAN",
        "phone": "9444755536",
        "department": "Cloud Computing",
        "roomNo": "307",
        "subjects": [
            "Mobile computing"
        ]
    },
    {
        "name": "Dr M.Tholkapiyan",
        "phone": "9444254588",
        "department": "Environmental and Water Resources Engineering",
        "roomNo": "437 (Drawing Hall)",
        "subjects": [
            "Engineering Graphics"
        ]
    },
    {
        "name": "Dr. Revathi",
        "phone": "9444648849",
        "department": "Advanced Mathematical Sciences",
        "roomNo": "518",
        "subjects": [
            "Engineering Mathematics - I"
        ]
    },
    {
        "name": "Dr. G. Selvi",
        "phone": "9840887156",
        "department": "Advanced Mathematical Sciences",
        "roomNo": " ",
        "subjects": [
            "Engineering Mathematics - I"
        ]
    },
    {
        "name": "Mr  Raghavendran. R",
        "phone": "9087382665",
        "department": "Advanced Mathematical Sciences",
        "roomNo": "520",
        "subjects": [
            "Engineering Mathematics - I"
        ]
    },
    {
        "name": "DR. Majella",
        "phone": "9789114123",
        "department": "Applied Mathematics for Excellence",
        "roomNo": "605",
        "subjects": [
            "Discrete Mathematics"
        ]
    },
    {
        "name": "Dr. Mary Jiny",
        "phone": "9789776824",
        "department": "Applied Mathematics for Excellence",
        "roomNo": "516",
        "subjects": [
            "Discrete Mathematics"
        ]
    },
    {
        "name": "Dr. Balamurugan",
        "phone": "90035 80708",
        "department": "Mathematics for Excellence",
        "roomNo": " ",
        "subjects": [
            "Discrete Mathematics"
        ]
    },
    {
        "name": "Dr. G. Navamani",
        "phone": "9940047765",
        "department": "Applied Mathematics for Excellence",
        "roomNo": "515",
        "subjects": [
            "Probability and Statistics"
        ]
    },
    {
        "name": "Dr. K. Sivakumar",
        "phone": "9884582039",
        "department": "Applied Mathematics for Excellence",
        "roomNo": "517",
        "subjects": [
            "Probability and Statistics"
        ]
    },
    {
        "name": "Dr. S. Amirthaganesan",
        "phone": "9952921468",
        "department": "Applied Chemistry",
        "roomNo": "504",
        "subjects": [
            "Engineering Chemistry"
        ]
    },
    {
        "name": "Dr. L. Saravanan",
        "phone": "9841518751",
        "department": "Micro and Nanoelectronics",
        "roomNo": "536",
        "subjects": [
            "Applied Physics"
        ]
    },
    {
        "name": "Dr.Bharathi Raja",
        "phone": "8778662470",
        "department": "Design",
        "roomNo": "121",
        "subjects": [
            "Professional Ethics and Legal Practices"
        ]
    },
    {
        "name": "Dr. Rajakumar",
        "phone": "9894534789",
        "department": "Artificial Intelligence",
        "roomNo": "426",
        "subjects": [
            "Artificial Intelligence and Expert Systems"
        ]
    },
    {
        "name": "Dr. D. SivaKumar",
        "phone": "9790973774",
        "department": "Farm Machinery and Food Engineering",
        "roomNo": "4",
        "subjects": [
            "Total Quality Management "
        ]
    },
    {
        "name": "Dr. Arulvel",
        "phone": "8870921600",
        "department": "Bioengineering",
        "roomNo": "AHS C11(2)",
        "subjects": [
            "Biochemistry"
        ]
    },
    {
        "name": "Dr.V.Siva Shankar",
        "phone": "9952597610",
        "department": "Farm Machinery and Food Engineering",
        "roomNo": "104",
        "subjects": [
            "Food Packaging Technology"
        ]
    },
    {
        "name": "Dr. G. Ramya Devi",
        "phone": "9884243471",
        "department": "Industrial Engineering",
        "roomNo": "126",
        "subjects": [
            "CAD / CAM / CIM"
        ]
    },
    {
        "name": "Dr.Deepak",
        "phone": "9894738452",
        "department": "Nano Electronics Materials and Sensors",
        "roomNo": "216",
        "subjects": [
            "Nano Electronics"
        ]
    },
    {
        "name": "Dr.Bhaskar Rao",
        "phone": "9940249875",
        "department": "NanoTechnology",
        "roomNo": "211",
        "subjects": [
            "Semiconductor Devices"
        ]
    },
    {
        "name": "Dr. Grace Pavithra",
        "phone": "9629852536",
        "department": "Environmental and Water Resources Engineering",
        "roomNo": " ",
        "subjects": [
            "Biology and Environmental Science for Engineers"
        ]
    },
    {
        "name": "Dr. Thandaiah Prabu",
        "phone": "9751445529",
        "department": "VLSI Microelectronics",
        "roomNo": "325",
        "subjects": [
            "Computer Networks"
        ]
    },
    {
        "name": "Dr.G.Ramkumar",
        "phone": "9566560333",
        "department": "VLSI Microelectronics",
        "roomNo": "327",
        "subjects": [
            "Computer Networks"
        ]
    },
    {
        "name": "Dr.G.Mary Valantina",
        "phone": "9444753407",
        "department": "Information Security",
        "roomNo": "329",
        "subjects": [
            "Software Engineering"
        ]
    },
    {
        "name": "Dr. CHANDRAKALA.K.",
        "phone": "9600336295",
        "department": "RF and Communication System",
        "roomNo": "208B",
        "subjects": [
            "Principles of Digital System Design"
        ]
    },
    {
        "name": "Dr. Kothandaraman",
        "phone": "701033629",
        "department": "Applied Mathematics for Excellence",
        "roomNo": "515",
        "subjects": [
            "Probability and Statistics"
        ]
    }
];
