import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://crypto-galaxy-backend.onrender.com';

// Generate a unique transaction chat ID
export function generateChatId(senderAddress, receiverAddress, coin, amount) {
  const raw = `${senderAddress}-${receiverAddress}-${coin}-${amount}-${Date.now()}`;
  return btoa(raw).slice(0, 16).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
}

export default function TradeChat({ chatId, recipientName, recipientAddress, coin, amount, onClose }) {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Connect socket
    const socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinChat', { chatId });
    });

    socket.on('disconnect', () => setConnected(false));

    // Receive messages
    socket.on('chatMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTyping(false);
      // Notify if message is from other party
      if (msg.senderId !== user?._id) {
        toast(`💬 ${msg.senderName}: ${msg.text.slice(0, 40)}${msg.text.length > 40 ? '...' : ''}`, {
          icon: '💬',
          style: {
            background: 'rgba(10,10,40,0.97)',
            color: '#E8E8FF',
            border: '1px solid rgba(0,245,255,0.3)',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '14px',
          },
        });
      }
    });

    // Typing indicator
    socket.on('userTyping', ({ senderId }) => {
      if (senderId !== user?._id) {
        setTyping(true);
        if (typingTimeout) clearTimeout(typingTimeout);
        setTypingTimeout(setTimeout(() => setTyping(false), 2500));
      }
    });

    // Load chat history
    socket.on('chatHistory', (history) => {
      setMessages(history || []);
    });

    return () => {
      socket.emit('leaveChat', { chatId });
      socket.disconnect();
    };
  }, [chatId, token]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    const msg = {
      chatId,
      text: input.trim(),
      senderId: user?._id,
      senderName: `${user?.firstName} ${user?.lastName}`,
      timestamp: new Date().toISOString(),
    };
    socketRef.current.emit('chatMessage', msg);
    // Optimistically add own message
    setMessages((prev) => [...prev, { ...msg, own: true }]);
    setInput('');
    toast('✅ Message sent', {
      duration: 1500,
      style: {
        background: 'rgba(0,255,135,0.1)',
        color: '#00FF87',
        border: '1px solid rgba(0,255,135,0.3)',
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '13px',
      },
    });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socketRef.current?.emit('typing', { chatId, senderId: user?._id });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', bottom: 24, right: 24, width: 380, height: 520,
        background: 'rgba(8, 8, 32, 0.97)',
        border: '1px solid rgba(0,245,255,0.25)',
        borderRadius: 20,
        boxShadow: '0 0 40px rgba(0,245,255,0.12), 0 20px 60px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        zIndex: 1000,
        backdropFilter: 'blur(24px)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0,245,255,0.15)',
        background: 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(114,9,183,0.08))',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {/* Avatar */}
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00f5ff, #7209b7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: 14, color: 'white',
          flexShrink: 0,
        }}>
          {recipientName?.[0] || '?'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, color: 'white', fontWeight: 700 }}>
            {recipientName || 'Counterparty'}
          </div>
          <div style={{ fontSize: 11, color: connected ? '#00FF87' : '#FF3131', fontFamily: 'Share Tech Mono, monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#00FF87' : '#FF3131', display: 'inline-block' }} />
            {connected ? 'Connected' : 'Connecting...'}
          </div>
        </div>

        {/* Transaction info badge */}
        <div style={{
          padding: '4px 10px', borderRadius: 8,
          background: 'rgba(0,245,255,0.1)',
          border: '1px solid rgba(0,245,255,0.2)',
          fontSize: 11, fontFamily: 'Orbitron, monospace', color: 'var(--star-cyan)',
        }}>
          {amount} {coin}
        </div>

        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
          fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 4px',
        }}>×</button>
      </div>

      {/* Chat ID */}
      <div style={{
        padding: '6px 20px',
        background: 'rgba(114,9,183,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        fontSize: 10, fontFamily: 'Share Tech Mono, monospace', color: 'rgba(255,255,255,0.3)',
        letterSpacing: 1,
      }}>
        CHAT ID: {chatId} · BUILD TRUST BEFORE TRANSACTING
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 1 }}>
              START THE CONVERSATION
            </div>
            <div style={{ fontSize: 11, fontFamily: 'Share Tech Mono, monospace', marginTop: 6 }}>
              Chat with your counterparty to build trust before sending funds
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => {
            const isOwn = msg.own || msg.senderId === user?._id;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  flexDirection: isOwn ? 'row-reverse' : 'row',
                  alignItems: 'flex-end', gap: 8,
                }}
              >
                {!isOwn && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00f5ff44, #7209b744)',
                    border: '1px solid rgba(0,245,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontFamily: 'Orbitron, monospace', color: 'var(--star-cyan)',
                    flexShrink: 0,
                  }}>
                    {msg.senderName?.[0] || '?'}
                  </div>
                )}
                <div style={{
                  maxWidth: '70%',
                  padding: '10px 14px',
                  borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isOwn
                    ? 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(114,9,183,0.2))'
                    : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isOwn ? 'rgba(0,245,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                  {!isOwn && (
                    <div style={{ fontSize: 10, color: 'var(--star-cyan)', fontFamily: 'Orbitron, monospace', marginBottom: 4 }}>
                      {msg.senderName}
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: 'white', lineHeight: 1.5, fontFamily: 'Rajdhani, sans-serif' }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Share Tech Mono, monospace', marginTop: 4, textAlign: isOwn ? 'right' : 'left' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isOwn && ' ✓'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <div style={{
                padding: '10px 16px', borderRadius: '18px 18px 18px 4px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--star-cyan)' }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(0,245,255,0.15)',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex', gap: 10, alignItems: 'flex-end',
      }}>
        <textarea
          value={input}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: 12, padding: '10px 14px',
            color: 'white', fontFamily: 'Rajdhani, sans-serif', fontSize: 14,
            resize: 'none', outline: 'none', lineHeight: 1.5,
            maxHeight: 80, overflowY: 'auto',
          }}
        />
        <motion.button
          onClick={sendMessage}
          whileTap={{ scale: 0.92 }}
          disabled={!input.trim()}
          style={{
            width: 42, height: 42, borderRadius: '50%',
            background: input.trim()
              ? 'linear-gradient(135deg, var(--cosmic-blue), var(--nebula-purple))'
              : 'rgba(255,255,255,0.05)',
            border: `1px solid ${input.trim() ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: 'white', fontSize: 18, cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s', flexShrink: 0,
            boxShadow: input.trim() ? '0 0 16px rgba(0,245,255,0.3)' : 'none',
          }}
        >
          🚀
        </motion.button>
      </div>
    </motion.div>
  );
}