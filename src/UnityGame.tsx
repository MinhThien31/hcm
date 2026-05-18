import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Html, Sphere, Box, Float, Text, Edges, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

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
  | { type: 'START' }
  | { type: 'PLAYING' }
  | { type: 'QUESTION'; question: Question }
  | { type: 'GAMEOVER' }
  | { type: 'VICTORY' };

// QUESTIONS DATA (CHAPTER 5)
const CHAPTER_5_QUESTIONS: Question[] = [
  {
    id: 1, force: 'Nông Dân', color: '#22c55e',
    q: 'Theo Hồ Chí Minh, nền tảng của khối đại đoàn kết toàn dân tộc gồm những lực lượng nào?',
    options: ['Liên minh Công - Nông', 'Liên minh Công - Nông - Trí thức', 'Tầng lớp tư sản và công nhân', 'Tất cả mọi người Việt Nam'],
    ans: 1, pos: [0, 0.5, -10]
  },
  {
    id: 2, force: 'Công Nhân', color: '#3b82f6',
    q: 'Đại đoàn kết toàn dân tộc mang tính chất gì đối với cách mạng Việt Nam?',
    options: ['Là sách lược tạm thời', 'Là vấn đề có ý nghĩa chiến lược', 'Là một chính sách ngoại giao', 'Chỉ áp dụng trong thời chiến'],
    ans: 1, pos: [15, 0.5, -10]
  },
  {
    id: 3, force: 'Trí Thức', color: '#eab308',
    q: 'Mặt trận dân tộc thống nhất phải hoạt động theo nguyên tắc cốt lõi nào?',
    options: ['Tập trung dân chủ', 'Hiệp thương dân chủ', 'Cấp dưới phục tùng cấp trên', 'Đa số phục tùng thiểu số'],
    ans: 1, pos: [15, 0.5, -25]
  },
  {
    id: 4, force: 'Doanh Nhân & Tôn Giáo', color: '#f97316',
    q: 'Trong tư tưởng Bác, điều kiện tiên quyết để xây dựng khối đại đoàn kết là gì?',
    options: ['Lấy lợi ích chung làm điểm quy tụ', 'Phải dựa vào viện trợ quốc tế', 'Phải dùng vũ lực răn đe', 'Phải cào bằng mọi lợi ích'],
    ans: 0, pos: [0, 0.5, -25]
  },
  {
    id: 5, force: 'Quốc Tế', color: '#a855f7',
    q: 'Mục đích tối thượng của việc thực hiện đoàn kết quốc tế là gì?',
    options: ['Mở rộng ranh giới lãnh thổ', 'Kết hợp sức mạnh dân tộc và sức mạnh thời đại', 'Kêu gọi đầu tư nước ngoài', 'Chuyển giao quyền lực'],
    ans: 1, pos: [0, 0.5, -40]
  },
  {
    id: 6, force: 'Thanh Niên', color: '#ef4444',
    q: 'Bác Hồ đã ví lực lượng nào là "người chủ tương lai của nước nhà"?',
    options: ['Phụ nữ', 'Thanh niên', 'Trí thức', 'Lực lượng vũ trang'],
    ans: 1, pos: [-15, 0.5, -40]
  },
  {
    id: 7, force: 'Phụ Nữ', color: '#ec4899',
    q: 'Quan điểm của Bác về vai trò của phụ nữ trong đại đoàn kết là gì?',
    options: ['Chỉ phụ trách hậu phương', 'Công dân hạng hai', 'Không có phụ nữ thì không có cách mạng', 'Không cần thiết'],
    ans: 2, pos: [-15, 0.5, -55]
  },
  {
    id: 8, force: 'Kiều Bào', color: '#14b8a6',
    q: 'Đối với đồng bào Việt Nam sinh sống ở nước ngoài, tư tưởng Hồ Chí Minh khẳng định điều gì?',
    options: ['Là người nước ngoài', 'Là bộ phận không thể tách rời của dân tộc', 'Không có vai trò gì', 'Chỉ cần gửi ngoại tệ về nước'],
    ans: 1, pos: [0, 0.5, -55]
  },
  {
    id: 9, force: 'Dân Tộc Thiểu Số', color: '#8b5cf6',
    q: 'Nguyên tắc nào được Bác đặt ra để giải quyết vấn đề dân tộc thiểu số?',
    options: ['Đồng hóa văn hóa', 'Các dân tộc bình đẳng, đoàn kết, tương trợ', 'Dân tộc đa số áp đặt thiểu số', 'Phân chia lãnh thổ'],
    ans: 1, pos: [0, 0.5, -70]
  },
  {
    id: 10, force: 'Tình Hữu Nghị', color: '#fbbf24',
    q: 'Để đoàn kết quốc tế vững bền, chính sách ngoại giao của Việt Nam theo tư tưởng Bác luôn nhấn mạnh điều gì?',
    options: ['Xung đột quân sự', 'Cạnh tranh kinh tế', 'Hòa bình, hữu nghị, hợp tác', 'Phụ thuộc cường quốc'],
    ans: 2, pos: [15, 0.5, -70]
  }
];

// MAP DATA
const PATHS = [
  { id: 0, box: { minX: -2, maxX: 2, minZ: -12, maxZ: 2 } },
  { id: 1, box: { minX: -2, maxX: 17, minZ: -12, maxZ: -8 } },
  { id: 2, box: { minX: 13, maxX: 17, minZ: -27, maxZ: -8 } },
  { id: 3, box: { minX: -2, maxX: 17, minZ: -27, maxZ: -23 } },
  { id: 4, box: { minX: -2, maxX: 2, minZ: -42, maxZ: -23 } },
  { id: 5, box: { minX: -17, maxX: 2, minZ: -42, maxZ: -38 } },
  { id: 6, box: { minX: -17, maxX: -13, minZ: -57, maxZ: -38 } },
  { id: 7, box: { minX: -17, maxX: 2, minZ: -57, maxZ: -53 } },
  { id: 8, box: { minX: -2, maxX: 2, minZ: -72, maxZ: -53 } },
  { id: 9, box: { minX: -2, maxX: 17, minZ: -72, maxZ: -68 } },
  { id: 10, box: { minX: 5, maxX: 25, minZ: -90, maxZ: -72 } }, // Arena at [15, 0, -81]
];

const PATH_VISUALS: Array<{ pos: Vec3; args: BoxArgs }> = [
  { pos: [0, -0.5, -5], args: [4, 1, 14] },
  { pos: [7.5, -0.5, -10], args: [19, 1, 4] },
  { pos: [15, -0.5, -17.5], args: [4, 1, 19] },
  { pos: [7.5, -0.5, -25], args: [19, 1, 4] },
  { pos: [0, -0.5, -32.5], args: [4, 1, 19] },
  { pos: [-7.5, -0.5, -40], args: [19, 1, 4] },
  { pos: [-15, -0.5, -47.5], args: [4, 1, 19] },
  { pos: [-7.5, -0.5, -55], args: [19, 1, 4] },
  { pos: [0, -0.5, -62.5], args: [4, 1, 19] },
  { pos: [7.5, -0.5, -70], args: [19, 1, 4] },
  { pos: [15, -0.5, -81], args: [20, 1, 18] },
];

function usePlayerControls(): KeyState {
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });
  useEffect(() => {
    const getMovementKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return "";
      }

      return typeof event.key === "string" ? event.key.toLowerCase() : "";
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = getMovementKey(e);
      if (!key) return;

      if (key === 'w' || key === 'arrowup') setKeys(k => ({ ...k, w: true }));
      if (key === 'a' || key === 'arrowleft') setKeys(k => ({ ...k, a: true }));
      if (key === 's' || key === 'arrowdown') setKeys(k => ({ ...k, s: true }));
      if (key === 'd' || key === 'arrowright') setKeys(k => ({ ...k, d: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = getMovementKey(e);
      if (!key) return;

      if (key === 'w' || key === 'arrowup') setKeys(k => ({ ...k, w: false }));
      if (key === 'a' || key === 'arrowleft') setKeys(k => ({ ...k, a: false }));
      if (key === 's' || key === 'arrowdown') setKeys(k => ({ ...k, s: false }));
      if (key === 'd' || key === 'arrowright') setKeys(k => ({ ...k, d: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  return keys;
}

function PlayerCharacter({ keys }: { keys: KeyState }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((state, delta) => {
     const isMoving = keys.w || keys.s || keys.a || keys.d;
     if (isMoving) {
        time.current += delta * 15;
     } else {
        time.current = 0;
        if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.2);
        if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.2);
        if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.2);
        if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.2);
     }

     if (isMoving && groupRef.current) {
        const swing = Math.sin(time.current) * 0.6;
        if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
        if (leftArmRef.current) leftArmRef.current.rotation.x = -swing;
        if (rightArmRef.current) rightArmRef.current.rotation.x = swing;
        
        const dx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
        const dz = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
        if (dx !== 0 || dz !== 0) {
           const targetRotation = Math.atan2(dx, dz);
           let currentRot = groupRef.current.rotation.y;
           // Handle rotation wrap around
           const diff = targetRotation - currentRot;
           const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
           groupRef.current.rotation.y += normalizedDiff * 0.15;
        }
     }
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
       {/* Head */}
       <Box args={[0.4, 0.4, 0.4]} position={[0, 1.4, 0]}>
         <meshStandardMaterial color="#fcd34d" roughness={0.5} />
       </Box>
       {/* Body */}
       <Box args={[0.5, 0.6, 0.3]} position={[0, 0.9, 0]}>
         <meshStandardMaterial color="#ef4444" roughness={0.7} />
         {/* Gold Star on Chest */}
         <Box args={[0.15, 0.15, 0.05]} position={[0, 0, 0.16]}>
            <meshStandardMaterial color="#fcd34d" />
         </Box>
       </Box>
       {/* Left Arm */}
       <group ref={leftArmRef} position={[-0.35, 1.1, 0]}>
         <Box args={[0.15, 0.5, 0.15]} position={[0, -0.2, 0]}>
           <meshStandardMaterial color="#fcd34d" roughness={0.5} />
         </Box>
       </group>
       {/* Right Arm */}
       <group ref={rightArmRef} position={[0.35, 1.1, 0]}>
         <Box args={[0.15, 0.5, 0.15]} position={[0, -0.2, 0]}>
           <meshStandardMaterial color="#fcd34d" roughness={0.5} />
         </Box>
       </group>
       {/* Left Leg */}
       <group ref={leftLegRef} position={[-0.15, 0.6, 0]}>
         <Box args={[0.18, 0.6, 0.18]} position={[0, -0.3, 0]}>
           <meshStandardMaterial color="#1e293b" />
         </Box>
       </group>
       {/* Right Leg */}
       <group ref={rightLegRef} position={[0.15, 0.6, 0]}>
         <Box args={[0.18, 0.6, 0.18]} position={[0, -0.3, 0]}>
           <meshStandardMaterial color="#1e293b" />
         </Box>
       </group>
    </group>
  );
}

function Orbiter({ index, total, color }: { index: number; total: number; color: string }) {
   const ref = useRef<THREE.Mesh>(null);
   useFrame((s, d) => {
      const time = s.clock.elapsedTime;
      const angle = (index / total) * Math.PI * 2 + time * 1.5;
      // Orbit around the body at Y = 0.5
      ref.current?.position.set(Math.cos(angle) * 1.5, 0.5 + Math.sin(time * 3 + index) * 0.3, Math.sin(angle) * 1.5);
   });
   return (
     <mesh ref={ref}>
       <Sphere args={[0.2]}>
         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
       </Sphere>
       <Sparkles count={5} scale={1} size={1} color={color} />
     </mesh>
   )
}

function GameEngine({
  setUiState,
  currentLevel,
  isPaused,
}: {
  setUiState: React.Dispatch<React.SetStateAction<UiState>>;
  currentLevel: number;
  isPaused: boolean;
}) {
  const keys = usePlayerControls();
  const playerRef = useRef<THREE.Group>(null);
  const playerPos = useRef(new THREE.Vector3(0, 0, 0));
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Reset player pos if game resets
  useEffect(() => {
    if (currentLevel === 0 && !isPaused) {
      playerPos.current.set(0, 0, 0);
    }
  }, [currentLevel, isPaused]);

  useFrame((state, delta) => {
    if (isPaused) return;

    // Movement logic
    const speed = 12;
    const newPos = playerPos.current.clone();
    if (keys.w) newPos.z -= speed * delta;
    if (keys.s) newPos.z += speed * delta;
    if (keys.a) newPos.x -= speed * delta;
    if (keys.d) newPos.x += speed * delta;

    let canMove = false;
    for (let i = 0; i <= currentLevel && i < PATHS.length; i++) {
       const box = PATHS[i].box;
       if (newPos.x >= box.minX && newPos.x <= box.maxX && newPos.z >= box.minZ && newPos.z <= box.maxZ) {
         canMove = true;
         break;
       }
    }

    if (canMove) {
      playerPos.current.copy(newPos);
    }

    // Trigger Challenge Logic
    if (currentLevel < CHAPTER_5_QUESTIONS.length) {
      const qNode = CHAPTER_5_QUESTIONS[currentLevel];
      const dist = playerPos.current.distanceTo(new THREE.Vector3(qNode.pos[0], 0, qNode.pos[2]));
      if (dist < 1.5) {
        setUiState({ type: 'QUESTION', question: qNode });
      }
    } else {
      // Victory check
      if (playerPos.current.z < -78) {
        setUiState({ type: 'VICTORY' });
      }
    }

    // Update Player Visuals
    if (playerRef.current) {
      playerRef.current.position.lerp(playerPos.current, 0.3);
    }

    // Camera follow (isometric view)
    const desiredCamPos = new THREE.Vector3(playerPos.current.x, 15, playerPos.current.z + 15);
    state.camera.position.lerp(desiredCamPos, 0.05);
    cameraTarget.current.lerp(playerPos.current, 0.05);
    state.camera.lookAt(cameraTarget.current);
  });

  return (
    <group>
       {/* Player Avatar */}
       <group ref={playerRef}>
         <PlayerCharacter keys={keys} />
         {CHAPTER_5_QUESTIONS.slice(0, currentLevel).map((q, i) => {
            return <Orbiter key={i} index={i} total={currentLevel} color={q.color} />
         })}
       </group>
       
       {/* Maze Paths */}
       {PATH_VISUALS.map((pv, i) => (
          <Box key={i} position={pv.pos} args={pv.args} visible={i <= currentLevel}>
             <meshStandardMaterial color={i === 10 ? '#fcd34d' : '#f8fafc'} roughness={0.8} metalness={0.1} />
             {i <= currentLevel && <Edges color={i === 10 ? "#ef4444" : "#cbd5e1"} opacity={0.5} transparent />}
          </Box>
       ))}

       {/* Challenge Nodes */}
       {CHAPTER_5_QUESTIONS.map((q, i) => (
         i === currentLevel && (
           <Float key={i} speed={3} rotationIntensity={2} floatIntensity={2}>
             <mesh position={q.pos}>
               <octahedronGeometry args={[0.8]} />
               <meshStandardMaterial color={q.color} emissive={q.color} emissiveIntensity={1} wireframe />
               <Html center position={[0, -1.5, 0]}>
                 <div className="bg-black/80 px-3 py-1 rounded border border-white/30 text-white text-xs font-bold whitespace-nowrap shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                   Thử thách: {q.force}
                 </div>
               </Html>
             </mesh>
           </Float>
         )
       ))}

       {/* Final Goal Monument */}
       {currentLevel === 10 && (
         <Float speed={2} rotationIntensity={0} floatIntensity={1}>
           <group position={[15, 2, -81]}>
             <Text fontSize={3} color="#ef4444" anchorY="bottom" position={[0, 3, 0]} outlineWidth={0.1} outlineColor="#facc15">
               ĐẠI ĐOÀN KẾT
             </Text>
             <Sphere args={[2, 32, 32]}>
               <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
             </Sphere>
             <Sparkles count={300} scale={10} size={4} color="#facc15" speed={2} />
           </group>
         </Float>
       )}
    </group>
  )
}

export default function UnityGame() {
  const [uiState, setUiState] = useState<UiState>({ type: 'START' }); 
  const [currentLevel, setCurrentLevel] = useState(0);
  const [health, setHealth] = useState(3);
  const [errorMsg, setErrorMsg] = useState(false);

  const handleAnswer = (index: number) => {
    if (uiState.type !== 'QUESTION') return;

    if (index === uiState.question.ans) {
      setCurrentLevel(l => l + 1);
      setUiState({ type: 'PLAYING' });
      setErrorMsg(false);
    } else {
      setErrorMsg(true);
      setHealth(h => {
        const nextHealth = h - 1;
        if (nextHealth <= 0) {
          setUiState({ type: 'GAMEOVER' });
        }
        return nextHealth;
      });
      setTimeout(() => setErrorMsg(false), 1000);
    }
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setHealth(3);
    setUiState({ type: 'PLAYING' });
  };

  return (
    <div className="w-full h-[600px] relative bg-sky-950 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.2)] focus:outline-none" tabIndex={0}>
      
      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-bold text-amber-500 mb-2 drop-shadow-md uppercase tracking-wider">Hành Trình Đại Đoàn Kết</h2>
        
        {uiState.type === 'PLAYING' && (
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex gap-2 items-center">
              <span className="text-white font-bold text-sm drop-shadow-md">Tiến độ:</span>
              <div className="flex gap-1 flex-wrap max-w-[200px]">
                {CHAPTER_5_QUESTIONS.slice(0, currentLevel).map((q, i) => (
                  <div key={i} className="w-3 h-3 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]" style={{ backgroundColor: q.color }}></div>
                ))}
                {Array.from({ length: CHAPTER_5_QUESTIONS.length - currentLevel }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full border border-white/50 bg-black/20"></div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-white font-bold text-sm drop-shadow-md">Máu:</span>
              <div className="flex gap-1 text-red-500 text-sm drop-shadow-md">
                {Array.from({ length: health }).map((_, i) => <span key={i}>❤️</span>)}
              </div>
            </div>
            <div className="text-white text-xs mt-2 drop-shadow-md font-medium bg-black/30 w-fit px-2 py-1 rounded">W A S D / Mũi Tên để di chuyển</div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {uiState.type === 'QUESTION' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-30 pointer-events-auto p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-slate-900 border-2 rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] transition-colors ${errorMsg ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 'border-amber-500'}`}
            >
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: uiState.question.color }}></div>
                 <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider">Mở Khóa: {uiState.question.force}</h3>
              </div>
              <p className="text-2xl md:text-3xl text-amber-500 font-serif mb-8 leading-snug">{uiState.question.q}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uiState.question.options.map((opt, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleAnswer(idx)}
                    className="p-4 md:p-5 bg-slate-800 hover:bg-amber-500 hover:text-black text-white rounded-xl text-left transition-all font-medium border border-white/10 hover:border-transparent text-sm md:text-base hover:scale-105"
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </button>
                ))}
              </div>
              {errorMsg && <p className="text-red-500 mt-4 font-bold text-center animate-pulse">Sai rồi! Bạn vừa mất 1 ❤️</p>}
            </motion.div>
          </div>
        )}

        {(uiState.type === 'START' || uiState.type === 'GAMEOVER' || uiState.type === 'VICTORY') && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 pointer-events-auto">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-900 border-2 border-amber-500 p-8 md:p-10 rounded-2xl max-w-xl text-center shadow-[0_0_50px_rgba(245,158,11,0.3)]">
              {uiState.type === 'START' && (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-amber-500 mb-6 uppercase">Hành Trình Đại Đoàn Kết</h1>
                  <p className="text-white/90 mb-8 text-base md:text-lg leading-relaxed text-left">
                    Đây là một tựa game nhập vai giải đố 3D có 1-0-2!<br/><br/>
                    🎮 <strong>Cách chơi:</strong><br/>
                    - Nhấp chuột vào màn hình game. Sử dụng phím <strong>W, A, S, D</strong> hoặc <strong>Mũi Tên</strong> để điều khiển nhân vật.<br/>
                    - Đi đến các khối Thử Thách để trả lời <strong>10 câu hỏi</strong> về Tư tưởng Hồ Chí Minh (Chương 5).<br/>
                    - Trả lời đúng để mở đường đi tiếp và thu thập lực lượng.<br/>
                    - Trả lời sai sẽ bị trừ máu. Hết 3 ❤️ bạn sẽ Game Over!<br/>
                  </p>
                </>
              )}
              {uiState.type === 'GAMEOVER' && (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-red-500 mb-6 uppercase">Thất Bại</h1>
                  <p className="text-white/90 mb-8 text-lg">Bạn đã cạn kiệt sinh lực. Khối đại đoàn kết không thể hình thành nếu thiếu đi kiến thức vững chắc.</p>
                </>
              )}
              {uiState.type === 'VICTORY' && (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-amber-500 mb-6 uppercase">Thành Công Vang Dội!</h1>
                  <p className="text-white/90 mb-8 text-lg">Bạn đã xuất sắc vượt qua cả 10 thử thách, tập hợp đủ mọi tầng lớp nhân dân và thấu hiểu triết lý Đại đoàn kết của Bác Hồ!</p>
                </>
              )}
              <button 
                onClick={resetGame}
                className="px-8 py-3 md:px-10 md:py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xl md:text-2xl transition-transform hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
              >
                {uiState.type === 'START' ? 'Bắt Đầu Hành Trình' : 'Chơi Lại'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Canvas camera={{ position: [0, 15, 15], fov: 40 }}>
        {/* Sky Background */}
        <Sky sunPosition={[100, 20, 100]} inclination={0.2} azimuth={0.25} turbidity={0.5} rayleigh={1.5} />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

        <ambientLight intensity={0.7} />
        <pointLight position={[0, 10, 0]} intensity={1.5} color="#ffffff" />
        
        <GameEngine setUiState={setUiState} currentLevel={currentLevel} isPaused={uiState.type !== 'PLAYING'} />
        
        <Sparkles count={300} scale={50} size={2} color="#ffffff" opacity={0.3} speed={0.2} />
      </Canvas>
    </div>
  );
}
