/* Textes affichés de l'interface : arabe et français. (Les phrases DITES sont dans data.js.) */

const STRINGS = {
  ar: {
    close: "إغلاق", yes: "نعم", no: "لا", back: "رجوع", listen: "استمع", slow: "ببطء", check: "تحقّق", save: "حفظ",
    start: "ابدأ", next: "التالي", previous: "السابق", again: "أعِد", done: "انتهيت", edit: "تعديل", minutes: "دقيقة",
    version: "الإصدار", undo: "تراجع", repeat: "كرّر بصوتك", correct_answer: "الجواب الصحيح:", continue_btn: "متابعة",
    your_answer: "جوابك", questions_n: "أسئلة",
    tagline: "قواعد اللغة الإنجليزية بالشرح العربي والصوت، من المستوى الأساسي إلى المتقدّم",
    pick_lang: "اختر لغة الشرح — Choisis la langue des explications",
    new_learner: "متعلّم جديد", edit_learner: "تعديل المتعلّم", learner_name: "الاسم", learner_name_ph: "مثلا: سلمى، ياسين…",
    avatar: "الصورة", no_account_needed: "لا حاجة لحساب: التقدّم يُحفظ في هذا الجهاز. يمكن إنشاء حساب لاحقا.",
    who_now: "من يتعلّم الآن؟", add_learner: "إضافة متعلّم", helper: "فضاء المرافق", badges: "الأوسمة", language: "اللغة",
    hello: "مرحبا {n}!", to_next_rank: "{n} نقطة للرتبة التالية", continue: "نتابع", review: "مراجعة الأخطاء",
    review_sub: "{n} أسئلة نعيد التدرّب عليها", review_empty: "لا توجد أخطاء للمراجعة 👏", levels: "المستويات",
    score_of: "{a} من {b} صحيحة", badges_count: "{a} من {b} أوسمة", quit_confirm: "هل نخرج من هذا النشاط؟", quit: "نخرج",
    stay: "نكمل", tab_learners: "المتعلّمون", tab_settings: "الإعدادات", tab_account: "الحساب", tab_about: "حول",
    gate_text: "هذا الفضاء للمرافق (أب، أم، أستاذ…). أجب عن السؤال:", synced: "محفوظ في الحساب",
    this_device: "في هذا الجهاز فقط", hard_items: "دروس فيها أخطاء:", reset_progress: "تصفير التقدّم",
    delete_learner: "حذف المتعلّم", delete_learner_confirm: "حذف {n} وكل تقدّمه نهائيا؟", reset_confirm: "تصفير كل تقدّم {n}؟",
    set_autoplay: "قراءة التعليمات بالصوت تلقائيا", set_sfx: "المؤثرات الصوتية", set_rate: "سرعة الصوت",
    test_voice: "تجربة الصوت", cloud_unavailable: "الحساب غير متاح حاليا (لا يوجد اتصال بالإنترنت).",
    account_title: "الحساب والحفظ في السحابة",
    account_why: "الحساب اختياري. يحفظ المتعلّمين وتقدّمهم على الإنترنت، فلا يضيع شيء عند تغيير الهاتف.",
    perk_backup: "☁️ نسخة احتياطية آمنة للتقدّم", perk_devices: "📱 نفس التقدّم على عدة أجهزة",
    perk_shared: "🔑 نفس الحساب يعمل في تطبيقَي Petit Français وحروفي", create_account: "إنشاء حساب", sign_in: "تسجيل الدخول",
    account_optional: "بدون حساب يعمل التطبيق كاملا، والتقدّم محفوظ في هذا الجهاز فقط.",
    sync_ok: "تمّت المزامنة", sync_running: "جارٍ الحفظ…", sync_offline: "لا يوجد إنترنت: سنحفظ لاحقا",
    sync_error: "تعذّر الحفظ، سنعيد المحاولة", signed_in_as: "متصل بالحساب:", sync_now: "مزامنة الآن", sign_out: "تسجيل الخروج",
    sign_out_confirm: "تسجيل الخروج من هذا الجهاز؟ يبقى التقدّم محفوظا في الحساب.", signed_out: "تم تسجيل الخروج",
    signed_in: "تم تسجيل الدخول ✔", delete_account: "حذف حسابي",
    delete_account_text: "يحذف الحساب نهائيا مع كل المتعلّمين وتقدّمهم على خوادمنا. نفس الحساب يُستعمل في تطبيقَي Petit Français وحروفي: ستُحذف بياناتهما أيضا.",
    delete_account_confirm: "هل تريد حذف حسابك نهائيا؟", delete_account_confirm2: "تأكيد أخير: لا يمكن التراجع عن الحذف.",
    delete_forever: "احذف نهائيا", account_deleted: "تم حذف الحساب وكل بياناته.",
    about_text: "English Steps تطبيق مجاني لتعلّم قواعد اللغة الإنجليزية: 88 درسا من المستوى الأساسي إلى المتقدّم، بشرح عربي وفرنسي، وأمثلة مسموعة، وتمارين مصحّحة. بدون إعلانات.",
    privacy: "سياسة الخصوصية", delete_page: "حذف الحساب والبيانات", share_app: "شارك التطبيق",
    share_text: "English Steps: تطبيق مجاني لتعلّم قواعد الإنجليزية بالشرح العربي",
    credits: "الأصوات: أصوات Microsoft العصبية · الخطوط: Baloo Bhaijaan 2",
    link_invalid: "الرابط غير صالح أو انتهت صلاحيته", account_ready: "تم تأكيد الحساب ✔",
    rank_1: "مبتدئ", rank_2: "متعلّم", rank_3: "مجتهد", rank_4: "متمكّن", rank_5: "متفوّق", rank_6: "بطل القواعد", rank_7: "أستاذ",
    b_first: "أول نشاط", b_plays10: "10 أنشطة", b_plays50: "50 نشاطا", b_stars3: "أول 3 نجوم", b_perfect5: "5 تمارين كاملة",
    b_lessons10: "10 دروس", b_lessons40: "40 درسا", b_typist: "30 جوابا مكتوبا", b_listener: "أذن صاغية",
    b_streak3: "3 أيام متتالية", b_streak7: "7 أيام متتالية", b_xp1000: "1000 نقطة", b_basic: "المستوى الأساسي",
    b_intermediate: "المستوى المتوسط", b_advanced: "المستوى المتقدّم", b_review: "راجعت أخطائي",
    mic_listening: "تكلّم الآن…", mic_heard: "سمعتُ:", mic_denied: "يجب السماح باستعمال الميكروفون", mic_nothing: "لم أسمع شيئا، نعيد؟",
    email: "البريد الإلكتروني", password: "كلمة السر", password_confirm: "تأكيد كلمة السر", password_hint: "8 أحرف على الأقل",
    show_password: "إظهار كلمة السر", your_name: "اسمك", your_name_ph: "اسم المتعلّم أو الأب أو الأستاذ…",
    signup_title: "إنشاء حساب", signup_intro: "يُنشئ الحساب شخص بالغ (المتعلّم الكبير، أو الأب، أو الأم، أو الأستاذ).",
    have_account: "لديك حساب؟", no_account: "ليس لديك حساب؟",
    shared_account_note: "إذا كان لديك حساب في Petit Français أو حروفي، استعمل نفس البريد وكلمة السر.",
    login_title: "تسجيل الدخول", login_intro: "ادخل لحفظ التقدّم واسترجاعه على هذا الجهاز.",
    forgot: "نسيت كلمة السر؟", forgot_title: "كلمة سر جديدة", forgot_intro: "نرسل لك رابطا لاختيار كلمة سر جديدة.",
    send_link: "أرسل الرابط", check_email_title: "تحقّق من بريدك",
    check_email: "أرسلنا رابط التأكيد إلى {e}. افتح الرسالة واضغط على الرابط، ثم عد إلى التطبيق وسجّل الدخول.",
    check_spam: "إن لم تجد الرسالة، انظر في مجلد الرسائل غير المرغوب فيها (Spam).", resend: "إعادة الإرسال", resent: "أُعيد الإرسال ✔",
    reset_sent: "أرسلنا إلى {e} رابطا لاختيار كلمة سر جديدة.", newpass_title: "اختر كلمة سر جديدة", password_updated: "تم تغيير كلمة السر ✔",
    err_invalid_credentials: "البريد أو كلمة السر غير صحيحة", err_email_not_confirmed: "أكّد بريدك أولا (افتح الرسالة التي أرسلناها)",
    err_user_exists: "هذا البريد مسجّل من قبل: سجّل الدخول", err_weak_password: "كلمة السر ضعيفة جدا",
    err_same_password: "اختر كلمة سر مختلفة عن القديمة", err_rate_limit: "محاولات كثيرة، انتظر قليلا ثم أعد",
    err_email: "البريد الإلكتروني غير صحيح", err_signup_disabled: "التسجيل متوقّف حاليا", err_offline: "لا يوجد اتصال بالإنترنت",
    err_generic: "حدث خطأ، أعد المحاولة", err_name: "اكتب اسمك (حرفان على الأقل)", err_password_short: "كلمة السر قصيرة: 8 أحرف على الأقل",
    err_password_match: "كلمتا السر غير متطابقتين",
  },
  fr: {
    close: "Fermer", yes: "Oui", no: "Non", back: "Retour", listen: "Écouter", slow: "Lentement", check: "Vérifier", save: "Enregistrer",
    start: "Commencer", next: "Suivant", previous: "Précédent", again: "Rejouer", done: "J'ai fini", edit: "Modifier", minutes: "min",
    version: "Version", undo: "Annuler", repeat: "Répète à voix haute", correct_answer: "La bonne réponse :", continue_btn: "Continuer",
    your_answer: "Ta réponse", questions_n: "questions",
    tagline: "La grammaire anglaise expliquée en français et en arabe, avec la voix, du niveau débutant à avancé",
    pick_lang: "اختر لغة الشرح — Choisis la langue des explications",
    new_learner: "Nouvel apprenant", edit_learner: "Modifier l'apprenant", learner_name: "Prénom", learner_name_ph: "ex. : Salma, Yassine…",
    avatar: "Image", no_account_needed: "Pas besoin de compte : la progression reste sur cet appareil. Un compte peut être créé plus tard.",
    who_now: "Qui apprend maintenant ?", add_learner: "Ajouter un apprenant", helper: "Espace accompagnant", badges: "Badges",
    language: "Langue", hello: "Bonjour {n} !", to_next_rank: "Encore {n} points pour le rang suivant", continue: "Continuer",
    review: "Réviser mes erreurs", review_sub: "{n} questions à retravailler", review_empty: "Aucune erreur à réviser 👏",
    levels: "Niveaux", score_of: "{a} bonnes réponses sur {b}", badges_count: "{a} badges sur {b}",
    quit_confirm: "Quitter cette activité ?", quit: "Quitter", stay: "Continuer", tab_learners: "Apprenants",
    tab_settings: "Réglages", tab_account: "Compte", tab_about: "À propos",
    gate_text: "Cet espace est pour l'accompagnant (parent, professeur…). Réponds à la question :", synced: "dans le compte",
    this_device: "sur cet appareil seulement", hard_items: "Leçons avec des erreurs :", reset_progress: "Remettre à zéro",
    delete_learner: "Supprimer", delete_learner_confirm: "Supprimer {n} et toute sa progression ?",
    reset_confirm: "Remettre à zéro la progression de {n} ?", set_autoplay: "Lire les consignes à voix haute",
    set_sfx: "Effets sonores", set_rate: "Vitesse de la voix", test_voice: "Tester la voix",
    cloud_unavailable: "Compte indisponible pour le moment (pas d'Internet).", account_title: "Compte et sauvegarde en ligne",
    account_why: "Le compte est facultatif. Il sauvegarde les apprenants et leur progression en ligne : rien ne se perd si vous changez de téléphone.",
    perk_backup: "☁️ Sauvegarde sûre de la progression", perk_devices: "📱 La même progression sur plusieurs appareils",
    perk_shared: "🔑 Le même compte marche dans Petit Français et Hurufi", create_account: "Créer un compte", sign_in: "Se connecter",
    account_optional: "Sans compte, toute l'appli fonctionne ; la progression reste sur cet appareil.",
    sync_ok: "Synchronisé", sync_running: "Sauvegarde…", sync_offline: "Pas d'Internet : sauvegarde plus tard",
    sync_error: "Sauvegarde impossible, nouvel essai bientôt", signed_in_as: "Connecté :", sync_now: "Synchroniser",
    sign_out: "Se déconnecter", sign_out_confirm: "Se déconnecter de cet appareil ? La progression reste dans le compte.",
    signed_out: "Déconnecté", signed_in: "Connecté ✔", delete_account: "Supprimer mon compte",
    delete_account_text: "Supprime définitivement le compte, tous les apprenants et leur progression sur nos serveurs. Ce compte sert aussi pour Petit Français et Hurufi : leurs données seront aussi supprimées.",
    delete_account_confirm: "Supprimer définitivement votre compte ?", delete_account_confirm2: "Dernière confirmation : impossible d'annuler.",
    delete_forever: "Supprimer définitivement", account_deleted: "Compte et données supprimés.",
    about_text: "English Steps est une application gratuite pour apprendre la grammaire anglaise : 88 leçons du niveau débutant à avancé, expliquées en français et en arabe, avec des exemples à écouter et des exercices corrigés. Sans publicité.",
    privacy: "Politique de confidentialité", delete_page: "Supprimer le compte et les données", share_app: "Partager l'appli",
    share_text: "English Steps : une appli gratuite pour apprendre la grammaire anglaise",
    credits: "Voix : voix neuronales Microsoft · Police : Baloo Bhaijaan 2", link_invalid: "Lien invalide ou expiré",
    account_ready: "Compte confirmé ✔",
    rank_1: "Débutant", rank_2: "Apprenant", rank_3: "Travailleur", rank_4: "Confirmé", rank_5: "Excellent", rank_6: "Champion de grammaire", rank_7: "Maître",
    b_first: "Première activité", b_plays10: "10 activités", b_plays50: "50 activités", b_stars3: "Premières 3 étoiles",
    b_perfect5: "5 sans faute", b_lessons10: "10 leçons", b_lessons40: "40 leçons", b_typist: "30 réponses écrites",
    b_listener: "Bonne oreille", b_streak3: "3 jours de suite", b_streak7: "7 jours de suite", b_xp1000: "1000 points",
    b_basic: "Niveau débutant", b_intermediate: "Niveau intermédiaire", b_advanced: "Niveau avancé", b_review: "J'ai révisé",
    mic_listening: "Parle maintenant…", mic_heard: "J'ai entendu :", mic_denied: "Il faut autoriser le micro", mic_nothing: "Je n'ai rien entendu, on recommence ?",
    email: "E-mail", password: "Mot de passe", password_confirm: "Confirmer le mot de passe", password_hint: "8 caractères minimum",
    show_password: "Afficher le mot de passe", your_name: "Votre nom", your_name_ph: "l'apprenant, un parent, un professeur…",
    signup_title: "Créer un compte", signup_intro: "Le compte est créé par un adulte (l'apprenant adulte, un parent ou un professeur).",
    have_account: "Déjà un compte ?", no_account: "Pas encore de compte ?",
    shared_account_note: "Vous avez un compte Petit Français ou Hurufi ? Utilisez le même e-mail et le même mot de passe.",
    login_title: "Connexion", login_intro: "Connectez-vous pour sauvegarder et retrouver la progression.",
    forgot: "Mot de passe oublié ?", forgot_title: "Nouveau mot de passe", forgot_intro: "Nous vous envoyons un lien pour choisir un nouveau mot de passe.",
    send_link: "Envoyer le lien", check_email_title: "Vérifiez vos e-mails",
    check_email: "Un lien de confirmation a été envoyé à {e}. Ouvrez le message, touchez le lien, puis revenez vous connecter.",
    check_spam: "Pas de message ? Regardez dans les courriers indésirables (spam).", resend: "Renvoyer", resent: "Renvoyé ✔",
    reset_sent: "Un lien pour choisir un nouveau mot de passe a été envoyé à {e}.", newpass_title: "Choisissez un nouveau mot de passe",
    password_updated: "Mot de passe modifié ✔",
    err_invalid_credentials: "E-mail ou mot de passe incorrect", err_email_not_confirmed: "Confirmez d'abord votre e-mail (ouvrez le message reçu)",
    err_user_exists: "Cet e-mail a déjà un compte : connectez-vous", err_weak_password: "Mot de passe trop faible",
    err_same_password: "Choisissez un mot de passe différent", err_rate_limit: "Trop d'essais, patientez un peu",
    err_email: "Adresse e-mail incorrecte", err_signup_disabled: "Inscriptions fermées pour le moment", err_offline: "Pas de connexion Internet",
    err_generic: "Une erreur est survenue, réessayez", err_name: "Écrivez votre nom (2 lettres minimum)",
    err_password_short: "Mot de passe trop court : 8 caractères minimum", err_password_match: "Les deux mots de passe sont différents",
  },
};

function lang() {
  const l = Settings.get("lang");
  if (l) return l;
  return (navigator.language || "ar").slice(0, 2) === "fr" ? "fr" : "ar";
}

function t(key, vars) {
  let s = (STRINGS[lang()] || STRINGS.ar)[key];
  if (s == null) s = STRINGS.ar[key] != null ? STRINGS.ar[key] : key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.split(`{${k}}`).join(v); });
  return s;
}

function applyLang() {
  const l = lang();
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
}

function setLang(l) {
  Settings.set("lang", l);
  applyLang();
}

function langLabel() { return { ar: "ع", fr: "FR" }[lang()]; }

function cycleLang() {
  setLang(lang() === "ar" ? "fr" : "ar");
  Sfx.click();
  route();
  toast({ ar: "العربية", fr: "Français" }[lang()]);
}
