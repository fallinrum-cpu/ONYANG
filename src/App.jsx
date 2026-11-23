import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  Sparkles,
  Calendar,
  BookOpen,
  CheckCircle2,
  Users,
  Trophy,
  Music,
  Camera,
  Gamepad2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  X,
  Lock,
  Unlock,
  Heart,
  Award,
  Sun,
  Moon,
  Volume2,
  Check,
  AlertCircle,
  UserPlus,
  Layers,
  Images,
  ExternalLink,
} from 'lucide-react';
import { requestAndSaveFcmToken, listenForegroundMessages } from './fcm';

// ============================================================================
// Firebase 설정 (onyang-ea7b1)
// ============================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD3P1V9bvJq9Q2WZRL6EdwLuepn2EdoLG0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'onyang-ea7b1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'onyang-ea7b1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'onyang-ea7b1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '789635766409',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:789635766409:web:fc1570c88716463ac7ce58',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-6F5QVQ18EG',
};

let db = null;
try {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (err) {
  console.warn('Firebase 초기화 안내:', err);
}

// ============================================================================
// 비밀번호 및 저장 경로 (교사: 0852, 임원/학생 콘텐츠 관리: 2468)
// ============================================================================
const TEACHER_PASSCODE = '0852';
const OFFICER_PASSCODE = '2468';
const DB_DOC_PATH = ['onyangYouthApp', 'mainState'];

const CHURCH_LINKS = [
  { label: '교회 홈페이지', url: 'https://www.onyangchurch.or.kr' },
  { label: '유튜브', url: 'https://www.youtube.com' },
  { label: '인스타그램', url: 'https://www.instagram.com' },
];

const VERSE_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
];

const INITIAL_DATA = {
  mottoTitle: '함께 지어져 가는 청소년부',
  mottoVerse: '"그리스도 예수 안에서 함께 지어져 가느니라" (엡 2:22)',
  seasonBadge: '창조절',
  dailyVerse: {
    reference: '이사야 43:1',
    text: '너는 두려워하지 말라 내가 너를 구속하였고 내가 너를 지명하여 불렀나니 너는 내 것이라',
  },
  serving: {
    currentWeekLabel: '2026. 11. 22 주일 예배',
    lastWeekMonday: '2026-11-16',
    current: {
      prayer: '박지훈',
      scripture: '김지후 (시편 103:1-2)',
      specialSong: '중등부 찬양팀',
      welcome: '이해온',
    },
    next: {
      prayer: '이유빈',
      scripture: '구하람 (로마서 8:28)',
      specialSong: '고등부 중창단',
      welcome: '강사무엘',
    },
  },
  students: [
    { id: 's1', name: '강사무엘', grade: '중3', birthday: '11.01', phone: '010-1000-0001' },
    { id: 's2', name: '이유빈', grade: '고3', birthday: '11.04', phone: '010-1000-0002' },
    { id: 's3', name: '허윤슬', grade: '중2', birthday: '11.23', phone: '010-1000-0003' },
    { id: 's4', name: '허슬아', grade: '중2', birthday: '11.23', phone: '010-1000-0004' },
    { id: 's5', name: '이해온', grade: '중3', birthday: '05.12', phone: '010-1000-0005' },
    { id: 's6', name: '구하람', grade: '중3', birthday: '07.19', phone: '010-1000-0006' },
  ],
  attendanceByDate: {
    '2026-11-22': {
      s1: 'present',
      s2: 'present',
      s3: 'second',
      s4: 'second',
      s5: 'absent',
      s6: 'long_absent',
    },
  },
  challengeCompleted: ['중3 이해온', '중3 구하람', '중3 강사무엘', '고3 이유빈', '중2 허윤슬'],
  quizzes: [
    {
      id: 'q1',
      question: '이번 주 설교 본문에서 우리가 두려워하지 말아야 할 이유는 무엇인가요?',
      options: [
        '주님이 우리를 구속하시고 지명하여 부르셨기 때문',
        '어려운 일이 전혀 생기지 않기 때문',
        '우리가 모든 것을 혼자 해결할 수 있기 때문',
      ],
      answerIndex: 0,
    },
  ],
  quizCompletedNames: ['중3 이해온', '중3 구하람'],
  songs: [
    {
      id: 'm1',
      title: '주의 은혜라',
      artist: '아이자야 씩스티원',
      youtubeUrl: 'https://www.youtube.com/results?search_query=주의+은혜라+아이자야씩스티원',
    },
    {
      id: 'm2',
      title: '함께 지어져 가네',
      artist: '온양 청소년부 찬양',
      youtubeUrl: 'https://www.youtube.com/results?search_query=함께+지어져+가네+찬양',
    },
  ],
  schedules: [
    { id: 'sc1', date: '11.22 (주일)', title: '주일 1·2부 예배 및 분반 모임', note: '오전 9:30 / 11:15 본당 및 청소년부실' },
    { id: 'sc2', date: '11.29 (주일)', title: '대림절 첫째 주일 & 말씀 퀴즈 시상', note: '주중 말씀 챌린지 참여자 간식 나눔' },
  ],
  albums: [
    {
      id: 'alb1',
      title: '가을 야외 분반 나눔 & 찬양',
      date: '2026. 11. 15',
      photos: [
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
      ],
    },
  ],
  gameRecords: {
    crown: [{ name: '중3 이해온', score: 1420 }],
    dove: [{ name: '중3 구하람', score: 980 }],
    tower: [{ name: '고3 이유빈', score: 24 }],
  },
};

function getTodayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getLatestMondayISO() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatVerseLines(text = '') {
  const clean = text.trim();
  if (!clean) return [];
  const words = clean.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > 17 && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ============================================================================
// 말씀카드 오버레이 (불필요한 버튼·안내문구 없이 터치 시 물결 개방)
// ============================================================================
function DailyVerseOverlay({ verse, onClose }) {
  const [bgIdx] = useState(() => new Date().getDate() % VERSE_BACKGROUNDS.length);
  const [opening, setOpening] = useState(false);
  const [ripple, setRipple] = useState({ x: 50, y: 50, pxX: 200, pxY: 400 });

  const lines = useMemo(() => formatVerseLines(verse?.text), [verse?.text]);

  const handleTouchOpen = (e) => {
    if (opening) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? rect.width / 2;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? rect.height / 2;
    const pxX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const pxY = Math.max(0, Math.min(rect.height, clientY - rect.top));
    setRipple({
      x: Number(((pxX / rect.width) * 100).toFixed(1)),
      y: Number(((pxY / rect.height) * 100).toFixed(1)),
      pxX,
      pxY,
    });
    setOpening(true);
    setTimeout(() => onClose(), 1050);
  };

  return (
    <div
      onClick={handleTouchOpen}
      style={{
        opacity: opening ? 0 : 1,
        WebkitMaskImage: opening
          ? `radial-gradient(circle at ${ripple.x}% ${ripple.y}%, transparent 0%, transparent 52%, rgba(0,0,0,0.45) 74%, black 100%)`
          : 'none',
        maskImage: opening
          ? `radial-gradient(circle at ${ripple.x}% ${ripple.y}%, transparent 0%, transparent 52%, rgba(0,0,0,0.45) 74%, black 100%)`
          : 'none',
        transition: 'opacity 1.05s cubic-bezier(0.22, 1, 0.36, 1), -webkit-mask-image 1.05s ease-out, mask-image 1.05s ease-out',
      }}
      className="fixed inset-0 z-50 cursor-pointer select-none overflow-hidden flex items-center justify-center p-7 text-white"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${VERSE_BACKGROUNDS[bgIdx]})` }}
      />
      <div className="absolute inset-0 bg-slate-950/45" />

      {opening && (
        <div
          style={{
            left: `${ripple.pxX}px`,
            top: `${ripple.pxY}px`,
            transform: 'translate(-50%, -50%)',
            animation: 'verseWaveOpen 1.05s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
          className="pointer-events-none absolute w-6 h-6 rounded-full border-2 border-white/60 bg-white/15"
        />
      )}

      <div className="relative z-10 text-center max-w-sm">
        <div
          style={{ fontFamily: "'Gowun Batang', 'Noto Serif KR', serif", fontWeight: 700 }}
          className="space-y-2 text-2xl leading-relaxed drop-shadow"
        >
          {lines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
        {verse?.reference && (
          <p className="mt-6 text-sm font-semibold tracking-wide text-amber-200">
            {verse.reference}
          </p>
        )}
      </div>

      <style>{`
        @keyframes verseWaveOpen {
          0% { width: 24px; height: 24px; opacity: 0.9; }
          100% { width: 1400px; height: 1400px; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// 미니게임 3종
// ============================================================================
function MiniGamesView({ data, onSaveScore }) {
  const [mode, setMode] = useState('menu');
  const [nameInput, setNameInput] = useState('');

  const [crownScore, setCrownScore] = useState(0);
  const [crownItems, setCrownItems] = useState([]);
  const [crownOver, setCrownOver] = useState(false);

  const [doveY, setDoveY] = useState(48);
  const [doveVel, setDoveVel] = useState(0);
  const [doveScore, setDoveScore] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [doveOver, setDoveOver] = useState(false);

  const [blocks, setBlocks] = useState([{ width: 72, left: 14, color: '#2563eb' }]);
  const [movingLeft, setMovingLeft] = useState(10);
  const [movingDir, setMovingDir] = useState(1);
  const [towerOver, setTowerOver] = useState(false);
  const lastDropRef = useRef(0);

  const startCrown = () => {
    setCrownScore(0);
    setCrownOver(false);
    setCrownItems([
      { id: 1, x: 25, y: 20, type: 'gem' },
      { id: 2, x: 65, y: 35, type: 'gem' },
      { id: 3, x: 45, y: 12, type: 'thorn' },
    ]);
    setMode('crown');
  };

  useEffect(() => {
    if (mode !== 'crown' || crownOver) return;
    const t = setInterval(() => {
      setCrownItems((prev) => {
        const next = prev
          .map((it) => ({ ...it, y: it.y + 5 }))
          .filter((it) => it.y < 96);
        if (Math.random() < 0.42) {
          next.push({
            id: Date.now() + Math.random(),
            x: 12 + Math.random() * 76,
            y: 4,
            type: Math.random() < 0.25 ? 'thorn' : 'gem',
          });
        }
        if (next.some((it) => it.y >= 88 && it.type === 'gem')) {
          setCrownOver(true);
        }
        return next;
      });
    }, 180);
    return () => clearInterval(t);
  }, [mode, crownOver]);

  const startDove = () => {
    setDoveY(48);
    setDoveVel(0);
    setDoveScore(0);
    setDoveOver(false);
    setObstacles([{ id: Date.now(), x: 85, gapY: 45 }]);
    setMode('dove');
  };

  useEffect(() => {
    if (mode !== 'dove' || doveOver) return;
    const t = setInterval(() => {
      setDoveVel((v) => v + 1.1);
      setDoveY((y) => {
        const ny = y + doveVel * 0.45;
        if (ny < 4 || ny > 92) setDoveOver(true);
        return Math.max(2, Math.min(94, ny));
      });
      setObstacles((prev) => {
        const moved = prev
          .map((ob) => ({ ...ob, x: ob.x - 4 }))
          .filter((ob) => ob.x > -12);
        if (moved.length === 0 || moved[moved.length - 1].x < 55) {
          moved.push({ id: Date.now() + Math.random(), x: 95, gapY: 24 + Math.random() * 50 });
        }
        moved.forEach((ob) => {
          if (ob.x > 16 && ob.x < 28 && Math.abs(doveY - ob.gapY) > 16) {
            setDoveOver(true);
          }
        });
        return moved;
      });
      setDoveScore((s) => s + 10);
    }, 80);
    return () => clearInterval(t);
  }, [mode, doveOver, doveVel, doveY]);

  const startTower = () => {
    setBlocks([{ width: 72, left: 14, color: '#2563eb' }]);
    setMovingLeft(10);
    setMovingDir(1);
    setTowerOver(false);
    setMode('tower');
  };

  useEffect(() => {
    if (mode !== 'tower' || towerOver) return;
    const t = setInterval(() => {
      const top = blocks[blocks.length - 1];
      const maxLeft = 100 - top.width;
      setMovingLeft((prev) => {
        let next = prev + movingDir * 3.5;
        if (next >= maxLeft) {
          next = maxLeft;
          setMovingDir(-1);
        } else if (next <= 0) {
          next = 0;
          setMovingDir(1);
        }
        return next;
      });
    }, 45);
    return () => clearInterval(t);
  }, [mode, towerOver, blocks, movingDir]);

  const dropBlock = () => {
    if (towerOver) return;
    const now = Date.now();
    if (now - lastDropRef.current < 180) return;
    lastDropRef.current = now;

    const prev = blocks[blocks.length - 1];
    const left = Math.max(prev.left, movingLeft);
    const right = Math.min(prev.left + prev.width, movingLeft + prev.width);
    const width = right - left;
    if (width <= 6) {
      setTowerOver(true);
      return;
    }
    const colors = ['#2563eb', '#059669', '#d97706', '#e11d48', '#7c3aed'];
    setBlocks((b) => [
      ...b,
      { width: Number(width.toFixed(1)), left: Number(left.toFixed(1)), color: colors[b.length % colors.length] },
    ]);
    setMovingLeft(movingDir > 0 ? 0 : 100 - width);
  };

  if (mode === 'menu') {
    return (
      <div className="space-y-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
          <h2 className="text-base font-bold text-slate-900">기록 깨기 미니게임 3종</h2>
          <button
            type="button"
            onClick={startCrown}
            className="w-full p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">👑 면류관 만들기</p>
              <p className="text-xs text-slate-600">보석을 탭하고 가시를 피하세요</p>
            </div>
            <span className="text-xs font-bold text-amber-800">도전</span>
          </button>
          <button
            type="button"
            onClick={startDove}
            className="w-full p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-left flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">🕊️ 성령의 비둘기</p>
              <p className="text-xs text-slate-600">탭하여 장애물 사이를 통과하세요</p>
            </div>
            <span className="text-xs font-bold text-sky-800">도전</span>
          </button>
          <button
            type="button"
            onClick={startTower}
            className="w-full p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-left flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">🗼 바벨탑 쌓기</p>
              <p className="text-xs text-slate-600">타이밍에 맞춰 블록을 쌓으세요</p>
            </div>
            <span className="text-xs font-bold text-emerald-800">도전</span>
          </button>
        </div>
      </div>
    );
  }

  const score = mode === 'crown' ? crownScore : mode === 'dove' ? doveScore : Math.max(0, blocks.length - 1);
  const over = (mode === 'crown' && crownOver) || (mode === 'dove' && doveOver) || (mode === 'tower' && towerOver);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setMode('menu')} className="text-xs font-bold text-slate-600">
          ← 게임 선택
        </button>
        <span className="text-sm font-extrabold text-blue-700">
          {score} {mode === 'tower' ? '층' : '점'}
        </span>
      </div>

      {mode === 'crown' && (
        <div className="relative h-72 rounded-xl bg-slate-900 overflow-hidden select-none">
          <div style={{ top: '88%' }} className="absolute inset-x-0 border-t border-dashed border-rose-400/70" />
          {crownItems.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                if (crownOver) return;
                if (it.type === 'thorn') setCrownOver(true);
                else {
                  setCrownScore((s) => s + 120);
                  setCrownItems((p) => p.filter((x) => x.id !== it.id));
                }
              }}
              style={{ left: `${it.x}%`, top: `${it.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl"
            >
              {it.type === 'gem' ? '💎' : '🌵'}
            </button>
          ))}
        </div>
      )}

      {mode === 'dove' && (
        <div
          onClick={() => !doveOver && setDoveVel(-8.5)}
          className="relative h-72 rounded-xl bg-sky-100 overflow-hidden select-none cursor-pointer"
        >
          <div style={{ top: `${doveY}%`, left: '22%' }} className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl">
            🕊️
          </div>
          {obstacles.map((ob) => (
            <React.Fragment key={ob.id}>
              <div style={{ left: `${ob.x}%`, top: 0, height: `${Math.max(0, ob.gapY - 16)}%` }} className="absolute w-7 -translate-x-1/2 bg-emerald-600/80" />
              <div style={{ left: `${ob.x}%`, top: `${Math.min(100, ob.gapY + 16)}%`, bottom: 0 }} className="absolute w-7 -translate-x-1/2 bg-emerald-600/80" />
            </React.Fragment>
          ))}
        </div>
      )}

      {mode === 'tower' && (
        <div onClick={dropBlock} className="relative h-72 rounded-xl bg-slate-100 overflow-hidden select-none cursor-pointer">
          {!towerOver && (
            <div
              style={{
                left: `${movingLeft}%`,
                width: `${blocks[blocks.length - 1].width}%`,
                bottom: `${blocks.length * 22 + 8}px`,
                backgroundColor: blocks[blocks.length - 1].color,
              }}
              className="absolute h-5 rounded"
            />
          )}
          {blocks.map((b, i) => (
            <div
              key={i}
              style={{ left: `${b.left}%`, width: `${b.width}%`, bottom: `${i * 22 + 8}px`, backgroundColor: b.color }}
              className="absolute h-5 rounded"
            />
          ))}
        </div>
      )}

      {over && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!nameInput.trim()) return;
            onSaveScore(mode, nameInput.trim(), score);
            setNameInput('');
            setMode('menu');
          }}
          className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-2"
        >
          <p className="text-xs font-bold text-slate-900">기록 저장 ({score}{mode === 'tower' ? '층' : '점'})</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="예: 중2 홍길동"
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
            <button type="submit" className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white">
              등록
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ============================================================================
// 메인 앱
// ============================================================================
export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [hasLoadedRemote, setHasLoadedRemote] = useState(false);
  const [showVerseCard, setShowVerseCard] = useState(true);

  const [navStack, setNavStack] = useState(['home']);
  const currentView = navStack[navStack.length - 1];

  const [adminSubTab, setAdminSubTab] = useState('dashboard');
  const [authRole, setAuthRole] = useState(null); // null | 'teacher' | 'officer'
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [attendanceDate, setAttendanceDate] = useState(getTodayISO());
  const [studentForm, setStudentForm] = useState({ name: '', grade: '중1', birthday: '', phone: '' });
  const [editingStudentId, setEditingStudentId] = useState(null);

  const [challengeInput, setChallengeInput] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleterName, setQuizCompleterName] = useState('');
  const [quizMessage, setQuizMessage] = useState('');
  const [draftQuestions, setDraftQuestions] = useState([{ question: '', options: ['', '', ''], answerIndex: 0 }]);

  const [activeAlbumId, setActiveAlbumId] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDate, setAlbumDate] = useState(getTodayISO().replace(/-/g, '. '));
  const [albumPhotos, setAlbumPhotos] = useState([]);

  const [pushStatusMsg, setPushStatusMsg] = useState('');

  const swipeRef = useRef({
    startX: 0,
    startY: 0,
    fromLeftEdge: false,
    isAlbumArea: false,
  });

  useEffect(() => {
    if (!db) {
      setHasLoadedRemote(true);
      return;
    }
    const refDoc = doc(db, ...DB_DOC_PATH);
    const unsub = onSnapshot(
      refDoc,
      (snap) => {
        if (snap.exists()) {
          const remote = snap.data();
          setData((prev) => ({
            ...prev,
            ...remote,
            students: Array.isArray(remote.students) ? remote.students : prev.students,
            albums: Array.isArray(remote.albums) ? remote.albums : prev.albums,
            quizzes: Array.isArray(remote.quizzes) ? remote.quizzes : prev.quizzes,
            challengeCompleted: Array.isArray(remote.challengeCompleted)
              ? remote.challengeCompleted
              : prev.challengeCompleted,
            quizCompletedNames: Array.isArray(remote.quizCompletedNames)
              ? remote.quizCompletedNames
              : prev.quizCompletedNames,
          }));
        }
        setHasLoadedRemote(true);
      },
      () => setHasLoadedRemote(true)
    );
    return () => unsub();
  }, []);

  const persistData = (updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (db && hasLoadedRemote) {
        setDoc(doc(db, ...DB_DOC_PATH), next, { merge: true }).catch((err) =>
          console.error('DB 저장 실패:', err)
        );
      }
      return next;
    });
  };

  // 매주 월요일 다음 주일 섬김이 자동 이월
  useEffect(() => {
    if (!hasLoadedRemote) return;
    const latestMon = getLatestMondayISO();
    setData((prev) => {
      const lastMon = prev.serving?.lastWeekMonday;
      if (!lastMon || lastMon >= latestMon) return prev;
      const promoted = {
        ...prev,
        serving: {
          ...prev.serving,
          lastWeekMonday: latestMon,
          currentWeekLabel: `${latestMon.replace(/-/g, '. ')} 주일 예배`,
          current: { ...(prev.serving?.next || prev.serving?.current) },
        },
      };
      if (db) {
        setDoc(doc(db, ...DB_DOC_PATH), promoted, { merge: true }).catch(() => {});
      }
      return promoted;
    });
  }, [hasLoadedRemote]);

  // FCM 포그라운드 수신 및 알림 허용 핸들러
  useEffect(() => {
    const stopListen = listenForegroundMessages(({ title, body }) => {
      setPushStatusMsg(`${title}: ${body}`);
    });
    return () => stopListen();
  }, []);

  const handleEnablePush = async () => {
    setPushStatusMsg('알림 설정을 확인하는 중...');
    const res = await requestAndSaveFcmToken(authRole || 'member');
    setPushStatusMsg(res.ok ? '스마트폰 알림이 등록되었습니다!' : res.reason);
  };

  // 네비게이션 및 뒤로 가기
  const goTo = (view) => {
    setNavStack((prev) => (prev[prev.length - 1] === view ? prev : [...prev, view]));
    if (view === 'admin') {
      setAdminSubTab('dashboard');
    }
  };

  const handleBack = () => {
    if (currentView === 'admin' && adminSubTab !== 'dashboard') {
      setAdminSubTab('dashboard');
      return;
    }
    setNavStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : ['home']));
  };

  const onTouchStartRoot = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    const inAlbum = Boolean(e.target?.closest?.('[data-album-swipe="true"]'));
    swipeRef.current = {
      startX: t.clientX,
      startY: t.clientY,
      // 왼쪽 끝 32px에서 시작할 때만 뒤로 가기 허용 (우측->좌측 스와이프는 홈으로 가지 않음)
      fromLeftEdge: t.clientX <= 32 && !inAlbum,
      isAlbumArea: inAlbum,
    };
  };

  const onTouchEndRoot = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - swipeRef.current.startX;
    const dy = t.clientY - swipeRef.current.startY;

    if (swipeRef.current.isAlbumArea && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      const album = data.albums.find((a) => a.id === activeAlbumId);
      if (album?.photos?.length > 1) {
        setActivePhotoIdx((idx) =>
          dx < 0 ? (idx + 1) % album.photos.length : (idx - 1 + album.photos.length) % album.photos.length
        );
      }
      return;
    }

    if (
      swipeRef.current.fromLeftEdge &&
      dx > 70 &&
      Math.abs(dx) > Math.abs(dy) * 1.4 &&
      currentView !== 'home'
    ) {
      handleBack();
    }
  };

  // 출석 집계 (출석 / 2부예배 / 결석 / 장결자 / 전체 재적)
  const attendanceStats = useMemo(() => {
    const map = data.attendanceByDate?.[attendanceDate] || {};
    let present = 0;
    let second = 0;
    let absent = 0;
    let longAbsent = 0;
    data.students.forEach((st) => {
      const v = map[st.id];
      if (v === 'present') present += 1;
      else if (v === 'second') second += 1;
      else if (v === 'absent') absent += 1;
      else if (v === 'long_absent') longAbsent += 1;
    });
    return {
      totalAttended: present + second,
      present,
      second,
      absent,
      longAbsent,
      totalEnrolled: data.students.length,
    };
  }, [data.students, data.attendanceByDate, attendanceDate]);

  const setStudentAttendance = (studentId, status) => {
    persistData((prev) => ({
      ...prev,
      attendanceByDate: {
        ...(prev.attendanceByDate || {}),
        [attendanceDate]: {
          ...((prev.attendanceByDate || {})[attendanceDate] || {}),
          [studentId]: status,
        },
      },
    }));
  };

  // 학생 등록 / 수정 / 삭제
  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim()) return;
    if (editingStudentId) {
      persistData((prev) => ({
        ...prev,
        students: prev.students.map((st) =>
          st.id === editingStudentId ? { ...st, ...studentForm, name: studentForm.name.trim() } : st
        ),
      }));
      setEditingStudentId(null);
    } else {
      persistData((prev) => ({
        ...prev,
        students: [
          ...prev.students,
          {
            id: `s_${Date.now()}`,
            name: studentForm.name.trim(),
            grade: studentForm.grade,
            birthday: studentForm.birthday.trim(),
            phone: studentForm.phone.trim(),
          },
        ],
      }));
    }
    setStudentForm({ name: '', grade: '중1', birthday: '', phone: '' });
  };

  const deleteStudent = (id) => {
    if (editingStudentId === id) {
      setEditingStudentId(null);
      setStudentForm({ name: '', grade: '중1', birthday: '', phone: '' });
    }
    persistData((prev) => ({
      ...prev,
      students: prev.students.filter((st) => st.id !== id),
    }));
  };

  // 말씀 챌린지 등록
  const handleAddChallenge = (e) => {
    e.preventDefault();
    const val = challengeInput.trim();
    if (!val) return;
    persistData((prev) => ({
      ...prev,
      challengeCompleted: prev.challengeCompleted.includes(val)
        ? prev.challengeCompleted
        : [...prev.challengeCompleted, val],
    }));
    setChallengeInput('');
  };

  // 퀴즈 출제 & 풀이
  const handlePublishQuizzes = (e) => {
    e.preventDefault();
    const valid = draftQuestions
      .filter((q) => q.question.trim() && q.options.some((o) => o.trim()))
      .map((q, idx) => ({
        id: `q_${Date.now()}_${idx}`,
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()).filter(Boolean),
        answerIndex: Number(q.answerIndex) || 0,
      }));
    if (!valid.length) return;
    persistData((prev) => ({
      ...prev,
      quizzes: valid,
      quizCompletedNames: [],
    }));
    setSelectedAnswers({});
    setDraftQuestions([{ question: '', options: ['', '', ''], answerIndex: 0 }]);
    setQuizMessage(`${valid.length}개 문제가 출제되었습니다.`);
  };

  const handleSubmitQuiz = (e) => {
    e.preventDefault();
    if (!quizCompleterName.trim()) {
      setQuizMessage('학년과 이름을 입력해 주세요.');
      return;
    }
    const allCorrect = data.quizzes.every((q, idx) => selectedAnswers[idx] === q.answerIndex);
    if (!allCorrect) {
      setQuizMessage('틀린 문제가 있어요. 다시 선택해 보세요.');
      return;
    }
    const nameVal = quizCompleterName.trim();
    persistData((prev) => ({
      ...prev,
      quizCompletedNames: prev.quizCompletedNames.includes(nameVal)
        ? prev.quizCompletedNames
        : [...prev.quizCompletedNames, nameVal],
    }));
    setQuizCompleterName('');
    setQuizMessage('정답입니다! 완료 명단에 등록되었습니다.');
  };

  // 사진첩 업로드 & 삭제
  const handlePhotoFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAlbumPhotos((prev) => [...prev, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreateAlbum = (e) => {
    e.preventDefault();
    if (!albumTitle.trim() || albumPhotos.length === 0) return;
    persistData((prev) => ({
      ...prev,
      albums: [
        {
          id: `alb_${Date.now()}`,
          title: albumTitle.trim(),
          date: albumDate.trim() || getTodayISO().replace(/-/g, '. '),
          photos: albumPhotos,
        },
        ...prev.albums,
      ],
    }));
    setAlbumTitle('');
    setAlbumPhotos([]);
  };

  const handleDeleteAlbum = (albumId) => {
    persistData((prev) => ({
      ...prev,
      albums: prev.albums.filter((a) => a.id !== albumId),
    }));
    if (activeAlbumId === albumId) {
      setActiveAlbumId(null);
      setActivePhotoIdx(0);
    }
  };

  // 비밀번호 인증 (교사: 0852 / 임원·학생 콘텐츠 관리: 2468)
  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcodeInput === TEACHER_PASSCODE) {
      setAuthRole('teacher');
      setAdminSubTab('dashboard');
      setPasscodeInput('');
      setAuthError('');
    } else if (passcodeInput === OFFICER_PASSCODE) {
      setAuthRole('officer');
      setAdminSubTab('content');
      setPasscodeInput('');
      setAuthError('');
    } else {
      setAuthError('비밀번호를 확인해 주세요.');
    }
  };

  const novemberBirthdays = useMemo(
    () => data.students.filter((s) => (s.birthday || '').startsWith('11.')),
    [data.students]
  );

  // 슬라이드 끊김 없는 2배 복제 리스트
  const challengeSlideItems = useMemo(() => {
    const base = data.challengeCompleted.length ? data.challengeCompleted : ['말씀 챌린지에 참여해 보세요'];
    return [...base, ...base];
  }, [data.challengeCompleted]);

  return (
    <div
      onTouchStart={onTouchStartRoot}
      onTouchEnd={onTouchEndRoot}
      className="min-h-screen bg-[#f6f7f9] text-slate-900 pb-10"
    >
      {showVerseCard && (
        <DailyVerseOverlay verse={data.dailyVerse} onClose={() => setShowVerseCard(false)} />
      )}

      {/* 상단 바 (교사용 하트 버튼 색상 및 클릭 활성화) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/70 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {currentView !== 'home' ? (
              <button
                type="button"
                onClick={handleBack}
                aria-label="뒤로 가기"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <span className="text-xs font-semibold text-slate-500">온양 청소년부</span>
            )}
            <span className="text-sm font-extrabold text-slate-900">온양이</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVerseCard(true)}
              className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-900"
            >
              오늘의 말씀
            </button>
            <button
              type="button"
              onClick={() => goTo('admin')}
              aria-label="교사 및 임원 관리"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-50 hover:bg-rose-100 transition"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 홈 화면                                                              */}
      {/* ==================================================================== */}
      {currentView === 'home' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-3.5">
          {/* 표어 */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/70">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-500">2026 청소년부 표어</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {data.seasonBadge}
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-slate-900">{data.mottoTitle}</h1>
            <p className="text-xs text-slate-600 mt-1">{data.mottoVerse}</p>
          </section>

          {/* 이번 주일 예배 섬김이 */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-bold text-slate-900">이번 주일 예배 섬김이</h2>
              <button
                type="button"
                onClick={() => goTo('serving')}
                className="text-xs font-semibold text-slate-500 flex items-center"
              >
                전체보기 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50">
                <p className="text-slate-400">대표기도</p>
                <p className="font-bold text-slate-800 mt-0.5">{data.serving.current.prayer}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <p className="text-slate-400">성경봉독</p>
                <p className="font-bold text-slate-800 mt-0.5">{data.serving.current.scripture}</p>
              </div>
            </div>
          </section>

          {/* 11월 생일 */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">11월 생일을 축하합니다</h2>
              <span className="text-xs font-bold text-rose-600">총 {novemberBirthdays.length}명</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {novemberBirthdays.map((b) => (
                <span key={b.id} className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 font-medium">
                  {b.grade} {b.name} ({b.birthday})
                </span>
              ))}
            </div>
          </section>

          {/* 주중 말씀 복습 챌린지 (끊김 없는 슬라이드) */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/70 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">주중 말씀 복습 챌린지</h2>
              <button
                type="button"
                onClick={() => goTo('challenge')}
                className="text-xs font-bold text-blue-600"
              >
                도전하기 →
              </button>
            </div>
            <div className="relative overflow-hidden py-1.5 bg-slate-50 rounded-xl">
              <div className="flex w-max animate-smooth-ticker">
                {challengeSlideItems.map((name, idx) => (
                  <span key={idx} className="mx-3 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0">
                    • {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* 지난 주일 설교 말씀 퀴즈 */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/70 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">지난 주일 설교 말씀 퀴즈</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                완료 ({data.quizCompletedNames.length}명): {data.quizCompletedNames.join(', ') || '없음'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => goTo('quiz')}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shrink-0"
            >
              퀴즈 풀기
            </button>
          </section>

          {/* 찬양 / 일정 / 사진첩 */}
          <section className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => goTo('songs')}
              className="bg-white rounded-2xl p-3 border border-slate-200/70 text-left"
            >
              <Music className="w-4 h-4 text-blue-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-900">이번 달 찬양</p>
            </button>
            <button
              type="button"
              onClick={() => goTo('schedule')}
              className="bg-white rounded-2xl p-3 border border-slate-200/70 text-left"
            >
              <Calendar className="w-4 h-4 text-emerald-700 mb-1.5" />
              <p className="text-xs font-bold text-slate-900">예배 및 행사</p>
            </button>
            <button
              type="button"
              onClick={() => goTo('photos')}
              className="bg-white rounded-2xl p-3 border border-slate-200/70 text-left"
            >
              <Camera className="w-4 h-4 text-rose-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-900">활동 사진첩</p>
            </button>
          </section>

          {/* 미니게임 */}
          <button
            type="button"
            onClick={() => goTo('games')}
            className="w-full bg-white rounded-2xl p-3.5 border border-slate-200/70 flex items-center justify-between text-left"
          >
            <div>
              <p className="text-sm font-bold text-slate-900">기록 깨기 미니게임 3종</p>
              <p className="text-xs text-slate-500">면류관 · 성령의 비둘기 · 바벨탑 쌓기</p>
            </div>
            <span className="text-xs font-bold text-blue-600">시작 →</span>
          </button>

          {/* 알림 등록 버튼 */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={handleEnablePush}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 text-white text-xs font-bold"
            >
              🔔 아침 말씀·퀴즈 알림 받기
            </button>
            {pushStatusMsg && (
              <p className="text-xs text-center text-slate-600 mt-1.5">{pushStatusMsg}</p>
            )}
          </div>

          {/* 하단 교회 홈페이지 · 유튜브 · 인스타 링크 */}
          <section className="bg-white rounded-2xl p-3.5 border border-slate-200/70">
            <div className="grid grid-cols-3 gap-2 text-center">
              {CHURCH_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-1"
                >
                  <span>{item.label}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              ))}
            </div>
          </section>

          <footer className="text-center text-xs text-slate-400 pt-1">
            한국기독교장로회 온양장로교회 청소년부
          </footer>
        </main>
      )}

      {/* ==================================================================== */}
      {/* 섬김이 전체보기                                                       */}
      {/* ==================================================================== */}
      {currentView === 'serving' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/70 space-y-1.5 text-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2">
              이번 주일 예배 섬김이 ({data.serving.currentWeekLabel})
            </h2>
            <p>대표기도: <strong>{data.serving.current.prayer}</strong></p>
            <p>성경봉독: <strong>{data.serving.current.scripture}</strong></p>
            <p>특송/찬양: <strong>{data.serving.current.specialSong}</strong></p>
            <p>안내/인사: <strong>{data.serving.current.welcome}</strong></p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/70 space-y-1.5 text-xs">
            <h3 className="text-sm font-bold text-blue-700 mb-2">다음 주일 예고</h3>
            <p>대표기도: <strong>{data.serving.next.prayer}</strong></p>
            <p>성경봉독: <strong>{data.serving.next.scripture}</strong></p>
            <p>특송/찬양: <strong>{data.serving.next.specialSong}</strong></p>
            <p>안내/인사: <strong>{data.serving.next.welcome}</strong></p>
          </div>
        </main>
      )}

      {/* ==================================================================== */}
      {/* 말씀 챌린지                                                          */}
      {/* ==================================================================== */}
      {currentView === 'challenge' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-3">
          <form onSubmit={handleAddChallenge} className="bg-white rounded-2xl p-4 border border-slate-200/70 space-y-2.5">
            <h2 className="text-sm font-bold text-slate-900">주중 말씀 복습 챌린지 등록</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value)}
                placeholder="예: 중2 김민준"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                등록
              </button>
            </div>
          </form>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/70">
            <h3 className="text-xs font-bold text-slate-700 mb-2">
              완료 친구들 ({data.challengeCompleted.length}명)
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {data.challengeCompleted.map((n, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-medium">
                  {n}
                </span>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ==================================================================== */}
      {/* 설교 말씀 퀴즈                                                       */}
      {/* ==================================================================== */}
      {currentView === 'quiz' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-3">
          <form onSubmit={handleSubmitQuiz} className="bg-white rounded-2xl p-4 border border-slate-200/70 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">지난 주일 설교 말씀 퀴즈</h2>
            {data.quizzes.map((q, qIdx) => (
              <div key={q.id} className="space-y-1.5 pb-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">Q{qIdx + 1}. {q.question}</p>
                {q.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => setSelectedAnswers((p) => ({ ...p, [qIdx]: oIdx }))}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs border ${
                      selectedAnswers[qIdx] === oIdx
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ))}
            <input
              type="text"
              value={quizCompleterName}
              onChange={(e) => setQuizCompleterName(e.target.value)}
              placeholder="학년과 이름 (예: 중3 이해온)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
            />
            <button type="submit" className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold">
              제출하기
            </button>
            {quizMessage && <p className="text-xs font-bold text-blue-700">{quizMessage}</p>}
          </form>
        </main>
      )}

      {/* ==================================================================== */}
      {/* 찬양 / 일정 / 사진첩                                                 */}
      {/* ==================================================================== */}
      {currentView === 'songs' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-2.5">
          {data.songs.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-3.5 border border-slate-200/70 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{s.title}</p>
                <p className="text-[11px] text-slate-500">{s.artist}</p>
              </div>
              <a href={s.youtubeUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-rose-600">
                듣기
              </a>
            </div>
          ))}
        </main>
      )}

      {currentView === 'schedule' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-2.5">
          {data.schedules.map((sc) => (
            <div key={sc.id} className="bg-white rounded-2xl p-3.5 border border-slate-200/70">
              <p className="text-[11px] font-bold text-emerald-700">{sc.date}</p>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{sc.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{sc.note}</p>
            </div>
          ))}
        </main>
      )}

      {currentView === 'photos' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-3">
          {activeAlbumId ? (() => {
            const album = data.albums.find((a) => a.id === activeAlbumId);
            if (!album) return null;
            return (
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAlbumId(null);
                      setActivePhotoIdx(0);
                    }}
                    className="text-xs font-bold text-slate-600"
                  >
                    ← 목록
                  </button>
                  <span className="text-xs text-slate-500">
                    {activePhotoIdx + 1} / {album.photos.length}
                  </span>
                </div>
                <div
                  data-album-swipe="true"
                  className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[4/3] select-none"
                >
                  <img
                    src={album.photos[activePhotoIdx] || album.photos[0]}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-bold text-slate-900">{album.title}</p>
              </div>
            );
          })() : (
            data.albums.map((alb) => (
              <button
                key={alb.id}
                type="button"
                onClick={() => {
                  setActiveAlbumId(alb.id);
                  setActivePhotoIdx(0);
                }}
                className="w-full bg-white rounded-2xl p-3 border border-slate-200/70 flex items-center gap-3 text-left"
              >
                <img src={alb.photos?.[0]} alt={alb.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">{alb.title}</p>
                  <p className="text-[11px] text-slate-500">{alb.date} · {alb.photos?.length || 0}장</p>
                </div>
              </button>
            ))
          )}
        </main>
      )}

      {currentView === 'games' && (
        <main className="max-w-md mx-auto px-4 pt-4">
          <MiniGamesView
            data={data}
            onSaveScore={(gKey, name, score) =>
              persistData((prev) => ({
                ...prev,
                gameRecords: {
                  ...prev.gameRecords,
                  [gKey]: [...(prev.gameRecords?.[gKey] || []), { name, score, date: getTodayISO() }],
                },
              }))
            }
          />
        </main>
      )}

      {/* ==================================================================== */}
      {/* 보안 페이지 (교사: 0852 / 임원·학생 콘텐츠 관리: 2468)                */}
      {/* ==================================================================== */}
      {currentView === 'admin' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-3">
          <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200/70 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> 보안 페이지
            </span>
            {authRole && (
              <button
                type="button"
                onClick={() => {
                  setAuthRole(null);
                  setAdminSubTab('dashboard');
                }}
                className="text-xs font-semibold text-slate-500 underline"
              >
                잠금
              </button>
            )}
          </div>

          {!authRole ? (
            <form onSubmit={handlePasscodeSubmit} className="bg-white rounded-2xl p-4 border border-slate-200/70 space-y-2.5">
              <p className="text-xs font-bold text-slate-800">비밀번호 입력</p>
              <input
                type="password"
                inputMode="numeric"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="4자리"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
              />
              {authError && <p className="text-xs text-rose-600 font-semibold">{authError}</p>}
              <button type="submit" className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
                확인
              </button>
            </form>
          ) : (
            <>
              <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/70">
                {authRole === 'teacher' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setAdminSubTab('dashboard')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                        adminSubTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600'
                      }`}
                    >
                      현황
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminSubTab('attendance')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                        adminSubTab === 'attendance' ? 'bg-slate-900 text-white' : 'text-slate-600'
                      }`}
                    >
                      출석체크
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminSubTab('students')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                        adminSubTab === 'students' ? 'bg-slate-900 text-white' : 'text-slate-600'
                      }`}
                    >
                      명단관리
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setAdminSubTab('content')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                    adminSubTab === 'content' ? 'bg-slate-900 text-white' : 'text-slate-600'
                  }`}
                >
                  콘텐츠관리
                </button>
              </div>

              {authRole === 'teacher' && adminSubTab === 'dashboard' && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200/70 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <p className="text-slate-500">전체 재적</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">{data.students.length}명</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50">
                    <p className="text-blue-700">퀴즈 완료</p>
                    <p className="text-base font-extrabold text-blue-900 mt-0.5">{data.quizCompletedNames.length}명</p>
                  </div>
                </div>
              )}

              {authRole === 'teacher' && adminSubTab === 'attendance' && (
                <div className="space-y-2.5">
                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">날짜</span>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-950 leading-relaxed">
                      총 출석(2부포함) {attendanceStats.totalAttended}명 · 출석 {attendanceStats.present}명 / 2부예배{' '}
                      {attendanceStats.second}명 / 결석 {attendanceStats.absent}명 / 장결자{' '}
                      {attendanceStats.longAbsent}명 / 전체 재적 {attendanceStats.totalEnrolled}명
                    </div>
                  </div>

                  {data.students.map((st) => {
                    const cur = (data.attendanceByDate?.[attendanceDate] || {})[st.id] || '';
                    return (
                      <div key={st.id} className="bg-white rounded-2xl p-3 border border-slate-200/70 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          <span className="text-blue-700 mr-1">{st.grade}</span>
                          {st.name}
                        </span>
                        <div className="flex gap-1">
                          {[
                            { k: 'present', l: '출석' },
                            { k: 'second', l: '2부예배' },
                            { k: 'absent', l: '결석' },
                            { k: 'long_absent', l: '장결자' },
                          ].map((b) => (
                            <button
                              key={b.k}
                              type="button"
                              onClick={() => setStudentAttendance(st.id, b.k)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${
                                cur === b.k
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {b.l}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {authRole === 'teacher' && adminSubTab === 'students' && (
                <div className="space-y-2.5">
                  <form onSubmit={handleSaveStudent} className="bg-white rounded-2xl p-3.5 border border-slate-200/70 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={studentForm.name}
                        onChange={(e) => setStudentForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="이름"
                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                      />
                      <select
                        value={studentForm.grade}
                        onChange={(e) => setStudentForm((f) => ({ ...f, grade: e.target.value }))}
                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        {['중1', '중2', '중3', '고1', '고2', '고3'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={studentForm.birthday}
                        onChange={(e) => setStudentForm((f) => ({ ...f, birthday: e.target.value }))}
                        placeholder="생일 (11.23)"
                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                      />
                      <input
                        type="text"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="연락처"
                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                    <button type="submit" className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                      {editingStudentId ? '수정 저장' : '학생 추가'}
                    </button>
                  </form>

                  {data.students.map((st) => (
                    <div key={st.id} className="bg-white rounded-2xl p-3 border border-slate-200/70 flex items-center justify-between">
                      <div className="text-xs">
                        <strong className="text-slate-900">{st.grade} {st.name}</strong>
                        <p className="text-[11px] text-slate-500">{st.birthday || '-'} · {st.phone || '-'}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStudentId(st.id);
                            setStudentForm({ name: st.name, grade: st.grade, birthday: st.birthday || '', phone: st.phone || '' });
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStudent(st.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {adminSubTab === 'content' && (
                <div className="space-y-3">
                  <form onSubmit={handlePublishQuizzes} className="bg-white rounded-2xl p-3.5 border border-slate-200/70 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900">퀴즈 출제</h3>
                      <button
                        type="button"
                        onClick={() => setDraftQuestions((p) => [...p, { question: '', options: ['', '', ''], answerIndex: 0 }])}
                        className="text-xs font-bold text-blue-600"
                      >
                        + 문제 추가하기
                      </button>
                    </div>
                    {draftQuestions.map((dq, qIdx) => (
                      <div key={qIdx} className="p-2.5 rounded-xl bg-slate-50 space-y-1.5">
                        <input
                          type="text"
                          value={dq.question}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraftQuestions((p) => p.map((item, i) => (i === qIdx ? { ...item, question: v } : item)));
                          }}
                          placeholder={`문제 ${qIdx + 1}`}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                        {dq.options.map((op, oIdx) => (
                          <input
                            key={oIdx}
                            type="text"
                            value={op}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDraftQuestions((p) =>
                                p.map((item, i) =>
                                  i === qIdx
                                    ? { ...item, options: item.options.map((o, j) => (j === oIdx ? v : o)) }
                                    : item
                                )
                              );
                            }}
                            placeholder={`보기 ${oIdx + 1}`}
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                          />
                        ))}
                        <select
                          value={dq.answerIndex}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setDraftQuestions((p) => p.map((item, i) => (i === qIdx ? { ...item, answerIndex: v } : item)));
                          }}
                          className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                        >
                          <option value={0}>정답: 보기 1</option>
                          <option value={1}>정답: 보기 2</option>
                          <option value={2}>정답: 보기 3</option>
                        </select>
                      </div>
                    ))}
                    <button type="submit" className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                      퀴즈 저장
                    </button>
                  </form>

                  <form onSubmit={handleCreateAlbum} className="bg-white rounded-2xl p-3.5 border border-slate-200/70 space-y-2">
                    <h3 className="text-xs font-bold text-slate-900">사진첩 등록</h3>
                    <input
                      type="text"
                      value={albumTitle}
                      onChange={(e) => setAlbumTitle(e.target.value)}
                      placeholder="앨범 제목"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                    />
                    <input
                      type="text"
                      value={albumDate}
                      onChange={(e) => setAlbumDate(e.target.value)}
                      placeholder="날짜"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                    />
                    <label className="block w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 text-center text-xs font-semibold text-slate-600 cursor-pointer">
                      사진 선택 ({albumPhotos.length}장)
                      <input type="file" accept="image/*" multiple onChange={handlePhotoFilesChange} className="hidden" />
                    </label>
                    <button type="submit" className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                      사진첩 업로드
                    </button>
                  </form>

                  <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 space-y-2">
                    <h3 className="text-xs font-bold text-slate-900">기존 사진첩 삭제</h3>
                    {data.albums.map((alb) => (
                      <div key={alb.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                        <span className="text-xs font-bold text-slate-800 truncate">{alb.title}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAlbum(alb.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold shrink-0"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      )}

      <style>{`
        @keyframes smoothTicker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-smooth-ticker {
          animation: smoothTicker 18s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
