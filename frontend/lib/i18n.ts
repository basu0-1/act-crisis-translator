import { LanguageCode } from '@/types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  // Nav
  navHome: string;
  navHowItWorks: string;
  navFeatures: string;
  navSafety: string;
  navDemo: string;
  navLogin: string;
  navRegister: string;
  navDashboard: string;
  navProfile: string;
  navSettings: string;
  navAdmin: string;
  navLogout: string;

  // Hero
  heroTitle: string;
  heroSubtitle: string;
  heroGetStarted: string;
  heroTryDemo: string;
  heroPipelineAlert: string;
  heroPipelineRisk: string;
  heroPipelineAction: string;
  heroPipelineRoute: string;
  heroPipelineShelter: string;

  // Core Questions
  qWhatHappened: string;
  qHowAffectsMe: string;
  qDoNow: string;
  qDoNext: string;
  qAvoid: string;
  qIfThen: string;

  // Status & Badges
  statusDemo: string;
  statusLive: string;
  statusCached: string;
  statusOffline: string;
  statusUnavailable: string;
  prototypeScoreNote: string;
  safetyDisclaimer: string;

  // Dashboard Sections
  sectionEmergencyStatus: string;
  sectionPersonalRisk: string;
  sectionSafeRoute: string;
  sectionRecommendedShelter: string;
  sectionRecentUpdates: string;

  // Risk levels
  riskLow: string;
  riskModerate: string;
  riskHigh: string;
  riskCritical: string;
  actionWindow: string;

  // Mobility
  mobilityNormal: string;
  mobilityLimited: string;
  mobilityWheelchair: string;

  // Route & Recalculation
  recalculatePrompt: string;
  recalculating: string;
  recalculatedAlert: string;
  blockedNotice: string;
  distance: string;
  estimatedTime: string;

  // Shelter
  capacity: string;
  availableSpots: string;
  wheelchairAccessible: string;
  medicalSupportAvailable: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: 'ACT — Actionable Crisis Translator',
    tagline: 'Turn emergency information into clear personal decisions.',
    navHome: 'Home',
    navHowItWorks: 'How It Works',
    navFeatures: 'Features',
    navSafety: 'Safety & Trust',
    navDemo: 'Live Demo',
    navLogin: 'Login',
    navRegister: 'Get Started',
    navDashboard: 'Dashboard',
    navProfile: 'Profile',
    navSettings: 'Settings',
    navAdmin: 'Admin Console',
    navLogout: 'Logout',

    heroTitle: 'Turn emergency information into clear personal decisions.',
    heroSubtitle: 'ACT helps people understand emergencies, assess personal risk, find safer routes, and identify nearby shelters in real time.',
    heroGetStarted: 'Get Started',
    heroTryDemo: 'Try Interactive Demo',
    heroPipelineAlert: 'ALERT',
    heroPipelineRisk: 'RISK',
    heroPipelineAction: 'ACTION',
    heroPipelineRoute: 'ROUTE',
    heroPipelineShelter: 'SHELTER',

    qWhatHappened: 'What is happening?',
    qHowAffectsMe: 'How does it affect me?',
    qDoNow: 'What should I do NOW?',
    qDoNext: 'What should I do NEXT?',
    qAvoid: 'What should I AVOID?',
    qIfThen: 'What should I do IF the situation changes?',

    statusDemo: 'SIMULATED / DEMO SCENARIO',
    statusLive: 'LIVE AUTHORITATIVE',
    statusCached: 'CACHED OFFLINE',
    statusOffline: 'OFFLINE — DISPLAYING CACHED RESCUE PLAN',
    statusUnavailable: 'Information unavailable.',
    prototypeScoreNote: 'Prototype decision-support score. Not a medical or civil defense certification.',
    safetyDisclaimer: 'ACT is a decision-support system. It does not replace emergency authorities or emergency dispatch services.',

    sectionEmergencyStatus: '1. Emergency Status',
    sectionPersonalRisk: '2. Your Personal Risk',
    sectionSafeRoute: '4. Safe Evacuation Route',
    sectionRecommendedShelter: '5. Recommended Shelter',
    sectionRecentUpdates: '9. Recent Timeline Updates',

    riskLow: 'Low Risk',
    riskModerate: 'Moderate Risk',
    riskHigh: 'High Risk',
    riskCritical: 'Critical Risk',
    actionWindow: 'Action Window Remaining',

    mobilityNormal: 'Normal Mobility',
    mobilityLimited: 'Limited Walking',
    mobilityWheelchair: 'Wheelchair / Assistive Device',

    recalculatePrompt: 'Simulate Riverside Road Blockage',
    recalculating: 'Recalculating alternative high-ground route...',
    recalculatedAlert: 'ROUTE RECALCULATED: Road blockage detected. Shifted to Ridge Ave bypass.',
    blockedNotice: 'BLOCKED CORRIDOR DETECTED',
    distance: 'Distance',
    estimatedTime: 'Estimated Time',

    capacity: 'Capacity',
    availableSpots: 'Available Spots',
    wheelchairAccessible: 'Wheelchair Accessible',
    medicalSupportAvailable: 'Medical Support Onsite',
  },
  hi: {
    appName: 'एसीटी (ACT) — आपातकालीन निर्णय अनुवादक',
    tagline: 'आपातकालीन जानकारी को स्पष्ट व्यक्तिगत निर्णयों में बदलें।',
    navHome: 'होम',
    navHowItWorks: 'यह कैसे काम करता है',
    navFeatures: 'विशेषताएं',
    navSafety: 'सुरक्षा और विश्वसनीयता',
    navDemo: 'डेमो देखें',
    navLogin: 'लॉग इन करें',
    navRegister: 'शुरू करें',
    navDashboard: 'डैशबोर्ड',
    navProfile: 'प्रोफ़ाइल',
    navSettings: 'सेटिंग्स',
    navAdmin: 'एडमिन पैनल',
    navLogout: 'लॉग आउट',

    heroTitle: 'आपातकालीन जानकारी को स्पष्ट व्यक्तिगत निर्णयों में बदलें।',
    heroSubtitle: 'ACT संकट की स्थिति को समझने, व्यक्तिगत जोखिम का आकलन करने, सुरक्षित मार्ग खोजने और निकटतम आश्रय स्थलों की पहचान करने में मदद करता है।',
    heroGetStarted: 'अभी शुरू करें',
    heroTryDemo: 'डेमो आजमाएं',
    heroPipelineAlert: 'चेतावनी',
    heroPipelineRisk: 'जोखिम',
    heroPipelineAction: 'कार्रवाई',
    heroPipelineRoute: 'सुरक्षित मार्ग',
    heroPipelineShelter: 'आश्रय स्थल',

    qWhatHappened: 'क्या हो रहा है?',
    qHowAffectsMe: 'मुझ पर इसका क्या असर होगा?',
    qDoNow: 'मुझे अभी क्या करना चाहिए?',
    qDoNext: 'इसके बाद क्या करना चाहिए?',
    qAvoid: 'किन बातों से बचना चाहिए?',
    qIfThen: 'यदि स्थिति बदलती है तो क्या करें?',

    statusDemo: 'सिम्युलेटेड / डेमो परिदृश्य',
    statusLive: 'लाइव आधिकारिक डेटा',
    statusCached: 'कैश्ड ऑफलाइन',
    statusOffline: 'ऑफ़लाइन — कैश्ड आपातकालीन योजना प्रदर्शित',
    statusUnavailable: 'जानकारी उपलब्ध नहीं है।',
    prototypeScoreNote: 'प्रोटोटाइप निर्णय-सहायता स्कोर। यह कोई चिकित्सा या नागरिक सुरक्षा प्रमाणन नहीं है।',
    safetyDisclaimer: 'ACT एक निर्णय-सहायता प्रणाली है। यह आपातकालीन अधिकारियों या 112/911 सेवाओं की जगह नहीं लेता।',

    sectionEmergencyStatus: '1. आपातकालीन स्थिति',
    sectionPersonalRisk: '2. आपका व्यक्तिगत जोखिम',
    sectionSafeRoute: '4. सुरक्षित निकासी मार्ग',
    sectionRecommendedShelter: '5. अनुशंसित आश्रय स्थल',
    sectionRecentUpdates: '9. हालिया अपडेट्स',

    riskLow: 'कम जोखिम',
    riskModerate: 'मध्यम जोखिम',
    riskHigh: 'उच्च जोखिम',
    riskCritical: 'अत्यधिक गंभीर जोखिम',
    actionWindow: 'कार्रवाई हेतु शेष समय',

    mobilityNormal: 'सामान्य गतिशीलता',
    mobilityLimited: 'सीमित पैदल गतिशीलता',
    mobilityWheelchair: 'व्हीलचेयर / सहायक उपकरण',

    recalculatePrompt: 'रिवरसाइड रोड अवरोध का अनुकरण करें',
    recalculating: 'वैकल्पिक ऊंचे मार्ग की पुनर्गणना हो रही है...',
    recalculatedAlert: 'मार्ग पुनर्गणित: सड़क अवरोध के कारण रिज एवेन्यू बाईपास पर स्थानांतरित।',
    blockedNotice: 'अवरुद्ध मार्ग का पता चला',
    distance: 'दूरी',
    estimatedTime: 'अनुमानित समय',

    capacity: 'कुल क्षमता',
    availableSpots: 'उपलब्ध स्थान',
    wheelchairAccessible: 'व्हीलचेयर सुलभ',
    medicalSupportAvailable: 'चिकित्सा सहायता उपलब्ध',
  },
  ja: {
    appName: 'ACT — クライシストランスレーター',
    tagline: '緊急情報を、明確な個人の避難判断へ。',
    navHome: 'ホーム',
    navHowItWorks: '仕組み',
    navFeatures: '特徴',
    navSafety: '安全性・信頼性',
    navDemo: 'デモ体験',
    navLogin: 'ログイン',
    navRegister: '始める',
    navDashboard: 'ダッシュボード',
    navProfile: 'プロフィール',
    navSettings: '設定',
    navAdmin: '管理者コンソール',
    navLogout: 'ログアウト',

    heroTitle: '緊急情報を、明確な個人の避難判断へ。',
    heroSubtitle: 'ACTは緊急事態を把握し、個人ごとのリスクを査定し、安全な避難経路と最寄りの避難所をリアルタイムで提示します。',
    heroGetStarted: '今すぐ始める',
    heroTryDemo: 'インタラクティブデモを試す',
    heroPipelineAlert: '警報',
    heroPipelineRisk: 'リスク',
    heroPipelineAction: '行動',
    heroPipelineRoute: '経路',
    heroPipelineShelter: '避難所',

    qWhatHappened: '何が起きているのか？',
    qHowAffectsMe: '自分にどう影響するのか？',
    qDoNow: '「今すぐ」何をすべきか？',
    qDoNext: '「次に」何をすべきか？',
    qAvoid: '何を避けるべきか？',
    qIfThen: '状況が変わったらどうすべきか？',

    statusDemo: 'シミュレーション / デモシナリオ',
    statusLive: '公認リアルタイム警報',
    statusCached: 'キャッシュ済みオフライン',
    statusOffline: 'オフライン — 保存された避難計画を表示中',
    statusUnavailable: '情報がありません。',
    prototypeScoreNote: 'プロトタイプ意思決定支援スコアです。公的な医学的・防災認定ではありません。',
    safetyDisclaimer: 'ACTは意思決定支援システムです。自治体の指示や緊急通報サービスに代わるものではありません。',

    sectionEmergencyStatus: '1. 緊急警報ステータス',
    sectionPersonalRisk: '2. あなたの個人リスク',
    sectionSafeRoute: '4. 安全な避難ルート',
    sectionRecommendedShelter: '5. 推奨避難所',
    sectionRecentUpdates: '9. 最新タイムライン更新',

    riskLow: '低リスク',
    riskModerate: '中等度リスク',
    riskHigh: '高リスク',
    riskCritical: '極めて危険',
    actionWindow: '避難猶予時間',

    mobilityNormal: '通常歩行',
    mobilityLimited: '歩行困難・要配慮',
    mobilityWheelchair: '車椅子・歩行補助器具',

    recalculatePrompt: 'リバーサイド通りの冠水通行止めをシミュレート',
    recalculating: '安全な高台迂回ルートを再計算中...',
    recalculatedAlert: 'ルート再計算完了: 道路冠水のためリッジ通りバイパスへ変更しました。',
    blockedNotice: '通行不能区間を検知',
    distance: '距離',
    estimatedTime: '所要時間',

    capacity: '収容定員',
    availableSpots: '受入可能残数',
    wheelchairAccessible: '車椅子バリアフリー対応',
    medicalSupportAvailable: '救護・医療サポート体制あり',
  }
};
