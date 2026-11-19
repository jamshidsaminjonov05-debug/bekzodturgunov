import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { ErrorBox, Heading, Loader } from '../../components/ui'

const emptyMedia = { kind: 'video', title: '', url: '', level: '', description: '', published: true }
const emptyGroup = { mode: 'online', title: '', teacher: '', level_from: 'B1', level_to: 'B2',
  start_date: '', days: '', time: '', duration: '', capacity: 10, price: '', telegram: '',
  location: '', map_url: '', published: true }

export function MediaManager() {
  const [items, setItems] = useState(null)
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(() => api('/admin/media').then(setItems).catch(setError), [])
  useEffect(() => { load() }, [load])

  const save = async () => {
    try {
      if (form.id) await api(`/admin/media/${form.id}`, { method: 'PUT', body: form })
      else await api('/admin/media', { method: 'POST', body: form })
      setForm(null); load()
    } catch (e) { setError(e) }
  }
  const remove = async (id) => {
    if (!window.confirm('O\'chirilsinmi?')) return
    await api(`/admin/media/${id}`, { method: 'DELETE' }); load()
  }

  return (
    <div>
      <Heading as="h2">Media havolalari 🎬</Heading>
      <ErrorBox error={error} />
      {form ? (
        <div className="card grid gap-2 mb-md">
          <div className="grid gap-2 sm:grid-cols-3">
            <select className="input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="video">Video</option><option value="news">Yangilik</option><option value="podcast">Podcast</option>
            </select>
            <input className="input" placeholder="Daraja" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Nashr qilish</label>
          </div>
          <input className="input" placeholder="Nomi" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="input" placeholder="Havola (https://…)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <input className="input" placeholder="Tavsif" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-2">
            <button className="btn btn-yellow" onClick={save}>Saqlash</button>
            <button className="btn btn-ghost" onClick={() => setForm(null)}>Bekor qilish</button>
          </div>
        </div>
      ) : <button className="btn btn-yellow mb-md" onClick={() => setForm({ ...emptyMedia })}>+ Yangi havola</button>}
      {!items ? <Loader /> : items.length === 0 ? <p className="card tertiary">Hali havola yo'q.</p> : (
        <div className="grid gap-2">
          {items.map((m) => (
            <div key={m.id} className="card flex items-center gap-sm flex-wrap">
              <span className="tag">{m.kind}</span>
              <span className="flex-1 min-w-0 truncate">{m.title}</span>
              <span className="tertiary text-sm">{m.level}</span>
              <button className="btn !py-0" onClick={() => setForm({ ...m })}>Tahrirlash</button>
              <button className="btn btn-ghost !py-0 text-bad" onClick={() => remove(m.id)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function GroupManager() {
  const [items, setItems] = useState(null)
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const load = useCallback(() => api('/admin/groups').then(setItems).catch(setError), [])
  useEffect(() => { load() }, [load])

  const save = async () => {
    try {
      if (form.id) await api(`/admin/groups/${form.id}`, { method: 'PUT', body: form })
      else await api('/admin/groups', { method: 'POST', body: form })
      setForm(null); load()
    } catch (e) { setError(e) }
  }

  const field = (k, label, type = 'text') => (
    <input className="input" type={type} placeholder={label} value={form[k] ?? ''}
      onChange={(e) => setForm({ ...form, [k]: type === 'number' ? Number(e.target.value) : e.target.value })} />
  )

  return (
    <div>
      <Heading as="h2">Guruhlar 👥</Heading>
      <ErrorBox error={error} />
      {form ? (
        <div className="card grid gap-2 mb-md">
          <div className="grid gap-2 sm:grid-cols-2">
            <select className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
              <option value="online">Online</option><option value="offline">Offline</option>
            </select>
            {field('title', 'Guruh nomi')}
            {field('teacher', 'O‘qituvchi')}
            {field('level_from', 'Boshlang‘ich daraja')}
            {field('level_to', 'Maqsad daraja')}
            {field('start_date', 'Boshlanish sanasi')}
            {field('days', 'Kunlar')}
            {field('time', 'Vaqt')}
            {field('duration', 'Davomiylik')}
            {field('capacity', 'Sig‘im', 'number')}
            {field('price', 'Narx (haqiqiy)')}
            {field('telegram', 'Telegram havolasi')}
            {field('location', 'Manzil (offline)')}
            {field('map_url', 'Xarita havolasi')}
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Nashr qilish</label>
          <div className="flex gap-2">
            <button className="btn btn-yellow" onClick={save}>Saqlash</button>
            <button className="btn btn-ghost" onClick={() => setForm(null)}>Bekor qilish</button>
          </div>
        </div>
      ) : <button className="btn btn-yellow mb-md" onClick={() => setForm({ ...emptyGroup })}>+ Yangi guruh</button>}
      {!items ? <Loader /> : items.length === 0 ? <p className="card tertiary">Hali guruh yo'q.</p> : (
        <div className="grid gap-2">
          {items.map((g) => (
            <div key={g.id} className="card flex items-center gap-sm flex-wrap">
              <span className="tag">{g.mode}</span>
              <span className="flex-1 min-w-0 truncate">{g.title}</span>
              <span className="tertiary text-sm">{g.level_from}→{g.level_to}</span>
              <span className="font-mono">{g.price}</span>
              <button className="btn !py-0" onClick={() => setForm({ ...g })}>Tahrirlash</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function EnrollmentManager() {
  const [items, setItems] = useState(null)
  const load = useCallback(() => api('/admin/enrollments').then(setItems).catch(() => setItems([])), [])
  useEffect(() => { load() }, [load])
  const setStatus = async (id, status) => {
    await api(`/admin/enrollments/${id}`, { method: 'PATCH', body: { status } })
    load()
  }
  return (
    <div>
      <Heading as="h2">Yozilish arizalari 📝</Heading>
      {!items ? <Loader /> : items.length === 0 ? <p className="card tertiary">Hali ariza yo'q.</p> : (
        <div className="grid gap-2">
          {items.map((e) => (
            <div key={e.id} className="card flex items-center gap-sm flex-wrap">
              <span className="flex-1 min-w-0"><b>{e.student}</b> · {e.group}<br /><span className="tertiary text-sm">{e.phone} {e.message}</span></span>
              <span className="tag">{e.status}</span>
              <button className="btn !py-0" onClick={() => setStatus(e.id, 'approved')}>Tasdiqlash</button>
              <button className="btn btn-ghost !py-0 text-bad" onClick={() => setStatus(e.id, 'rejected')}>Rad etish</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
