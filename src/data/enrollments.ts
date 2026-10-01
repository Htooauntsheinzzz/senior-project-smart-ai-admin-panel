export type Enrollment = {
  id: string; studentId: string; name: string; color: string; course: string; courseName: string;
  section: string; date: string; semester: string; year: string; status: 'Active' | 'Pending' | 'Withdrawn' | 'Dropped'; demo?: boolean
}
const rows = [
  ['2024-0001', 'Thanapon Srisuk', '#8b45f5', 'CS301', 'Data Structures & Algorithms', '01', '2026-08-15'],
  ['2024-0001', 'Thanapon Srisuk', '#8b45f5', 'CS315', 'Database Systems', '02', '2026-08-15'],
  ['2024-0002', 'Pimchanok Buransiri', '#e58a13', 'BA102', 'Principles of Management', '01', '2026-08-16'],
  ['2024-0003', 'Kittipong Manit', '#df0865', 'CS322', 'Software Engineering', '01', '2026-08-16'],
  ['2023-0147', 'Naruemon Chaiya', '#346cf5', 'MA211', 'Calculus II', '02', '2026-01-10'],
  ['2023-0147', 'Naruemon Chaiya', '#346cf5', 'CS340', 'Computer Networks', '01', '2026-01-10'],
  ['2022-0283', 'Wanchai Pongpai', '#e58a13', 'CS401', 'Artificial Intelligence', '01', '2026-08-14'],
  ['2023-0312', 'Apirak Thongchai', '#10a37c', 'CS350', 'Operating Systems', '02', '2026-08-18'],
  ['2024-0058', 'Sirikwan Lertsak', '#7870fa', 'GE201', 'English for Academic Purposes', '03', '2026-08-17'],
  ['2022-0401', 'Phongphat Tadee', '#e58a13', 'CS410', 'Machine Learning', '01', '2026-08-15'],
]
const reference: Enrollment[] = rows.map(([studentId, name, color, course, courseName, section, date], index) => ({
  id: `reference-${index}`, studentId: `STD-${studentId}`, name, color, course, courseName, section: `SEC-${section}`, date,
  semester: index === 4 || index === 5 ? '2/2567' : '1/2568', year: index === 4 || index === 5 ? '2024–2025' : '2025–2026', status: index === 3 ? 'Pending' : 'Active',
}))
// Only page 1 is visible in Figma. Page 2 contains explicitly named synthetic
// records, distributed to reproduce the displayed summary counts.
export const initialEnrollments: Enrollment[] = [...reference, ...reference.map((row, index): Enrollment => ({
  ...row, id: `demo-${index}`, studentId: `DEMO-${String(index + 1).padStart(4, '0')}`, name: `Demo Student ${String(index + 1).padStart(2, '0')}`, demo: true,
  status: index < 6 ? 'Active' : index < 8 ? 'Pending' : index === 8 ? 'Withdrawn' : 'Dropped',
}))]
