import { initialFaculties } from '../data/faculties'
import type { Faculty } from '../types/faculty'

// Async adapter boundary for the searchable dropdown. All seven local fixtures
// are offered in demo mode; production eligibility must come from the service.
export async function loadDemoFacultyOptions(): Promise<Faculty[]> {
  return initialFaculties
}
