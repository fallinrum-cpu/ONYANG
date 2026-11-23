import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
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
} from 'lucide-react';

// ============================================================================
// Firebase 설정 (환경변수 우선, 없으면 기존 구조 유지)
// ============================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'onyang-youth.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'onyang-youth',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'onyang-youth.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:000000000000',
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (err) {
  console.warn('Firebase 초기화 안내:', err);
}

// ============================================================================
// 상수 및 비밀번호 설정 (교사: 0852, 임원/학생 콘텐츠 관리: 2468)
// ============================================================================
const TEACHER_PASSCODE = '0852';
const OFFICER_PASSCODE = '2468';
const DB_DOC_PATH = ['onyangYouthApp', 'mainState'];

const VERSE_THEMES = [
  {
    name: '새벽 숲길',
    bg: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    overlay: 'rgba(15, 23, 42, 0.48)',
    accent: '#86efac',
  },
  {
    name: '잔잔한 호수',
    bg: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    overlay: 'rgba(15, 23, 42, 0.45)',
    accent: '#93c5fd',
  },
  {
    name: '노을빛 언덕',
    bg: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    overlay: 'rgba(24, 18, 15, 0.48)',
    accent: '#fcd34d',
  },
  {
    name: '안개 산등성',
    bg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    overlay: 'rgba(15, 23, 42, 0.50)',
    accent: '#cbd5e1',
  },
  {
    name: '햇살 들판',
    bg: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    overlay: 'rgba(20, 28, 22, 0.45)',
    accent: '#fde68a',
  },
  {
    name: '별빛 밤하늘',
    bg: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    overlay: 'rgba(10, 15, 30, 0.55)',
    accent: '#a5b4fc',
  },
  {
    name: '따뜻한 창가',
    bg: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
    overlay: 'rgba(25, 20, 15, 0.46)',
    accent: '#fdba74',
  },
];

const INITIAL_DATA = {
  mottoTitle: '함께 지어져 가는 청소년부',
  mottoVerse: '"그리스도 예수 안에서 함께 지어져 가느니라" (엡 2:22)',
  seasonBadge: '창조절',
  dailyVerse: {
    reference: '이사야 43:1',
    text: '너는 두려워하지 말라 내가 너를 구속하였고 내가 너를 지명하여 불렀나니 너는 내 것이라',
    reflection: '오늘 하루도 주님이 이름을 부르시며 지키시는 은혜 안에 머물기를 소망합니다.',
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
    { id: 's7', name: '박지훈', grade: '고1', birthday: '03.08', phone: '010-1000-0007' },
    { id: 's8', name: '김지후', grade: '고2', birthday: '09.21', phone: '010-1000-0008' },
  ],
  // status: 'present' | 'second' | 'absent' | 'long_absent'
  attendanceByDate: {
    '2026-11-22': {
      s1: 'present',
      s2: 'present',
      s3: 'second',
      s4: 'second',
      s5: 'present',
      s6: 'present',
      s7: 'absent',
      s8: 'long_absent',
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
    { id: 'm1', title: '주의 은혜라', artist: '아이자야 씩스티원', youtubeUrl: 'https://www.youtube.com/results?search_query=주의+은혜라+아이자야씩스티원' },
    { id: 'm2', title: '함께 지어져 가네', artist: '온양 청소년부 찬양', youtubeUrl: 'https://www.youtube.com/results?search_query=함께+지어져+가네+찬양' },
  ],
  schedules: [
    { id: 'sc1', date: '11.22 (주일)', title: '주일 1·2부 예배 및 분반 모임', note: '오전 9:30 / 11:15 본당 및 청소년부실' },
    { id: 'sc2', date: '11.29 (주일)', title: '대림절 첫째 주일 & 말씀 퀴즈 시상', note: '주중 말씀 챌린지 참여자 간식 나눔' },
  ],
  sermonGuide: {
    title: '주일 예배 순서 및 말씀 나눔',
    scripture: '이사야 43:1-7',
    prayerGuide: '시험과 진로, 관계 속에서 흔들리는 친구들이 주님의 부르심을 기억하게 하소서.',
  },
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

// ============================================================================
// 유틸리티: 오늘 날짜, 주간 섬김이 자동 이월, 말씀 의미 단위 줄바꿈
// ============================================================================
function getTodayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getLatestMondayISO() {
  const now = new Date();
  const day = now.getDay(); // 0: 일, 1: 월 ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function splitVerseIntoMeaningLines(text = '') {
  const clean = text.trim();
  if (!clean) return [];
  if (clean.length <= 18) return [clean];
  const words = clean.split(/\s+/);
  const lines = [];
  let current = '';
  for (const w of words) {
    const next = current ? `${current} ${w}` : w;
    if (next.length > 16 && current) {
      lines.push(current);
      current = w;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 5);
}

// ============================================================================
// 수면 파동 + 부드러운 디졸브 말씀카드 오버레이
// ============================================================================
function DailyVerseOverlay({ verse, onClose }) {
  const [themeIdx, setThemeIdx] = useState(() => new Date().getDate() % VERSE_THEMES.length);
  const [opening, setOpening] = useState(false);
  const [rippleOrigin, setRippleOrigin] = useState({ x: 50, y: 50 });
  const [pxOrigin, setPxOrigin] = useState({ x: 200, y: 400 });

  const theme = VERSE_THEMES[themeIdx];
  const lines = useMemo(() => splitVerseIntoMeaningLines(verse?.text), [verse?.text]);

  const handleOpenWithRipple = (e) => {
    if (opening) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? rect.width / 2;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? rect.height / 2;
    const xPx = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const yPx = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const xPct = ((xPx / rect.width) * 100).toFixed(1);
    const yPct = ((yPx / rect.height) * 100).toFixed(1);

    setPxOrigin({ x: xPx, y: yPx });
    setRippleOrigin({ x: Number(xPct), y: Number(yPct) });
    setOpening(true);

    setTimeout(() => {
      onClose();
    }, 1150);
  };

  const maskStyle = opening
    ? {
        WebkitMaskImage: `radial-gradient(circle at ${rippleOrigin.x}% ${rippleOrigin.y}%, transparent 0%, transparent 48%, rgba(0,0,0,0.35) 68%, rgba(0,0,0,0.85) 86%, black 100%)`,
        maskImage: `radial-gradient(circle at ${rippleOrigin.x}% ${rippleOrigin.y}%, transparent 0%, transparent 48%, rgba(0,0,0,0.35) 68%, rgba(0,0,0,0.85) 86%, black 100%)`,
        opacity: 0,
        transition: 'opacity 1.15s cubic-bezier(0.22, 1, 0.36, 1), -webkit-mask-image 1.15s ease-out, mask-image 1.15s ease-out',
      }
    : {
        opacity: 1,
        transition: 'opacity 0.5s ease',
      };

  return (
    <div
      onClick={handleOpenWithRipple}
      style={maskStyle}
      className="fixed inset-0 z-50 select-none cursor-pointer overflow-hidden flex flex-col justify-between p-6 text-white"
    >
      {/* 배경 이미지 (테두리 일그러짐 없이 순수 배경 레이어에만 적용) */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${theme.bg})` }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: theme.overlay }}
      />

      {/* 터치 지점에서 찰랑이며 퍼지는 수면 개방 파동 */}
      {opening && (
        <div
          className="pointer-events-none absolute rounded-full border border-white/40"
          style={{
            left: `${pxOrigin.x}px`,
            top: `${pxOrigin.y}px`,
            width: '24px',
            height: '24px',
            transform: 'translate(-50%, -50%) scale(1)',
            animation: 'waterOpenRipple 1.15s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        />
      )}

      {/* 상단 바 */}
      <div
        className="relative z-10 flex items-center justify-between pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs tracking-widest uppercase px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
          오늘의 말씀 · {theme.name}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setThemeIdx((prev) => (prev + 1) % VERSE_THEMES.length)}
            className="text-xs px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 transition"
          >
            배경 바꾸기
          </button>
          <button
            type="button"
            onClick={handleOpenWithRipple}
            className="text-xs px-3 py-1.5 rounded-full bg-white text-slate-900 font-semibold shadow"
          >
            홈으로
          </button>
        </div>
      </div>

      {/* 중앙 캘리그라피 말씀 영역 */}
      <div className="relative z-10 my-auto text-center px-2">
        <p
          className="text-sm font-semibold tracking-wider mb-5"
          style={{ color: theme.accent }}
        >
          {verse?.reference || '오늘의 말씀'}
        </p>
        <div
          className="space-y-2.5 text-2xl sm:text-3xl leading-relaxed drop-shadow-md"
          style={{ fontFamily: "'Gowun Batang', 'Noto Serif KR', serif", fontWeight: 700 }}
        >
          {lines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
        {verse?.reflection && (
          <p className="mt-7 max-w-md mx-auto text-sm text-white/85 leading-relaxed font-normal">
            {verse.reflection}
          </p>
        )}
      </div>

      {/* 하단 안내 */}
      <div className="relative z-10 text-center pb-4">
        <p className="text-xs text-white/75 tracking-wide">
          화면을 터치하면 그 자리에서 물결처럼 열립니다
        </p>
      </div>

      <style>{`
        @keyframes waterOpenRipple {
          0% {
            width: 24px;
            height: 24px;
            opacity: 0.85;
          }
          100% {
            width: 1500px;
            height: 1500px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// 미니게임 3종 (면류관 만들기 / 성령의 비둘기 / 바벨탑 쌓기)
// ============================================================================
function MiniGamesView({ data, onSaveScore }) {
  const [gameMode, setGameMode] = useState('menu'); // 'menu' | 'crown' | 'dove' | 'tower'
  const [playerName, setPlayerName] = useState('');

  // 1) 면류관 만들기
  const [crownScore, setCrownScore] = useState(0);
  const [crownItems, setCrownItems] = useState([]);
  const [crownOver, setCrownOver] = useState(false);

  // 2) 성령의 비둘기
  const [doveY, setDoveY] = useState(50);
  const [doveVel, setDoveVel] = useState(0);
  const [doveScore, setDoveScore] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [doveOver, setDoveOver] = useState(false);

  // 3) 바벨탑 쌓기
  const [blocks, setBlocks] = useState([{ width: 70, left: 15, color: '#60a5fa' }]);
  const [movingLeft, setMovingLeft] = useState(15);
  const [movingDir, setMovingDir] = useState(1);
  const [towerOver, setTowerOver] = useState(false);
  const lastDropRef = useRef(0);

  const startCrown = () => {
    setCrownScore(0);
    setCrownOver(false);
    setCrownItems([
      { id: 1, x: 25, y: 20, type: 'gem' },
      { id: 2, x: 65, y: 35, type: 'gem' },
      { id: 3, x: 45, y: 15, type: 'thorn' },
    ]);
    setGameMode('crown');
  };

  useEffect(() => {
    if (gameMode !== 'crown' || crownOver) return;
    const timer = setInterval(() => {
      setCrownItems((prev) => {
        const next = prev
          .map((item) => ({ ...item, y: item.y + 5.5 }))
          .filter((item) => item.y < 96);

        if (Math.random() < 0.45) {
          next.push({
            id: Date.now() + Math.random(),
            x: 12 + Math.random() * 76,
            y: 4,
            type: Math.random() < 0.28 ? 'thorn' : 'gem',
          });
        }
        // 위험선(88%) 도달 시 게임오버 판정
        const hitDanger = next.some((it) => it.y >= 88 && it.type === 'gem');
        if (hitDanger) {
          setCrownOver(true);
        }
        return next;
      });
    }, 180);
    return () => clearInterval(timer);
  }, [gameMode, crownOver]);

  const tapCrownItem = (item) => {
    if (crownOver) return;
    if (item.type === 'thorn') {
      setCrownOver(true);
      return;
    }
    setCrownScore((s) => s + 120);
    setCrownItems((prev) => prev.filter((it) => it.id !== item.id));
  };

  const startDove = () => {
    setDoveY(48);
    setDoveVel(0);
    setDoveScore(0);
    setDoveOver(false);
    setObstacles([{ id: Date.now(), x: 85, gapY: 45 }]);
    setGameMode('dove');
  };

  useEffect(() => {
    if (gameMode !== 'dove' || doveOver) return;
    const loop = setInterval(() => {
      setDoveVel((v) => v + 1.1);
      setDoveY((y) => {
        const ny = y + (doveVel * 0.45);
        if (ny < 4 || ny > 92) {
          setDoveOver(true);
        }
        return Math.max(2, Math.min(94, ny));
      });
      setObstacles((prev) => {
        let moved = prev
          .map((ob) => ({ ...ob, x: ob.x - 4 }))
          .filter((ob) => ob.x > -12);
        if (moved.length === 0 || moved[moved.length - 1].x < 55) {
          moved.push({
            id: Date.now() + Math.random(),
            x: 95,
            gapY: 24 + Math.random() * 50,
          });
        }
        moved.forEach((ob) => {
          if (ob.x > 16 && ob.x < 28) {
            if (Math.abs(doveY - ob.gapY) > 16) {
              setDoveOver(true);
            }
          }
        });
        return moved;
      });
      setDoveScore((sc) => sc + 10);
    }, 80);
    return () => clearInterval(loop);
  }, [gameMode, doveOver, doveVel, doveY]);

  const startTower = () => {
    setBlocks([{ width: 72, left: 14, color: '#60a5fa' }]);
    setMovingLeft(10);
    setMovingDir(1);
    setTowerOver(false);
    setGameMode('tower');
  };

  useEffect(() => {
    if (gameMode !== 'tower' || towerOver) return;
    const tick = setInterval(() => {
      const topBlock = blocks[blocks.length - 1];
      const maxLeft = 100 - topBlock.width;
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
    return () => clearInterval(tick);
  }, [gameMode, towerOver, blocks, movingDir]);

  const dropTowerBlock = () => {
    if (towerOver) return;
    // 더블 터치 오작동 방지 (180ms 쿨타임)
    const now = Date.now();
    if (now - lastDropRef.current < 180) return;
    lastDropRef.current = now;

    const prev = blocks[blocks.length - 1];
    const overlapLeft = Math.max(prev.left, movingLeft);
    const overlapRight = Math.min(prev.left + prev.width, movingLeft + prev.width);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 6) {
      setTowerOver(true);
      return;
    }

    const palette = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];
    setBlocks((b) => [
      ...b,
      {
        width: Number(overlapWidth.toFixed(1)),
        left: Number(overlapLeft.toFixed(1)),
        color: palette[b.length % palette.length],
      },
    ]);
    setMovingLeft(movingDir > 0 ? 0 : 100 - overlapWidth);
  };

  const currentScore =
    gameMode === 'crown' ? crownScore : gameMode === 'dove' ? doveScore : Math.max(0, blocks.length - 1);

  const handleRegisterRecord = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    onSaveScore(gameMode, playerName.trim(), currentScore);
    setPlayerName('');
    setGameMode('menu');
  };

  if (gameMode === 'menu') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-1">
            <Gamepad2 className="w-5 h-5 text-indigo-500" />
            기록 깨기 미니게임 3종
          </h2>
          <p className="text-xs text-slate-500">면류관 만들기 · 성령의 비둘기 · 바벨탑 쌓기</p>

          <div className="grid grid-cols-1 gap-2.5 mt-4">
            <button
              type="button"
              onClick={startCrown}
              className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition"
            >
              <div>
                <p className="font-bold text-sm text-amber-950">👑 면류관 만들기</p>
                <p className="text-xs text-amber-800/80">보석을 터치하고 가시를 피하세요 (위험선 주의)</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-amber-700">시작</span>
            </button>

            <button
              type="button"
              onClick={startDove}
              className="flex items-center justify-between p-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left transition"
            >
              <div>
                <p className="font-bold text-sm text-sky-950">🕊️ 성령의 비둘기</p>
                <p className="text-xs text-sky-800/80">화면을 탭해 비둘기를 띄워 장애물을 통과하세요</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-sky-700">시작</span>
            </button>

            <button
              type="button"
              onClick={startTower}
              className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition"
            >
              <div>
                <p className="font-bold text-sm text-emerald-950">🗼 바벨탑 쌓기</p>
                <p className="text-xs text-emerald-800/80">맞는 타이밍에 탭해 탑을 높이 쌓아보세요</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-emerald-700">시작</span>
            </button>
          </div>
        </div>

        {/* 명예의 전당 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-3">
            <Trophy className="w-4 h-4 text-amber-500" />
            명예의 전당 최고 기록
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { key: 'crown', label: '면류관', unit: '점' },
              { key: 'dove', label: '비둘기', unit: '점' },
              { key: 'tower', label: '바벨탑', unit: '층' },
            ].map((g) => {
              const top = [...(data.gameRecords?.[g.key] || [])].sort((a, b) => b.score - a.score)[0];
              return (
                <div key={g.key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-semibold text-slate-600">{g.label}</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">
                    {top ? `${top.score}${g.unit}` : '-'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{top?.name || '도전 대기'}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const isGameOver =
    (gameMode === 'crown' && crownOver) ||
    (gameMode === 'dove' && doveOver) ||
    (gameMode === 'tower' && towerOver);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setGameMode('menu')}
          className="text-xs font-semibold text-slate-600 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> 게임 목록
        </button>
        <span className="text-sm font-extrabold text-indigo-600">
          기록: {currentScore} {gameMode === 'tower' ? '층' : '점'}
        </span>
      </div>

      {gameMode === 'crown' && (
        <div className="relative h-80 rounded-xl bg-slate-900 overflow-hidden select-none">
          <div
            className="absolute inset-x-0 border-t border-dashed border-rose-400/70 text-[10px] text-rose-300 px-2"
            style={{ top: '88%' }}
          >
            위험선
          </div>
          {crownItems.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => tapCrownItem(it)}
              style={{ left: `${it.x}%`, top: `${it.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl p-1"
            >
              {it.type === 'gem' ? '💎' : '🌵'}
            </button>
          ))}
        </div>
      )}

      {gameMode === 'dove' && (
        <div
          onClick={() => !doveOver && setDoveVel(-8.5)}
          className="relative h-80 rounded-xl bg-sky-100 overflow-hidden select-none cursor-pointer"
        >
          <div
            style={{ top: `${doveY}%`, left: '22%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl transition-transform"
          >
            🕊️
          </div>
          {obstacles.map((ob) => (
            <React.Fragment key={ob.id}>
              <div
                style={{ left: `${ob.x}%`, top: 0, height: `${Math.max(0, ob.gapY - 16)}%` }}
                className="absolute w-8 -translate-x-1/2 bg-emerald-600/80 rounded-b-lg"
              />
              <div
                style={{
                  left: `${ob.x}%`,
                  top: `${Math.min(100, ob.gapY + 16)}%`,
                  bottom: 0,
                }}
                className="absolute w-8 -translate-x-1/2 bg-emerald-600/80 rounded-t-lg"
              />
            </React.Fragment>
          ))}
        </div>
      )}

      {gameMode === 'tower' && (
        <div
          onClick={dropTowerBlock}
          className="relative h-80 rounded-xl bg-slate-100 overflow-hidden select-none cursor-pointer flex flex-col justify-end p-2"
        >
          {!towerOver && (
            <div
              style={{
                left: `${movingLeft}%`,
                width: `${blocks[blocks.length - 1].width}%`,
                bottom: `${blocks.length * 22 + 8}px`,
                backgroundColor: blocks[blocks.length - 1].color,
              }}
              className="absolute h-5 rounded-md shadow-sm opacity-85"
            />
          )}
          {blocks.map((b, idx) => (
            <div
              key={idx}
              style={{
                left: `${b.left}%`,
                width: `${b.width}%`,
                bottom: `${idx * 22 + 8}px`,
                backgroundColor: b.color,
              }}
              className="absolute h-5 rounded-md shadow-sm"
            />
          ))}
        </div>
      )}

      {isGameOver && (
        <form onSubmit={handleRegisterRecord} className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2.5">
          <p className="text-sm font-bold text-indigo-950">
            게임 종료! 최종 기록: {currentScore} {gameMode === 'tower' ? '층' : '점'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="예: 중2 홍길동"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-indigo-200 bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold rounded-lg bg-indigo-600 text-white"
            >
              기록 등록
            </button>
          </div>
          <button
            type="button"
            onClick={gameMode === 'crown' ? startCrown : gameMode === 'dove' ? startDove : startTower}
            className="text-xs font-semibold text-indigo-700 underline"
          >
            다시 도전하기
          </button>
        </form>
      )}
    </div>
  );
}

// ============================================================================
// 메인 앱 컴포넌트
// ============================================================================
export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [hasLoadedRemote, setHasLoadedRemote] = useState(false);
  const [showVerseCard, setShowVerseCard] = useState(true);

  // 화면 네비게이션 스택 (첫 화면 'home', 앱 입장 잠금 없음)
  const [navStack, setNavStack] = useState(['home']);
  const currentView = navStack[navStack.length - 1];

  // 선생님 관리실 내부 탭 ('dashboard' | 'attendance' | 'students' | 'content')
  const [adminSubTab, setAdminSubTab] = useState('dashboard');

  // 인증 상태 (교사: 0852, 임원/학생 콘텐츠 관리: 2468)
  const [authRole, setAuthRole] = useState(null); // null | 'teacher' | 'officer'
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  // 출석 날짜 및 필터
  const [attendanceDate, setAttendanceDate] = useState(getTodayISO());

  // 학생 등록 / 수정 상태
  const [studentForm, setStudentForm] = useState({ name: '', grade: '중1', birthday: '', phone: '' });
  const [editingStudentId, setEditingStudentId] = useState(null);

  // 말씀 챌린지 입력
  const [challengeInput, setChallengeInput] = useState('');

  // 퀴즈 풀이 & 다중 문제 출제 상태
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleterName, setQuizCompleterName] = useState('');
  const [quizMessage, setQuizMessage] = useState('');
  const [draftQuestions, setDraftQuestions] = useState([
    { question: '', options: ['', '', ''], answerIndex: 0 },
  ]);

  // 사진첩 앨범 뷰어 & 다중 업로드 상태
  const [activeAlbumId, setActiveAlbumId] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDate, setAlbumDate] = useState(getTodayISO().replace(/-/g, '. '));
  const [albumPhotos, setAlbumPhotos] = useState([]);

  // 스와이프 제스처 추적
  const swipeRef = useRef({
    startX: 0,
    startY: 0,
    fromLeftEdge: false,
    isAlbumArea: false,
  });

  // --------------------------------------------------------------------------
  // Firebase 실시간 동기화 (데이터 자동 초기화 방지 보호)
  // --------------------------------------------------------------------------
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
      (err) => {
        console.warn('실시간 구독 오류(기존 데이터 보존):', err);
        setHasLoadedRemote(true);
      }
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

  // --------------------------------------------------------------------------
  // 매주 월요일 '다음 주일 예고' -> '이번 주일 예배 섬김이' 자동 승격
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!hasLoadedRemote) return;
    const latestMonday = getLatestMondayISO();
    setData((prev) => {
      const lastMon = prev.serving?.lastWeekMonday;
      if (!lastMon || lastMon >= latestMonday) return prev;
      const promoted = {
        ...prev,
        serving: {
          ...prev.serving,
          lastWeekMonday: latestMonday,
          currentWeekLabel: `${latestMonday.replace(/-/g, '. ')} 주일 예배`,
          current: { ...(prev.serving?.next || prev.serving?.current) },
        },
      };
      if (db) {
        setDoc(doc(db, ...DB_DOC_PATH), promoted, { merge: true }).catch(() => {});
      }
      return promoted;
    });
  }, [hasLoadedRemote]);

  // --------------------------------------------------------------------------
  // 네비게이션 & 뒤로 가기 (버튼 최소화 + 왼쪽 가장자리 우측 스와이프만 동작)
  // --------------------------------------------------------------------------
  const navigateTo = (view) => {
    setNavStack((prev) => {
      if (prev[prev.length - 1] === view) return prev;
      return [...prev, view];
    });
    if (view === 'admin') {
      setAdminSubTab('dashboard');
    }
  };

  const handleGoBack = () => {
    // 선생님 관리실 내부 하위 탭에 있으면 먼저 관리실 메인('dashboard')으로 복귀
    if (currentView === 'admin' && adminSubTab !== 'dashboard') {
      setAdminSubTab('dashboard');
      return;
    }
    setNavStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : ['home']));
  };

  // 갤럭시 기기 뒤로 가기 버튼 연동
  useEffect(() => {
    const onPopState = () => {
      handleGoBack();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  });

  const pushHistoryGuard = (target) => {
    try {
      window.history.pushState({ view: target }, '');
    } catch (_) {}
    navigateTo(target);
  };

  const onTouchStartRoot = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    const targetEl = e.target;
    const inAlbumSlider = Boolean(targetEl?.closest?.('[data-album-swipe="true"]'));
    swipeRef.current = {
      startX: t.clientX,
      startY: t.clientY,
      // 화면 왼쪽 끝(32px 이내)에서 시작할 때만 뒤로 가기 제스처 허용
      fromLeftEdge: t.clientX <= 32 && !inAlbumSlider,
      isAlbumArea: inAlbumSlider,
    };
  };

  const onTouchEndRoot = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - swipeRef.current.startX;
    const dy = t.clientY - swipeRef.current.startY;

    // 사진첩 영역 좌우 스와이프 처리
    if (swipeRef.current.isAlbumArea && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      const album = data.albums.find((a) => a.id === activeAlbumId);
      if (album && album.photos?.length > 1) {
        if (dx < 0) {
          setActivePhotoIdx((idx) => (idx + 1) % album.photos.length);
        } else {
          setActivePhotoIdx((idx) => (idx - 1 + album.photos.length) % album.photos.length);
        }
      }
      return;
    }

    // 왼쪽 가장자리 -> 오른쪽 스와이프만 뒤로 가기 (우측->좌측 스와이프는 홈으로 튕기지 않음)
    if (
      swipeRef.current.fromLeftEdge &&
      dx > 70 &&
      Math.abs(dx) > Math.abs(dy) * 1.4 &&
      currentView !== 'home'
    ) {
      handleGoBack();
    }
  };

  // --------------------------------------------------------------------------
  // 출석 집계 (출석 / 2부예배 / 결석 / 장결자 / 전체 재적)
  // --------------------------------------------------------------------------
  const attendanceStats = useMemo(() => {
    const map = data.attendanceByDate?.[attendanceDate] || {};
    let present = 0;
    let second = 0;
    let absent = 0;
    let longAbsent = 0;

    data.students.forEach((st) => {
      const val = map[st.id];
      if (val === 'present') present += 1;
      else if (val === 'second') second += 1;
      else if (val === 'absent') absent += 1;
      else if (val === 'long_absent') longAbsent += 1;
    });

    const totalAttended = present + second;
    return {
      totalAttended,
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

  // --------------------------------------------------------------------------
  // 학생 명단 추가 & 수정 & 삭제
  // --------------------------------------------------------------------------
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
      const newStudent = {
        id: `s_${Date.now()}`,
        name: studentForm.name.trim(),
        grade: studentForm.grade,
        birthday: studentForm.birthday.trim(),
        phone: studentForm.phone.trim(),
      };
      persistData((prev) => ({
        ...prev,
        students: [...prev.students, newStudent],
      }));
    }
    setStudentForm({ name: '', grade: '중1', birthday: '', phone: '' });
  };

  const startEditStudent = (st) => {
    setEditingStudentId(st.id);
    setStudentForm({
      name: st.name,
      grade: st.grade,
      birthday: st.birthday || '',
      phone: st.phone || '',
    });
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

  // --------------------------------------------------------------------------
  // 말씀 챌린지 완료 등록
  // --------------------------------------------------------------------------
  const handleAddChallenge = (e) => {
    e.preventDefault();
    const val = challengeInput.trim();
    if (!val) return;
    persistData((prev) => {
      if (prev.challengeCompleted.includes(val)) return prev;
      return {
        ...prev,
        challengeCompleted: [...prev.challengeCompleted, val],
      };
    });
    setChallengeInput('');
  };

  // --------------------------------------------------------------------------
  // 주간 설교 말씀 퀴즈 (다중 문제 출제 & 풀이)
  // --------------------------------------------------------------------------
  const addDraftQuestion = () => {
    setDraftQuestions((prev) => [...prev, { question: '', options: ['', '', ''], answerIndex: 0 }]);
  };

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
    if (valid.length === 0) return;
    persistData((prev) => ({
      ...prev,
      quizzes: valid,
      quizCompletedNames: [],
    }));
    setSelectedAnswers({});
    setDraftQuestions([{ question: '', options: ['', '', ''], answerIndex: 0 }]);
    setQuizMessage(`${valid.length}개 문제가 출제되었습니다!`);
  };

  const handleSubmitQuiz = (e) => {
    e.preventDefault();
    if (!quizCompleterName.trim()) {
      setQuizMessage('이름을 입력해 주세요.');
      return;
    }
    const allCorrect = data.quizzes.every((q, idx) => selectedAnswers[idx] === q.answerIndex);
    if (!allCorrect) {
      setQuizMessage('아직 틀린 문제가 있어요. 다시 확인해 보세요!');
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
    setQuizMessage('정답입니다! 퀴즈 완료 명단에 등록되었어요 🎉');
  };

  // --------------------------------------------------------------------------
  // 활동 사진첩 (다중 사진 선택 업로드 & 삭제)
  // --------------------------------------------------------------------------
  const handlePhotoFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
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
    const newAlbum = {
      id: `alb_${Date.now()}`,
      title: albumTitle.trim(),
      date: albumDate.trim() || getTodayISO().replace(/-/g, '. '),
      photos: albumPhotos,
    };
    persistData((prev) => ({
      ...prev,
      albums: [newAlbum, ...prev.albums],
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

  // --------------------------------------------------------------------------
  // 비밀번호 인증 (교사: 0852 / 임원·학생 콘텐츠 관리: 2468)
  // --------------------------------------------------------------------------
  const handleLoginSubmit = (e) => {
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
      setAuthError('비밀번호를 다시 확인해 주세요.');
    }
  };

  // 11월 생일자
  const novemberBirthdays = useMemo(
    () => data.students.filter((s) => (s.birthday || '').startsWith('11.')),
    [data.students]
  );

  // 슬라이드용 복제 배열 (끊김 없는 무한 루프)
  const marqueeList = useMemo(() => {
    const base = data.challengeCompleted.length ? data.challengeCompleted : ['말씀 챌린지에 도전해 보세요'];
    return [...base, ...base];
  }, [data.challengeCompleted]);

  return (
    <div
      onTouchStart={onTouchStartRoot}
      onTouchEnd={onTouchEndRoot}
      className="min-h-screen bg-slate-50 text-slate-900 pb-12"
    >
      {/* 말씀카드 수면 파동 오버레이 */}
      {showVerseCard && (
        <DailyVerseOverlay
          verse={data.dailyVerse}
          onClose={() => setShowVerseCard(false)}
        />
      )}

      {/* 상단 최소형 헤더 (홈이 아닐 때는 깔끔한 '<' 아이콘만 배치) */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentView !== 'home' ? (
            <button
              type="button"
              onClick={handleGoBack}
              aria-label="뒤로 가기"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <span className="text-xs font-semibold text-slate-500">
              온양 청소년부에 오신 걸 환영합니다
            </span>
          )}
          {currentView !== 'home' && (
            <span className="text-sm font-bold text-slate-800">온양이</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowVerseCard(true)}
            className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
          >
            ☀️ 오늘의 말씀
          </button>
          {currentView === 'home' && (
            <button
              type="button"
              onClick={() => pushHistoryGuard('admin')}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700"
            >
              관리
            </button>
          )}
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 1. 홈 화면                                                            */}
      {/* ==================================================================== */}
      {currentView === 'home' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
          {/* 표어 카드 */}
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-700">2026 청소년부 표어</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {data.seasonBadge}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-snug">
              {data.mottoTitle}
            </h1>
            <p className="text-xs text-slate-600 mt-1">{data.mottoVerse}</p>
          </section>

          {/* 이번 주일 예배 섬김이 */}
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                이번 주일 예배 섬김이
              </h2>
              <button
                type="button"
                onClick={() => pushHistoryGuard('serving')}
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

          {/* 11월 생일 축하 */}
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-800">
                🎂 11월 생일을 진심으로 축하합니다!
              </h2>
              <span className="text-xs font-bold text-pink-600">총 {novemberBirthdays.length}명</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {novemberBirthdays.map((b) => (
                <span
                  key={b.id}
                  className="text-xs px-2.5 py-1 rounded-full bg-pink-50 text-pink-800 font-medium"
                >
                  {b.grade} {b.name} ({b.birthday})
                </span>
              ))}
            </div>
          </section>

          {/* 주중 말씀 복습 챌린지 (끊김 없는 슬라이드) */}
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                주중 말씀 복습 챌린지
              </h2>
              <button
                type="button"
                onClick={() => pushHistoryGuard('challenge')}
                className="text-xs font-bold text-indigo-600"
              >
                참여하기 →
              </button>
            </div>
            <div className="relative overflow-hidden py-1.5 bg-slate-50 rounded-xl">
              <div className="flex w-max animate-marquee-smooth">
                {marqueeList.map((name, i) => (
                  <span
                    key={i}
                    className="mx-3 text-xs font-semibold text-slate-700 whitespace-nowrap"
                  >
                    ✨ {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* 지난 주일 설교 말씀 퀴즈 */}
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">지난 주일 설교 말씀 퀴즈</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  완료 친구들 ({data.quizCompletedNames.length}명):{' '}
                  {data.quizCompletedNames.join(', ') || '아직 없어요'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => pushHistoryGuard('quiz')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                도전하기 →
              </button>
            </div>
          </section>

          {/* 주요 메뉴 그리드 */}
          <section className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => pushHistoryGuard('songs')}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 text-left hover:border-indigo-200 transition"
            >
              <Music className="w-5 h-5 text-indigo-500 mb-2" />
              <p className="text-xs font-bold text-slate-800">이번 달 찬양</p>
              <p className="text-[11px] text-slate-500 mt-0.5">곡 리스트 & 듣기</p>
            </button>

            <button
              type="button"
              onClick={() => pushHistoryGuard('schedule')}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 text-left hover:border-indigo-200 transition"
            >
              <Calendar className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-xs font-bold text-slate-800">예배 및 행사</p>
              <p className="text-[11px] text-slate-500 mt-0.5">주차별 일정 안내</p>
            </button>

            <button
              type="button"
              onClick={() => pushHistoryGuard('photos')}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 text-left hover:border-indigo-200 transition"
            >
              <Camera className="w-5 h-5 text-rose-500 mb-2" />
              <p className="text-xs font-bold text-slate-800">활동 사진첩</p>
              <p className="text-[11px] text-slate-500 mt-0.5">은혜의 순간들</p>
            </button>
          </section>

          {/* 미니게임 진입 배너 */}
          <button
            type="button"
            onClick={() => pushHistoryGuard('games')}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between text-left"
          >
            <div>
              <p className="text-sm font-extrabold flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4" /> 기록 깨기 미니게임 3종!
              </p>
              <p className="text-xs text-white/85 mt-0.5">
                면류관 · 성령의 비둘기 · 바벨탑 쌓기
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/20">
              게임하기 →
            </span>
          </button>

          <footer className="text-center text-xs text-slate-400 pt-2">
            한국기독교장로회 온양장로교회 청소년부 ♡
          </footer>
        </main>
      )}

      {/* ==================================================================== */}
      {/* 2. 섬김이 전체보기                                                   */}
      {/* ==================================================================== */}
      {currentView === 'serving' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2">
            <h2 className="text-base font-bold text-slate-800">
              이번 주일 예배 섬김이 ({data.serving.currentWeekLabel})
            </h2>
            <p className="text-xs text-slate-600">대표기도: <strong>{data.serving.current.prayer}</strong></p>
            <p className="text-xs text-slate-600">성경봉독: <strong>{data.serving.current.scripture}</strong></p>
            <p className="text-xs text-slate-600">특송/찬양: <strong>{data.serving.current.specialSong}</strong></p>
            <p className="text-xs text-slate-600">안내/인사: <strong>{data.serving.current.welcome}</strong></p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2">
            <h3 className="text-sm font-bold text-indigo-700">다음 주일 예고 (매주 월요일 자동 이월)</h3>
            <p className="text-xs text-slate-600">대표기도: <strong>{data.serving.next.prayer}</strong></p>
            <p className="text-xs text-slate-600">성경봉독: <strong>{data.serving.next.scripture}</strong></p>
            <p className="text-xs text-slate-600">특송/찬양: <strong>{data.serving.next.specialSong}</strong></p>
            <p className="text-xs text-slate-600">안내/인사: <strong>{data.serving.next.welcome}</strong></p>
          </div>
        </main>
      )}

      {/* ==================================================================== */}
      {/* 3. 말씀 챌린지                                                       */}
      {/* ==================================================================== */}
      {currentView === 'challenge' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
          <form onSubmit={handleAddChallenge} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <h2 className="text-base font-bold text-slate-800">주중 말씀 복습 챌린지 인증</h2>
            <p className="text-xs text-slate-500">말씀 암송·묵상을 마친 뒤 학년과 이름을 남겨 주세요.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value)}
                placeholder="예: 중2 김민준"
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200"
              />
              <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                등록
              </button>
            </div>
          </form>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-2">
              완료 친구들 ({data.challengeCompleted.length}명)
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {data.challengeCompleted.map((item, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 font-medium">
                  ✨ {item}
                </span>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ==================================================================== */}
      {/* 4. 설교 말씀 퀴즈                                                    */}
      {/* ==================================================================== */}
      {currentView === 'quiz' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
          <form onSubmit={handleSubmitQuiz} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-800">지난 주일 설교 말씀 퀴즈</h2>

            {data.quizzes.map((q, qIdx) => (
              <div key={q.id} className="space-y-2 border-b border-slate-100 pb-3">
                <p className="text-sm font-bold text-slate-800">
                  Q{qIdx + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition ${
                        selectedAnswers[qIdx] === oIdx
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <input
                type="text"
                value={quizCompleterName}
                onChange={(e) => setQuizCompleterName(e.target.value)}
                placeholder="학년과 이름 (예: 중3 이해온)"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
              />
              <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold">
                정답 제출하기
              </button>
            </div>

            {quizMessage && (
              <p className="text-xs font-semibold text-indigo-700 bg-indigo-50 p-2.5 rounded-xl">
                {quizMessage}
              </p>
            )}
          </form>
        </main>
      )}

      {/* ==================================================================== */}
      {/* 5. 찬양 / 일정 / 활동 사진첩 (좌우 스와이프 지원)                    */}
      {/* ==================================================================== */}
      {currentView === 'songs' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-3">
          <h2 className="text-base font-bold text-slate-800 px-1">이번 달 찬양 리스트</h2>
          {data.songs.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">{s.title}</p>
                <p className="text-xs text-slate-500">{s.artist}</p>
              </div>
              <a
                href={s.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600"
              >
                유튜브 듣기
              </a>
            </div>
          ))}
        </main>
      )}

      {currentView === 'schedule' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-3">
          <h2 className="text-base font-bold text-slate-800 px-1">예배 및 행사 안내</h2>
          {data.schedules.map((sc) => (
            <div key={sc.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <span className="text-xs font-bold text-emerald-700">{sc.date}</span>
              <h3 className="text-sm font-bold text-slate-800 mt-0.5">{sc.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{sc.note}</p>
            </div>
          ))}
        </main>
      )}

      {currentView === 'photos' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
          <h2 className="text-base font-bold text-slate-800 px-1">활동 사진첩</h2>

          {activeAlbumId ? (() => {
            const album = data.albums.find((a) => a.id === activeAlbumId);
            if (!album) return null;
            const photoUrl = album.photos[activePhotoIdx] || album.photos[0];
            return (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAlbumId(null);
                      setActivePhotoIdx(0);
                    }}
                    className="text-xs font-bold text-slate-600 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> 앨범 목록
                  </button>
                  <span className="text-xs font-semibold text-slate-500">
                    {activePhotoIdx + 1} / {album.photos.length}
                  </span>
                </div>

                {/* 좌우 스와이프 전용 사진 영역 */}
                <div
                  data-album-swipe="true"
                  className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[4/3] select-none"
                >
                  <img
                    src={photoUrl}
                    alt={`${album.title} ${activePhotoIdx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {album.photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePhotoIdx((i) => (i - 1 + album.photos.length) % album.photos.length)
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhotoIdx((i) => (i + 1) % album.photos.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">{album.title}</p>
                  <p className="text-xs text-slate-400">
                    {album.date} · 좌우로 쓸어넘겨 사진을 넘길 수 있습니다
                  </p>
                </div>
              </div>
            );
          })() : (
            <div className="space-y-3">
              {data.albums.map((alb) => (
                <button
                  key={alb.id}
                  type="button"
                  onClick={() => {
                    setActiveAlbumId(alb.id);
                    setActivePhotoIdx(0);
                  }}
                  className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center gap-3.5 text-left"
                >
                  <img
                    src={alb.photos?.[0]}
                    alt={alb.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{alb.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{alb.date}</p>
                    <p className="text-[11px] font-semibold text-indigo-600 mt-1">
                      사진 {alb.photos?.length || 0}장 보기 →
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ==================================================================== */}
      {/* 6. 미니게임 3종                                                       */}
      {/* ==================================================================== */}
      {currentView === 'games' && (
        <main className="max-w-md mx-auto px-4 pt-4">
          <MiniGamesView
            data={data}
            onSaveScore={(gameKey, name, score) => {
              persistData((prev) => ({
                ...prev,
                gameRecords: {
                  ...prev.gameRecords,
                  [gameKey]: [
                    ...(prev.gameRecords?.[gameKey] || []),
                    { name, score, date: getTodayISO() },
                  ],
                },
              }));
            }}
          />
        </main>
      )}

      {/* ==================================================================== */}
      {/* 7. 보안 페이지 (교사: 0852 / 임원·학생 콘텐츠 관리: 2468)             */}
      {/* ==================================================================== */}
      {currentView === 'admin' && (
        <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
          {/* 상단 보안 페이지 배지 */}
          <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-slate-800">보안 페이지</span>
            </div>
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
            <form
              onSubmit={handleLoginSubmit}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3"
            >
              <div className="flex items-center gap-2 text-slate-800">
                <Lock className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold">관리자 / 임원 인증</h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                교사용 비밀번호 또는 임원 콘텐츠 관리 비밀번호를 입력해 주세요.
              </p>
              <input
                type="password"
                inputMode="numeric"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="비밀번호 4자리"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm tracking-widest"
              />
              {authError && <p className="text-xs text-rose-600 font-semibold">{authError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold"
              >
                확인
              </button>
            </form>
          ) : (
            <>
              {/* 역할별 탭 */}
              <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                {authRole === 'teacher' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setAdminSubTab('dashboard')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                        adminSubTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600'
                      }`}
                    >
                      현황
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminSubTab('attendance')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                        adminSubTab === 'attendance' ? 'bg-slate-900 text-white' : 'text-slate-600'
                      }`}
                    >
                      출석체크
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminSubTab('students')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold ${
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
                  className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                    adminSubTab === 'content' ? 'bg-slate-900 text-white' : 'text-slate-600'
                  }`}
                >
                  콘텐츠관리
                </button>
              </div>

              {/* A. 교사 현황 */}
              {authRole === 'teacher' && adminSubTab === 'dashboard' && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                  <h3 className="text-sm font-bold text-slate-800">베타테스트 운영 요약</h3>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50">
                      <p className="text-slate-500">전체 재적</p>
                      <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                        {data.students.length}명
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50">
                      <p className="text-indigo-700">퀴즈 완료</p>
                      <p className="text-lg font-extrabold text-indigo-900 mt-0.5">
                        {data.quizCompletedNames.length}명
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* B. 출석체크 (출석 / 2부예배 / 결석 / 장결자 + 실시간 합계) */}
              {authRole === 'teacher' && adminSubTab === 'attendance' && (
                <div className="space-y-3">
                  <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">출석 날짜</span>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200"
                      />
                    </div>

                    {/* 당일 총 출석 인원 실시간 합계 (장결자 포함) */}
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-bold leading-relaxed">
                      총 출석(2부포함) {attendanceStats.totalAttended}명 · 출석 {attendanceStats.present}명 / 2부예배{' '}
                      {attendanceStats.second}명 / 결석 {attendanceStats.absent}명 / 장결자{' '}
                      {attendanceStats.longAbsent}명 / 전체 재적 {attendanceStats.totalEnrolled}명
                    </div>
                  </div>

                  <div className="space-y-2">
                    {data.students.map((st) => {
                      const curStatus = (data.attendanceByDate?.[attendanceDate] || {})[st.id] || '';
                      return (
                        <div
                          key={st.id}
                          className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="text-xs font-bold text-indigo-700 mr-1.5">{st.grade}</span>
                            <span className="text-sm font-bold text-slate-800">{st.name}</span>
                          </div>
                          <div className="flex gap-1">
                            {[
                              { key: 'present', label: '출석' },
                              { key: 'second', label: '2부예배' },
                              { key: 'absent', label: '결석' },
                              { key: 'long_absent', label: '장결자' },
                            ].map((btn) => (
                              <button
                                key={btn.key}
                                type="button"
                                onClick={() => setStudentAttendance(st.id, btn.key)}
                                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                                  curStatus === btn.key
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* C. 학생 명단 관리 (추가 & 수정 & 삭제) */}
              {authRole === 'teacher' && adminSubTab === 'students' && (
                <div className="space-y-3">
                  <form
                    onSubmit={handleSaveStudent}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2.5"
                  >
                    <h3 className="text-sm font-bold text-slate-800">
                      {editingStudentId ? '학생 정보 수정' : '새 학생 등록'}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={studentForm.name}
                        onChange={(e) => setStudentForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="이름"
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200"
                      />
                      <select
                        value={studentForm.grade}
                        onChange={(e) => setStudentForm((f) => ({ ...f, grade: e.target.value }))}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                      >
                        {['중1', '중2', '중3', '고1', '고2', '고3'].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={studentForm.birthday}
                        onChange={(e) => setStudentForm((f) => ({ ...f, birthday: e.target.value }))}
                        placeholder="생일 (예: 11.23)"
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200"
                      />
                      <input
                        type="text"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="연락처"
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                      >
                        {editingStudentId ? '수정 저장' : '학생 추가'}
                      </button>
                      {editingStudentId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStudentId(null);
                            setStudentForm({ name: '', grade: '중1', birthday: '', phone: '' });
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                        >
                          취소
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="space-y-2">
                    {data.students.map((st) => (
                      <div
                        key={st.id}
                        className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            <span className="text-indigo-700 mr-1">{st.grade}</span>
                            {st.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            생일 {st.birthday || '-'} · {st.phone || '-'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditStudent(st)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700"
                            aria-label="수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteStudent(st.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600"
                            aria-label="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* D. 콘텐츠 관리 (다중 퀴즈 출제 + 사진첩 다중 업로드 및 삭제) */}
              {adminSubTab === 'content' && (
                <div className="space-y-4">
                  {/* 다중 문제 퀴즈 출제 */}
                  <form
                    onSubmit={handlePublishQuizzes}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800">주간 설교 말씀 퀴즈 출제</h3>
                      <button
                        type="button"
                        onClick={addDraftQuestion}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> 문제 추가하기
                      </button>
                    </div>

                    {draftQuestions.map((dq, qIdx) => (
                      <div key={qIdx} className="p-3 rounded-xl bg-slate-50 space-y-2 border border-slate-200/70">
                        <input
                          type="text"
                          value={dq.question}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraftQuestions((prev) =>
                              prev.map((item, i) => (i === qIdx ? { ...item, question: val } : item))
                            );
                          }}
                          placeholder={`문제 ${qIdx + 1} 질문 입력`}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                        {dq.options.map((op, oIdx) => (
                          <input
                            key={oIdx}
                            type="text"
                            value={op}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraftQuestions((prev) =>
                                prev.map((item, i) => {
                                  if (i !== qIdx) return item;
                                  const nextOpts = item.options.map((o, j) => (j === oIdx ? val : o));
                                  return { ...item, options: nextOpts };
                                })
                              );
                            }}
                            placeholder={`보기 ${oIdx + 1}`}
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        ))}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-600 font-semibold">정답 번호:</span>
                          <select
                            value={dq.answerIndex}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setDraftQuestions((prev) =>
                                prev.map((item, i) => (i === qIdx ? { ...item, answerIndex: val } : item))
                              );
                            }}
                            className="px-2 py-1 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value={0}>보기 1</option>
                            <option value={1}>보기 2</option>
                            <option value={2}>보기 3</option>
                          </select>
                        </div>
                      </div>
                    ))}

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      퀴즈 출제 저장
                    </button>
                  </form>

                  {/* 활동 사진첩 등록 & 삭제 */}
                  <form
                    onSubmit={handleCreateAlbum}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3"
                  >
                    <h3 className="text-sm font-bold text-slate-800">활동 사진첩 등록</h3>
                    <input
                      type="text"
                      value={albumTitle}
                      onChange={(e) => setAlbumTitle(e.target.value)}
                      placeholder="앨범 제목 (예: 주일 분반 모임)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                    <input
                      type="text"
                      value={albumDate}
                      onChange={(e) => setAlbumDate(e.target.value)}
                      placeholder="날짜 (예: 2026. 11. 22)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    />
                    <label className="block w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 text-center text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-50">
                      사진 여러 장 선택 ({albumPhotos.length}장 선택됨)
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoFilesChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                    >
                      사진첩 업로드
                    </button>
                  </form>

                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2.5">
                    <h3 className="text-sm font-bold text-slate-800">기존 사진첩 관리</h3>
                    {data.albums.length === 0 ? (
                      <p className="text-xs text-slate-400">등록된 사진첩이 없습니다.</p>
                    ) : (
                      data.albums.map((alb) => (
                        <div
                          key={alb.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-800 truncate">{alb.title}</p>
                            <p className="text-[11px] text-slate-500">
                              {alb.date} · 사진 {alb.photos?.length || 0}장
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAlbum(alb.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> 삭제
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      )}

      <style>{`
        @keyframes marqueeSmooth {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee-smooth {
          animation: marqueeSmooth 18s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
