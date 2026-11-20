
const SUPABASE_URL = "https://ggdxwhmbgooectnyaupd.supabase.co";
const SUPABASE_KEY = "sb_publishable_3LWFvT7yapbgynPUZxmRMg_TxyHtSdg";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const rateForm = document.getElementById("rateForm");

const loginMessage = document.getElementById("loginMessage");
const rateMessage = document.getElementById("rateMessage");

const currentRateUnder = document.getElementById("currentRateUnder");
const currentRatePlus = document.getElementById("currentRatePlus");

const newRateUnder = document.getElementById("newRateUnder");
const newRatePlus = document.getElementById("newRatePlus");

document.getElementById("year").textContent =
    new Date().getFullYear();

function formatRate(value) {
    return "Rp" + Number(value).toLocaleString("id-ID");
}

function showLogin() {
    loginSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
}

function showDashboard() {
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
}

// ======================================
// CEK LOGIN
// ======================================

async function checkLogin() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        showLogin();
        return;
    }

    showDashboard();
    await loadCurrentRates();
}

// ======================================
// LOGIN
// ======================================

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const loginButton = document.getElementById("loginButton");

    loginButton.disabled = true;
    loginButton.textContent = "MEMPROSES...";
    loginMessage.textContent = "";

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        if (!data.user) {
            throw new Error("Akun tidak ditemukan.");
        }

        showDashboard();
        await loadCurrentRates();

    } catch (error) {
        loginMessage.textContent = "Login gagal: " + error.message;
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "LOGIN";
    }
});

// ======================================
// AMBIL DUA RATE
// ======================================

async function loadCurrentRates() {
    rateMessage.textContent = "";

    const { data, error } = await supabaseClient
        .from("store_settings")
        .select("rate_under_100, rate_100_plus")
        .eq("id", 1)
        .single();

    if (error) {
        rateMessage.textContent = "Gagal mengambil rate: " + error.message;
        return;
    }

    currentRateUnder.textContent = formatRate(data.rate_under_100);
    currentRatePlus.textContent = formatRate(data.rate_100_plus);

    newRateUnder.value = data.rate_under_100;
    newRatePlus.value = data.rate_100_plus;
}

// ======================================
// SIMPAN DUA RATE
// ======================================

rateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const underRate = Number(newRateUnder.value);
    const plusRate = Number(newRatePlus.value);

    if (
        !Number.isInteger(underRate) || underRate < 1 ||
        !Number.isInteger(plusRate) || plusRate < 1
    ) {
        rateMessage.textContent = "Kedua rate harus berupa angka bulat lebih dari 0.";
        return;
    }

    const saveButton = document.getElementById("saveButton");

    saveButton.disabled = true;
    saveButton.textContent = "MENYIMPAN...";
    rateMessage.textContent = "";

    try {
        const { error } = await supabaseClient
            .from("store_settings")
            .update({
                rate_under_100: underRate,
                rate_100_plus: plusRate,
                updated_at: new Date().toISOString()
            })
            .eq("id", 1);

        if (error) throw error;

        await loadCurrentRates();
        rateMessage.textContent = "Kedua rate berhasil diperbarui!";

    } catch (error) {
        rateMessage.textContent = "Gagal menyimpan rate: " + error.message;
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "SIMPAN RATE";
    }
});

// ======================================
// LOGOUT
// ======================================

document.getElementById("logoutButton").addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        rateMessage.textContent = "Gagal logout: " + error.message;
        return;
    }

    showLogin();
    loginForm.reset();
});

// ======================================
// MULAI
// ======================================

checkLogin();
