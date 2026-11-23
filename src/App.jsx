import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import {
  Music, Calendar, BookOpen, Image as ImageIcon, Heart, Youtube, Instagram,
  ChevronRight, ChevronLeft, X, CheckCircle2, XCircle, Lock,
  Sun, UserPlus, Trash2, Edit3, BarChart3, AlertTriangle,
  Download, Award, Send, Camera, Phone, Cake, Globe, Loader2, Settings,
  Gamepad2, Trophy, RotateCcw, Clock, ShieldCheck, Users, Gift, Play, Plus, Check,
  Bell
} from 'lucide-react';
import { requestAndSaveFcmToken, listenForegroundMessages } from './fcm';

// ==========================================
// 1. 온양장로교회 & 클라우드 연동 설정
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyD3P1V9bvJq9Q2WZRL6EdwLuepn2EdoLG0",
  authDomain: "onyang-ea7b1.firebaseapp.com",
  projectId: "onyang-ea7b1",
  storageBucket: "onyang-ea7b1.firebasestorage.app",
  messagingSenderId: "789635766409",
  appId: "1:789635766409:web:fc1570c88716463ac7ce58",
  measurementId: "G-6F5QVQ18EG"
};

const CLOUDINARY_CLOUD_NAME = "epaiyax7";
const CLOUDINARY_UPLOAD_PRESET = "pfcnsjfr";

const CHURCH_LINKS = {
  homepage: "https://www.oych.org/",
  youtube: "https://www.youtube.com/@oychurch",
  instagram: "https://www.instagram.com/do_bbyyyyyyyyy?exln=N2hwc2FjZ2NsYjI4",
  adminPin: "0852",    // 교사 · 목사님 전용
  praisePin: "2222",   // 찬양팀 학생 전용
  officerPin: "2468"   // 학생 임원 전용
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PUBLIC_DOC_REF = doc(db, "onyang_youth", "main_data");
const PRIVATE_DOC_REF = doc(db, "onyang_youth", "private_admin_data");

const CLASS_DISPLAY_ORDER = ['m1', 'h1', 'm2', 'h2', 'm3', 'h3'];
const CLASS_SEQUENTIAL_ORDER = ['m1', 'm2', 'm3', 'h1', 'h2', 'h3'];

// ==========================================
// 2. 교회력 6대 절기
// ==========================================
const SEASONS = {
  creation: {
    name: '창조절',
    bannerGradient: 'from-emerald-600 via-teal-600 to-green-700',
    pageBg: 'from-emerald-50/90 via-teal-50/40 to-slate-50',
    outerBg: 'bg-emerald-50/50',
    badgeBg: 'bg-emerald-950/30 text-emerald-50 border-emerald-200/40',
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-600',
    effect: null
  },
  advent: {
    name: '대림절',
    bannerGradient: 'from-purple-700 via-indigo-700 to-violet-800',
    pageBg: 'from-purple-100/80 via-indigo-50/50 to-slate-50',
    outerBg: 'bg-purple-50/60',
    badgeBg: 'bg-purple-950/30 text-purple-100 border-purple-200/40',
    accentText: 'text-purple-700',
    accentBg: 'bg-purple-700',
    effect: 'snow'
  },
  christmas: {
    name: '성탄절',
    bannerGradient: 'from-rose-600 via-red-600 to-red-700',
    pageBg: 'from-rose-100/85 via-red-50/55 to-amber-50/40',
    outerBg: 'bg-rose-50/60',
    badgeBg: 'bg-red-950/35 text-rose-50 border-amber-200/50',
    accentText: 'text-red-600',
    accentBg: 'bg-red-600',
    effect: 'snow'
  },
  epiphany: {
    name: '주현절',
    bannerGradient: 'from-teal-600 via-cyan-600 to-sky-700',
    pageBg: 'from-teal-50/90 via-cyan-50/40 to-slate-50',
    outerBg: 'bg-teal-50/50',
    badgeBg: 'bg-teal-950/30 text-teal-50 border-teal-200/40',
    accentText: 'text-teal-700',
    accentBg: 'bg-teal-600',
    effect: null
  },
  lent: {
    name: '사순절',
    bannerGradient: 'from-fuchsia-800 via-purple-800 to-slate-800',
    pageBg: 'from-fuchsia-50/80 via-purple-50/40 to-slate-50',
    outerBg: 'bg-fuchsia-50/40',
    badgeBg: 'bg-fuchsia-950/35 text-fuchsia-100 border-fuchsia-200/40',
    accentText: 'text-fuchsia-800',
    accentBg: 'bg-fuchsia-800',
    effect: null
  },
  pentecost: {
    name: '성령강림절',
    bannerGradient: 'from-orange-600 via-red-600 to-rose-700',
    pageBg: 'from-orange-50/90 via-rose-50/40 to-slate-50',
    outerBg: 'bg-orange-50/50',
    badgeBg: 'bg-orange-950/30 text-orange-50 border-orange-200/40',
    accentText: 'text-orange-700',
    accentBg: 'bg-orange-600',
    effect: 'dove'
  }
};

// ==========================================
// 3. 매일 바뀌는 감성 자연 풍경 7종 & 한국어 성경 구절 줄바꿈 헬퍼
// ==========================================
const VERSE_CARD_BACKGROUNDS = [
  {
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    grad: 'linear-gradient(180deg, #1e3a5f 0%, #4a7c9b 100%)'
  },
  {
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
    grad: 'linear-gradient(180deg, #143d29 0%, #2d6a4f 100%)'
  },
  {
    img: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=900&q=80',
    grad: 'linear-gradient(180deg, #164e63 0%, #0e7490 100%)'
  },
  {
    img: 'https://images.unsplash.com/photo-1507502707541-f369a3b18502?auto=format&fit=crop&w=900&q=80',
    grad: 'linear-gradient(180deg, #7c2d12 0%, #b45309 100%)'
  },
  {
    img: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=900&q=80',
    grad: 'linear-gradient(180deg, #0f172a 0%, #312e81 100%)'
  },
  {
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    grad: 'linear-gradient(180deg, #1e293b 0%, #475569 100%)'
  },
  {
    img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    grad: 'linear-gradient(180deg, #3f6212 0%, #65a30d 100%)'
  }
];

function formatKoreanVerseLines(rawText) {
  const cleaned = (rawText || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  if (rawText.includes('\n')) {
    return rawText.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  const words = cleaned.split(' ');
  const totalLen = cleaned.length;

  let targetLines = 3;
  if (totalLen <= 26) targetLines = 2;
  else if (totalLen <= 56) targetLines = 3;
  else targetLines = 4;

  if (words.length <= targetLines) return words;

  const clauseEndRegex = /(위하여|하리라|되리라|있으리라|하노라|이니라|함이니라|것이라|것이요|말지어다|하시고|주시리라|없으리로다|가느니라|받으라|행하라|사랑하라|지키라|기뻐하라|감사하라|기도하라|믿으라|오라|살리라|이루리라|지으셨으니|주셨으니|얻게|하도록|함이라|됨이라|지로다|리로다|도다|고|며|니|면|서|로|에|의|은|는|이|가|을|를)[,.]?$/;

  const idealLineLen = totalLen / targetLines;
  const lines = [];
  let currentWords = [];
  let currentLen = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const remainingWords = words.length - i;
    const remainingLines = targetLines - lines.length;

    currentWords.push(w);
    currentLen += (currentWords.length > 1 ? 1 : 0) + w.length;

    if (remainingLines <= 1) continue;

    if (remainingWords - 1 <= remainingLines - 1) {
      lines.push(currentWords.join(' '));
      currentWords = [];
      currentLen = 0;
      continue;
    }

    const isClauseEnd = clauseEndRegex.test(w);
    const minAcceptLen = idealLineLen * 0.72;
    const maxAcceptLen = idealLineLen * 1.24;

    if ((isClauseEnd && currentLen >= minAcceptLen) || currentLen >= maxAcceptLen) {
      if (i === words.length - 2) continue;
      lines.push(currentWords.join(' '));
      currentWords = [];
      currentLen = 0;
    }
  }

  if (currentWords.length > 0) {
    if (lines.length > 0 && currentWords.length === 1 && currentWords[0].length <= 4) {
      lines[lines.length - 1] += ' ' + currentWords[0];
    } else {
      lines.push(currentWords.join(' '));
    }
  }

  return lines;
}

// ==========================================
// 4. 오늘의 말씀 50선
// ==========================================
const DAILY_VERSES = [
  { verse: "너희도 성령 안에서 하나님이 거하실 처소가 되기 위하여 그리스도 예수 안에서 함께 지어져 가느니라", ref: "에베소서 2:22", note: "우리 청소년부 한 사람 한 사람이 모여 아름다운 하나님의 집을 이루어 갑니다." },
  { verse: "네 시작은 미약하였으나 네 나중은 심히 창대하리라", ref: "욥기 8:7", note: "오늘의 작은 발걸음이 내일의 큰 은혜로 이어집니다." },
  { verse: "누구든지 네 연소함을 업신여기지 못하게 하고 오직 말과 행실과 사랑과 믿음과 정절에 있어서 믿는 자에게 본이 되어", ref: "디모데전서 4:12", note: "학교와 가정에서 빛과 소금으로 살아가는 청소년부를 응원합니다." },
  { verse: "여호와는 나의 목자시니 내게 부족함이 없으리로다", ref: "시편 23:1", note: "주님이 우리의 길을 가장 선하게 인도하십니다." },
  { verse: "두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라", ref: "이사야 41:10", note: "시험과 진로 앞에서도 주님이 너의 손을 꼭 붙잡고 계십니다." },
  { verse: "너희는 세상의 빛이라 산 위에 있는 동네가 숨겨지지 못할 것이요", ref: "마태복음 5:14", note: "여러분이 머무는 자리가 주님의 사랑으로 환해지길 기도합니다." },
  { verse: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라", ref: "데살로니가전서 5:16-18", note: "오늘 하루 감사의 제목 하나를 찾아 하나님께 고백해 보세요." },
  { verse: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라", ref: "빌립보서 4:13", note: "내 힘이 아닌 주님이 주시는 힘으로 오늘을 살아갑니다." },
  { verse: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라", ref: "잠언 3:5", note: "내 생각보다 크신 하나님의 계획을 신뢰하며 나아가요." },
  { verse: "너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라", ref: "잠언 3:6", note: "작은 선택의 순간마다 하나님께 먼저 여쭤보는 하루가 되길 바랍니다." },
  { verse: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다", ref: "시편 119:105", note: "어디로 가야 할지 막막할 때 말씀이 가장 정확한 내비게이션이 됩니다." },
  { verse: "강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라", ref: "여호수아 1:9", note: "혼자라고 느껴질 때도 하나님은 단 한 순간도 너를 떠나지 않으십니다." },
  { verse: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라", ref: "마태복음 11:28", note: "학업과 관계의 무거운 마음을 주님 앞에 내려놓고 참된 쉼을 얻으세요." },
  { verse: "너희 염려를 다 주께 맡기라 이는 그가 너희를 돌보심이라", ref: "베드로전서 5:7", note: "혼자 끙끙 앓던 걱정들을 기도로 주님께 올려드리는 하루가 되자!" },
  { verse: "아무 것도 염려하지 말고 다만 모든 일에 기도와 간구로, 너희 구할 것을 감사함으로 하나님께 아뢰라", ref: "빌립보서 4:6", note: "불안한 마음이 들 때마다 기도의 자리로 나아가 보세요." },
  { verse: "그리하면 모든 지각에 뛰어난 하나님의 평강이 그리스도 예수 안에서 너희 마음과 생각을 지키시리라", ref: "빌립보서 4:7", note: "세상이 줄 수 없는 평안이 오늘 너의 마음을 가득 채우길 축복합니다." },
  { verse: "오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요", ref: "이사야 40:31", note: "지치고 피곤한 일상 속에서 하늘로부터 오는 새 힘을 공급받으세요." },
  { verse: "사람이 마음으로 자기의 길을 계획할지라도 그의 걸음을 인도하시는 이는 여호와시니라", ref: "잠언 16:9", note: "열심히 준비하되 결과는 선하신 하나님께 맡기는 지혜를 배워요." },
  { verse: "너의 행사를 여호와께 맡기라 그리하면 네가 경영하는 것이 이루어지리라", ref: "잠언 16:3", note: "오늘 해야 할 공부와 일들을 주님께 맡기며 시작해 보세요." },
  { verse: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라", ref: "요한복음 3:16", note: "너는 하나님께서 독생자를 주시기까지 사랑하신 가장 소중한 존재입니다." },
  { verse: "내가 산을 향하여 눈을 들리라 나의 도움이 어디서 올까 나의 도움은 천지를 지으신 여호와에게서로다", ref: "시편 121:1-2", note: "고개를 들어 천지를 지으신 하나님을 바라보는 하루가 되길 바랍니다." },
  { verse: "여호와께서 너를 실족하지 아니하게 하시며 너를 지키시는 이가 졸지 아니하시리로다", ref: "시편 121:3", note: "우리가 잠든 밤에도 하나님은 깨어 우리를 지켜보고 계십니다." },
  { verse: "청년이 무엇으로 그의 행실을 깨끗하게 하리이까 주의 말씀만 지킬 따름이니이다", ref: "시편 119:9", note: "세상의 유행이 아닌 하나님의 말씀을 기준으로 살아가는 멋진 청소년이 되자!" },
  { verse: "너는 청년의 때에 너의 창조주를 기억하라", ref: "전도서 12:1", note: "가장 빛나는 청소년의 시기에 하나님을 기억하는 것이 최고의 복입니다." },
  { verse: "태초에 하나님이 천지를 창조하시니라", ref: "창세기 1:1", note: "온 우주를 만드신 하나님이 바로 우리 아버지이십니다." },
  { verse: "하나님이 자기 형상 곧 하나님의 형상대로 사람을 창조하시되", ref: "창세기 1:27", note: "남들과 비교하지 마세요. 너는 하나님의 형상을 닮은 유일한 걸작품입니다." },
  { verse: "보라 내가 새 일을 행하리니 이제 나타낼 것이라 너희가 그것을 알지 못하겠느냐", ref: "이사야 43:19", note: "어제의 실패에 머물지 마세요. 하나님은 오늘도 새 일을 행하십니다." },
  { verse: "너는 두려워하지 말라 내가 너를 구속하였고 내가 너를 지명하여 불렀나니 너는 내 것이라", ref: "이사야 43:1", note: "하나님이 너의 이름을 직접 부르시며 '너는 내 것'이라 말씀하십니다." },
  { verse: "우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라", ref: "로마서 8:28", note: "지금은 이해되지 않는 일들도 결국 선한 열매로 빚어주실 것입니다." },
  { verse: "너희는 이 세대를 본받지 말고 오직 마음을 새롭게 함으로 변화를 받아 하나님의 선하시고 기뻐하시고 온전하신 뜻이 무엇인지 분별하도록 하라", ref: "로마서 12:2", note: "남들이 다 가는 길이 아니라 하나님이 기뻐하시는 길을 선택해 보세요." },
  { verse: "소망 중에 즐거워하며 환난 중에 참으며 기도에 항상 힘쓰며", ref: "로마서 12:12", note: "어려운 순간에도 소망을 잃지 않고 기도하는 청소년부가 됩시다." },
  { verse: "사랑은 오래 참고 사랑은 온유하며 시기하지 아니하며 사랑은 자랑하지 아니하며 교만하지 아니하며", ref: "고린도전서 13:4", note: "오늘 만나는 친구와 가족에게 따뜻한 말 한마디로 사랑을 실천해 보세요." },
  { verse: "그런즉 믿음, 소망, 사랑, 이 세 가지는 항상 있을 것인데 그 중의 제일은 사랑이라", ref: "고린도전서 13:13", note: "우리의 모든 말과 행동 중심에 예수님의 사랑이 담기길 소망합니다." },
  { verse: "그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 이전 것은 지나갔으니 보라 새 것이 되었도다", ref: "고린도후서 5:17", note: "예수님 안에서 우리는 날마다 새롭게 시작할 수 있습니다." },
  { verse: "우리가 선을 행하되 낙심하지 말지니 포기하지 아니하면 때가 이르매 거두리라", ref: "갈라디아서 6:9", note: "당장 결과가 보이지 않아도 포기하지 마세요. 하나님의 때에 반드시 거둡니다." },
  { verse: "오직 성령의 열매는 사랑과 희락과 화평과 오래 참음과 자비와 양선과 충성과 온유와 절제니", ref: "갈라디아서 5:22-23", note: "우리의 삶 속에 성령의 아름다운 열매가 주렁주렁 맺히길 기도합니다." },
  { verse: "너희는 그 은혜에 의하여 믿음으로 말미암아 구원을 받았으니 이것은 너희에게서 난 것이 아니요 하나님의 선물이라", ref: "에베소서 2:8", note: "우리가 받은 구원은 조건 없이 주신 하나님의 가장 큰 선물입니다." },
  { verse: "우리는 그가 만드신 바라 그리스도 예수 안에서 선한 일을 위하여 지으심을 받은 자니", ref: "에베소서 2:10", note: "하나님이 너를 이 땅에 보내신 특별한 목적과 사명이 있습니다." },
  { verse: "모든 겸손과 온유로 하고 오래 참음으로 사랑 가운데서 서로 용납하고", ref: "에베소서 4:2", note: "서로 다른 친구들의 모습을 이해하고 품어주는 넓은 마음을 구해요." },
  { verse: "평안의 매는 줄로 성령이 하나 되게 하신 것을 힘써 지키라", ref: "에베소서 4:3", note: "온양 청소년부가 성령 안에서 하나 되어 서로를 세워주길 축복합니다." },
  { verse: "너희 안에 이 마음을 품으라 곧 그리스도 예수의 마음이니", ref: "빌립보서 2:5", note: "오늘 하루 예수님이라면 어떻게 말씀하시고 행동하실지 생각해 보세요." },
  { verse: "너희 안에서 착한 일을 시작하신 이가 그리스도 예수의 날까지 이루실 줄을 우리는 확신하노라", ref: "빌립보서 1:6", note: "하나님은 우리를 시작만 하시는 분이 아니라 끝까지 완성하시는 분입니다." },
  { verse: "무슨 일을 하든지 마음을 다하여 주께 하듯 하고 사람에게 하듯 하지 말라", ref: "골로새서 3:23", note: "학교 공부도, 집안일도 주님께 드리듯 정성을 다해 해봅시다." },
  { verse: "하나님이 우리에게 주신 것은 두려워하는 마음이 아니요 오직 능력과 사랑과 절제하는 마음이니", ref: "디모데후서 1:7", note: "두려움이 찾아올 때마다 하나님이 주신 담대한 마음을 선포하세요." },
  { verse: "모든 성경은 하나님의 감동으로 된 것으로 교훈과 책망과 바르게 함과 의로 교육하기에 유익하니", ref: "디모데후서 3:16", note: "하루 한 구절이라도 하나님의 말씀을 가까이하는 습관을 만들어 보세요." },
  { verse: "믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니", ref: "히브리서 11:1", note: "눈에 보이지 않아도 약속을 이루실 하나님을 믿음으로 바라봅시다." },
  { verse: "예수 그리스도는 어제나 오늘이나 영원토록 동일하시니라", ref: "히브리서 13:8", note: "변화무쌍한 세상 속에서도 변함없이 우리를 사랑하시는 주님을 의지하세요." },
  { verse: "너희 중에 누구든지 지혜가 부족하거든 모든 사람에게 후히 주시고 꾸짖지 아니하시는 하나님께 구하라 그리하면 주시리라", ref: "야고보서 1:5", note: "공부할 때도, 진로를 고민할 때도 하나님께 지혜를 구하면 후히 주십니다." },
  { verse: "하나님을 가까이 하라 그리하면 너희를 가까이 하시리라", ref: "야고보서 4:8", note: "오늘 주님께 한 걸음 더 가까이 다가가 보세요." },
  { verse: "사랑하는 자들아 우리가 서로 사랑하자 사랑은 하나님께 속한 것이니", ref: "요한일서 4:7", note: "먼저 다가가 인사하고 웃어주는 작은 사랑이 공동체를 살립니다." }
];

// ==========================================
// 5. 면류관 만들기(합체 퍼즐) 9단계 설정
// ==========================================
const MERGE_LEVELS = [
  { level: 0, name: '겨자씨', emoji: '🌱', radius: 17, color: '#dcfce7', border: '#16a34a', score: 10 },
  { level: 1, name: '새싹', emoji: '🌿', radius: 23, color: '#bbf7d0', border: '#059669', score: 25 },
  { level: 2, name: '물고기', emoji: '🐟', radius: 29, color: '#bae6fd', border: '#0284c7', score: 50 },
  { level: 3, name: '비둘기', emoji: '🕊️', radius: 36, color: '#e0e7ff', border: '#4f46e5', score: 90 },
  { level: 4, name: '성경책', emoji: '📖', radius: 44, color: '#fef3c7', border: '#d97706', score: 150 },
  { level: 5, name: '촛불', emoji: '🕯️', radius: 52, color: '#ffedd5', border: '#ea580c', score: 250 },
  { level: 6, name: '찬양기타', emoji: '🎸', radius: 61, color: '#ffe4e6', border: '#e11d48', score: 400 },
  { level: 7, name: '십자가', emoji: '✝️', radius: 71, color: '#ede9fe', border: '#7c3aed', score: 650 },
  { level: 8, name: '면류관', emoji: '👑', radius: 82, color: '#fef08a', border: '#ca8a04', score: 1000 }
];

const INITIAL_PUBLIC_DATA = {
  season: 'creation',
  praises: [
    { id: 1, title: '함께 지어져 가네', artist: '청소년부 찬양팀', key: '이번 달 찬양', url: 'https://www.youtube.com/watch?v=TtH4qHWdTto&list=RDTtH4qHWdTto&start_radio=1' },
    { id: 2, title: '우리가 의지하는 주의 사랑', artist: '청소년부 찬양팀', key: '이번 달 찬양', url: 'https://www.youtube.com/watch?v=IEBTRN-txPU&list=RDIEBTRN-txPU&start_radio=1' },
    { id: 3, title: '영접송', artist: '청소년부 찬양팀', key: '이번 달 찬양', url: 'https://www.youtube.com/watch?v=W1uussHIX9o&list=RDW1uussHIX9o&start_radio=1' }
  ],
  calendar: [
    { week: '1주차', date: '11월 1일', title: '성찬 주일 & 말씀 묵상 나눔', desc: '예배 후 반별 소그룹 말씀 나눔 및 생일자 축하' },
    { week: '2주차', date: '11월 8일', title: '청소년부 찬양 집회', desc: '뜨거운 찬양과 기도로 하나 되는 주일' },
    { week: '3주차', date: '11월 15일', title: '추수감사절 연합예배', desc: '한 해 동안 지켜주신 은혜에 감사하는 특별 순서' },
    { week: '4주차', date: '11월 22일', title: '창조절 환경 캠페인 & 레크리에이션', desc: '하나님의 창조 세계를 돌보는 반별 미션 게임' },
    { week: '5주차', date: '11월 29일', title: '대림절 준비 기도회', desc: '성탄을 기다리며 이웃 사랑을 나누는 기도 시간' }
  ],
  worshipOrder: {
    weekKey: '',
    thisWeek: { date: '이번 주일', prayer: '안소윤 (고1)', scripture: '이주원 (중2)', passage: '에베소서 2:19-22' },
    nextWeek: { date: '다음 주일', prayer: '송하준 (고2)', scripture: '강사무엘 (중3)', passage: '창세기 1:26-31' }
  },
  photos: [
    {
      id: 1,
      title: '가을 야외 예배 및 바비큐 파티',
      date: '2026.10.18',
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
      urls: ['https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'],
      desc: '맑은 가을 하늘 아래 함께 웃고 뛰며 교제했던 행복한 시간이었습니다.'
    },
    {
      id: 2,
      title: '찬양팀 특별 연습 현장',
      date: '2026.11.07',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      urls: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'],
      desc: '주일 예배를 사모하며 기도로 준비하는 청소년부 찬양팀!'
    }
  ],
  quiz: {
    title: '지난 주일 설교 말씀 퀴즈',
    passage: '에베소서 2:22',
    questions: [
      {
        q: '우리가 그리스도 예수 안에서 함께 지어져 가는 목적은 무엇인가요?',
        options: ['세상의 큰 건물', '하나님이 거하실 처소', '우리만의 동아리', '유명한 학교'],
        answer: 1
      },
      {
        q: '함께 지어져 가는 과정에서 우리를 하나로 묶어주시는 분은 누구신가요?',
        options: ['우리의 노력', '성령님', '친구들의 인기', '시간의 흐름'],
        answer: 1
      }
    ],
    completers: []
  },
  gameRanking: [],
  doveRanking: [],
  babelRanking: [],
  luckyEvent: {
    active: false,
    prizeName: '빙그레 바나나우유 🍌',
    maxWinners: 3,
    winChance: 20,
    winners: []
  },
  monthlyBirthdays: {
    month: 11,
    list: []
  }
};

const INITIAL_PRIVATE_DATA = {
  classes: {
    m1: { id: 'm1', grade: '중1', teacher: '담당 선생님', students: [] },
    m2: { id: 'm2', grade: '중2', teacher: '담당 선생님', students: [] },
    m3: { id: 'm3', grade: '중3', teacher: '담당 선생님', students: [] },
    h1: { id: 'h1', grade: '고1', teacher: '담당 선생님', students: [] },
    h2: { id: 'h2', grade: '고2', teacher: '담당 선생님', students: [] },
    h3: { id: 'h3', grade: '고3', teacher: '담당 선생님', students: [] }
  },
  attendanceRecords: {}
};

// ==========================================
// 6. 날짜 및 주간 기준 유틸리티 함수
// ==========================================
const getTodayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getFormattedDateDot = () => {
  const now = new Date();
  return `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, '0')}. ${String(now.getDate()).padStart(2, '0')}`;
};

const getNowTimeStr = () => {
  const now = new Date();
  return `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const getLatestSundayStr = () => {
  const now = new Date();
  const sun = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  return `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}`;
};

const getMondayWeekKey = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
};

const extractCurrentMonthBirthdays = (classesObj) => {
  const currentMonth = new Date().getMonth() + 1;
  const list = [];

  CLASS_SEQUENTIAL_ORDER.forEach((cid) => {
    const cls = classesObj?.[cid];
    if (!cls || !Array.isArray(cls.students)) return;
    cls.students.forEach((stu) => {
      if (!stu.birth || stu.birth === '-') return;
      const parts = stu.birth.trim().split(/[.\/-]/);
      const bMonth = parseInt(parts[0], 10);
      const bDay = parseInt(parts[1], 10) || 99;
      if (bMonth === currentMonth) {
        list.push({
          grade: cls.grade,
          name: stu.name,
          birth: stu.birth.trim(),
          day: bDay
        });
      }
    });
  });

  list.sort((a, b) => a.day - b.day);
  return {
    month: currentMonth,
    list: list.map(({ grade, name, birth }) => ({ grade, name, birth }))
  };
};

// ==========================================
// 7. 전체화면 감성 말씀카드
// ==========================================
function FullscreenVerseCard({ verseObj, onClose, onHideToday }) {
  const overlayRef = useRef(null);
  const rippleLayerRef = useRef(null);
  const isClosingRef = useRef(false);
  const animIdRef = useRef(null);

  const dayTheme = useMemo(() => {
    const idx = new Date().getDay();
    return VERSE_CARD_BACKGROUNDS[idx % VERSE_CARD_BACKGROUNDS.length];
  }, []);

  const formattedLines = useMemo(() => {
    return formatKoreanVerseLines(verseObj?.verse || '');
  }, [verseObj]);

  useEffect(() => {
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  const handleCardTap = (e) => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    const overlayEl = overlayRef.current;
    const rippleEl = rippleLayerRef.current;
    if (!overlayEl) {
      onClose();
      return;
    }

    const rect = overlayEl.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    const x = (typeof clientX === 'number' ? clientX : rect.left + rect.width / 2) - rect.left;
    const y = (typeof clientY === 'number' ? clientY : rect.top + rect.height / 2) - rect.top;

    if (rippleEl) {
      const glowRing = document.createElement('div');
      glowRing.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 420px;
        height: 420px;
        border-radius: 9999px;
        background: radial-gradient(circle, rgba(255,255,255,0) 42%, rgba(255,255,255,0.28) 54%, rgba(255,255,255,0) 68%);
        animation: softWaterRing 1.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      `;
      rippleEl.appendChild(glowRing);
    }

    const maxRadius = Math.hypot(
      Math.max(x, rect.width - x),
      Math.max(y, rect.height - y)
    ) + 150;

    const duration = 1350;
    const startTime = performance.now();

    const animateReveal = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = -(Math.cos(Math.PI * t) - 1) / 2;

      const currentRadius = ease * maxRadius;
      const feather = 140;
      const innerStop = Math.max(0, currentRadius - feather);
      const outerStop = currentRadius + feather * 0.45;

      const maskGrad = `radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,0) ${innerStop}px, rgba(0,0,0,0.45) ${(innerStop + outerStop) / 2}px, rgba(0,0,0,1) ${outerStop}px)`;
      overlayEl.style.maskImage = maskGrad;
      overlayEl.style.webkitMaskImage = maskGrad;

      if (t < 1) {
        animIdRef.current = requestAnimationFrame(animateReveal);
      } else {
        onClose();
      }
    };

    animIdRef.current = requestAnimationFrame(animateReveal);
  };

  const handleHideClick = (e) => {
    e.stopPropagation();
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    if (overlayRef.current) {
      overlayRef.current.classList.add('verse-card-dissolving');
    }
    setTimeout(() => {
      onHideToday();
    }, 550);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md h-full relative overflow-hidden pointer-events-auto">
        <div
          ref={overlayRef}
          onClick={handleCardTap}
          className="verse-card-layer absolute inset-0 cursor-pointer overflow-hidden flex flex-col justify-between p-6 text-white select-none"
        >
          <div
            className="absolute inset-0 -z-20"
            style={{ background: dayTheme.grad }}
          />
          <img
            src={dayTheme.img}
            alt=""
            className="absolute inset-0 w-full h-full object-cover -z-10"
          />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.52) 68%, rgba(0,0,0,0.78) 100%)'
            }}
          />

          <div className="relative z-10 flex items-center justify-between text-[11px] text-white/75 tracking-wide pt-1">
            <span>{getFormattedDateDot()}</span>
            <span>온양장로교회 청소년부</span>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-2 my-auto">
            <div className="font-verse text-[17px] leading-[1.95] tracking-[-0.01em] text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] space-y-0.5">
              {formattedLines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            <div className="w-6 h-[1px] bg-white/40 my-4" />

            <p className="font-verse text-[13px] text-white/85 tracking-wider">
              — {verseObj?.ref}
            </p>

            {verseObj?.note && (
              <div className="mt-6 w-full max-w-[300px] px-4 py-3.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 shadow-lg">
                <p className="text-[12.5px] leading-[1.65] text-white/90 font-normal break-keep">
                  {verseObj.note}
                </p>
              </div>
            )}
          </div>

          <div className="relative z-10 flex justify-center pb-2">
            <button
              type="button"
              onClick={handleHideClick}
              className="px-4 py-1.5 rounded-full text-[11px] text-white/80 hover:text-white bg-black/25 hover:bg-black/45 border border-white/20 backdrop-blur-xs transition"
            >
              오늘 하루 보지 않기
            </button>
          </div>
        </div>

        <div ref={rippleLayerRef} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" />
      </div>
    </div>
  );
}

// ==========================================
// 8. 절기별 낙하 이펙트 오버레이
// ==========================================
function SeasonEffectOverlay({ type }) {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${(i * 41) % 98}%`,
      size: `${14 + (i % 4) * 4}px`,
      dotSize: `${7 + (i % 4) * 3}px`,
      duration: `${6 + (i % 5) * 1.5}s`,
      delay: `${(i % 7) * 0.8}s`,
      opacity: 0.7 + (i % 3) * 0.1,
      char: type === 'dove' ? '🕊️' : '❄️'
    }));
  }, [type]);

  if (!type) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {particles.map((p) =>
        type === 'snow' ? (
          <span
            key={p.id}
            style={{
              left: p.left,
              width: p.dotSize,
              height: p.dotSize,
              opacity: p.opacity,
              animationDuration: p.duration,
              animationDelay: p.delay
            }}
            className="season-particle absolute -top-6 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]"
          />
        ) : (
          <span
            key={p.id}
            style={{
              left: p.left,
              fontSize: p.size,
              opacity: p.opacity,
              animationDuration: p.duration,
              animationDelay: p.delay
            }}
            className="season-particle absolute -top-8 select-none drop-shadow-xs"
          >
            {p.char}
          </span>
        )
      )}
    </div>
  );
}

// ==========================================
// 9-A. 게임 1: 👑 면류관 만들기
// ==========================================
function MergePuzzleGame({ rankings, onSaveScore }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [nextLevel, setNextLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  const dropXRef = useRef(160);

  const gameState = useRef({
    balls: [],
    score: 0,
    nextLevel: 0,
    canDrop: true,
    gameOver: false,
    idCounter: 1
  });

  const WIDTH = 320;
  const HEIGHT = 400;
  const DANGER_Y = 82;

  const resetGame = () => {
    const startLv = Math.floor(Math.random() * 3);
    gameState.current = {
      balls: [],
      score: 0,
      nextLevel: startLv,
      canDrop: true,
      gameOver: false,
      idCounter: 1
    };
    dropXRef.current = 160;
    setScore(0);
    setNextLevel(startLv);
    setGameOver(false);
    setScoreSaved(false);
  };

  const triggerManualFinish = () => {
    if (score <= 0) {
      alert("점수를 획득한 뒤 기록을 남길 수 있습니다!");
      return;
    }
    gameState.current.gameOver = true;
    setGameOver(true);
  };

  useEffect(() => {
    resetGame();
    let animId;

    const drawBall = (ctx, x, y, spec) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, spec.radius, 0, Math.PI * 2);
      ctx.fillStyle = spec.color;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = spec.border;
      ctx.stroke();

      ctx.font = `${Math.round(spec.radius * 1.05)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(spec.emoji, x, y + 1);
      ctx.restore();
    };

    const updatePhysics = () => {
      const state = gameState.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      if (!state.gameOver) {
        const gravity = 0.45;
        const damping = 0.32;
        const friction = 0.94;

        for (let b of state.balls) {
          b.age = (b.age || 0) + 1;
          b.vy += gravity;
          b.vx *= friction;
          b.x += b.vx;
          b.y += b.vy;

          if (b.x - b.r < 0) { b.x = b.r; b.vx = -b.vx * damping; }
          if (b.x + b.r > WIDTH) { b.x = WIDTH - b.r; b.vx = -b.vx * damping; }
          if (b.y + b.r >= HEIGHT) {
            b.y = HEIGHT - b.r;
            b.vy = -b.vy * damping;
            if (Math.abs(b.vy) < 0.8) b.vy = 0;
          }
        }

        let mergedIds = new Set();
        let newBalls = [];

        for (let iter = 0; iter < 4; iter++) {
          for (let i = 0; i < state.balls.length; i++) {
            for (let j = i + 1; j < state.balls.length; j++) {
              const b1 = state.balls[i];
              const b2 = state.balls[j];
              if (mergedIds.has(b1.id) || mergedIds.has(b2.id)) continue;

              const dx = b2.x - b1.x;
              const dy = b2.y - b1.y;
              const dist = Math.hypot(dx, dy);
              const minDist = b1.r + b2.r;

              if (dist < minDist) {
                if (iter === 0 && b1.level === b2.level) {
                  mergedIds.add(b1.id);
                  mergedIds.add(b2.id);

                  if (b1.level < MERGE_LEVELS.length - 1) {
                    const nextLv = b1.level + 1;
                    const spec = MERGE_LEVELS[nextLv];
                    newBalls.push({
                      id: state.idCounter++,
                      level: nextLv,
                      x: Math.max(spec.radius, Math.min(WIDTH - spec.radius, (b1.x + b2.x) / 2)),
                      y: Math.min(HEIGHT - spec.radius, (b1.y + b2.y) / 2),
                      vx: 0,
                      vy: -1.0,
                      r: spec.radius,
                      age: 40,
                      dangerFrames: Math.max(b1.dangerFrames || 0, b2.dangerFrames || 0)
                    });
                    state.score += spec.score;
                    setScore(state.score);
                  } else {
                    state.score += 2000;
                    setScore(state.score);
                  }
                } else if (dist > 0.001) {
                  const overlap = (minDist - dist) * 0.5;
                  const nx = dx / dist;
                  const ny = dy / dist;
                  b1.x -= nx * overlap;
                  b1.y -= ny * overlap;
                  b2.x += nx * overlap;
                  b2.y += ny * overlap;

                  if (b1.y + b1.r > HEIGHT) b1.y = HEIGHT - b1.r;
                  if (b2.y + b2.r > HEIGHT) b2.y = HEIGHT - b2.r;
                  if (b1.x - b1.r < 0) b1.x = b1.r;
                  if (b1.x + b1.r > WIDTH) b1.x = WIDTH - b1.r;
                  if (b2.x - b2.r < 0) b2.x = b2.r;
                  if (b2.x + b2.r > WIDTH) b2.x = WIDTH - b2.r;

                  const rvx = b2.vx - b1.vx;
                  const rvy = b2.vy - b1.vy;
                  const velAlongNormal = rvx * nx + rvy * ny;
                  if (velAlongNormal < 0) {
                    const impulse = -(1 + damping) * velAlongNormal * 0.5;
                    b1.vx -= impulse * nx;
                    b1.vy -= impulse * ny;
                    b2.vx += impulse * nx;
                    b2.vy += impulse * ny;
                  }
                }
              }
            }
          }
        }

        if (mergedIds.size > 0) {
          state.balls = state.balls.filter((b) => !mergedIds.has(b.id)).concat(newBalls);
        }

        for (let b of state.balls) {
          if (b.age > 42 && b.y - b.r <= DANGER_Y) {
            b.dangerFrames = (b.dangerFrames || 0) + 1;
            if (b.dangerFrames >= 24) {
              state.gameOver = true;
              setGameOver(true);
              break;
            }
          } else {
            b.dangerFrames = Math.max(0, (b.dangerFrames || 0) - 0.5);
          }
        }
      }

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.save();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, DANGER_Y);
      ctx.lineTo(WIDTH, DANGER_Y);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('위험선 (닿으면 종료)', WIDTH - 8, DANGER_Y - 5);
      ctx.restore();

      if (!state.gameOver && state.canDrop) {
        const curSpec = MERGE_LEVELS[state.nextLevel];
        const currentX = dropXRef.current;

        ctx.save();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(currentX, 34);
        ctx.lineTo(currentX, HEIGHT);
        ctx.stroke();
        ctx.restore();

        drawBall(ctx, currentX, 34, curSpec);
      }

      for (let b of state.balls) {
        drawBall(ctx, b.x, b.y, MERGE_LEVELS[b.level]);
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, []);

  const updatePointerX = (e) => {
    if (gameState.current.gameOver || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    if (typeof clientX !== 'number') return;
    const relX = ((clientX - rect.left) / rect.width) * WIDTH;
    const r = MERGE_LEVELS[gameState.current.nextLevel].radius;
    dropXRef.current = Math.max(r + 4, Math.min(WIDTH - r - 4, relX));
  };

  const handleDrop = (e) => {
    if (e.type === 'touchend') e.preventDefault();
    updatePointerX(e);
    const state = gameState.current;
    if (state.gameOver || !state.canDrop) return;

    const spec = MERGE_LEVELS[state.nextLevel];
    const safeX = Math.max(spec.radius + 4, Math.min(WIDTH - spec.radius - 4, dropXRef.current));

    state.balls.push({
      id: state.idCounter++,
      level: state.nextLevel,
      x: safeX,
      y: 34,
      vx: (Math.random() - 0.5) * 0.35,
      vy: 1.8,
      r: spec.radius,
      age: 0,
      dangerFrames: 0
    });

    state.canDrop = false;
    const upcoming = Math.floor(Math.random() * 4);
    state.nextLevel = upcoming;
    setNextLevel(upcoming);

    setTimeout(() => {
      state.canDrop = true;
    }, 340);
  };

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim() || score <= 0) return;
    onSaveScore(playerName.trim(), score);
    setScoreSaved(true);
  };

  return (
    <div className="space-y-3">
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md">
        <div>
          <div className="text-[10px] text-amber-300 font-bold">면류관 만들기 점수</div>
          <div className="text-xl font-extrabold">{score.toLocaleString()}점</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl">
            <span className="text-[10px] text-slate-300">다음:</span>
            <span className="text-base">{MERGE_LEVELS[nextLevel].emoji}</span>
          </div>
          {!gameOver && score > 0 && (
            <button
              onClick={triggerManualFinish}
              className="text-[11px] font-bold text-amber-900 bg-amber-300 px-2.5 py-1.5 rounded-xl"
            >
              기록 등록
            </button>
          )}
          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-white/15 text-white hover:bg-white/25"
            title="다시 시작"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-md px-2.5 py-2 rounded-xl border border-white flex items-center justify-between text-[10px] overflow-x-auto gap-1">
        {MERGE_LEVELS.map((lv, i) => (
          <React.Fragment key={lv.level}>
            <span className="flex flex-col items-center shrink-0">
              <span className="text-sm">{lv.emoji}</span>
              <span className="text-[9px] text-slate-500 font-medium">{lv.name}</span>
            </span>
            {i < MERGE_LEVELS.length - 1 && <span className="text-slate-300">›</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="relative bg-white/95 rounded-3xl border-2 border-slate-200 shadow-inner overflow-hidden flex justify-center">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onMouseMove={updatePointerX}
          onClick={handleDrop}
          onTouchStart={updatePointerX}
          onTouchMove={updatePointerX}
          onTouchEnd={handleDrop}
          className="w-full max-w-[340px] touch-none cursor-pointer"
        />

        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-4 z-10">
            <div className="bg-white rounded-3xl p-5 w-full max-w-xs text-center space-y-3 shadow-2xl">
              <div className="text-2xl">👑</div>
              <h3 className="text-lg font-extrabold text-slate-900">면류관 만들기 종료!</h3>
              <div className="text-2xl font-black text-emerald-600">{score.toLocaleString()}점</div>

              {!scoreSaved ? (
                <form onSubmit={handleRecordSubmit} className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-slate-500">
                    학년과 이름을 적고 명예의 전당에 등록하세요!
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="학년 이름 (예: 중2 이주원)"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-center font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
                    🏆 면류관 명예의 전당 등록하기
                  </button>
                </form>
              ) : (
                <p className="text-xs font-bold text-emerald-700 bg-emerald-50 py-2.5 rounded-xl">
                  ✨ {playerName} 친구의 기록이 등록되었습니다!
                </p>
              )}

              <button
                onClick={resetGame}
                className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                다시 도전하기
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white space-y-2">
        <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" /> 면류관 만들기 최고 기록 TOP 5
        </div>
        {rankings.length > 0 ? (
          <div className="space-y-1.5">
            {rankings.slice(0, 5).map((r, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{r.name}</span>
                </div>
                <span className="font-extrabold text-emerald-700">{r.score.toLocaleString()}점</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">아직 등록된 기록이 없습니다. 첫 번째 1위에 도전해 보세요!</p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 9-B. 게임 2: 🕊️ 성령의 비둘기 비행
// ==========================================
function DoveFlightGame({ rankings, onSaveScore }) {
  const canvasRef = useRef(null);
  const [dist, setDist] = useState(0);
  const [stars, setStars] = useState(0);
  const [speedLv, setSpeedLv] = useState(1);
  const [isStarted, setIsStarted] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  const WIDTH = 320;
  const HEIGHT = 330;

  const stRef = useRef({
    started: false,
    over: false,
    holding: false,
    birdY: HEIGHT / 2,
    birdVy: 0,
    distance: 0,
    starScore: 0,
    segments: [],
    starItems: [],
    segCounter: 0
  });

  const buildInitialTunnel = (st) => {
    st.segments = [];
    st.starItems = [];
    st.segCounter = 0;
    const segW = 20;
    for (let x = 0; x <= WIDTH + 80; x += segW) {
      st.segments.push({ x, w: segW, topH: 38, botH: 38 });
    }
  };

  const resetStandby = () => {
    const next = {
      started: false,
      over: false,
      holding: false,
      birdY: HEIGHT / 2,
      birdVy: 0,
      distance: 0,
      starScore: 0,
      segments: [],
      starItems: [],
      segCounter: 0
    };
    buildInitialTunnel(next);
    stRef.current = next;
    setDist(0);
    setStars(0);
    setSpeedLv(1);
    setIsStarted(false);
    setIsHolding(false);
    setGameOver(false);
    setScoreSaved(false);
  };

  const startGame = () => {
    stRef.current.started = true;
    setIsStarted(true);
  };

  useEffect(() => {
    resetStandby();
    let animId;

    const loop = () => {
      const st = stRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      if (st.started && !st.over) {
        const meterNow = Math.floor(st.distance);
        const speed = Math.min(5.2, 1.8 + meterNow * 0.0032);
        const lv = Math.min(5, Math.floor(meterNow / 140) + 1);
        setSpeedLv((prev) => (prev !== lv ? lv : prev));

        st.distance += speed * 0.14;
        setDist(Math.floor(st.distance));

        if (st.holding) {
          st.birdVy -= 0.36;
        } else {
          st.birdVy += 0.28;
        }
        st.birdVy = Math.max(-4.5, Math.min(4.8, st.birdVy));
        st.birdY += st.birdVy;

        st.segments.forEach((s) => { s.x -= speed; });
        if (st.segments.length > 0 && st.segments[0].x + st.segments[0].w < -20) {
          st.segments.shift();
        }

        const lastSeg = st.segments[st.segments.length - 1];
        if (lastSeg && lastSeg.x + lastSeg.w <= WIDTH + 40) {
          st.segCounter += 1;
          const m = Math.floor(st.distance);
          const gap = Math.max(145, 250 - m * 0.13);
          const waveAmp = Math.min(72, 22 + m * 0.06);
          const centerOffset =
            Math.sin(st.segCounter * 0.14) * waveAmp +
            Math.cos(st.segCounter * 0.06) * (waveAmp * 0.45);
          const centerY = Math.max(
            gap / 2 + 24,
            Math.min(HEIGHT - gap / 2 - 24, HEIGHT / 2 + centerOffset)
          );
          const topH = Math.max(20, centerY - gap / 2);
          const botH = Math.max(20, HEIGHT - (centerY + gap / 2));

          st.segments.push({ x: lastSeg.x + lastSeg.w, w: 20, topH, botH });

          if (st.segCounter % 11 === 0) {
            st.starItems.push({
              x: lastSeg.x + 10,
              y: centerY + (Math.random() - 0.5) * (gap * 0.4),
              collected: false
            });
          }
        }

        const birdX = 72;
        const birdR = 12;

        st.starItems.forEach((star) => {
          star.x -= speed;
          if (!star.collected && Math.hypot(star.x - birdX, star.y - st.birdY) < 23) {
            star.collected = true;
            st.starScore += 20;
            setStars(st.starScore);
          }
        });
        st.starItems = st.starItems.filter((s) => s.x > -30 && !s.collected);

        for (let s of st.segments) {
          if (birdX + birdR > s.x + 3 && birdX - birdR < s.x + s.w - 3) {
            if (st.birdY - birdR < s.topH || st.birdY + birdR > HEIGHT - s.botH) {
              st.over = true;
              setGameOver(true);
              break;
            }
          }
        }
      }

      const skyGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.55, '#7dd3fc');
      skyGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      st.segments.forEach((s) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(s.x, 0, s.w + 1, s.topH);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(s.x, s.topH - 5, s.w + 1, 5);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(s.x, HEIGHT - s.botH, s.w + 1, s.botH);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(s.x, HEIGHT - s.botH, s.w + 1, 5);
      });

      st.starItems.forEach((star) => {
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', star.x, star.y);
      });

      const birdX = 72;
      ctx.save();
      ctx.translate(birdX, st.birdY);
      const tilt = Math.max(-0.4, Math.min(0.45, st.birdVy * 0.08));
      ctx.rotate(tilt);
      ctx.scale(-1, 1);
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🕊️', 0, 0);
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePadDown = (e) => {
    if (e.cancelable) e.preventDefault();
    if (!stRef.current.started || stRef.current.over) return;
    stRef.current.holding = true;
    setIsHolding(true);
  };

  const handlePadUp = (e) => {
    if (e.cancelable) e.preventDefault();
    stRef.current.holding = false;
    setIsHolding(false);
  };

  const finalScore = dist + stars;

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim() || finalScore <= 0) return;
    onSaveScore(playerName.trim(), finalScore);
    setScoreSaved(true);
  };

  return (
    <div className="space-y-2.5">
      <div className="bg-sky-950 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md">
        <div>
          <div className="text-[10px] text-sky-300 font-bold flex items-center gap-1.5">
            <span>비행 점수 (거리 + 별 보너스)</span>
            <span className="px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-100 text-[9px]">
              속도 Lv.{speedLv}
            </span>
          </div>
          <div className="text-xl font-extrabold">
            {finalScore.toLocaleString()}점 <span className="text-xs font-semibold text-amber-300">({dist}m · ⭐+{stars})</span>
          </div>
        </div>
        <button
          onClick={resetStandby}
          className="flex items-center gap-1 text-xs font-bold bg-white/15 px-3 py-1.5 rounded-xl hover:bg-white/25"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 다시 시작
        </button>
      </div>

      <div className="relative bg-sky-200 rounded-t-3xl border-2 border-b-0 border-slate-300 overflow-hidden flex justify-center select-none">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="w-full max-w-[340px]" />

        {!isStarted && !gameOver && (
          <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] flex items-center justify-center p-4 z-10">
            <div className="bg-white/95 rounded-3xl p-5 max-w-[240px] text-center space-y-3 shadow-xl">
              <div className="text-2xl">🕊️</div>
              <div className="text-sm font-extrabold text-slate-900">성령의 비둘기 비행!</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                아래 패드를 <b>누르면 상승</b>, <b>떼면 하강</b>!<br />
                구름 벽을 피해 멀리 날아가세요.
              </p>
              <button
                type="button"
                onClick={startGame}
                className="w-full py-3 rounded-2xl bg-sky-600 text-white text-sm font-extrabold hover:bg-sky-700 shadow-md flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" /> 시작하기
              </button>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-4 z-10">
            <div className="bg-white rounded-3xl p-5 w-full max-w-xs text-center space-y-3 shadow-2xl">
              <div className="text-2xl">🕊️</div>
              <h3 className="text-lg font-extrabold text-slate-900">비행 종료!</h3>
              <div className="text-3xl font-black text-sky-600">{finalScore.toLocaleString()}점</div>
              <div className="text-[11px] text-slate-500 font-semibold">비행거리 {dist}m + 황금별 {stars}점</div>

              {finalScore > 0 && !scoreSaved ? (
                <form onSubmit={handleRecordSubmit} className="space-y-2 pt-1">
                  <input
                    type="text"
                    required
                    placeholder="학년 이름 (예: 중2 이주원)"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-center font-bold"
                  />
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-sky-600 text-white text-xs font-extrabold">
                    🏆 비둘기 비행 명예의 전당 등록
                  </button>
                </form>
              ) : scoreSaved ? (
                <p className="text-xs font-bold text-sky-700 bg-sky-50 py-2 rounded-xl">
                  ✨ {playerName} 친구의 {finalScore.toLocaleString()}점 등록 완료!
                </p>
              ) : null}

              <button
                onClick={resetStandby}
                className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                다시 도전하기
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onMouseDown={handlePadDown}
        onMouseUp={handlePadUp}
        onMouseLeave={handlePadUp}
        onTouchStart={handlePadDown}
        onTouchEnd={handlePadUp}
        disabled={!isStarted || gameOver}
        className={`w-full h-20 -mt-2.5 rounded-b-3xl font-extrabold text-sm shadow-md flex flex-col items-center justify-center gap-0.5 select-none touch-none transition ${
          !isStarted || gameOver
            ? 'bg-slate-300 text-slate-500'
            : isHolding
              ? 'bg-amber-500 text-white scale-[0.99]'
              : 'bg-sky-600 text-white'
        }`}
      >
        <span>{isHolding ? '🕊️ 날개짓 상승 중! (떼면 하강)' : '👆 여기를 누르고 있으면 떠오릅니다'}</span>
        <span className="text-[11px] font-medium text-white/85">위 하늘 통로가 손가락에 가리지 않아요!</span>
      </button>

      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white space-y-2">
        <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-sky-500" /> 성령의 비둘기 최고 기록 TOP 5
        </div>
        {rankings.length > 0 ? (
          <div className="space-y-1.5">
            {rankings.slice(0, 5).map((r, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{r.name}</span>
                </div>
                <span className="font-extrabold text-sky-700">{r.score.toLocaleString()}점</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">아직 등록된 기록이 없습니다. 첫 번째 파일럿에 도전해 보세요!</p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 9-C. 게임 3: 🗼 바벨탑 쌓기
// ==========================================
const TOWER_COLORS = ['#fbbf24', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

function BabelTowerGame({ rankings, onSaveScore }) {
  const canvasRef = useRef(null);
  const lastDropTimeRef = useRef(0);
  const [floor, setFloor] = useState(0);
  const [combo, setCombo] = useState(0);
  const [speedLv, setSpeedLv] = useState(1);
  const [isStarted, setIsStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  const WIDTH = 320;
  const HEIGHT = 330;
  const BLOCK_H = 25;

  const stRef = useRef({
    started: false,
    over: false,
    stack: [],
    cur: null,
    debris: [],
    combo: 0,
    camY: 0,
    flashText: '',
    flashTimer: 0
  });

  const resetStandby = () => {
    const baseW = 160;
    lastDropTimeRef.current = 0;
    stRef.current = {
      started: false,
      over: false,
      stack: [{ x: (WIDTH - baseW) / 2, y: HEIGHT - BLOCK_H, w: baseW, color: TOWER_COLORS[0] }],
      cur: { x: 10, y: HEIGHT - BLOCK_H * 2, w: baseW, dir: 1, speed: 1.4, color: TOWER_COLORS[1] },
      debris: [],
      combo: 0,
      camY: 0,
      flashText: '',
      flashTimer: 0
    };
    setFloor(0);
    setCombo(0);
    setSpeedLv(1);
    setIsStarted(false);
    setGameOver(false);
    setScoreSaved(false);
  };

  const startGame = () => {
    lastDropTimeRef.current = Date.now();
    stRef.current.started = true;
    setIsStarted(true);
  };

  const handlePadPress = (e) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();

    const now = Date.now();
    if (now - lastDropTimeRef.current < 220) return;
    lastDropTimeRef.current = now;

    const st = stRef.current;
    if (!st.started || st.over || !st.cur) return;

    const prev = st.stack[st.stack.length - 1];
    const cur = st.cur;

    if (Math.abs(cur.x - prev.x) <= 10) {
      cur.x = prev.x;
      cur.w = prev.w;
      st.combo += 1;
      setCombo(st.combo);

      if (st.combo >= 3) {
        const grow = 8;
        const newW = Math.min(170, cur.w + grow);
        const actualGrow = newW - cur.w;
        cur.w = newW;
        cur.x = Math.max(0, Math.min(WIDTH - cur.w, cur.x - actualGrow / 2));
      }
      st.flashText = `PERFECT! ×${st.combo}`;
      st.flashTimer = 34;
    } else {
      st.combo = 0;
      setCombo(0);

      const overlapLeft = Math.max(prev.x, cur.x);
      const overlapRight = Math.min(prev.x + prev.w, cur.x + cur.w);
      const overlapW = overlapRight - overlapLeft;

      if (overlapW < 4) {
        st.debris.push({ x: cur.x, y: cur.y, w: cur.w, vy: 0, color: cur.color });
        st.over = true;
        setGameOver(true);
        return;
      }

      if (cur.x < prev.x) {
        st.debris.push({ x: cur.x, y: cur.y, w: prev.x - cur.x, vy: 0, color: cur.color });
      } else {
        st.debris.push({ x: overlapRight, y: cur.y, w: (cur.x + cur.w) - overlapRight, vy: 0, color: cur.color });
      }

      cur.x = overlapLeft;
      cur.w = overlapW;
      st.flashText = '';
    }

    st.stack.push({ x: cur.x, y: cur.y, w: cur.w, color: cur.color });
    const nextFloor = st.stack.length - 1;
    setFloor(nextFloor);

    const nextY = cur.y - BLOCK_H;
    const nextSpeed = Math.min(5.2, 1.4 + nextFloor * 0.11);
    const lv = Math.min(5, Math.floor(nextFloor / 6) + 1);
    setSpeedLv(lv);

    const startLeft = nextFloor % 2 === 0;
    st.cur = {
      x: startLeft ? 0 : WIDTH - cur.w,
      y: nextY,
      w: cur.w,
      dir: startLeft ? 1 : -1,
      speed: nextSpeed,
      color: TOWER_COLORS[st.stack.length % TOWER_COLORS.length]
    };
  };

  useEffect(() => {
    resetStandby();
    let animId;

    const loop = () => {
      const st = stRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      if (st.started && !st.over && st.cur) {
        st.cur.x += st.cur.dir * st.cur.speed;
        if (st.cur.x <= 0) {
          st.cur.x = 0;
          st.cur.dir = 1;
        } else if (st.cur.x + st.cur.w >= WIDTH) {
          st.cur.x = WIDTH - st.cur.w;
          st.cur.dir = -1;
        }
      }

      const targetCam = Math.max(0, (st.stack.length - 6) * BLOCK_H);
      st.camY += (targetCam - st.camY) * 0.14;

      st.debris.forEach((d) => {
        d.vy += 0.48;
        d.y += d.vy;
      });
      st.debris = st.debris.filter((d) => d.y - st.camY < HEIGHT + 60);
      if (st.flashTimer > 0) st.flashTimer -= 1;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.save();
      ctx.translate(0, st.camY);

      st.stack.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, BLOCK_H - 2, 6);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fillRect(b.x + 3, b.y + 2, Math.max(0, b.w - 6), 4);
      });

      if (!st.over && st.cur) {
        ctx.fillStyle = st.cur.color;
        ctx.beginPath();
        ctx.roundRect(st.cur.x, st.cur.y, st.cur.w, BLOCK_H - 2, 6);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      st.debris.forEach((d) => {
        ctx.fillStyle = d.color;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(d.x, d.y, d.w, BLOCK_H - 2);
        ctx.globalAlpha = 1;
      });

      ctx.restore();

      if (st.flashTimer > 0 && st.flashText) {
        ctx.save();
        ctx.fillStyle = '#fef08a';
        ctx.font = '900 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(st.flashText, WIDTH / 2, 54);
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim() || floor <= 0) return;
    onSaveScore(playerName.trim(), floor);
    setScoreSaved(true);
  };

  return (
    <div className="space-y-2.5">
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md">
        <div>
          <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1.5">
            <span>현재 쌓은 층수 · 콤보</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-100 text-[9px]">
              속도 Lv.{speedLv}
            </span>
          </div>
          <div className="text-xl font-extrabold">
            {floor}층 <span className="text-xs font-semibold text-emerald-300">({combo}연속 PERFECT)</span>
          </div>
        </div>
        <button
          onClick={resetStandby}
          className="flex items-center gap-1 text-xs font-bold bg-white/15 px-3 py-1.5 rounded-xl hover:bg-white/25"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 다시 시작
        </button>
      </div>

      <div className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-t-3xl border-2 border-b-0 border-slate-300 overflow-hidden flex justify-center select-none">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="w-full max-w-[340px]" />

        {!isStarted && !gameOver && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-10">
            <div className="bg-white/95 rounded-3xl p-5 max-w-[240px] text-center space-y-3 shadow-xl">
              <div className="text-2xl">🗼</div>
              <div className="text-sm font-extrabold text-slate-900">바벨탑 쌓기 준비!</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                아래 조작 패드를 터치해 블록을 쌓으세요.<br />
                초반엔 천천히, 올라갈수록 빨라집니다!
              </p>
              <button
                type="button"
                onClick={startGame}
                className="w-full py-3 rounded-2xl bg-amber-500 text-white text-sm font-extrabold hover:bg-amber-600 shadow-md flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" /> 시작하기
              </button>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-4 z-10">
            <div className="bg-white rounded-3xl p-5 w-full max-w-xs text-center space-y-3 shadow-2xl">
              <div className="text-2xl">🗼</div>
              <h3 className="text-lg font-extrabold text-slate-900">바벨탑 완공!</h3>
              <div className="text-3xl font-black text-amber-600">{floor}층</div>

              {floor > 0 && !scoreSaved ? (
                <form onSubmit={handleRecordSubmit} className="space-y-2 pt-1">
                  <input
                    type="text"
                    required
                    placeholder="학년 이름 (예: 중2 이주원)"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-center font-bold"
                  />
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-xs font-extrabold">
                    🏆 바벨탑 명예의 전당 등록하기
                  </button>
                </form>
              ) : scoreSaved ? (
                <p className="text-xs font-bold text-emerald-700 bg-emerald-50 py-2 rounded-xl">
                  ✨ {playerName} 친구의 {floor}층 기록 등록 완료!
                </p>
              ) : (
                <p className="text-xs text-slate-500">1층 이상 쌓으면 기록을 등록할 수 있어요!</p>
              )}

              <button
                onClick={resetStandby}
                className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                다시 도전하기
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onPointerDown={handlePadPress}
        disabled={!isStarted || gameOver}
        className="w-full h-20 -mt-2.5 rounded-b-3xl bg-gradient-to-r from-amber-500 to-orange-500 active:from-amber-600 active:to-orange-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-extrabold text-base shadow-md flex flex-col items-center justify-center gap-0.5 select-none touch-none transition"
      >
        <span>⬇ 여기를 터치해서 블록 내려놓기</span>
        <span className="text-[11px] font-medium text-white/85">한 번 터치에 1층씩 정확히 쌓입니다</span>
      </button>

      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white space-y-2">
        <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" /> 바벨탑 쌓기 최고 기록 TOP 5
        </div>
        {rankings.length > 0 ? (
          <div className="space-y-1.5">
            {rankings.slice(0, 5).map((r, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800">{r.name}</span>
                </div>
                <span className="font-extrabold text-amber-700">{r.score}층</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">아직 등록된 기록이 없습니다. 첫 번째 건축가에 도전해 보세요!</p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 9-D. 게임 3종 통합 컨테이너 화면
// ==========================================
function MiniGameCenter({
  crownRankings,
  doveRankings,
  babelRankings,
  onSaveCrown,
  onSaveDove,
  onSaveBabel,
  onBack
}) {
  const [selectedGame, setSelectedGame] = useState('crown');

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="뒤로 가기"
          className="w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-extrabold text-indigo-700 bg-white/90 px-3 py-1 rounded-full">
          청소년부 미니게임존 🎮
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 bg-white/85 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-2xs">
        <button
          onClick={() => setSelectedGame('crown')}
          className={`py-2.5 px-1.5 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
            selectedGame === 'crown'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>👑</span> 면류관 만들기
        </button>
        <button
          onClick={() => setSelectedGame('dove')}
          className={`py-2.5 px-1.5 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
            selectedGame === 'dove'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🕊️</span> 성령의 비둘기
        </button>
        <button
          onClick={() => setSelectedGame('babel')}
          className={`py-2.5 px-1.5 rounded-xl text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
            selectedGame === 'babel'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🗼</span> 바벨탑 쌓기
        </button>
      </div>

      {selectedGame === 'crown' && (
        <MergePuzzleGame rankings={crownRankings} onSaveScore={onSaveCrown} />
      )}
      {selectedGame === 'dove' && (
        <DoveFlightGame rankings={doveRankings} onSaveScore={onSaveDove} />
      )}
      {selectedGame === 'babel' && (
        <BabelTowerGame rankings={babelRankings} onSaveScore={onSaveBabel} />
      )}
    </div>
  );
}

// ==========================================
// 10. 메인 애플리케이션
// ==========================================
export default function App() {
  const [publicData, setPublicData] = useState(INITIAL_PUBLIC_DATA);
  const [privateData, setPrivateData] = useState(INITIAL_PRIVATE_DATA);

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showVerseCard, setShowVerseCard] = useState(false);

  // 알림 설정 팝업 & 등록 상태 (제안 1)
  const [showPushPopup, setShowPushPopup] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(() => {
    try {
      return localStorage.getItem('onyang_push_registered') === '1';
    } catch (_) {
      return false;
    }
  });
  const [pushBannerText, setPushBannerText] = useState('');
  const pushPopupShownRef = useRef(false);

  const [showLuckyWinPopup, setShowLuckyWinPopup] = useState(false);
  const [luckyWinnerInput, setLuckyWinnerInput] = useState('');
  const [luckyClaimed, setLuckyClaimed] = useState(false);
  const luckyCheckedRef = useRef(false);

  const [eventPrizeInput, setEventPrizeInput] = useState('빙그레 바나나우유 🍌');
  const [eventMaxInput, setEventMaxInput] = useState(3);
  const [eventChanceInput, setEventChanceInput] = useState(20);

  const [pinModalRole, setPinModalRole] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [authRoles, setAuthRoles] = useState({ admin: false, praise: false, officer: false });

  const [isEditingPraise, setIsEditingPraise] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isEditingCalendar, setIsEditingCalendar] = useState(false);

  const [newSong, setNewSong] = useState({ title: '', artist: '', key: '', url: '' });

  const [adminTab, setAdminTab] = useState('attendance');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLatestSundayStr());

  const [newStudent, setNewStudent] = useState({ name: '', birth: '', phone: '' });
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentForm, setEditStudentForm] = useState({ name: '', birth: '', phone: '' });
  const [editingTeacher, setEditingTeacher] = useState(false);
  const [teacherNameInput, setTeacherNameInput] = useState('');

  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoFiles, setPhotoFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  const [quizStudentName, setQuizStudentName] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizPassage, setNewQuizPassage] = useState('');
  const [draftQuestions, setDraftQuestions] = useState([
    { q: '', options: ['', '', '', ''], answer: 0 }
  ]);

  const touchStartRef = useRef({ x: 0, y: 0, active: false, mode: 'back' });

  // FCM 포그라운드 수신 & 알림 등록 핸들러
  useEffect(() => {
    const stopListen = listenForegroundMessages(({ title, body }) => {
      setPushBannerText(`${title}: ${body}`);
    });
    return () => stopListen();
  }, []);

  const handleRegisterPush = async () => {
    const roleLabel = authRoles.admin ? 'teacher' : authRoles.officer ? 'officer' : 'student';
    const res = await requestAndSaveFcmToken(roleLabel);
    if (res.ok) {
      setPushEnabled(true);
      try {
        localStorage.setItem('onyang_push_registered', '1');
      } catch (_) {}
      setShowPushPopup(false);
      alert("🔔 아침 말씀·새 퀴즈 알림이 등록되었습니다!");
    } else {
      alert(res.reason || "알림 설정을 완료하지 못했습니다.");
    }
  };

  // 첫 접속 시 알림 팝업 노출 (말씀카드가 닫힌 뒤 미등록 기기 대상)
  useEffect(() => {
    if (!isLoaded || showVerseCard || pushEnabled || pushPopupShownRef.current) return;
    const today = getTodayStr();
    if (localStorage.getItem(`onyang_push_popup_dismissed_${today}`) === '1') return;
    pushPopupShownRef.current = true;
    const timer = setTimeout(() => {
      setShowPushPopup(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [isLoaded, showVerseCard, pushEnabled]);

  const dismissPushPopupToday = () => {
    try {
      localStorage.setItem(`onyang_push_popup_dismissed_${getTodayStr()}`, '1');
    } catch (_) {}
    setShowPushPopup(false);
  };

  // ==========================================
  // 뒤로 가기 공통 핸들러 (관리실 학년 선택 화면 우선 복귀)
  // ==========================================
  const handleGoBack = () => {
    if (selectedPhoto) {
      setSelectedPhoto(null);
      return;
    }
    if (pinModalRole) {
      setPinModalRole(null);
      setPinInput('');
      setPinError(false);
      return;
    }
    if (activeTab === 'admin' && selectedClassId) {
      setSelectedClassId(null);
      setEditingStudentId(null);
      setEditingTeacher(false);
      return;
    }
    if (activeTab !== 'home') {
      setActiveTab('home');
      setSelectedClassId(null);
      setIsEditingPraise(false);
      setIsEditingOrder(false);
      setIsEditingCalendar(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'home' || selectedClassId || selectedPhoto) {
      window.history.pushState({ view: activeTab, cls: selectedClassId, photo: !!selectedPhoto }, '');
    }
  }, [activeTab, selectedClassId, selectedPhoto]);

  useEffect(() => {
    const onPopState = () => {
      if (selectedPhoto) {
        setSelectedPhoto(null);
      } else if (activeTab === 'admin' && selectedClassId) {
        setSelectedClassId(null);
        setEditingStudentId(null);
        setEditingTeacher(false);
      } else if (activeTab !== 'home') {
        setActiveTab('home');
        setIsEditingPraise(false);
        setIsEditingOrder(false);
        setIsEditingCalendar(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [activeTab, selectedClassId, selectedPhoto]);

  // 스와이프 핸들러: 게임 화면 제외, 사진첩 모달 내 좌우 스와이프 및 좌측 엣지 뒤로 가기
  const handleEdgeTouchStart = (e) => {
    if (activeTab === 'game') {
      touchStartRef.current.active = false;
      return;
    }
    const t = e.touches?.[0];
    if (!t) return;

    if (selectedPhoto && Array.isArray(selectedPhoto.urls) && selectedPhoto.urls.length > 1) {
      touchStartRef.current = { x: t.clientX, y: t.clientY, active: true, mode: 'photo' };
      return;
    }

    if (activeTab !== 'home' && t.clientX <= 36) {
      touchStartRef.current = { x: t.clientX, y: t.clientY, active: true, mode: 'back' };
    } else {
      touchStartRef.current.active = false;
    }
  };

  const handleEdgeTouchEnd = (e) => {
    if (!touchStartRef.current.active) return;
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - touchStartRef.current.x;
    const dy = Math.abs(t.clientY - touchStartRef.current.y);
    const mode = touchStartRef.current.mode;
    touchStartRef.current.active = false;

    if (mode === 'photo' && selectedPhoto && Math.abs(dx) > 45 && dy < 70) {
      const imgs = selectedPhoto.urls;
      if (dx < 0) {
        setSelectedPhotoIdx((prev) => (prev + 1) % imgs.length);
      } else {
        setSelectedPhotoIdx((prev) => (prev - 1 + imgs.length) % imgs.length);
      }
      return;
    }

    if (mode === 'back' && dx > 75 && dy < 55) {
      handleGoBack();
    }
  };

  // ==========================================
  // Firebase 실시간 구독 + 데이터 자동 초기화 완벽 차단
  // ==========================================
  useEffect(() => {
    let isFirstCheckDone = false;

    const unsubscribe = onSnapshot(
      PUBLIC_DOC_REF,
      async (snapshot) => {
        if (snapshot.exists()) {
          const raw = snapshot.data();
          const mergedLucky = raw.luckyEvent ?? INITIAL_PUBLIC_DATA.luckyEvent;

          let orderData = raw.worshipOrder ?? INITIAL_PUBLIC_DATA.worshipOrder;
          const currentWeekKey = getMondayWeekKey();

          if (orderData.weekKey && orderData.weekKey !== currentWeekKey) {
            const promotedOrder = {
              weekKey: currentWeekKey,
              thisWeek: {
                date: '이번 주일',
                prayer: orderData.nextWeek?.prayer || '미정',
                scripture: orderData.nextWeek?.scripture || '미정',
                passage: orderData.nextWeek?.passage || '주일 예배 본문'
              },
              nextWeek: {
                date: '다음 주일',
                prayer: '미정 (입력 필요)',
                scripture: '미정 (입력 필요)',
                passage: '본문 미정'
              }
            };
            orderData = promotedOrder;
            setDoc(PUBLIC_DOC_REF, { worshipOrder: promotedOrder }, { merge: true }).catch(() => {});
          } else if (!orderData.weekKey) {
            orderData = { ...orderData, weekKey: currentWeekKey };
            setDoc(PUBLIC_DOC_REF, { worshipOrder: orderData }, { merge: true }).catch(() => {});
          }

          setPublicData((prev) => ({
            ...prev,
            season: raw.season ?? prev.season,
            praises: raw.praises ?? prev.praises,
            calendar: raw.calendar ?? prev.calendar,
            worshipOrder: orderData,
            photos: raw.photos ?? prev.photos,
            quiz: raw.quiz ?? prev.quiz,
            gameRanking: raw.gameRanking ?? prev.gameRanking,
            doveRanking: raw.doveRanking ?? prev.doveRanking,
            babelRanking: raw.babelRanking ?? prev.babelRanking,
            luckyEvent: mergedLucky,
            monthlyBirthdays: raw.monthlyBirthdays ?? prev.monthlyBirthdays
          }));
          setEventPrizeInput(mergedLucky.prizeName || '빙그레 바나나우유 🍌');
          setEventMaxInput(mergedLucky.maxWinners || 3);
          setEventChanceInput(mergedLucky.winChance || 20);
        } else if (!isFirstCheckDone) {
          isFirstCheckDone = true;
          try {
            const verifySnap = await getDoc(PUBLIC_DOC_REF);
            if (!verifySnap.exists()) {
              const initWithWeek = {
                ...INITIAL_PUBLIC_DATA,
                worshipOrder: {
                  ...INITIAL_PUBLIC_DATA.worshipOrder,
                  weekKey: getMondayWeekKey()
                }
              };
              await setDoc(PUBLIC_DOC_REF, initWithWeek);
            }
          } catch (verifyErr) {
            console.error("서버 초기 문서 확인 보류:", verifyErr);
          }
        }
        setIsLoaded(true);
      },
      (error) => {
        console.error("공개 데이터 연결 오류:", error);
        setIsLoaded(true);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoaded || luckyCheckedRef.current) return;
    luckyCheckedRef.current = true;

    const ev = publicData.luckyEvent;
    if (!ev || !ev.active) return;

    const currentWinners = Array.isArray(ev.winners) ? ev.winners : [];
    const remaining = (ev.maxWinners || 0) - currentWinners.length;
    if (remaining <= 0) return;

    const today = getTodayStr();
    const checkedKey = `onyang_lucky_checked_${today}`;
    if (localStorage.getItem(checkedKey) === 'done') return;

    localStorage.setItem(checkedKey, 'done');
    const chance = Math.min(100, Math.max(1, Number(ev.winChance) || 20));
    if (Math.random() * 100 < chance) {
      setShowLuckyWinPopup(true);
    }
  }, [isLoaded, publicData.luckyEvent]);

  useEffect(() => {
    if (!authRoles.admin) return;

    const unsubscribePrivate = onSnapshot(PRIVATE_DOC_REF, async (snapshot) => {
      if (snapshot.exists()) {
        const currentPriv = { ...INITIAL_PRIVATE_DATA, ...snapshot.data() };
        setPrivateData(currentPriv);
        const extractedBdays = extractCurrentMonthBirthdays(currentPriv.classes);
        await setDoc(PUBLIC_DOC_REF, { monthlyBirthdays: extractedBdays }, { merge: true });
      } else {
        try {
          const verifyPriv = await getDoc(PRIVATE_DOC_REF);
          if (!verifyPriv.exists()) {
            const legacySnap = await getDoc(PUBLIC_DOC_REF);
            const legacy = legacySnap.exists() ? legacySnap.data() : {};
            const initialPriv = {
              classes: legacy.classes || INITIAL_PRIVATE_DATA.classes,
              attendanceRecords: legacy.attendanceRecords || {}
            };
            await setDoc(PRIVATE_DOC_REF, initialPriv);
            setPrivateData(initialPriv);
          }
        } catch (err) {
          console.error("비공개 데이터 초기 확인 오류:", err);
        }
      }
    });

    return () => unsubscribePrivate();
  }, [authRoles.admin]);

  const syncPublicData = async (updatedFields) => {
    const nextData = { ...publicData, ...updatedFields };
    setPublicData(nextData);
    try {
      await setDoc(PUBLIC_DOC_REF, updatedFields, { merge: true });
    } catch (err) {
      console.error("공개 데이터 저장 실패:", err);
      alert("저장에 실패했습니다. 인터넷 연결을 확인해 주세요.");
    }
  };

  const syncPrivateData = async (updatedFields) => {
    if (!authRoles.admin) return;
    const nextData = { ...privateData, ...updatedFields };
    setPrivateData(nextData);
    try {
      await setDoc(PRIVATE_DOC_REF, updatedFields, { merge: true });
      if (updatedFields.classes) {
        const extractedBdays = extractCurrentMonthBirthdays(updatedFields.classes);
        await setDoc(PUBLIC_DOC_REF, { monthlyBirthdays: extractedBdays }, { merge: true });
      }
    } catch (err) {
      console.error("비공개 데이터 저장 실패:", err);
      alert("출석·명단 저장에 실패했습니다. 인터넷 연결을 확인해 주세요.");
    }
  };

  useEffect(() => {
    const today = getTodayStr();
    if (localStorage.getItem('onyang_verse_hidden_date') !== today) {
      setShowVerseCard(true);
    }
  }, []);

  const todayVerse = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
    return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
  }, []);

  const hideVerseForToday = () => {
    localStorage.setItem('onyang_verse_hidden_date', getTodayStr());
    setShowVerseCard(false);
  };

  const currentSeason = SEASONS[publicData.season] || SEASONS.creation;
  const canChangeSeason = authRoles.admin || authRoles.officer;

  const handleSeasonClick = () => {
    if (!canChangeSeason) {
      setPinModalRole('season');
      return;
    }
    const keys = Object.keys(SEASONS);
    const nextIdx = (keys.indexOf(publicData.season) + 1) % keys.length;
    syncPublicData({ season: keys[nextIdx] });
  };

  const handleClaimLuckyPrize = async (e) => {
    e.preventDefault();
    if (!luckyWinnerInput.trim()) return;
    const ev = publicData.luckyEvent || INITIAL_PUBLIC_DATA.luckyEvent;
    const prevWinners = Array.isArray(ev.winners) ? ev.winners : [];
    const nextWinners = [
      ...prevWinners,
      { name: luckyWinnerInput.trim(), time: getNowTimeStr() }
    ];
    const isSoldOut = nextWinners.length >= (ev.maxWinners || 1);
    await syncPublicData({
      luckyEvent: {
        ...ev,
        winners: nextWinners,
        active: isSoldOut ? false : ev.active
      }
    });
    setLuckyClaimed(true);
  };

  const handleSaveLuckyEvent = async (toggleActive) => {
    const ev = publicData.luckyEvent || INITIAL_PUBLIC_DATA.luckyEvent;
    const nextActive = typeof toggleActive === 'boolean' ? toggleActive : ev.active;
    await syncPublicData({
      luckyEvent: {
        ...ev,
        active: nextActive,
        prizeName: eventPrizeInput.trim() || '빙그레 바나나우유 🍌',
        maxWinners: Math.max(1, Number(eventMaxInput) || 1),
        winChance: Math.min(100, Math.max(1, Number(eventChanceInput) || 20))
      }
    });
    alert(nextActive ? "깜짝 간식 이벤트가 시작되었습니다!" : "이벤트 설정이 저장/종료되었습니다.");
  };

  const handleResetLuckyWinners = async () => {
    if (!window.confirm("당첨자 명단을 초기화하고 새로 이벤트를 시작할까요?")) return;
    const ev = publicData.luckyEvent || INITIAL_PUBLIC_DATA.luckyEvent;
    await syncPublicData({
      luckyEvent: {
        ...ev,
        active: true,
        prizeName: eventPrizeInput.trim() || '빙그레 바나나우유 🍌',
        maxWinners: Math.max(1, Number(eventMaxInput) || 1),
        winChance: Math.min(100, Math.max(1, Number(eventChanceInput) || 20)),
        winners: []
      }
    });
  };

  const handleSaveCrownScore = (name, newScore) => {
    const currentList = publicData.gameRanking || [];
    const updated = [...currentList, { name, score: newScore }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    syncPublicData({ gameRanking: updated });
  };

  const handleSaveDoveScore = (name, newScore) => {
    const currentList = publicData.doveRanking || [];
    const updated = [...currentList, { name, score: newScore }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    syncPublicData({ doveRanking: updated });
  };

  const handleSaveBabelScore = (name, newScore) => {
    const currentList = publicData.babelRanking || [];
    const updated = [...currentList, { name, score: newScore }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    syncPublicData({ babelRanking: updated });
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const isMaster = pinInput === CHURCH_LINKS.adminPin;

    if (pinModalRole === 'admin' && isMaster) {
      setAuthRoles({ admin: true, praise: true, officer: true });
      setPinModalRole(null);
      setPinInput('');
      setPinError(false);
      setActiveTab('admin');
    } else if (pinModalRole === 'praise' && (pinInput === CHURCH_LINKS.praisePin || isMaster)) {
      setAuthRoles((prev) => ({ ...prev, praise: true }));
      setPinModalRole(null);
      setPinInput('');
      setPinError(false);
      setIsEditingPraise(true);
    } else if (pinModalRole === 'officer' && (pinInput === CHURCH_LINKS.officerPin || isMaster)) {
      setAuthRoles((prev) => ({ ...prev, officer: true }));
      setPinModalRole(null);
      setPinInput('');
      setPinError(false);
      setIsEditingOrder(true);
      setIsEditingCalendar(true);
    } else if (pinModalRole === 'season' && (pinInput === CHURCH_LINKS.officerPin || isMaster)) {
      setAuthRoles((prev) => ({ ...prev, officer: true }));
      setPinModalRole(null);
      setPinInput('');
      setPinError(false);
      const keys = Object.keys(SEASONS);
      const nextIdx = (keys.indexOf(publicData.season) + 1) % keys.length;
      syncPublicData({ season: keys[nextIdx] });
    } else {
      setPinError(true);
    }
  };

  const handleAddSong = (e) => {
    e.preventDefault();
    if (!newSong.title.trim()) return;
    const songObj = {
      id: Date.now(),
      title: newSong.title.trim(),
      artist: newSong.artist.trim() || '찬양팀',
      key: newSong.key.trim() || 'Key 미정',
      url: newSong.url.trim() || `https://www.youtube.com/results?search_query=${encodeURIComponent(newSong.title.trim())}`
    };
    syncPublicData({ praises: [...publicData.praises, songObj] });
    setNewSong({ title: '', artist: '', key: '', url: '' });
  };

  const handleDeleteSong = (songId) => {
    syncPublicData({ praises: publicData.praises.filter((s) => s.id !== songId) });
  };

  const handleResetPraises = () => {
    if (!window.confirm("찬양 목록을 새로 등록하신 3곡으로 초기화할까요?")) return;
    syncPublicData({ praises: INITIAL_PUBLIC_DATA.praises });
  };

  const handleOrderChange = (weekKey, field, val) => {
    syncPublicData({
      worshipOrder: {
        ...publicData.worshipOrder,
        weekKey: publicData.worshipOrder.weekKey || getMondayWeekKey(),
        [weekKey]: { ...publicData.worshipOrder[weekKey], [field]: val }
      }
    });
  };

  const handleCalendarChange = (idx, field, val) => {
    const updated = publicData.calendar.map((item, i) => (i === idx ? { ...item, [field]: val } : item));
    syncPublicData({ calendar: updated });
  };

  const setStudentAttendance = (studentId, status) => {
    const dayRecord = privateData.attendanceRecords[selectedDate] || {};
    const prevStudentRec = dayRecord[studentId] || { status: '', reason: '' };
    syncPrivateData({
      attendanceRecords: {
        ...privateData.attendanceRecords,
        [selectedDate]: { ...dayRecord, [studentId]: { ...prevStudentRec, status } }
      }
    });
  };

  const setStudentNote = (studentId, noteText) => {
    const dayRecord = privateData.attendanceRecords[selectedDate] || {};
    const prevStudentRec = dayRecord[studentId] || { status: '', reason: '' };
    syncPrivateData({
      attendanceRecords: {
        ...privateData.attendanceRecords,
        [selectedDate]: { ...dayRecord, [studentId]: { ...prevStudentRec, reason: noteText } }
      }
    });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !selectedClassId) return;
    const targetClass = privateData.classes[selectedClassId];
    const added = {
      id: 'stu_' + Date.now(),
      name: newStudent.name.trim(),
      birth: newStudent.birth.trim() || '-',
      phone: newStudent.phone.trim() || '-'
    };
    syncPrivateData({
      classes: {
        ...privateData.classes,
        [selectedClassId]: { ...targetClass, students: [...targetClass.students, added] }
      }
    });
    setNewStudent({ name: '', birth: '', phone: '' });
  };

  const startEditingStudent = (stu) => {
    setEditingStudentId(stu.id);
    setEditStudentForm({
      name: stu.name,
      birth: stu.birth === '-' ? '' : stu.birth,
      phone: stu.phone === '-' ? '' : stu.phone
    });
  };

  const handleSaveEditedStudent = (studentId) => {
    if (!editStudentForm.name.trim() || !selectedClassId) return;
    const targetClass = privateData.classes[selectedClassId];
    const updatedStudents = targetClass.students.map((s) =>
      s.id === studentId
        ? {
            ...s,
            name: editStudentForm.name.trim(),
            birth: editStudentForm.birth.trim() || '-',
            phone: editStudentForm.phone.trim() || '-'
          }
        : s
    );
    syncPrivateData({
      classes: {
        ...privateData.classes,
        [selectedClassId]: { ...targetClass, students: updatedStudents }
      }
    });
    setEditingStudentId(null);
  };

  const handleDeleteStudent = (studentId) => {
    if (!window.confirm("정말 이 학생을 명단에서 삭제하시겠습니까?")) return;
    const targetClass = privateData.classes[selectedClassId];
    syncPrivateData({
      classes: {
        ...privateData.classes,
        [selectedClassId]: { ...targetClass, students: targetClass.students.filter((s) => s.id !== studentId) }
      }
    });
  };

  const handleSaveTeacher = () => {
    if (!teacherNameInput.trim() || !selectedClassId) return;
    syncPrivateData({
      classes: {
        ...privateData.classes,
        [selectedClassId]: { ...privateData.classes[selectedClassId], teacher: teacherNameInput.trim() }
      }
    });
    setEditingTeacher(false);
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoTitle.trim() || photoFiles.length === 0) {
      alert("사진 제목과 이미지 파일을 1장 이상 선택해 주세요.");
      return;
    }
    setIsUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of photoFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const result = await res.json();
        if (!result.secure_url) throw new Error("업로드 응답 오류");
        uploadedUrls.push(result.secure_url);
      }

      const newPhoto = {
        id: Date.now(),
        title: photoTitle.trim(),
        date: getTodayStr().replace(/-/g, '.'),
        url: uploadedUrls[0],
        urls: uploadedUrls,
        desc: photoDesc.trim() || '함께 지어져 가는 온양장로교회 청소년부 활동 사진입니다.'
      };
      await syncPublicData({ photos: [newPhoto, ...publicData.photos] });
      setPhotoTitle('');
      setPhotoDesc('');
      setPhotoFiles([]);
      alert(`사진 ${uploadedUrls.length}장이 사진첩에 성공적으로 등록되었습니다!`);
    } catch (err) {
      console.error(err);
      alert("사진 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAlbum = async (albumId, albumTitle) => {
    if (!window.confirm(`"${albumTitle}" 사진첩 앨범을 삭제할까요?`)) return;
    const nextPhotos = (publicData.photos || []).filter((p) => p.id !== albumId);
    if (selectedPhoto?.id === albumId) {
      setSelectedPhoto(null);
      setSelectedPhotoIdx(0);
    }
    await syncPublicData({ photos: nextPhotos });
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    if (!quizStudentName.trim()) {
      alert("학년과 이름을 입력해 주세요! (예: 중2 이주원)");
      return;
    }
    const nameBadge = quizStudentName.trim();
    const updatedCompleters = publicData.quiz.completers.includes(nameBadge)
      ? publicData.quiz.completers
      : [nameBadge, ...publicData.quiz.completers];

    syncPublicData({ quiz: { ...publicData.quiz, completers: updatedCompleters } });
    setQuizSubmitted(true);
  };

  const handleAddDraftQuestion = () => {
    setDraftQuestions((prev) => [...prev, { q: '', options: ['', '', '', ''], answer: 0 }]);
  };

  const handleRemoveDraftQuestion = (idx) => {
    if (draftQuestions.length <= 1) return;
    setDraftQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateDraftQuestion = (idx, field, val) => {
    setDraftQuestions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleUpdateDraftOption = (qIdx, optIdx, val) => {
    setDraftQuestions((prev) =>
      prev.map((item, i) => {
        if (i !== qIdx) return item;
        const nextOpts = [...item.options];
        nextOpts[optIdx] = val;
        return { ...item, options: nextOpts };
      })
    );
  };

  const handlePublishNewQuiz = (e) => {
    e.preventDefault();
    if (!newQuizTitle.trim() || draftQuestions.some((dq) => !dq.q.trim())) {
      alert("퀴즈 제목과 모든 문제의 질문을 입력해 주세요.");
      return;
    }
    const formattedQuestions = draftQuestions.map((dq) => ({
      q: dq.q.trim(),
      options: dq.options.map((o, i) => o.trim() || `보기 ${i + 1}`),
      answer: Number(dq.answer)
    }));

    syncPublicData({
      quiz: {
        title: newQuizTitle.trim(),
        passage: newQuizPassage.trim() || '주일 설교 본문',
        questions: formattedQuestions,
        completers: []
      }
    });
    setNewQuizTitle('');
    setNewQuizPassage('');
    setDraftQuestions([{ q: '', options: ['', '', '', ''], answer: 0 }]);
    alert(`총 ${formattedQuestions.length}문제의 새 설교 퀴즈가 등록되었으며 완료자 명단이 초기화되었습니다!`);
  };

  // 당일(selectedDate) 기준 전체 출석 및 장결자 합계 계산
  const dailyAttendanceSummary = useMemo(() => {
    const orderedClasses = CLASS_SEQUENTIAL_ORDER.map((id) => privateData.classes[id]).filter(Boolean);
    const allStudents = orderedClasses.flatMap((c) => c.students);
    const dayRec = privateData.attendanceRecords[selectedDate] || {};

    let presentOnly = 0;
    let secondOnly = 0;
    let absentCount = 0;
    let longAbsentCount = 0;

    allStudents.forEach((stu) => {
      const st = dayRec[stu.id]?.status;
      if (st === 'present') presentOnly++;
      else if (st === 'second') secondOnly++;
      else if (st === 'long_absent') longAbsentCount++;
      else if (st === 'absent') absentCount++;
    });

    return {
      totalStudents: allStudents.length,
      totalAttended: presentOnly + secondOnly,
      presentOnly,
      secondOnly,
      absentCount,
      longAbsentCount
    };
  }, [privateData.classes, privateData.attendanceRecords, selectedDate]);

  const statsSummary = useMemo(() => {
    const orderedClasses = CLASS_SEQUENTIAL_ORDER.map((id) => privateData.classes[id]).filter(Boolean);
    const allStudents = orderedClasses.flatMap((c) => c.students.map((s) => ({ ...s, grade: c.grade })));
    const totalCount = allStudents.length;
    const dates = Object.keys(privateData.attendanceRecords).sort();
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = getTodayStr().slice(0, 7);

    const isAttended = (status) => status === 'present' || status === 'second';

    const monthlyRates = Array.from({ length: 12 }, (_, idx) => {
      const mStr = `${currentYear}-${String(idx + 1).padStart(2, '0')}`;
      const mDates = dates.filter((d) => d.startsWith(mStr));
      if (mDates.length === 0 || totalCount === 0) return { month: `${idx + 1}월`, rate: 0 };
      let presentSum = 0;
      mDates.forEach((d) => {
        presentSum += Object.values(privateData.attendanceRecords[d] || {}).filter((r) => isAttended(r.status)).length;
      });
      return { month: `${idx + 1}월`, rate: Math.round((presentSum / (mDates.length * totalCount)) * 100) };
    });

    const thisMonthDates = dates.filter((d) => d.startsWith(currentMonth));
    const targetDates = thisMonthDates.length > 0 ? thisMonthDates : dates;

    let thisMonthRate = 0;
    if (thisMonthDates.length > 0 && totalCount > 0) {
      let sum = 0;
      thisMonthDates.forEach((d) => {
        sum += Object.values(privateData.attendanceRecords[d] || {}).filter((r) => isAttended(r.status)).length;
      });
      thisMonthRate = Math.round((sum / (thisMonthDates.length * totalCount)) * 100);
    }

    const classStats = orderedClasses.map((cls) => {
      const total = cls.students.length;
      if (total === 0 || targetDates.length === 0) {
        return { id: cls.id, grade: cls.grade, teacher: cls.teacher, avgPresent: 0, total, rate: 0 };
      }
      let sumPresent = 0;
      targetDates.forEach((d) => {
        const dayRec = privateData.attendanceRecords[d] || {};
        sumPresent += cls.students.filter((s) => isAttended(dayRec[s.id]?.status)).length;
      });
      const avgPresent = Math.round((sumPresent / targetDates.length) * 10) / 10;
      const rate = Math.round((sumPresent / (targetDates.length * total)) * 100);
      return { id: cls.id, grade: cls.grade, teacher: cls.teacher, avgPresent, total, rate };
    });

    const recentTwoDates = dates.slice(-2);
    const consecutiveAbsentees =
      recentTwoDates.length === 2
        ? allStudents.filter((stu) =>
            recentTwoDates.every((d) => {
              const st = privateData.attendanceRecords[d]?.[stu.id]?.status;
              return st === 'absent' || st === 'long_absent';
            })
          )
        : [];

    return {
      totalCount,
      thisMonthRate,
      monthlyRates,
      classStats,
      hasThisMonthData: thisMonthDates.length > 0,
      consecutiveAbsentees
    };
  }, [privateData.classes, privateData.attendanceRecords]);

  const downloadCSV = () => {
    const orderedClasses = CLASS_SEQUENTIAL_ORDER.map((id) => privateData.classes[id]).filter(Boolean);
    const allStudents = orderedClasses.flatMap((c) => c.students.map((s) => ({ ...s, grade: c.grade })));
    const dates = Object.keys(privateData.attendanceRecords).sort();
    let csv = '\uFEFF학년,이름,생일,연락처,총 출석(2부포함),총 결석(장결포함),출석률(%),' + dates.join(',') + '\n';

    allStudents.forEach((stu) => {
      let attendedCount = 0;
      let absentCount = 0;
      const dateCols = dates.map((d) => {
        const rec = privateData.attendanceRecords[d]?.[stu.id];
        if (!rec || !rec.status) {
          return rec?.reason ? `메모(${rec.reason.replace(/,/g, ' ')})` : '-';
        }
        const memo = rec.reason ? `(${rec.reason.replace(/,/g, ' ')})` : '';
        if (rec.status === 'present') {
          attendedCount++;
          return `출석${memo}`;
        } else if (rec.status === 'second') {
          attendedCount++;
          return `2부예배${memo}`;
        } else if (rec.status === 'long_absent') {
          absentCount++;
          return `장결자${memo}`;
        } else {
          absentCount++;
          return `결석${memo || '(사유미입력)'}`;
        }
      });

      const totalRecorded = attendedCount + absentCount;
      const rate = totalRecorded > 0 ? Math.round((attendedCount / totalRecorded) * 100) + '%' : '0%';

      const row = [
        stu.grade, stu.name, stu.birth, stu.phone,
        `${attendedCount}회`, `${absentCount}회`, rate,
        ...dateCols
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `온양장로교회_청소년부_출석통계_${getTodayStr()}.csv`;
    link.click();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">온양 청소년부 앱을 불러오는 중...</p>
      </div>
    );
  }

  const currentMonthNum = new Date().getMonth() + 1;
  const birthdayBannerData =
    publicData.monthlyBirthdays && publicData.monthlyBirthdays.month === currentMonthNum
      ? publicData.monthlyBirthdays
      : { month: currentMonthNum, list: [] };

  const luckyEv = publicData.luckyEvent || INITIAL_PUBLIC_DATA.luckyEvent;
  const luckyWinners = Array.isArray(luckyEv.winners) ? luckyEv.winners : [];
  const luckyRemaining = Math.max(0, (luckyEv.maxWinners || 0) - luckyWinners.length);

  const selectedPhotoImages = selectedPhoto
    ? (Array.isArray(selectedPhoto.urls) && selectedPhoto.urls.length > 0
        ? selectedPhoto.urls
        : [selectedPhoto.url])
    : [];

  // 챌린지 슬라이드 아이템이 적을 때도 끊기지 않도록 최소 8개 이상 채움
  const challengeMarqueeItems = (() => {
    const base = publicData.quiz?.completers || [];
    if (base.length === 0) return [];
    const repeated = [...base];
    while (repeated.length < 8) {
      repeated.push(...base);
    }
    return [...repeated, ...repeated];
  })();

  return (
    <div
      onTouchStart={handleEdgeTouchStart}
      onTouchEnd={handleEdgeTouchEnd}
      className={`min-h-screen ${currentSeason.outerBg} transition-colors duration-700 flex justify-center relative`}
    >
      <style>{`
        .font-verse {
          font-family: 'Gowun Batang', 'Noto Serif KR', serif;
          word-break: keep-all;
        }
        .verse-card-layer {
          opacity: 1;
          transition: opacity 0.55s ease-out;
          will-change: mask-image, -webkit-mask-image, opacity;
        }
        .verse-card-dissolving {
          opacity: 0;
          pointer-events: none;
        }
        @keyframes softWaterRing {
          0% {
            transform: translate(-50%, -50%) scale(0.15);
            opacity: 0.55;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }
        @keyframes marqueeScroll {
          0% { transform: translate3d(0%, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marqueeScroll 20s linear infinite;
          will-change: transform;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes seasonFall {
          0% { transform: translateY(-10vh) translateX(0px) rotate(0deg); }
          50% { transform: translateY(48vh) translateX(16px) rotate(18deg); }
          100% { transform: translateY(108vh) translateX(-12px) rotate(-14deg); }
        }
        .season-particle {
          animation-name: seasonFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>

      <SeasonEffectOverlay type={currentSeason.effect} />

      <div className={`w-full max-w-md min-h-screen bg-gradient-to-b ${currentSeason.pageBg} transition-all duration-700 shadow-xl flex flex-col justify-between relative overflow-x-hidden`}>

        {/* 상단 고정 헤더 */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-100/80 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => { setActiveTab('home'); setSelectedClassId(null); }}
            className="flex items-center gap-2 text-left"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${currentSeason.accentBg} transition-colors duration-500`} />
            <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-800">
              온양 청소년부에 오신 걸 환영합니다
            </span>
          </button>

          <button
            onClick={() => setShowVerseCard(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold hover:bg-amber-100 transition shrink-0"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>오늘의 말씀</span>
          </button>
        </header>

        {pushBannerText && (
          <div className="mx-4 mt-3 px-3.5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-md">
            <span className="truncate">{pushBannerText}</span>
            <button type="button" onClick={() => setPushBannerText('')} className="ml-2 text-slate-300 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 p-4 space-y-4 pb-10">

          {activeTab === 'home' && (
            <>
              <div className={`rounded-3xl p-5 text-white bg-gradient-to-br ${currentSeason.bannerGradient} shadow-lg relative overflow-hidden transition-all duration-500`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                    2026 청소년부 표어
                  </span>
                  <button
                    onClick={handleSeasonClick}
                    title={canChangeSeason ? "클릭하여 교회력 절기 변경" : "교역자·교사·임원 전용 절기 설정"}
                    className={`text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-xs transition ${currentSeason.badgeBg}`}
                  >
                    {currentSeason.name}
                  </button>
                </div>

                <h1 className="text-[22px] sm:text-2xl font-extrabold tracking-tight whitespace-nowrap mb-1.5">
                  함께 지어져 가는 청소년부
                </h1>
                <p className="text-xs text-white/90 leading-relaxed">
                  "그리스도 예수 안에서 함께 지어져 가느니라" (엡 2:22)
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/70 shadow-2xs">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <BookOpen className={`w-3.5 h-3.5 ${currentSeason.accentText}`} />
                    이번 주일 예배 섬김이
                  </span>
                  <button
                    onClick={() => setActiveTab('order')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center"
                  >
                    전체보기 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-400 mb-0.5">대표기도</div>
                    <div className="text-sm font-bold text-slate-800">{publicData.worshipOrder.thisWeek.prayer}</div>
                  </div>
                  <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-400 mb-0.5">성경봉독 ({publicData.worshipOrder.thisWeek.passage})</div>
                    <div className="text-sm font-bold text-slate-800">{publicData.worshipOrder.thisWeek.scripture}</div>
                  </div>
                </div>
              </div>

              {birthdayBannerData.list.length > 0 && (
                <div className="rounded-2xl p-3.5 bg-gradient-to-r from-rose-50/95 via-pink-50/95 to-amber-50/95 border border-rose-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-rose-800 flex items-center gap-1.5">
                      <Cake className="w-4 h-4 text-rose-500" />
                      {birthdayBannerData.month}월 생일을 진심으로 축하합니다! 🎉
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 bg-white/80 px-2 py-0.5 rounded-full">
                      총 {birthdayBannerData.list.length}명
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {birthdayBannerData.list.map((b, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 border border-rose-200/70 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        <span>🎂 {b.grade} {b.name}</span>
                        <span className="text-[10px] font-semibold text-rose-600">({b.birth})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div
                onClick={() => { setActiveTab('quiz'); setQuizSubmitted(false); }}
                className="cursor-pointer rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
                      <Award className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs text-amber-300 font-semibold">주중 말씀 복습 챌린지</div>
                      <h2 className="text-sm font-bold">{publicData.quiz.title}</h2>
                    </div>
                  </div>
                  <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-semibold">
                    도전하기 →
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 overflow-hidden">
                  <div className="text-[10px] text-slate-400 mb-1.5">
                    🎉 이번 주 퀴즈 완료 친구들 ({publicData.quiz.completers.length}명)
                  </div>
                  {challengeMarqueeItems.length > 0 ? (
                    <div className="overflow-hidden relative w-full">
                      <div className="animate-marquee gap-2">
                        {challengeMarqueeItems.map((name, i) => (
                          <span
                            key={i}
                            className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-medium whitespace-nowrap shrink-0"
                          >
                            ✨ {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">첫 번째 퀴즈 주인공에 도전해 보세요!</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('praise')}
                  className="p-4 rounded-2xl bg-emerald-50/95 border border-emerald-200/80 text-left hover:bg-emerald-100/70 transition shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">이번 달 찬양</div>
                  <div className="text-xs text-slate-500 mt-0.5">곡 리스트 & 유튜브 듣기</div>
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className="p-4 rounded-2xl bg-sky-50/95 border border-sky-200/80 text-left hover:bg-sky-100/70 transition shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">이번 달 청소년부</div>
                  <div className="text-xs text-slate-500 mt-0.5">주차별 예배 및 행사 안내</div>
                </button>

                <button
                  onClick={() => setActiveTab('order')}
                  className="p-4 rounded-2xl bg-amber-50/95 border border-amber-200/80 text-left hover:bg-amber-100/70 transition shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">성경봉독 / 기도</div>
                  <div className="text-xs text-slate-500 mt-0.5">주일 예배 순서 및 본문</div>
                </button>

                <button
                  onClick={() => setActiveTab('photo')}
                  className="p-4 rounded-2xl bg-rose-50/95 border border-rose-200/80 text-left hover:bg-rose-100/70 transition shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">활동 사진첩</div>
                  <div className="text-xs text-slate-500 mt-0.5">함께한 은혜의 순간들</div>
                </button>
              </div>

              <div
                onClick={() => setActiveTab('game')}
                className="cursor-pointer rounded-2xl p-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-md hover:shadow-lg transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
                    🎮
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-amber-200 flex items-center gap-1">
                      <Gamepad2 className="w-3.5 h-3.5" /> 기록 깨기 미니게임 3종!
                    </div>
                    <div className="text-sm font-extrabold">면류관 · 성령의 비둘기 · 바벨탑</div>
                    <div className="text-[11px] text-white/80">명예의 전당 최고 기록에 도전하세요!</div>
                  </div>
                </div>
                <span className="text-xs bg-white text-indigo-700 px-3 py-1.5 rounded-full font-extrabold shrink-0">
                  게임하기 →
                </span>
              </div>
            </>
          )}

          {activeTab === 'game' && (
            <MiniGameCenter
              crownRankings={publicData.gameRanking || []}
              doveRankings={publicData.doveRanking || []}
              babelRankings={publicData.babelRanking || []}
              onSaveCrown={handleSaveCrownScore}
              onSaveDove={handleSaveDoveScore}
              onSaveBabel={handleSaveBabelScore}
              onBack={handleGoBack}
            />
          )}

          {activeTab === 'praise' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleGoBack}
                  aria-label="뒤로 가기"
                  className="w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (authRoles.praise || authRoles.admin) {
                      setIsEditingPraise(!isEditingPraise);
                    } else {
                      setPinModalRole('praise');
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                  {isEditingPraise ? '편집 완료' : '찬양팀 관리'}
                </button>
              </div>

              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/80">
                <h2 className="text-xl font-extrabold text-slate-900">이번 달 찬양 리스트</h2>
                <p className="text-xs text-slate-500 mt-1">찬양을 누르면 유튜브 영상으로 바로 연결됩니다.</p>
              </div>

              {isEditingPraise && (
                <form onSubmit={handleAddSong} className="p-4 rounded-2xl bg-white/95 border border-emerald-200 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-900">+ 새 찬양 추가하기</span>
                    <button
                      type="button"
                      onClick={handleResetPraises}
                      className="text-[11px] text-slate-500 underline"
                    >
                      기본 3곡으로 불러오기
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="찬양 제목"
                    value={newSong.title}
                    onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="찬양팀/가수"
                      value={newSong.artist}
                      onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="코드 Key (예: G Key)"
                      value={newSong.key}
                      onChange={(e) => setNewSong({ ...newSong, key: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <input
                    type="url"
                    placeholder="유튜브 링크 (선택)"
                    value={newSong.url}
                    onChange={(e) => setNewSong({ ...newSong, url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                    찬양 리스트에 추가
                  </button>
                </form>
              )}

              <div className="space-y-2.5">
                {publicData.praises.map((song, idx) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-2xs"
                  >
                    <a
                      href={song.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="font-bold text-sm text-slate-800 truncate">{song.title}</div>
                        <div className="text-xs text-slate-500">{song.artist} · {song.key}</div>
                      </div>
                    </a>

                    {isEditingPraise ? (
                      <button
                        onClick={() => handleDeleteSong(song.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl ml-2"
                        title="곡 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <a
                        href={song.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 px-2.5 py-1.5 rounded-xl ml-2 shrink-0"
                      >
                        <Youtube className="w-4 h-4" /> 듣기
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleGoBack}
                  aria-label="뒤로 가기"
                  className="w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (authRoles.officer || authRoles.admin) {
                      setIsEditingCalendar(!isEditingCalendar);
                    } else {
                      setPinModalRole('officer');
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-sky-700 border border-sky-200 text-xs font-bold shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingCalendar ? '수정 완료' : '임원 수정'}
                </button>
              </div>

              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/80">
                <h2 className="text-xl font-extrabold text-slate-900">이번 달 청소년부</h2>
                <p className="text-xs text-slate-500 mt-1">주별 특별 프로그램과 예배 일정을 확인하세요.</p>
              </div>

              <div className="space-y-3">
                {publicData.calendar.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        {item.week}
                      </span>
                      {isEditingCalendar ? (
                        <input
                          type="text"
                          value={item.date}
                          onChange={(e) => handleCalendarChange(idx, 'date', e.target.value)}
                          className="text-xs font-bold px-2 py-1 rounded border border-slate-300 bg-white w-24 text-right"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">{item.date}</span>
                      )}
                    </div>

                    {isEditingCalendar ? (
                      <>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleCalendarChange(idx, 'title', e.target.value)}
                          className="w-full text-sm font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                        <input
                          type="text"
                          value={item.desc}
                          onChange={(e) => handleCalendarChange(idx, 'desc', e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'order' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleGoBack}
                  aria-label="뒤로 가기"
                  className="w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (authRoles.officer || authRoles.admin) {
                      setIsEditingOrder(!isEditingOrder);
                    } else {
                      setPinModalRole('officer');
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-amber-800 border border-amber-200 text-xs font-bold shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingOrder ? '수정 완료' : '임원 수정'}
                </button>
              </div>

              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/80">
                <h2 className="text-xl font-extrabold text-slate-900">성경봉독 및 대표기도</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">매주 월요일이 되면 다음 주일 섬김이가 이번 주일로 자동 이동합니다.</p>
              </div>

              {['thisWeek', 'nextWeek'].map((wk) => {
                const isThis = wk === 'thisWeek';
                const orderObj = publicData.worshipOrder[wk];
                return (
                  <div
                    key={wk}
                    className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 space-y-3 shadow-2xs"
                  >
                    <div className={`text-xs font-extrabold ${isThis ? currentSeason.accentText : 'text-slate-500'}`}>
                      {isThis ? '이번 주일 예배 순서' : '다음 주일 예고'}
                    </div>
                    <div className="bg-slate-50/80 p-3.5 rounded-xl space-y-2.5 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 shrink-0">대표기도</span>
                        {isEditingOrder ? (
                          <input
                            type="text"
                            value={orderObj.prayer}
                            onChange={(e) => handleOrderChange(wk, 'prayer', e.target.value)}
                            className="text-right font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 w-40 bg-white"
                          />
                        ) : (
                          <span className="font-bold text-slate-900">{orderObj.prayer}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 shrink-0">성경봉독</span>
                        {isEditingOrder ? (
                          <input
                            type="text"
                            value={orderObj.scripture}
                            onChange={(e) => handleOrderChange(wk, 'scripture', e.target.value)}
                            className="text-right font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 w-40 bg-white"
                          />
                        ) : (
                          <span className="font-bold text-slate-900">{orderObj.scripture}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500 shrink-0">말씀본문</span>
                        {isEditingOrder ? (
                          <input
                            type="text"
                            value={orderObj.passage}
                            onChange={(e) => handleOrderChange(wk, 'passage', e.target.value)}
                            className="text-right font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 w-40 bg-white"
                          />
                        ) : (
                          <span className={`font-bold ${isThis ? currentSeason.accentText : 'text-slate-700'}`}>
                            {orderObj.passage}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'photo' && (
            <div className="space-y-4">
              <button
                onClick={handleGoBack}
                aria-label="뒤로 가기"
                className="w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/80">
                <h2 className="text-xl font-extrabold text-slate-900">청소년부 사진첩</h2>
                <p className="text-xs text-slate-500 mt-1">사진을 누르면 크게 보고 좌우로 넘겨볼 수 있습니다.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {publicData.photos.map((photo) => {
                  const count = Array.isArray(photo.urls) ? photo.urls.length : 1;
                  return (
                    <div
                      key={photo.id}
                      onClick={() => {
                        setSelectedPhoto(photo);
                        setSelectedPhotoIdx(0);
                      }}
                      className="cursor-pointer rounded-2xl overflow-hidden border border-white/80 bg-white/95 shadow-sm hover:shadow-md transition relative"
                    >
                      <img src={photo.url} alt={photo.title} className="w-full h-32 object-cover" />
                      {count > 1 && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/65 text-white text-[10px] font-bold">
                          +{count}장
                        </span>
                      )}
                      <div className="p-2.5">
                        <div className="text-xs font-bold text-slate-800 truncate">{photo.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{photo.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <button
                onClick={handleGoBack}
                aria-label="뒤로 가기"
                className="w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="p-4 rounded-2xl bg-slate-900 text-white">
                <div className="text-xs text-amber-300 font-semibold">{publicData.quiz.passage}</div>
                <h2 className="text-lg font-extrabold mt-0.5">{publicData.quiz.title}</h2>
              </div>

              <form onSubmit={handleQuizSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/90 border border-white/80">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    내 학년과 이름 (명단에 올라가요!)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 중2 이주원"
                    value={quizStudentName}
                    onChange={(e) => setQuizStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {publicData.quiz.questions.map((item, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-white/95 border border-white/80 space-y-2.5">
                    <div className="text-sm font-bold text-slate-800">
                      Q{qIdx + 1}. {item.q}
                    </div>
                    <div className="space-y-2">
                      {item.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[qIdx] === oIdx;
                        const isCorrect = item.answer === oIdx;
                        let btnStyle = "border-slate-200 bg-slate-50 text-slate-700";
                        if (quizSubmitted) {
                          if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                          else if (isSelected) btnStyle = "border-rose-400 bg-rose-50 text-rose-700";
                        } else if (isSelected) {
                          btnStyle = "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold";
                        }

                        return (
                          <button
                            type="button"
                            key={oIdx}
                            onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx })}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs transition ${btnStyle}`}
                          >
                            {oIdx + 1}. {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!quizSubmitted ? (
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" /> 정답 제출하고 명단 올리기
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/95 border border-emerald-200 text-center space-y-2">
                    <div className="text-sm font-extrabold text-emerald-800">
                      🎉 {quizStudentName} 친구, 말씀 복습 완료!
                    </div>
                    <p className="text-xs text-emerald-700">홈 화면 명예의 전당 전광판에 이름이 등록되었습니다.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('home')}
                      className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                    >
                      홈 화면에서 내 이름 확인하기
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'admin' && authRoles.admin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleGoBack}
                  aria-label="뒤로 가기"
                  className="w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold text-emerald-700 bg-white/90 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 보안 페이지
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 bg-white/85 backdrop-blur-md p-1 rounded-xl">
                {[
                  { id: 'attendance', label: '출석체크' },
                  { id: 'roster', label: '명단관리' },
                  { id: 'stats', label: '출석통계' },
                  { id: 'content', label: '콘텐츠관리' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setAdminTab(t.id); setSelectedClassId(null); setEditingStudentId(null); }}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      adminTab === t.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {(adminTab === 'attendance' || adminTab === 'roster') && !selectedClassId && (
                <div className="space-y-3">
                  {adminTab === 'attendance' && (
                    <>
                      <div className="p-3 rounded-xl bg-white/95 border border-white flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">출석 기준일 선택</span>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                        />
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-300">
                            📊 {selectedDate} 전체 출석 합계
                          </span>
                          <span className="text-xs font-extrabold bg-emerald-500/20 text-emerald-200 px-2.5 py-0.5 rounded-full">
                            총 출석 {dailyAttendanceSummary.totalAttended}명 / 재적 {dailyAttendanceSummary.totalStudents}명
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                          <div className="bg-white/10 rounded-xl py-1.5">
                            <div className="text-[10px] text-slate-300">1부 출석</div>
                            <div className="text-sm font-extrabold text-emerald-400">{dailyAttendanceSummary.presentOnly}명</div>
                          </div>
                          <div className="bg-white/10 rounded-xl py-1.5">
                            <div className="text-[10px] text-slate-300">2부 예배</div>
                            <div className="text-sm font-extrabold text-sky-400">{dailyAttendanceSummary.secondOnly}명</div>
                          </div>
                          <div className="bg-white/10 rounded-xl py-1.5">
                            <div className="text-[10px] text-slate-300">결석</div>
                            <div className="text-sm font-extrabold text-rose-400">{dailyAttendanceSummary.absentCount}명</div>
                          </div>
                          <div className="bg-white/10 rounded-xl py-1.5">
                            <div className="text-[10px] text-slate-300">장결자</div>
                            <div className="text-sm font-extrabold text-amber-300">{dailyAttendanceSummary.longAbsentCount}명</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {CLASS_DISPLAY_ORDER.map((classId) => {
                      const cls = privateData.classes[classId];
                      if (!cls) return null;
                      const dayRec = privateData.attendanceRecords[selectedDate] || {};
                      const presentCnt = cls.students.filter(
                        (s) => dayRec[s.id]?.status === 'present' || dayRec[s.id]?.status === 'second'
                      ).length;

                      return (
                        <button
                          key={cls.id}
                          onClick={() => {
                            setSelectedClassId(cls.id);
                            setTeacherNameInput(cls.teacher);
                            setEditingTeacher(false);
                            setEditingStudentId(null);
                          }}
                          className="p-4 rounded-2xl bg-white/95 border border-white hover:border-emerald-500 text-center transition shadow-sm flex flex-col items-center justify-center gap-1"
                        >
                          <span className="text-lg font-extrabold text-slate-900">{cls.grade}</span>
                          <span className="text-xs font-semibold text-emerald-700">{cls.teacher}</span>
                          <span className="mt-1.5 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {adminTab === 'attendance'
                              ? `출석 ${presentCnt} / 재적 ${cls.students.length}명`
                              : `재적 ${cls.students.length}명`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {adminTab === 'attendance' && selectedClassId && (
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedClassId(null)}
                    aria-label="전체 학년 목록으로"
                    className="w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="p-3.5 rounded-2xl bg-slate-800 text-white">
                    <div className="text-base font-extrabold">{privateData.classes[selectedClassId].grade} 출석부</div>
                    <div className="text-xs text-slate-300">{privateData.classes[selectedClassId].teacher} · {selectedDate}</div>
                  </div>

                  <div className="space-y-2.5">
                    {privateData.classes[selectedClassId].students.map((stu) => {
                      const rec = privateData.attendanceRecords[selectedDate]?.[stu.id] || { status: '', reason: '' };
                      return (
                        <div key={stu.id} className="p-3.5 rounded-2xl bg-white/95 border border-white space-y-2.5 shadow-2xs">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-sm text-slate-900">{stu.name}</div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <span className="flex items-center gap-1"><Cake className="w-3 h-3 text-rose-400" /> {stu.birth}</span>
                                {stu.phone !== '-' ? (
                                  <a href={`tel:${stu.phone}`} className="flex items-center gap-1 text-sky-600 font-medium">
                                    <Phone className="w-3 h-3" /> {stu.phone}
                                  </a>
                                ) : (
                                  <span className="text-slate-400">번호 미등록</span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-1">
                              <button
                                onClick={() => setStudentAttendance(stu.id, 'present')}
                                className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition ${
                                  rec.status === 'present'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3 shrink-0" /> 출석
                              </button>
                              <button
                                onClick={() => setStudentAttendance(stu.id, 'second')}
                                className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition ${
                                  rec.status === 'second'
                                    ? 'bg-sky-600 text-white border-sky-600'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                <Clock className="w-3 h-3 shrink-0" /> 2부예배
                              </button>
                              <button
                                onClick={() => setStudentAttendance(stu.id, 'absent')}
                                className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition ${
                                  rec.status === 'absent'
                                    ? 'bg-rose-600 text-white border-rose-600'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                <XCircle className="w-3 h-3 shrink-0" /> 결석
                              </button>
                              <button
                                onClick={() => setStudentAttendance(stu.id, 'long_absent')}
                                className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition ${
                                  rec.status === 'long_absent'
                                    ? 'bg-amber-600 text-white border-amber-600'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                장결자
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            placeholder="특이사항 · 기도제목 · 결석사유 (예: 시험 앞두고 많이 힘들어함)"
                            value={rec.reason || ''}
                            onChange={(e) => setStudentNote(stu.id, e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs text-slate-800 focus:outline-none transition ${
                              rec.status === 'absent' || rec.status === 'long_absent'
                                ? 'bg-rose-50/70 border-rose-200 focus:border-rose-400'
                                : 'bg-slate-50/80 border-slate-200 focus:border-emerald-400'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {adminTab === 'roster' && selectedClassId && (
                <div className="space-y-4">
                  <button
                    onClick={() => { setSelectedClassId(null); setEditingStudentId(null); }}
                    aria-label="전체 학년 목록으로"
                    className="w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-2xs hover:bg-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="p-4 rounded-2xl bg-white/95 border border-white">
                    <div className="text-xs font-bold text-slate-500 mb-1.5">
                      {privateData.classes[selectedClassId].grade} 담당 선생님 성함
                    </div>
                    {!editingTeacher ? (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{privateData.classes[selectedClassId].teacher}</span>
                        <button
                          onClick={() => setEditingTeacher(true)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 font-semibold flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> 수정
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={teacherNameInput}
                          onChange={(e) => setTeacherNameInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        <button onClick={handleSaveTeacher} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                          저장
                        </button>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAddStudent} className="p-4 rounded-2xl bg-white/95 border border-emerald-200 space-y-2.5">
                    <div className="text-xs font-extrabold text-emerald-900 flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5" /> {privateData.classes[selectedClassId].grade} 새 학생 등록
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="이름"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        className="px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="생일(5.12)"
                        value={newStudent.birth}
                        onChange={(e) => setNewStudent({ ...newStudent, birth: e.target.value })}
                        className="px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="010-0000-0000"
                        value={newStudent.phone}
                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                        className="px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
                      + 명단에 학생 추가하기
                    </button>
                  </form>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">등록된 학생 ({privateData.classes[selectedClassId].students.length}명)</div>
                    {privateData.classes[selectedClassId].students.map((stu) => {
                      const isEditing = editingStudentId === stu.id;
                      return (
                        <div key={stu.id} className="p-3 rounded-xl bg-white/95 border border-white">
                          {isEditing ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-3 gap-1.5">
                                <input
                                  type="text"
                                  value={editStudentForm.name}
                                  onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                                  placeholder="이름"
                                  className="px-2.5 py-1.5 rounded-lg border border-emerald-400 text-xs font-bold bg-white"
                                />
                                <input
                                  type="text"
                                  value={editStudentForm.birth}
                                  onChange={(e) => setEditStudentForm({ ...editStudentForm, birth: e.target.value })}
                                  placeholder="생일(5.12)"
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                                />
                                <input
                                  type="text"
                                  value={editStudentForm.phone}
                                  onChange={(e) => setEditStudentForm({ ...editStudentForm, phone: e.target.value })}
                                  placeholder="연락처"
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                                />
                              </div>
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingStudentId(null)}
                                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold"
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditedStudent(stu.id)}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> 저장
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-bold text-slate-800">{stu.name}</div>
                                <div className="text-[11px] text-slate-500">생일: {stu.birth} · {stu.phone}</div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEditingStudent(stu)}
                                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                  title="학생 정보 수정"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudent(stu.id)}
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                                  title="학생 삭제"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {adminTab === 'stats' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-emerald-600 text-white">
                      <div className="text-xs text-emerald-100">전체 재적 인원</div>
                      <div className="text-2xl font-extrabold mt-1">{statsSummary.totalCount}명</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800 text-white">
                      <div className="text-xs text-slate-300">이번 달 평균 출석률</div>
                      <div className="text-2xl font-extrabold mt-1">{statsSummary.thisMonthRate}%</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/95 border border-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" /> 학년별 출석 현황
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {statsSummary.hasThisMonthData ? '이번 달 평균 기준' : '전체 기록 평균 기준'}
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {statsSummary.classStats.map((cls) => (
                        <div key={cls.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-800">{cls.grade}</span>
                              <span className="text-[11px] text-slate-400">({cls.teacher})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-medium text-slate-500">
                                {cls.avgPresent}/{cls.total}명
                              </span>
                              <span className="font-extrabold text-emerald-700 w-9 text-right">
                                {cls.rate}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(cls.rate, 100)}%` }}
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500">전체 재적 인원</span>
                      <span className="font-extrabold text-slate-800">총 {statsSummary.totalCount}명</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/95 border border-white space-y-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-600" /> 올해 월별 평균 출석률 (%)
                    </span>
                    <div className="grid grid-cols-6 gap-2 pt-2">
                      {statsSummary.monthlyRates.map((m, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-500">{m.rate}%</span>
                          <div className="w-full h-20 bg-slate-100 rounded-lg flex items-end overflow-hidden">
                            <div style={{ height: `${Math.max(m.rate, 6)}%` }} className={`w-full rounded-t-md ${m.rate > 0 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                          </div>
                          <span className="text-[10px] text-slate-600 font-medium">{m.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/95 border border-rose-200 space-y-2">
                    <div className="text-xs font-extrabold text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> 연속 결석 관심·심방 대상자
                    </div>
                    {statsSummary.consecutiveAbsentees.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {statsSummary.consecutiveAbsentees.map((stu) => (
                          <span key={stu.id} className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                            {stu.grade} {stu.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600">현재 2주 이상 연속 결석 중인 학생이 없습니다.</p>
                    )}
                  </div>

                  <button onClick={downloadCSV} className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 shadow-sm">
                    <Download className="w-4 h-4" /> 출석 통계 엑셀(CSV) 다운로드 (특이사항·출석률 포함)
                  </button>
                </div>
              )}

              {adminTab === 'content' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold text-amber-950 flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-amber-600" /> 깜짝 간식 당첨 이벤트
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        luckyEv.active && luckyRemaining > 0
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-300 text-slate-700'
                      }`}>
                        {luckyEv.active && luckyRemaining > 0 ? `진행 중 (남은 수량 ${luckyRemaining}명)` : '종료/대기'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">당첨 간식 이름</label>
                        <input
                          type="text"
                          value={eventPrizeInput}
                          onChange={(e) => setEventPrizeInput(e.target.value)}
                          placeholder="예: 빙그레 바나나우유 🍌"
                          className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-amber-900 mb-1">총 당첨 인원 (명)</label>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={eventMaxInput}
                            onChange={(e) => setEventMaxInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-amber-900 mb-1">접속 당첨 확률 (%)</label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={eventChanceInput}
                            onChange={(e) => setEventChanceInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveLuckyEvent(true)}
                        className="py-2.5 rounded-xl bg-amber-500 text-white text-xs font-extrabold hover:bg-amber-600"
                      >
                        🎉 이벤트 켜기 / 설정저장
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveLuckyEvent(false)}
                        className="py-2.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100/50"
                      >
                        이벤트 끄기
                      </button>
                    </div>

                    <div className="pt-2 border-t border-amber-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-amber-950">
                          당첨자 명단 ({luckyWinners.length}/{luckyEv.maxWinners || 0}명)
                        </span>
                        <button
                          type="button"
                          onClick={handleResetLuckyWinners}
                          className="text-[10px] font-bold text-rose-600 underline"
                        >
                          명단 초기화 & 재시작
                        </button>
                      </div>
                      {luckyWinners.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {luckyWinners.map((w, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-bold text-slate-800">
                              🎁 {w.name} <span className="text-[10px] text-slate-400">({w.time})</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-800/80">아직 당첨된 학생이 없습니다.</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/95 border border-white space-y-2">
                    <div className="text-xs font-extrabold text-slate-700">빠른 콘텐츠 편집 바로가기</div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => { setIsEditingPraise(true); setActiveTab('praise'); }}
                        className="py-2.5 px-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700"
                      >
                        찬양 수정 →
                      </button>
                      <button
                        onClick={() => { setIsEditingOrder(true); setActiveTab('order'); }}
                        className="py-2.5 px-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700"
                      >
                        기도/봉독 →
                      </button>
                      <button
                        onClick={() => { setIsEditingCalendar(true); setActiveTab('calendar'); }}
                        className="py-2.5 px-2 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-700"
                      >
                        이번 달 일정 →
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handlePhotoUpload} className="p-4 rounded-2xl bg-white/95 border border-white space-y-3">
                    <div className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-rose-500" /> 활동 사진첩 올리기 (여러 장 가능)
                      </span>
                      {photoFiles.length > 0 && (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          {photoFiles.length}장 선택됨
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="행사 제목 (예: 추수감사절 연합예배)"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="간단한 설명 (선택)"
                      value={photoDesc}
                      onChange={(e) => setPhotoDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      required
                      onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700"
                    />
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                    >
                      {isUploading ? `사진 ${photoFiles.length}장 업로드 중...` : '사진첩에 등록하기'}
                    </button>

                    {(publicData.photos || []).length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500">등록된 사진첩 앨범 관리</div>
                        {publicData.photos.map((alb) => (
                          <div key={alb.id} className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200/70">
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-800 truncate">{alb.title}</div>
                              <div className="text-[10px] text-slate-400">
                                {alb.date} · {(Array.isArray(alb.urls) ? alb.urls.length : 1)}장
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteAlbum(alb.id, alb.title)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[11px] font-bold hover:bg-rose-100 shrink-0 ml-2"
                            >
                              삭제
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </form>

                  <form onSubmit={handlePublishNewQuiz} className="p-4 rounded-2xl bg-white/95 border border-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" /> 새 주간 설교 퀴즈 출제
                      </div>
                      <button
                        type="button"
                        onClick={handleAddDraftQuestion}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-extrabold hover:bg-amber-200"
                      >
                        <Plus className="w-3.5 h-3.5" /> 문제 추가하기
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="퀴즈 제목 (예: 11월 4주 설교 복습 퀴즈)"
                      value={newQuizTitle}
                      onChange={(e) => setNewQuizTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="성경 본문 (예: 창세기 1:26-31)"
                      value={newQuizPassage}
                      onChange={(e) => setNewQuizPassage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />

                    <div className="space-y-3">
                      {draftQuestions.map((dq, qIdx) => (
                        <div key={qIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-700">문제 {qIdx + 1}</span>
                            {draftQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDraftQuestion(qIdx)}
                                className="text-[11px] font-bold text-rose-500 hover:underline"
                              >
                                삭제
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            required
                            placeholder={`Q${qIdx + 1}. 질문 내용을 입력하세요`}
                            value={dq.q}
                            onChange={(e) => handleUpdateDraftQuestion(qIdx, 'q', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            {dq.options.map((opt, optIdx) => (
                              <input
                                key={optIdx}
                                type="text"
                                required
                                placeholder={`보기 ${optIdx + 1}`}
                                value={opt}
                                onChange={(e) => handleUpdateDraftOption(qIdx, optIdx, e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs pt-0.5">
                            <span className="font-bold text-slate-600">정답 번호:</span>
                            <select
                              value={dq.answer}
                              onChange={(e) => handleUpdateDraftQuestion(qIdx, 'answer', Number(e.target.value))}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-bold"
                            >
                              <option value={0}>1번 보기</option>
                              <option value={1}>2번 보기</option>
                              <option value={2}>3번 보기</option>
                              <option value={3}>4번 보기</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button type="submit" className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
                      새 퀴즈 발행 ({draftQuestions.length}문제 · 완료자 초기화)
                    </button>
                  </form>

                  <div className="p-4 rounded-2xl bg-white/95 border border-white flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">미니게임 3종 랭킹 초기화</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("면류관 만들기, 성령의 비둘기, 바벨탑 쌓기 랭킹을 모두 초기화할까요?")) {
                          syncPublicData({ gameRanking: [], doveRanking: [], babelRanking: [] });
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                    >
                      전체 랭킹 초기화
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 하단 푸터 (인스타그램 로고 옆 종 모양 알림 버튼) */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/60 px-4 py-5 text-center space-y-3.5">
          <div className="flex items-center justify-center gap-4">
            <a
              href={CHURCH_LINKS.homepage}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="온양장로교회 홈페이지"
              className="w-12 h-12 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-emerald-600 hover:scale-105 transition"
            >
              <Globe className="w-6 h-6" />
            </a>
            <a
              href={CHURCH_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="온양장로교회 유튜브"
              className="w-12 h-12 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-rose-600 hover:scale-105 transition"
            >
              <Youtube className="w-6 h-6" />
            </a>
            <a
              href={CHURCH_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="온양장로교회 청소년부 인스타그램"
              className="w-12 h-12 rounded-full bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-pink-600 hover:scale-105 transition"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <button
              type="button"
              onClick={() => (pushEnabled ? setShowPushPopup(true) : handleRegisterPush())}
              aria-label="아침 말씀·퀴즈 알림 설정"
              title={pushEnabled ? "알림 등록됨 (설정 확인)" : "아침 말씀·퀴즈 알림 받기"}
              className={`w-12 h-12 rounded-full border shadow-sm flex items-center justify-center hover:scale-105 transition ${
                pushEnabled
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white border-slate-200/80 text-slate-600'
              }`}
            >
              <Bell className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <span>한국기독교장로회 온양장로교회 청소년부</span>
            <button
              onClick={() => (authRoles.admin ? setActiveTab('admin') : setPinModalRole('admin'))}
              title="교사·교역자 전용 페이지"
              className="p-1 text-rose-400 hover:text-rose-600 transition"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </footer>

        {/* 전체화면 감성 말씀카드 */}
        {showVerseCard && (
          <FullscreenVerseCard
            verseObj={todayVerse}
            onClose={() => setShowVerseCard(false)}
            onHideToday={hideVerseForToday}
          />
        )}

        {/* 첫 접속 알림 설정 팝업 (제안 1) */}
        {showPushPopup && (
          <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-base">
                  {pushEnabled ? '알림이 켜져 있어요!' : '말씀과 퀴즈 알림을 받아볼까요?'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  매일 아침 7시 오늘의 말씀과 새 주일 설교 퀴즈 소식을 스마트폰으로 보내드립니다.
                </p>
              </div>
              <div className="space-y-2">
                {!pushEnabled ? (
                  <button
                    type="button"
                    onClick={handleRegisterPush}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition"
                  >
                    🔔 알림 켜기
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPushPopup(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold transition"
                  >
                    확인
                  </button>
                )}
                <button
                  type="button"
                  onClick={dismissPushPopupToday}
                  className="w-full py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  오늘은 닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 팝업 2: 깜짝 간식 당첨 축하 팝업 */}
        {showLuckyWinPopup && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 shadow-2xl border-2 border-amber-300 space-y-4 text-center relative">
              <button
                onClick={() => setShowLuckyWinPopup(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-amber-100 text-amber-700"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-white flex items-center justify-center mx-auto shadow-md text-3xl">
                🎁
              </div>

              <div>
                <span className="inline-block px-3 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-extrabold mb-1.5">
                  SURPRISE EVENT!
                </span>
                <h3 className="text-xl font-black text-slate-900">축하합니다! 깜짝 당첨 🎉</h3>
                <p className="text-base font-extrabold text-amber-700 mt-1">{luckyEv.prizeName}</p>
              </div>

              {!luckyClaimed ? (
                <form onSubmit={handleClaimLuckyPrize} className="space-y-2.5">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    목사님이 기프티콘을 보내드릴 수 있도록<br />
                    <b>학년과 이름</b>을 지금 바로 입력해 주세요!
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="예: 중2 이주원"
                    value={luckyWinnerInput}
                    onChange={(e) => setLuckyWinnerInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 text-sm text-center font-bold bg-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-amber-500 text-white text-xs font-extrabold hover:bg-amber-600 shadow-sm"
                  >
                    당첨 명단에 이름 등록하기!
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                    ✨ {luckyWinnerInput} 친구 당첨 등록 완료!<br />
                    목사님 확인 후 간식을 보내드릴게요!
                  </div>
                  <button
                    onClick={() => setShowLuckyWinPopup(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                  >
                    확인
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 팝업 3: 역할별 비밀번호 인증 */}
        {pinModalRole && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handlePinSubmit} className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {pinModalRole === 'admin' && '교사·교역자 전용 인증'}
                  {pinModalRole === 'praise' && '찬양팀 학생 전용 인증'}
                  {(pinModalRole === 'officer' || pinModalRole === 'season') && '교역자·임원 전용 인증'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">담당 비밀번호 4자리를 입력하세요.</p>
              </div>
              <input
                type="password"
                maxLength={4}
                inputMode="numeric"
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-[0.5em] text-lg font-extrabold py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
              />
              {pinError && <p className="text-xs text-rose-600 font-semibold">비밀번호가 일치하지 않습니다.</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setPinModalRole(null); setPinInput(''); setPinError(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 팝업 4: 사진첩 크게 보기 (여러 장 슬라이드 & 좌우 스와이프 지원) */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative bg-slate-900 flex items-center justify-center">
                <img
                  src={selectedPhotoImages[selectedPhotoIdx] || selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full max-h-80 object-contain select-none"
                />

                {selectedPhotoImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoIdx((prev) => (prev - 1 + selectedPhotoImages.length) % selectedPhotoImages.length)
                      }
                      className="absolute left-2.5 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPhotoIdx((prev) => (prev + 1) % selectedPhotoImages.length)
                      }
                      className="absolute right-2.5 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-2.5 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[11px] font-bold">
                      {selectedPhotoIdx + 1} / {selectedPhotoImages.length}
                    </span>
                  </>
                )}
              </div>

              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900">{selectedPhoto.title}</h3>
                  <span className="text-[11px] text-slate-400">{selectedPhoto.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedPhoto.desc}</p>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="mt-2 w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
