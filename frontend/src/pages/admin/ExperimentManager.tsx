import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit3, Trash2, X, BookOpen, Save } from 'lucide-react';
import PageLayout from '../../components/common/PageLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { experimentsAPI } from '../../services/api';
import { Experiment } from '../../types';

type Category = Experiment['category'];
type Difficulty = Experiment['difficulty'];

const categoryColors: Record<Category, string> = {
  mechanics: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  optics: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  thermodynamics: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  electromagnetism: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  waves: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  modern_physics: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const difficultyColor: Record<Difficulty, string> = {
  beginner: 'text-emerald-400',
  intermediate: 'text-amber-400',
  advanced: 'text-red-400',
};

const emptyForm = {
  title: '',
  description: '',
  category: 'mechanics' as Category,
  difficulty: 'beginner' as Difficulty,
  estimatedDuration: 30,
  maxScore: 100,
  objectives: '',
  equipment: '',
};

const ExperimentManager: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [filtered, setFiltered] = useState<Experiment[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | Category>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await experimentsAPI.getAll({ limit: 100 });
      setExperiments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let result = experiments;
    if (search) {
      result = result.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (catFilter !== 'all') {
      result = result.filter((e) => e.category === catFilter);
    }
    setFiltered(result);
  }, [search, catFilter, experiments]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        objectives: form.objectives.split('\n').filter(Boolean),
        equipment: form.equipment.split('\n').filter(Boolean),
      };
      await experimentsAPI.create(payload);
      setShowModal(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteId) return;
    setDeleteId(id);
    try {
      await experimentsAPI.delete(id);
      setExperiments((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen message="Loading experiments..." />;

  const categories: Category[] = ['mechanics', 'optics', 'thermodynamics', 'electromagnetism', 'waves', 'modern_physics'];

  return (
    <PageLayout
      title="Experiment Manager"
      subtitle={`${experiments.length} experiments · Create, edit, and manage AR physics experiments`}
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm px-4 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> New Experiment
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search experiments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCatFilter('all')}
            className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
              catFilter === 'all'
                ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${
                catFilter === c
                  ? `${categoryColors[c]}`
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              {c.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((exp) => (
          <div
            key={exp._id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 group hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="p-2 bg-slate-800 rounded-xl">
                <BookOpen size={18} className="text-slate-400" />
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors">
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(exp._id)}
                  disabled={deleteId === exp._id}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold leading-snug">{exp.title}</h3>
              <p className="text-slate-500 text-xs mt-1 line-clamp-2">{exp.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-auto">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium capitalize ${categoryColors[exp.category]}`}>
                {exp.category.replace('_', ' ')}
              </span>
              <span className={`text-xs font-medium capitalize ${difficultyColor[exp.difficulty]}`}>
                {exp.difficulty}
              </span>
              <span className="text-slate-600 text-xs ml-auto">{exp.estimatedDuration} min</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 text-sm">No experiments found.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">
              <h2 className="text-white font-semibold">New Experiment</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Newton's Second Law"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              {/* Description */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the experiment..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>
              {/* Category + Difficulty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-1.5 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-1.5 block">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              {/* Duration + Max Score */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-1.5 block">Duration (min)</label>
                  <input
                    type="number"
                    value={form.estimatedDuration}
                    onChange={(e) => setForm({ ...form, estimatedDuration: Number(e.target.value) })}
                    min={5}
                    max={180}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-1.5 block">Max Score</label>
                  <input
                    type="number"
                    value={form.maxScore}
                    onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                    min={10}
                    max={500}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
              {/* Objectives */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Objectives (one per line)</label>
                <textarea
                  value={form.objectives}
                  onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                  rows={3}
                  placeholder="Understand Newton's laws&#10;Calculate net force&#10;..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>
              {/* Equipment */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Equipment (one per line)</label>
                <textarea
                  value={form.equipment}
                  onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                  rows={2}
                  placeholder="AR Sensor&#10;Virtual Mass&#10;..."
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowModal(false); setForm(emptyForm); }}
                  className="flex-1 bg-slate-800 text-slate-400 hover:text-white py-2.5 rounded-xl text-sm font-medium border border-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim() || !form.description.trim()}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {saving ? 'Saving...' : 'Create Experiment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ExperimentManager;
