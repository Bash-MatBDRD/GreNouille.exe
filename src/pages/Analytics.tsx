import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StickyNote, Plus, Trash2, Pin, PinOff } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
}

const NOTE_COLORS = [
  { bg: "bg-indigo-500/10", border: "border-indigo-500/30", dot: "bg-indigo-400", label: "Indigo" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/30", dot: "bg-emerald-400", label: "Vert" },
  { bg: "bg-yellow-500/10", border: "border-yellow-500/30", dot: "bg-yellow-400", label: "Jaune" },
  { bg: "bg-pink-500/10", border: "border-pink-500/30", dot: "bg-pink-400", label: "Rose" },
  { bg: "bg-orange-500/10", border: "border-orange-500/30", dot: "bg-orange-400", label: "Orange" },
  { bg: "bg-cyan-500/10", border: "border-cyan-500/30", dot: "bg-cyan-400", label: "Cyan" },
];

const STORAGE_KEY = "nexus-notes";

function loadNotes(): Note[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { saveNotes(notes); }, [notes]);

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const openNew = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setColorIdx(0);
    setShowForm(true);
  };

  const openEdit = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setColorIdx(NOTE_COLORS.findIndex((c) => c.bg === note.color) ?? 0);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    if (editingId) {
      setNotes((prev) =>
        prev.map((n) => n.id === editingId ? { ...n, title: title.trim(), content: content.trim(), color: NOTE_COLORS[colorIdx].bg } : n)
      );
    } else {
      const note: Note = {
        id: crypto.randomUUID(),
        title: title.trim(),
        content: content.trim(),
        color: NOTE_COLORS[colorIdx].bg,
        pinned: false,
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [note, ...prev]);
    }
    setShowForm(false);
    setTitle("");
    setContent("");
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const togglePin = (id: string) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  return (
    <div className="flex-1 p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <StickyNote className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]" />
            Notes
          </h1>
          <p className="mt-1 text-gray-400">Vos mémos personnels</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02] hover:bg-indigo-500 active:scale-95"
        >
          <Plus className="h-5 w-5" /> Nouvelle note
        </button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0f0f1a] p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">{editingId ? "Modifier la note" : "Nouvelle note"}</h2>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre (optionnel)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none mb-4 focus:border-indigo-500 focus:bg-white/8 transition-all"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrivez votre note ici..."
                rows={5}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 outline-none mb-6 focus:border-indigo-500 focus:bg-white/8 transition-all"
              />
              <div className="mb-6 flex items-center gap-2">
                <span className="text-sm text-gray-400 mr-2">Couleur :</span>
                {NOTE_COLORS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setColorIdx(i)}
                    className={`h-7 w-7 rounded-full transition-transform ${c.dot} ${colorIdx === i ? "scale-125 ring-2 ring-white/60" : "opacity-60 hover:opacity-100"}`}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-500 transition-colors">
                  {editingId ? "Sauvegarder" : "Créer"}
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 rounded-xl bg-white/10 py-3 font-medium text-white hover:bg-white/20 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sorted.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <StickyNote className="h-16 w-16 text-gray-700 mb-4" />
          <p className="text-xl font-semibold text-gray-500">Aucune note</p>
          <p className="text-sm text-gray-600 mt-1">Cliquez sur "Nouvelle note" pour commencer</p>
        </motion.div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {sorted.map((note, i) => {
            const c = NOTE_COLORS.find((x) => x.bg === note.color) || NOTE_COLORS[0];
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`break-inside-avoid rounded-2xl border ${c.border} ${c.bg} p-5 cursor-pointer group transition-all hover:scale-[1.01] hover:shadow-lg`}
                onClick={() => openEdit(note)}
              >
                <div className="flex items-start justify-between mb-3">
                  {note.title && <h3 className="font-semibold text-white text-sm leading-tight pr-2">{note.title}</h3>}
                  {!note.title && <span />}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => togglePin(note.id)} className="rounded-lg p-1.5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                      {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </button>
                    <button onClick={() => handleDelete(note.id)} className="rounded-lg p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {note.content && <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-6">{note.content}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
                  {note.pinned && <Pin className="h-3 w-3 text-gray-500" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
