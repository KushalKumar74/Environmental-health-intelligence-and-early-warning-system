import { useState, useRef, useEffect } from 'react';
import { useEva } from '@/context/EvaContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  Send,
  X,
  Trash2,
  Paperclip,
  Bot,
  User,
  Info,
  MapPin,
  Home,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

import EvaBreadcrumbs from './EvaBreadcrumbs';
import EvaMenuGrid from './EvaMenuGrid';
import EvaTravelCard from './EvaTravelCard';
import EvaItineraryCard from './EvaItineraryCard';
import EvaHospitalCard from './EvaHospitalCard';
import EvaPlaceCard from './EvaPlaceCard';
import EvaDataCard from './EvaDataCard';
import EvaExposureCard from './EvaExposureCard';
import EvaAlertCard from './EvaAlertCard';

function FormattedMessageText({ text }: { text: string }) {
  if (!text) return null;

  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n');
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
              const cleanLine = isBullet ? line.trim().substring(2) : line;

              return (
                <p key={lIdx} className={isBullet ? 'pl-3 relative border-l-2 border-primary/40' : ''}>
                  {cleanLine}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function EvaPanel() {
  const {
    open,
    setOpen,
    messages,
    loading,
    attachmentText,
    setAttachmentText,
    pageContext,
    sendMessage,
    sendMenuAction,
    navigateMainMenu,
    navigateBack,
    clearChat,
    promptInputMessage,
  } = useEva();

  const [inputVal, setInputVal] = useState('');
  const [showAttachmentDrawer, setShowAttachmentDrawer] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [open, messages, loading]);

  if (!open) return null;

  const handleSend = () => {
    if (!inputVal.trim() || loading) return;
    const txt = inputVal;
    setInputVal('');
    setShowAttachmentDrawer(false);
    sendMessage(txt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 w-[430px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-6.5rem)] z-50 rounded-2xl border border-border shadow-2xl bg-card flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* Drawer Header */}
      <div className="p-3 border-b border-border bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-indigo-500/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-foreground">🌿 EVA</h3>
              <span className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                Service Chatbot
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 text-emerald-500" /> Module: {pageContext}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateMainMenu}
            title="Return to Main Menu"
            className="h-8 w-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            title="Reset Conversation"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Interactive Breadcrumbs Trail */}
      <EvaBreadcrumbs />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {msg.sender === 'bot' ? (
                <>
                  <Bot className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-muted-foreground">EVA</span>
                  {msg.badge && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-primary/5 text-primary border-primary/20">
                      {msg.badge}
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold text-muted-foreground">You</span>
                  <User className="h-3.5 w-3.5 text-indigo-500" />
                </>
              )}
            </div>

            <div
              className={`max-w-[92%] p-3 rounded-2xl shadow-xs text-xs ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-indigo-600 text-white rounded-tr-none'
                  : 'bg-muted/50 border border-border/70 text-foreground rounded-tl-none'
              }`}
            >
              <FormattedMessageText text={msg.text} />

              {/* Render Sub-menu Options Grid if present */}
              {msg.menuOptions && msg.menuOptions.length > 0 && (
                <EvaMenuGrid options={msg.menuOptions} />
              )}

              {/* Render Structured Result Cards */}
              {msg.responseType === 'TRAVEL_CARD' && msg.structuredData && (
                <EvaTravelCard data={msg.structuredData} />
              )}

              {msg.responseType === 'ITINERARY' && msg.structuredData && (
                <EvaItineraryCard data={msg.structuredData} />
              )}

              {msg.responseType === 'HOSPITAL_CARD' && msg.structuredData && (
                <EvaHospitalCard data={msg.structuredData} />
              )}

              {msg.responseType === 'PLACE_CARD' && msg.structuredData && (
                <EvaPlaceCard data={msg.structuredData} />
              )}

              {(msg.responseType === 'WEATHER_CARD' || msg.responseType === 'AQI_CARD') && msg.structuredData && (
                <EvaDataCard data={msg.structuredData} />
              )}

              {msg.responseType === 'EXPOSURE_CARD' && msg.structuredData && (
                <EvaExposureCard data={msg.structuredData} />
              )}

              {msg.responseType === 'ALERT_CARD' && msg.structuredData && (
                <EvaAlertCard data={msg.structuredData} />
              )}

              {msg.disclaimer && (
                <div className="mt-2 pt-2 border-t border-border/40 text-[9px] text-muted-foreground flex items-start gap-1">
                  <Info className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>{msg.disclaimer}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center animate-spin">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <span className="animate-pulse font-medium">EVA is processing...</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Prompt Alert Banner if an action prompts custom entry */}
      {promptInputMessage && (
        <div className="px-3 py-1.5 bg-amber-500/15 border-t border-amber-500/30 text-xs font-semibold text-amber-800 dark:text-amber-200 flex items-center justify-between">
          <span>{promptInputMessage}</span>
          <Button variant="ghost" size="sm" onClick={() => handleSend()} className="h-5 px-1 text-[10px]">
            Dismiss
          </Button>
        </div>
      )}

      {/* Attachment Text Drawer */}
      {showAttachmentDrawer && (
        <div className="p-3 border-t border-border bg-muted/40 space-y-2 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span>Context / Attachment Text (Notes, code, report):</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAttachmentDrawer(false)}
              className="h-5 px-1 text-[10px]"
            >
              Done
            </Button>
          </div>
          <Textarea
            value={attachmentText}
            onChange={(e) => setAttachmentText(e.target.value)}
            placeholder="Paste raw text, articles, health reports, or code here for EVA to analyze..."
            rows={3}
            className="text-xs resize-none bg-background"
          />
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 border-t border-border bg-card flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAttachmentDrawer(!showAttachmentDrawer)}
          title="Attach text or document context"
          className={`h-9 w-9 flex-shrink-0 ${attachmentText ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted-foreground'}`}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask EVA something..."
          className="text-xs h-9 bg-muted/40"
          disabled={loading}
        />

        <Button
          onClick={handleSend}
          disabled={!inputVal.trim() || loading}
          size="icon"
          className="h-9 w-9 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
