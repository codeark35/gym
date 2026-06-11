import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import AppShell from '../../../components/layout/AppShell';
import api from '../../../api/axios';
import {
  Bot, Send, Sparkles, TrendingUp, Activity, Heart,
  MessageSquare, Plus, Trash2, ArrowLeft, User,
} from 'lucide-react';

type AnalysisType = 'GENERAL' | 'PROGRESS' | 'VOLUME' | 'RECOVERY';

const ANALYSIS_OPTIONS: { type: AnalysisType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'GENERAL', label: 'Análisis general', icon: <Sparkles size={16} />, color: '#f59e0b' },
  { type: 'PROGRESS', label: 'Progreso', icon: <TrendingUp size={16} />, color: '#4338ca' },
  { type: 'VOLUME', label: 'Volumen', icon: <Activity size={16} />, color: '#2d6a4f' },
  { type: 'RECOVERY', label: 'Recuperación', icon: <Heart size={16} />, color: '#ec4899' },
];

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

type Action =
  | { type: 'NEW_CHAT' }
  | { type: 'SELECT_CHAT'; id: string }
  | { type: 'DELETE_CHAT'; id: string }
  | { type: 'ADD_MESSAGE'; id: string; message: Message }
  | { type: 'SET_TITLE'; id: string; title: string };

let nextId = 1;
function createId() {
  return `chat-${Date.now()}-${nextId++}`;
}

function chatReducer(state: { conversations: Conversation[]; activeId: string | null }, action: Action) {
  switch (action.type) {
    case 'NEW_CHAT': {
      const id = createId();
      return {
        conversations: [{ id, title: 'Nuevo chat', messages: [] }, ...state.conversations],
        activeId: id,
      };
    }
    case 'SELECT_CHAT':
      return { ...state, activeId: action.id };
    case 'DELETE_CHAT': {
      const filtered = state.conversations.filter((c) => c.id !== action.id);
      return {
        conversations: filtered,
        activeId: state.activeId === action.id ? (filtered[0]?.id ?? null) : state.activeId,
      };
    }
    case 'ADD_MESSAGE': {
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id
            ? { ...c, messages: [...c.messages, action.message] }
            : c,
        ),
      };
    }
    case 'SET_TITLE': {
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, title: action.title } : c,
        ),
      };
    }
    default:
      return state;
  }
}

const AI_CHATS_KEY = 'gymtracker_ai_chats';

function loadState(): { conversations: Conversation[]; activeId: string | null } {
  try {
    const raw = localStorage.getItem(AI_CHATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return { conversations: [], activeId: null };
}

function usePersistedReducer() {
  const [state, setState] = useState<{ conversations: Conversation[]; activeId: string | null }>(loadState);

  const dispatch = useCallback((action: Action) => {
    setState((prev) => {
      const next = chatReducer(prev, action);
      try { localStorage.setItem(AI_CHATS_KEY, JSON.stringify(next)); } catch { /* quota full */ }
      return next;
    });
  }, []);

  return [state, dispatch] as const;
}

export default function AIPage() {
  const [state, dispatch] = usePersistedReducer();
  const [chatInput, setChatInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = state.conversations.find((c) => c.id === state.activeId) ?? null;

  const sendToAI = useMutation({
    mutationFn: async ({ message, type }: { message?: string; type?: AnalysisType }) => {
      if (type) {
        const res = await api.post<{ data: string }>('/ai/analyze', { type });
        return (res.data.data ?? res.data) as string;
      }
      const res = await api.post<{ data: string }>('/ai/chat', { message });
      return (res.data.data ?? res.data) as string;
    },
  });

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = (text?: string) => {
    const message = (text ?? chatInput).trim();
    if (!message || !activeConv) return;

    // If first message, use its content as title
    if (activeConv.messages.length === 0) {
      dispatch({ type: 'SET_TITLE', id: activeConv.id, title: message.slice(0, 40) + (message.length > 40 ? '...' : '') });
    }

    dispatch({ type: 'ADD_MESSAGE', id: activeConv.id, message: { role: 'user', content: message } });
    setChatInput('');

    sendToAI.mutate(
      { message },
      {
        onSuccess: (data) => {
          dispatch({ type: 'ADD_MESSAGE', id: activeConv.id!, message: { role: 'ai', content: data as string } });
        },
        onError: () => {
          dispatch({ type: 'ADD_MESSAGE', id: activeConv.id!, message: { role: 'ai', content: 'Lo siento, hubo un error. Intentá de nuevo.' } });
        },
      },
    );
  };

  const handleQuickAnalysis = (type: AnalysisType) => {
    const msg = ANALYSIS_OPTIONS.find((o) => o.type === type)?.label ?? 'Análisis';

    if (state.activeId) {
      dispatch({ type: 'ADD_MESSAGE', id: state.activeId, message: { role: 'user', content: msg } });
      sendToAI.mutate(
        { type },
        {
          onSuccess: (data) => {
            dispatch({ type: 'ADD_MESSAGE', id: state.activeId!, message: { role: 'ai', content: data as string } });
          },
        },
      );
      return;
    }

    const newId = createId();
    dispatch({ type: 'NEW_CHAT' });
    setTimeout(() => {
      dispatch({ type: 'ADD_MESSAGE', id: newId, message: { role: 'user', content: msg } });
      sendToAI.mutate(
        { type },
        {
          onSuccess: (data) => {
            dispatch({ type: 'ADD_MESSAGE', id: newId, message: { role: 'ai', content: data as string } });
          },
        },
      );
    }, 0);
  };

  const startNewChat = () => {
    dispatch({ type: 'NEW_CHAT' });
    setShowSidebar(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isLoading = sendToAI.isPending;

  return (
    <AppShell>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #4338ca, #1e3a5f)', borderRadius: 2 }} />
          <h5 className="fw-bold text-white mb-0">Chat IA</h5>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto">
          <button
            className="btn btn-sm d-flex align-items-center gap-1 flex-fill flex-sm-none"
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              fontSize: '0.75rem',
            }}
          >
            <MessageSquare size={14} />
            Chats
          </button>
          <button
            className="btn btn-sm d-flex align-items-center gap-1 flex-fill flex-sm-none"
            onClick={startNewChat}
            style={{
              borderRadius: 10,
              background: 'rgba(67, 56, 202, 0.15)',
              border: '1px solid rgba(67, 56, 202, 0.3)',
              color: '#818cf8',
              fontSize: '0.75rem',
            }}
          >
            <Plus size={14} />
            Nuevo
          </button>
        </div>
      </div>

      {/* Sidebar / Chat list overlay (mobile) */}
      {showSidebar && (
        <div className="mb-3">
          <div
            className="card"
            style={{
              border: 'none',
              borderRadius: 16,
              background: '#1e293b',
              maxHeight: 280,
              overflow: 'auto',
            }}
          >
            <div className="card-body p-2">
              <div className="d-flex align-items-center justify-content-between px-2 py-1 mb-1">
                <span className="small fw-semibold text-white-50">Conversaciones</span>
                <button className="btn btn-sm p-0 text-white-50" onClick={() => setShowSidebar(false)}>
                  <ArrowLeft size={14} />
                </button>
              </div>
              {state.conversations.length === 0 ? (
                <p className="small text-white-50 text-center py-3 mb-0">No hay conversaciones aún</p>
              ) : (
                state.conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`d-flex align-items-center justify-content-between px-2 py-2 rounded-3 mb-1 ${conv.id === state.activeId ? '' : ''}`}
                    style={{
                      cursor: 'pointer',
                      background: conv.id === state.activeId ? 'rgba(67, 56, 202, 0.15)' : 'transparent',
                      border: conv.id === state.activeId ? '1px solid rgba(67, 56, 202, 0.3)' : '1px solid transparent',
                      borderRadius: 10,
                    }}
                    onClick={() => {
                      dispatch({ type: 'SELECT_CHAT', id: conv.id });
                      setShowSidebar(false);
                    }}
                  >
                    <div className="min-w-0 flex-grow-1 me-2">
                      <div className="small fw-medium text-truncate" style={{ color: conv.id === state.activeId ? '#818cf8' : '#cbd5e1' }}>
                        {conv.title}
                      </div>
                      <div className="small text-white-50" style={{ fontSize: '0.6875rem' }}>
                        {conv.messages.length} mensajes
                      </div>
                    </div>
                    <button
                      className="btn btn-sm p-1 d-flex align-items-center justify-content-center flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'DELETE_CHAT', id: conv.id });
                      }}
                      title="Eliminar"
                      style={{
                        width: 28, height: 28,
                        borderRadius: 8,
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick analysis chips */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {ANALYSIS_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            className="btn btn-sm d-flex align-items-center gap-1"
            onClick={() => handleQuickAnalysis(opt.type)}
            disabled={isLoading}
            style={{
              borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${opt.color}30`,
              color: '#cbd5e1',
              fontSize: '0.75rem',
              padding: '0.375rem 0.75rem',
            }}
          >
            <span style={{ color: opt.color }}>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div
        className="card mb-3"
        style={{
          border: 'none',
          borderRadius: 16,
          background: '#1e293b',
          minHeight: activeConv ? 320 : 120,
          maxHeight: activeConv ? 'calc(100vh - 260px)' : undefined,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!activeConv ? (
          <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-5">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: 64, height: 64, background: 'rgba(67, 56, 202, 0.15)', border: '1px solid rgba(67, 56, 202, 0.3)' }}
            >
              <Bot size={32} style={{ color: '#818cf8' }} />
            </div>
            <p className="text-white fw-semibold mb-1">Gemini Coach</p>
            <p className="text-white-50 small mb-3">Seleccioná un análisis rápido o iniciá un chat</p>
            <button
              className="btn btn-sm d-flex align-items-center gap-1"
              onClick={startNewChat}
              style={{
                borderRadius: 10,
                background: 'rgba(67, 56, 202, 0.15)',
                border: '1px solid rgba(67, 56, 202, 0.3)',
                color: '#818cf8',
                fontSize: '0.75rem',
              }}
            >
              <Plus size={14} />
              Nuevo chat
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="card-body p-3" style={{ flexGrow: 1, overflow: 'auto', minHeight: 200, maxHeight: activeConv ? 'calc(100vh - 340px)' : 200 }}>
              {/* Chat title */}
                <span className="small fw-medium text-white-50">{activeConv.title}</span>
              </div>

              {activeConv.messages.length === 0 ? (
                <p className="text-white-50 small text-center py-4">Escribí tu primer mensaje</p>
              ) : (
                activeConv.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 me-2"
                        style={{ width: 28, height: 28, background: 'rgba(67, 56, 202, 0.2)' }}
                      >
                        <Bot size={14} style={{ color: '#818cf8' }} />
                      </div>
                    )}
                    <div
                      className="px-3 py-2"
                      style={{
                        maxWidth: '80%',
                        borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, #4338ca, #1e3a5f)'
                          : 'rgba(255,255,255,0.06)',
                        color: msg.role === 'user' ? '#fff' : '#cbd5e1',
                        fontSize: '0.875rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 ms-2"
                        style={{ width: 28, height: 28, background: 'rgba(245, 158, 11, 0.2)' }}
                      >
                        <User size={14} style={{ color: '#fbbf24' }} />
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="d-flex mb-3 justify-content-start">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 me-2"
                    style={{ width: 28, height: 28, background: 'rgba(67, 56, 202, 0.2)' }}
                  >
                    <Bot size={14} style={{ color: '#818cf8' }} />
                  </div>
                  <div className="px-3 py-2" style={{ borderRadius: '4px 16px 16px 16px', background: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}>
                    <div className="d-flex gap-1">
                      <div className="spinner-grow spinner-grow-sm" style={{ animationDelay: '0s', color: '#818cf8' }} />
                      <div className="spinner-grow spinner-grow-sm" style={{ animationDelay: '0.15s', color: '#818cf8' }} />
                      <div className="spinner-grow spinner-grow-sm" style={{ animationDelay: '0.3s', color: '#818cf8' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="card-footer p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderRadius: '0 0 16px 16px' }}>
              <div className="d-flex gap-2 flex-column flex-sm-row">
                <input
                  type="text"
                  className="form-control bg-transparent border-0 text-white flex-fill"
                  placeholder="Escribí un mensaje..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  style={{ fontSize: '0.875rem', boxShadow: 'none' }}
                />
                <button
                  className="btn btn-sm d-flex align-items-center justify-content-center flex-shrink-0"
                  onClick={() => handleSend()}
                  disabled={isLoading || !chatInput.trim()}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: chatInput.trim() ? '#4338ca' : 'rgba(255,255,255,0.06)',
                    border: 'none',
                    color: chatInput.trim() ? '#fff' : '#64748b',
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
