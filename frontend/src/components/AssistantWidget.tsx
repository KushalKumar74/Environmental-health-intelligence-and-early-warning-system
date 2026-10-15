import { useState } from 'react';
import { Bot, Send, Sparkles, X, AlertCircle, Paperclip, FileText, Leaf, Wand2, BookOpen, Code, Lightbulb, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { queryAssistantApi } from '@/services/api';
import { toast } from 'sonner';

interface AssistantWidgetProps {
  locationName: string;
  lat: number;
  lon: number;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  badge?: string;
  category?: string;
  disclaimer?: string;
}

export default function AssistantWidget({ locationName, lat, lon }: AssistantWidgetProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachmentText, setAttachmentText] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: `Hello! I am EVA, your Environmental & General AI Assistant. Ask me anything about AQI & weather, or ask for help writing emails, summarizing text, explaining topics, studying, or coding!`,
      badge: '✨ General + Environmental AI',
    },
  ]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input.trim();
    if (!textToSend || loading) return;

    if (!customText) setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setLoading(true);

    try {
      const historyForApi = messages.map((m) => ({ sender: m.sender, text: m.text }));
      const res = await queryAssistantApi(textToSend, locationName, lat, lon, historyForApi, attachmentText || undefined);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: res.answer,
          badge: res.badge,
          category: res.category,
          disclaimer: res.disclaimer,
        },
      ]);
      setAttachmentText('');
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I encountered a brief issue processing your request. Please try again shortly.',
          badge: '✨ AI Assistant',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (promptText: string) => {
    handleSend(promptText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full h-14 w-14 shadow-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:scale-105 text-white flex items-center justify-center transition-all group"
        >
          <Bot className="h-7 w-7 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
        </Button>
      ) : (
        <Card className="w-80 sm:w-[420px] h-[540px] shadow-2xl flex flex-col border border-sky-200 dark:border-sky-900 bg-background/95 backdrop-blur-md rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur">
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide">EVA Assistant</h3>
                <p className="text-[11px] text-sky-100 flex items-center gap-1">
                  <span>General AI</span> • <span>Environmental Intelligence</span>
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-white hover:bg-white/20 h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages & Quick Actions */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {m.badge && (
                  <span className="text-[10px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
                    {m.badge.includes('Environmental') ? (
                      <Leaf className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-sky-500" />
                    )}
                    {m.badge}
                  </span>
                )}

                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-none shadow-sm'
                      : 'bg-secondary/70 text-foreground rounded-bl-none border border-border/80 shadow-xs'
                  }`}
                >
                  {m.text}
                </div>

                {m.disclaimer && (
                  <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 max-w-[90%]">
                    <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                    {m.disclaimer}
                  </span>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs italic p-2">
                <Bot className="h-4 w-4 animate-spin text-sky-500" /> EVA is processing...
              </div>
            )}

            {/* Quick Action Suggestion Pills (Shown when conversation is short) */}
            {messages.length <= 2 && !loading && (
              <div className="pt-2 space-y-2 border-t mt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">What would you like to do?</p>
                
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                    <Leaf className="h-3 w-3" /> ENVIRONMENTAL
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => handleQuickAction(`What is the AQI in ${locationName} right now?`)} className="px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary text-[11px] font-medium transition-colors text-left">
                      Check my air quality
                    </button>
                    <button onClick={() => handleQuickAction(`Explain my environmental exposure risk in ${locationName}`)} className="px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary text-[11px] font-medium transition-colors text-left">
                      Explain my risk
                    </button>
                    <button onClick={() => handleQuickAction(`Check tomorrow's forecast for ${locationName}`)} className="px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary text-[11px] font-medium transition-colors text-left">
                      Tomorrow's forecast
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-sky-600 flex items-center gap-1">
                    <Wand2 className="h-3 w-3" /> AI ASSISTANT
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => handleQuickAction('Write a professional email asking my professor for a project extension.')} className="px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary text-[11px] font-medium transition-colors text-left flex items-center gap-1">
                      <PenTool className="h-3 w-3 text-sky-500" /> Write an email
                    </button>
                    <button onClick={() => handleQuickAction('Explain machine learning in simple terms for a beginner.')} className="px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary text-[11px] font-medium transition-colors text-left flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-indigo-500" /> Explain a topic
                    </button>
                    <button onClick={() => handleQuickAction('Why am I getting undefined in JavaScript and how do I fix it?')} className="px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary text-[11px] font-medium transition-colors text-left flex items-center gap-1">
                      <Code className="h-3 w-3 text-purple-500" /> Debug JS code
                    </button>
                    <button onClick={() => handleQuickAction('Teach me DBMS normalization with examples.')} className="px-2.5 py-1 rounded-lg border bg-background hover:bg-secondary text-[11px] font-medium transition-colors text-left flex items-center gap-1">
                      <Lightbulb className="h-3 w-3 text-amber-500" /> Study help
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attachment Modal Drawer if open */}
          {showAttachModal && (
            <div className="p-3 bg-secondary/80 border-t space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1 text-sky-600"><FileText className="h-3.5 w-3.5" /> Attach Document / Notes Text</span>
                <button onClick={() => setShowAttachModal(false)} className="text-muted-foreground hover:text-foreground">Close</button>
              </div>
              <textarea
                value={attachmentText}
                onChange={(e) => setAttachmentText(e.target.value)}
                placeholder="Paste document text, notes, or code to summarize or analyze..."
                className="w-full h-16 text-xs p-2 rounded-xl border bg-background resize-none"
              />
              <p className="text-[10px] text-muted-foreground">Attachment text will be sent with your next prompt.</p>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 border-t bg-card flex gap-2 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAttachModal(!showAttachModal)}
              className={`h-9 w-9 rounded-xl flex-shrink-0 ${attachmentText ? 'text-sky-600 bg-sky-500/10' : 'text-muted-foreground'}`}
              title="Attach text or document"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask EVA anything..."
              className="text-xs h-9 rounded-xl flex-1"
            />

            <Button onClick={() => handleSend()} size="icon" className="h-9 w-9 bg-sky-600 hover:bg-sky-700 text-white rounded-xl flex-shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

