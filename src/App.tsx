import { FormEvent, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Brain,
  CalendarDays,
  CheckCircle2,
  Compass,
  Flag,
  Globe2,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Landmark,
  Layers3,
  Lightbulb,
  Map,
  Menu,
  MessageCircle,
  Network,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import UnityGame from "./UnityGame";
import { getChatResponse } from "./lib/gemini";

type Message = {
  role: "user" | "model";
  text: string;
};

type TheoryModule = {
  title: string;
  eyebrow: string;
  icon: LucideIcon;
  image: string;
  thesis: string;
  remember: string;
  bullets: string[];
};

type ArgumentCard = {
  title: string;
  icon: LucideIcon;
  argument: string;
  explain: string;
  keywords: string[];
};

const navItems = [
  { href: "#tong-quan", label: "Tổng quan" },
  { href: "#hoc-ly-thuyet", label: "Học lý thuyết" },
  { href: "#luan-diem", label: "Luận điểm" },
  { href: "#moc-nho", label: "Mốc nhớ" },
  { href: "#game", label: "Game" },
];

const images = {
  hero:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Ho-chi-Minh%20with%20children%20%282%29.jpg",
  portrait:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Ho%20Chi%20Minh%20-%201946%20Portrait.jpg",
  people:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Saigonese%20laborers.jpg",
  front:
    "https://commons.wikimedia.org/wiki/Special:FilePath/The%20Politburo%20Member%20and%20President%2C%20Vietnam%20Fatherland%20Front%2C%20Mr.%20Nguyen%20Thein%20Nhan%20meeting%20the%20Vice%20President%2C%20Shri%20Mohd.%20Hamid%20Ansari%2C%20in%20New%20Delhi%20on%20March%2020%2C%202015.jpg",
  international:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Ho%20Chi%20Minh%20with%20Vietnamese%20expats%20in%20France%2C%201946.jpg",
};

const overviewCards = [
  {
    label: "Chủ đề",
    value: "Đại đoàn kết",
    text: "Tư tưởng Hồ Chí Minh về đoàn kết toàn dân tộc và đoàn kết quốc tế.",
  },
  {
    label: "Mạch học",
    value: "Từ dân tộc đến thế giới",
    text: "Bắt đầu từ sức mạnh nhân dân, đi tới Mặt trận, rồi mở rộng ra quốc tế.",
  },
  {
    label: "Câu chốt",
    value: "Dân là gốc",
    text: "Tin dân, trọng dân, dựa vào dân là nền tảng để quy tụ mọi lực lượng.",
  },
  {
    label: "Mục tiêu",
    value: "Phụng sự Tổ quốc",
    text: "Đoàn kết để giành và giữ độc lập, xây dựng cuộc sống tự do, hạnh phúc.",
  },
];

const theoryModules: TheoryModule[] = [
  {
    title: "Đại đoàn kết toàn dân tộc",
    eyebrow: "Học lý thuyết 01",
    icon: Users,
    image: images.people,
    thesis:
      "Đại đoàn kết toàn dân tộc là vấn đề có ý nghĩa chiến lược, quyết định thành công của cách mạng Việt Nam. Đây không phải một khẩu hiệu cảm tính mà là phương pháp tổ chức sức mạnh nhân dân.",
    remember:
      "Nhớ nhanh: đoàn kết là chiến lược lâu dài, không phải sách lược nhất thời.",
    bullets: [
      "Chủ thể đoàn kết là toàn thể nhân dân Việt Nam yêu nước.",
      "Nền tảng là liên minh công nhân - nông dân - trí thức.",
      "Điểm quy tụ là lợi ích tối cao của dân tộc và quyền lợi căn bản của nhân dân.",
      "Muốn đoàn kết bền vững phải khoan dung, tin dân, tôn trọng khác biệt chính đáng.",
    ],
  },
  {
    title: "Mặt trận dân tộc thống nhất",
    eyebrow: "Học lý thuyết 02",
    icon: Landmark,
    image: images.front,
    thesis:
      "Khối đại đoàn kết chỉ trở thành sức mạnh vật chất khi được tổ chức thành Mặt trận dân tộc thống nhất. Mặt trận là nơi tập hợp, hiệp thương và phối hợp hành động của các lực lượng yêu nước.",
    remember:
      "Nhớ nhanh: có đoàn kết phải có tổ chức; có tổ chức phải có dân chủ.",
    bullets: [
      "Mặt trận quy tụ các giai cấp, tầng lớp, dân tộc, tôn giáo, cá nhân yêu nước.",
      "Nguyên tắc hoạt động cốt lõi là hiệp thương dân chủ.",
      "Mặt trận đặt dưới sự lãnh đạo của Đảng nhưng phải gần dân, nghe dân, làm cho dân tin.",
      "Đoàn kết trong Mặt trận là đoàn kết vì mục tiêu chung, không cào bằng mọi khác biệt.",
    ],
  },
  {
    title: "Đoàn kết quốc tế",
    eyebrow: "Học lý thuyết 03",
    icon: Globe2,
    image: images.international,
    thesis:
      "Đoàn kết quốc tế nhằm kết hợp sức mạnh dân tộc với sức mạnh thời đại. Theo Hồ Chí Minh, Việt Nam phải tranh thủ sự ủng hộ của các lực lượng tiến bộ nhưng luôn giữ vững độc lập, tự chủ.",
    remember:
      "Nhớ nhanh: mở rộng hợp tác quốc tế nhưng không đánh mất bản lĩnh dân tộc.",
    bullets: [
      "Đoàn kết với phong trào cộng sản và công nhân quốc tế.",
      "Gắn bó với phong trào đấu tranh giải phóng dân tộc.",
      "Hợp tác với các lực lượng hòa bình, dân chủ, tiến bộ trên thế giới.",
      "Nguyên tắc là độc lập tự chủ, bình đẳng, tôn trọng lẫn nhau và cùng có lợi.",
    ],
  },
];

const argumentCards: ArgumentCard[] = [
  {
    title: "Đoàn kết là chiến lược",
    icon: Target,
    argument:
      "Hồ Chí Minh xem đại đoàn kết là đường lối chiến lược quyết định thắng lợi của cách mạng.",
    explain:
      "Bởi cách mạng là sự nghiệp của quần chúng. Khi nhân dân không được tập hợp, mọi đường lối đúng cũng khó biến thành sức mạnh hiện thực.",
    keywords: ["chiến lược", "quần chúng", "thắng lợi"],
  },
  {
    title: "Đoàn kết là mục tiêu, nhiệm vụ hàng đầu",
    icon: Flag,
    argument:
      "Đảng phải đặt nhiệm vụ đoàn kết toàn dân ở vị trí trung tâm trong mọi giai đoạn cách mạng.",
    explain:
      "Đoàn kết vừa là điều kiện để giành thắng lợi, vừa là mục tiêu vì cuối cùng cách mạng hướng tới hạnh phúc của nhân dân.",
    keywords: ["mục tiêu", "nhiệm vụ", "nhân dân"],
  },
  {
    title: "Nền tảng là công - nông - trí thức",
    icon: Layers3,
    argument:
      "Liên minh công nhân, nông dân và trí thức là nền gốc để mở rộng khối đại đoàn kết.",
    explain:
      "Nền tảng vững thì khối đoàn kết mới có sức chịu đựng, có tổ chức và có khả năng lan tỏa tới các tầng lớp khác.",
    keywords: ["nền tảng", "liên minh", "mở rộng"],
  },
  {
    title: "Đoàn kết phải có tổ chức",
    icon: Network,
    argument:
      "Mặt trận dân tộc thống nhất là hình thức tổ chức của khối đại đoàn kết toàn dân.",
    explain:
      "Tình cảm đoàn kết cần được chuyển thành cơ chế hiệp thương, chương trình hành động và sự phối hợp cụ thể.",
    keywords: ["Mặt trận", "hiệp thương", "hành động"],
  },
  {
    title: "Đoàn kết quốc tế gắn với tự chủ",
    icon: ShieldCheck,
    argument:
      "Hợp tác với thế giới phải đi cùng độc lập tự chủ, tự lực tự cường.",
    explain:
      "Đoàn kết quốc tế không phải phụ thuộc. Đó là cách kết nối chính nghĩa Việt Nam với những lực lượng tiến bộ của thời đại.",
    keywords: ["quốc tế", "tự chủ", "thời đại"],
  },
];

const memoryMarks = [
  {
    mark: "1 câu",
    title: "Khẩu hiệu kinh điển",
    text: "Đoàn kết, đoàn kết, đại đoàn kết. Thành công, thành công, đại thành công.",
  },
  {
    mark: "2 phạm vi",
    title: "Trong nước và quốc tế",
    text: "Đại đoàn kết toàn dân tộc là gốc; đoàn kết quốc tế là phần mở rộng để kết hợp sức mạnh thời đại.",
  },
  {
    mark: "3 lực lượng nền tảng",
    title: "Công - nông - trí thức",
    text: "Đây là nền gốc của khối đại đoàn kết toàn dân tộc.",
  },
  {
    mark: "4 điều kiện",
    title: "Muốn đoàn kết bền vững",
    text: "Yêu nước, lợi ích chung, khoan dung, tin dân và dựa vào dân.",
  },
  {
    mark: "5 từ khóa",
    title: "Ôn trước khi kiểm tra",
    text: "Chiến lược, Mặt trận, hiệp thương dân chủ, độc lập tự chủ, sức mạnh thời đại.",
  },
];

const forces = [
  { label: "Công nhân", tone: "bg-[#D64933]", note: "Lực lượng nền tảng" },
  { label: "Nông dân", tone: "bg-[#3E8E6C]", note: "Đại đa số nhân dân" },
  { label: "Trí thức", tone: "bg-[#E7B10A]", note: "Sức mạnh tri thức" },
  { label: "Thanh niên", tone: "bg-[#277DA1]", note: "Chủ nhân tương lai" },
  { label: "Phụ nữ", tone: "bg-[#A23E72]", note: "Một nửa xã hội" },
  { label: "Tôn giáo", tone: "bg-[#6D597A]", note: "Đồng bào cùng Tổ quốc" },
  { label: "Dân tộc thiểu số", tone: "bg-[#577590]", note: "Bình đẳng, đoàn kết" },
  { label: "Kiều bào", tone: "bg-[#2A9D8F]", note: "Bộ phận của dân tộc" },
];

const suggestedQuestions = [
  "Tóm tắt Chapter 5 thành 5 ý chính",
  "Vì sao đại đoàn kết là vấn đề chiến lược?",
  "Phân tích nguyên tắc hiệp thương dân chủ",
  "So sánh đại đoàn kết toàn dân tộc và đoàn kết quốc tế",
];

const initialMessages: Message[] = [
  {
    role: "model",
    text: "Chào bạn. Mình có thể giúp bạn học Chapter 5 theo kiểu: tóm tắt, phân tích luận điểm, lập dàn ý hoặc luyện câu hỏi.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto mb-12 max-w-3xl text-center" : "mb-12 max-w-3xl"}>
      <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-[#D64933]">
        {eyebrow}
      </p>
      <h2 className="text-4xl font-black tracking-tight md:text-6xl">
        {title}
      </h2>
    </div>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const gameRef = useRef<HTMLDivElement | null>(null);

  const chatHistory = useMemo(
    () =>
      messages.map((message) => ({
        role: message.role,
        parts: [{ text: message.text }],
      })),
    [messages],
  );

  const handleSend = async (text = inputValue) => {
    const cleanText = text.trim();
    if (!cleanText || isLoading) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", text: cleanText },
    ];

    setMessages(nextMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const answer = await getChatResponse(cleanText, chatHistory);
      setMessages([...nextMessages, { role: "model", text: answer }]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "model",
          text: "Mình chưa kết nối được hệ thống hỏi đáp. Bạn vẫn có thể học theo các mục Tổng quan, Học lý thuyết, Luận điểm, Mốc nhớ và Game trên trang.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSend();
  };

  return (
    <div className="min-h-screen bg-[#F7F2EA] text-[#1F2421] selection:bg-[#D64933] selection:text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-[#F7F2EA]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <a href="#" className="flex items-center gap-3 font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#1F2421] text-[#F7F2EA]">
              <Handshake className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              Chapter 5
              <span className="block text-xs font-medium text-[#68736C]">
                Đại đoàn kết
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#405047] transition hover:bg-black/5"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#D64933] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B83A2A]"
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">Hỏi AI</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white/60 md:hidden"
              aria-label="Mở menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-black/10 bg-[#F7F2EA] md:hidden"
            >
              <div className="grid gap-1 px-4 py-3">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-semibold text-[#405047] hover:bg-black/5"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="relative min-h-[92vh] overflow-hidden pt-16">
          <img
            src={images.hero}
            alt="Hồ Chí Minh với thiếu nhi"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,36,33,0.96),rgba(31,36,33,0.72),rgba(31,36,33,0.16))]" />

          <div className="relative mx-auto grid min-h-[calc(92vh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-4xl text-white"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#F4D35E] backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Tư tưởng Hồ Chí Minh
              </div>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.96] tracking-tight md:text-7xl lg:text-8xl">
                Chapter 5
                <span className="block text-[#F4D35E]">
                  Học chắc đại đoàn kết
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/86 md:text-xl">
                Một trang học được thiết kế như bộ ôn thi trực quan: nắm tổng
                quan, đọc lý thuyết, hiểu luận điểm, ghi mốc nhớ và luyện bằng
                game tương tác.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#hoc-ly-thuyet"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#F4D35E] px-5 py-3 text-sm font-bold text-[#1F2421] transition hover:bg-[#FFE16B]"
                >
                  Bắt đầu học lý thuyết
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => gameRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/18"
                >
                  Vào game ôn tập
                  <Compass className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="hidden md:block"
            >
              <div className="ml-auto max-w-md rounded-lg border border-white/18 bg-[#F7F2EA]/94 p-5 shadow-2xl backdrop-blur">
                <img
                  src={images.portrait}
                  alt="Chủ tịch Hồ Chí Minh"
                  className="aspect-[4/5] w-full rounded-md object-cover"
                />
                <div className="mt-5 grid gap-3">
                  <div className="flex items-start gap-3">
                    <Quote className="mt-1 h-4 w-4 text-[#D64933]" />
                    <p className="text-sm leading-6 text-[#405047]">
                      “Đoàn kết, đoàn kết, đại đoàn kết. Thành công, thành
                      công, đại thành công.”
                    </p>
                  </div>
                  <div className="h-px bg-black/10" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#68736C]">
                    Câu khóa để nhớ toàn bộ Chapter 5
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="tong-quan" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHeading
              eyebrow="Tổng quan"
              title="Nắm chương trong 3 phút"
            />

            <div className="grid gap-4 md:grid-cols-4">
              {overviewCards.map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-lg border border-black/10 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D64933]">
                    {card.label}
                  </p>
                  <h3 className="mt-3 text-2xl font-black leading-tight">{card.value}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#607069]">{card.text}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-lg bg-[#1F2421] p-6 text-white md:p-8">
              <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-center">
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-lg bg-[#F4D35E] text-[#1F2421]">
                    <Brain className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F4D35E]">
                      Logic của chương
                    </p>
                    <h3 className="mt-1 text-2xl font-black">Dân tộc là gốc, quốc tế là sức mạnh bổ sung</h3>
                  </div>
                </div>
                <p className="text-base leading-8 text-white/75">
                  Học Chapter 5 nên đi theo mạch: đoàn kết trong nước tạo nền
                  móng, Mặt trận biến đoàn kết thành tổ chức, đoàn kết quốc tế
                  giúp kết hợp sức mạnh dân tộc với sức mạnh thời đại.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="hoc-ly-thuyet" className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHeading
              eyebrow="Học lý thuyết"
              title="Ba mảng kiến thức trọng tâm"
            />

            <div className="grid gap-6">
              {theoryModules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <motion.article
                    key={module.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: index * 0.08 }}
                    className="grid overflow-hidden rounded-lg border border-black/10 bg-[#F7F2EA] shadow-sm lg:grid-cols-[0.9fr_1.1fr]"
                  >
                    <div className="relative min-h-[260px]">
                      <img
                        src={module.image}
                        alt={module.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />
                      <div className="absolute bottom-5 left-5 right-5">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-white/94 px-3 py-2 text-sm font-black text-[#1F2421]">
                          <Icon className="h-4 w-4 text-[#D64933]" />
                          {module.eyebrow}
                        </div>
                        <h3 className="text-3xl font-black text-white md:text-4xl">
                          {module.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="rounded-lg bg-white p-5 text-base font-semibold leading-8 text-[#1F2421]">
                        {module.thesis}
                      </div>
                      <div className="mt-4 flex gap-3 rounded-lg border border-[#D64933]/20 bg-[#D64933]/8 p-4 text-sm font-bold leading-6 text-[#8B2C22]">
                        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />
                        <span>{module.remember}</span>
                      </div>
                      <div className="mt-5 grid gap-3">
                        {module.bullets.map((bullet) => (
                          <div key={bullet} className="flex gap-3 text-sm leading-6 text-[#405047]">
                            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#3E8E6C]" />
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="luan-diem" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <SectionHeading
              eyebrow="Luận điểm"
              title="Các ý phân tích dễ ra đề"
              align="center"
            />

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {argumentCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.article
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg border border-black/10 bg-white p-6 shadow-sm"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#1F2421] text-[#F4D35E]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-2xl font-black">{card.title}</h3>
                    <p className="mt-4 text-sm font-bold leading-6 text-[#D64933]">
                      {card.argument}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#607069]">
                      {card.explain}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {card.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-lg bg-[#F7F2EA] px-3 py-1.5 text-xs font-black text-[#405047]"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="moc-nho" className="bg-[#1F2421] py-20 text-white md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div className="lg:sticky lg:top-24">
                <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-[#F4D35E]">
                  Mốc nhớ
                </p>
                <h2 className="text-4xl font-black tracking-tight md:text-6xl">
                  Ghi nhớ nhanh trước khi kiểm tra
                </h2>
                <p className="mt-5 text-base leading-8 text-white/70">
                  Nếu chỉ còn ít thời gian, hãy học thuộc các mốc này trước.
                  Chúng giúp bạn dựng lại toàn bộ chương trong đầu rất nhanh.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {forces.slice(0, 4).map((force) => (
                    <div key={force.label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/7 p-3">
                      <span className={`h-9 w-2 rounded-full ${force.tone}`} />
                      <div>
                        <p className="text-sm font-black">{force.label}</p>
                        <p className="text-xs text-white/55">{force.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                {memoryMarks.map((item, index) => (
                  <motion.div
                    key={item.mark}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: index * 0.06 }}
                    className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.06] p-5 backdrop-blur md:grid-cols-[160px_1fr]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#F4D35E] text-[#1F2421]">
                        <CalendarDays className="h-6 w-6" />
                      </span>
                      <p className="text-xl font-black text-[#F4D35E]">{item.mark}</p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/72">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="game" ref={gameRef} className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#D64933]">
                  Game
                </p>
                <h2 className="text-4xl font-black tracking-tight md:text-6xl">
                  Hành trình Đại đoàn kết
                </h2>
              </div>
            </div>
            <div className="rounded-lg border border-black/10 bg-[#1F2421] p-2 shadow-2xl md:p-4">
              <UnityGame />
            </div>
          </div>
        </section>
      </main>

      <footer className="relative overflow-hidden bg-[#1F2421] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,211,94,0.18),transparent_32%),radial-gradient(circle_at_85%_10%,rgba(214,73,51,0.18),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-18">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#F4D35E]">
                <Handshake className="h-4 w-4" />
                Chapter 5
              </div>
              <h2 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                Đại đoàn kết là sức mạnh làm nên thắng lợi
              </h2>
              <div className="mt-6 flex max-w-2xl gap-4 rounded-lg border border-white/12 bg-white/[0.06] p-5">
                <Quote className="mt-1 h-6 w-6 shrink-0 text-[#F4D35E]" />
                <p className="text-base font-semibold leading-8 text-white/82">
                  Đoàn kết, đoàn kết, đại đoàn kết. Thành công, thành công, đại thành công.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/82 transition hover:border-[#F4D35E]/60 hover:bg-white/[0.1] hover:text-white"
                >
                  {item.label}
                  <ArrowUpRight className="h-4 w-4 text-[#F4D35E] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/58 md:flex-row md:items-center md:justify-between">
            <p className="font-semibold text-white">
              Tư tưởng Hồ Chí Minh về đại đoàn kết toàn dân tộc và đoàn kết quốc tế
            </p>
            <div className="flex flex-wrap gap-2">
              {["Tổng quan", "Lý thuyết", "Luận điểm", "Mốc nhớ", "Game"].map((label) => (
                <span key={label} className="rounded-lg bg-white/8 px-3 py-1.5 text-xs font-bold text-white/72">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-lg bg-[#1F2421] text-white shadow-xl transition hover:bg-[#D64933]"
        aria-label="Mở trợ lý AI"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isChatOpen && (
          <motion.aside
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            className="fixed bottom-4 right-4 z-50 flex h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-[440px] flex-col overflow-hidden rounded-lg border border-black/10 bg-[#F7F2EA] shadow-2xl md:h-[720px]"
          >
            <div className="flex items-center justify-between border-b border-black/10 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#D64933] text-white">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-black">Trợ lý Chapter 5</h2>
                  <p className="text-xs text-[#607069]">Tóm tắt, phân tích, luyện câu hỏi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-black/5"
                aria-label="Đóng trợ lý AI"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-black/10 p-4">
              <div className="grid gap-2">
                {suggestedQuestions.slice(0, 2).map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void handleSend(question)}
                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-left text-xs font-semibold leading-5 text-[#405047] transition hover:border-[#D64933]/40"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid gap-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`max-w-[86%] rounded-lg px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "ml-auto bg-[#1F2421] text-white"
                        : "mr-auto border border-black/10 bg-white text-[#1F2421]"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                ))}
                {isLoading && (
                  <div className="mr-auto rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-[#607069]">
                    Đang tìm câu trả lời...
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-black/10 bg-white p-4">
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Nhập câu hỏi về Chapter 5"
                className="min-w-0 flex-1 rounded-lg border border-black/10 bg-[#F7F2EA] px-4 py-3 text-sm outline-none transition focus:border-[#D64933]"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="grid h-12 w-12 place-items-center rounded-lg bg-[#D64933] text-white transition hover:bg-[#B83A2A] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Gửi câu hỏi"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
