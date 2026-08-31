const SUPABASE_URL =
  "https://nwvkauyoncedbetjridz.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_Rs6Nh2FBLVQHiBW_owiMyQ_2ax0VA-t";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =====================================================
   AYARLAR
===================================================== */

const CURRENT_YEAR = new Date().getFullYear();

let currentUser = null;
let currentProfile = null;

let questions = [];
let answers = [];

let currentFilter = "all";
let selectedPerson = "gul";

let isLoadingApplication = false;
let toastTimer = null;


/* =====================================================
   ELEMENTLER
===================================================== */

const loginScreen =
  document.getElementById("loginScreen");

const appShell =
  document.getElementById("appShell");

const loginBtn =
  document.getElementById("loginBtn");

const loginError =
  document.getElementById("loginError");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const questionList =
  document.getElementById("questionList");

const answeredCount =
  document.getElementById("answeredCount");

const totalCount =
  document.getElementById("totalCount");

const progressText =
  document.getElementById("progressText");

const progressFill =
  document.getElementById("progressFill");

const toast =
  document.getElementById("toast");

const welcomeUser =
  document.getElementById("welcomeUser");

const currentPersonName =
  document.getElementById("currentPersonName");

const continueBtn =
  document.getElementById("continueBtn");


/* =====================================================
   BAŞLANGIÇ
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  init
);


async function init() {

  console.log("=================================");
  console.log("GÜL & KAĞAN UYGULAMASI");
  console.log("BAŞLATILIYOR");
  console.log("=================================");

  showLoginScreen();

  setYear();

  setupPersonButtons();

  setupFilters();

  if (loginBtn) {
    loginBtn.addEventListener(
      "click",
      login
    );
  }

  if (passwordInput) {
    passwordInput.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {
          login();
        }

      }
    );
  }

  const logoutBtn =
    document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener(
      "click",
      logout
    );
  }

  if (continueBtn) {
    continueBtn.addEventListener(
      "click",
      continueFromWhereLeft
    );
  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.getSession();


    if (error) {

      console.error(
        "Session kontrol hatası:",
        error
      );

      showLoginError(
        "Oturum kontrol edilemedi: " +
        error.message
      );

      return;
    }


    const session =
      data?.session;


    if (session) {

      currentUser =
        session.user;

      console.log(
        "Mevcut session bulundu:",
        currentUser.email
      );

      await loadApplication();

    } else {

      showLoginScreen();

    }


  } catch (error) {

    console.error(
      "Başlangıç hatası:",
      error
    );

    showLoginError(
      "Başlangıç hatası: " +
      error.message
    );

  }

}


/* =====================================================
   YIL
===================================================== */

function setYear() {

  const heroYear =
    document.getElementById(
      "heroYear"
    );

  const yearDisplay =
    document.getElementById(
      "yearDisplay"
    );


  if (heroYear) {
    heroYear.textContent =
      CURRENT_YEAR;
  }


  if (yearDisplay) {
    yearDisplay.textContent =
      CURRENT_YEAR;
  }

}


/* =====================================================
   GÜL / KAĞAN
===================================================== */

function setupPersonButtons() {

  const buttons =
    document.querySelectorAll(
      ".person-btn"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      function () {

        buttons.forEach(btn => {
          btn.classList.remove("active");
        });

        this.classList.add("active");

        selectedPerson =
          this.dataset.person;

        updateLoginButton();

      }
    );

  });


  const gulButton =
    document.querySelector(
      '.person-btn[data-person="gul"]'
    );


  if (gulButton) {

    buttons.forEach(btn => {
      btn.classList.remove("active");
    });

    gulButton.classList.add("active");

    selectedPerson = "gul";
  }


  updateLoginButton();

}


/* =====================================================
   LOGIN BUTONU
===================================================== */

function updateLoginButton() {

  if (!loginBtn) {
    return;
  }


  const name =
    selectedPerson === "gul"
      ? "Gül"
      : "Kağan";


  loginBtn.innerHTML =
    `${name} olarak giriş yap <span>→</span>`;

}


/* =====================================================
   LOGIN
===================================================== */

async function login() {

  clearLoginError();

  const email =
    emailInput
      ? emailInput.value.trim()
      : "";

  const password =
    passwordInput
      ? passwordInput.value
      : "";


  if (!email || !password) {

    showLoginError(
      "E-posta ve şifre alanlarını doldurmalısın."
    );

    return;
  }


  loginBtn.disabled = true;

  loginBtn.innerHTML =
    "Giriş yapılıyor...";


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });


    if (error) {

      console.error(
        "LOGIN HATASI:",
        error
      );

      showLoginError(
        "Giriş başarısız: " +
        error.message
      );

      return;
    }


    if (!data?.user) {

      showLoginError(
        "Kullanıcı bilgisi alınamadı."
      );

      return;
    }


    currentUser =
      data.user;


    console.log(
      "Giriş başarılı:",
      currentUser.id
    );


    await loadApplication();


  } catch (error) {

    console.error(
      "LOGIN EXCEPTION:",
      error
    );

    showLoginError(
      "Beklenmeyen giriş hatası: " +
      error.message
    );


  } finally {

    loginBtn.disabled = false;

    updateLoginButton();

  }

}


/* =====================================================
   UYGULAMAYI YÜKLE
===================================================== */

async function loadApplication() {

  if (!currentUser) {
    return;
  }


  if (isLoadingApplication) {
    return;
  }


  isLoadingApplication = true;


  try {

    /*
      Login olmadan uygulama gösterilmiyor.
      Ancak login başarılı olduktan sonra
      uygulama açılıyor.
    */

    loginScreen.classList.add(
      "hidden"
    );

    appShell.classList.remove(
      "hidden"
    );


    /* PROFİL */

    const profileResult =
      await loadProfile();


    if (!profileResult.success) {

      showApplicationError(
        "Profil yüklenemedi",
        profileResult.message
      );

      return;
    }


    /* SORULAR */

    const questionResult =
      await loadQuestions();


    if (!questionResult.success) {

      showApplicationError(
        "Sorular yüklenemedi",
        questionResult.message
      );

      return;
    }


    /* CEVAPLAR */

    const answerResult =
      await loadAnswers();


    if (!answerResult.success) {

      console.error(
        "Cevaplar yüklenemedi:",
        answerResult.message
      );

      answers = [];
    }


    renderQuestions();

    updateStats();

    updateUserInterface();


  } catch (error) {

    console.error(
      "Uygulama yükleme hatası:",
      error
    );

    showApplicationError(
      "Uygulama yüklenemedi",
      error.message
    );


  } finally {

    isLoadingApplication = false;

  }

}


/* =====================================================
   PROFİL
===================================================== */

async function loadProfile() {

  if (!currentUser) {

    return {
      success: false,
      message:
        "Aktif kullanıcı bulunamadı."
    };

  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("profiles")
        .select("*")
        .eq(
          "id",
          currentUser.id
        )
        .maybeSingle();


    if (error) {

      console.error(
        "PROFİL HATASI:",
        error
      );

      return {

        success: false,

        message:
          `Supabase profil hatası:

${error.message}

Kod: ${error.code || "yok"}

Detay:
${error.details || "yok"}

Hint:
${error.hint || "yok"}`

      };

    }


    if (!data) {

      return {

        success: false,

        message:
          `Bu kullanıcı profiles tablosunda bulunamadı.

Giriş yapan User ID:

${currentUser.id}

profiles.id ile auth.users.id aynı olmalı.`

      };

    }


    currentProfile =
      data;


    return {
      success: true,
      data
    };


  } catch (error) {

    return {
      success: false,
      message: error.message
    };

  }

}


/* =====================================================
   SORULARI YÜKLE
===================================================== */

async function loadQuestions() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("questions")
        .select(
          "id,question,sort_order,active,category,emoji,placeholder"
        )
        .eq(
          "active",
          true
        )
        .order(
          "sort_order",
          {
            ascending: true
          }
        );


    if (error) {

      console.error(
        "SORU HATASI:",
        error
      );

      return {

        success: false,

        message:
          `Supabase soru hatası:

${error.message}

Kod: ${error.code || "yok"}

Detay:
${error.details || "yok"}`

      };

    }


    questions =
      data || [];


    console.log(
      "Toplam soru:",
      questions.length
    );


    return {
      success: true,
      data: questions
    };


  } catch (error) {

    return {
      success: false,
      message: error.message
    };

  }

}


/* =====================================================
   CEVAPLARI YÜKLE
===================================================== */

async function loadAnswers() {

  if (!currentUser) {

    return {
      success: false,
      message:
        "Kullanıcı bulunamadı."
    };

  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("answers")
        .select("*")
        .eq(
          "year",
          CURRENT_YEAR
        );


    if (error) {

      console.error(
        "CEVAP HATASI:",
        error
      );

      return {
        success: false,
        message:
          error.message
      };

    }


    answers =
      data || [];


    return {
      success: true,
      data: answers
    };


  } catch (error) {

    return {
      success: false,
      message:
        error.message
    };

  }

}


/* =====================================================
   ARAYÜZ
===================================================== */

function updateUserInterface() {

  if (!currentProfile) {
    return;
  }


  const name =
    currentProfile.name ||
    (
      currentProfile.email ||
      currentUser?.email ||
      "Kullanıcı"
    );


  if (welcomeUser) {

    welcomeUser.textContent =
      `${name} olarak giriş yaptın`;

  }


  if (currentPersonName) {

    currentPersonName.textContent =
      name;

  }


  setYear();

}


/* =====================================================
   SORULARI ÇİZ
===================================================== */

function renderQuestions() {

  if (!questionList) {
    return;
  }


  let visibleQuestions =
    [...questions];


  if (
    currentFilter === "answered"
  ) {

    visibleQuestions =
      visibleQuestions.filter(
        question =>
          !!getMyAnswer(
            question.id
          )
      );

  }


  if (
    currentFilter === "unanswered"
  ) {

    visibleQuestions =
      visibleQuestions.filter(
        question =>
          !getMyAnswer(
            question.id
          )
      );

  }


  if (!visibleQuestions.length) {

    questionList.innerHTML = `

      <div class="empty">

        <div style="
          font-size:42px;
          margin-bottom:12px;
        ">
          ♡
        </div>

        <strong>
          ${
            questions.length === 0
              ? "Henüz soru bulunamadı."
              : "Bu filtrede gösterilecek soru yok."
          }
        </strong>

      </div>

    `;

    return;
  }


  /*
    KATEGORİLERE AYIR
  */

  const groups = [];


  visibleQuestions.forEach(question => {

    const category =
      question.category ||
      "Diğer";


    let group =
      groups.find(
        item =>
          item.category === category
      );


    if (!group) {

      group = {
        category,
        questions: []
      };

      groups.push(group);

    }


    group.questions.push(
      question
    );

  });


  questionList.innerHTML =
    groups
      .map(
        group =>
          createCategory(
            group
          )
      )
      .join("");


  /*
    KAYDET BUTONLARI
  */

  document
    .querySelectorAll(".save-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          saveAnswer(
            Number(
              button.dataset.questionId
            )
          );

        }
      );

    });

}


/* =====================================================
   KATEGORİ
===================================================== */

function createCategory(group) {

  const categoryIcons = {

    "Film & Dizi": "🎬",

    "Oyun": "🎮",

    "Yemek": "🍽️",

    "Kitap & Şiir": "📖",

    "Müzik": "🎵",

    "Birbirimiz": "❤️",

    "Hayaller": "🌟",

    "Tahmin": "🎯",

    "Gelecek": "🔮"

  };


  const icon =
    categoryIcons[
      group.category
    ] || "♡";


  return `

    <div class="question-category">

      <div class="category-heading">

        <div class="category-icon">
          ${icon}
        </div>

        <div>

          <div class="eyebrow">
            ${escapeHtml(group.category)}
          </div>

          <h3>
            ${escapeHtml(group.category)}
          </h3>

        </div>

      </div>


      <div class="category-questions">

        ${group.questions
          .map(
            (question, index) =>
              createQuestionCard(
                question,
                index
              )
          )
          .join("")}

      </div>

    </div>

  `;

}


/* =====================================================
   SORU KARTI
===================================================== */

function createQuestionCard(
  question,
  index
) {

  const myAnswer =
    getMyAnswer(
      question.id
    );


  const partnerAnswer =
    getPartnerAnswer(
      question.id
    );


  const answered =
    !!myAnswer;


  const partnerName =
    currentProfile?.name === "Gül"
      ? "Kağan"
      : "Gül";


  const emoji =
    question.emoji ||
    "♡";


  const placeholder =
    question.placeholder ||
    "Cevabını buraya yaz...";


  return `

    <article
      class="question-card"
    >

      <div class="question-number">

        ${emoji}

        ${String(
          question.sort_order ??
          index + 1
        ).padStart(2, "0")}

      </div>


      <h3 class="question-title">

        ${escapeHtml(
          question.question
        )}

      </h3>


      <textarea
        class="answer-area"
        id="answer-${question.id}"
        placeholder="${escapeHtml(
          placeholder
        )}"
      >${
        myAnswer
          ? escapeHtml(
              myAnswer.answer
            )
          : ""
      }</textarea>


      <div class="answer-actions">

        <span
          class="saved-label"
          id="saved-${question.id}"
        >

          ${
            answered
              ? "✓ Cevabın kayıtlı"
              : "Henüz cevaplanmadı"
          }

        </span>


        <button
          type="button"
          class="save-btn"
          data-question-id="${question.id}"
        >

          ${
            answered
              ? "Cevabı güncelle"
              : "Cevabı kaydet"
          }

        </button>

      </div>


      ${
        partnerAnswer
          ? `

            <div class="partner-answer">

              <div class="partner-title">

                ♥ ${escapeHtml(
                  partnerName
                )}'ın cevabı

              </div>

              <p>

                ${escapeHtml(
                  partnerAnswer.answer
                )}

              </p>

            </div>

          `
          : ""
      }

    </article>

  `;

}


/* =====================================================
   CEVAP KAYDET
===================================================== */

async function saveAnswer(
  questionId
) {

  if (!currentUser) {

    showToast(
      "Önce giriş yapmalısın."
    );

    return;
  }


  const textarea =
    document.getElementById(
      `answer-${questionId}`
    );


  if (!textarea) {
    return;
  }


  const answer =
    textarea.value.trim();


  if (!answer) {

    showToast(
      "Önce cevabını yazmalısın ❤️"
    );

    textarea.focus();

    return;
  }


  const button =
    document.querySelector(
      `.save-btn[data-question-id="${questionId}"]`
    );


  if (!button) {
    return;
  }


  button.disabled = true;

  button.textContent =
    "Kaydediliyor...";


  try {

    const {
      error
    } =
      await supabaseClient
        .from("answers")
        .upsert(

          {
            user_id:
              currentUser.id,

            question_id:
              questionId,

            year:
              CURRENT_YEAR,

            answer:
              answer
          },

          {
            onConflict:
              "user_id,question_id,year"
          }

        );


    if (error) {

      console.error(
        "CEVAP KAYIT HATASI:",
        error
      );

      showToast(
        "Cevap kaydedilemedi: " +
        error.message
      );

      return;
    }


    showToast(
      "Cevabın kaydedildi ❤️"
    );


    await loadAnswers();

    renderQuestions();

    updateStats();


  } catch (error) {

    console.error(
      "Cevap exception:",
      error
    );

    showToast(
      "Cevap kaydedilemedi: " +
      error.message
    );


  } finally {

    button.disabled = false;

  }

}


/* =====================================================
   KENDİ CEVABIN
===================================================== */

function getMyAnswer(
  questionId
) {

  if (!currentUser) {
    return null;
  }


  return (
    answers.find(
      answer =>

        answer.user_id ===
        currentUser.id &&

        Number(answer.question_id) ===
        Number(questionId) &&

        Number(answer.year) ===
        Number(CURRENT_YEAR)
    ) || null
  );

}


/* =====================================================
   PARTNER CEVABI
===================================================== */

function getPartnerAnswer(
  questionId
) {

  if (!currentUser) {
    return null;
  }


  return (
    answers.find(
      answer =>

        answer.user_id !==
        currentUser.id &&

        Number(answer.question_id) ===
        Number(questionId) &&

        Number(answer.year) ===
        Number(CURRENT_YEAR)
    ) || null
  );

}


/* =====================================================
   İSTATİSTİK
===================================================== */

function updateStats() {

  const answered =
    questions.filter(
      question =>
        !!getMyAnswer(
          question.id
        )
    ).length;


  const total =
    questions.length;


  const percentage =
    total === 0
      ? 0
      : Math.round(
          (answered / total) * 100
        );


  if (answeredCount) {

    answeredCount.textContent =
      answered;

  }


  if (totalCount) {

    totalCount.textContent =
      total;

  }


  if (progressText) {

    progressText.textContent =
      `${percentage}%`;

  }


  if (progressFill) {

    progressFill.style.width =
      `${percentage}%`;

  }

}


/* =====================================================
   FİLTRELER
===================================================== */

function setupFilters() {

  document
    .querySelectorAll(
      ".filter-btn"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".filter-btn"
            )
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          currentFilter =
            button.dataset.filter;


          renderQuestions();

        }
      );

    });

}


/* =====================================================
   DEVAM ET
===================================================== */

function continueFromWhereLeft() {

  const firstUnanswered =
    questions.find(
      question =>
        !getMyAnswer(
          question.id
        )
    );


  if (firstUnanswered) {

    const element =
      document.getElementById(
        `answer-${firstUnanswered.id}`
      );


    if (element) {

      element.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });


      setTimeout(
        () => element.focus(),
        500
      );

    }


    return;

  }


  const questionsSection =
    document.getElementById(
      "questions"
    );


  if (questionsSection) {

    questionsSection.scrollIntoView({
      behavior: "smooth"
    });

  }


  showToast(
    "Tüm soruları cevapladın! ❤️"
  );

}


/* =====================================================
   LOGIN EKRANI
===================================================== */

function showLoginScreen() {

  if (loginScreen) {

    loginScreen.classList.remove(
      "hidden"
    );

  }


  if (appShell) {

    appShell.classList.add(
      "hidden"
    );

  }


  currentUser = null;

  currentProfile = null;

  questions = [];

  answers = [];

  isLoadingApplication = false;

  clearLoginError();

}


/* =====================================================
   UYGULAMA HATASI
===================================================== */

function showApplicationError(
  title,
  message
) {

  if (appShell) {

    appShell.classList.remove(
      "hidden"
    );

  }


  if (!questionList) {
    return;
  }


  questionList.innerHTML = `

    <div
      class="empty"
      style="
        border:1px solid #e9dfdb;
        border-radius:20px;
        background:white;
        padding:35px 25px;
      "
    >

      <div style="
        font-size:42px;
        margin-bottom:15px;
      ">
        ⚠️
      </div>


      <h3 style="
        margin:0 0 12px;
        color:#843f4c;
      ">

        ${escapeHtml(title)}

      </h3>


      <p style="
        white-space:pre-line;
        text-align:left;
        max-width:700px;
        margin:0 auto;
        line-height:1.7;
        font-size:13px;
      ">

        ${escapeHtml(message)}

      </p>

    </div>

  `;


  updateStats();

}


/* =====================================================
   LOGIN HATASI
===================================================== */

function showLoginError(
  message
) {

  if (loginError) {

    loginError.textContent =
      message;

  }

}


function clearLoginError() {

  if (loginError) {

    loginError.textContent =
      "";

  }

}


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

  try {

    const {
      error
    } =
      await supabaseClient.auth.signOut();


    if (error) {

      showToast(
        "Çıkış yapılamadı: " +
        error.message
      );

      return;
    }


    currentUser = null;

    currentProfile = null;

    questions = [];

    answers = [];


    showLoginScreen();


    if (emailInput) {
      emailInput.value = "";
    }


    if (passwordInput) {
      passwordInput.value = "";
    }


    showToast(
      "Çıkış yapıldı."
    );


  } catch (error) {

    console.error(
      "Logout exception:",
      error
    );

  }

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
  message
) {

  if (!toast) {
    return;
  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3000
    );

}


/* =====================================================
   HTML GÜVENLİĞİ
===================================================== */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =====================================================
   AUTH
===================================================== */

supabaseClient.auth.onAuthStateChange(
  (
    event,
    session
  ) => {

    console.log(
      "AUTH EVENT:",
      event
    );


    if (
      event ===
      "SIGNED_OUT"
    ) {

      currentUser = null;

      currentProfile = null;

      questions = [];

      answers = [];


      showLoginScreen();

    }

  }
);
