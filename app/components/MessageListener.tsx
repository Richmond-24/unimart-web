"use client";

import React, { useEffect, useState } from 'react';
import { connectSocket } from '../../lib/socket';

export default function MessageListener() {
  const [messageUnread, setMessageUnread] = useState(0);
  const [notificationUnread, setNotificationUnread] = useState(0);

  useEffect(() => {
    const socket = connectSocket();

    const onNew = (payload: any) => {
      try {
        const me = (localStorage.getItem('unimart:user') && JSON.parse(localStorage.getItem('unimart:user') || 'null')) || null;
        const senderId = payload?.message?.sender?._id || payload?.message?.senderId || payload?.message?.sender;
        if (!me) {
          setMessageUnread((u) => {
            const next = u + 1;
            window.dispatchEvent(new CustomEvent('unimart:messageCount', { detail: { count: next } }));
            return next;
          });
          return;
        }
        if (String(senderId) === String(me._id || me.id)) return;
        setMessageUnread((u) => {
          const next = u + 1;
          try { window.dispatchEvent(new CustomEvent('unimart:messageCount', { detail: { count: next } })); } catch (e) {}
          return next;
        });
      } catch (e) { console.error(e); }
    };

    const onNotification = (payload: any) => {
      try {
        setNotificationUnread((u) => {
          const next = u + (Number(payload?.count) || 1);
          try { window.dispatchEvent(new CustomEvent('unimart:notificationCount', { detail: { count: next } })); } catch (e) {}
          return next;
        });
      } catch (e) { console.error(e); }
    };

    if (socket) {
      socket.on('new_message', onNew);
      socket.on('notification_received', onNotification);
    }

    return () => {
      if (socket) {
        try { socket.off('new_message', onNew); } catch (e) {}
        try { socket.off('notification_received', onNotification); } catch (e) {}
      }
    };
  }, []);

  return null;
}
