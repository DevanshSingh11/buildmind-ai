import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || (window.location.port === '5173' ? '/api' : 'http://localhost:8000/api');
const blank = { name: '', location: '', project_type: 'Residential', status: 'Planning', budget: 0, progress: 0, start_date: '', target_date: '', notes: '' };

export default function Projects() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function load() {
    setLoading(true);
    try { const r = await fetch(`${API}/projects`); if (!r.ok) throw new Error('Could not load projects'); const d = await r.json(); setItems(d.items || []); setError(''); }
    catch (e) { setError(`${e.message}. Check that the FastAPI backend is running.`); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function save(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const r = await fetch(`${API}/projects${editing ? `/${editing}` : ''}`, { method: editing ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...form, budget:Number(form.budget), progress:Number(form.progress)}) });
      const d = await r.json(); if (!r.ok) throw new Error(d.detail?.[0]?.msg || d.detail || 'Unable to save project');
      setForm(blank); setEditing(''); await load();
    } catch (e) { setError(String(e.message)); } finally { setSaving(false); }
  }
  function edit(p) { setEditing(p.id); setForm(Object.fromEntries(Object.keys(blank).map(k => [k, p[k] ?? blank[k]]))); window.scrollTo({top:0,behavior:'smooth'}); }
  async function remove(id) { if (!window.confirm('Delete this project permanently?')) return; try { const r=await fetch(`${API}/projects/${id}`,{method:'DELETE'}); if(!r.ok) throw new Error('Delete failed'); await load(); } catch(e) {setError(e.message);} }
  const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n || 0);
  return <div className="space-y-6">
    <section className="rounded-2xl bg-slate-900 text-white p-6 md:p-8">
      <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">Project control center</p>
      <h2 className="text-2xl md:text-3xl font-extrabold mt-2">Project Workspace</h2>
      <p className="text-slate-300 mt-2 max-w-2xl">Track project budgets, delivery dates, progress and field notes in one persistent workspace.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[['Total projects',items.length],['In progress',items.filter(x=>x.status==='In Progress').length],['Avg. progress',items.length ? `${Math.round(items.reduce((a,x)=>a+x.progress,0)/items.length)}%` : '—'],['Portfolio budget',money(items.reduce((a,x)=>a+x.budget,0))]].map(([k,v])=><div key={k} className="rounded-xl bg-white/5 border border-white/10 p-4"><p className="text-xs text-slate-400">{k}</p><p className="text-xl font-bold mt-1">{v}</p></div>)}
      </div>
    </section>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">{error}</div>}
    <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
      <div className="flex justify-between gap-3 items-center mb-4"><h3 className="font-bold text-lg">{editing ? 'Edit project' : 'Create a project'}</h3>{editing && <button onClick={()=>{setEditing('');setForm(blank)}} className="text-sm text-slate-500">Cancel edit</button>}</div>
      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm font-medium">Project name<input required minLength="2" name="name" value={form.name} onChange={change} className="mt-1 w-full rounded-lg border p-3 font-normal" placeholder="e.g. Skyline Residences"/></label>
        <label className="text-sm font-medium">Location<input name="location" value={form.location} onChange={change} className="mt-1 w-full rounded-lg border p-3 font-normal" placeholder="City, site address"/></label>
        <label className="text-sm font-medium">Project type<select name="project_type" value={form.project_type} onChange={change} className="mt-1 w-full rounded-lg border p-3 font-normal">{['Residential','Commercial','Infrastructure','Industrial','Renovation','Mixed-use'].map(x=><option key={x}>{x}</option>)}</select></label>
        <label className="text-sm font-medium">Status<select name="status" value={form.status} onChange={change} className="mt-1 w-full rounded-lg border p-3 font-normal">{['Planning','In Progress','On Hold','Completed'].map(x=><option key={x}>{x}</option>)}</select></label>
        <label className="text-sm font-medium">Budget (₹)<input type="number" min="0" name="budget" value={form.budget} onChange={change} className="mt-1 w-full rounded-lg border p-3 font-normal"/></label>
        <label className="text-sm font-medium">Progress: {form.progress}%<input type="range" min="0" max="100" name="progress" value={form.progress} onChange={change} className="mt-3 w-full"/></label>
        <label className="text-sm font-medium">Start date<input type="date" name="start_date" value={form.start_date} onChange={change} className="mt-1 w-full rounded-lg border p-3 font-normal"/></label>
        <label className="text-sm font-medium">Target completion<input type="date" name="target_date" value={form.target_date} onChange={change} className="mt-1 w-full rounded-lg border p-3 font-normal"/></label>
        <label className="text-sm font-medium md:col-span-2">Notes<textarea name="notes" value={form.notes} onChange={change} rows="3" className="mt-1 w-full rounded-lg border p-3 font-normal" placeholder="Scope, constraints, site observations…"/></label>
        <div className="md:col-span-2"><button disabled={saving} className="rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold px-5 py-3">{saving ? 'Saving…' : editing ? 'Update project' : 'Add project'}</button></div>
      </form>
    </section>
    <section className="space-y-3"><div className="flex justify-between items-center"><h3 className="font-bold text-lg">Your projects</h3><button onClick={load} className="text-sm text-amber-700 font-semibold">↻ Refresh</button></div>
      {loading ? <p className="text-slate-500 p-6">Loading projects…</p> : items.length===0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-slate-500">No projects yet. Create your first project above.</div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{items.map(p=><article key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex justify-between gap-3"><div><h4 className="font-bold text-lg">{p.name}</h4><p className="text-sm text-slate-500 mt-1">{p.location || 'Location not set'} · {p.project_type}</p></div><span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{p.status}</span></div>
        <div className="mt-5 flex justify-between text-sm"><span className="text-slate-500">Progress</span><strong>{p.progress}%</strong></div><div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{width:`${p.progress}%`}}/></div>
        <div className="grid grid-cols-2 gap-3 mt-4"><div><p className="text-xs text-slate-500">Budget</p><p className="font-bold">{money(p.budget)}</p></div><div><p className="text-xs text-slate-500">Target date</p><p className="font-bold">{p.target_date || 'Not set'}</p></div></div>
        {p.notes && <p className="mt-3 text-sm text-slate-600 line-clamp-2">{p.notes}</p>}
        <div className="flex gap-4 mt-5 pt-4 border-t"><button onClick={()=>edit(p)} className="text-sm font-semibold text-blue-700">Edit</button><button onClick={()=>remove(p.id)} className="text-sm font-semibold text-red-600">Delete</button></div>
      </article>)}</div>}
    </section>
  </div>;
}
