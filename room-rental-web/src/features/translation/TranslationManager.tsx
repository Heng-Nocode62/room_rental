import { useEffect, useMemo, useState } from 'react'
import {
  createLanguage,
  deleteLanguage,
  deleteTranslation,
  deleteTranslationByKey,
  downloadExport,
  importTranslations,
  listLanguages,
  listTranslations,
  saveGlobalTranslation,
  toggleLanguage,
  toggleTranslation,
  updateLanguage,
  upsertTranslation,
} from './api'
// i18n is currently a JavaScript module without an accompanying declaration file.
// @ts-expect-error The module exports the functions used below but has no type declarations.
import { resetLanguageListCache, refreshLanguage } from '../../i18n'
import './translation-manager.css'

type Language = {
  id: number
  code: string
  title: string
  flag?: string | null
  active: boolean
  translationCount: number
}
type LanguageForm = { code: string; title: string; flag: string; active: boolean }
type Translation = { id: number; key: string; value: unknown; active: boolean }

const emptyLanguage: LanguageForm = { code: '', title: '', flag: '', active: true }

export default function TranslationManager() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null)
  const [translations, setTranslations] = useState<Translation[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [languageModal, setLanguageModal] = useState<Language | null | undefined>(undefined)
  const [languageForm, setLanguageForm] = useState<LanguageForm>(emptyLanguage)
  const [editing, setEditing] = useState<Translation | null>(null)
  const [translationModalOpen, setTranslationModalOpen] = useState(false)
  const [translationKey, setTranslationKey] = useState('')
  const [translationValue, setTranslationValue] = useState('')
  const [translationActive, setTranslationActive] = useState(true)
  const [importing, setImporting] = useState(false)

  const selectedLanguage = useMemo(
    () => languages.find((l) => l.id === selectedLanguageId) ?? null,
    [languages, selectedLanguageId],
  )

  async function loadLanguages() {
    const result = await listLanguages({ perPage: 100 })
    setLanguages(result.data)
    if (!selectedLanguageId && result.data.length) setSelectedLanguageId(result.data[0].id)
  }

  async function loadTranslations() {
    if (!selectedLanguageId) return
    setLoading(true)
    setError('')
    try {
      const result = await listTranslations(selectedLanguageId, keyword, 0, 500)
      setTranslations(result.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load translations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadLanguages() }, [])
  useEffect(() => { void loadTranslations() }, [selectedLanguageId, keyword])

  function openCreateLanguage() {
    setLanguageForm(emptyLanguage)
    setLanguageModal(null)
  }

  function openEditLanguage(language: Language) {
    setLanguageForm({ code: language.code, title: language.title, flag: language.flag ?? '', active: language.active })
    setLanguageModal(language)
  }

  async function submitLanguage() {
    setError('')
    try {
      if (languageModal === null) await createLanguage(languageForm)
      else if (languageModal) await updateLanguage(languageModal.id, languageForm)
      setLanguageModal(undefined)
      resetLanguageListCache()
      await loadLanguages()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save language')
    }
  }

  async function removeLanguage(language: Language) {
    if (!window.confirm(`Delete language ${language.code}? All its translations will be deleted.`)) return
    try {
      await deleteLanguage(language.id)
      if (selectedLanguageId === language.id) setSelectedLanguageId(null)
      resetLanguageListCache()
      await loadLanguages()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not delete language') }
  }

  function openTranslation(translation?: Translation) {
    setEditing(translation ?? null)
    setTranslationModalOpen(true)
    setTranslationKey(translation?.key ?? '')
    setTranslationValue(typeof translation?.value === 'string' ? translation.value : JSON.stringify(translation?.value ?? '', null, 2))
    setTranslationActive(translation?.active ?? true)
  }

  async function submitTranslation() {
    if (!selectedLanguageId || !translationKey.trim()) return
    try {
      let value: unknown = translationValue
      try { value = JSON.parse(translationValue) } catch { /* store as string */ }
      await upsertTranslation(selectedLanguageId, { key: translationKey.trim(), value, active: translationActive })
      setEditing(null)
      setTranslationModalOpen(false)
      await loadTranslations()
      if (selectedLanguage) await refreshLanguage(selectedLanguage.code)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save translation') }
  }

  async function removeTranslation(t: Translation) {
    if (!window.confirm(`Delete ${t.key}?`)) return
    try {
      await deleteTranslation(t.id)
      await loadTranslations()
      if (selectedLanguage) await refreshLanguage(selectedLanguage.code)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not delete translation') }
  }

  async function removeKeyEverywhere(key: string) {
    if (!window.confirm(`Delete ${key} from every language?`)) return
    try {
      await deleteTranslationByKey(key)
      await loadTranslations()
      if (selectedLanguage) await refreshLanguage(selectedLanguage.code)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not delete translation key') }
  }

  async function handleImport(file?: File) {
    if (!file) return
    setImporting(true)
    try {
      await importTranslations(file)
      await loadLanguages()
      await loadTranslations()
      if (selectedLanguage) await refreshLanguage(selectedLanguage.code)
      window.alert('Import completed.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not import translations') }
    finally { setImporting(false) }
  }

  async function handleExport() {
    try {
      const blob = await downloadExport(languages.filter((l) => l.active).map((l) => l.id))
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'translations.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not export translations') }
  }

  return (
    <div className="translation-page">
      <div className="translation-header">
        <div>
          <h1>Translation Management</h1>
          <p>Manage languages and system UI translations dynamically.</p>
        </div>
        <div className="translation-actions">
          <button onClick={handleExport}>Export Excel</button>
          <label className="button-like">
            {importing ? 'Importing...' : 'Import Excel'}
            <input hidden type="file" accept=".xlsx,.xls" disabled={importing} onChange={(e) => void handleImport(e.target.files?.[0])} />
          </label>
          <button onClick={openCreateLanguage}>+ Language</button>
        </div>
      </div>

      {error && <div className="translation-error">{error}</div>}

      <div className="translation-layout">
        <aside className="language-panel">
          <div className="panel-title">Languages</div>
          {languages.map((language) => (
            <div key={language.id} className={`language-row ${selectedLanguageId === language.id ? 'selected' : ''}`}>
              <button className="language-select" onClick={() => setSelectedLanguageId(language.id)}>
                <span>{language.flag || '🌐'}</span>
                <span className="language-info"><strong>{language.title}</strong><small>{language.code} · {language.translationCount} translations</small></span>
              </button>
              <div className="row-actions">
                <button title="Edit" onClick={() => openEditLanguage(language)}>✎</button>
                <button title={language.active ? 'Disable' : 'Enable'} onClick={() => void toggleLanguage(language.id).then(loadLanguages)}>◉</button>
                <button title="Delete" onClick={() => void removeLanguage(language)}>×</button>
              </div>
            </div>
          ))}
        </aside>

        <main className="translation-panel">
          <div className="panel-toolbar">
            <div><strong>{selectedLanguage?.title ?? 'Select a language'}</strong></div>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search translation key..." />
            <button disabled={!selectedLanguageId} onClick={() => openTranslation()}>+ Translation</button>
          </div>

          {loading ? <div className="empty">Loading...</div> : !selectedLanguageId ? <div className="empty">Create or select a language.</div> : (
            <table>
              <thead><tr><th>Key</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {translations.map((t) => (
                  <tr key={t.id}>
                    <td><code>{t.key}</code></td>
                    <td className="translation-value">{typeof t.value === 'string' ? t.value : JSON.stringify(t.value)}</td>
                    <td><span className={t.active ? 'status active' : 'status'}>{t.active ? 'Active' : 'Disabled'}</span></td>
                    <td className="actions-cell">
                      <button onClick={() => openTranslation(t)}>Edit</button>
                      <button onClick={() => void toggleTranslation(t.id).then(loadTranslations)}>Toggle</button>
                      <button onClick={() => void removeTranslation(t)}>Delete</button>
                      <button onClick={() => void removeKeyEverywhere(t.key)}>Delete Key</button>
                    </td>
                  </tr>
                ))}
                {!translations.length && <tr><td colSpan={4} className="empty">No translations found.</td></tr>}
              </tbody>
            </table>
          )}
        </main>
      </div>

      {languageModal !== undefined && (
        <div className="modal-backdrop" onMouseDown={() => setLanguageModal(undefined)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <h2>{languageModal ? 'Edit Language' : 'Create Language'}</h2>
            <label>Code<input value={languageForm.code} onChange={(e) => setLanguageForm({ ...languageForm, code: e.target.value })} placeholder="en" /></label>
            <label>Title<input value={languageForm.title} onChange={(e) => setLanguageForm({ ...languageForm, title: e.target.value })} placeholder="English" /></label>
            <label>Flag / icon<input value={languageForm.flag} onChange={(e) => setLanguageForm({ ...languageForm, flag: e.target.value })} placeholder="🇺🇸" /></label>
            <label className="checkbox"><input type="checkbox" checked={languageForm.active} onChange={(e) => setLanguageForm({ ...languageForm, active: e.target.checked })} /> Active</label>
            <div className="modal-actions"><button onClick={() => setLanguageModal(undefined)}>Cancel</button><button onClick={() => void submitLanguage()}>Save</button></div>
          </div>
        </div>
      )}

      {selectedLanguageId && translationModalOpen && (
        <div className="modal-backdrop" onMouseDown={() => setEditing(null)}>
          <div className="modal wide" onMouseDown={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Translation' : 'Create Translation'}</h2>
            <label>Key<input value={translationKey} disabled={!!editing} onChange={(e) => setTranslationKey(e.target.value)} placeholder="room.create" /></label>
            <label>Value<textarea rows={6} value={translationValue} onChange={(e) => setTranslationValue(e.target.value)} /></label>
            <label className="checkbox"><input type="checkbox" checked={translationActive} onChange={(e) => setTranslationActive(e.target.checked)} /> Active</label>
            <div className="modal-actions"><button onClick={() => { setEditing(null); setTranslationModalOpen(false) }}>Cancel</button><button onClick={() => void submitTranslation()}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
