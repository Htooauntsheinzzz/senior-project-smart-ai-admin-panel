import { useCallback, useEffect, useState } from 'react'
import type { CampusCategory, CampusFacility, CampusSite } from '../../types/campus'
import { getCampusCategories, getCampusFacilities } from '../../services/campusMapService'
import { deleteCampusSite, getAllCampusSites } from '../../services/campusSetupService'
import { buildingStatuses, campusError, mobileGroups } from '../../utils/campusApi'
import { ActionMenu, Badge, CampusTable, CodeChip, ConfirmDelete, PageHeader, SearchInput, SerialChip, SuccessToast, SummaryCards, TableState, primaryButton } from './CampusUi'
import { CategoryForm, FacilityForm, SiteForm } from './CampusForms'

// Campus Setup: the lookups every other campus screen depends on (spec 52 has no Figma screen for them,
// so this page reuses the Buildings layout). Backend: AdminCampusSiteController + AdminCampusCatalogController.

type Tab = 'sites' | 'categories' | 'facilities'
type Drawer = { tab: 'sites'; record?: CampusSite } | { tab: 'categories'; record?: CampusCategory } | { tab: 'facilities'; record?: CampusFacility }
const tabs: { key: Tab; label: string; add: string }[] = [
  { key: 'sites', label: 'Campuses', add: 'Add Campus' },
  { key: 'categories', label: 'Place Categories', add: 'Add Category' },
  { key: 'facilities', label: 'Facilities', add: 'Add Facility' },
]
const describe = (error: unknown) => campusError(error, 'Record not found.')
const matches = (search: string, ...values: (string | null | undefined)[]) => !search.trim() || values.some(value => value?.toLowerCase().includes(search.trim().toLowerCase()))
const status = (active: boolean) => { const s = buildingStatuses[active ? 'ACTIVE' : 'INACTIVE']; return <Badge bg={s.bg} text={s.text} dot>{active ? 'Active' : 'Inactive'}</Badge> }

export default function CampusSetupContent({ onDrawerChange }: { onDrawerChange: (open: boolean) => void }) {
  const [tab, setTab] = useState<Tab>('sites')
  const [search, setSearch] = useState('')
  const [version, setVersion] = useState(0)
  const [data, setData] = useState<{ version: number; sites?: CampusSite[]; categories?: CampusCategory[]; facilities?: CampusFacility[]; error?: string } | null>(null)
  const [drawer, setDrawer] = useState<Drawer | null>(null)
  const [deleting, setDeleting] = useState<{ id: number; name: string } | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getAllCampusSites(controller.signal), getCampusCategories(controller.signal), getCampusFacilities(controller.signal)])
      .then(([sites, categories, facilities]) => { if (!controller.signal.aborted) setData({ version, sites, categories, facilities }) })
      .catch(error => { if (!controller.signal.aborted) setData({ version, error: describe(error) }) })
    return () => controller.abort()
  }, [version])

  const current = data?.version === version ? data : null
  const refresh = () => setVersion(previous => previous + 1)
  const dismiss = useCallback(() => setMessage(''), [])
  function openDrawer(next: Drawer | null) { setDrawer(next); onDrawerChange(!!next) }
  const saved = (name: string, operation: 'created' | 'updated') => { openDrawer(null); refresh(); setMessage(`${name} was ${operation} successfully.`) }

  const sites = (current?.sites ?? []).filter(s => matches(search, s.siteCode, s.siteName))
  const categories = (current?.categories ?? []).filter(c => matches(search, c.categoryCode, c.categoryName, mobileGroups[c.mobileGroup]))
  const facilities = (current?.facilities ?? []).filter(f => matches(search, f.facilityCode, f.facilityName))
  const active = tabs.find(t => t.key === tab) ?? tabs[0]
  const count = { sites: current?.sites?.length, categories: current?.categories?.length, facilities: current?.facilities?.length }
  const state = (empty: boolean, noun: string, hint: string) => <TableState loading={!current} error={current?.error} empty={empty} loadingText={`Loading ${noun}…`} emptyText={search.trim() ? `No ${noun} match your search.` : hint} onRetry={refresh} />

  return <main className="min-w-0 text-[#17213c]">
    <PageHeader title="Campus Setup" description="Campuses, place categories and facilities that buildings, rooms, places and routes depend on"
      actions={<button type="button" onClick={() => openDrawer({ tab } as Drawer)} disabled={!!drawer} className={primaryButton}><img src="/assets/figma/faculty-plus.svg" width="15" height="15" alt="" />{active.add}</button>}>
      <SummaryCards label="Campus setup summary" error={current?.error} onRetry={refresh} items={[
        { label: 'Campuses', value: count.sites, tone: 'neutral' },
        { label: 'Active Campuses', value: current?.sites?.filter(s => s.isActive).length, tone: 'green' },
        { label: 'Place Categories', value: count.categories, tone: 'violet' },
        { label: 'Facilities', value: count.facilities, tone: 'amber' },
      ]} />
    </PageHeader>
    <div role="tablist" aria-label="Campus setup lists" className="flex gap-0.5 overflow-x-auto border-b-[1.25px] border-[#e5e8f0] bg-white px-4 sm:px-6">
      {tabs.map(t => <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => { setTab(t.key); setSearch('') }}
        className={`flex shrink-0 items-center gap-[5px] border-b-[2.5px] px-3.5 py-2.5 text-[13px] leading-[19.5px] ${tab === t.key ? 'border-[#273238] font-bold text-[#17213c]' : 'border-transparent font-medium text-[#68728a] hover:text-[#17213c]'} focus-visible:outline-2`}>
        {t.label}<span className="rounded-full bg-[#f1f3f8] px-1.5 text-[10px] leading-[15px] font-bold text-[#68728a]">{count[t.key] ?? '–'}</span>
      </button>)}
    </div>
    <div className="flex flex-wrap items-center gap-2.5 border-b-[1.25px] border-[#e5e8f0] bg-white px-4 py-3 sm:px-6">
      <SearchInput label={`Search ${active.label.toLowerCase()}`} placeholder={`Search ${active.label.toLowerCase()}…`} value={search} onChange={setSearch} />
      {tab === 'sites' && <p className="text-[12px] text-[#68728a] sm:ml-auto">Only a Super Admin can add, edit or delete campuses.</p>}
    </div>
    <section aria-label={active.label} className="px-4 pt-4 pb-6 sm:px-6">
      {tab === 'sites' && <CampusTable label="Campuses table" caption="Row numbers, campus codes, names, timezones, center coordinates, status and actions" minWidth={860}
        headers={['No.', 'Campus Code', 'Campus Name', 'Timezone', 'Center', 'Status', 'Actions']}
        state={state(!sites.length, 'campuses', 'No campuses yet. Add the first campus before adding buildings, places or navigation nodes.')}>
        {sites.map((site, index) => <tr key={site.id}>
          <td className="px-3.5 py-3"><SerialChip value={index + 1} /></td>
          <td className="px-3.5 py-3"><CodeChip>{site.siteCode}</CodeChip></td>
          <th scope="row" className="px-3.5 py-3 font-semibold">{site.siteName}{site.description && <span className="block max-w-[320px] truncate text-[11px] font-normal text-[#68728a]">{site.description}</span>}</th>
          <td className="px-3.5 py-3 text-[#68728a]">{site.timezone}</td>
          <td className="px-3.5 py-3 font-mono text-xs text-[#68728a]">{site.centerLatitude != null && site.centerLongitude != null ? `${site.centerLatitude}, ${site.centerLongitude}` : '—'}</td>
          <td className="px-3.5 py-3">{status(site.isActive)}</td>
          <td className="px-3.5 py-3"><ActionMenu label={`Actions for ${site.siteName}`} disabled={!!drawer} items={[
            { label: 'Edit', onSelect: () => openDrawer({ tab: 'sites', record: site }) },
            { label: 'Delete', danger: true, onSelect: () => setDeleting({ id: site.id, name: site.siteName }) },
          ]} /></td>
        </tr>)}
      </CampusTable>}
      {tab === 'categories' && <CampusTable label="Place categories table" caption="Row numbers, category codes, names, mobile app groups, status and actions" minWidth={760}
        headers={['No.', 'Category Code', 'Category Name', 'Mobile App Group', 'Status', 'Actions']}
        state={state(!categories.length, 'place categories', 'No place categories yet. Add one, such as Library or Cafeteria, before adding campus places.')}>
        {categories.map((category, index) => <tr key={category.id}>
          <td className="px-3.5 py-3"><SerialChip value={index + 1} /></td>
          <td className="px-3.5 py-3"><CodeChip>{category.categoryCode}</CodeChip></td>
          <th scope="row" className="px-3.5 py-3 font-semibold">{category.categoryName}</th>
          <td className="px-3.5 py-3">{mobileGroups[category.mobileGroup] ?? category.mobileGroup}</td>
          <td className="px-3.5 py-3">{status(category.isActive)}</td>
          <td className="px-3.5 py-3"><button type="button" disabled={!!drawer} onClick={() => openDrawer({ tab: 'categories', record: category })} aria-label={`Edit ${category.categoryName}`} className="h-[30.5px] rounded-[7px] border-[1.25px] border-[#e5e8f0] bg-white px-3 text-xs font-semibold hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:opacity-50">Edit</button></td>
        </tr>)}
      </CampusTable>}
      {tab === 'facilities' && <CampusTable label="Facilities table" caption="Row numbers, facility codes, names, descriptions, status and actions" minWidth={760}
        headers={['No.', 'Facility Code', 'Facility Name', 'Description', 'Status', 'Actions']}
        state={state(!facilities.length, 'facilities', 'No facilities yet. Add one, such as Projector or Wi-Fi, to attach it to rooms and places.')}>
        {facilities.map((facility, index) => <tr key={facility.id}>
          <td className="px-3.5 py-3"><SerialChip value={index + 1} /></td>
          <td className="px-3.5 py-3"><CodeChip>{facility.facilityCode}</CodeChip></td>
          <th scope="row" className="px-3.5 py-3 font-semibold">{facility.facilityName}</th>
          <td className="px-3.5 py-3 text-[#68728a]">{facility.description || '—'}</td>
          <td className="px-3.5 py-3">{status(facility.isActive)}</td>
          <td className="px-3.5 py-3"><button type="button" disabled={!!drawer} onClick={() => openDrawer({ tab: 'facilities', record: facility })} aria-label={`Edit ${facility.facilityName}`} className="h-[30.5px] rounded-[7px] border-[1.25px] border-[#e5e8f0] bg-white px-3 text-xs font-semibold hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:opacity-50">Edit</button></td>
        </tr>)}
      </CampusTable>}
    </section>
    {drawer?.tab === 'sites' && <SiteForm key={drawer.record?.id ?? 'new'} site={drawer.record} onClose={() => openDrawer(null)} onSaved={saved} />}
    {drawer?.tab === 'categories' && <CategoryForm key={drawer.record?.id ?? 'new'} category={drawer.record} onClose={() => openDrawer(null)} onSaved={saved} />}
    {drawer?.tab === 'facilities' && <FacilityForm key={drawer.record?.id ?? 'new'} facility={drawer.record} onClose={() => openDrawer(null)} onSaved={saved} />}
    {deleting && <ConfirmDelete title="Delete campus?" describeError={describe} onClose={() => setDeleting(null)} onConfirm={() => deleteCampusSite(deleting.id)}
      onDeleted={() => { setMessage(`${deleting.name} was deleted successfully.`); setDeleting(null); refresh() }}>
      Delete <strong className="text-[#17213c]">{deleting.name}</strong>? The backend refuses the delete while buildings, places or navigation data still belong to this campus.
    </ConfirmDelete>}
    <SuccessToast message={message} onDismiss={dismiss} />
  </main>
}
