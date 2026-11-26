/* Dữ liệu bảng hàng + hàm dùng chung cho mọi trang */
(function () {
  const C = window.CAU_HINH;

  // ---- Đọc CSV (có ngoặc kép, xuống dòng trong ô) ----
  function parseCSV(text) {
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (ch !== "\r") cell += ch;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  // ---- Số: chấp nhận "28.00", "28,5", "7.7%", "1,234.5" ----
  function so(v) {
    if (v === undefined || v === null) return NaN;
    let s = String(v).trim().replace(/[^\d.,\-]/g, "");
    if (!s) return NaN;
    if (s.includes(",") && s.includes(".")) s = s.replace(/,/g, "");
    else if (s.includes(",")) s = s.replace(",", ".");
    return parseFloat(s);
  }
  function phanTram(v) {
    const n = so(v); if (!isFinite(n)) return NaN;
    return String(v).includes("%") ? n / 100 : (n > 1 ? n / 100 : n);
  }

  // Tên cột trong tab Web (giống tiêu đề Giỏ hàng chung)
  const COT = {
    ma: "Mã SP", loai: "Loại hình", hinhThuc: "Hình thức", duong: "Tên đường (công khai trên web)",
    phuong: "Phường (mới)", khuVuc: "Khu vực (quận cũ)", dtDat: "Diện tích đất (m²)", matTien: "Mặt tiền (m)",
    tang: "Số tầng", phong: "Số phòng / căn", ngo: "Đường / ngõ", phapLy: "Pháp lý", gia: "Giá bán (tỷ)",
    giaThue: "Giá cho thuê (tr/tháng)", donGia: "Đơn giá bán (tr/m²)", doanhThu: "Doanh thu thuê hiện tại (tr/tháng)", loiSuat: "Lợi suất gộp/năm",
    trangThai: "Trạng thái", capNhat: "Ngày cập nhật", dtSuDung: "DT sử dụng (m²)", dtXayDung: "DT xây dựng (m²)",
    hienTrang: "Hiện trạng", khoan: "Cho thuê khoán (tr/tháng)", moTa: "Mô tả ngắn (web)", anh: "Ảnh đại diện (link Drive, để công khai)"
  };

  function chuanHoa(rows) {
    if (!rows.length) return [];
    const head = rows[0].map(h => h.trim());
    const idx = {}; for (const k in COT) idx[k] = head.indexOf(COT[k]);
    return rows.slice(1).filter(r => r.some(x => String(x).trim())).map(r => {
      const g = k => idx[k] >= 0 ? String(r[idx[k]] ?? "").trim() : "";
      const sp = {};
      for (const k in COT) sp[k] = g(k);
      sp.giaSo = so(sp.gia);
      sp.doanhThuSo = so(sp.doanhThu);
      sp.khoanSo = so(sp.khoan);
      sp.phongSo = so(sp.phong);
      sp.dtDatSo = so(sp.dtDat);
      sp.donGiaSo = so(sp.donGia);
      if (!isFinite(sp.donGiaSo) && sp.giaSo > 0 && sp.dtDatSo > 0) sp.donGiaSo = sp.giaSo * 1000 / sp.dtDatSo;
      sp.loiSuatSo = phanTram(sp.loiSuat);
      if (!isFinite(sp.loiSuatSo) && sp.giaSo > 0 && sp.doanhThuSo > 0) sp.loiSuatSo = sp.doanhThuSo * 12 / (sp.giaSo * 1000);
      sp.loiSuatKhoan = sp.giaSo > 0 && sp.khoanSo > 0 ? sp.khoanSo * 12 / (sp.giaSo * 1000) : NaN;
      sp.anhUrl = anhDrive(sp.anh);
      return sp;
    }).filter(sp => sp.ma);
  }

  // Link Drive -> ảnh xem được (file phải để "ai có link đều xem được")
  function anhDrive(link) {
    if (!link) return "";
    const m = link.match(/\/d\/([\w-]{20,})/) || link.match(/[?&]id=([\w-]{20,})/);
    if (m) return "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w1600";
    return /^https?:\/\//.test(link) ? link : "";
  }

  async function taiBangHang() {
    const demo = new URLSearchParams(location.search).has("demo");
    if (demo) {
      const r = await fetch("data/minh-hoa.csv", { cache: "no-store" });
      return { ds: chuanHoa(parseCSV(await r.text())), demo: true };
    }
    const url = "https://docs.google.com/spreadsheets/d/" + C.sheetId + "/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent(C.sheetTab) + "&t=" + Date.now();
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const text = await r.text();
    if (/^\s*</.test(text)) throw new Error("Sheet chưa chia sẻ công khai");
    return { ds: chuanHoa(parseCSV(text)), demo: false };
  }

  // ---- Định dạng ----
  const fmt = (v, d = 0) => isFinite(v) ? v.toLocaleString("vi-VN", { minimumFractionDigits: d, maximumFractionDigits: d }) : "–";
  const pct = (v, d = 2) => isFinite(v) ? fmt(v * 100, d) + "%" : "–";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const viTri = sp => [sp.duong, sp.khuVuc].filter(Boolean).join(", ");
  const dangBan = sp => !/đã bán|đã cho thuê|tạm dừng/i.test(sp.trangThai);
  const nhanTrangThai = sp => dangBan(sp) ? "Đang chào" : (sp.trangThai || "");

  // Liên kết sang trang tính dòng tiền, điền sẵn số liệu của tòa
  function linkTinh(sp) {
    const p = new URLSearchParams();
    p.set("ten", [sp.loai, sp.phong && sp.phong + " phòng", viTri(sp)].filter(Boolean).join(" · "));
    if (isFinite(sp.giaSo)) p.set("gia", sp.giaSo);
    if (isFinite(sp.phongSo) && sp.phongSo > 0) p.set("phong", sp.phongSo);
    if (isFinite(sp.doanhThuSo) && isFinite(sp.phongSo) && sp.phongSo > 0) p.set("thue", +(sp.doanhThuSo / sp.phongSo).toFixed(2));
    p.set("ma", sp.ma);
    return "tinh-dong-tien.html?" + p.toString();
  }

  function giaoDienChung() {
    document.querySelectorAll("[data-brand]").forEach(el => el.textContent = C.thuongHieu);
    document.querySelectorAll("[data-slogan]").forEach(el => el.textContent = C.khauHieu);
    document.querySelectorAll("[data-lien-he]").forEach(el => el.textContent = C.chuyenVien + " · " + C.dienThoai.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3"));
    document.querySelectorAll("[data-tel]").forEach(el => el.href = "tel:" + C.dienThoai);
    document.querySelectorAll("[data-zalo]").forEach(el => { el.href = "https://zalo.me/" + C.zalo; el.target = "_blank"; el.rel = "noopener"; });
    const nam = document.querySelector("[data-nam]"); if (nam) nam.textContent = new Date().getFullYear();
  }

  window.BDS = { taiBangHang, fmt, pct, esc, viTri, dangBan, nhanTrangThai, linkTinh, giaoDienChung, so };
  document.addEventListener("DOMContentLoaded", giaoDienChung);
})();
