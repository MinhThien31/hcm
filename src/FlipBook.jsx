import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import HTMLFlipBook from "react-pageflip";

const PAGE_RATIO = 0.5625;

const DEFAULT_PAGES = [
  { src: "/pages/cover_start.png", alt: "Bìa truyện", type: "cover" },
  ...Array.from({ length: 24 }, (_, i) => ({
    src: `/pages/${i + 1}.png`,
    alt: `Trang ${i + 1}`,
  })),
  { src: "/pages/cover_end.png", alt: "Bìa sau", type: "cover" },
];

const DEFAULT_STORY_TEXTS = [
  "Chương 5: Đại Đoàn Kết Toàn Dân Tộc. Chào mừng các bạn đến với câu chuyện về một xóm chợ nhỏ trong những ngày đại dịch COVID-19. Qua biến cố này, chúng ta sẽ thấy rõ sức mạnh vô địch của khối đại đoàn kết toàn dân tộc theo tư tưởng Hồ Chí Minh.",
  "Buổi sáng ở xóm chợ nhỏ thanh bình. Những người tiểu thương, nông dân, công nhân cùng sinh hoạt và buôn bán. Hồ Chí Minh từng nói, đại đa số nhân dân là nền gốc của đại đoàn kết. Hình ảnh xóm chợ chính là một góc thu nhỏ của khối liên minh ấy.",
  "Cô Lan – người bán thịt, luôn nở nụ cười thân thiện. Trong tư tưởng Bác, mỗi người dân lao động đều là một tế bào quan trọng của xã hội, không phân biệt nghề nghiệp hay tầng lớp.",
  "Bà Tâm dắt bé Na đi chợ. Tình làng nghĩa xóm giản dị này chính là biểu hiện sinh động của truyền thống yêu nước, nhân nghĩa và tinh thần tương thân tương ái của dân tộc ta.",
  "Mọi giao dịch diễn ra nhịp nhàng. Khối đại đoàn kết được xây dựng vững chắc khi các tầng lớp nhân dân cùng chung sống hòa thuận, đóng góp vào sự phát triển chung của đất nước.",
  "Bữa cơm gia đình ấm áp. Mục tiêu của đại đoàn kết cuối cùng cũng là vì hạnh phúc của nhân dân, để ai cũng có cơm ăn, áo mặc, ai cũng được học hành như Bác hằng mong muốn.",
  "Thế nhưng, đại dịch COVID-19 bất ngờ ập đến như một cơn bão. Tin tức khẩn cấp trên TV báo hiệu một cuộc chiến không tiếng súng, đòi hỏi toàn dân tộc phải đồng lòng đối mặt.",
  "Ban đầu, sự hoang mang khiến người dân đổ xô đi tích trữ hàng hóa. Khi khối đoàn kết chưa được tổ chức chặt chẽ và đối diện với nỗi sợ, sự hoảng loạn là điều dễ hiểu.",
  "Cô Lan lo âu giữa khung cảnh hỗn loạn. Những khó khăn này là phép thử lớn đối với sức chịu đựng và tinh thần gắn kết của cộng đồng.",
  "Bảng giá tăng vọt ở một số nơi do thiếu thốn. Việc đặt lợi ích cá nhân lên trên lợi ích chung trong lúc nguy nan có thể làm rạn nứt khối đại đoàn kết nếu không được chấn chỉnh kịp thời.",
  "Bà Tâm và bé Na lo lắng không mua đủ nhu yếu phẩm. Hồ Chí Minh luôn dặn: 'Phải chú ý giải quyết hết các vấn đề thiết thực của dân', không để ai bị bỏ lại phía sau.",
  "Bóng lưng hai bà cháu buồn bã rời chợ. Nếu không có sự can thiệp của Mặt trận và Nhà nước, những người yếu thế sẽ chịu thiệt thòi nhất trong khủng hoảng.",
  "Giữa lúc khó khăn nhất, bộ đội và xe chở hàng cứu trợ tiến vào. Quân đội nhân dân từ nhân dân mà ra, vì nhân dân mà chiến đấu, minh chứng cho sức mạnh đoàn kết quân dân.",
  "Cán bộ dùng loa thông báo chính sách hỗ trợ. Nhà nước và Mặt trận Tổ quốc đã làm tốt công tác dân vận, thông tin minh bạch để quy tụ lòng dân, tạo niềm tin vững chắc.",
  "Những bao gạo được trao tận tay. Đây không chỉ là vật chất, mà là sự sẻ chia đùm bọc, thể hiện nguyên tắc lấy lợi ích của nhân dân làm điểm quy tụ của khối đại đoàn kết.",
  "Bà Tâm rơi nước mắt xúc động ôm túi gạo. Niềm tin của nhân dân vào Đảng và Nhà nước được củng cố. Yêu dân, tin dân và dựa vào dân là nguyên tắc tối cao.",
  "Cô Lan an tâm khi có chính sách hỗ trợ. Khối đại đoàn kết đã phát huy tác dụng, biến nhu cầu tự phát thành hành động tự giác, chia sẻ khó khăn cùng cộng đồng.",
  "Giá cả ổn định trở lại. Khi mọi người đồng lòng tuân thủ quy định và hiệp thương dân chủ, trật tự xã hội được thiết lập lại nhanh chóng.",
  "Tại trạm y tế, các bác sĩ tận tình chăm sóc. Không chỉ có sức mạnh trong nước, Việt Nam còn nhận được sự hỗ trợ vaccine và thiết bị từ bạn bè quốc tế, minh chứng cho tình đoàn kết quốc tế.",
  "Tấm thẻ bảo hiểm và sự chăm sóc y tế là minh chứng cho chế độ ưu việt. Việc kết hợp sức mạnh dân tộc và sức mạnh thời đại đã tạo nên lá chắn vững chắc chống lại đại dịch.",
  "Xóm chợ dần hoạt động trở lại sau bão giông. Sức mạnh đại đoàn kết đã giúp chúng ta chiến thắng dịch bệnh, bảo vệ tính mạng và sức khỏe nhân dân.",
  "Bé Na nhận viên kẹo, nụ cười hồn nhiên nở trên môi. Tương lai tươi sáng được bảo vệ nhờ truyền thống đoàn kết vững bền của dân tộc Việt Nam.",
  "Người dân chia sẻ niềm vui. Tình đoàn kết không chỉ giúp vượt qua gian khó mà còn gắn bó mọi người chặt chẽ hơn, tạo động lực to lớn cho sự phát triển.",
  "Từ trên cao nhìn xuống, xóm chợ bình yên đón bình minh. Sức mạnh tổng hợp từ khối đại đoàn kết toàn dân tộc chính là cội nguồn của mọi thắng lợi.",
  "Khép lại câu chuyện, hình ảnh xóm chợ nhỏ trong đại dịch đã minh chứng sinh động cho chân lý vĩ đại của Bác Hồ: 'Đoàn kết, đoàn kết, đại đoàn kết. Thành công, thành công, đại thành công'.",
  "Tư liệu kết thúc. Hãy luôn ghi nhớ và phát huy tinh thần đại đoàn kết toàn dân tộc và đoàn kết quốc tế trong công cuộc xây dựng và bảo vệ Tổ quốc hôm nay."
];

const DEFAULT_AUDIO_FILES = [
  "/audio/page0.mp3",
  ...Array.from({ length: 24 }, (_, i) => `/audio/page${i + 1}.mp3`),
  "/audio/page25.mp3",
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const FlipBook = React.forwardRef((props = {}, ref) => {
  const {
    audioRef: externalAudioRef,
    audioFiles: externalAudioFiles,
    setIsPlaying,
    setIsAudioAutoPlay,
  } = props;

  const flipBookRef = useRef(null);
  const containerRef = useRef(null);
  const internalAudioRef = useRef(null);

  const autoPlayTimeoutRef = useRef(null);
  const isStoppingRef = useRef(false);
  const playbackSessionRef = useRef(0);
  const pendingAutoFlipRef = useRef(false);
  const restartFromPageRef = useRef(null);

  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [bookSize, setBookSize] = useState({ width: 500, height: 281 });

  const pages = useMemo(() => DEFAULT_PAGES, []);
  const storyTexts = useMemo(() => DEFAULT_STORY_TEXTS, []);
  const audioFiles = useMemo(() => {
    if (Array.isArray(externalAudioFiles) && externalAudioFiles.length > 0) {
      return externalAudioFiles;
    }
    return DEFAULT_AUDIO_FILES;
  }, [externalAudioFiles]);

  const activeAudioRef =
    externalAudioRef?.current ? externalAudioRef : internalAudioRef;

  const clearAutoPlayTimer = () => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
  };

  const isSessionActive = (sessionId) =>
    playbackSessionRef.current === sessionId && !isStoppingRef.current;

  const stopAudio = () => {
    const audio = activeAudioRef?.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute("src");
    audio.load();
    setIsPlaying?.(false);
  };

  const cancelCurrentPlayback = () => {
    playbackSessionRef.current += 1;
    clearAutoPlayTimer();
    stopAudio();
  };

  const createPlaybackSession = () => {
    playbackSessionRef.current += 1;
    return playbackSessionRef.current;
  };

  const waitForAudioMetadata = (audio, sessionId) =>
    new Promise((resolve) => {
      if (!audio) {
        resolve(false);
        return;
      }

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        resolve(true);
        return;
      }

      let settled = false;

      const cleanup = () => {
        audio.removeEventListener("loadedmetadata", handleLoaded);
        audio.removeEventListener("canplaythrough", handleLoaded);
        audio.removeEventListener("error", handleError);
        clearInterval(intervalId);
      };

      const finish = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };

      const handleLoaded = () => finish(true);
      const handleError = () => finish(false);

      const intervalId = setInterval(() => {
        if (!isSessionActive(sessionId)) finish(false);
      }, 100);

      audio.addEventListener("loadedmetadata", handleLoaded, { once: true });
      audio.addEventListener("canplaythrough", handleLoaded, { once: true });
      audio.addEventListener("error", handleError, { once: true });
    });

  const waitForAudioEnded = (audio, sessionId) =>
    new Promise((resolve) => {
      if (!audio) {
        resolve("cancelled");
        return;
      }

      let settled = false;

      const cleanup = () => {
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
        clearInterval(intervalId);
      };

      const finish = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };

      const handleEnded = () => finish("ended");
      const handleError = () => finish("error");

      const intervalId = setInterval(() => {
        if (!isSessionActive(sessionId)) finish("cancelled");
      }, 100);

      audio.addEventListener("ended", handleEnded, { once: true });
      audio.addEventListener("error", handleError, { once: true });
    });

  const getVisibleSpreadPages = (pageIndex) => {
    const lastPage = pages.length - 1;

    if (pageIndex <= 0) return [0];
    if (pageIndex >= lastPage) return [lastPage];

    const rightPage = Math.min(pageIndex + 1, lastPage);
    return [pageIndex, rightPage];
  };

  const getPageIndicatorText = (pageIndex) => {
    const visiblePages = getVisibleSpreadPages(pageIndex).map((p) => p + 1);
    return visiblePages.length === 1
      ? `Trang ${visiblePages[0]} / ${pages.length}`
      : `Trang ${visiblePages.join(", ")} / ${pages.length}`;
  };

  const getStoryTextForCurrentView = () => {
    const visiblePages = getVisibleSpreadPages(currentPage);
    return visiblePages
      .map((pageIndex) => storyTexts[pageIndex])
      .filter(Boolean)
      .join(" ");
  };

  const playSingleAudio = async (pageIndex, sessionId) => {
    const audio = activeAudioRef?.current;
    const audioFile = audioFiles?.[pageIndex] || `/audio/page${pageIndex}.mp3`;

    if (!audio || !audioFile || !isSessionActive(sessionId)) return false;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = audioFile;
      audio.load();

      const hasMetadata = await waitForAudioMetadata(audio, sessionId);
      if (!hasMetadata || !isSessionActive(sessionId)) return false;

      await audio.play();
      if (!isSessionActive(sessionId)) return false;

      setIsPlaying?.(true);

      const result = await waitForAudioEnded(audio, sessionId);
      return result === "ended";
    } catch (error) {
      console.warn("Audio play failed:", error);
      setIsPlaying?.(false);
      return false;
    }
  };

  const playAudioForSpread = async (pageIndex, sessionId) => {
    const spreadPages = getVisibleSpreadPages(pageIndex);

    for (const p of spreadPages) {
      if (!isSessionActive(sessionId)) return false;

      const played = await playSingleAudio(p, sessionId);
      if (!played) return false;
    }

    if (isSessionActive(sessionId)) {
      setIsPlaying?.(false);
    }

    return true;
  };

  const playSpreadOnce = async (pageIndex) => {
    cancelCurrentPlayback();
    isStoppingRef.current = false;

    const sessionId = createPlaybackSession();
    await playAudioForSpread(pageIndex, sessionId);

    if (isSessionActive(sessionId)) {
      setIsPlaying?.(false);
    }
  };

  const getNextPageForAutoPlay = (pageIndex) => {
    const lastPage = pages.length - 1;
    if (pageIndex <= 0) return 1;
    if (pageIndex >= lastPage) return lastPage;
    return Math.min(pageIndex + 2, lastPage);
  };

  const handleFlip = (e) => {
    const nextPage = e.data;
    const audio = activeAudioRef?.current;
    const wasPlaying = Boolean(audio && !audio.paused);
    const wasInternalAutoFlip = pendingAutoFlipRef.current;

    pendingAutoFlipRef.current = false;
    setCurrentPage(nextPage);

    if (wasInternalAutoFlip) return;
    if (!wasPlaying) return;

    restartFromPageRef.current = nextPage;
    cancelCurrentPlayback();

    if (!isAutoPlay) {
      void playSpreadOnce(nextPage);
    }
  };

  const startAutoPlay = async () => {
    if (isAutoPlay) return;

    setIsAudioAutoPlay?.(true);
    setIsAutoPlay(true);
    isStoppingRef.current = false;
    restartFromPageRef.current = null;

    let pageIndex = currentPage;

    while (!isStoppingRef.current) {
      const sessionId = createPlaybackSession();
      await playAudioForSpread(pageIndex, sessionId);

      if (isStoppingRef.current) break;

      if (restartFromPageRef.current !== null) {
        pageIndex = restartFromPageRef.current;
        restartFromPageRef.current = null;
        continue;
      }

      if (pageIndex >= pages.length - 1) break;

      const nextPage = getNextPageForAutoPlay(pageIndex);

      await wait(200);
      if (isStoppingRef.current) break;

      pendingAutoFlipRef.current = true;
      flipBookRef.current?.pageFlip()?.flip(nextPage);
      pageIndex = nextPage;

      await wait(1050);
      if (isStoppingRef.current) break;
    }

    setIsAudioAutoPlay?.(false);
    setIsAutoPlay(false);
    isStoppingRef.current = false;
    restartFromPageRef.current = null;
    clearAutoPlayTimer();
    setIsPlaying?.(false);
  };

  const stopAutoPlay = () => {
    isStoppingRef.current = true;
    restartFromPageRef.current = null;
    setIsAudioAutoPlay?.(false);
    setIsAutoPlay(false);
    cancelCurrentPlayback();
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (error) {
      console.warn("Fullscreen failed:", error);
    }
  };

  const goPrev = () => {
    cancelCurrentPlayback();
    flipBookRef.current?.pageFlip()?.flipPrev();
  };

  const goNext = () => {
    cancelCurrentPlayback();
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const goStart = () => {
    cancelCurrentPlayback();
    flipBookRef.current?.pageFlip()?.flip(0);
  };

  useEffect(() => {
    const updateSize = () => {
      const parentWidth = containerRef.current?.clientWidth || window.innerWidth;
      const stageWidth = Math.min(parentWidth - 80, 1100);

      let pageWidth = stageWidth / 2;
      let pageHeight = pageWidth * PAGE_RATIO;

      const maxHeight = window.innerHeight * 0.6;
      if (pageHeight > maxHeight) {
        pageHeight = maxHeight;
        pageWidth = pageHeight / PAGE_RATIO;
      }

      setBookSize({
        width: Math.floor(pageWidth),
        height: Math.floor(pageHeight),
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      cancelCurrentPlayback();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    pageFlip: () => ({
      flipNext: () => flipBookRef.current?.pageFlip()?.flipNext(),
      flipPrev: () => flipBookRef.current?.pageFlip()?.flipPrev(),
      flip: (page) => flipBookRef.current?.pageFlip()?.flip(page),
    }),
    startAutoPlay,
    stopAutoPlay,
    toggleFullscreen,
    getCurrentPage: () => currentPage,
    getTotalPages: () => pages.length,
    getCurrentStoryText: () => getStoryTextForCurrentView(),
  }));

  return (
    <div
      ref={containerRef}
      className={`flipbook-container ${isFullscreen ? "fullscreen" : ""}`}
    >
      <style>{`
        .flipbook-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          background: #121212;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          color: white;
        }

        .flipbook-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .flipbook-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(to right, #fff, #aaa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .flipbook-stage {
          display: flex;
          justify-content: center;
          align-items: center;
          perspective: 3000px;
          padding: 20px 0;
          min-height: 400px;
        }

        .dialectic-book {
          position: relative;
          box-shadow: 0 30px 100px rgba(0,0,0,0.8);
        }

        .dialectic-book::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 0;
          width: 10px;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.4) 0%,
            rgba(255,255,255,0.1) 50%,
            rgba(0,0,0,0.4) 100%
          );
          transform: translateX(-50%);
          z-index: 100;
          pointer-events: none;
        }

        .page {
          background: #fff;
          overflow: hidden;
        }

        .page-inner {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .page-inner::before {
          content: "";
          position: absolute;
          top: 0;
          width: 60px;
          height: 100%;
          z-index: 10;
          pointer-events: none;
        }

        .page-left .page-inner::before {
          right: 0;
          background: linear-gradient(to left, rgba(0,0,0,0.4) 0%, transparent 100%);
        }

        .page-right .page-inner::before {
          left: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 100%);
        }

        .page-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .flipbook-footer {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .ui-btn {
          padding: 10px 20px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
          backdrop-filter: blur(5px);
        }

        .ui-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
        }

        .ui-btn.active {
          background: #2563eb;
          border-color: #3b82f6;
        }

        .page-indicator {
          background: rgba(37, 99, 235, 0.2);
          color: #60a5fa;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 0.9rem;
          margin-left: 20px;
          display: inline-block;
        }

        .story-card {
          margin-top: 24px;
          padding: 18px 20px;
          border-radius: 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
          line-height: 1.7;
        }

        .story-card-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #60a5fa;
          margin-bottom: 8px;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .flipbook-container {
            padding: 24px 12px;
            border-radius: 18px;
          }

          .flipbook-title {
            font-size: 1.8rem;
          }

          .flipbook-stage {
            min-height: 260px;
            padding: 12px 0;
          }

          .page-indicator {
            margin-left: 0;
            margin-top: 10px;
          }

          .flipbook-footer {
            gap: 10px;
          }

          .ui-btn {
            width: calc(50% - 8px);
            min-width: 140px;
          }
        }
      `}</style>

      {!externalAudioRef && <audio ref={internalAudioRef} preload="auto" />}

      <div className="flipbook-header">
        <h1 className="flipbook-title">Sức Mạnh Từ Sự Đồng Lòng</h1>
        <p style={{ opacity: 0.7 }}>
          Sử dụng nút cuộn hoặc click để lật trang
        </p>
        <span className="page-indicator">{getPageIndicatorText(currentPage)}</span>
      </div>

      <div className="flipbook-stage">
        <HTMLFlipBook
          width={bookSize.width}
          height={bookSize.height}
          size="fixed"
          minWidth={200}
          maxWidth={800}
          minHeight={150}
          maxHeight={600}
          usePortrait={false}
          startPage={0}
          drawShadow={true}
          flippingTime={1000}
          onFlip={handleFlip}
          className="dialectic-book"
          ref={flipBookRef}
          showCover={true}
          maxShadowOpacity={0.5}
        >
          {pages.map((page, index) => (
            <div
              key={index}
              className={`page ${index % 2 === 0 ? "page-right" : "page-left"}`}
            >
              <div className="page-inner">
                <img src={page.src} alt={page.alt} className="page-image" />
              </div>
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      <div className="flipbook-footer">
        <button className="ui-btn" onClick={goPrev}>
          ← Trang trước
        </button>
        <button className="ui-btn" onClick={() => void playSpreadOnce(currentPage)}>
          Phát Audio
        </button>
        <button
          className={`ui-btn ${isAutoPlay ? "active" : ""}`}
          onClick={() => {
            if (isAutoPlay) {
              stopAutoPlay();
            } else {
              void startAutoPlay();
            }
          }}
        >
          {isAutoPlay ? "Dừng tự động" : "Tự động lật + Audio"}
        </button>
        <button className="ui-btn" onClick={goNext}>
          Trang sau →
        </button>
        <button className="ui-btn" onClick={goStart}>
          Về trang đầu
        </button>
        <button className="ui-btn" onClick={toggleFullscreen}>
          {isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
        </button>
      </div>

      <div className="story-card">
        <div className="story-card-label">Nội dung từng trang</div>
        <div>{getStoryTextForCurrentView()}</div>
      </div>
    </div>
  );
});

export default FlipBook;
