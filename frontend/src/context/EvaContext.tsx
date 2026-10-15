import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocation as useRouterLocation } from 'react-router-dom';
import { queryAssistantApi } from '@/services/api';
import { toast } from 'sonner';

export interface EvaChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  badge?: string;
  category?: string;
  responseType?: 'MENU' | 'TEXT' | 'TRAVEL_CARD' | 'ITINERARY' | 'HOSPITAL_CARD' | 'PLACE_CARD' | 'WEATHER_CARD' | 'AQI_CARD' | 'EXPOSURE_CARD' | 'ALERT_CARD';
  structuredData?: any;
  menuOptions?: any[];
  quickActions?: any[];
  breadcrumbs?: string[];
  disclaimer?: string;
}

interface EvaContextType {
  open: boolean;
  setOpen: (val: boolean) => void;
  messages: EvaChatMessage[];
  loading: boolean;
  attachmentText: string;
  setAttachmentText: (text: string) => void;
  pageContext: string;
  userCoords: { lat: number; lon: number; name: string };
  currentBreadcrumbs: string[];
  currentMenuOptions: any[];
  quickActions: any[];
  promptInputMessage: string | null;
  requestUserGeolocation: () => Promise<{ lat: number; lon: number } | null>;
  sendMessage: (customText?: string) => Promise<void>;
  sendMenuAction: (actionId: string, params?: any) => Promise<void>;
  navigateMainMenu: () => Promise<void>;
  navigateBack: () => Promise<void>;
  clearChat: () => void;
}

const EvaContext = createContext<EvaContextType | null>(null);

export function EvaProvider({ children }: { children: ReactNode }) {
  const routerLocation = useRouterLocation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachmentText, setAttachmentText] = useState('');

  const [currentBreadcrumbs, setCurrentBreadcrumbs] = useState<string[]>(['EVA']);
  const [currentMenuOptions, setCurrentMenuOptions] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [promptInputMessage, setPromptInputMessage] = useState<string | null>(null);
  const [menuHistoryStack, setMenuHistoryStack] = useState<any[]>([]);

  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number; name: string }>({
    lat: 12.9716,
    lon: 77.5946,
    name: 'Bangalore, India',
  });

  const [pageContext, setPageContext] = useState<string>('Dashboard');

  useEffect(() => {
    const path = routerLocation.pathname;
    if (path === '/') setPageContext('Dashboard');
    else if (path.includes('gis-map')) setPageContext('GIS Spatial Map');
    else if (path.includes('facility')) setPageContext('Facilities');
    else if (path.includes('history')) setPageContext('Exposure History');
    else if (path.includes('alerts')) setPageContext('Events & Alerts');
    else if (path.includes('predict')) setPageContext('Health Predictor');
    else if (path.includes('analytics')) setPageContext('Analytics');
    else setPageContext('Application Context');
  }, [routerLocation.pathname]);

  const [messages, setMessages] = useState<EvaChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `Hi! 👋 What would you like to do today?`,
      badge: '🌿 EVA Service',
    },
  ]);

  // Load Main Menu on init
  useEffect(() => {
    navigateMainMenu();
  }, [pageContext]);

  const requestUserGeolocation = async (): Promise<{ lat: number; lon: number } | null> => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserCoords({ lat: coords.lat, lon: coords.lon, name: 'Current Device Location' });
          toast.success('Location permission granted! Searching near you.');
          resolve(coords);
        },
        () => {
          toast.warning('Location permission denied. Searching near default location.');
          resolve(null);
        }
      );
    });
  };

  const executeEvaRequest = async (actionId?: string, text?: string, vacationParams?: any) => {
    setLoading(true);
    try {
      let activeLat = userCoords.lat;
      let activeLon = userCoords.lon;
      if (text && text.toLowerCase().includes('near me')) {
        const fresh = await requestUserGeolocation();
        if (fresh) {
          activeLat = fresh.lat;
          activeLon = fresh.lon;
        }
      }

      const historyForApi = messages.map((m) => ({ sender: m.sender, text: m.text }));
      const res = await queryAssistantApi(
        text,
        userCoords.name,
        activeLat,
        activeLon,
        historyForApi,
        attachmentText || undefined,
        actionId,
        pageContext,
        vacationParams
      );

      if (res.breadcrumbs) setCurrentBreadcrumbs(res.breadcrumbs);
      if (res.menuOptions) setCurrentMenuOptions(res.menuOptions);
      if (res.quickActions) setQuickActions(res.quickActions);

      const botMsgObj: EvaChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: res.answer || 'Select an option below:',
        badge: res.badge || '🌿 EVA',
        responseType: res.responseType as any,
        structuredData: res.structuredData,
        menuOptions: res.menuOptions,
        quickActions: res.quickActions,
        breadcrumbs: res.breadcrumbs,
        disclaimer: res.disclaimer,
      };

      setMessages((prev) => [...prev, botMsgObj]);
      setAttachmentText('');
      setPromptInputMessage(null);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: 'Sorry, I encountered an issue processing your request. Please try again.',
          badge: '🌿 EVA',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const navigateMainMenu = async () => {
    setMenuHistoryStack([]);
    await executeEvaRequest('MAIN_MENU');
  };

  const navigateBack = async () => {
    if (menuHistoryStack.length > 0) {
      const prevAction = menuHistoryStack[menuHistoryStack.length - 1];
      setMenuHistoryStack((prev) => prev.slice(0, -1));
      await executeEvaRequest(prevAction.actionId, undefined, prevAction.params);
    } else {
      await navigateMainMenu();
    }
  };

  const sendMenuAction = async (actionId: string, params?: any) => {
    // Check if action prompts input
    if (params?.action === 'INPUT_PROMPT') {
      setPromptInputMessage(params.promptMessage || 'Type your entry:');
      return;
    }

    if (params?.action === 'LOCATION_PROMPT' && params?.targetAction) {
      actionId = `loc_prompt_${params.targetAction}`;
    }

    setMenuHistoryStack((prev) => [...prev, { actionId, params }]);

    // Push user selection message
    const optionLabel = params?.label || actionId;
    const userMsgObj: EvaChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: optionLabel,
    };
    setMessages((prev) => [...prev, userMsgObj]);

    await executeEvaRequest(actionId, undefined, params);
  };

  const sendMessage = async (customText?: string) => {
    const textToSend = customText?.trim();
    if (!textToSend || loading) return;

    const userMsgObj: EvaChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsgObj]);
    await executeEvaRequest(undefined, textToSend);
  };

  const clearChat = () => {
    navigateMainMenu();
  };

  return (
    <EvaContext.Provider
      value={{
        open,
        setOpen,
        messages,
        loading,
        attachmentText,
        setAttachmentText,
        pageContext,
        userCoords,
        currentBreadcrumbs,
        currentMenuOptions,
        quickActions,
        promptInputMessage,
        requestUserGeolocation,
        sendMessage,
        sendMenuAction,
        navigateMainMenu,
        navigateBack,
        clearChat,
      }}
    >
      {children}
    </EvaContext.Provider>
  );
}

export function useEva() {
  const ctx = useContext(EvaContext);
  if (!ctx) throw new Error('useEva must be used inside EvaProvider');
  return ctx;
}

