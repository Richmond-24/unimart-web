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
        const senderId = payload?.message?.sender?._id || payload?.message?.senderId || payload?.message?.sender || payload?.sender?._id || payload?.sender || payload?.senderId;
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
          try {
            window.dispatchEvent(new CustomEvent('unimart:messageCount', { detail: { count: next, increment: 1 } }));
          } catch (e) {}
          return next;
        });
      } catch (e) { console.error(e); }
    };

    const onNotification = (payload: any) => {
      try {
        const increment = Number(payload?.count) || 1;
        setNotificationUnread((u) => {
          const next = u + increment;
          try {
            window.dispatchEvent(new CustomEvent('unimart:notificationCount', { detail: { count: next, increment } }));
          } catch (e) {}
          return next;
        });
      } catch (e) { console.error(e); }
    };

    const onSellerNew = (payload: any) => {
      onNew(payload);
    };

    if (socket) {
      socket.on('new_message', onNew);
      socket.on('message:new', onNew);
      socket.on('seller:new_message', onSellerNew);
      socket.on('notification_received', onNotification);
    }

    return () => {
      if (socket) {
        try { socket.off('new_message', onNew); } catch (e) {}
        try { socket.off('message:new', onNew); } catch (e) {}
        try { socket.off('seller:new_message', onSellerNew); } catch (e) {}
        try { socket.off('notification_received', onNotification); } catch (e) {}
      }
    };
  }, []);

  return null;
}
