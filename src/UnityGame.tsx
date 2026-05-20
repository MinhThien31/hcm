import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Box,
  Edges,
  Float,
  Html,
  Sky,
  Sparkles,
  Sphere,
  Stars,
  Text,
} from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import * as THREE from "three";

type Vec3 = [number, number, number];
type BoxArgs = [number, number, number];
type KeyState = { w: boolean; a: boolean; s: boolean; d: boolean };

type Question = {
  id: number;
  force: string;
  color: string;
  q: string;
  options: string[];
  ans: number;
  pos: Vec3;
};

type UiState =
  | { type: "START" }
  | { type: "PLAYING" }
  | { type: "QUESTION"; question: Question }
  | { type: "GAMEOVER" }
  | { type: "VICTORY" };

const QUESTIONS: Question[] = [
  {
    id: 1,
    force: "Nông dân",
    color: "#3E8E6C",
    q: "Theo Hồ Chí Minh, nền tảng của khối đại đoàn kết toàn dân tộc gồm những lực lượng nào?",
    options: [
      "Liên minh công nhân - nông dân",
      "Liên minh công nhân - nông dân - trí thức",
      "Tầng lớp tư sản và công nhân",
      "Chỉ những người cùng một tôn giáo",
    ],
    ans: 1,
    pos: [0, 0.55, -10],
  },
  {
    id: 2,
    force: "Công nhân",
    color: "#D64933",
    q: "Đại đoàn kết toàn dân tộc có ý nghĩa như thế nào đối với cách mạng Việt Nam?",
    options: [
      "Là sách lược tạm thời",
      "Là vấn đề có ý nghĩa chiến lược",
      "Chỉ là khẩu hiệu tuyên truyền",
      "Chỉ áp dụng trong thời bình",
    ],
    ans: 1,
    pos: [15, 0.55, -10],
  },
  {
    id: 3,
    force: "Trí thức",
    color: "#E7B10A",
    q: "Mặt trận dân tộc thống nhất phải hoạt động theo nguyên tắc cốt lõi nào?",
    options: [
      "Hiệp thương dân chủ",
      "Mệnh lệnh một chiều",
      "Cấp dưới phục tùng tuyệt đối",
      "Đặt lợi ích cá nhân lên trước",
    ],
    ans: 0,
    pos: [15, 0.55, -25],
  },
  {
    id: 4,
    force: "Tôn giáo và doanh nhân",
    color: "#6D597A",
    q: "Điều kiện quan trọng để xây dựng khối đại đoàn kết là gì?",
    options: [
      "Lấy lợi ích chung làm điểm quy tụ",
      "Xóa bỏ mọi khác biệt bằng áp đặt",
      "Dựa hoàn toàn vào viện trợ bên ngoài",
      "Chỉ đoàn kết trong một nhóm nhỏ",
    ],
    ans: 0,
    pos: [0, 0.55, -25],
  },
  {
    id: 5,
    force: "Quốc tế",
    color: "#277DA1",
    q: "Mục đích của đoàn kết quốc tế trong tư tưởng Hồ Chí Minh là gì?",
    options: [
      "Mở rộng lãnh thổ",
      "Kết hợp sức mạnh dân tộc với sức mạnh thời đại",
      "Phụ thuộc vào cường quốc",
      "Thay thế sức mạnh trong nước",
    ],
    ans: 1,
    pos: [0, 0.55, -40],
  },
  {
    id: 6,
    force: "Thanh niên",
    color: "#2A9D8F",
    q: "Hồ Chí Minh từng nhấn mạnh lực lượng nào là người chủ tương lai của nước nhà?",
    options: ["Phụ nữ", "Thanh niên", "Kiều bào", "Doanh nhân"],
    ans: 1,
    pos: [-15, 0.55, -40],
  },
  {
    id: 7,
    force: "Phụ nữ",
    color: "#A23E72",
    q: "Quan điểm đúng về vai trò của phụ nữ trong đại đoàn kết là gì?",
    options: [
      "Chỉ phụ trách hậu phương",
      "Không có vai trò chính trị",
      "Là lực lượng quan trọng của cách mạng",
      "Chỉ tham gia khi được yêu cầu",
    ],
    ans: 2,
    pos: [-15, 0.55, -55],
  },
  {
    id: 8,
    force: "Kiều bào",
    color: "#F4A261",
    q: "Đồng bào Việt Nam ở nước ngoài được nhìn nhận như thế nào?",
    options: [
      "Là bộ phận không thể tách rời của dân tộc",
      "Không còn liên quan đến dân tộc",
      "Chỉ có vai trò kinh tế",
      "Chỉ tham gia khi có chiến tranh",
    ],
    ans: 0,
    pos: [0, 0.55, -55],
  },
  {
    id: 9,
    force: "Dân tộc thiểu số",
    color: "#577590",
    q: "Nguyên tắc giải quyết vấn đề dân tộc theo tư tưởng Hồ Chí Minh là gì?",
    options: [
      "Đồng hóa văn hóa",
      "Bình đẳng, đoàn kết, tương trợ",
      "Dân tộc đa số áp đặt thiểu số",
      "Tách rời cộng đồng dân tộc",
    ],
    ans: 1,
    pos: [0, 0.55, -70],
  },
  {
    id: 10,
    force: "Hòa bình hữu nghị",
    color: "#F4D35E",
    q: "Đối ngoại theo tư tưởng Hồ Chí Minh nhấn mạnh tinh thần nào?",
    options: [
      "Xung đột quân sự",
      "Biệt lập với thế giới",
      "Hòa bình, hữu nghị, hợp tác",
      "Phụ thuộc vào bên ngoài",
    ],
    ans: 2,
    pos: [15, 0.55, -70],
  },
];

const PATHS = [
  { minX: -2, maxX: 2, minZ: -12, maxZ: 2 },
  { minX: -2, maxX: 17, minZ: -12, maxZ: -8 },
  { minX: 13, maxX: 17, minZ: -27, maxZ: -8 },
  { minX: -2, maxX: 17, minZ: -27, maxZ: -23 },
  { minX: -2, maxX: 2, minZ: -42, maxZ: -23 },
  { minX: -17, maxX: 2, minZ: -42, maxZ: -38 },
  { minX: -17, maxX: -13, minZ: -57, maxZ: -38 },
  { minX: -17, maxX: 2, minZ: -57, maxZ: -53 },
  { minX: -2, maxX: 2, minZ: -72, maxZ: -53 },
  { minX: -2, maxX: 17, minZ: -72, maxZ: -68 },
  { minX: 5, maxX: 25, minZ: -90, maxZ: -72 },
];

const PATH_VISUALS: Array<{ pos: Vec3; args: BoxArgs }> = [
  { pos: [0, -0.5, -5], args: [4, 0.9, 14] },
  { pos: [7.5, -0.5, -10], args: [19, 0.9, 4] },
  { pos: [15, -0.5, -17.5], args: [4, 0.9, 19] },
  { pos: [7.5, -0.5, -25], args: [19, 0.9, 4] },
  { pos: [0, -0.5, -32.5], args: [4, 0.9, 19] },
  { pos: [-7.5, -0.5, -40], args: [19, 0.9, 4] },
  { pos: [-15, -0.5, -47.5], args: [4, 0.9, 19] },
  { pos: [-7.5, -0.5, -55], args: [19, 0.9, 4] },
  { pos: [0, -0.5, -62.5], args: [4, 0.9, 19] },
  { pos: [7.5, -0.5, -70], args: [19, 0.9, 4] },
  { pos: [15, -0.5, -81], args: [20, 0.9, 18] },
];

function usePlayerControls(): KeyState {
  const [keys, setKeys] = useState<KeyState>({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  useEffect(() => {
    const readKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return "";
      }
      return event.key.toLowerCase();
    };

    const setMovement = (event: KeyboardEvent, active: boolean) => {
      const key = readKey(event);
      if (!key) return;

      if (key === "w" || key === "arrowup") {
        setKeys((value) => ({ ...value, w: active }));
      }
      if (key === "a" || key === "arrowleft") {
        setKeys((value) => ({ ...value, a: active }));
      }
      if (key === "s" || key === "arrowdown") {
        setKeys((value) => ({ ...value, s: active }));
      }
      if (key === "d" || key === "arrowright") {
        setKeys((value) => ({ ...value, d: active }));
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => setMovement(event, true);
    const handleKeyUp = (event: KeyboardEvent) => setMovement(event, false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keys;
}

function PlayerCharacter({ keys }: { keys: KeyState }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    const isMoving = keys.w || keys.a || keys.s || keys.d;

    if (isMoving) {
      timeRef.current += delta * 12;
      const swing = Math.sin(timeRef.current) * 0.45;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;

      const dx = Number(keys.d) - Number(keys.a);
      const dz = Number(keys.s) - Number(keys.w);
      if (groupRef.current && (dx !== 0 || dz !== 0)) {
        const targetRotation = Math.atan2(dx, dz);
        const diff = targetRotation - groupRef.current.rotation.y;
        groupRef.current.rotation.y += Math.atan2(Math.sin(diff), Math.cos(diff)) * 0.18;
      }
    } else {
      timeRef.current = 0;
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.82;
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.82;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.35, 0]}>
      <Box args={[0.46, 0.46, 0.46]} position={[0, 1.42, 0]}>
        <meshStandardMaterial color="#F2C078" roughness={0.55} />
      </Box>
      <Box args={[0.6, 0.7, 0.34]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#D64933" roughness={0.72} />
      </Box>
      <Box args={[0.18, 0.18, 0.05]} position={[0, 0.94, 0.2]}>
        <meshStandardMaterial color="#F4D35E" emissive="#F4D35E" emissiveIntensity={0.6} />
      </Box>
      <group ref={leftLegRef} position={[-0.16, 0.55, 0]}>
        <Box args={[0.18, 0.58, 0.18]} position={[0, -0.28, 0]}>
          <meshStandardMaterial color="#1F2421" />
        </Box>
      </group>
      <group ref={rightLegRef} position={[0.16, 0.55, 0]}>
        <Box args={[0.18, 0.58, 0.18]} position={[0, -0.28, 0]}>
          <meshStandardMaterial color="#1F2421" />
        </Box>
      </group>
      <Box args={[0.18, 0.54, 0.18]} position={[-0.42, 0.95, 0]}>
        <meshStandardMaterial color="#F2C078" roughness={0.55} />
      </Box>
      <Box args={[0.18, 0.54, 0.18]} position={[0.42, 0.95, 0]}>
        <meshStandardMaterial color="#F2C078" roughness={0.55} />
      </Box>
    </group>
  );
}

function OrbitBadge({
  index,
  total,
  color,
}: {
  index: number;
  total: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const angle = (index / total) * Math.PI * 2 + state.clock.elapsedTime * 1.2;
    ref.current?.position.set(
      Math.cos(angle) * 1.35,
      0.65 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.18,
      Math.sin(angle) * 1.35,
    );
  });

  return (
    <mesh ref={ref}>
      <Sphere args={[0.16, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
      </Sphere>
    </mesh>
  );
}

function GameEngine({
  currentLevel,
  isPaused,
  setUiState,
}: {
  currentLevel: number;
  isPaused: boolean;
  setUiState: React.Dispatch<React.SetStateAction<UiState>>;
}) {
  const keys = usePlayerControls();
  const playerRef = useRef<THREE.Group>(null);
  const playerPos = useRef(new THREE.Vector3(0, 0, 0));
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (currentLevel === 0) {
      playerPos.current.set(0, 0, 0);
    }
  }, [currentLevel]);

  useFrame((state, delta) => {
    if (isPaused) return;

    const speed = 11;
    const nextPos = playerPos.current.clone();
    if (keys.w) nextPos.z -= speed * delta;
    if (keys.s) nextPos.z += speed * delta;
    if (keys.a) nextPos.x -= speed * delta;
    if (keys.d) nextPos.x += speed * delta;

    const canMove = PATHS.slice(0, currentLevel + 1).some(
      (path) =>
        nextPos.x >= path.minX &&
        nextPos.x <= path.maxX &&
        nextPos.z >= path.minZ &&
        nextPos.z <= path.maxZ,
    );

    if (canMove) {
      playerPos.current.copy(nextPos);
    }

    if (currentLevel < QUESTIONS.length) {
      const question = QUESTIONS[currentLevel];
      const distance = playerPos.current.distanceTo(
        new THREE.Vector3(question.pos[0], 0, question.pos[2]),
      );
      if (distance < 1.45) {
        setUiState({ type: "QUESTION", question });
      }
    } else if (playerPos.current.z < -78) {
      setUiState({ type: "VICTORY" });
    }

    playerRef.current?.position.lerp(playerPos.current, 0.32);

    const desiredCamera = new THREE.Vector3(
      playerPos.current.x,
      14,
      playerPos.current.z + 15,
    );
    state.camera.position.lerp(desiredCamera, 0.055);
    cameraTarget.current.lerp(playerPos.current, 0.06);
    state.camera.lookAt(cameraTarget.current);
  });

  return (
    <group>
      <group ref={playerRef}>
        <PlayerCharacter keys={keys} />
        {QUESTIONS.slice(0, currentLevel).map((question, index) => (
          <OrbitBadge
            key={question.id}
            index={index}
            total={Math.max(currentLevel, 1)}
            color={question.color}
          />
        ))}
      </group>

      {PATH_VISUALS.map((path, index) => (
        <Box key={index} position={path.pos} args={path.args} visible={index <= currentLevel}>
          <meshStandardMaterial
            color={index === 10 ? "#F4D35E" : "#F7F2EA"}
            roughness={0.82}
            metalness={0.08}
          />
          <Edges color={index === 10 ? "#D64933" : "#3E8E6C"} opacity={0.5} transparent />
        </Box>
      ))}

      {QUESTIONS.map((question, index) =>
        index === currentLevel ? (
          <Float key={question.id} speed={2.6} rotationIntensity={1.5} floatIntensity={1.3}>
            <mesh position={question.pos}>
              <octahedronGeometry args={[0.82]} />
              <meshStandardMaterial
                color={question.color}
                emissive={question.color}
                emissiveIntensity={1.3}
                wireframe
              />
              <Html center position={[0, -1.55, 0]}>
                <div className="whitespace-nowrap rounded-lg border border-white/20 bg-[#1F2421]/88 px-3 py-2 text-xs font-bold text-white shadow-xl backdrop-blur">
                  Thử thách: {question.force}
                </div>
              </Html>
            </mesh>
          </Float>
        ) : null,
      )}

      {currentLevel === QUESTIONS.length && (
        <Float speed={1.8} rotationIntensity={0.1} floatIntensity={0.8}>
          <group position={[15, 2, -81]}>
            <Text
              fontSize={2.4}
              color="#F4D35E"
              anchorY="bottom"
              position={[0, 3.2, 0]}
              outlineWidth={0.05}
              outlineColor="#1F2421"
            >
              ĐẠI ĐOÀN KẾT
            </Text>
            <Sphere args={[2, 32, 32]}>
              <meshStandardMaterial color="#D64933" emissive="#D64933" emissiveIntensity={1.2} />
            </Sphere>
            <Sparkles count={240} scale={9} size={3.2} color="#F4D35E" speed={1.4} />
          </group>
        </Float>
      )}
    </group>
  );
}

export default function UnityGame() {
  const [uiState, setUiState] = useState<UiState>({ type: "START" });
  const [currentLevel, setCurrentLevel] = useState(0);
  const [health, setHealth] = useState(3);
  const [errorMsg, setErrorMsg] = useState(false);

  const progressPercent = Math.round((currentLevel / QUESTIONS.length) * 100);

  const handleAnswer = (answerIndex: number) => {
    if (uiState.type !== "QUESTION") return;

    if (answerIndex === uiState.question.ans) {
      setCurrentLevel((value) => value + 1);
      setUiState({ type: "PLAYING" });
      setErrorMsg(false);
      return;
    }

    setErrorMsg(true);
    setHealth((value) => {
      const nextValue = value - 1;
      if (nextValue <= 0) {
        setUiState({ type: "GAMEOVER" });
      }
      return nextValue;
    });
    window.setTimeout(() => setErrorMsg(false), 900);
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setHealth(3);
    setErrorMsg(false);
    setUiState({ type: "PLAYING" });
  };

  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-lg bg-[#1F2421] outline-none">
      <div className="pointer-events-none absolute left-4 right-4 top-4 z-10 flex flex-col gap-3 md:left-5 md:right-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md rounded-lg border border-white/12 bg-[#1F2421]/76 p-4 text-white shadow-xl backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F4D35E]">
              Chapter 5 Quest
            </p>
            <h3 className="mt-2 text-2xl font-black leading-tight">
              Hành trình Đại đoàn kết
            </h3>
            {uiState.type === "PLAYING" && (
              <p className="mt-2 text-sm leading-6 text-white/72">
                Dùng W A S D hoặc phím mũi tên để di chuyển đến điểm sáng.
              </p>
            )}
          </div>

          {uiState.type === "PLAYING" && (
            <div className="rounded-lg border border-white/12 bg-[#F7F2EA]/92 p-4 text-[#1F2421] shadow-xl backdrop-blur md:w-72">
              <div className="flex items-center justify-between text-sm font-black">
                <span>Tiến độ</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full bg-[#D64933] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-[#607069]">Sinh lực</span>
                <div className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <span
                      key={index}
                      className={`h-3 w-8 rounded-full ${
                        index < health ? "bg-[#3E8E6C]" : "bg-black/12"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {uiState.type === "QUESTION" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#1F2421]/72 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className={`w-full max-w-3xl rounded-lg border bg-[#F7F2EA] p-5 shadow-2xl md:p-7 ${
                errorMsg ? "border-[#D64933]" : "border-black/10"
              }`}
            >
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="h-12 w-2 rounded-full"
                  style={{ backgroundColor: uiState.question.color }}
                />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#607069]">
                    Mở khóa lực lượng
                  </p>
                  <h3 className="text-2xl font-black text-[#1F2421]">
                    {uiState.question.force}
                  </h3>
                </div>
              </div>

              <p className="text-xl font-black leading-8 text-[#1F2421] md:text-2xl">
                {uiState.question.q}
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {uiState.question.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAnswer(index)}
                    className="rounded-lg border border-black/10 bg-white p-4 text-left text-sm font-semibold leading-6 text-[#1F2421] transition hover:border-[#D64933]/40 hover:bg-[#FFF8E3]"
                  >
                    <span className="mr-2 font-black text-[#D64933]">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>

              {errorMsg && (
                <p className="mt-4 rounded-lg bg-[#D64933]/10 px-4 py-3 text-center text-sm font-bold text-[#B83A2A]">
                  Chưa đúng. Hãy đọc kỹ ý chính rồi chọn lại.
                </p>
              )}
            </motion.div>
          </div>
        )}

        {(uiState.type === "START" ||
          uiState.type === "GAMEOVER" ||
          uiState.type === "VICTORY") && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#1F2421]/74 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 26 }}
              className="w-full max-w-2xl rounded-lg border border-white/12 bg-[#F7F2EA] p-6 text-center shadow-2xl md:p-9"
            >
              {uiState.type === "START" && (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D64933]">
                    10 câu hỏi Chapter 5
                  </p>
                  <h2 className="mt-3 text-4xl font-black tracking-tight text-[#1F2421] md:text-5xl">
                    Tập hợp lực lượng đoàn kết
                  </h2>
                  <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#607069]">
                    Vượt qua từng thử thách để hiểu các ý chính: nền tảng công
                    - nông - trí thức, Mặt trận dân tộc thống nhất, nguyên tắc
                    hiệp thương dân chủ và đoàn kết quốc tế.
                  </p>
                </>
              )}

              {uiState.type === "GAMEOVER" && (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D64933]">
                    Chưa hoàn thành
                  </p>
                  <h2 className="mt-3 text-4xl font-black tracking-tight text-[#1F2421] md:text-5xl">
                    Cần củng cố kiến thức
                  </h2>
                  <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#607069]">
                    Một khối đoàn kết bền vững cần hiểu đúng lợi ích chung,
                    lực lượng nền tảng và nguyên tắc tổ chức.
                  </p>
                </>
              )}

              {uiState.type === "VICTORY" && (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#3E8E6C]">
                    Hoàn thành Chapter 5
                  </p>
                  <h2 className="mt-3 text-4xl font-black tracking-tight text-[#1F2421] md:text-5xl">
                    Đại đoàn kết đã được mở khóa
                  </h2>
                  <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#607069]">
                    Bạn đã đi qua đủ 10 điểm kiến thức, nắm được tinh thần cốt
                    lõi của đại đoàn kết toàn dân tộc và đoàn kết quốc tế.
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={resetGame}
                className="mt-8 rounded-lg bg-[#D64933] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#B83A2A]"
              >
                {uiState.type === "START" ? "Bắt đầu hành trình" : "Chơi lại"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Canvas camera={{ position: [0, 14, 15], fov: 42 }}>
        <Sky
          sunPosition={[60, 22, 80]}
          inclination={0.28}
          azimuth={0.22}
          turbidity={0.8}
          rayleigh={1.1}
        />
        <Stars radius={90} depth={45} count={1600} factor={3.4} saturation={0} fade speed={0.8} />
        <ambientLight intensity={0.65} />
        <pointLight position={[0, 12, 0]} intensity={1.35} color="#fff8e8" />
        <pointLight position={[18, 8, -55]} intensity={1.4} color="#F4D35E" />
        <GameEngine
          setUiState={setUiState}
          currentLevel={currentLevel}
          isPaused={uiState.type !== "PLAYING"}
        />
        <Sparkles count={220} scale={54} size={1.5} color="#F4D35E" opacity={0.22} speed={0.18} />
      </Canvas>
    </div>
  );
}
