import { useId, useRef, useState, type FormEvent } from 'react'
import Drawer from '../ui/Drawer'
import Modal from '../ui/Modal'
import type { KnowledgeCategory, KnowledgeDocument, KnowledgeDraft } from '../../types/knowledge'
import { createKnowledgeCategory, replaceKnowledgeFile, updateKnowledgeDocument, uploadKnowledgeDocument } from '../../services/knowledgeService'
import { ACCEPT_ATTRIBUTE, draftOf, emptyDraft, formatSize, knowledgeError, knowledgeErrorField, titleFromFilename, validateDraft, validateFile, type DraftField } from '../../utils/knowledgeBase'
import { Field, SelectInput, TextArea, TextInput } from '../campus/CampusUi'

// Upload / edit drawer of the AI Knowledge Base (Programs pattern: drawer for create and edit, modal for details and
// delete). Upload is POST /knowledge/documents/upload (multipart: title, categoryId, academicYearLabel, description,
// file); edit is PUT /knowledge/documents/{id} with the metadata only. The file of an existing document is changed
// with ReplaceFileModal (POST /{id}/files), which starts a new revision and new AI processing.
const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] leading-[20.25px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60'
const smallButton = 'rounded-lg border-[1.25px] border-[#e5e8f0] px-3 py-1.5 text-xs font-semibold text-[#17213c] hover:bg-[#f7f8fc] focus-visible:outline-2 disabled:opacity-50'
const same = (a: KnowledgeDraft, b: KnowledgeDraft) => (Object.keys(a) as (keyof KnowledgeDraft)[]).every(key => a[key] === b[key])

function FilePicker({ id, file, onChange, error }: { id: string; file: File | null; onChange: (file: File | null) => void; error?: string }) {
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  return <div onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)}
    onDrop={event => { event.preventDefault(); setDragging(false); onChange(event.dataTransfer.files[0] ?? null) }}
    className={`rounded-xl border-[1.25px] border-dashed px-4 py-5 text-center ${error ? 'border-[#d80255]' : dragging ? 'border-[#273238] bg-[#f7f8fc]' : 'border-[#cbd5e1]'}`}>
    <input ref={input} id={id} type="file" accept={ACCEPT_ATTRIBUTE} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : `${id}-hint`} className="sr-only" onChange={event => onChange(event.target.files?.[0] ?? null)} />
    {file ? <p className="text-[13px] font-semibold break-all text-[#17213c]">{file.name} <span className="font-normal text-[#68728a]">({formatSize(file.size)})</span></p>
      : <p className="text-[13px] text-[#68728a]">Drag a file here or</p>}
    <button type="button" onClick={() => input.current?.click()} className={`${smallButton} mt-2`}>{file ? 'Choose another file' : 'Choose file'}</button>
  </div>
}

export default function KnowledgeDocumentForm({ document, categories, categoryError, onRetryCategories, onClose, onSaved }: {
  document?: KnowledgeDocument; categories: KnowledgeCategory[] | null; categoryError: string; onRetryCategories: () => void
  onClose: () => void; onSaved: (title: string, operation: 'uploaded' | 'updated') => void
}) {
  const formId = useId()
  const [start] = useState<KnowledgeDraft>(() => document ? draftOf(document) : emptyDraft())
  const [value, setValue] = useState(start)
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Partial<Record<DraftField, string>>>({})
  const [failure, setFailure] = useState('')
  const [pending, setPending] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [discard, setDiscard] = useState(false)
  const [created, setCreated] = useState<KnowledgeCategory[]>([])
  const [newCategory, setNewCategory] = useState<string | null>(null)
  const [categoryFailure, setCategoryFailure] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const lock = useRef(false)

  function set(field: keyof KnowledgeDraft, next: string) {
    setValue(previous => ({ ...previous, [field]: next }))
    setErrors(previous => { if (!previous[field]) return previous; const copy = { ...previous }; delete copy[field]; return copy })
    setFailure('')
  }
  function pick(next: File | null) {
    setFile(next); setFailure('')
    setErrors(previous => ({ ...previous, file: next ? validateFile(next) : undefined }))
    if (next && !value.title.trim()) set('title', titleFromFilename(next.name))
  }
  function requestClose() {
    if (lock.current) return
    if (same(value, start) && !file) onClose(); else setDiscard(true)
  }
  const focusInvalid = () => requestAnimationFrame(() => window.document.getElementById(formId)?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())

  async function addCategory() {
    const name = newCategory?.trim() ?? ''
    if (!name || creatingCategory) { if (!name) setCategoryFailure('Enter a category name.'); return }
    setCreatingCategory(true); setCategoryFailure('')
    try {
      const category = await createKnowledgeCategory(name)
      setCreated(previous => [...previous, category]); set('categoryId', category.id); setNewCategory(null)
    } catch (error) {
      setCategoryFailure((error as { response?: { data?: { code?: string } } })?.response?.data?.code === 'DOCUMENT_CATEGORY_DUPLICATE' ? 'A category with this name already exists.' : knowledgeError(error))
    } finally { setCreatingCategory(false) }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (lock.current) return
    const found = validateDraft(value, document ? undefined : file)
    setErrors(found); setFailure('')
    if (Object.values(found).some(Boolean)) { focusInvalid(); return }
    lock.current = true; setPending(true)
    try {
      if (document) {
        const saved = await updateKnowledgeDocument(document, value)
        onSaved(saved.title, 'updated')
      } else {
        const saved = await uploadKnowledgeDocument(value, file as File, setProgress)
        onSaved(saved.title, 'uploaded')
      }
    } catch (error) {
      const field = knowledgeErrorField(error)
      const message = knowledgeError(error)
      if (field) { setErrors(previous => ({ ...previous, [field]: message })); focusInvalid() } else setFailure(message)
      lock.current = false; setPending(false); setProgress(null)
    }
  }

  const options = [...(categories ?? []), ...created.filter(category => !categories?.some(row => row.id === category.id))]
    .filter(category => category.isActive || category.id === start.categoryId).map(category => ({ value: category.id, label: category.name }))
  if (document?.category && !options.some(option => option.value === document.category!.id)) options.unshift({ value: document.category.id, label: document.category.name })
  const id = (field: DraftField) => `${formId}-${field}`

  return <>
    <Drawer width={480} title={document ? 'Edit Document Details' : 'Upload Document'} busy={pending} onClose={requestClose}
      description={document ? 'Change the title, category, academic year or description. Use Replace file to upload a new version.' : 'Official university documents are indexed for the AI Student Assistant after upload.'}
      footer={<>
        <button type="submit" form={formId} disabled={pending} className={`${button} bg-linear-[165deg,#273238,#1a2329] text-white`}>
          {document ? <img src="/assets/figma/faculty-check.svg" width="14" height="14" alt="" /> : <img src="/assets/figma/ai-upload.svg" width="15" height="15" alt="" />}
          {pending ? (document ? 'Saving…' : progress != null && progress < 100 ? `Uploading ${progress}%…` : 'Uploading…') : document ? 'Save Changes' : 'Upload Document'}
        </button>
        <button type="button" disabled={pending} onClick={requestClose} className={`${button} border-[1.25px] border-[#e5e8f0]`}>Cancel</button>
      </>}>
      {failure && <p role="alert" className="mb-4 rounded-xl border border-[#fecdd3] bg-[#fff1f2] px-3.5 py-2.5 text-[13px] text-[#be123c]">{failure}</p>}
      <form id={formId} onSubmit={submit} noValidate>
        <fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2">
          {!document && <Field id={id('file')} label="File" required error={errors.file} hint="PDF, DOCX, TXT or XLSX, up to 50 MB.">
            <FilePicker id={id('file')} file={file} onChange={pick} error={errors.file} />
          </Field>}
          <Field id={id('title')} label="Document Title" required error={errors.title}>
            <TextInput id={id('title')} value={value.title} onChange={next => set('title', next)} placeholder="e.g. Student Handbook 2025–2026" error={errors.title} required />
          </Field>
          <Field id={id('categoryId')} label="Category" required full={false} error={errors.categoryId}>
            <SelectInput id={id('categoryId')} value={value.categoryId} onChange={next => set('categoryId', next)} disabled={!categories && !created.length}
              placeholder={categories ? (options.length ? 'Select category…' : 'No categories yet') : categoryError ? 'Categories unavailable' : 'Loading categories…'} options={options} error={errors.categoryId} required />
            {categoryError && !categories && <p className="mt-1 text-xs text-[#d80255]">Categories could not be loaded. <button type="button" onClick={onRetryCategories} className="rounded px-1 font-semibold underline focus-visible:outline-2">Retry</button></p>}
            {newCategory === null
              ? <button type="button" onClick={() => { setNewCategory(''); setCategoryFailure('') }} className="mt-1.5 text-xs font-semibold text-[#273238] underline focus-visible:outline-2">+ New category</button>
              : <div className="mt-2 rounded-xl border-[1.25px] border-[#e5e8f0] p-2.5">
                <label htmlFor={`${formId}-new-category`} className="mb-1 block text-[11px] font-semibold text-[#68728a]">New category name</label>
                <input id={`${formId}-new-category`} value={newCategory} maxLength={150} onChange={event => setNewCategory(event.target.value)}
                  onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); void addCategory() } }}
                  className="w-full rounded-lg border-[1.25px] border-[#e5e8f0] px-2.5 py-1.5 text-[13px] focus-visible:outline-2" placeholder="e.g. Student Handbook" />
                {categoryFailure && <p role="alert" className="mt-1 text-xs text-[#d80255]">{categoryFailure}</p>}
                <div className="mt-2 flex gap-2"><button type="button" disabled={creatingCategory} onClick={() => { void addCategory() }} className={`${smallButton} bg-[#273238] text-white hover:bg-[#1a2329]`}>{creatingCategory ? 'Adding…' : 'Add'}</button><button type="button" disabled={creatingCategory} onClick={() => setNewCategory(null)} className={smallButton}>Cancel</button></div>
              </div>}
          </Field>
          <Field id={id('academicYearLabel')} label="Academic Year" required full={false} error={errors.academicYearLabel} hint="e.g. 2025–2026">
            <TextInput id={id('academicYearLabel')} value={value.academicYearLabel} onChange={next => set('academicYearLabel', next)} placeholder="2025–2026" error={errors.academicYearLabel} required />
          </Field>
          <Field id={id('description')} label="Description" error={errors.description} hint="Optional. What the document covers, up to 5,000 characters.">
            <TextArea id={id('description')} value={value.description} onChange={next => set('description', next)} placeholder="Short summary for administrators" error={errors.description} />
          </Field>
        </fieldset>
      </form>
      {!document && <p className="mt-4 text-[11px] leading-[16.5px] text-[#68728a]">The document is shared university-wide. After upload it goes through extraction, chunking and embedding; the AI Status column shows each step until it is Ready.</p>}
    </Drawer>
    {discard && <Modal title="Discard changes?" onClose={() => setDiscard(false)}><p className="text-sm leading-6 text-[#68728a]">Your unsaved changes to this document will be lost.</p><div className="mt-6 flex justify-end gap-3"><button type="button" className="rounded-xl border border-[#e5e8f0] px-4 py-2 text-sm font-semibold focus-visible:outline-2" onClick={() => setDiscard(false)}>Keep editing</button><button type="button" className="rounded-xl bg-[#273238] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2" onClick={onClose}>Discard</button></div></Modal>}
  </>
}

/** Uploads a new revision of the document's file; AI processing starts again for it. */
export function ReplaceFileModal({ document, onClose, onReplaced }: { document: KnowledgeDocument; onClose: () => void; onReplaced: () => void }) {
  const inputId = useId()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  async function submit() {
    const invalid = validateFile(file)
    if (invalid) { setError(invalid); return }
    setPending(true); setError('')
    try { await replaceKnowledgeFile(document.id, file as File, setProgress); onReplaced() } catch (failure) { setError(knowledgeError(failure)); setPending(false); setProgress(null) }
  }
  return <Modal title="Replace file" busy={pending} onClose={onClose}>
    <p className="mb-4 text-sm leading-6 text-[#68728a]">Upload a new version of <strong className="text-[#17213c]">{document.title}</strong>{document.file ? ` (now ${document.file.originalFilename}, revision ${document.file.revisionNumber})` : ''}. The AI uses the new version once it is processed.</p>
    <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-[#17213c]">New file</label>
    <FilePicker id={inputId} file={file} onChange={next => { setFile(next); setError(next ? validateFile(next) ?? '' : '') }} error={error || undefined} />
    {error && <p id={`${inputId}-error`} role="alert" className="mt-2 text-sm text-[#d80255]">{error}</p>}
    <p id={`${inputId}-hint`} className="mt-2 text-[11px] text-[#68728a]">PDF, DOCX, TXT or XLSX, up to 50 MB.</p>
    <div className="mt-6 flex justify-end gap-3">
      <button type="button" disabled={pending} onClick={onClose} className="rounded-xl border border-[#e5e8f0] px-4 py-2 text-sm font-semibold focus-visible:outline-2 disabled:opacity-50">Cancel</button>
      <button type="button" disabled={pending} onClick={() => { void submit() }} className="rounded-xl bg-[#273238] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 disabled:opacity-60">{pending ? (progress != null && progress < 100 ? `Uploading ${progress}%…` : 'Uploading…') : 'Upload new version'}</button>
    </div>
  </Modal>
}
