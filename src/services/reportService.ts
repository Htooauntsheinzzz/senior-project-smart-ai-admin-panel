import { getStudentSummary } from './studentService'
import { getCourseSummary } from './courseService'
import { getSectionSummary } from './sectionService'
import { getEnrollmentSummary } from './enrollmentService'

export type ReportMetric = { label: string; value: number }
export type ReportSection = { id: string; title: string; path: string; metrics: ReportMetric[]; fetchedAt?: string; error?: string }

function reportError(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response?.status
  if (status === 401) return 'Session expired. Sign in again.'
  if (status === 403) return 'You do not have permission to read this summary, or must change your password first.'
  return 'Summary could not be loaded. Refresh to retry.'
}

export async function getReportSections(signal?: AbortSignal): Promise<ReportSection[]> {
  async function load(id: string, title: string, path: string, fetchMetrics: () => Promise<ReportMetric[]>): Promise<ReportSection> {
    try {
      const metrics = await fetchMetrics()
      if (!metrics.every(m => Number.isSafeInteger(m.value) && m.value >= 0)) throw new Error('Unexpected report metrics.')
      return { id, title, path, metrics, fetchedAt: new Date().toISOString() }
    } catch (error) { return { id, title, path, metrics: [], error: reportError(error) } }
  }
  return Promise.all([
    load('students', 'Students', '/admin/students', async () => {
      const d = await getStudentSummary(signal)
      return [{ label: 'Total students', value: d.totalStudents }, { label: 'Active accounts', value: d.activeStudents }, { label: 'Pending accounts', value: d.pendingStudents }, { label: 'Inactive / suspended accounts', value: d.inactiveOrSuspendedStudents }]
    }),
    load('courses', 'Courses', '/admin/courses', async () => {
      const d = await getCourseSummary(signal)
      return [{ label: 'Total courses', value: d.totalCourses }, { label: 'Active courses', value: d.activeCourses }, { label: 'Inactive courses', value: d.inactiveCourses }]
    }),
    load('sections', 'Course Sections', '/admin/sections', async () => {
      const d = await getSectionSummary(signal)
      return [{ label: 'Total sections', value: d.totalSections }, { label: 'Active sections', value: d.activeSections }, { label: 'Closed sections', value: d.closedSections }, { label: 'Full sections', value: d.fullSections }]
    }),
    load('enrollments', 'Enrollments', '/admin/enrollments', async () => {
      const d = await getEnrollmentSummary(signal)
      return [{ label: 'Total enrollments', value: d.totalEnrollments }, { label: 'Active enrollments', value: d.activeEnrollments }, { label: 'Pending enrollments', value: d.pendingEnrollments }, { label: 'Withdrawn enrollments', value: d.withdrawnEnrollments }, { label: 'Dropped enrollments', value: d.droppedEnrollments }]
    }),
  ])
}

export function reportCsv(sections: ReportSection[]) {
  if (sections.length !== 4 || new Set(sections.map(s => s.id)).size !== 4 || !['students', 'courses', 'sections', 'enrollments'].every(id => sections.some(s => s.id === id)) || sections.some(s => s.error || !s.fetchedAt || !s.metrics.length)) throw new Error('Load all summaries successfully before exporting.')
  const cell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
  return ['Section,Metric,Value,Fetched at (UTC)', ...sections.flatMap(s => s.metrics.map(m => [s.title, m.label, m.value, s.fetchedAt!].map(cell).join(',')))].join('\r\n')
}
