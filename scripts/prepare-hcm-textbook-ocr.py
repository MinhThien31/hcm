from pathlib import Path
import re
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = Path(r"C:\Users\LENOVO\Downloads\giao-trinh-tt-hcm-2021.txt")
INPUT = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
OUT_DIR = PROJECT_ROOT / "knowledge" / "textbook-chapter-03"
KNOWLEDGE_DIR = PROJECT_ROOT / "knowledge"


def normalize_ocr_text(text: str) -> str:
    pairs = [
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
        ("dan chủ", "dân chủ"),
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
        ("\n9. Chủ nghĩa xã hội là điều kiện", "\n2. Chủ nghĩa xã hội là điều kiện"),
        ("\n8. Làm cho dân có chỗ ở", "\n3. Làm cho dân có chỗ ở"),
        ("\n8. Nêu bối cảnh xã hội Việt Nam", "\n3. Nêu bối cảnh xã hội Việt Nam"),
        ("\n“Trai\n", "\n"),
        ("\n¬_.\n", "\n"),
        ("\n¬.—..\n", "\n"),
        ("|Ị qua", "qua"),
        ("tâm nhìn", "tầm nhìn"),
        ("Tiên Xô", "Liên Xô"),
    ]

    for old, new in pairs:
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
    text = re.sub(r"\n\s*[0-9]+\s*\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def to_markdown(text: str) -> str:
    heading_patterns = [
        (r"^Chương 3$", "# Chương 3"),
        (
            r"^TƯ TƯỞNG HỒ CHÍ MINH VỀ ĐỘC LẬP$",
            "# Tư tưởng Hồ Chí Minh về độc lập dân tộc và chủ nghĩa xã hội",
        ),
        (r"^DÂN TỘC VÀ CHỦ NGHĨA XÃ HỘI$", ""),
        (r"^I[-–]\s*(.+)$", r"## I. \1"),
        (r"^II[-–]\s*(.+)$", r"## II. \1"),
        (r"^III[-–]\s*(.+)$", r"## III. \1"),
        (r"^IV[-–]\s*(.+)$", r"## IV. \1"),
        (r"^([1-4])\.\s+(.+)$", r"### \1. \2"),
        (r"^([a-d@])\)\s+(.+)$", r"#### \1) \2"),
    ]

    citation_names = (
        "Hồ Chí Minh:",
        "Xem Hồ Chí Minh",
        "C. Mác",
        "V.I. Lênin",
        "Đảng Cộng sản",
        "Trần Dân Tiên",
        "Ơ. Mác",
    )

    md_lines: list[str] = []
    for line in text.splitlines():
        s = line.strip()
        if not s:
            if md_lines and md_lines[-1] != "":
                md_lines.append("")
            continue

        if re.fullmatch(r"[0-9]+", s) or re.fullmatch(r"[-_=.`:,\s]+", s):
            continue

        if re.match(r"^[0-9]+[,\.]\s+", s) and (
            any(name in s for name in citation_names)
            or "Toàn tập" in s
            or "Sđd" in s
        ):
            continue

        for pattern, repl in heading_patterns:
            new_s = re.sub(pattern, repl, s)
            if new_s != s:
                s = new_s
                break

        if s:
            md_lines.append(s)

    body = re.sub(r"\n{3,}", "\n\n", "\n".join(md_lines)).strip() + "\n"
    if "### 1. Phân tích tính đúng đắn" in body:
        body = body.replace(
            "### 1. Phân tích tính đúng đắn",
            "## Câu hỏi ôn tập\n\n1. Phân tích tính đúng đắn",
        )
        body = body.replace(
            "### 2. Phân tích tư tưởng Hồ Chí Minh về thời kỳ quá độ",
            "2. Phân tích tư tưởng Hồ Chí Minh về thời kỳ quá độ",
        )
        body = body.replace(
            "### 8. Nêu bối cảnh xã hội Việt Nam hiện nay",
            "3. Nêu bối cảnh xã hội Việt Nam hiện nay",
        )
    return body


def slice_section(body: str, start_marker: str | None, end_marker: str | None) -> str:
    if start_marker is None:
        return body

    start = body.find(start_marker)
    if start < 0:
        headings = [line for line in body.splitlines() if line.startswith("## ")][:20]
        raise RuntimeError(f"Missing marker {start_marker}. Found headings: {headings}")

    end = len(body) if end_marker is None else body.find(end_marker, start + len(start_marker))
    if end < 0:
        end = len(body)
    return body[start:end].strip() + "\n"


def frontmatter(section: str, title: str) -> str:
    return f"""---
subject: hcm
chapter: "3"
section: "{section}"
source_type: textbook_ocr
source: "giao-trinh-tt-hcm-2021-ocr.pdf"
priority: primary
status: cleaned_ocr
title: "{title}"
---

"""


def main() -> None:
    text = INPUT.read_text(encoding="utf-8", errors="replace")
    start = text.find("Chương 3")
    end = text.find("Chương 4", start)
    if start < 0 or end < 0:
        raise RuntimeError("Could not find Chapter 3/Chapter 4 boundaries in OCR text.")

    chapter = normalize_ocr_text(text[start:end])
    body = to_markdown(chapter)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)

    sections = [
        ("hcm-chapter-03-full.md", None, None, "3", "Chương 3 - toàn chương"),
        (
            "hcm-chapter-03-1-doc-lap-dan-toc.md",
            "## I.",
            "## II.",
            "3.1",
            "Tư tưởng Hồ Chí Minh về độc lập dân tộc",
        ),
        (
            "hcm-chapter-03-2-chu-nghia-xa-hoi.md",
            "## II.",
            "## III.",
            "3.2",
            "Tư tưởng Hồ Chí Minh về chủ nghĩa xã hội và xây dựng chủ nghĩa xã hội ở Việt Nam",
        ),
        (
            "hcm-chapter-03-3-moi-quan-he.md",
            "## III.",
            "## IV.",
            "3.3",
            "Tư tưởng Hồ Chí Minh về mối quan hệ giữa độc lập dân tộc và chủ nghĩa xã hội",
        ),
        (
            "hcm-chapter-03-4-van-dung-hien-nay.md",
            "## IV.",
            "## Câu hỏi ôn tập",
            "3.4",
            "Vận dụng tư tưởng Hồ Chí Minh về độc lập dân tộc gắn liền với chủ nghĩa xã hội",
        ),
    ]

    for filename, start_marker, end_marker, section, title in sections:
        content = slice_section(body, start_marker, end_marker)
        path = OUT_DIR / filename
        path.write_text(frontmatter(section, title) + content, encoding="utf-8")

    for filename, *_ in sections[1:]:
        src = OUT_DIR / filename
        (KNOWLEDGE_DIR / filename).write_text(src.read_text(encoding="utf-8"), encoding="utf-8")

    placeholder = KNOWLEDGE_DIR / "hcm-chapter-03-textbook-placeholder.md"
    if placeholder.exists():
        placeholder.write_text(
            """---
subject: hcm
chapter: "3"
source_type: textbook_ocr
status: replaced_by_cleaned_files
---

# Placeholder

Textbook OCR files were generated in `knowledge/textbook-chapter-03/` and copied into `knowledge/` for upload.
""",
            encoding="utf-8",
        )

    print(f"Wrote markdown files to: {OUT_DIR}")
    for path in sorted(OUT_DIR.glob("*.md")):
        print(f"{path.name}: {path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
