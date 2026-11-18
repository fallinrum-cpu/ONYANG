import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import {
  Music, Calendar, BookOpen, Image as ImageIcon, Heart, Youtube, Instagram,
  ChevronRight, ChevronLeft, X, CheckCircle2, XCircle, Sparkles, Lock,
  Sun, UserPlus, Trash2, Edit3, BarChart3, AlertTriangle,
  Download, Award, Send, Camera, Phone, Cake, Globe, Loader2, Settings
} from 'lucide-react';

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
  adminPin: "1234",    // 목사님 & 선생님 전용
  praisePin: "2222",   // 찬양팀 학생 전용
  officerPin: "3333"   // 학생 임원 전용
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const STATE_DOC_REF = doc(db, "onyang_youth", "main_data");

// ==========================================
// 2. 교회력 6대 절기 (전체 배경 그라데이션 + 심플 카드 테마)
// ==========================================
const SEASONS = {
  creation: {
    name: '창조절',
    pageBg: 'from-emerald-100/90 via-teal-50 to-lime-100/80',
    outerBg: 'bg-emerald-50/60',
    cardBorder: 'border-emerald-200/80',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-600'
  },
  advent: {
    name: '대림절',
    pageBg: 'from-purple-100/90 via-indigo-50 to-violet-100/80',
    outerBg: 'bg-purple-50/60',
    cardBorder: 'border-purple-200/80',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    accentText: 'text-purple-700',
    accentBg: 'bg-purple-700'
  },
  christmas: {
    name: '성탄절',
    pageBg: 'from-amber-100/90 via-yellow-50/90 to-orange-100/70',
    outerBg: 'bg-amber-50/60',
    cardBorder: 'border-amber-200/90',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
    accentText: 'text-amber-700',
    accentBg: 'bg-amber-500'
  },
  epiphany: {
    name: '주현절',
    pageBg: 'from-teal-100/90 via-cyan-50 to-emerald-100/80',
    outerBg: 'bg-teal-50/60',
    cardBorder: 'border-teal-200/80',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
    accentText: 'text-teal-700',
    accentBg: 'bg-teal-600'
  },
  lent: {
    name: '사순절',
    pageBg: 'from-fuchsia-100/80 via-purple-50 to-rose-100/70',
    outerBg: 'bg-fuchsia-50/50',
    cardBorder: 'border-fuchsia-200/80',
    badgeBg: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200',
    accentText: 'text-fuchsia-800',
    accentBg: 'bg-fuchsia-700'
  },
  pentecost: {
    name: '성령강림절',
    pageBg: 'from-rose-100/90 via-orange-50 to-amber-100/80',
    outerBg: 'bg-rose-50/60',
    cardBorder: 'border-rose-200/80',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    accentText: 'text-rose-600',
    accentBg: 'bg-rose-600'
  }
};

const DAILY_VERSES = [
  { verse: "너희도 성령 안에서 하나님이 거하실 처소가 되기 위하여 그리스도 예수 안에서 함께 지어져 가느니라", ref: "에베소서 2:22", note: "우리 청소년부 한 사람 한 사람이 모여 아름다운 하나님의 집을 이루어 갑니다." },
  { verse: "네 시작은 미약하였으나 네 나중은 심히 창대하리라", ref: "욥기 8:7", note: "오늘의 작은 발걸음이 내일의 큰 은혜로 이어집니다." },
  { verse: "누구든지 네 연소함을 업신여기지 못하게 하고 오직 말과 행실과 사랑과 믿음과 정절에 있어서 믿는 자에게 본이 되어", ref: "디모데전서 4:12", note: "학교와 가정에서 빛과 소금으로 살아가는 청소년부를 응원합니다." },
  { verse: "여호와는 나의 목자시니 내게 부족함이 없으리로다", ref: "시편 23:1", note: "주님이 우리의 길을 가장 선하게 인도하십니다." },
  { verse: "두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라", ref: "이사야 41:10", note: "시험과 진로 앞에서도 주님이 너의 손을 꼭 붙잡고 계십니다." },
  { verse: "너희는 세상의 빛이라 산 위에 있는 동네가 숨겨지지 못할 것이요", ref: "마태복음 5:14", note: "여러분이 머무는 자리가 주님의 사랑으로 환해지길 기도합니다." },
  { verse: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라", ref: "데살로니가전서 5:16-18", note: "오늘 하루 감사의 제목 하나를 찾아 하나님께 고백해 보세요." }
];

const INITIAL_DATA = {
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
    thisWeek: { date: '이번 주일', prayer: '이서연 (고1)', scripture: '김민준 (중2)', passage: '에베소서 2:19-22' },
    nextWeek: { date: '다음 주일', prayer: '박지훈 (고2)', scripture: '최유진 (중3)', passage: '창세기 1:26-31' }
  },
  photos: [
    { id: 1, title: '가을 야외 예배 및 바비큐 파티', date: '2026.10.18', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80', desc: '맑은 가을 하늘 아래 함께 웃고 뛰며 교제했던 행복한 시간이었습니다.' },
    { id: 2, title: '찬양팀 특별 연습 현장', date: '2026.11.07', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', desc: '주일 예배를 사모하며 기도로 준비하는 청소년부 찬양팀!' }
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
    completers: ['중2 김민준', '고1 이서연', '중3 최유진', '고2 박지훈', '중1 정하은', '고3 강현우']
  },
  classes: {
    m1: { id: 'm1', grade: '중1', teacher: '김은혜 선생님', students: [{ id: 's1', name: '정하은', birth: '03.14', phone: '010-1234-5671' }] },
    m2: { id: 'm2', grade: '중2', teacher: '박준영 선생님', students: [{ id: 's3', name: '김민준', birth: '05.09', phone: '010-2345-6781' }] },
    m3: { id: 'm3', grade: '중3', teacher: '이수진 선생님', students: [{ id: 's5', name: '최유진', birth: '02.18', phone: '010-3456-7891' }] },
    h1: { id: 'h1', grade: '고1', teacher: '정성훈 선생님', students: [{ id: 's6', name: '이서연', birth: '08.25', phone: '010-4567-8901' }] },
    h2: { id: 'h2', grade: '고2', teacher: '최지민 선생님', students: [{ id: 's7', name: '박지훈', birth: '04.12', phone: '010-5678-9012' }] },
    h3: { id: 'h3', grade: '고3', teacher: '윤태호 선생님', students: [{ id: 's8', name: '강현우', birth: '09.03', phone: '010-6789-0123' }] }
  },
  attendanceRecords: {}
};

const getTodayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getLatestSundayStr = () => {
  const now = new Date();
  const sun = new Date(now.setDate(now.getDate() - now.getDay()));
  return `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}`;
};

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showVersePopup, setShowVersePopup] = useState(false);

  // 역할별 인증 상태
  const [pinModalRole, setPinModalRole] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [authRoles, setAuthRoles] = useState({ admin: false, praise: false, officer: false });

  // 편집 모드 토글
  const [isEditingPraise, setIsEditingPraise] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isEditingCalendar, setIsEditingCalendar] = useState(false);

  // 새 찬양 입력 폼
  const [newSong, setNewSong] = useState({ title: '', artist: '', key: '', url: '' });

  // 관리자 하위 탭
  const [adminTab, setAdminTab] = useState('attendance');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLatestSundayStr());

  // 명단 추가/수정 폼 상태
  const [newStudent, setNewStudent] = useState({ name: '', birth: '', phone: '' });
  const [editingTeacher, setEditingTeacher] = useState(false);
  const [teacherNameInput, setTeacherNameInput] = useState('');

  // 사진 업로드 상태
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // 퀴즈 참여 상태
  const [quizStudentName, setQuizStudentName] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // 퀴즈 출제 폼 상태
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizPassage, setNewQuizPassage] = useState('');
  const [newQuizQ, setNewQuizQ] = useState('');
  const [newQuizOpts, setNewQuizOpts] = useState(['', '', '', '']);
  const [newQuizAns, setNewQuizAns] = useState(0);

  // Firebase 실시간 동기화
  useEffect(() => {
    const unsubscribe = onSnapshot(STATE_DOC_REF, async (snapshot) => {
      if (snapshot.exists()) {
        setData((prev) => ({ ...prev, ...snapshot.data() }));
      } else {
        await setDoc(STATE_DOC_REF, INITIAL_DATA);
      }
      setIsLoaded(true);
    }, (error) => {
      console.error("Firebase 연결 오류:", error);
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const syncDataToCloud = async (updatedFields) => {
    const nextData = { ...data, ...updatedFields };
    setData(nextData);
    try {
      await setDoc(STATE_DOC_REF, nextData, { merge: true });
    } catch (err) {
      console.error("데이터 저장 실패:", err);
      alert("저장에 실패했습니다. 인터넷 연결을 확인해 주세요.");
    }
  };

  useEffect(() => {
    const today = getTodayStr();
    if (localStorage.getItem('onyang_verse_hidden_date') !== today) {
      setShowVersePopup(true);
    }
  }, []);

  const todayVerse = useMemo(() => {
    return DAILY_VERSES[new Date().getDate() % DAILY_VERSES.length];
  }, []);

  const hideVerseForToday = () => {
    localStorage.setItem('onyang_verse_hidden_date', getTodayStr());
    setShowVersePopup(false);
  };

  const currentSeason = SEASONS[data.season] || SEASONS.creation;

  const cycleSeason = () => {
    const keys = Object.keys(SEASONS);
    const nextIdx = (keys.indexOf(data.season) + 1) % keys.length;
    syncDataToCloud({ season: keys[nextIdx] });
  };

  // 역할별 PIN 확인
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
    } else {
      setPinError(true);
    }
  };

  // 찬양 추가 / 삭제 / 기본 3곡 초기화
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
    syncDataToCloud({ praises: [...data.praises, songObj] });
    setNewSong({ title: '', artist: '', key: '', url: '' });
  };

  const handleDeleteSong = (songId) => {
    syncDataToCloud({ praises: data.praises.filter((s) => s.id !== songId) });
  };

  const handleResetPraises = () => {
    if (!window.confirm("찬양 목록을 새로 등록하신 3곡으로 초기화할까요?")) return;
    syncDataToCloud({ praises: INITIAL_DATA.praises });
  };

  // 예배 순서 & 일정 수정
  const handleOrderChange = (weekKey, field, val) => {
    syncDataToCloud({
      worshipOrder: {
        ...data.worshipOrder,
        [weekKey]: { ...data.worshipOrder[weekKey], [field]: val }
      }
    });
  };

  const handleCalendarChange = (idx, field, val) => {
    const updated = data.calendar.map((item, i) => (i === idx ? { ...item, [field]: val } : item));
    syncDataToCloud({ calendar: updated });
  };

  // 출석 상태 및 사유 변경
  const setStudentAttendance = (studentId, status) => {
    const dayRecord = data.attendanceRecords[selectedDate] || {};
    const prevStudentRec = dayRecord[studentId] || { status: 'present', reason: '' };
    syncDataToCloud({
      attendanceRecords: {
        ...data.attendanceRecords,
        [selectedDate]: { ...dayRecord, [studentId]: { ...prevStudentRec, status } }
      }
    });
  };

  const setStudentReason = (studentId, reason) => {
    const dayRecord = data.attendanceRecords[selectedDate] || {};
    const prevStudentRec = dayRecord[studentId] || { status: 'absent', reason: '' };
    syncDataToCloud({
      attendanceRecords: {
        ...data.attendanceRecords,
        [selectedDate]: { ...dayRecord, [studentId]: { ...prevStudentRec, status: 'absent', reason } }
      }
    });
  };

  // 학생 추가 / 삭제 / 담임교사 수정
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !selectedClassId) return;
    const targetClass = data.classes[selectedClassId];
    const added = {
      id: 'stu_' + Date.now(),
      name: newStudent.name.trim(),
      birth: newStudent.birth.trim() || '-',
      phone: newStudent.phone.trim() || '-'
    };
    syncDataToCloud({
      classes: {
        ...data.classes,
        [selectedClassId]: { ...targetClass, students: [...targetClass.students, added] }
      }
    });
    setNewStudent({ name: '', birth: '', phone: '' });
  };

  const handleDeleteStudent = (studentId) => {
    if (!window.confirm("정말 이 학생을 명단에서 삭제하시겠습니까?")) return;
    const targetClass = data.classes[selectedClassId];
    syncDataToCloud({
      classes: {
        ...data.classes,
        [selectedClassId]: { ...targetClass, students: targetClass.students.filter(s => s.id !== studentId) }
      }
    });
  };

  const handleSaveTeacher = () => {
    if (!teacherNameInput.trim() || !selectedClassId) return;
    syncDataToCloud({
      classes: {
        ...data.classes,
        [selectedClassId]: { ...data.classes[selectedClassId], teacher: teacherNameInput.trim() }
      }
    });
    setEditingTeacher(false);
  };

  // Cloudinary 사진 업로드
  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoTitle.trim() || !photoFile) {
      alert("사진 제목과 이미지 파일을 모두 선택해 주세요.");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', photoFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (!result.secure_url) throw new Error("업로드 응답 오류");

      const newPhoto = {
        id: Date.now(),
        title: photoTitle.trim(),
        date: getTodayStr().replace(/-/g, '.'),
        url: result.secure_url,
        desc: photoDesc.trim() || '함께 지어져 가는 온양장로교회 청소년부 활동 사진입니다.'
      };
      await syncDataToCloud({ photos: [newPhoto, ...data.photos] });
      setPhotoTitle('');
      setPhotoDesc('');
      setPhotoFile(null);
      alert("사진첩에 성공적으로 등록되었습니다!");
    } catch (err) {
      console.error(err);
      alert("사진 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  // 퀴즈 제출 & 발행
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    if (!quizStudentName.trim()) {
      alert("학년과 이름을 입력해 주세요! (예: 중2 김민준)");
      return;
    }
    const nameBadge = quizStudentName.trim();
    const updatedCompleters = data.quiz.completers.includes(nameBadge)
      ? data.quiz.completers
      : [nameBadge, ...data.quiz.completers];

    syncDataToCloud({ quiz: { ...data.quiz, completers: updatedCompleters } });
    setQuizSubmitted(true);
  };

  const handlePublishNewQuiz = (e) => {
    e.preventDefault();
    if (!newQuizTitle.trim() || !newQuizQ.trim()) return;
    syncDataToCloud({
      quiz: {
        title: newQuizTitle.trim(),
        passage: newQuizPassage.trim() || '주일 설교 본문',
        questions: [{
          q: newQuizQ.trim(),
          options: newQuizOpts.map((o, i) => o.trim() || `보기 ${i + 1}`),
          answer: Number(newQuizAns)
        }],
        completers: []
      }
    });
    setNewQuizTitle('');
    setNewQuizPassage('');
    setNewQuizQ('');
    setNewQuizOpts(['', '', '', '']);
    alert("새 설교 퀴즈가 등록되었으며 완료자 명단이 초기화되었습니다!");
  };

  // 출석 통계 계산
  const statsSummary = useMemo(() => {
    const allStudents = Object.values(data.classes).flatMap(c => c.students.map(s => ({ ...s, grade: c.grade })));
    const totalCount = allStudents.length;
    const dates = Object.keys(data.attendanceRecords).sort();
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = getTodayStr().slice(0, 7);

    const monthlyRates = Array.from({ length: 12 }, (_, idx) => {
      const mStr = `${currentYear}-${String(idx + 1).padStart(2, '0')}`;
      const mDates = dates.filter(d => d.startsWith(mStr));
      if (mDates.length === 0 || totalCount === 0) return { month: `${idx + 1}월`, rate: 0 };
      let presentSum = 0;
      mDates.forEach(d => {
        presentSum += Object.values(data.attendanceRecords[d] || {}).filter(r => r.status === 'present').length;
      });
      return { month: `${idx + 1}월`, rate: Math.round((presentSum / (mDates.length * totalCount)) * 100) };
    });

    const thisMonthDates = dates.filter(d => d.startsWith(currentMonth));
    let thisMonthRate = 0;
    if (thisMonthDates.length > 0 && totalCount > 0) {
      let sum = 0;
      thisMonthDates.forEach(d => {
        sum += Object.values(data.attendanceRecords[d] || {}).filter(r => r.status === 'present').length;
      });
      thisMonthRate = Math.round((sum / (thisMonthDates.length * totalCount)) * 100);
    }

    const recentTwoDates = dates.slice(-2);
    const consecutiveAbsentees = recentTwoDates.length === 2
      ? allStudents.filter(stu => recentTwoDates.every(d => data.attendanceRecords[d]?.[stu.id]?.status === 'absent'))
      : [];

    return { totalCount, thisMonthRate, monthlyRates, consecutiveAbsentees };
  }, [data.classes, data.attendanceRecords]);

  // 업그레이드된 엑셀(CSV) 다운로드: 총 출석일, 총 결석일, 출석률(%) 자동 합산 포함
  const downloadCSV = () => {
    const allStudents = Object.values(data.classes).flatMap(c => c.students.map(s => ({ ...s, grade: c.grade })));
    const dates = Object.keys(data.attendanceRecords).sort();
    let csv = '\uFEFF학년,이름,생일,연락처,총 출석일,총 결석일,출석률(%),' + dates.join(',') + '\n';

    allStudents.forEach(stu => {
      let presentCount = 0;
      let absentCount = 0;
      const dateCols = dates.map(d => {
        const rec = data.attendanceRecords[d]?.[stu.id];
        if (!rec) return '-';
        if (rec.status === 'present') {
          presentCount++;
          return '출석';
        } else {
          absentCount++;
          return `결석(${rec.reason || '사유없음'})`;
        }
      });

      const totalRecorded = presentCount + absentCount;
      const rate = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 100) + '%' : '0%';

      const row = [
        stu.grade,
        stu.name,
        stu.birth,
        stu.phone,
        `${presentCount}회`,
        `${absentCount}회`,
        rate,
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

  return (
    <div className={`min-h-screen ${currentSeason.outerBg} transition-colors duration-700 flex justify-center`}>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marqueeScroll 18s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 전체 앱 프레임: 절기에 따라 전체 배경 그라데이션이 은은하고 화사하게 변경됨 */}
      <div className={`w-full max-w-md min-h-screen bg-gradient-to-b ${currentSeason.pageBg} transition-all duration-700 shadow-xl flex flex-col justify-between relative overflow-x-hidden`}>
        
        {/* 상단 고정 헤더 */}
        <header className="sticky top-0 z-30 bg-white/75 backdrop-blur-md border-b border-white/60 px-4 py-3 flex items-center justify-between">
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
            onClick={() => setShowVersePopup(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 text-amber-800 border border-amber-200/80 text-xs font-semibold shadow-2xs hover:bg-amber-50 transition shrink-0"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>오늘의 말씀</span>
          </button>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 p-4 space-y-4 pb-10">
          
          {/* ========================================== */}
          {/* HOME 화면 */}
          {/* ========================================== */}
          {activeTab === 'home' && (
            <>
              {/* 심플한 표어 카드 (전체 배경색과 조화를 이루는 깔끔한 글래스 박스) */}
              <div className={`rounded-3xl p-5 bg-white/85 backdrop-blur-md border ${currentSeason.cardBorder} shadow-sm transition-all duration-500`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    2026 청소년부 표어
                  </span>
                  <button
                    onClick={cycleSeason}
                    title="클릭하여 교회력 절기 배경 변경"
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition ${currentSeason.badgeBg}`}
                  >
                    절기: {currentSeason.name} ↻
                  </button>
                </div>

                <h1 className="text-[22px] sm:text-2xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap mb-1.5">
                  함께 지어져 가는 청소년부
                </h1>
                <p className={`text-xs font-medium ${currentSeason.accentText}`}>
                  "그리스도 예수 안에서 함께 지어져 가느니라" (엡 2:22)
                </p>
              </div>

              {/* 이번 주 주일 예배 순서 요약 카드 */}
              <div className="bg-white/85 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-2xs">
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
                    <div className="text-sm font-bold text-slate-800">{data.worshipOrder.thisWeek.prayer}</div>
                  </div>
                  <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-400 mb-0.5">성경봉독 ({data.worshipOrder.thisWeek.passage})</div>
                    <div className="text-sm font-bold text-slate-800">{data.worshipOrder.thisWeek.scripture}</div>
                  </div>
                </div>
              </div>

              {/* 주간 설교 말씀 퀴즈 ('도전하기 →') */}
              <div
                onClick={() => { setActiveTab('quiz'); setQuizSubmitted(false); }}
                className="cursor-pointer rounded-2xl bg-slate-900/95 backdrop-blur-md text-white p-4 shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
                      <Award className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs text-amber-300 font-semibold">주중 말씀 복습 챌린지</div>
                      <h2 className="text-sm font-bold">{data.quiz.title}</h2>
                    </div>
                  </div>
                  <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-semibold">
                    도전하기 →
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 overflow-hidden">
                  <div className="text-[10px] text-slate-400 mb-1.5">
                    🎉 이번 주 퀴즈 완료 친구들 ({data.quiz.completers.length}명)
                  </div>
                  {data.quiz.completers.length > 0 ? (
                    <div className="overflow-hidden relative w-full">
                      <div className="animate-marquee gap-2">
                        {[...data.quiz.completers, ...data.quiz.completers].map((name, i) => (
                          <span
                            key={i}
                            className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-medium whitespace-nowrap"
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

              {/* 4대 핵심 메뉴 그리드 ('이번 달 청소년부' 반영) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('praise')}
                  className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 text-left hover:bg-white transition shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">이번 달 찬양</div>
                  <div className="text-xs text-slate-500 mt-0.5">곡 리스트 & 유튜브 듣기</div>
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 text-left hover:bg-white transition shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">이번 달 청소년부</div>
                  <div className="text-xs text-slate-500 mt-0.5">주차별 예배 및 행사 안내</div>
                </button>

                <button
                  onClick={() => setActiveTab('order')}
                  className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 text-left hover:bg-white transition shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">성경봉독 / 기도</div>
                  <div className="text-xs text-slate-500 mt-0.5">주일 예배 순서 및 본문</div>
                </button>

                <button
                  onClick={() => setActiveTab('photo')}
                  className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 text-left hover:bg-white transition shadow-2xs group"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">활동 사진첩</div>
                  <div className="text-xs text-slate-500 mt-0.5">함께한 은혜의 순간들</div>
                </button>
              </div>
            </>
          )}

          {/* ========================================== */}
          {/* 1. 이번 달 찬양 화면 */}
          {/* ========================================== */}
          {activeTab === 'praise' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button onClick={() => { setActiveTab('home'); setIsEditingPraise(false); }} className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full">
                  <ChevronLeft className="w-4 h-4" /> 홈으로
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

              <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-white/80">
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
                {data.praises.map((song, idx) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-2xs"
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

          {/* ========================================== */}
          {/* 2. 이번 달 청소년부 (월력) 화면 */}
          {/* ========================================== */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button onClick={() => { setActiveTab('home'); setIsEditingCalendar(false); }} className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full">
                  <ChevronLeft className="w-4 h-4" /> 홈으로
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

              <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-white/80">
                <h2 className="text-xl font-extrabold text-slate-900">이번 달 청소년부</h2>
                <p className="text-xs text-slate-500 mt-1">주별 특별 프로그램과 예배 일정을 확인하세요.</p>
              </div>

              <div className="space-y-3">
                {data.calendar.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 space-y-2 shadow-2xs">
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

          {/* ========================================== */}
          {/* 3. 성경봉독 / 기도자 화면 */}
          {/* ========================================== */}
          {activeTab === 'order' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button onClick={() => { setActiveTab('home'); setIsEditingOrder(false); }} className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full">
                  <ChevronLeft className="w-4 h-4" /> 홈으로
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

              <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-white/80">
                <h2 className="text-xl font-extrabold text-slate-900">성경봉독 및 대표기도</h2>
              </div>

              {['thisWeek', 'nextWeek'].map((wk) => {
                const isThis = wk === 'thisWeek';
                const orderObj = data.worshipOrder[wk];
                return (
                  <div
                    key={wk}
                    className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 space-y-3 shadow-2xs"
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

          {/* ========================================== */}
          {/* 4. 사진첩 화면 */}
          {/* ========================================== */}
          {activeTab === 'photo' && (
            <div className="space-y-4">
              <button onClick={() => setActiveTab('home')} className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full">
                <ChevronLeft className="w-4 h-4" /> 홈으로 돌아가기
              </button>
              <div className="bg-white/85 backdrop-blur-md p-4 rounded-2xl border border-white/80">
                <h2 className="text-xl font-extrabold text-slate-900">청소년부 사진첩</h2>
                <p className="text-xs text-slate-500 mt-1">사진을 누르면 크게 볼 수 있습니다.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {data.photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="cursor-pointer rounded-2xl overflow-hidden border border-white/80 bg-white/95 shadow-sm hover:shadow-md transition"
                  >
                    <img src={photo.url} alt={photo.title} className="w-full h-32 object-cover" />
                    <div className="p-2.5">
                      <div className="text-xs font-bold text-slate-800 truncate">{photo.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{photo.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 5. 주간 설교 말씀 퀴즈 참여 화면 */}
          {/* ========================================== */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <button onClick={() => setActiveTab('home')} className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full">
                <ChevronLeft className="w-4 h-4" /> 홈으로 돌아가기
              </button>
              <div className="p-4 rounded-2xl bg-slate-900 text-white">
                <div className="text-xs text-amber-300 font-semibold">{data.quiz.passage}</div>
                <h2 className="text-lg font-extrabold mt-0.5">{data.quiz.title}</h2>
              </div>

              <form onSubmit={handleQuizSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/90 border border-white/80">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    내 학년과 이름 (명단에 올라가요!)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 중2 김민준"
                    value={quizStudentName}
                    onChange={(e) => setQuizStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {data.quiz.questions.map((item, qIdx) => (
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

          {/* ========================================== */}
          {/* 6. 교사 / 목사님 전용 전체 관리자 페이지 */}
          {/* ========================================== */}
          {activeTab === 'admin' && authRoles.admin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setActiveTab('home'); setSelectedClassId(null); }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" /> 학생 화면으로
                </button>
                <span className="text-xs font-bold text-rose-600 bg-white/90 px-2.5 py-1 rounded-full">
                  교사·교역자 전체 관리
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 bg-white/80 backdrop-blur-md p-1 rounded-xl">
                {[
                  { id: 'attendance', label: '출석체크' },
                  { id: 'roster', label: '명단관리' },
                  { id: 'stats', label: '출석통계' },
                  { id: 'content', label: '콘텐츠관리' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setAdminTab(t.id); setSelectedClassId(null); }}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      adminTab === t.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* (A) 출석 체크 & (B) 반별 명단 관리: 2x3 학년 배열 */}
              {(adminTab === 'attendance' || adminTab === 'roster') && !selectedClassId && (
                <div className="space-y-3">
                  {adminTab === 'attendance' && (
                    <div className="p-3 rounded-xl bg-white/90 border border-white flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">출석 기준일 선택</span>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(data.classes).map((cls) => {
                      const dayRec = data.attendanceRecords[selectedDate] || {};
                      const presentCnt = cls.students.filter(s => dayRec[s.id]?.status === 'present').length;

                      return (
                        <button
                          key={cls.id}
                          onClick={() => {
                            setSelectedClassId(cls.id);
                            setTeacherNameInput(cls.teacher);
                            setEditingTeacher(false);
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

              {/* 반 선택 후: 출석 체크 */}
              {adminTab === 'attendance' && selectedClassId && (
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedClassId(null)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4" /> 전체 학년(2×3) 목록으로
                  </button>

                  <div className="p-3.5 rounded-2xl bg-slate-800 text-white">
                    <div className="text-base font-extrabold">{data.classes[selectedClassId].grade} 출석부</div>
                    <div className="text-xs text-slate-300">{data.classes[selectedClassId].teacher} · {selectedDate}</div>
                  </div>

                  <div className="space-y-2.5">
                    {data.classes[selectedClassId].students.map((stu) => {
                      const rec = data.attendanceRecords[selectedDate]?.[stu.id] || { status: '', reason: '' };
                      return (
                        <div key={stu.id} className="p-3.5 rounded-2xl bg-white/95 border border-white space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-sm text-slate-900">{stu.name}</div>
                              <div className="flex items-center gap-2.5 text-[11px] text-slate-500 mt-0.5">
                                <span className="flex items-center gap-1"><Cake className="w-3 h-3 text-rose-400" /> {stu.birth}</span>
                                <a href={`tel:${stu.phone}`} className="flex items-center gap-1 text-sky-600 font-medium">
                                  <Phone className="w-3 h-3" /> {stu.phone}
                                </a>
                              </div>
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setStudentAttendance(stu.id, 'present')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                                  rec.status === 'present'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> 출석
                              </button>
                              <button
                                onClick={() => setStudentAttendance(stu.id, 'absent')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                                  rec.status === 'absent'
                                    ? 'bg-rose-600 text-white border-rose-600'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                <XCircle className="w-3.5 h-3.5" /> 결석
                              </button>
                            </div>
                          </div>

                          {rec.status === 'absent' && (
                            <input
                              type="text"
                              placeholder="결석 사유를 입력하세요 (예: 가족 행사, 몸살, 시험기간)"
                              value={rec.reason || ''}
                              onChange={(e) => setStudentReason(stu.id, e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-slate-800 focus:outline-none focus:border-rose-400"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 반 선택 후: 명단 관리 */}
              {adminTab === 'roster' && selectedClassId && (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedClassId(null)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white/80 px-3 py-1.5 rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4" /> 전체 학년(2×3) 목록으로
                  </button>

                  <div className="p-4 rounded-2xl bg-white/95 border border-white">
                    <div className="text-xs font-bold text-slate-500 mb-1.5">
                      {data.classes[selectedClassId].grade} 담당 선생님 성함
                    </div>
                    {!editingTeacher ? (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{data.classes[selectedClassId].teacher}</span>
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
                      <UserPlus className="w-3.5 h-3.5" /> {data.classes[selectedClassId].grade} 새 학생 등록
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
                        placeholder="생일(05.12)"
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
                    <div className="text-xs font-bold text-slate-700">등록된 학생 ({data.classes[selectedClassId].students.length}명)</div>
                    {data.classes[selectedClassId].students.map((stu) => (
                      <div key={stu.id} className="p-3 rounded-xl bg-white/95 border border-white flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-800">{stu.name}</div>
                          <div className="text-[11px] text-slate-500">생일: {stu.birth} · {stu.phone}</div>
                        </div>
                        <button onClick={() => handleDeleteStudent(stu.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* (C) 출석 통계 & 업그레이드 엑셀 다운로드 */}
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
                        {statsSummary.consecutiveAbsentees.map(stu => (
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
                    <Download className="w-4 h-4" /> 출석 통계 엑셀(CSV) 다운로드 (출석률 자동합산)
                  </button>
                </div>
              )}

              {/* (D) 콘텐츠 관리 */}
              {adminTab === 'content' && (
                <div className="space-y-4">
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
                    <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-rose-500" /> 활동 사진첩 새 사진 올리기
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
                      required
                      onChange={(e) => setPhotoFile(e.target.files[0])}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700"
                    />
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                    >
                      {isUploading ? '클라우드에 사진 업로드 중...' : '사진첩에 등록하기'}
                    </button>
                  </form>

                  <form onSubmit={handlePublishNewQuiz} className="p-4 rounded-2xl bg-white/95 border border-white space-y-3">
                    <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" /> 새 주간 설교 퀴즈 출제
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="퀴즈 제목 (예: 11월 3주 설교 복습 퀴즈)"
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
                    <input
                      type="text"
                      required
                      placeholder="질문 내용을 입력하세요"
                      value={newQuizQ}
                      onChange={(e) => setNewQuizQ(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {newQuizOpts.map((opt, idx) => (
                        <input
                          key={idx}
                          type="text"
                          required
                          placeholder={`보기 ${idx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const copy = [...newQuizOpts];
                            copy[idx] = e.target.value;
                            setNewQuizOpts(copy);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">정답 번호 선택:</span>
                      <select
                        value={newQuizAns}
                        onChange={(e) => setNewQuizAns(Number(e.target.value))}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-bold"
                      >
                        <option value={0}>1번 보기</option>
                        <option value={1}>2번 보기</option>
                        <option value={2}>3번 보기</option>
                        <option value={3}>4번 보기</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800">
                      새 퀴즈 발행 (완료자 명단 초기화)
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 하단 푸터: 큼직한 원형 로고 3개 */}
        <footer className="bg-white/70 backdrop-blur-md border-t border-white/60 px-4 py-5 text-center space-y-3.5">
          <div className="flex items-center justify-center gap-5">
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

        {/* 팝업 1: 매일 아침 오늘의 말씀 */}
        {showVersePopup && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 relative">
              <button
                onClick={() => setShowVersePopup(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" /> 오늘의 말씀
              </div>

              <blockquote className="text-base font-bold text-slate-900 leading-relaxed">
                "{todayVerse.verse}"
              </blockquote>
              <div className="text-xs font-extrabold text-emerald-700">— {todayVerse.ref}</div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl leading-relaxed">
                {todayVerse.note}
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={hideVerseForToday}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
                >
                  오늘 하루 보지 않기
                </button>
                <button
                  onClick={() => setShowVersePopup(false)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  아멘!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 팝업 2: 역할별 비밀번호 인증 */}
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
                  {pinModalRole === 'officer' && '청소년부 임원 전용 인증'}
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

        {/* 팝업 3: 사진첩 크게 보기 */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <img src={selectedPhoto.url} alt={selectedPhoto.title} className="w-full max-h-80 object-cover" />
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
