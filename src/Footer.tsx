import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, MapPin, Info, Shield, Landmark, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// ==========================================
// DỮ LIỆU LỊCH SỬ TỪNG SỰ KIỆN (FULL 4 ẢNH)
// ==========================================
const HISTORICAL_JOURNEY = [
  {
    id: 1,
    title: "Hồ Chí Minh",
    year: "1890 - 1969",
    location: "Việt Nam",
    image: "/images/ChuTichHCM.jpg", 
    desc: "Hồ Chí Minh là nhà cách mạng Việt Nam, người sáng lập Đảng Cộng sản Việt Nam và lãnh đạo cuộc đấu tranh giành độc lập dân tộc trong thế kỷ XX. Ngày 2 tháng 9 năm 1945 tại Quảng trường Ba Đình, Hà Nội, ông đọc bản Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa. Ông giữ cương vị Chủ tịch nước từ năm 1945 đến năm 1969 và là biểu tượng của phong trào giải phóng dân tộc Việt Nam.",
    rotate: "-rotate-2",
    marginTop: "mt-0",
    extended: {
      subtitle: "Lãnh tụ cách mạng Việt Nam",
      basic_info: {
        full_name: "Nguyễn Sinh Cung",
        other_names: ["Nguyễn Tất Thành", "Nguyễn Ái Quốc", "Hồ Chí Minh"],
        birth: { date: "19/05/1890", place: "Nghệ An, Liên bang Đông Dương" },
        death: { date: "02/09/1969", place: "Hà Nội, Việt Nam Dân chủ Cộng hòa", age: 79 },
        nationality: "Việt Nam",
        ethnicity: "Kinh",
        religion: "Không"
      },
      family: {
        father: "Nguyễn Sinh Sắc",
        mother: "Hoàng Thị Loan",
        siblings: ["Nguyễn Thị Thanh", "Nguyễn Sinh Khiêm", "Nguyễn Sinh Nhuận"]
      },
      positions: [
        { title: "Chủ tịch nước Việt Nam Dân chủ Cộng hòa", start: "02/09/1945", end: "02/09/1969", duration: "24 năm", successor: "Tôn Đức Thắng" },
        { title: "Thủ tướng Chính phủ Việt Nam Dân chủ Cộng hòa", start: "02/09/1945", end: "20/09/1955", duration: "10 năm", successor: "Phạm Văn Đồng" },
        { title: "Chủ tịch Đảng Lao động Việt Nam", start: "19/02/1951", end: "02/09/1969", duration: "18 năm" },
        { title: "Bộ trưởng Bộ Ngoại giao Việt Nam", start: "28/08/1945", end: "02/03/1946", successor: "Nguyễn Tường Tam" },
        { title: "Ủy viên Bộ Chính trị", start: "31/03/1935", end: "02/09/1969", duration: "34 năm" }
      ],
      legacy: [
        "Lăng Chủ tịch Hồ Chí Minh được xây dựng tại Hà Nội.",
        "Hình ảnh Hồ Chí Minh xuất hiện trên tiền tệ Việt Nam.",
        "Nhiều tượng đài và công trình tưởng niệm được xây dựng trên khắp cả nước.",
        "Ông đồng thời là nhà văn, nhà thơ và nhà báo.",
        "Được tạp chí Time bình chọn là một trong 100 nhân vật ảnh hưởng nhất thế kỷ XX."
      ]
    }
  },
  {
    id: 2,
    title: "Nguyễn Ái Quốc",
    year: "1919 - 1921",
    location: "Pháp",
    image: "/images/Footer1.jpg",
    desc: "Tháng 6/1919, thay mặt Hội những người An Nam yêu nước tại Pháp, Nguyễn Tất Thành gửi tới Hội nghị Versailles bản “Yêu sách của nhân dân An Nam”. Từ đây, con đường cách mạng vô sản dần mở ra.",
    rotate: "rotate-3",
    marginTop: "mt-12 md:mt-20",
    extended: {
      subtitle: "Từ Versailles đến con đường cách mạng",
      caption: "Nguyễn Ái Quốc, đại biểu Đông Dương, chụp tại Đại hội Đảng Cộng sản Pháp ở Marseille năm 1921.",
      event_info: {
        headline: "Bản Yêu sách của nhân dân An Nam",
        description: "Tháng 6 năm 1919, thay mặt Hội những người An Nam yêu nước tại Pháp, Nguyễn Tất Thành gửi tới Hội nghị Hòa bình Versailles bản “Yêu sách của nhân dân An Nam” gồm 8 điểm, yêu cầu các quyền tự do, dân chủ và bình đẳng cho nhân dân Việt Nam.",
        details: [
          "Bản yêu sách được ký tên chung là “Nguyễn Ái Quốc”.",
          "Đây là lần đầu tiên cái tên Nguyễn Ái Quốc xuất hiện công khai trên chính trường quốc tế.",
          "Những yêu cầu của người Việt không được Hội nghị Versailles chấp nhận.",
          "Sự thất bại này khiến Nguyễn Ái Quốc nhận ra rằng các nước thực dân không tự nguyện trao quyền tự do cho các dân tộc thuộc địa.",
          "Từ đó, Người dần chuyển hướng sang con đường cách mạng vô sản và chủ nghĩa cộng sản."
        ]
      },
      significance: {
        title: "Ý nghĩa lịch sử",
        content: "Sự kiện tại Versailles đánh dấu bước chuyển biến quan trọng trong tư tưởng của Nguyễn Ái Quốc, từ chủ nghĩa yêu nước đến việc tìm kiếm con đường giải phóng dân tộc bằng cách mạng vô sản."
      }
    }
  },
  {
    id: 3,
    title: "Bến Nhà Rồng",
    year: "1911",
    location: "Sài Gòn, Việt Nam",
    image: "/images/BenNhaRong.jpg",
    desc: "Ngày 5 tháng 6 năm 1911, Nguyễn Tất Thành rời Bến Nhà Rồng trên con tàu Amiral Latouche-Tréville với vai trò phụ bếp. Từ đây, Người bắt đầu hành trình hơn 30 năm bôn ba qua nhiều quốc gia nhằm tìm con đường giải phóng dân tộc Việt Nam.",
    rotate: "-rotate-1",
    marginTop: "mt-4 md:mt-8",
    extended: {
      subtitle: "Khởi đầu hành trình tìm đường cứu nước",
      caption: "Nguyễn Tất Thành rời Bến Nhà Rồng ngày 5/6/1911 để bắt đầu hành trình tìm đường cứu nước.",
      event_info: {
        headline: "Ra đi tìm đường cứu nước",
        description: "Ngày 5 tháng 6 năm 1911, Nguyễn Tất Thành rời Bến Nhà Rồng trên con tàu Amiral Latouche-Tréville với vai trò phụ bếp. Từ đây, Người bắt đầu hành trình hơn 30 năm bôn ba qua nhiều quốc gia nhằm tìm con đường giải phóng dân tộc Việt Nam.",
        details: [
          "Bến Nhà Rồng là nơi đánh dấu bước ngoặt lớn trong cuộc đời Hồ Chí Minh.",
          "Người đã đi qua nhiều châu lục để học hỏi và tìm hiểu các phong trào cách mạng trên thế giới.",
          "Hành trình này đặt nền móng cho con đường giải phóng dân tộc Việt Nam sau này.",
          "Sự kiện năm 1911 trở thành biểu tượng của ý chí và khát vọng độc lập dân tộc."
        ]
      },
      significance: {
        title: "Ý nghĩa lịch sử",
        content: "Sự kiện rời Bến Nhà Rồng mở đầu cho hành trình tìm đường cứu nước của Hồ Chí Minh, đặt nền móng cho cuộc cách mạng giải phóng dân tộc Việt Nam trong thế kỷ XX."
      }
    }
  },
  {
    id: 4,
    title: "Tuyên ngôn Độc lập",
    year: "1945",
    location: "Quảng trường Ba Đình, Hà Nội",
    image: "/images/Footer4.jpg",
    desc: "Ngày 2 tháng 9 năm 1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh thay mặt Chính phủ lâm thời đọc bản Tuyên ngôn Độc lập, chính thức khai sinh nước Việt Nam Dân chủ Cộng hòa.",
    rotate: "rotate-2",
    marginTop: "mt-8 md:mt-32",
    extended: {
      subtitle: "Khai sinh nước Việt Nam Dân chủ Cộng hòa",
      caption: "Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình ngày 2/9/1945.",
      event_info: {
        headline: "Ngày độc lập của dân tộc Việt Nam",
        description: "Ngày 2 tháng 9 năm 1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh thay mặt Chính phủ lâm thời đọc bản Tuyên ngôn Độc lập, chính thức khai sinh nước Việt Nam Dân chủ Cộng hòa.",
        details: [
          "Hàng chục vạn người dân đã tập trung tại Quảng trường Ba Đình để chứng kiến thời khắc lịch sử.",
          "Bản Tuyên ngôn khẳng định quyền tự do và độc lập của dân tộc Việt Nam.",
          "Sự kiện đánh dấu sự kết thúc của chế độ thực dân phong kiến tại Việt Nam.",
          "Ngày 2/9 trở thành Quốc khánh của nước Việt Nam."
        ]
      },
      significance: {
        title: "Ý nghĩa lịch sử",
        content: "Tuyên ngôn Độc lập năm 1945 đánh dấu sự ra đời của nước Việt Nam Dân chủ Cộng hòa, mở ra kỷ nguyên độc lập và tự do cho dân tộc Việt Nam."
      }
    }
  }
];

// ==========================================
// HIỆU ỨNG BỤI ĐIỆN ẢNH (DUST PARTICLES)
// ==========================================
const CinematicDust = () => {
  const particles = useMemo(() => Array.from({ length: 40 }).map(() => ({
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    scale: Math.random() * 0.5 + 0.2,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#D4AF37] rounded-full blur-[2px] opacity-0"
          initial={{ x: p.x, y: p.y }}
          animate={{
            y: [`${parseFloat(p.y) - 5}%`, `${parseFloat(p.y) + 5}%`],
            x: [`${parseFloat(p.x) - 2}%`, `${parseFloat(p.x) + 2}%`],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

export function Footer() {
  const [selectedEvent, setSelectedEvent] = useState<typeof HISTORICAL_JOURNEY[0] | null>(null);

  return (
    <footer className="relative w-full bg-[#0c0806] text-[#d6c8b8] overflow-hidden selection:bg-[#8B0000] selection:text-[#D4AF37] border-t border-[#D4AF37]/20">
      {/* Texture nền & Ánh sáng */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: `url('/images/FooterBG.png')` }}
        ></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.3)_0%,rgba(12,8,6,0.95)_80%)]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>
      <CinematicDust />

      <div className="container mx-auto px-4 py-32 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24 max-w-3xl mx-auto"
        >
          <p className="text-[#D4AF37] tracking-[0.4em] text-xs font-bold uppercase mb-4 opacity-80">
            Hành trình cứu nước
          </p>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white uppercase tracking-wide drop-shadow-xl">
            Dấu Chân Lịch Sử
          </h2>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#8B0000] to-transparent mx-auto mt-8 mb-6"></div>
          <p className="text-[#a89b8d] font-serif italic text-lg leading-relaxed">
            "Không có gì quý hơn độc lập tự do." Hãy cùng nhìn lại những khoảnh khắc vàng son trên chặng đường bôn ba tìm ánh sáng cho dân tộc.
          </p>
        </motion.div>

        {/* Art Gallery / Masonry Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 px-4 md:px-12">
          {HISTORICAL_JOURNEY.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.15, duration: 0.8, ease: "easeOut" }}
              className={`relative group cursor-pointer ${item.marginTop} ${item.rotate} transition-transform duration-500`}
              onClick={() => setSelectedEvent(item)}
            >
              <div className="relative p-2 bg-[#1a1311] border border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:border-[#D4AF37]/80 group-hover:shadow-[0_0_40px_rgba(139,0,0,0.6)] group-hover:-translate-y-4">
                <div className="absolute inset-0 border-[3px] border-[#0c0806] pointer-events-none z-20 m-1"></div>
                
                <div className="relative overflow-hidden aspect-[3/4]">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover sepia-[0.6] grayscale-[0.2] contrast-125 transition-all duration-700 group-hover:scale-110 group-hover:sepia-0 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0806] via-transparent to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-60"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-left transform translate-y-4 opacity-70 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="text-[#D4AF37] font-bold font-serif text-2xl drop-shadow-md">{item.year.split(" ")[0]}</span>
                    <h3 className="text-white font-serif text-lg font-medium leading-tight mt-1">{item.title}</h3>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer bản quyền gốc */}
      <div className="relative z-10 border-t border-white/5 bg-[#080504] py-8 mt-20 text-center">
         <p className="text-xs text-[#a89b8d]/50 uppercase tracking-widest font-medium">
            © 2026 — Kiến thức về hội nhập kinh tế quốc tế của Việt Nam.
         </p>
      </div>

      {/* ==========================================
          CINEMATIC MODAL POPUP
      ========================================== */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="fixed inset-0 z-[100] bg-[#0c0806]/80 flex items-center justify-center p-4 md:p-8 lg:p-12"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotateX: -10 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-5xl bg-[#140e0c] border border-[#D4AF37]/30 shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Nút Đóng */}
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-[#8B0000] text-[#D4AF37] hover:text-white rounded-full transition-colors border border-[#D4AF37]/20"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* LEFT: Hình ảnh khổ lớn */}
                <div className="w-full md:w-5/12 relative min-h-[30vh] md:min-h-0 bg-black">
                  <motion.img 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 6, ease: "easeOut" }}
                    src={selectedEvent.image} 
                    alt={selectedEvent.title}
                    className="absolute inset-0 w-full h-full object-cover sepia-[0.2] contrast-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#140e0c] opacity-0 md:opacity-100 hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140e0c] to-transparent opacity-100 md:opacity-0 block md:hidden" />
                  <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                </div>

                {/* RIGHT: Nội dung hiển thị */}
                <div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col justify-start relative bg-[#140e0c] overflow-y-auto max-h-[60vh] md:max-h-[85vh] scrollbar-thin scrollbar-thumb-[#8B0000] scrollbar-track-transparent">
                  <div className="absolute top-0 left-6 md:left-10 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#8B0000]/40 to-transparent"></div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative pl-6 md:pl-8 space-y-6 text-[#d6c8b8]"
                  >
                    {/* Chỉ báo dòng thời gian chính */}
                    <div className="absolute left-[-5px] top-3 w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,1)]"></div>

                    {/* Metadata Header */}
                    <div>
                      <div className="flex items-center gap-3 text-xs tracking-widest uppercase font-bold text-[#a89b8d] mb-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#8B0000]" /> {selectedEvent.year}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#8B0000]" /> {selectedEvent.location}</span>
                      </div>
                      <h3 className="text-2xl md:text-4xl font-serif font-bold text-white uppercase tracking-wide leading-tight mt-1">
                        {selectedEvent.title}
                      </h3>
                      {selectedEvent.extended?.subtitle && (
                        <p className="text-[#D4AF37] font-serif italic text-sm mt-0.5">{selectedEvent.extended.subtitle}</p>
                      )}
                    </div>
                    
                    <Separator className="bg-[#D4AF37]/20 w-16" />

                    {/* LÔGIC PHÂN CHIA LAYOUT POPUP */}
                    {selectedEvent.extended ? (
                      <div className="space-y-6 text-sm md:text-[14px] leading-relaxed">
                        
                        {/* -------------------------------------------
                            LOẠI 1: HỒ SƠ NHÂN VẬT 
                            ------------------------------------------- */}
                        {selectedEvent.extended.basic_info && (
                          <>
                            {/* 1. Thông tin cơ bản */}
                            <div className="space-y-2">
                              <h4 className="text-[#D4AF37] font-serif font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                <Info className="w-4 h-4 text-[#8B0000]" /> Thông tin cơ bản
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 bg-black/20 p-3 rounded border border-white/5 font-sans">
                                <div><span className="text-[#a89b8d]">Tên khai sinh:</span> {selectedEvent.extended.basic_info.full_name}</div>
                                <div><span className="text-[#a89b8d]">Quốc tịch:</span> {selectedEvent.extended.basic_info.nationality}</div>
                                <div><span className="text-[#a89b8d]">Sinh nhật:</span> {selectedEvent.extended.basic_info.birth.date}</div>
                                <div><span className="text-[#a89b8d]">Nơi sinh:</span> {selectedEvent.extended.basic_info.birth.place}</div>
                                <div><span className="text-[#a89b8d]">Ngày mất:</span> {selectedEvent.extended.basic_info.death.date} ({selectedEvent.extended.basic_info.death.age} tuổi)</div>
                                <div><span className="text-[#a89b8d]">Nơi mất:</span> {selectedEvent.extended.basic_info.death.place}</div>
                                <div className="sm:col-span-2"><span className="text-[#a89b8d]">Tên gọi khác:</span> {selectedEvent.extended.basic_info.other_names.join(", ")}</div>
                              </div>
                            </div>

                            {/* 2. Thông tin gia đình */}
                            {selectedEvent.extended.family && (
                              <div className="space-y-2">
                                <h4 className="text-[#D4AF37] font-serif font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                  <Users className="w-4 h-4 text-[#8B0000]" /> Gia đình
                                </h4>
                                <div className="bg-black/20 p-3 rounded border border-white/5 font-sans space-y-1">
                                  <div><span className="text-[#a89b8d]">Thân sinh:</span> Cụ {selectedEvent.extended.family.father} & Cụ {selectedEvent.extended.family.mother}</div>
                                  <div><span className="text-[#a89b8d]">Anh chị em:</span> {selectedEvent.extended.family.siblings.join(", ")}</div>
                                </div>
                              </div>
                            )}

                            {/* 3. Chức vụ đảm nhiệm */}
                            {selectedEvent.extended.positions && (
                              <div className="space-y-2">
                                <h4 className="text-[#D4AF37] font-serif font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-[#8B0000]" /> Chức vụ chính đảm nhiệm
                                </h4>
                                <div className="space-y-2 font-sans">
                                  {selectedEvent.extended.positions.map((pos: any, idx: number) => (
                                    <div key={idx} className="border-l-2 border-[#8B0000]/40 pl-3 py-0.5 bg-white/[0.01]">
                                      <div className="font-semibold text-white text-xs md:text-sm">{pos.title}</div>
                                      <div className="text-xs text-[#a89b8d] flex justify-between mt-0.5">
                                        <span>Nhiệm kỳ: {pos.start} — {pos.end}</span>
                                        <span className="text-[#D4AF37] font-medium">Thời gian: {pos.duration}</span>
                                      </div>
                                      {pos.successor && (
                                        <div className="text-[11px] text-[#a89b8d]/70 mt-0.5">Người kế nhiệm: {pos.successor}</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 4. Di sản ghi nhận */}
                            {selectedEvent.extended.legacy && (
                              <div className="space-y-2">
                                <h4 className="text-[#D4AF37] font-serif font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                  <Landmark className="w-4 h-4 text-[#8B0000]" /> Di sản & Ghi nhận
                                </h4>
                                <ul className="list-disc list-inside space-y-1.5 pl-2 text-justify font-sans text-xs md:text-sm text-[#c8bcae]">
                                  {selectedEvent.extended.legacy.map((item: string, idx: number) => (
                                    <li key={idx} className="marker:text-[#8B0000]">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}

                        {/* -------------------------------------------
                            LOẠI 2: HỒ SƠ SỰ KIỆN
                            ------------------------------------------- */}
                        {selectedEvent.extended.event_info && (
                          <>
                            {/* Nội dung chính sự kiện */}
                            <div className="space-y-2">
                              <h4 className="text-[#D4AF37] font-serif font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                <Info className="w-4 h-4 text-[#8B0000]" /> {selectedEvent.extended.event_info.headline}
                              </h4>
                              <p className="text-[#c8bcae] text-justify bg-black/20 p-3 rounded border border-white/5 font-sans text-sm md:text-base leading-relaxed">
                                {selectedEvent.extended.event_info.description}
                              </p>
                            </div>

                            {/* Chi tiết diễn biến */}
                            {selectedEvent.extended.event_info.details && (
                              <div className="space-y-2 pt-2">
                                <h4 className="text-[#D4AF37] font-serif font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                  <Landmark className="w-4 h-4 text-[#8B0000]" /> Diễn biến & Chi tiết
                                </h4>
                                <ul className="list-disc list-inside space-y-2 pl-2 text-justify font-sans text-xs md:text-sm text-[#c8bcae]">
                                  {selectedEvent.extended.event_info.details.map((item: string, idx: number) => (
                                    <li key={idx} className="marker:text-[#8B0000]">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Ý nghĩa lịch sử */}
                            {selectedEvent.extended.significance && (
                              <div className="space-y-2 pt-2">
                                <h4 className="text-[#D4AF37] font-serif font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-[#8B0000]" /> {selectedEvent.extended.significance.title}
                                </h4>
                                <div className="border-l-2 border-[#8B0000]/40 pl-3 py-2 bg-[#8B0000]/5">
                                  <p className="font-sans text-sm md:text-[15px] leading-relaxed text-[#e3d5c5] italic">
                                    {selectedEvent.extended.significance.content}
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Tiểu sử tóm tắt (Dùng chung) */}
                        <div className="pt-4 border-t border-white/5 mt-4">
                          <p className="font-serif italic text-justify text-sm md:text-base border-l-4 border-[#8B0000] pl-4 text-[#a89b8d]">
                            "{selectedEvent.desc}"
                          </p>
                          {selectedEvent.extended.caption && (
                            <p className="font-sans italic text-xs text-[#a89b8d]/60 mt-4 text-center">
                              📸 {selectedEvent.extended.caption}
                            </p>
                          )}
                        </div>

                      </div>
                    ) : (
                      /* Layout hiển thị văn bản thuần túy mặc định cho các sự kiện còn lại */
                      <p className="text-base md:text-lg text-[#d6c8b8] font-light leading-relaxed font-serif text-justify italic border-l-4 border-[#8B0000] pl-6">
                        {selectedEvent.desc}
                      </p>
                    )}
                  </motion.div>
                </div>

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </footer>
  );
}