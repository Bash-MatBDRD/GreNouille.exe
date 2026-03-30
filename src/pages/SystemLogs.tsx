import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckSquare, Plus, Trash2, Check, Circle, Flag } from "lucide-react";

interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

const PRIORITY_CONFIG = {
  high: { label: "Urgent", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10", dot: "bg-red-400" },
  medium: { label: "Normal", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/10", dot: "bg-yellow-400" },
  low: { label: "Bas", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", dot: "bg-blue-400" },
};

const STORAGE_KEY = "nexus-todos";

function loadTodos(): Todo[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export default function Todos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  useEffect(() => { saveTodos(todos); }, [todos]);

  const filtered = todos
    .filter((t) => filter === "all" || (filter === "active" && !t.done) || (filter === "done" && t.done))
    .sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      if (!a.done && b.done) return -1;
      if (a.done && !b.done) return 1;
      if (!a.done && !b.done) return p[a.priority] - p[b.priority];
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const todo: Todo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      done: false,
      priority,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [todo, ...prev]);
    setText("");
  };

  const toggleDone = (id: string) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearDone = () => {
    setTodos((prev) => prev.filter((t) => !t.done));
  };

  const activeCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="flex-1 p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
            Tâches
          </h1>
          {doneCount > 0 && (
            <button onClick={clearDone} className="text-sm text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1">
              <Trash2 className="h-4 w-4" /> Supprimer terminées ({doneCount})
            </button>
          )}
        </div>
        <p className="text-gray-400">{activeCount} tâche{activeCount !== 1 ? "s" : ""} en attente</p>
      </motion.div>

      <form onSubmit={handleAdd} className="mb-6">
        <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md focus-within:border-emerald-500/50 focus-within:bg-white/8 transition-all">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ajouter une nouvelle tâche..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm px-2"
          />
          <div className="flex items-center gap-2">
            {(["high", "medium", "low"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`h-6 w-6 rounded-full transition-all ${PRIORITY_CONFIG[p].dot} ${priority === p ? "scale-125 ring-2 ring-white/40" : "opacity-40 hover:opacity-70"}`}
                title={PRIORITY_CONFIG[p].label}
              />
            ))}
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>

      <div className="flex items-center gap-2 mb-6">
        {(["all", "active", "done"] as const).map((f) => {
          const labels = { all: "Toutes", active: "À faire", done: "Terminées" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${filter === f ? "bg-emerald-600 border-emerald-500 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"}`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <CheckSquare className="h-14 w-14 text-gray-700 mb-3" />
            <p className="text-lg font-semibold text-gray-500">
              {filter === "done" ? "Aucune tâche terminée" : filter === "active" ? "Tout est fait !" : "Aucune tâche"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filtered.map((todo, i) => {
              const pc = PRIORITY_CONFIG[todo.priority];
              return (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group flex items-center gap-4 rounded-xl border p-4 transition-all ${todo.done ? "border-white/5 bg-white/2 opacity-60" : `${pc.border} ${pc.bg}`}`}
                >
                  <button onClick={() => toggleDone(todo.id)} className="shrink-0 transition-transform hover:scale-110">
                    {todo.done ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    ) : (
                      <Circle className={`h-6 w-6 ${pc.color}`} />
                    )}
                  </button>
                  <span className={`flex-1 text-sm font-medium ${todo.done ? "line-through text-gray-500" : "text-white"}`}>{todo.text}</span>
                  <div className="flex items-center gap-2">
                    <span className={`hidden md:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${pc.border} ${pc.color}`}>
                      <Flag className="h-3 w-3" />{pc.label}
                    </span>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
