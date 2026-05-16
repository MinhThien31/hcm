from pathlib import Path
import re
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = Path(r"C:\Users\LENOVO\Downloads\giao-trinh-tt-hcm-2021.txt")
INPUT = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
OUT_DIR = PROJECT_ROOT / "knowledge-full"


CHAPTER_TITLES = {
    "1": "Khái niệm, đối tượng, phương pháp nghiên cứu và ý nghĩa học tập môn Tư tưởng Hồ Chí Minh",
    "2": "Cơ sở, quá trình hình thành và phát triển tư tưởng Hồ Chí Minh",
    "3": "Tư tưởng Hồ Chí Minh về độc lập dân tộc và chủ nghĩa xã hội",
    "4": "Tư tưởng Hồ Chí Minh về Đảng Cộng sản Việt Nam và Nhà nước của nhân dân, do nhân dân, vì nhân dân",
    "5": "Tư tưởng Hồ Chí Minh về đại đoàn kết toàn dân tộc và đoàn kết quốc tế",
    "6": "Tư tưởng Hồ Chí Minh về văn hóa, đạo đức, con người",
}


REPLACEMENTS = [
    ("\ufeff", ""),
    ("\x0c", "\n"),
    ("CHỦ NGHĨAXÃ", "CHỦ NGHĨA XÃ"),
    ("ĐỘC LAP", "ĐỘC LẬP"),
    ("độc lap", "độc lập"),
    ("Độc lap", "Độc lập"),
    ("lap dân", "lập dân"),
    ("TU TƯỞNG", "TƯ TƯỞNG"),
    ("1- TƯ TƯỞNG", "I- TƯ TƯỞNG"),
    ("1- TU TƯỞNG", "I- TƯ TƯỞNG"),
    ("1I- TƯ TƯỞNG", "II- TƯ TƯỞNG"),
    ("IH- TƯ TƯỞNG", "III- TƯ TƯỞNG"),
    ("VAN DỤNG", "VẬN DỤNG"),
    ("GẮN LIÊN", "GẮN LIỀN"),
    ("DAN TỘC", "DÂN TỘC"),
    ("dan tộc", "dân tộc"),
    ("Dan tộc", "Dân tộc"),
    ("đân tộc", "dân tộc"),
    ("Đân tộc", "Dân tộc"),
    ("dần tộc", "dân tộc"),
    ("độc lập dan", "độc lập dân"),
    ("độc lập đân", "độc lập dân"),
    ("Độc lập dan", "Độc lập dân"),
    ("Độc lập đân", "Độc lập dân"),
    ("nhân dan", "nhân dân"),
    ("Nhân dan", "Nhân dân"),
    ("dan chủ", "dân chủ"),
    ("Dan chủ", "Dân chủ"),
    ("đân chủ", "dân chủ"),
    ("Đân chủ", "Dân chủ"),
    ("thực dan", "thực dân"),
    ("Thực dan", "Thực dân"),
    ("công nhan", "công nhân"),
    ("quan chúng", "quần chúng"),
    ("quân chúng", "quần chúng"),
    ("Hé Chí Minh", "Hồ Chí Minh"),
    ("Hé Chi Minh", "Hồ Chí Minh"),
    ("Hê Chí Minh", "Hồ Chí Minh"),
    ("Hỗ Chí Minh", "Hồ Chí Minh"),
    ("Hô Chi Minh", "Hồ Chí Minh"),
    ("Hồ Chi Minh", "Hồ Chí Minh"),
    ("Hồ Chỉ Minh", "Hồ Chí Minh"),
    ("Hd Chí Minh", "Hồ Chí Minh"),
    ("H6 Chí Minh", "Hồ Chí Minh"),
    ("Hệ Chí Minh", "Hồ Chí Minh"),
    ("Hồ   Chi Minh", "Hồ Chí Minh"),
    ("Đẳng", "Đảng"),
    ("Dang", "Đảng"),
    ("Pang", "Đảng"),
    ("Đong bào", "Đồng bào"),
    ("Đông bào", "Đồng bào"),
    ("lién", "liền"),
    ("liển", "liền"),
    ("lãnh thé", "lãnh thổ"),
    ("toàn ven", "toàn vẹn"),
    ("Có thé", "Có thể"),
    ("có thé", "có thể"),
    ("không thé", "không thể"),
    ("thé là", "thể là"),
    ("Tu do", "Tự do"),
    ("tu do", "tự do"),
    ("tự đo", "tự do"),
    ("tự dơ", "tự do"),
    ("quyển", "quyền"),
    ("thay đối", "thay đổi"),
    ("sáng tao", "sáng tạo"),
    ("sang tạo", "sáng tạo"),
    ("sang tô", "sáng tỏ"),
    ("biện nay", "hiện nay"),
    ("chủ nghia", "chủ nghĩa"),
    ("Chủ nghia", "Chủ nghĩa"),
    ("cộng san", "cộng sản"),
    ("Cộng san", "Cộng sản"),
    ("cộng sẵn", "cộng sản"),
    ("tu ban", "tư bản"),
    ("Tu ban", "Tư bản"),
    ("phat triển", "phát triển"),
    ("tién dé", "tiền đề"),
    ("tiền dé", "tiền đề"),
    ("tiến tối", "tiến tới"),
    ("tién bối", "tiền bối"),
    ("lúc bấy gid", "lúc bấy giờ"),
    ("Lénin", "Lênin"),
    ("Mác - Lénin", "Mác - Lênin"),
    ("nền tang", "nền tảng"),
    ("bão đảm", "bảo đảm"),
    ("bảo dam", "bảo đảm"),
    ("dam cho", "đảm cho"),
    ("điểu", "điều"),
    ("co ban", "cơ bản"),
    ("cơ ban", "cơ bản"),
    ("MỤC TIEU", "MỤC TIÊU"),
    ("dao đức", "đạo đức"),
    ("dục dao đức", "dục đạo đức"),
    ("mục dich", "mục đích"),
    ("xây dung", "xây dựng"),
    ("Xây dung", "Xây dựng"),
    ("suy thoái về tư tưởng chính tri", "suy thoái về tư tưởng chính trị"),
    ("cách mang", "cách mạng"),
    ("Cách mang", "Cách mạng"),
    ("giái phóng", "giải phóng"),
    ("nén độc lập", "nền độc lập"),
    ("hoa bình", "hòa bình"),
    ("xã bội", "xã hội"),
    ("áp bite", "áp bức"),
    ("mỗi người đểu", "mỗi người đều"),
    ("lại ich", "lợi ích"),
    ("Đé là", "Đó là"),
    ("Tu tưởng", "Tư tưởng"),
    ("đúng đấn", "đúng đắn"),
    ("to lồn", "to lớn"),
    ("cồn ", "còn "),
    ("không cồn", "không còn"),
    ("bưởng", "hưởng"),
    ("nén tảng", "nền tảng"),
    ("dé cao", "đề cao"),
    ("vấn dé", "vấn đề"),
    ("Đánh dé", "Đánh đổ"),
    ("bon phong", "bọn phong"),
    ("giúp dé", "giúp đỡ"),
    ("trong dé", "trong đó"),
    ("dung di", "dung dị"),
    ("dé nhớ", "dễ nhớ"),
    ("Trinh độ", "Trình độ"),
    ("déng bào", "đồng bào"),
    ("Bao lực", "Bạo lực"),
    ("bà dé", "bà đỡ"),
    ("bao lực", "bạo lực"),
    ("trường tổn", "trường tồn"),
    ("đẩy đủ", "đầy đủ"),
    ("toan tập", "Toàn tập"),
    ("Toan tập", "Toàn tập"),
    ("Sdd", "Sđd"),
    ("Sd, ", "Sđd, "),
    ("Sdở", "Sđd"),
    ("Sảd", "Sđd"),
    ("Sđủ", "Sđd"),
    ("t.12, tr.A11", "t.12, tr.411"),
    ("lần thứ XH", "lần thứ XII"),
    ("|Ị qua", "qua"),
    ("tâm nhìn", "tầm nhìn"),
    ("Tiên Xô", "Liên Xô"),
]


def normalize_ocr_text(text: str) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)

    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"[|Ịị;]+\s*\n", "\n", text)
    text = re.sub(r"\n\s*\|?Ị\s*", "\n", text)
    text = re.sub(r"\n\s*“Trai\s*\n", "\n", text)
    text = re.sub(r"\n\s*¬[^\n]*\n", "\n", text)
    text = re.sub(r"\n\s*9\.\s+Chủ nghĩa xã hội là điều kiện", "\n2. Chủ nghĩa xã hội là điều kiện", text)
    text = re.sub(r"\n\s*8\.\s+Làm cho dân có chỗ ở", "\n3. Làm cho dân có chỗ ở", text)
    text = re.sub(r"\n\s*8\.\s+Nêu bối cảnh xã hội Việt Nam", "\n3. Nêu bối cảnh xã hội Việt Nam", text)
    text = re.sub(r"\n\s*8\.\s+Về tư tưởng", "\n3. Về tư tưởng", text)
    text = re.sub(r"\n\s*[0-9]+\s*\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def to_markdown(text: str, chapter_number: str, title: str) -> str:
    citation_names = (
        "Hồ Chí Minh:",
        "Xem Hồ Chí Minh",
        "C. Mác",
        "V.I. Lênin",
        "Đảng Cộng sản",
        "Trần Dân Tiên",
        "Ơ. Mác",
    )

    lines: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            if lines and lines[-1] != "":
                lines.append("")
            continue

        if re.fullmatch(r"[0-9]+", line) or re.fullmatch(r"[-_=.`:,\s]+", line):
            continue

        if re.match(r"^[0-9]+[,\.]\s+", line) and (
            any(name in line for name in citation_names)
            or "Toàn tập" in line
            or "Sđd" in line
        ):
            continue

        line = re.sub(r"^Chương\s+[0-9]+$", f"# Chương {chapter_number}", line)
        if line == f"# Chương {chapter_number}":
            lines.append(line)
            lines.append("")
            lines.append(f"# {title}")
            continue

        line = re.sub(r"^([IVX]+)[-–]\s*(.+)$", r"## \1. \2", line)
        line = re.sub(r"^([0-9]+)\.\s+(.+)$", r"### \1. \2", line)
        line = re.sub(r"^([a-d@])\)\s+(.+)$", r"#### \1) \2", line)
        lines.append(line)

    body = re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip() + "\n"
    return body


def find_chapter_bounds(text: str) -> list[tuple[str, int, int]]:
    starts: list[tuple[str, int]] = []
    cursor = 0
    for chapter in range(1, 7):
        match = re.search(rf"Chương\s+{chapter}", text[cursor:], flags=re.IGNORECASE)
        if not match:
            raise RuntimeError(f"Could not find Chương {chapter}")
        start = cursor + match.start()
        starts.append((str(chapter), start))
        cursor = start + 1

    tail_match = re.search(r"Chương\s+1", text[starts[-1][1] + 1 :], flags=re.IGNORECASE)
    end_of_chapter_6 = (
        starts[-1][1] + 1 + tail_match.start()
        if tail_match
        else len(text)
    )

    bounds: list[tuple[str, int, int]] = []
    for index, (chapter, start) in enumerate(starts):
        end = starts[index + 1][1] if index + 1 < len(starts) else end_of_chapter_6
        bounds.append((chapter, start, end))
    return bounds


def frontmatter(chapter: str, title: str) -> str:
    return f"""---
subject: hcm
chapter: "{chapter}"
source_type: textbook_ocr
source: "giao-trinh-tt-hcm-2021-ocr.pdf"
priority: {"primary" if chapter == "3" else "secondary"}
status: cleaned_ocr
title: "{title}"
---

"""


def main() -> None:
    text = INPUT.read_text(encoding="utf-8", errors="replace")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for chapter, start, end in find_chapter_bounds(text):
        title = CHAPTER_TITLES[chapter]
        chapter_text = normalize_ocr_text(text[start:end])
        body = to_markdown(chapter_text, chapter, title)
        path = OUT_DIR / f"hcm-chapter-{int(chapter):02d}.md"
        path.write_text(frontmatter(chapter, title) + body, encoding="utf-8")
        print(f"Wrote {path.name}: {path.stat().st_size} bytes")

    print(f"Full textbook markdown chapters are in: {OUT_DIR}")


if __name__ == "__main__":
    main()
