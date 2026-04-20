export type BookStatus = "available" | "issued" | "missing";

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  rfidTag: string;
  status: BookStatus;
  shelf: string;
  section: string;
  coverColor: string;
  issuedTo?: string;
  dueDate?: string;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
  department: string;
  rfidCard: string;
}

export interface ScanLog {
  id: string;
  timestamp: string;
  type: "check-in" | "check-out" | "movement" | "misplaced";
  bookTitle: string;
  rfidTag: string;
  location: string;
  student?: string;
}

export interface Alert {
  id: string;
  type: "misplaced" | "unauthorized" | "late-return" | "missing";
  message: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
  resolved: boolean;
  bookTitle?: string;
}

const genres = ["Fiction", "Science", "History", "Technology", "Philosophy", "Mathematics", "Literature", "Biology"];
const coverColors = [
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-violet-500 to-violet-700",
  "from-amber-500 to-amber-700",
  "from-rose-500 to-rose-700",
  "from-cyan-500 to-cyan-700",
  "from-indigo-500 to-indigo-700",
  "from-teal-500 to-teal-700",
];

export const books: Book[] = [
  { id: "1", title: "Introduction to Algorithms", author: "Thomas H. Cormen", genre: "Technology", isbn: "978-0262033848", rfidTag: "RFID-001", status: "available", shelf: "A1", section: "Computer Science", coverColor: coverColors[0] },
  { id: "2", title: "Clean Code", author: "Robert C. Martin", genre: "Technology", isbn: "978-0132350884", rfidTag: "RFID-002", status: "issued", shelf: "A2", section: "Computer Science", coverColor: coverColors[1], issuedTo: "Alice Johnson", dueDate: "2026-04-20" },
  { id: "3", title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Literature", isbn: "978-0743273565", rfidTag: "RFID-003", status: "available", shelf: "B1", section: "Literature", coverColor: coverColors[2] },
  { id: "4", title: "A Brief History of Time", author: "Stephen Hawking", genre: "Science", isbn: "978-0553380163", rfidTag: "RFID-004", status: "missing", shelf: "C3", section: "Physics", coverColor: coverColors[3] },
  { id: "5", title: "Sapiens", author: "Yuval Noah Harari", genre: "History", isbn: "978-0062316097", rfidTag: "RFID-005", status: "available", shelf: "D1", section: "History", coverColor: coverColors[4] },
  { id: "6", title: "Design Patterns", author: "Gang of Four", genre: "Technology", isbn: "978-0201633610", rfidTag: "RFID-006", status: "issued", shelf: "A3", section: "Computer Science", coverColor: coverColors[5], issuedTo: "Bob Smith", dueDate: "2026-04-15" },
  { id: "7", title: "The Art of War", author: "Sun Tzu", genre: "Philosophy", isbn: "978-1599869773", rfidTag: "RFID-007", status: "available", shelf: "E2", section: "Philosophy", coverColor: coverColors[6] },
  { id: "8", title: "Calculus", author: "James Stewart", genre: "Mathematics", isbn: "978-1285740621", rfidTag: "RFID-008", status: "available", shelf: "F1", section: "Mathematics", coverColor: coverColors[7] },
  { id: "9", title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Literature", isbn: "978-0446310789", rfidTag: "RFID-009", status: "issued", shelf: "B2", section: "Literature", coverColor: coverColors[0], issuedTo: "Carol Davis", dueDate: "2026-04-18" },
  { id: "10", title: "The Selfish Gene", author: "Richard Dawkins", genre: "Biology", isbn: "978-0199291151", rfidTag: "RFID-010", status: "available", shelf: "C1", section: "Biology", coverColor: coverColors[1] },
  { id: "11", title: "1984", author: "George Orwell", genre: "Fiction", isbn: "978-0451524935", rfidTag: "RFID-011", status: "available", shelf: "B3", section: "Literature", coverColor: coverColors[2] },
  { id: "12", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "Science", isbn: "978-0374533557", rfidTag: "RFID-012", status: "missing", shelf: "D2", section: "Psychology", coverColor: coverColors[3] },
];

export const students: Student[] = [
  { id: "1", name: "Alice Johnson", studentId: "STU-2024-001", department: "Computer Science", rfidCard: "CARD-001" },
  { id: "2", name: "Bob Smith", studentId: "STU-2024-002", department: "Physics", rfidCard: "CARD-002" },
  { id: "3", name: "Carol Davis", studentId: "STU-2024-003", department: "Literature", rfidCard: "CARD-003" },
];

export const scanLogs: ScanLog[] = [
  { id: "1", timestamp: "2026-04-10T09:15:00", type: "check-out", bookTitle: "Clean Code", rfidTag: "RFID-002", location: "Front Desk", student: "Alice Johnson" },
  { id: "2", timestamp: "2026-04-10T09:30:00", type: "movement", bookTitle: "A Brief History of Time", rfidTag: "RFID-004", location: "Shelf C3 → Shelf A1" },
  { id: "3", timestamp: "2026-04-10T10:00:00", type: "check-in", bookTitle: "The Great Gatsby", rfidTag: "RFID-003", location: "Front Desk", student: "Carol Davis" },
  { id: "4", timestamp: "2026-04-10T10:15:00", type: "misplaced", bookTitle: "A Brief History of Time", rfidTag: "RFID-004", location: "Shelf A1 (Expected: C3)" },
  { id: "5", timestamp: "2026-04-10T10:45:00", type: "check-out", bookTitle: "Design Patterns", rfidTag: "RFID-006", location: "Front Desk", student: "Bob Smith" },
  { id: "6", timestamp: "2026-04-10T11:00:00", type: "check-out", bookTitle: "To Kill a Mockingbird", rfidTag: "RFID-009", location: "Front Desk", student: "Carol Davis" },
  { id: "7", timestamp: "2026-04-10T11:30:00", type: "movement", bookTitle: "Thinking, Fast and Slow", rfidTag: "RFID-012", location: "Shelf D2 → Unknown" },
  { id: "8", timestamp: "2026-04-10T12:00:00", type: "check-in", bookTitle: "Sapiens", rfidTag: "RFID-005", location: "Front Desk", student: "Alice Johnson" },
];

export const alerts: Alert[] = [
  { id: "1", type: "misplaced", message: "\"A Brief History of Time\" detected on wrong shelf (A1 instead of C3)", timestamp: "2026-04-10T10:15:00", severity: "medium", resolved: false, bookTitle: "A Brief History of Time" },
  { id: "2", type: "late-return", message: "\"Design Patterns\" due date approaching for Bob Smith (Apr 15)", timestamp: "2026-04-10T08:00:00", severity: "low", resolved: false, bookTitle: "Design Patterns" },
  { id: "3", type: "missing", message: "\"Thinking, Fast and Slow\" not detected by any RFID reader", timestamp: "2026-04-10T11:30:00", severity: "high", resolved: false, bookTitle: "Thinking, Fast and Slow" },
  { id: "4", type: "unauthorized", message: "Unauthorized book movement detected near exit gate", timestamp: "2026-04-10T09:45:00", severity: "high", resolved: true },
  { id: "5", type: "late-return", message: "\"To Kill a Mockingbird\" due date approaching for Carol Davis (Apr 18)", timestamp: "2026-04-10T08:00:00", severity: "low", resolved: false, bookTitle: "To Kill a Mockingbird" },
];

export const usageData = [
  { month: "Jan", checkouts: 145, returns: 132, searches: 420 },
  { month: "Feb", checkouts: 168, returns: 155, searches: 380 },
  { month: "Mar", checkouts: 192, returns: 178, searches: 510 },
  { month: "Apr", checkouts: 87, returns: 95, searches: 290 },
];

export const genreDistribution = [
  { name: "Technology", value: 35, fill: "hsl(210, 80%, 55%)" },
  { name: "Literature", value: 25, fill: "hsl(160, 50%, 48%)" },
  { name: "Science", value: 20, fill: "hsl(38, 92%, 55%)" },
  { name: "History", value: 10, fill: "hsl(280, 60%, 55%)" },
  { name: "Other", value: 10, fill: "hsl(215, 15%, 50%)" },
];

// Shelf grid for live tracking
export const shelfGrid = [
  { id: "A1", row: 0, col: 0, section: "Computer Science", books: ["Introduction to Algorithms"] },
  { id: "A2", row: 0, col: 1, section: "Computer Science", books: [] },
  { id: "A3", row: 0, col: 2, section: "Computer Science", books: [] },
  { id: "A4", row: 0, col: 3, section: "Computer Science", books: [] },
  { id: "B1", row: 1, col: 0, section: "Literature", books: ["The Great Gatsby"] },
  { id: "B2", row: 1, col: 1, section: "Literature", books: [] },
  { id: "B3", row: 1, col: 2, section: "Literature", books: ["1984"] },
  { id: "B4", row: 1, col: 3, section: "Literature", books: [] },
  { id: "C1", row: 2, col: 0, section: "Biology", books: ["The Selfish Gene"] },
  { id: "C2", row: 2, col: 1, section: "Biology", books: [] },
  { id: "C3", row: 2, col: 2, section: "Physics", books: [] },
  { id: "C4", row: 2, col: 3, section: "Physics", books: [] },
  { id: "D1", row: 3, col: 0, section: "History", books: ["Sapiens"] },
  { id: "D2", row: 3, col: 1, section: "Psychology", books: [] },
  { id: "E1", row: 4, col: 0, section: "Philosophy", books: ["The Art of War"] },
  { id: "E2", row: 4, col: 1, section: "Philosophy", books: [] },
  { id: "F1", row: 4, col: 2, section: "Mathematics", books: ["Calculus"] },
  { id: "F2", row: 4, col: 3, section: "Mathematics", books: [] },
];
