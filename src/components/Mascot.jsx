export default function Mascot({ mood = "happy" }) {
  const oops = mood === "oops";
  const cheer = mood === "cheer";
  return (
    <svg className={`mascot ${mood}`} viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="108" rx="28" ry="6" fill="#E7D3C0" />
      <path d="M18 58c0-28 18-46 42-46s42 18 42 46c0 22-14 40-42 40S18 80 18 58z" fill="#FFFDF8" />
      <path d="M22 46c8-24 22-34 38-34 16 0 30 10 38 34" fill="#FFE08A" />
      <path d="M34 34c6-16 14-22 26-22 12 0 20 6 26 22" fill="#FF8A3D" />
      <circle cx="46" cy="60" r="7" fill="#2B2140" />
      <circle cx="74" cy="60" r="7" fill="#2B2140" />
      <circle cx="48" cy="58" r="2.2" fill="#fff" />
      <circle cx="76" cy="58" r="2.2" fill="#fff" />
      <path d="M56 70h8l-4 7z" fill="#F2547D" />
      {oops ? (
        <path d="M50 84c4 2 8 2 14-2" stroke="#2B2140" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M48 80c6 8 18 8 24 0" stroke="#2B2140" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      <path d="M30 96c8 10 52 10 60 0" stroke="#1FA971" strokeWidth="8" fill="none" strokeLinecap="round" />
      {cheer && <circle cx="96" cy="24" r="8" fill="#FFC83D" />}
      {cheer && <circle cx="18" cy="28" r="5" fill="#7C6BF2" />}
    </svg>
  );
}
