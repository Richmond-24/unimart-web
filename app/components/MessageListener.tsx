"use client";

import React, { useEffect, useState } from 'react';
import { connectSocket, getSocket } from '../../lib/socket';

export default function MessageListener() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    // connectSocket now retrieves token from localStorage automatically
    const socket = connectSocket();
    const onNew = (payload: any) => {
      try {
        const me = (localStorage.getItem('unimart:user') && JSON.parse(localStorage.getItem('unimart:user')||'null')) || null;
        const senderId = payload?.message?.sender?._id || payload?.message?.senderId || payload?.message?.sender;
        if (!me) {
          // increment unread
          setUnread(u => u + 1);
          window.dispatchEvent(new CustomEvent('unimart:unreadCount', { detail: { count: unread + 1 } }));
          return;
        }
        if (String(senderId) === String(me._id || me.id)) return; // don't count my own messages
        setUnread(u => {
          const next = u + 1;
          try { window.dispatchEvent(new CustomEvent('unimart:unreadCount', { detail: { count: next } })); } catch (e) {}
          return next;
        });
      } catch (e) { console.error(e); }
    };

    if (socket) {
      socket.on('new_message', onNew);
    }

    return () => {
      if (socket) {
        try { socket.off('new_message', onNew); } catch (e) {}
      }
    };
  }, []);

  return null;
}
