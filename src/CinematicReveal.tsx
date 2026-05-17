import { motion, useScroll, useTransform } from "motion/react";

export const CinematicReveal = () => {
  // Theo dõi vị trí cuộn chuột trên toàn bộ window (tính bằng pixel)
  const { scrollY } = useScroll();

  // Từ 0px đến 800px cuộn chuột: Màn đen trên bay lên, màn đen dưới bay xuống
  // Bạn có thể tăng/giảm số 800 để màn hình mở ra chậm hoặc nhanh hơn
  const topHalfY = useTransform(scrollY, [0, 800], ["0%", "-100%"]);
  const bottomHalfY = useTransform(scrollY, [0, 800], ["0%", "100%"]);
  
  // Chữ và tia sáng mờ dần từ 0px đến 300px
  const fadeOut = useTransform(scrollY, [0, 300], [1, 0]);
  
  // Khi kéo qua 800px, ẩn hoàn toàn component để không chặn click chuột vào các nút bên dưới
  const display = useTransform(scrollY, (v) => v > 800 ? "none" : "block");

  return (
    <motion.div style={{ display }} className="fixed inset-0 z-[100] pointer-events-none">
      {/* Nửa đen phía trên */}
      <motion.div
        style={{ y: topHalfY }}
        className="absolute top-0 left-0 w-full h-1/2 bg-[#050505] shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-b border-white/5"
      />

      {/* Tia sáng ở giữa */}
      <motion.div
        style={{ opacity: fadeOut }}
        className="absolute top-1/2 left-0 w-full h-[2px] bg-white blur-[2px] -translate-y-1/2 z-50"
      />

      {/* Nửa đen phía dưới */}
      <motion.div
        style={{ y: bottomHalfY }}
        className="absolute bottom-0 left-0 w-full h-1/2 bg-[#050505] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] border-t border-white/5"
      />
      
      {/* Text hướng dẫn */}
      <motion.div 
        style={{ opacity: fadeOut }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#D4AF37] tracking-[0.5em] text-xs font-bold uppercase animate-pulse z-50"
      >
        Cuộn xuống để mở triển lãm
      </motion.div>
    </motion.div>
  );
};