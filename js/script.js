const CONFIG = {
    whatsappAdmin: "628133240038",
    supabaseUrl: "https://ggdxwhmbgooectnyaupd.supabase.co",
    supabaseKey: "sb_publishable_3LWFv7T7yapbgynPUZxmRMg_TxyHtSdg"
};

const supabaseClient = window.supabase.createClient(
    CONFIG.supabaseUrl,
    CONFIG.supabaseKey
);

const products = [100, 200, 500, 1000, 2000, 5000];

let rateUnder100 = 155;
let rate100Plus = 147;
let selectedProduct = null;
let customRobux = null;
let selectedPayment = "QRIS";

const productGrid = document.getElementById("productGrid");
const customRobuxInput = document.getElementById("customRobux");
const robloxUsernameInput = document.getElementById("robloxUsername");

const qrisBox = document.getElementById("qrisBox");
const danaBox = document.getElementById("danaBox");
const seaBankBox = document.getElementById("seaBankBox");
const goPayBox = document.getElementById("goPayBox");
const orderButton = document.getElementById("orderButton");

const paymentModal = document.getElementById("paymentModal");
const openPaymentButton = document.getElementById("openPayment");
const closePaymentButton = document.getElementById("closePayment");
const confirmPaymentButton = document.getElementById("confirmPayment");
const selectedPaymentLabel = document.getElementById("selectedPaymentLabel");

// ======================================
// FORMAT HARGA
// ======================================

function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}

function getRate(amount) {
    return amount < 100 ? rateUnder100 : rate100Plus;
}

function getSelectedAmount() {
    return customRobux !== null ? customRobux : selectedProduct;
}

// ======================================
// AMBIL RATE DARI SUPABASE
// ======================================

async function loadRates() {
    try {
        const { data, error } = await supabaseClient
            .from("store_settings")
            .select("rate_under_100, rate_100_plus")
            .eq("id", 1)
            .single();

        if (error) throw error;

        rateUnder100 = Number(data.rate_under_100);
        rate100Plus = Number(data.rate_100_plus);

        console.log("Rate di bawah 100:", rateUnder100);
        console.log("Rate 100 ke atas:", rate100Plus);

    } catch (error) {
        console.error("Gagal mengambil rate:", error);
    }

    renderProducts();
    updateSummary();
}

// ======================================
// TAMPILKAN PRODUK
// ======================================

function renderProducts() {
    productGrid.innerHTML = "";

    products.forEach(amount => {
        const price = amount * getRate(amount);
        const button = document.createElement("button");

        button.className = "product-option";
        button.type = "button";

        button.innerHTML = `
            <strong>${amount.toLocaleString("id-ID")} Robux</strong>
            <span>${formatRupiah(price)}</span>
        `;

        if (selectedProduct === amount && customRobux === null) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            selectProduct(amount);
        });

        productGrid.appendChild(button);
    });
}

// ======================================
// PILIH PRODUK
// ======================================

function selectProduct(amount) {
    selectedProduct = amount;
    customRobux = null;

    customRobuxInput.value = "";

    renderProducts();
    updateSummary();
}

// ======================================
// CUSTOM ROBUX
// ======================================

customRobuxInput.addEventListener("input", () => {
    const value = Number(customRobuxInput.value);

    selectedProduct = null;

    if (
        customRobuxInput.value.trim() !== "" &&
        Number.isInteger(value) &&
        value > 0
    ) {
        customRobux = value;
    } else {
        customRobux = null;
    }

    renderProducts();
    updateSummary();
});

// ======================================
// USERNAME ROBLOX
// ======================================

robloxUsernameInput.addEventListener("input", () => {
    updateSummary();
});

// ======================================
// POP-UP PEMBAYARAN
// ======================================

function openPaymentModal() {
    paymentModal.classList.add("show");
    document.body.classList.add("payment-open");
}

function closePaymentModal() {
    paymentModal.classList.remove("show");
    document.body.classList.remove("payment-open");
}

openPaymentButton.addEventListener("click", openPaymentModal);

closePaymentButton.addEventListener("click", closePaymentModal);

// Tutup jika klik area luar pop-up
paymentModal.addEventListener("click", (event) => {
    if (event.target === paymentModal) {
        closePaymentModal();
    }
});

// Tutup menggunakan tombol Escape
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && paymentModal.classList.contains("show")) {
        closePaymentModal();
    }
});

// ======================================
// PILIH METODE PEMBAYARAN
// ======================================

const paymentButtons = document.querySelectorAll(".payment-option");

function updatePaymentDisplay() {
    qrisBox.classList.toggle("show", selectedPayment === "QRIS");
    danaBox.classList.toggle("show", selectedPayment === "DANA");
    seaBankBox.classList.toggle("show", selectedPayment === "SeaBank");
    goPayBox.classList.toggle("show", selectedPayment === "GoPay");
}

function updatePaymentLabel() {
    selectedPaymentLabel.textContent = selectedPayment;
}

paymentButtons.forEach(button => {
    button.addEventListener("click", () => {
        paymentButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        selectedPayment = button.dataset.payment;

        updatePaymentDisplay();
        updatePaymentLabel();
        updateSummary();
    });
});

// Tombol gunakan pembayaran ini
confirmPaymentButton.addEventListener("click", () => {
    closePaymentModal();
    updateSummary();
});

// ======================================
// TOMBOL SALIN NOMOR
// ======================================

document.querySelectorAll(".copy-button").forEach(button => {
    button.addEventListener("click", async () => {
        const number = button.dataset.copy;
        const originalText = button.textContent;

        try {
            await navigator.clipboard.writeText(number);

            button.textContent = "TERSALIN!";

            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);

        } catch (error) {
            alert("Gagal menyalin nomor. Silakan salin manual.");
        }
    });
});

// ======================================
// RINGKASAN PESANAN
// ======================================

function updateSummary() {
    const summaryProduct = document.getElementById("summaryProduct");
    const summaryPayment = document.getElementById("summaryPayment");
    const summaryUsername = document.getElementById("summaryUsername");
    const totalPrice = document.getElementById("totalPrice");

    const amount = getSelectedAmount();
    const username = robloxUsernameInput.value.trim();

    summaryUsername.textContent = username || "Belum diisi";

    summaryProduct.textContent = amount
        ? amount.toLocaleString("id-ID") + " Robux"
        : "-";

    summaryPayment.textContent = selectedPayment;

    if (amount && amount > 0) {
        totalPrice.textContent = formatRupiah(
            amount * getRate(amount)
        );
    } else {
        totalPrice.textContent = "Rp0";
    }
}

// ======================================
// CHECKOUT + SIMPAN KE SUPABASE
// ======================================

orderButton.addEventListener("click", async () => {
    const amount = getSelectedAmount();
    const username = robloxUsernameInput.value.trim();

    // Validasi username
    if (!username) {
        alert("Silakan masukkan Username Roblox terlebih dahulu!");
        robloxUsernameInput.focus();
        return;
    }

    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
        alert("Username Roblox harus 3-20 karakter dan hanya boleh berisi huruf, angka, atau underscore (_).");
        robloxUsernameInput.focus();
        return;
    }

    // Validasi jumlah Robux
    if (!amount || !Number.isInteger(amount) || amount < 1) {
        alert("Silakan pilih atau masukkan jumlah Robux!");
        return;
    }

    const adminNumber = CONFIG.whatsappAdmin.replace(/\D/g, "");

    if (
        adminNumber.length < 8 ||
        adminNumber.length > 15 ||
        adminNumber === "628xxxxxxxxxx"
    ) {
        alert("Nomor WhatsApp admin belum diatur di script.js!");
        return;
    }

    const rate = getRate(amount);
    const total = amount * rate;

    const message = `
Halo QYUYA STORE!

Saya ingin memesan Robux.

Username Roblox: ${username}
Jumlah: ${amount.toLocaleString("id-ID")} Robux
Rate: Rp${rate}
Pembayaran: ${selectedPayment}
Total: ${formatRupiah(total)}

Mohon diproses. Terima kasih!
    `.trim();

    const whatsappUrl =
        "https://wa.me/" +
        adminNumber +
        "?text=" +
        encodeURIComponent(message);

    // Buka tab terlebih dahulu agar tidak diblokir browser
    const whatsappWindow = window.open("about:blank", "_blank");

    orderButton.disabled = true;
    orderButton.textContent = "MENYIMPAN PESANAN...";

    try {
        // Simpan pesanan ke Supabase
        const { error } = await supabaseClient
            .from("orders")
            .insert({
                roblox_username: username,
                robux_amount: amount,
                rate: rate,
                total_price: total,
                payment_method: selectedPayment,
                status: "Pending"
            });

        if (error) throw error;

        console.log("Pesanan berhasil disimpan!");

        // Buka WhatsApp setelah penyimpanan berhasil
        if (whatsappWindow) {
            whatsappWindow.location.href = whatsappUrl;
        } else {
            window.location.href = whatsappUrl;
        }

    } catch (error) {
        console.error("Gagal menyimpan pesanan:", error);

        if (whatsappWindow) {
            whatsappWindow.close();
        }

        alert(
            "Pesanan gagal disimpan!\n\n" +
            "Silakan coba lagi.\n" +
            "Error: " + error.message
        );

    } finally {
        orderButton.disabled = false;
        orderButton.innerHTML = 'PESAN SEKARANG <span>→</span>';
    }
});

// ======================================
// FOOTER DAN MULAI
// ======================================

document.getElementById("year").textContent =
    new Date().getFullYear();

updatePaymentDisplay();
updatePaymentLabel();

renderProducts();
updateSummary();
loadRates();
