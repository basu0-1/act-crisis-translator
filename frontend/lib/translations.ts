import { LanguageType } from "../types";

export interface Translations {
  // Brand & Header
  brandName: string;
  brandTagline: string;
  home: string;
  howItWorks: string;
  features: string;
  safetyTrust: string;
  dashboard: string;
  adminConsole: string;
  overview: string;
  
  // Sidebar (ChatGPT style)
  newAssessment: string;
  emergencyDashboard: string;
  evacuationMap: string;
  actionDirectives: string;
  simulationControls: string;
  activeCrisis: string;
  assignedHaven: string;
  welcome: string;
  editProfile: string;
  logout: string;
  signIn: string;
  createProfile: string;
  collapseSidebar: string;
  expandSidebar: string;

  // Status & Badges
  liveDecisionActive: string;
  offlineCached: string;
  mobility: string;
  normalMobility: string;
  limitedMobility: string;
  wheelchairMobility: string;
  walking: string;
  bicycle: string;
  vehicle: string;

  // Top Bar
  selectLanguage: string;
  lightMode: string;
  darkMode: string;
  systemTheme: string;
  safetyAudit: string;

  // Emergency Alert Card
  emergencyAlert: string;
  verifiedOfficialSource: string;
  severityExtreme: string;
  severitySevere: string;
  severityModerate: string;
  affectedArea: string;
  issuedAt: string;
  confidence: string;
  officialDirectives: string;

  // Personal Risk Gauge
  personalRiskAssessment: string;
  riskScore: string;
  riskCritical: string;
  riskElevated: string;
  riskLow: string;
  factorsAnalyzed: string;
  floodZoneProximity: string;
  mobilityConstraint: string;
  structuralVulnerability: string;
  immediateActionRequired: string;

  // Action Plan
  priorityActionPlan: string;
  nowPriority: string;
  nextPriority: string;
  avoidPriority: string;
  nowActionDesc: string;
  nextActionDesc: string;
  avoidActionDesc: string;
  listenAudio: string;
  playingAudio: string;
  audioGuidance: string;

  // Map & Shelter
  tacticalEvacuationMap: string;
  safeRouteDescription: string;
  assignedShelter: string;
  distance: string;
  estimatedTime: string;
  elevationProfile: string;
  routeCharacteristics: string;
  stepFreeVerified: string;
  roadblockDetected: string;
  recalculatingRoute: string;

  // Simulation & Controls
  interactiveControls: string;
  hideControls: string;
  showControls: string;
  triggerRoadblock: string;
  triggerPowerOutage: string;
  triggerMedicalNeed: string;
  resetSimulation: string;
  quickMobilityAdjustment: string;

  // Auth & Profile
  authTitle: string;
  emailLabel: string;
  passwordLabel: string;
  nameLabel: string;
  mobilityLabel: string;
  authRequired: string;
  authRequiredDesc: string;
  close: string;
}

export const translations: Record<LanguageType, Translations> = {
  en: {
    brandName: "ACT",
    brandTagline: "Crisis Translator",
    home: "Home",
    howItWorks: "How It Works",
    features: "Features",
    safetyTrust: "Safety & Trust",
    dashboard: "Dashboard",
    adminConsole: "Admin Console",
    overview: "Overview",

    newAssessment: "+ New Assessment",
    emergencyDashboard: "Emergency Dashboard",
    evacuationMap: "Evacuation Map & Haven",
    actionDirectives: "Action Directives",
    simulationControls: "Simulation Controls",
    activeCrisis: "Active Crisis",
    assignedHaven: "Assigned Haven",
    welcome: "Welcome",
    editProfile: "Edit Profile",
    logout: "Log Out",
    signIn: "Sign In",
    createProfile: "Create Profile",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",

    liveDecisionActive: "Live Decision Active",
    offlineCached: "Offline Cached",
    mobility: "Mobility",
    normalMobility: "Normal Pace",
    limitedMobility: "Limited (No Stairs)",
    wheelchairMobility: "Wheelchair (Step-Free)",
    walking: "Walking",
    bicycle: "Bicycle",
    vehicle: "Vehicle",

    selectLanguage: "Select Language",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    systemTheme: "System Theme",
    safetyAudit: "Safety & Provenance Audit",

    emergencyAlert: "Official Emergency Alert",
    verifiedOfficialSource: "Verified Official Source",
    severityExtreme: "Extreme Severity",
    severitySevere: "Severe",
    severityModerate: "Moderate",
    affectedArea: "Affected Area",
    issuedAt: "Issued At",
    confidence: "Confidence",
    officialDirectives: "Official Directives",

    personalRiskAssessment: "Personal Crisis Risk",
    riskScore: "Risk Exposure Score",
    riskCritical: "Critical Risk",
    riskElevated: "Elevated Risk",
    riskLow: "Low Risk",
    factorsAnalyzed: "Factors Analyzed",
    floodZoneProximity: "Flood Zone Proximity",
    mobilityConstraint: "Mobility Limitations",
    structuralVulnerability: "Ground Floor Vulnerability",
    immediateActionRequired: "Immediate Action Required",

    priorityActionPlan: "Hero Priority Directives",
    nowPriority: "NOW",
    nextPriority: "NEXT",
    avoidPriority: "AVOID",
    nowActionDesc: "Immediate lifesaving evacuation instruction",
    nextActionDesc: "Secondary safety preparation",
    avoidActionDesc: "Hazardous actions to strictly avoid",
    listenAudio: "Listen Audio",
    playingAudio: "Playing...",
    audioGuidance: "Multilingual Voice Guidance",

    tacticalEvacuationMap: "Tactical Safe Evacuation Route",
    safeRouteDescription: "Real-time AI pathfinding avoiding active hazard zones & roadblocks",
    assignedShelter: "Assigned Shelter Haven",
    distance: "Distance",
    estimatedTime: "Estimated Time",
    elevationProfile: "Elevation Profile",
    routeCharacteristics: "Route Characteristics",
    stepFreeVerified: "Step-free ramp verified",
    roadblockDetected: "Roadblock Detected - Path Diverted",
    recalculatingRoute: "Recalculating optimal path...",

    interactiveControls: "Interactive Roadblock & Recalculation Controls",
    hideControls: "Hide Controls",
    showControls: "Show Controls",
    triggerRoadblock: "Simulate Roadblock",
    triggerPowerOutage: "Simulate Power Outage",
    triggerMedicalNeed: "Simulate Medical Urgency",
    resetSimulation: "Reset Simulation",
    quickMobilityAdjustment: "Quick Mobility & Household Adjustment",

    authTitle: "ACT Account & Access Control",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    nameLabel: "Full Name",
    mobilityLabel: "Mobility Level",
    authRequired: "Authentication Required",
    authRequiredDesc: "Access to the real-time crisis dashboard requires a registered profile for personalized step-free routing.",
    close: "Close"
  },

  hi: {
    brandName: "ACT",
    brandTagline: "आपदा अनुवादक",
    home: "मुख्य पृष्ठ",
    howItWorks: "कार्यप्रणाली",
    features: "विशेषताएं",
    safetyTrust: "सुरक्षा एवं विश्वास",
    dashboard: "डैशबोर्ड",
    adminConsole: "प्रशासक कंसोल",
    overview: "अवलोकन",

    newAssessment: "+ नया आपात मूल्यांकन",
    emergencyDashboard: "आपातकालीन डैशबोर्ड",
    evacuationMap: "निकासी मानचित्र एवं आश्रय",
    actionDirectives: "कार्रवाई निर्देश",
    simulationControls: "सिमुलेशन नियंत्रण",
    activeCrisis: "सक्रिय आपदा",
    assignedHaven: "आवंटित आश्रय",
    welcome: "स्वागत है",
    editProfile: "प्रोफ़ाइल बदलें",
    logout: "लॉग आउट",
    signIn: "साइन इन",
    createProfile: "खाता बनाएं",
    collapseSidebar: "साइडबार छिपाएं",
    expandSidebar: "साइडबार दिखाएं",

    liveDecisionActive: "लाइव निर्णय सक्रिय",
    offlineCached: "ऑफ़लाइन संचित",
    mobility: "गतिशीलता",
    normalMobility: "सामान्य गति",
    limitedMobility: "सीमित (सीढ़ियां नहीं)",
    wheelchairMobility: "व्हीलचेयर (रैंप आवश्यक)",
    walking: "पैदल",
    bicycle: "साइकिल",
    vehicle: "वाहन",

    selectLanguage: "भाषा चुनें",
    lightMode: "लाइट मोड",
    darkMode: "डार्क मोड",
    systemTheme: "सिस्टम थीम",
    safetyAudit: "सुरक्षा एवं सत्यापन ऑडिट",

    emergencyAlert: "आधिकारिक आपातकालीन चेतावनी",
    verifiedOfficialSource: "सत्यापित सरकारी स्रोत",
    severityExtreme: "अत्यधिक गंभीर",
    severitySevere: "गंभीर",
    severityModerate: "मध्यम",
    affectedArea: "प्रभावित क्षेत्र",
    issuedAt: "जारी समय",
    confidence: "सटीकता विश्वास",
    officialDirectives: "आधिकारिक निर्देश",

    personalRiskAssessment: "व्यक्तिगत आपदा जोखिम",
    riskScore: "जोखिम प्रभाव स्कोर",
    riskCritical: "अत्यधिक गंभीर जोखिम",
    riskElevated: "बढ़ा हुआ जोखिम",
    riskLow: "न्यूनतम जोखिम",
    factorsAnalyzed: "विश्लेषित कारक",
    floodZoneProximity: "बाढ़ क्षेत्र से निकटता",
    mobilityConstraint: "शारीरिक गतिशीलता बाधा",
    structuralVulnerability: "भू-तल संरचनात्मक जोखिम",
    immediateActionRequired: "तत्काल कार्रवाई आवश्यक",

    priorityActionPlan: "प्राथमिक जीवनरक्षक निर्देश",
    nowPriority: "अभी करें",
    nextPriority: "इसके बाद",
    avoidPriority: "बिल्कुल न करें",
    nowActionDesc: "तत्काल जीवनरक्षक निकासी निर्देश",
    nextActionDesc: "द्वितीयक सुरक्षा तैयारी",
    avoidActionDesc: "खतरनाक कदम जिनसे बचना अनिवार्य है",
    listenAudio: "ऑडियो सुनें",
    playingAudio: "सुनाया जा रहा है...",
    audioGuidance: "बहुभाषी आवाज़ मार्गदर्शन",

    tacticalEvacuationMap: "रणनीतिक सुरक्षित निकासी मार्ग",
    safeRouteDescription: "सक्रिय खतरों और अवरोधों से बचाता हुआ स्वचालित AI सुरक्षित मार्ग",
    assignedShelter: "आवंटित सुरक्षित आश्रय",
    distance: "दूरी",
    estimatedTime: "अनुमानित समय",
    elevationProfile: "ऊंचाई प्रोफ़ाइल",
    routeCharacteristics: "मार्ग की विशेषताएं",
    stepFreeVerified: "सीढ़ी-रहित रैंप सत्यापित",
    roadblockDetected: "अवरोध मिला - सुरक्षित नया मार्ग",
    recalculatingRoute: "नया सुरक्षित मार्ग खोजा जा रहा है...",

    interactiveControls: "मार्ग अवरोध एवं पुनर्गणना नियंत्रण",
    hideControls: "नियंत्रण छिपाएं",
    showControls: "नियंत्रण दिखाएं",
    triggerRoadblock: "सड़क अवरोध उत्पन्न करें",
    triggerPowerOutage: "बिजली विफलता सिमुलेट करें",
    triggerMedicalNeed: "चिकित्सा आपातकाल जोड़ें",
    resetSimulation: "डिफ़ॉल्ट पर रीसेट करें",
    quickMobilityAdjustment: "गतिशीलता एवं परिवार प्रोफ़ाइल तुरंत बदलें",

    authTitle: "ACT खाता एवं सुरक्षा नियंत्रण",
    emailLabel: "ईमेल पता",
    passwordLabel: "पासवर्ड",
    nameLabel: "पूरा नाम",
    mobilityLabel: "गतिशीलता स्तर",
    authRequired: "लॉगिन आवश्यक है",
    authRequiredDesc: "व्यक्तिगत सुरक्षित मार्ग एवं आश्रय आवंटन के लिए पंजीकृत प्रोफ़ाइल से प्रवेश करें।",
    close: "बंद करें"
  },

  bn: {
    brandName: "ACT",
    brandTagline: "সংকটকালীন অনুবাদক",
    home: "মূলপাতা",
    howItWorks: "কার্যপ্রণালী",
    features: "বৈশিষ্ট্যাবলী",
    safetyTrust: "নিরাপত্তা ও বিশ্বাস",
    dashboard: "ড্যাশবোর্ড",
    adminConsole: "অ্যাডমিন কনসোল",
    overview: "সংক্ষিপ্ত বিবরণ",

    newAssessment: "+ নতুন মূল্যায়ন",
    emergencyDashboard: "জরুরি ড্যাশবোর্ড",
    evacuationMap: "নির্গমন মানচিত্র ও আশ্রয়",
    actionDirectives: "কার্যকরী নির্দেশাবলী",
    simulationControls: "সিমুলেশন নিয়ন্ত্রণ",
    activeCrisis: "সক্রিয় সংকট",
    assignedHaven: "বরাদ্দকৃত আশ্রয়",
    welcome: "স্বাগতম",
    editProfile: "প্রোফাইল পরিবর্তন",
    logout: "লগ আউট",
    signIn: "সাইন ইন",
    createProfile: "অ্যাকাউন্ট খুলুন",
    collapseSidebar: "সাইডবার লুকান",
    expandSidebar: "সাইডবার দেখান",

    liveDecisionActive: "লাইভ সিদ্ধান্ত সক্রিয়",
    offlineCached: "অফলাইন সংরক্ষিত",
    mobility: "গতিশীলতা",
    normalMobility: "স্বাভাবিক গতি",
    limitedMobility: "সীমিত (সিঁড়ি ছাড়া)",
    wheelchairMobility: "হুইলচেয়ার (র‍্যাম্প বাধ্যতামূলক)",
    walking: "হাঁটা",
    bicycle: "সাইকেল",
    vehicle: "যানবাহন",

    selectLanguage: "ভাষা নির্বাচন",
    lightMode: "লাইট মোড",
    darkMode: "ডার্ক মোড",
    systemTheme: "সিস্টেম থিম",
    safetyAudit: "নিরাপত্তা ও যাচাইকরণ অডিট",

    emergencyAlert: "সরকারি জরুরি সতর্কতা",
    verifiedOfficialSource: "যাচাইকৃত সরকারি উৎস",
    severityExtreme: "চরম বিপদ",
    severitySevere: "গুরুতর",
    severityModerate: "মাঝারি",
    affectedArea: "আক্রান্ত এলাকা",
    issuedAt: "ঘোষণার সময়",
    confidence: "নির্ভুলতার স্তর",
    officialDirectives: "সরকারি নির্দেশাবলী",

    personalRiskAssessment: "ব্যক্তিগত সংকট ঝুঁকি",
    riskScore: "ঝুঁকি এক্সপোজার স্কোর",
    riskCritical: "মারাত্মক সংকটপূর্ণ ঝুঁকি",
    riskElevated: "উচ্চ ঝুঁকি",
    riskLow: "কম ঝুঁকি",
    factorsAnalyzed: "বিশ্লেষিত বিষয়সমূহ",
    floodZoneProximity: "বন্যা এলাকার নৈকট্য",
    mobilityConstraint: "শারীরিক অক্ষমতার বাধা",
    structuralVulnerability: "নিচতলার কাঠামোগত দুর্বলতা",
    immediateActionRequired: "অবিলম্বে ব্যবস্থা নেওয়া জরুরি",

    priorityActionPlan: "অগ্রাধিকারভিত্তিক জীবনরক্ষাকারী নির্দেশ",
    nowPriority: "এখনই করুন",
    nextPriority: "পরবর্তী পদক্ষেপ",
    avoidPriority: "এড়িয়ে চলুন",
    nowActionDesc: "অবিলম্বে নিরাপদ স্থানে যাওয়ার নির্দেশ",
    nextActionDesc: "জরুরি নিরাপত্তা প্রস্তুতি",
    avoidActionDesc: "বিপজ্জনক কাজ যা সম্পূর্ণ নিষিদ্ধ",
    listenAudio: "অডিও শুনুন",
    playingAudio: "বাজছে...",
    audioGuidance: "বহুভাষিক ভয়েস গাইডেন্স",

    tacticalEvacuationMap: "কৌশলগত নিরাপদ নির্গমন পথ",
    safeRouteDescription: "বন্যা ও অবরুদ্ধ পথ এড়িয়ে রিয়েল-টাইম এআই নির্দেশিত নিরাপদ পথ",
    assignedShelter: "বরাদ্দকৃত নিরাপদ আশ্রয়কেন্দ্র",
    distance: "দূরত্ব",
    estimatedTime: "আনুমানিক সময়",
    elevationProfile: "উচ্চতা বিশ্লেষণ",
    routeCharacteristics: "রাস্তার বৈশিষ্ট্য",
    stepFreeVerified: "সিঁড়িমুক্ত র‍্যাম্প যাচাইকৃত",
    roadblockDetected: "বাধা শনাক্ত - বিকল্প নিরাপদ পথ",
    recalculatingRoute: "নতুন পথ নির্ধারণ করা হচ্ছে...",

    interactiveControls: "পথের বাধা ও পুনর্গণনা নিয়ন্ত্রণ",
    hideControls: "নিয়ন্ত্রণ লুকান",
    showControls: "নিয়ন্ত্রণ দেখান",
    triggerRoadblock: "রাস্তার বাধা অনুকরণ করুন",
    triggerPowerOutage: "বিদ্যুৎ বিভ্রাট যোগ করুন",
    triggerMedicalNeed: "জরুরি চিকিৎসা প্রয়োজন",
    resetSimulation: "পূর্বাবস্থায় রিসেট করুন",
    quickMobilityAdjustment: "গতিশীলতা ও পরিবারের প্রোফাইল পরিবর্তন",

    authTitle: "ACT অ্যাকাউন্ট ও অ্যাক্সেস নিয়ন্ত্রণ",
    emailLabel: "ইমেল ঠিকানা",
    passwordLabel: "পাসওয়ার্ড",
    nameLabel: "পূর্ণ নাম",
    mobilityLabel: "গতিশীলতার মাত্রা",
    authRequired: "লগইন আবশ্যক",
    authRequiredDesc: "ব্যক্তিগত নিরাপদ পথ এবং আশ্রয় বরাদ্দের জন্য নিবন্ধিত প্রোফাইলে লগইন করুন।",
    close: "বন্ধ করুন"
  },

  or: {
    brandName: "ACT",
    brandTagline: "ବିପର୍ଯ୍ୟୟ ଅନୁବାଦକ",
    home: "ମୁଖ୍ୟ ପୃଷ୍ଠା",
    howItWorks: "କାର୍ଯ୍ୟ ପ୍ରଣାଳୀ",
    features: "ବୈଶିଷ୍ଟ୍ୟ",
    safetyTrust: "ସୁରକ୍ଷା ଓ ବିଶ୍ୱାସ",
    dashboard: "ଡ୍ୟାସବୋର୍ଡ",
    adminConsole: "ପ୍ରଶାସକ କନସୋଲ",
    overview: "ସାରାଂଶ",

    newAssessment: "+ ନୂତନ ମୂଲ୍ୟାଙ୍କନ",
    emergencyDashboard: "ଜରୁରୀକାଳୀନ ଡ୍ୟାସବୋର୍ଡ",
    evacuationMap: "ଉଦ୍ଧାର ମାନଚିତ୍ର ଓ ଆଶ୍ରୟସ୍ଥଳୀ",
    actionDirectives: "କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ନିର୍ଦ୍ଦେଶାବଳୀ",
    simulationControls: "ସିମୁଲେସନ ନିୟନ୍ତ୍ରଣ",
    activeCrisis: "ସକ୍ରିୟ ବିପର୍ଯ୍ୟୟ",
    assignedHaven: "ଆବଣ୍ଟିତ ଆଶ୍ରୟସ୍ଥଳ",
    welcome: "ସ୍ୱାଗତ",
    editProfile: "ପ୍ରୋଫାଇଲ ସମ୍ପାଦନ",
    logout: "ଲଗ୍ ଆଉଟ୍",
    signIn: "ସାଇନ୍ ଇନ୍",
    createProfile: "ଖାତା ଖୋଲନ୍ତୁ",
    collapseSidebar: "ସାଇଡବାର ଲୁଚାନ୍ତୁ",
    expandSidebar: "ସାଇଡବାର ଦେଖାନ୍ତୁ",

    liveDecisionActive: "ଲାଇଭ ନିଷ୍ପତ୍ତି ସକ୍ରିୟ",
    offlineCached: "ଅଫଲାଇନ ସଂରକ୍ଷିତ",
    mobility: "ଚଳପ୍ରଚଳ ସ୍ଥିତି",
    normalMobility: "ସାଧାରଣ ଗତି",
    limitedMobility: "ସୀମିତ (ସିଡ଼ି ବ୍ୟତୀତ)",
    wheelchairMobility: "ହୁଇଲ୍ ଚେୟାର (ରାମ୍ପ ବାଧ୍ୟତାମୂଳକ)",
    walking: "ପାଦଚଲା",
    bicycle: "ସାଇକେଲ",
    vehicle: "ଗାଡ଼ି",

    selectLanguage: "ଭାଷା ବାଛନ୍ତୁ",
    lightMode: "ଲାଇଟ୍ ମୋଡ୍",
    darkMode: "ଡାର୍କ ମୋଡ୍",
    systemTheme: "ସିଷ୍ଟମ ଥିମ୍",
    safetyAudit: "ସୁରକ୍ଷା ଓ ପ୍ରମାଣୀକରଣ ଅଡିଟ୍",

    emergencyAlert: "ସରକାରୀ ଜରୁରୀ ସତର୍କ ସୂଚନା",
    verifiedOfficialSource: "ପ୍ରମାଣିତ ସରକାରୀ ଉତ୍ସ",
    severityExtreme: "ଅତ୍ୟନ୍ତ ଗୁରୁତର",
    severitySevere: "ଗୁରୁତର ବିପଦ",
    severityModerate: "ମଧ୍ୟମ",
    affectedArea: "ପ୍ରଭାବିତ ଅଞ୍ଚଳ",
    issuedAt: "ଜାରି ହୋଇଥିବା ସମୟ",
    confidence: "ସଠିକତା ବିଶ୍ୱାସ",
    officialDirectives: "ସରକାରୀ ନିର୍ଦ୍ଦେଶାବଳୀ",

    personalRiskAssessment: "ବ୍ୟକ୍ତିଗତ ବିପଦ ମୂଲ୍ୟାଙ୍କନ",
    riskScore: "ବିପଦ ପ୍ରଭାବ ସ୍କୋର",
    riskCritical: "ଚରମ ବିପଦପୂର୍ଣ୍ଣ",
    riskElevated: "ଅଧିକ ବିପଦ",
    riskLow: "ସ୍ୱଳ୍ପ ବିପଦ",
    factorsAnalyzed: "ବିଶ୍ଳେଷିତ କାରକ",
    floodZoneProximity: "ବନ୍ୟା ଅଞ୍ଚଳ ନିକଟତା",
    mobilityConstraint: "ଚଳପ୍ରଚଳ ଅସୁବିଧା",
    structuralVulnerability: "ତଳ ମହଲା ଗଠନ ବିପଦ",
    immediateActionRequired: "ତୁରନ୍ତ ପଦକ୍ଷେପ ଆବଶ୍ୟକ",

    priorityActionPlan: "ପ୍ରାଥମିକ ଜୀବନରକ୍ଷା ନିର୍ଦ୍ଦେଶ",
    nowPriority: "ବର୍ତ୍ତମାନ କରନ୍ତୁ",
    nextPriority: "ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ",
    avoidPriority: "ଜମାରୁ କରନ୍ତୁ ନାହିଁ",
    nowActionDesc: "ତୁରନ୍ତ ଜୀବନରକ୍ଷା ସୁରକ୍ଷିତ ସ୍ଥାନାନ୍ତର ନିର୍ଦ୍ଦେଶ",
    nextActionDesc: "ଦ୍ୱିତୀୟ ସୁରକ୍ଷା ପ୍ରସ୍ତୁତି",
    avoidActionDesc: "ବିପଦପୂର୍ଣ୍ଣ କାର୍ଯ୍ୟ ଯାହା ନିଷିଦ୍ଧ",
    listenAudio: "ଅଡିଓ ଶୁଣନ୍ତୁ",
    playingAudio: "ବଜାଯାଉଛି...",
    audioGuidance: "ବହୁଭାଷୀ ଭଏସ୍ ମାର୍ଗଦର୍ଶନ",

    tacticalEvacuationMap: "ରଣନୈତିକ ସୁରକ୍ଷିତ ଉଦ୍ଧାର ପଥ",
    safeRouteDescription: "ବନ୍ୟା ଓ ଅବରୋଧକୁ ଏଡାଇ ସ୍ୱୟଂଚାଳିତ AI ନିର୍ଦ୍ଦେଶିତ ନିରାପଦ ରାସ୍ତା",
    assignedShelter: "ଆବଣ୍ଟିତ ସୁରକ୍ଷିତ ଆଶ୍ରୟସ୍ଥଳୀ",
    distance: "ଦୂରତା",
    estimatedTime: "ଆନୁମାନିକ ସମୟ",
    elevationProfile: "ଉଚ୍ଚତା ବିଶ୍ଳେଷଣ",
    routeCharacteristics: "ରାସ୍ତାର ବିଶେଷତା",
    stepFreeVerified: "ସିଡ଼ିମୁକ୍ତ ରାମ୍ପ ଯାଞ୍ଚ ହୋଇଛି",
    roadblockDetected: "ଅବରୋଧ ଚିହ୍ନଟ - ନୂତନ ସୁରକ୍ଷିତ ରାସ୍ତା",
    recalculatingRoute: "ନୂତନ ପଥ ଖୋଜାଯାଉଛି...",

    interactiveControls: "ରାସ୍ତା ଅବରୋଧ ଓ ପୁନଃଗଣନା ନିୟନ୍ତ୍ରଣ",
    hideControls: "ନିୟନ୍ତ୍ରଣ ଲୁଚାନ୍ତୁ",
    showControls: "ନିୟନ୍ତ୍ରଣ ଦେଖାନ୍ତୁ",
    triggerRoadblock: "ରାସ୍ତା ଅବରୋଧ ସୃଷ୍ଟି କରନ୍ତୁ",
    triggerPowerOutage: "ବିଦ୍ୟୁତ ବିଭ୍ରାଟ ଯୋଡ଼ନ୍ତୁ",
    triggerMedicalNeed: "ଡାକ୍ତରୀ ଜରୁରୀ ସ୍ଥିତି",
    resetSimulation: "ପୁନଃ ସେଟ୍ କରନ୍ତୁ",
    quickMobilityAdjustment: "ଚଳପ୍ରଚଳ ଓ ପରିବାର ପ୍ରୋଫାଇଲ ପରିବର୍ତ୍ତନ",

    authTitle: "ACT ଖାତା ଓ ସୁରକ୍ଷା ନିୟନ୍ତ୍ରଣ",
    emailLabel: "ଇମେଲ ଠିକଣା",
    passwordLabel: "ପାସୱାର୍ଡ",
    nameLabel: "ପୂରା ନାମ",
    mobilityLabel: "ଚଳପ୍ରଚଳ ସ୍ତର",
    authRequired: "ଲଗଇନ୍ ଆବଶ୍ୟକ",
    authRequiredDesc: "ବ୍ୟକ୍ତିଗତ ସୁରକ୍ଷିତ ପଥ ଓ ଆଶ୍ରୟ ପାଇଁ ପଞ୍ଜୀକୃତ ପ୍ରୋଫାଇଲରେ ସାଇନ ଇନ କରନ୍ତୁ।",
    close: "ବନ୍ଦ କରନ୍ତୁ"
  },

  ur: {
    brandName: "ACT",
    brandTagline: "بحرانی مترجم",
    home: "ہوم",
    howItWorks: "یہ کیسے کام کرتا ہے",
    features: "خصوصیات",
    safetyTrust: "حفاظت اور اعتماد",
    dashboard: "ڈیش بورڈ",
    adminConsole: "ایڈمن کنسول",
    overview: "جائزہ",

    newAssessment: "+ نیا جائزہ",
    emergencyDashboard: "ہنگامی ڈیش بورڈ",
    evacuationMap: "انخلاء نقشہ اور پناہ گاہ",
    actionDirectives: "عملی ہدایات",
    simulationControls: "تخلیقی کنٹرولز",
    activeCrisis: "فعال بحران",
    assignedHaven: "مختص پناہ گاہ",
    welcome: "خوش آمدید",
    editProfile: "پروفائل تبدیل کریں",
    logout: "لاگ آؤٹ",
    signIn: "سائن ان",
    createProfile: "اکاؤنٹ بنائیں",
    collapseSidebar: "سائیڈ بار چھپائیں",
    expandSidebar: "سائیڈ بار دکھائیں",

    liveDecisionActive: "براہ راست فیصلہ فعال",
    offlineCached: "آف لائن محفوظ",
    mobility: "نقل و حرکت",
    normalMobility: "عام رفتار",
    limitedMobility: "محدود (سیڑھیاں نہیں)",
    wheelchairMobility: "وہیل چیئر (ریمپ لازمی)",
    walking: "پیدل",
    bicycle: "سائیکل",
    vehicle: "گاڑی",

    selectLanguage: "زبان منتخب کریں",
    lightMode: "لائٹ موڈ",
    darkMode: "ڈارک موڈ",
    systemTheme: "سسٹم تھیم",
    safetyAudit: "حفاظتی و تصدیقی آڈٹ",

    emergencyAlert: "سرکاری ہنگامی الرٹ",
    verifiedOfficialSource: "تصدیق شدہ سرکاری ذریعہ",
    severityExtreme: "انتہائی شدید",
    severitySevere: "شدید",
    severityModerate: "معتدل",
    affectedArea: "متاثرہ علاقہ",
    issuedAt: "جاری ہونے کا وقت",
    confidence: "درستگی کا تناسب",
    officialDirectives: "سرکاری ہدایات",

    personalRiskAssessment: "ذاتی بحرانی خطرہ",
    riskScore: "خطرے کی شرح",
    riskCritical: "انتہائی نازک خطرہ",
    riskElevated: "بڑھا ہوا خطرہ",
    riskLow: "کم خطرہ",
    factorsAnalyzed: "تجزیہ شدہ عوامل",
    floodZoneProximity: "سیلابی علاقے سے قربت",
    mobilityConstraint: "جسمانی نقل و حرکت کی رکاوٹ",
    structuralVulnerability: "زمینی منزل کی ساخت کا خطرہ",
    immediateActionRequired: "فوری اقدام لازمی ہے",

    priorityActionPlan: "ترجیحی جان بچانے والی ہدایات",
    nowPriority: "ابھی کریں",
    nextPriority: "اس کے بعد",
    avoidPriority: "ہرگز نہ کریں",
    nowActionDesc: "فوری جان بچانے والا محفوظ انخلاء",
    nextActionDesc: "ثانوی حفاظتی تیاری",
    avoidActionDesc: "خطرناک اقدامات جن سے بچنا لازمی ہے",
    listenAudio: "آڈیو سنیں",
    playingAudio: "چل رہا ہے...",
    audioGuidance: "کثیر لسانی صوتی رہنمائی",

    tacticalEvacuationMap: "محفوظ انخلاء کا راستہ",
    safeRouteDescription: "سیلاب اور رکاوٹوں سے بچاتا ہوا خودکار AI محفوظ راستہ",
    assignedShelter: "مختص محفوظ پناہ گاہ",
    distance: "فاصلہ",
    estimatedTime: "متوقع وقت",
    elevationProfile: "بلندی کا جائزہ",
    routeCharacteristics: "راستے کی خصوصیات",
    stepFreeVerified: "سیڑھیوں کے بغیر ریمپ تصدیق شدہ",
    roadblockDetected: "رکاوٹ موجود - نیا محفوظ راستہ",
    recalculatingRoute: "نیا راستہ تلاش کیا جا رہا ہے...",

    interactiveControls: "رکاوٹ اور دوبارہ حساب کے کنٹرولز",
    hideControls: "کنٹرولز چھپائیں",
    showControls: "کنٹرولز دکھائیں",
    triggerRoadblock: "سڑک کی رکاوٹ شامل کریں",
    triggerPowerOutage: "بجلی کی خرابی شامل کریں",
    triggerMedicalNeed: "طبی ایمرجنسی شامل کریں",
    resetSimulation: "ری سیٹ کریں",
    quickMobilityAdjustment: "نقل و حرکت اور گھریلو پروفائل تبدیل کریں",

    authTitle: "ACT اکاؤنٹ اور سیکیورٹی کنٹرول",
    emailLabel: "ای میل ایڈریس",
    passwordLabel: "پاس ورڈ",
    nameLabel: "مکمل نام",
    mobilityLabel: "نقل و حرکت کی سطح",
    authRequired: "لاگ ان ضروری ہے",
    authRequiredDesc: "ذاتی محفوظ راستے اور پناہ گاہ کے لیے رجسٹرڈ پروفائل کے ساتھ لاگ ان کریں۔",
    close: "بند کریں"
  },

  ja: {
    brandName: "ACT",
    brandTagline: "危機翻訳システム",
    home: "ホーム",
    howItWorks: "仕組み",
    features: "主な機能",
    safetyTrust: "安全性と信頼",
    dashboard: "ダッシュボード",
    adminConsole: "管理者コンソール",
    overview: "概要",

    newAssessment: "+ 新規避難評価",
    emergencyDashboard: "緊急ダッシュボード",
    evacuationMap: "避難ルート＆避難所",
    actionDirectives: "行動指示",
    simulationControls: "シミュレーション制御",
    activeCrisis: "現在発生中の災害",
    assignedHaven: "指定避難所",
    welcome: "ようこそ",
    editProfile: "プロフィール編集",
    logout: "ログアウト",
    signIn: "サインイン",
    createProfile: "アカウント作成",
    collapseSidebar: "サイドバーを折りたたむ",
    expandSidebar: "サイドバーを展開",

    liveDecisionActive: "AIリアルタイム判定稼働中",
    offlineCached: "オフライン保存データ",
    mobility: "移動能力",
    normalMobility: "通常の歩行速度",
    limitedMobility: "歩行制限（階段回避）",
    wheelchairMobility: "車椅子（段差ゼロ必須）",
    walking: "徒歩",
    bicycle: "自転車",
    vehicle: "自動車",

    selectLanguage: "言語を選択",
    lightMode: "ライトモード",
    darkMode: "ダークモード",
    systemTheme: "システム連動",
    safetyAudit: "安全性およびデータ検証監査",

    emergencyAlert: "公式緊急災害警報",
    verifiedOfficialSource: "政府公認の検証済み情報源",
    severityExtreme: "特別警戒 / 避難指示",
    severitySevere: "警戒レベル4",
    severityModerate: "注意報",
    affectedArea: "対象警戒地域",
    issuedAt: "発令日時",
    confidence: "信頼度スコア",
    officialDirectives: "公式発表指示",

    personalRiskAssessment: "個別災害リスク判定",
    riskScore: "被災危険度スコア",
    riskCritical: "極めて危険（即時避難）",
    riskElevated: "警戒レベル（避難準備）",
    riskLow: "低リスク（安全維持）",
    factorsAnalyzed: "分析対象リスク要因",
    floodZoneProximity: "浸水想定区域への近接度",
    mobilityConstraint: "歩行・移動上の身体的制約",
    structuralVulnerability: "低層階構造上の脆弱性",
    immediateActionRequired: "命を守る即時行動が必要",

    priorityActionPlan: "最優先行動指針（Hero Directives）",
    nowPriority: "今すぐ（NOW）",
    nextPriority: "次に（NEXT）",
    avoidPriority: "厳禁（AVOID）",
    nowActionDesc: "直ちに命を守る避難行動を開始してください",
    nextActionDesc: "二次避難準備および安全確保",
    avoidActionDesc: "重大な危険を伴うため厳禁される行為",
    listenAudio: "音声ガイダンスを再生",
    playingAudio: "音声を再生中...",
    audioGuidance: "多言語AI音声避難誘導",

    tacticalEvacuationMap: "AIリアルタイム安全避難ルート",
    safeRouteDescription: "浸水エリアおよび障害物を自律回避する段差ゼロ対応ルート",
    assignedShelter: "指定受入避難所",
    distance: "距離",
    estimatedTime: "予想所要時間",
    elevationProfile: "高低差プロファイル",
    routeCharacteristics: "経路の安全特徴",
    stepFreeVerified: "スロープ設置・階段なし確認済み",
    roadblockDetected: "道路冠水・封鎖を検知 - 代替安全ルートへ切替",
    recalculatingRoute: "最新の安全経路を再計算中...",

    interactiveControls: "障害物発生＆リアルタイム再計算シミュレータ",
    hideControls: "操作パネルを閉じる",
    showControls: "操作パネルを表示",
    triggerRoadblock: "道路障害・冠水をシミュレート",
    triggerPowerOutage: "停電発生をシミュレート",
    triggerMedicalNeed: "要援護者・医療支援要請",
    resetSimulation: "初期状態にリセット",
    quickMobilityAdjustment: "移動能力＆同伴者プロフィールの即時切替",

    authTitle: "ACT アカウント＆アクセス認証",
    emailLabel: "メールアドレス",
    passwordLabel: "パスワード",
    nameLabel: "氏名",
    mobilityLabel: "移動能力レベル",
    authRequired: "ログインが必要です",
    authRequiredDesc: "個別化された段差なし安全避難ルートの利用には登録プロファイルへのサインインが必要です。",
    close: "閉じる"
  }
};

export function getTranslation(lang: LanguageType): Translations {
  return translations[lang] || translations.en;
}
