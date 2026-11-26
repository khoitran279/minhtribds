# Website bảng hàng Minh Trí Group

Trang tĩnh (HTML/CSS/JS, không cần build), chạy trên GitHub Pages.

| Trang | Nội dung |
|---|---|
| `index.html` | Bảng hàng: thẻ sản phẩm, lọc khu vực / loại hình / giá, bảng so sánh nhanh |
| `toa-nha.html?ma=<Mã SP>` | Chi tiết một tòa: thông số, dòng tiền tự vận hành / cho thuê khoán, nút tự tính dòng tiền |
| `tinh-dong-tien.html` | Công cụ tính dòng tiền tòa nhà (có thể mở kèm số liệu của một tòa) |

## Dữ liệu
- Nguồn: Google Sheet **Bảng hàng web - Minh Trí Group (công khai)**, tab `Web` (ID trong `assets/config.js`).
- Tab đó tự lấy từ **Giỏ hàng chung** những dòng tick cột **Đăng web**, và chỉ những cột được phép công khai (không có địa chỉ cụ thể, phí môi giới, sale đầu chủ, ghi chú, link hồ sơ).
- File phải chia sẻ "Bất kỳ ai có đường liên kết: Người xem". Trang đọc qua `https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=Web`.
- Ảnh: cột "Ảnh đại diện" là link file ảnh trên Drive; file ảnh phải để "ai có link đều xem được".
- Xem bố cục với dữ liệu minh họa: thêm `?demo` vào cuối địa chỉ (đọc `data/minh-hoa.csv`).

## Sửa thông tin liên hệ
`assets/config.js`. Thương hiệu, chuyên viên, điện thoại, Zalo dùng chung cho mọi trang.

## Quy tắc nội dung
- Không ghi số nhà; chỉ tên đường + quận.
- Không dùng từ so sánh tuyệt đối, không hứa lợi nhuận. Doanh thu/lợi suất là số hiện tại để tham khảo.
- Không đăng tòa chưa có hợp đồng môi giới hoặc ủy quyền của chủ nhà.

## Quy tắc giao diện
- Ô và cột chứa số căn phải; ô chữ căn trái; không căn giữa số. Ô có đơn vị thì số đứng sát trước đơn vị (hàm `fitUnits` trong `tinh-dong-tien.html`).
- Lưới ô nhập căn theo đáy (`align-items: end`) để nhãn dài không làm lệch ô bên cạnh.
- Kiểm tra ở khổ máy tính và 375px: không tràn ngang.
