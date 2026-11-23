import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyD3P1V9bvJq9Q2WZRL6EdwLuepn2EdoLG0',
  authDomain: 'onyang-ea7b1.firebaseapp.com',
  projectId: 'onyang-ea7b1',
  storageBucket: 'onyang-ea7b1.firebasestorage.app',
  messagingSenderId: '789635766409',
  appId: '1:789635766409:web:fc1570c88716463ac7ce58',
  measurementId: 'G-6F5QVQ18EG',
};

const VAPID_KEY =
  'BJUFIQcfLfaehdYWuhjAUV24A67D2qK_Kf0cmewydx3VEH3vkplQhB2kTj4S8-UD_ljb0qB5oivF01qODjD7CIo';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

function getDeviceId() {
  try {
    let id = localStorage.getItem('onyang_fcm_device_id');
    if (!id) {
      id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('onyang_fcm_device_id', id);
    }
    return id;
  } catch (_) {
    return `dev_${Date.now()}`;
  }
}

export async function requestAndSaveFcmToken(role = 'guest') {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { ok: false, reason: '이 브라우저는 알림을 지원하지 않습니다. (iPhone은 홈 화면 추가 후 실행해 주세요)' };
  }

  const supported = await isSupported().catch(() => false);
  if (!supported) {
    return { ok: false, reason: '현재 환경에서 웹 푸시를 지원하지 않습니다.' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { ok: false, reason: '알림 권한이 허용되지 않았습니다. 브라우저/기기 설정에서 알림을 켜주세요.' };
  }

  const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });

  if (!token) {
    return { ok: false, reason: '알림 토큰을 가져오지 못했습니다.' };
  }

  const deviceId = getDeviceId();
  await setDoc(
    doc(db, 'fcmTokens', deviceId),
    {
      token,
      role,
      userAgent: navigator.userAgent || '',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { ok: true, token };
}

export function listenForegroundMessages(onNotify) {
  if (typeof window === 'undefined' || !('Notification' in window)) return () => {};
  let unsubscribe = () => {};

  isSupported()
    .then((supported) => {
      if (!supported) return;
      const messaging = getMessaging(app);
      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title || '온양이';
        const body = payload.notification?.body || '새로운 말씀과 소식이 도착했습니다.';
        if (typeof onNotify === 'function') {
          onNotify({ title, body });
        }
        if (Notification.permission === 'granted') {
          try {
            new Notification(title, { body, icon: '/onyang-icon.png' });
          } catch (_) {}
        }
      });
    })
    .catch(() => {});

  return () => {
    try {
      unsubscribe();
    } catch (_) {}
  };
}
