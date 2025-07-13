export type Faculty = {
  name: string;
  designation: string;
  department: string;
  subjects: string[];
  phone: string;
  room: string;
};

export const facultyData: Faculty[] = [
  {
    name: 'D. Sheela',
    designation: 'Professor',
    department: 'Embedded Systems',
    subjects: ['Microcontrollers', 'RTOS'],
    phone: '+91-9876543210',
    room: 'A-101',
  },
  {
    name: 'Dr. MANIKAVELAN',
    designation: 'Associate Professor',
    department: 'Blockchain and Cybersecurity',
    subjects: ['Blockchain', 'Cybersecurity', 'Cryptography'],
    phone: '+91-9876543211',
    room: 'B-203',
  },
  {
    name: 'Dr. A Mohan',
    designation: 'Professor',
    department: 'Information Security',
    subjects: ['Network Security', 'Ethical Hacking'],
    phone: '+91-9876543212',
    room: 'C-305',
  },
  {
    name: 'Dr. A Prabhu Chakkravarthy',
    designation: 'Assistant Professor',
    department: 'Information Security',
    subjects: ['Digital Forensics', 'Malware Analysis'],
    phone: '+91-9876543213',
    room: 'C-306',
  },
  {
    name: 'Dr. A Shrivindhya',
    designation: 'Professor',
    department: 'Big Data and Network Security',
    subjects: ['Big Data Analytics', 'Secure Coding', 'Network Security'],
    phone: '+91-9876543214',
    room: 'D-110',
  },
  {
    name: 'Dr. Anithaaashri',
    designation: 'Associate Professor',
    department: 'Cloud Computing',
    subjects: ['Cloud Architecture', 'Virtualization'],
    phone: '+91-9876543215',
    room: 'E-201',
  },
  {
    name: 'DR Arumugam S S',
    designation: 'Professor',
    department: 'Information Security',
    subjects: ['Information Theory', 'Coding', 'Security Protocols'],
    phone: '+91-9876543216',
    room: 'C-308',
  },
  {
    name: 'Dr. Beenarani',
    designation: 'Assistant Professor',
    department: 'Networking',
    subjects: ['Computer Networks', 'Wireless Communication'],
    phone: '+91-9876543217',
    room: 'F-105',
  },
];
