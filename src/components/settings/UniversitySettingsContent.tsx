import { Bell, Globe, GraduationCap, Image, Save, ShieldCheck, Sparkles } from 'lucide-react'

const tabs = [
  { label: 'General', icon: Globe },
  { label: 'Academic', icon: GraduationCap },
  { label: 'AI', icon: Sparkles },
  { label: 'Notifications', icon: Bell },
  { label: 'Security', icon: ShieldCheck },
]
const saveButton = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#273238] px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm disabled:cursor-not-allowed'
const input = 'mt-2 min-h-10 w-full rounded-xl border border-[#e5e8f0] bg-white px-3 py-2 text-[12px] font-normal text-[#68728a] placeholder:text-[#8791a8] disabled:cursor-not-allowed'

export default function UniversitySettingsContent() {
  return <main className="min-w-0 text-[#17213c]">
    <section className="border-b border-[#e5e8f0] bg-white px-4 pt-6 sm:px-7">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-display text-[22px] leading-[33px] font-extrabold">University Settings</h1><p className="mt-1 text-[13px] leading-5 text-[#68728a]">Configure your institution, academic calendar, AI behaviour, and security policies</p></div>
        <button type="button" disabled aria-describedby="university-settings-availability" className={saveButton}><Save size={14} aria-hidden="true" />Save Changes</button>
      </header>
      <div role="tablist" aria-label="University settings categories" className="mt-5 flex flex-wrap gap-x-4 sm:gap-x-6">
        {tabs.map(({ label, icon: Icon }, index) => <button key={label} type="button" role="tab" id={index === 0 ? 'university-general-tab' : undefined} aria-selected={index === 0} aria-controls={index === 0 ? 'university-general-panel' : undefined} disabled={index !== 0} aria-describedby={index !== 0 ? 'university-settings-availability' : undefined} className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-2 py-3 text-[12px] font-medium focus-visible:outline-2 disabled:cursor-not-allowed ${index === 0 ? 'border-[#273238] text-[#273238]' : 'border-transparent text-[#8791a8]'}`}><Icon size={14} aria-hidden="true" />{label}</button>)}
      </div>
    </section>
    <div id="university-general-panel" role="tabpanel" aria-labelledby="university-general-tab" className="mx-auto max-w-[700px] px-4 py-6 sm:px-7">
      <section aria-labelledby="institution-identity-title" className="overflow-hidden rounded-2xl border border-[#e5e8f0] bg-white">
        <header className="border-b border-[#e5e8f0] px-5 py-4"><h2 id="institution-identity-title" className="text-[14px] font-semibold">Institution Identity</h2><p className="mt-1 text-[12px] leading-5 text-[#68728a]">Core information displayed across the admin portal and student app</p></header>
        <div className="p-5">
          <p id="university-settings-availability" role="status" className="mb-5 rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] p-3 text-[12px] leading-6 text-[#68728a]">University settings unavailable. The existing backend does not expose an institution-settings API. Saved values, logo uploads, additional settings categories, and saving require an existing compatible API.</p>
          <fieldset disabled aria-describedby="university-settings-availability" className="min-w-0 space-y-5">
            <legend className="sr-only">Institution identity settings</legend>
            <label className="block text-[12px] font-semibold">University Name<input type="text" placeholder="University name unavailable" className={input} /></label>
            <div><h3 className="text-[12px] font-semibold">University Logo</h3><p id="university-logo-guidance" className="mt-1 text-[11px] leading-5 text-[#8791a8]">Recommended: 256×256 PNG or SVG, transparent background</p><div className="mt-3 flex flex-wrap items-center gap-4"><span aria-label="University logo unavailable" role="img" className="flex size-16 items-center justify-center rounded-xl border border-[#e5e8f0] bg-[#f7f8fc] text-[#b7bfce]"><Image size={24} aria-hidden="true" /></span><button type="button" aria-describedby="university-logo-guidance university-settings-availability" className="min-h-10 rounded-xl border border-[#e5e8f0] px-4 py-2 text-[12px] font-semibold disabled:cursor-not-allowed">Upload Logo</button></div></div>
            <div className="space-y-5 border-t border-[#e5e8f0] pt-5">
              <label className="block text-[12px] font-semibold">Address<textarea rows={2} placeholder="Address unavailable" className={`${input} resize-none`} /></label>
              <div className="grid gap-5 sm:grid-cols-2"><label className="block text-[12px] font-semibold">Phone Number<input type="tel" placeholder="Phone number unavailable" className={input} /></label><label className="block text-[12px] font-semibold">Email Address<input type="email" placeholder="Email address unavailable" className={input} /></label></div>
              <label className="block text-[12px] font-semibold">Website URL<input type="url" placeholder="Website URL unavailable" className={input} /></label>
            </div>
          </fieldset>
        </div>
      </section>
      <footer className="mt-5 flex justify-end"><button type="button" disabled aria-describedby="university-settings-availability" className={saveButton}>Save Changes</button></footer>
    </div>
  </main>
}
