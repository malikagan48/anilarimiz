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
  console.log("UYGULAMA BAŞLATILIYOR");
  console.log("=================================");


  /* -----------------------------------------------
     İlk açılış
  ------------------------------------------------ */

  showLoginScreen();


  /* -----------------------------------------------
     YIL
  ------------------------------------------------ */

  setYear();


  /* -----------------------------------------------
     BUTONLAR
  ------------------------------------------------ */

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


  /* -----------------------------------------------
     MEVCUT SESSION
  ------------------------------------------------ */

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

      console.log(
        "Mevcut session bulundu:",
        session.user.email
      );


      currentUser =
        session.user;


      await loadApplication();

    } else {

      console.log(
        "Aktif session bulunamadı."
      );


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
   GÜL / KAĞAN SEÇİMİ
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

          btn.classList.remove(
            "active"
          );

        });


        this.classList.add(
          "active"
        );


        selectedPerson =
          this.dataset.person;


        updateLoginButton();


        console.log(
          "Seçilen kişi:",
          selectedPerson
        );

      }
    );

  });


  const gulButton =
    document.querySelector(
      '.person-btn[data-person="gul"]'
    );


  if (gulButton) {

    buttons.forEach(btn =>
      btn.classList.remove("active")
    );

    gulButton.classList.add("active");

  }


  updateLoginButton();

}


/* =====================================================
   GİRİŞ BUTONU
===================================================== */

function updateLoginButton() {

  if (!loginBtn)
    return;


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

  if (!loginBtn)
    return;


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


  console.log(
    "Giriş deneniyor:",
    email
  );


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.signInWithPassword({

        email:
          email,

        password:
          password

      });


    if (error) {

      console.error(
        "SUPABASE LOGIN HATASI:",
        error
      );


      showLoginError(
        "Giriş başarısız: " +
        error.message
      );


      loginBtn.disabled = false;

      updateLoginButton();

      return;

    }


    if (!data?.user) {

      showLoginError(
        "Giriş başarılı görünüyor fakat kullanıcı bilgisi alınamadı."
      );


      loginBtn.disabled = false;

      updateLoginButton();

      return;

    }


    /* -----------------------------------------------
       LOGIN BAŞARILI
    ------------------------------------------------ */

    currentUser =
      data.user;


    console.log(
      "================================="
    );

    console.log(
      "GİRİŞ BAŞARILI"
    );

    console.log(
      "User ID:",
      currentUser.id
    );

    console.log(
      "Email:",
      currentUser.email
    );

    console.log(
      "================================="
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

    console.warn(
      "loadApplication çağrıldı fakat currentUser yok."
    );

    return;

  }


  if (isLoadingApplication) {

    console.log(
      "Uygulama zaten yükleniyor, tekrar çalıştırılmadı."
    );

    return;

  }


  isLoadingApplication = true;


  console.log(
    "Uygulama yükleniyor..."
  );


  try {

    /* -----------------------------------------------
       Önce uygulamayı göster
    ------------------------------------------------ */

    loginScreen.classList.add(
      "hidden"
    );

    appShell.classList.remove(
      "hidden"
    );


    /* -----------------------------------------------
       PROFİL
    ------------------------------------------------ */

    console.log(
      "1) Profil yükleniyor..."
    );


    const profileResult =
      await loadProfile();


    if (!profileResult.success) {

      console.error(
        "PROFİL YÜKLENEMEDİ."
      );


      /*
       ÖNEMLİ:
       Artık login ekranına ATMAYACAĞIZ.
      */

      showApplicationError(
        "Profil yüklenemedi",
        profileResult.message
      );


      return;

    }


    console.log(
      "Profil başarıyla yüklendi:",
      currentProfile
    );


    /* -----------------------------------------------
       SORULAR
    ------------------------------------------------ */

    console.log(
      "2) Sorular yükleniyor..."
    );


    const questionResult =
      await loadQuestions();


    if (!questionResult.success) {

      console.error(
        "SORULAR YÜKLENEMEDİ."
      );


      showApplicationError(
        "Sorular yüklenemedi",
        questionResult.message
      );


      return;

    }


    console.log(
      "Sorular:",
      questions.length
    );


    /* -----------------------------------------------
       CEVAPLAR
    ------------------------------------------------ */

    console.log(
      "3) Cevaplar yükleniyor..."
    );


    const answerResult =
      await loadAnswers();


    if (!answerResult.success) {

      console.error(
        "CEVAPLAR YÜKLENEMEDİ."
      );


      /*
       Cevaplar yüklenemese bile
       sorular gösterilsin.
      */

      answers = [];

    }


    console.log(
      "Cevaplar:",
      answers.length
    );


    /* -----------------------------------------------
       EKRANI ÇİZ
    ------------------------------------------------ */

    renderQuestions();

    updateStats();

    updateUserInterface();


    console.log(
      "================================="
    );

    console.log(
      "UYGULAMA BAŞARIYLA YÜKLENDİ"
    );

    console.log(
      "================================="
    );


  } catch (error) {

    console.error(
      "UYGULAMA YÜKLEME EXCEPTION:",
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


  console.log(
    "Profil için User ID:",
    currentUser.id
  );


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
        "================================="
      );

      console.error(
        "PROFİL SUPABASE HATASI"
      );

      console.error(
        error
      );

      console.error(
        "================================="
      );


      return {

        success: false,

        message:
          `Supabase hatası: ${error.message}
          
Kod: ${error.code || "yok"}

Detay: ${
  error.details || "yok"
}

Hint: ${
  error.hint || "yok"
}`

      };

    }


    if (!data) {

      console.error(
        "profiles tablosunda bu ID bulunamadı:",
        currentUser.id
      );


      return {

        success: false,

        message:
          `profiles tablosunda bu kullanıcı için kayıt bulunamadı.

Giriş yapan User ID:
${currentUser.id}

Bu ID'nin profiles.id ile aynı olması gerekiyor.`

      };

    }


    currentProfile =
      data;


    return {

      success: true,

      data: data

    };

  } catch (error) {

    console.error(
      "Profil exception:",
      error
    );


    return {

      success: false,

      message:
        error.message

    };

  }

}


/* =====================================================
   SORULAR
===================================================== */

async function loadQuestions() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("questions")
        .select("*")
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
        "================================="
      );

      console.error(
        "SORULAR SUPABASE HATASI"
      );

      console.error(
        error
      );

      console.error(
        "================================="
      );


      return {

        success: false,

        message:
          `Supabase hatası: ${error.message}

Kod: ${error.code || "yok"}

Detay: ${
  error.details || "yok"
}

Hint: ${
  error.hint || "yok"
}`

      };

    }


    questions =
      data || [];


    console.log(
      "Yüklenen soru sayısı:",
      questions.length
    );


    if (questions.length > 0) {

      console.log(
        "İlk soru:",
        questions[0]
      );

    }


    return {

      success: true,

      data: questions

    };

  } catch (error) {

    console.error(
      "Sorular exception:",
      error
    );


    return {

      success: false,

      message:
        error.message

    };

  }

}


/* =====================================================
   CEVAPLAR
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
        "CEVAPLAR SUPABASE HATASI:",
        error
      );


      return {

        success: false,

        message:
          `Supabase hatası: ${error.message}`

      };

    }


    answers =
      data || [];


    return {

      success: true,

      data: answers

    };

  } catch (error) {

    console.error(
      "Cevap exception:",
      error
    );


    return {

      success: false,

      message:
        error.message

    };

  }

}


/* =====================================================
   KULLANICI ARAYÜZÜ
===================================================== */

function updateUserInterface() {

  if (!currentProfile)
    return;


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

  if (!questionList)
    return;


  let visibleQuestions =
    [...questions];


  if (
    currentFilter ===
    "answered"
  ) {

    visibleQuestions =
      visibleQuestions.filter(
        question =>
          getMyAnswer(
            question.id
          )
      );

  }


  if (
    currentFilter ===
    "unanswered"
  ) {

    visibleQuestions =
      visibleQuestions.filter(
        question =>
          !getMyAnswer(
            question.id
          )
      );

  }


  if (
    !visibleQuestions.length
  ) {

    questionList.innerHTML = `

      <div class="empty">

        <div style="
          font-size:40px;
          margin-bottom:10px;
        ">
          ♡
        </div>

        ${
          questions.length === 0
            ? `
              <strong>
                Henüz soru bulunamadı.
              </strong>

              <p style="
                margin-top:10px;
                font-size:12px;
              ">
                Supabase Console → Table Editor →
                questions tablosunda active alanlarını
                kontrol et.
              </p>
            `
            : `
              Bu filtrede gösterilecek soru yok.
            `
        }

      </div>

    `;

    return;

  }


  questionList.innerHTML =
    visibleQuestions
      .map(
        (question, index) =>
          createQuestionCard(
            question,
            index
          )
      )
      .join("");


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


  return `

    <article class="question-card">

      <div class="question-number">
        ${String(index + 1).padStart(2, "0")}
      </div>


      <h3 class="question-title">
        ${escapeHtml(
          question.question
        )}
      </h3>


      <textarea
        class="answer-area"
        id="answer-${question.id}"
        placeholder="Cevabını buraya yaz..."
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
                ♥ ${escapeHtml(partnerName)}'ın cevabı
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


  if (!textarea)
    return;


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


  if (!button)
    return;


  const originalText =
    button.textContent;


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


      button.disabled = false;

      button.textContent =
        originalText;

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
      "Cevap kaydetme exception:",
      error
    );


    showToast(
      "Cevap kaydedilemedi: " +
      error.message
    );


    button.disabled = false;

    button.textContent =
      originalText;

  }

}


/* =====================================================
   KENDİ CEVABIN
===================================================== */

function getMyAnswer(
  questionId
) {

  if (!currentUser)
    return null;


  return (
    answers.find(
      answer =>

        answer.user_id ===
          currentUser.id &&

        answer.question_id ===
          questionId &&

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

  if (!currentUser)
    return null;


  return (
    answers.find(
      answer =>

        answer.user_id !==
          currentUser.id &&

        answer.question_id ===
          questionId &&

        Number(answer.year) ===
          Number(CURRENT_YEAR)

    ) || null
  );

}


/* =====================================================
   İSTATİSTİKLER
===================================================== */

function updateStats() {

  const answered =
    questions.filter(
      question =>
        getMyAnswer(
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
   KALDIĞIM YERDEN DEVAM
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
   UYGULAMA HATA EKRANI
===================================================== */

function showApplicationError(
  title,
  message
) {

  /*
   Uygulamadan ATMIYORUZ.
   Kullanıcı login olarak kalıyor.
  */


  if (appShell) {

    appShell.classList.remove(
      "hidden"
    );

  }


  if (!questionList)
    return;


  questionList.innerHTML = `

    <div class="empty"
         style="
           border:1px solid #e9dfdb;
           border-radius:20px;
           background:white;
           padding:35px 25px;
         ">

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


      <p style="
        margin-top:20px;
        font-size:12px;
        color:#817774;
      ">
        F12 → Console bölümünde de
        ayrıntılı hata görebilirsin.
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

  if (!loginError)
    return;


  loginError.textContent =
    message;

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

  console.log(
    "Çıkış yapılıyor..."
  );


  try {

    const {
      error
    } =
      await supabaseClient.auth.signOut();


    if (error) {

      console.error(
        "Logout hatası:",
        error
      );

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

let toastTimer;


function showToast(
  message
) {

  if (!toast)
    return;


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

  return String(value ?? "")

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
   AUTH DEĞİŞİKLİKLERİ
===================================================== */

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

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


      if (
        !isLoadingApplication
      ) {

        showLoginScreen();

      }

    }


    /*
      SIGNED_IN burada özellikle
      loadApplication() çağırmıyor.

      Çünkü login() zaten bunu yapıyor.

      Böylece aynı uygulamanın iki kere
      yüklenmesini engelliyoruz.
    */

  }
);
