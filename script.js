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

const CURRENT_YEAR =
  new Date().getFullYear();

let currentUser = null;
let currentProfile = null;

let questions = [];
let answers = [];

let currentCategory = "all";
let currentStatus = "all";

let selectedPerson = "gul";

let isLoadingApplication = false;

let toastTimer = null;


/* =====================================================
   KATEGORİLER
===================================================== */

const CATEGORY_CONFIG = {

  "Film & Dizi": {
    emoji: "🎬",
    label: "Film & Dizi"
  },

  "Oyun": {
    emoji: "🎮",
    label: "Oyun"
  },

  "Yemek": {
    emoji: "🍕",
    label: "Yemek"
  },

  "Kitap & Şiir": {
    emoji: "📖",
    label: "Kitap & Şiir"
  },

  "Müzik": {
    emoji: "🎵",
    label: "Müzik"
  },

  "Birbirimiz": {
    emoji: "❤️",
    label: "Birbirimiz"
  },

  "Hayaller": {
    emoji: "✈️",
    label: "Hayaller"
  },

  "Tahmin": {
    emoji: "🎯",
    label: "Tahmin"
  },

  "Gelecek": {
    emoji: "🔮",
    label: "Gelecek"
  }

};


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

const categoryFilters =
  document.getElementById("categoryFilters");

const categoryFilterContainer =
  categoryFilters
    ? categoryFilters.querySelector(
        ".category-filters"
      )
    : null;

const backgroundMusic =
  document.getElementById(
    "backgroundMusic"
  );

const musicBtn =
  document.getElementById(
    "musicBtn"
  );

let musicEnabled = true;


/* =====================================================
   BAŞLANGIÇ
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  init
);


async function init() {

  console.log(
    "GÜL & KAĞAN UYGULAMASI"
  );

  console.log(
    "FINAL SÜRÜM BAŞLATILIYOR"
  );


  showLoginScreen();

  setYear();

  setupPersonButtons();

  setupStatusFilters();

  setupMusic();

  setupLogin();


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
   LOGIN EVENTLERİ
===================================================== */

function setupLogin() {

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

        if (
          event.key === "Enter"
        ) {

          login();

        }

      }
    );

  }


  const logoutBtn =
    document.getElementById(
      "logoutBtn"
    );


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

        buttons.forEach(
          btn =>
            btn.classList.remove(
              "active"
            )
        );


        this.classList.add(
          "active"
        );


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

    buttons.forEach(
      btn =>
        btn.classList.remove(
          "active"
        )
    );

    gulButton.classList.add(
      "active"
    );

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


    await loadApplication();


    /*
      Tarayıcı izin verirse
      login sonrasında müziği başlat.
    */

    attemptStartMusic();


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


    buildCategoryFilters();

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
        message: error.message
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
      message: error.message
    };

  }

}


/* =====================================================
   KULLANICI ARAYÜZÜ
===================================================== */

function updateUserInterface() {

  if (!currentProfile) {
    return;
  }


  const name =
    currentProfile.name ||
    currentProfile.email ||
    currentUser?.email ||
    "Kullanıcı";


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
   KATEGORİ FİLTRELERİNİ OLUŞTUR
===================================================== */

function buildCategoryFilters() {

  if (!categoryFilterContainer) {
    return;
  }


  const categories = [];


  questions.forEach(question => {

    const category =
      question.category ||
      "Diğer";


    if (
      !categories.includes(
        category
      )
    ) {

      categories.push(
        category
      );

    }

  });


  categoryFilterContainer.innerHTML = "";


  const allButton =
    document.createElement(
      "button"
    );


  allButton.type = "button";

  allButton.className =
    "category-filter" +
    (
      currentCategory === "all"
        ? " active"
        : ""
    );

  allButton.dataset.category =
    "all";

  allButton.textContent =
    "❤️ Tümü";


  categoryFilterContainer.appendChild(
    allButton
  );


  categories.forEach(
    category => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";


      button.className =
        "category-filter" +
        (
          currentCategory ===
          category
            ? " active"
            : ""
        );


      button.dataset.category =
        category;


      const config =
        CATEGORY_CONFIG[
          category
        ];


      const emoji =
        config?.emoji ||
        "♡";


      button.textContent =
        `${emoji} ${category}`;


      categoryFilterContainer.appendChild(
        button
      );

    }
  );


  setupCategoryFilterEvents();

}


/* =====================================================
   KATEGORİ EVENTLERİ
===================================================== */

function setupCategoryFilterEvents() {

  if (!categoryFilterContainer) {
    return;
  }


  categoryFilterContainer
    .querySelectorAll(
      ".category-filter"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          currentCategory =
            button.dataset.category;


          categoryFilterContainer
            .querySelectorAll(
              ".category-filter"
            )
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          renderQuestions();

          document
            .getElementById(
              "questions"
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

        }
      );

    });

}


/* =====================================================
   DURUM FİLTRELERİ
===================================================== */

function setupStatusFilters() {

  document
    .querySelectorAll(
      ".status-filter"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          currentStatus =
            button.dataset.status;


          document
            .querySelectorAll(
              ".status-filter"
            )
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );


          button.classList.add(
            "active"
          );


          renderQuestions();

        }
      );

    });

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


  /* KATEGORİ */

  if (
    currentCategory !== "all"
  ) {

    visibleQuestions =
      visibleQuestions.filter(
        question =>
          question.category ===
          currentCategory
      );

  }


  /* DURUM */

  if (
    currentStatus === "answered"
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
    currentStatus === "unanswered"
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

        <div class="empty-icon">
          ♡
        </div>

        <strong>
          ${
            questions.length === 0
              ? "Henüz soru bulunamadı."
              : "Bu filtrede gösterilecek soru yok."
          }
        </strong>

        <p>
          ${
            currentStatus === "answered"
              ? "Henüz cevapladığın bir soru bulunmuyor."
              : currentStatus === "unanswered"
                ? "Bu kategoride tüm soruları cevaplamışsın. ❤️"
                : "Başka bir kategori seçebilirsin."
          }
        </p>

      </div>

    `;

    return;

  }


  /*
    TÜMÜ seçiliyorsa kategorilere ayır.
    Tek kategori seçiliyorsa kategori başlığını
    yine göster ama yalnızca o kategori gelir.
  */

  const groups = [];


  visibleQuestions.forEach(
    question => {

      const category =
        question.category ||
        "Diğer";


      let group =
        groups.find(
          item =>
            item.category ===
            category
        );


      if (!group) {

        group = {

          category,

          questions: []

        };


        groups.push(
          group
        );

      }


      group.questions.push(
        question
      );

    }
  );


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
    .querySelectorAll(
      ".save-btn"
    )
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

function createCategory(
  group
) {

  const config =
    CATEGORY_CONFIG[
      group.category
    ];


  const icon =
    config?.emoji ||
    "♡";


  return `

    <div class="question-category">

      <div class="category-heading">

        <div class="category-icon">
          ${icon}
        </div>

        <div>

          <div class="eyebrow">
            ${escapeHtml(
              group.category
            )}
          </div>

          <h3>
            ${escapeHtml(
              group.category
            )}
          </h3>

        </div>

      </div>


      <div class="category-questions">

        ${group.questions
          .map(
            question =>
              createQuestionCard(
                question
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
  question
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
      class="question-card ${
        answered
          ? "is-answered"
          : ""
      }"
    >

      <div class="question-number">

        <span>
          ${emoji}
        </span>

        <span>
          ${String(
            question.sort_order ??
            ""
          ).padStart(2, "0")}
        </span>

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

        Number(
          answer.question_id
        ) ===
        Number(
          questionId
        ) &&

        Number(
          answer.year
        ) ===
        Number(
          CURRENT_YEAR
        )
    )

    || null

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

        Number(
          answer.question_id
        ) ===
        Number(
          questionId
        ) &&

        Number(
          answer.year
        ) ===
        Number(
          CURRENT_YEAR
        )
    )

    || null

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
          (
            answered /
            total
          ) * 100
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
   DEVAM ET
===================================================== */

function continueFromWhereLeft() {

  /*
    Her zaman ilk cevapsız soruyu bul.
  */

  const firstUnanswered =
    questions.find(
      question =>
        !getMyAnswer(
          question.id
        )
    );


  if (firstUnanswered) {

    /*
      Önce o sorunun kategorisine geç.
    */

    currentCategory =
      firstUnanswered.category ||
      "all";


    currentStatus =
      "all";


    updateActiveCategoryButton();

    updateActiveStatusButton();


    renderQuestions();


    setTimeout(
      () => {

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
            () =>
              element.focus(),
            500
          );

        }

      },
      100
    );


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
   AKTİF KATEGORİ BUTONU
===================================================== */

function updateActiveCategoryButton() {

  if (!categoryFilterContainer) {
    return;
  }


  categoryFilterContainer
    .querySelectorAll(
      ".category-filter"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.category ===
        currentCategory
      );

    });

}


/* =====================================================
   AKTİF DURUM BUTONU
===================================================== */

function updateActiveStatusButton() {

  document
    .querySelectorAll(
      ".status-filter"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.status ===
        currentStatus
      );

    });

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

  currentCategory = "all";

  currentStatus = "all";

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

    <div class="empty error-empty">

      <div class="empty-icon">
        ⚠️
      </div>

      <h3>
        ${escapeHtml(title)}
      </h3>

      <p>
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


    stopMusic();


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
   MÜZİK
===================================================== */

function setupMusic() {

  if (!backgroundMusic) {
    return;
  }


  const savedPreference =
    localStorage.getItem(
      "gk_music_enabled"
    );


  if (
    savedPreference === "false"
  ) {

    musicEnabled = false;

  }


  updateMusicButton();


  if (musicBtn) {

    musicBtn.addEventListener(
      "click",
      toggleMusic
    );

  }


  /*
    Tarayıcı otomatik oynatmayı engellerse,
    uygulamadaki ilk kullanıcı etkileşiminde
    tekrar deniyoruz.
  */

  document.addEventListener(
    "click",
    () => {

      if (
        currentUser &&
        musicEnabled &&
        backgroundMusic.paused
      ) {

        attemptStartMusic();

      }

    },
    {
      once: false
    }
  );

}


function attemptStartMusic() {

  if (
    !backgroundMusic ||
    !musicEnabled ||
    !currentUser
  ) {

    return;

  }


  backgroundMusic.volume =
    0.18;


  const promise =
    backgroundMusic.play();


  if (
    promise &&
    typeof promise.catch ===
      "function"
  ) {

    promise
      .then(() => {

        updateMusicButton();

      })
      .catch(() => {

        /*
          Tarayıcı autoplay'i engellerse
          kullanıcı ♫ butonuna basınca
          başlayacak.
        */

        updateMusicButton();

      });

  }

}


function toggleMusic() {

  if (!backgroundMusic) {
    return;
  }


  if (
    backgroundMusic.paused
  ) {

    musicEnabled = true;

    localStorage.setItem(
      "gk_music_enabled",
      "true"
    );


    backgroundMusic.volume =
      0.18;


    backgroundMusic
      .play()
      .then(() => {

        showToast(
          "Müzik açıldı 🎵"
        );

        updateMusicButton();

      })
      .catch(() => {

        showToast(
          "Müziği başlatmak için tekrar dokun 🎵"
        );

      });


  } else {

    musicEnabled = false;

    localStorage.setItem(
      "gk_music_enabled",
      "false"
    );


    backgroundMusic.pause();


    showToast(
      "Müzik kapatıldı."
    );


    updateMusicButton();

  }

}


function stopMusic() {

  if (!backgroundMusic) {
    return;
  }


  backgroundMusic.pause();

  backgroundMusic.currentTime =
    0;

}


function updateMusicButton() {

  if (!musicBtn) {
    return;
  }


  if (
    backgroundMusic &&
    !backgroundMusic.paused
  ) {

    musicBtn.textContent =
      "🔊";

    musicBtn.classList.add(
      "playing"
    );

    musicBtn.title =
      "Müziği kapat";

  } else {

    musicBtn.textContent =
      "♫";

    musicBtn.classList.remove(
      "playing"
    );

    musicBtn.title =
      "Müziği aç";

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

      stopMusic();


      currentUser = null;

      currentProfile = null;

      questions = [];

      answers = [];


      showLoginScreen();

    }

  }
);
