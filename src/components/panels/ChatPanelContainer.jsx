import React, { useState, useRef } from 'react';
import ChatPanel from './ChatPanel';
import { storeConversation, queueOutgoing, offlineReply, indexKnowledge } from '../../lib/offlineResponder';
import { localModel } from '../../lib/localModel';

// Simple container that demonstrates wiring ChatPanel.onSend to a backend endpoint
export default function ChatPanelContainer() {
  const [conversation, setConversation] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const chatRef = useRef(null);

  const postMessageToServer = async ({ text, attachments }) => {
    const form = new FormData();
    form.append('text', text || '');
    (attachments || []).forEach((f) => form.append('files[]', f));

    const resp = await fetch('/api/messages', {
      method: 'POST',
      body: form,
    });
    if (!resp.ok) throw new Error('Server returned ' + resp.status);
    return resp.json();
  };

  const handleSend = async ({ text, attachments }) => {
    // optimistic user message
    const userMsg = { id: `u-${Date.now()}`, question: text, time: new Date().toLocaleTimeString() };
    setConversation((prev) => [...prev, userMsg]);
    // persist user message offline
    try { await storeConversation({ role: 'user', text, ts: Date.now() }); } catch (e) { console.warn('storeConversation failed', e); }
    setIsThinking(true);

    try {
      const data = await postMessageToServer({ text, attachments });
      // expect server to return an object { response: string, id?: string }
      const aionMsg = {
        id: data.id || `a-${Date.now()}`,
        response: data.response || data.reply || '',
        time: new Date().toLocaleTimeString(),
      };
      setConversation((prev) => [...prev, aionMsg]);
      try { await storeConversation({ role: 'assistant', text: aionMsg.response, ts: Date.now() }); } catch (e) { console.warn('store conversation failed', e); }
      // Auto-index assistant replies if the user has enabled that setting in the app
      try {
        const raw = localStorage.getItem('aion_settings');
        const appSettings = raw ? JSON.parse(raw) : {};
        if (appSettings.autoIndexResponses) {
          const entry = {
            title: (aionMsg.response || '').slice(0, 80) || `AION ${aionMsg.id}`,
            text: aionMsg.response || '',
            snippet: (aionMsg.response || '').slice(0, 256),
            ts: Date.now(),
          };
          await indexKnowledge([entry]);
        }
      } catch (ie) { console.warn('auto index in ChatPanelContainer failed', ie); }
    } catch (e) {
      console.warn('Send failed, using offline fallback', e);
      // queue outgoing for later sync
      try { await queueOutgoing({ text, attachments, ts: Date.now() }); } catch (qe) { console.warn('queueOutgoing failed', qe); }

      // Try local model first
      let fallback = null;
      try {
        if (!localModel.available) await localModel.init();
        if (localModel.available) {
          const localOut = await localModel.generate(text);
          fallback = { id: `a-off-${Date.now()}`, response: localOut, time: new Date().toLocaleTimeString() };
        }
      } catch (lmErr) { console.warn('localModel generate failed', lmErr); }

      if (!fallback) {
        // fallback to simple cached knowledge reply
        const off = await offlineReply(text);
        fallback = { id: `a-off-${Date.now()}`, response: off.text || 'AION is offline.', time: new Date().toLocaleTimeString() };
      }
      setConversation((prev) => [...prev, fallback]);
      try { await storeConversation({ role: 'assistant', text: fallback.response, ts: Date.now(), offline: true }); } catch (se) { console.warn('storeConversation failed', se); }
    } finally {
      setIsThinking(false);
    }
  };

  const handleSaveToIndex = async (message) => {
    try {
      const entry = {
        title: `Message ${message.id || Date.now()}`,
        text: message.response || message.question || '',
        snippet: (message.response || message.question || '').slice(0, 800),
        ts: Date.now(),
      };
      await indexKnowledge([entry]);
      // optional local feedback
      console.info('Saved to local index', entry.title);
    } catch (e) {
      console.warn('indexKnowledge failed', e);
    }
  };

  return (
    <ChatPanel
      chatContainerRef={chatRef}
      conversationHistory={conversation}
      isThinking={isThinking}
      onSend={handleSend}
      onSaveToIndex={handleSaveToIndex}
      onExamplePrompt={(q) => {
        // quick example: set composer text by calling onSend with the example prompt
        handleSend({ text: q, attachments: [] });
      }}
    />
  );
}
