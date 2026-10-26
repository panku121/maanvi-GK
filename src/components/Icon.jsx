export default function Icon({ value }) {
  if (value === "🇮🇳") {
    return (
      <svg className="flag" viewBox="0 0 60 40" aria-hidden="true">
        <rect width="60" height="13.34" fill="#FF9933" />
        <rect y="13.34" width="60" height="13.32" fill="#FFFFFF" />
        <rect y="26.66" width="60" height="13.34" fill="#138808" />
        <circle cx="30" cy="20" r="4.4" fill="none" stroke="#000080" strokeWidth="1.2" />
      </svg>
    );
  }
  return <span className="emoji">{value}</span>;
}
