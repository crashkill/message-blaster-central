import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Bell, Volume2, VolumeX } from 'lucide-react';

interface NotificationManagerProps {
  enabled: boolean;
  soundEnabled: boolean;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ 
  enabled, 
  soundEnabled 
}) => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Solicitar permissão para notificações
    if ('Notification' in window && enabled) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      } else {
        setPermission(Notification.permission);
      }
    }
  }, [enabled]);

  const playNotificationSound = () => {
    if (soundEnabled) {
      // Criar um som de notificação usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const showNotification = (title: string, body: string, icon?: string) => {
    if (enabled && permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'galatea-message',
        requireInteraction: false
      });
    }

    // Mostrar toast como fallback
    toast({
      title,
      description: body,
      duration: 5000
    });

    playNotificationSound();
  };

  // Simular notificações para demonstração
  useEffect(() => {
    const demoNotifications = [
      { title: '📱 Mensagem Enviada!', body: 'Sua mensagem carinhosa foi entregue para Vanessa' },
      { title: '🔗 WhatsApp Conectado', body: 'Sistema conectado e pronto para enviar mensagens' },
      { title: '⏰ Mensagem Agendada', body: 'Nova mensagem foi agendada para amanhã às 07:00' }
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (enabled && currentIndex < demoNotifications.length) {
        const notification = demoNotifications[currentIndex];
        showNotification(notification.title, notification.body);
        currentIndex++;
      } else if (currentIndex >= demoNotifications.length) {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [enabled, soundEnabled]);

  return null; // Este componente é invisível, apenas gerencia notificações
};

export default NotificationManager; 