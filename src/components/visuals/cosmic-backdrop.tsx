export function CosmicBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="cosmic-field absolute inset-0" />
      <div className="absolute -left-24 top-24 h-[34rem] w-[34rem] rounded-full bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] blur-[120px]" />
      <div className="absolute -right-24 top-[30rem] h-[38rem] w-[38rem] rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] blur-[140px]" />
      <div className="absolute left-1/2 top-[68rem] h-[26rem] w-[58rem] -translate-x-1/2 rounded-[999px] border border-[color-mix(in_srgb,var(--secondary)_14%,transparent)] opacity-50" />
      <svg className="absolute inset-x-0 top-0 h-[96rem] w-full text-[var(--outline)] opacity-45" viewBox="0 0 1440 1536" fill="none">
        <path d="M-136 422C128 254 390 237 651 371c316 162 579 128 925-129" stroke="currentColor" strokeOpacity=".18" />
        <path d="M-88 913c280-180 545-194 794-41 297 182 548 160 814-62" stroke="currentColor" strokeOpacity=".14" />
        <path d="M180 138c84 76 167 112 251 108 97-5 193-64 291-176" stroke="currentColor" strokeOpacity=".13" />
        <path d="M835 1183c113-100 229-140 349-121 93 15 187 67 282 156" stroke="currentColor" strokeOpacity=".13" />
        {[
          [172, 254],
          [302, 203],
          [514, 268],
          [734, 368],
          [985, 321],
          [1188, 236],
          [224, 955],
          [468, 837],
          [704, 904],
          [948, 924],
          [1210, 829],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="currentColor" opacity=".28" />
        ))}
      </svg>
    </div>
  );
}
