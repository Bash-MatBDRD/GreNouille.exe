import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, Plus, Trash2, ExternalLink, Tag, Search, Globe } from "lucide-react";

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  tag: string;
  favicon: string;
  createdAt: string;
}

const TAG_COLORS: Record<string, string> = {
  "Travail": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Dev": "bg-violet-500/20 text-violet-400 border-violet-500/30",
  "Design": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Outils": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Lecture": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Autre": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const DEFAULT_TAGS = Object.keys(TAG_COLORS);
const STORAGE_KEY = "nexus-bookmarks";

function loadBookmarks(): BookmarkItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveBookmarks(items: BookmarkItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getFavicon(url: string) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch { return ""; }
}

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(loadBookmarks);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("Tous");
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("Autre");

  useEffect(() => { saveBookmarks(bookmarks); }, [bookmarks]);

  const allTags = ["Tous", ...DEFAULT_TAGS];

  const filtered = bookmarks
    .filter((b) => activeTag === "Tous" || b.tag === activeTag)
    .filter((b) =>
      search === "" ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.url.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAdd = () => {
    if (!url.trim()) return;
    let finalUrl = url.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) finalUrl = "https://" + finalUrl;
    let finalTitle = title.trim();
    if (!finalTitle) {
      try { finalTitle = new URL(finalUrl).hostname; } catch { finalTitle = finalUrl; }
    }
    const item: BookmarkItem = {
      id: crypto.randomUUID(),
      title: finalTitle,
      url: finalUrl,
      description: description.trim(),
      tag,
      favicon: getFavicon(finalUrl),
      createdAt: new Date().toISOString(),
    };
    setBookmarks((prev) => [item, ...prev]);
    setUrl("");
    setTitle("");
    setDescription("");
    setTag("Autre");
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="flex-1 p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bookmark className="h-8 w-8 text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.7)]" />
              Favoris
            </h1>
            <p className="mt-1 text-gray-400">Gérez vos liens et ressources importants</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] hover:bg-blue-500 active:scale-95"
          >
            <Plus className="h-5 w-5" /> Ajouter
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:bg-white/8 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${activeTag === t ? "bg-blue-600 border-blue-500 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Ajouter un favori</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">URL *</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://exemple.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Titre (optionnel)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Mon site favori"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Description (optionnel)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Courte description..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Catégorie</label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_TAGS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTag(t)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${tag === t ? "bg-blue-600 border-blue-500 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:text-white"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={handleAdd} className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-500 transition-colors">
                  Ajouter
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 rounded-xl bg-white/10 py-3 font-medium text-white hover:bg-white/20 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
          <Globe className="h-16 w-16 text-gray-700 mb-4" />
          <p className="text-xl font-semibold text-gray-500">{search || activeTag !== "Tous" ? "Aucun résultat" : "Aucun favori"}</p>
          <p className="text-sm text-gray-600 mt-1">
            {search || activeTag !== "Tous" ? "Essayez d'autres filtres" : "Cliquez sur \"Ajouter\" pour commencer"}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b, i) => {
            const tagStyle = TAG_COLORS[b.tag] || TAG_COLORS["Autre"];
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/8 hover:shadow-[0_0_25px_rgba(37,99,235,0.1)] hover:border-blue-500/20"
              >
                <div className="flex items-start gap-3 mb-3">
                  {b.favicon ? (
                    <img src={b.favicon} alt="" className="h-6 w-6 rounded mt-0.5 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <Globe className="h-6 w-6 text-gray-500 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{b.title}</h3>
                    <p className="text-xs text-gray-500 truncate">{b.url}</p>
                  </div>
                </div>
                {b.description && <p className="text-sm text-gray-400 mb-3 line-clamp-2">{b.description}</p>}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${tagStyle}`}>
                    <Tag className="h-3 w-3" />{b.tag}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg p-1.5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button onClick={() => handleDelete(b.id)} className="rounded-lg p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
