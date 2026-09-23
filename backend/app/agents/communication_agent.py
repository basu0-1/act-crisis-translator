"""
Agent 5: Communication Agent
Question: "How should this information be communicated?"
Translates, formats, and adapts tone for English, Hindi, Bengali, Odia, Urdu, and Japanese.
Strict Zero-Hallucination rule: never adds new emergency facts.
"""
from typing import Dict, Any, List
from app.schemas.user import LanguageType
from app.schemas.plan import ActionPlan, IfThenRule


class CommunicationAgent:
    """Agent 5: Delivers high-urgency, clear, localized communication without adding facts"""

    # High-accuracy deterministic translation dictionaries for verified emergency phrases
    HINDI_TRANSLATIONS = {
        "Move away from ground-level areas and low-lying entryways immediately.": 
            "निचले स्तर के क्षेत्रों और निचले प्रवेश द्वारों से तुरंत दूर चले जाएं।",
        "Secure personal mobility device and required prescription medicines.": 
            "अपने गतिशीलता उपकरण और आवश्यक नुस्खे वाली दवाएं सुरक्षित रखें।",
        "Take government ID, fully charged mobile phone, and emergency contact list.": 
            "सरकारी पहचान पत्र, पूरी तरह से चार्ज मोबाइल फोन और आपातकालीन संपर्क सूची साथ लें।",
        "Do NOT use Riverside Road (confirmed flooded with high hazard risk).": 
            "रिवरसाइड रोड का उपयोग न करें (पुष्टि की गई बाढ़ और उच्च जोखिम)।",
        "Avoid old town stairways and narrow unpaved alleys (inaccessible for mobility aids).": 
            "पुरानी सीढ़ियों और संकरी कच्ची गलियों से बचें (गतिशीलता उपकरणों के लिए दुर्गम)।",
        "Never walk or roll through flowing flood water.": 
            "बहते बाढ़ के पानी में कभी भी न चलें या वाहन न ले जाएं।",
        "high": "उच्च व्यक्तिगत जोखिम",
        "medium": "मध्यम जोखिम",
        "low": "निम्न जोखिम",
        "Move immediately to the highest accessible level of your current sturdy structure.":
            "अपनी वर्तमान मजबूत इमारत के उच्चतम सुलभ स्तर पर तुरंत चले जाएं।",
        "Turn off main electrical breaker and gas supply if safely reachable.":
            "यदि सुरक्षित रूप से संभव हो तो मुख्य बिजली ब्रेकर और गैस आपूर्ति बंद कर दें।",
        "Do not attempt to traverse unverified flooded roadways or stairwells.":
            "अपुष्ट जलमग्न सड़कों या सीढ़ियों से गुजरने का प्रयास न करें।"
    }

    BENGALI_TRANSLATIONS = {
        "Move away from ground-level areas and low-lying entryways immediately.": 
            "নিচু এলাকা এবং নিচু প্রবেশদ্বার থেকে অবিলম্বে সরে যান।",
        "Secure personal mobility device and required prescription medicines.": 
            "আপনার চলাচলের সহায়ক সরঞ্জাম এবং প্রয়োজনীয় প্রেসক্রিপশন ওষুধ সাথে রাখুন।",
        "Take government ID, fully charged mobile phone, and emergency contact list.": 
            "সরকারি পরিচয়পত্র, সম্পূর্ণ চার্জ করা মোবাইল ফোন এবং জরুরি যোগাযোগের তালিকা সাথে নিন।",
        "Do NOT use Riverside Road (confirmed flooded with high hazard risk).": 
            "রিভারসাইড রোড ব্যবহার করবেন না (বন্যার উচ্চ ঝুঁকি নিশ্চিত)।",
        "Avoid old town stairways and narrow unpaved alleys (inaccessible for mobility aids).": 
            "পুরোনো সিঁড়ি এবং সংকীর্ণ কাঁচা গলি এড়িয়ে চলুন (চলাচলের অনুপযোগী)।",
        "Never walk or roll through flowing flood water.": 
            "প্রবাহিত বন্যার পানির মধ্য দিয়ে কখনো হাঁটবেন না বা গাড়ি চালাবেন না।",
        "high": "উচ্চ ব্যক্তিগত ঝুঁকি",
        "medium": "মাঝারি ঝুঁকি",
        "low": "কম ঝুঁকি",
        "Move immediately to the highest accessible level of your current sturdy structure.":
            "আপনার বর্তমান ভবনের সর্বোচ্চ নিরাপদ ও সুগম তলায় অবিলম্বে চলে যান।",
        "Turn off main electrical breaker and gas supply if safely reachable.":
            "নিরাপদ হলে প্রধান বিদ্যুৎ ব্রেকার এবং গ্যাস সংযোগ বন্ধ করুন।",
        "Do not attempt to traverse unverified flooded roadways or stairwells.":
            "অনিশ্চিত বা প্লাবিত সড়ক ও সিঁড়ি দিয়ে যাতায়াত করবেন না।"
    }

    ODIA_TRANSLATIONS = {
        "Move away from ground-level areas and low-lying entryways immediately.": 
            "ତଳିଆ ଅଞ୍ଚଳ ଏବଂ ନିମ୍ନ ପ୍ରବେଶ ପଥରୁ ତୁରନ୍ତ ଦୂରକୁ ଯାଆନ୍ତୁ।",
        "Secure personal mobility device and required prescription medicines.": 
            "ଆପଣଙ୍କ ଚଳପ୍ରଚଳ ସହାୟକ ଉପକରଣ ଏବଂ ଆବଶ୍ୟକ ଔଷଧ ସୁରକ୍ଷିତ ରଖନ୍ତୁ।",
        "Take government ID, fully charged mobile phone, and emergency contact list.": 
            "ସରକାରୀ ପରିଚୟ ପତ୍ର, ସମ୍ପୂର୍ଣ୍ଣ ଚାର୍ଜ ଥିବା ମୋବାଇଲ ଫୋନ ଏବଂ ଜରୁରୀ ସମ୍ପର୍କ ତାଲିକା ସାଙ୍ଗରେ ନିଅନ୍ତୁ।",
        "Do NOT use Riverside Road (confirmed flooded with high hazard risk).": 
            "ରିଭରସାଇଡ୍ ରୋଡ୍ ବ୍ୟବହାର କରନ୍ତୁ ନାହିଁ (ବନ୍ୟା ବିପଦ ପ୍ରମାଣିତ)।",
        "Avoid old town stairways and narrow unpaved alleys (inaccessible for mobility aids).": 
            "ପୁରୁଣା ସିଡ଼ି ଏବଂ ସଂକୀର୍ଣ୍ଣ କଞ୍ଚା ରାସ୍ତା ଆଡ଼େଇ ଚାଲନ୍ତୁ (ଅଗମ୍ୟ)।",
        "Never walk or roll through flowing flood water.": 
            "ପ୍ରବାହିତ ବନ୍ୟା ପାଣିରେ କେବେ ଚାଲନ୍ତୁ କିମ୍ବା ଯାନ ନିଅନ୍ତୁ ନାହିଁ।",
        "high": "ଉଚ୍ଚ ବ୍ୟକ୍ତିଗତ ବିପଦ",
        "medium": "ମଧ୍ୟମ ବିପଦ",
        "low": "ସ୍ୱଳ୍ପ ବିପଦ",
        "Move immediately to the highest accessible level of your current sturdy structure.":
            "ଆପଣଙ୍କ ବର୍ତ୍ତମାନର ଦୃଢ଼ କୋଠାର ସର୍ବୋଚ୍ଚ ସୁଗମ ମହଲାକୁ ତୁରନ୍ତ ଯାଆନ୍ତୁ।",
        "Turn off main electrical breaker and gas supply if safely reachable.":
            "ଯଦି ସୁରକ୍ଷିତ, ତେବେ ମୁଖ୍ୟ ବିଦ୍ୟୁତ ସୁଇଚ୍ ଏବଂ ଗ୍ୟାସ ସଂଯୋଗ ବନ୍ଦ କରନ୍ତୁ।",
        "Do not attempt to traverse unverified flooded roadways or stairwells.":
            "ଅପ୍ରମାଣିତ ଜଳମଗ୍ନ ରାସ୍ତା କିମ୍ବା ସିଡ଼ିରେ ଯାତ୍ରା କରନ୍ତୁ ନାହିଁ।"
    }

    URDU_TRANSLATIONS = {
        "Move away from ground-level areas and low-lying entryways immediately.": 
            "نچلی سطح کے علاقوں اور نشیبی راستوں سے فوری طور پر دور ہو جائیں۔",
        "Secure personal mobility device and required prescription medicines.": 
            "اپنے نقل و حرکت کے آلات اور ضروری ادویات کو محفوظ رکھیں۔",
        "Take government ID, fully charged mobile phone, and emergency contact list.": 
            "سرکاری شناختی کارڈ، مکمل چارج شدہ موبائل فون اور ہنگامی رابطوں کی فہرست ہمراہ رکھیں۔",
        "Do NOT use Riverside Road (confirmed flooded with high hazard risk).": 
            "ریورسائیڈ روڈ کا استعمال ہرگز نہ کریں (سیلاب کا شدید خطرہ موجود ہے)۔",
        "Avoid old town stairways and narrow unpaved alleys (inaccessible for mobility aids).": 
            "پرانی سیڑھیوں اور تنگ کچی گلیوں سے گریز کریں (معذور افراد کے لیے دشوار)۔",
        "Never walk or roll through flowing flood water.": 
            "بہتے ہوئے سیلابی پانی میں ہرگز نہ چلیں اور نہ ہی گاڑی گزاریں۔",
        "high": "اعلیٰ خطرہ (HIGH RISK)",
        "medium": "درمیانہ خطرہ (MEDIUM RISK)",
        "low": "کم خطرہ (LOW RISK)",
        "Move immediately to the highest accessible level of your current sturdy structure.":
            "موجودہ مضبوط عمارت کے سب سے محفوظ اور بلند ترین منزل پر فوری منتقل ہو جائیں۔",
        "Turn off main electrical breaker and gas supply if safely reachable.":
            "اگر محفوظ ہو تو مین بجلی کا بریکر اور گیس کنکشن فوری بند کر دیں۔",
        "Do not attempt to traverse unverified flooded roadways or stairwells.":
            "غیر تصدیق شدہ سیلاب زدہ سڑکوں یا سیڑھیوں سے گزرنے کی کوشش نہ کریں۔"
    }

    JAPANESE_TRANSLATIONS = {
        "Move away from ground-level areas and low-lying entryways immediately.": 
            "地上レベルの場所および低地のエントランスから直ちに離れてください。",
        "Secure personal mobility device and required prescription medicines.": 
            "移動支援機器（車椅子・歩行器）および必要な処方薬を確保してください。",
        "Take government ID, fully charged mobile phone, and emergency contact list.": 
            "身分証明書、十分に充電された携帯電話、緊急連絡先リストをお持ちください。",
        "Do NOT use Riverside Road (confirmed flooded with high hazard risk).": 
            "リバーサイド・ロードは使用しないでください（冠水および高リスク確認済み）。",
        "Avoid old town stairways and narrow unpaved alleys (inaccessible for mobility aids).": 
            "旧市街の階段や舗装されていない狭い路地は避けてください（移動機器での通行不可）。",
        "Never walk or roll through flowing flood water.": 
            "流れている冠水道路を歩いたり車椅子で進まないでください。",
        "high": "高リスク (HIGH RISK)",
        "medium": "中リスク (MEDIUM RISK)",
        "low": "低リスク (LOW RISK)",
        "Move immediately to the highest accessible level of your current sturdy structure.":
            "現在の頑丈な建物の最も高いアクセス可能な階へ直ちに垂直避難してください。",
        "Turn off main electrical breaker and gas supply if safely reachable.":
            "安全に届く場合は、主電源ブレーカーおよびガス栓を遮断してください。",
        "Do not attempt to traverse unverified flooded roadways or stairwells.":
            "確認されていない冠水道路や階段を無理に移動しないでください。"
    }

    @classmethod
    def format_and_localize(cls, plan: ActionPlan, target_language: LanguageType) -> ActionPlan:
        if target_language == LanguageType.EN:
            plan.language = LanguageType.EN
            return plan

        localized_plan = plan.model_copy(deep=True)
        localized_plan.language = target_language

        if target_language == LanguageType.HI:
            localized_plan.now = [cls.HINDI_TRANSLATIONS.get(item, f"{item}") for item in plan.now]
            localized_plan.next = [cls.HINDI_TRANSLATIONS.get(item, f"{item}") for item in plan.next]
            localized_plan.avoid = [cls.HINDI_TRANSLATIONS.get(item, f"{item}") for item in plan.avoid]
            localized_plan.if_then = [
                IfThenRule(
                    condition=f"यदि {rule.condition.replace('If ', '')}",
                    action=f"{rule.action} (पुनर्निर्धारण सक्रिय)",
                    trigger_event=rule.trigger_event
                )
                for rule in plan.if_then
            ]
            localized_plan.disclaimer = "ACT सत्यापित आपातकालीन डेटा के आधार पर व्यक्तिगत मार्गदर्शन प्रदान करता है। जीवन सुरक्षा के लिए आधिकारिक निर्देशों का पालन करें।"

        elif target_language == LanguageType.BN:
            localized_plan.now = [cls.BENGALI_TRANSLATIONS.get(item, f"{item}") for item in plan.now]
            localized_plan.next = [cls.BENGALI_TRANSLATIONS.get(item, f"{item}") for item in plan.next]
            localized_plan.avoid = [cls.BENGALI_TRANSLATIONS.get(item, f"{item}") for item in plan.avoid]
            localized_plan.if_then = [
                IfThenRule(
                    condition=f"যদি {rule.condition.replace('If ', '')}",
                    action=f"{rule.action} (পুনর্বিন্যাস সক্রিয়)",
                    trigger_event=rule.trigger_event
                )
                for rule in plan.if_then
            ]
            localized_plan.disclaimer = "ACT যাচাইকৃত জরুরি তথ্যের ওপর ভিত্তি করে নির্দেশনা প্রদান করে। জীবনের সুরক্ষায় সরকারি নির্দেশাবলি মেনে চলুন।"

        elif target_language == LanguageType.OR:
            localized_plan.now = [cls.ODIA_TRANSLATIONS.get(item, f"{item}") for item in plan.now]
            localized_plan.next = [cls.ODIA_TRANSLATIONS.get(item, f"{item}") for item in plan.next]
            localized_plan.avoid = [cls.ODIA_TRANSLATIONS.get(item, f"{item}") for item in plan.avoid]
            localized_plan.if_then = [
                IfThenRule(
                    condition=f"ଯଦି {rule.condition.replace('If ', '')}",
                    action=f"{rule.action} (ପୁନଃନିର୍ଦ୍ଧାରଣ ସକ୍ରିୟ)",
                    trigger_event=rule.trigger_event
                )
                for rule in plan.if_then
            ]
            localized_plan.disclaimer = "ACT ଯାଞ୍ଚ ହୋଇଥିବା ଜରୁରୀ ସୂଚନା ଉପରେ ଆଧାରିତ ମାର୍ଗଦର୍ଶନ ପ୍ରଦାନ କରେ। ଜୀବନ ସୁରକ୍ଷା ପାଇଁ ସରକାରୀ ନିର୍ଦ୍ଦେଶ ପାଳନ କରନ୍ତୁ।"

        elif target_language == LanguageType.UR:
            localized_plan.now = [cls.URDU_TRANSLATIONS.get(item, f"{item}") for item in plan.now]
            localized_plan.next = [cls.URDU_TRANSLATIONS.get(item, f"{item}") for item in plan.next]
            localized_plan.avoid = [cls.URDU_TRANSLATIONS.get(item, f"{item}") for item in plan.avoid]
            localized_plan.if_then = [
                IfThenRule(
                    condition=f"اگر {rule.condition.replace('If ', '')}",
                    action=f"{rule.action} (راستہ دوبارہ ترتیب دیا گیا)",
                    trigger_event=rule.trigger_event
                )
                for rule in plan.if_then
            ]
            localized_plan.disclaimer = "ACT مصدقہ ہنگامی ڈیٹا کی بنیاد پر رہنمائی فراہم کرتا ہے۔ جان کی حفاظت کے لیے سرکاری احکامات پر عمل کریں۔"

        elif target_language == LanguageType.JA:
            localized_plan.now = [cls.JAPANESE_TRANSLATIONS.get(item, f"{item}") for item in plan.now]
            localized_plan.next = [cls.JAPANESE_TRANSLATIONS.get(item, f"{item}") for item in plan.next]
            localized_plan.avoid = [cls.JAPANESE_TRANSLATIONS.get(item, f"{item}") for item in plan.avoid]
            localized_plan.if_then = [
                IfThenRule(
                    condition=f"【条件】{rule.condition}",
                    action=f"【対応】{rule.action}（即時ルート再計算）",
                    trigger_event=rule.trigger_event
                )
                for rule in plan.if_then
            ]
            localized_plan.disclaimer = "ACTは検証済みの緊急データに基づき個人向けの行動計画を提供します。生命に関わる事態では公式避難指示に従ってください。"

        return localized_plan
