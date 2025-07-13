
export type Faculty = {
  id?: string;
  name: string;
  designation: string;
  department: string;
  subjects: string[];
  phone: string;
  room: string;
};

// This data is now for placeholder/reference purposes
// The app will fetch data from Firestore instead.
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
];
