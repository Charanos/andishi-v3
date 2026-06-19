export function NairobiOrbit() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-x-0 bottom-0 h-full w-full text-[var(--outline)] opacity-70"
        viewBox="0 0 720 460"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M42 356c84-52 157-73 251-67 130 8 190 62 344 28"
          stroke="currentColor"
          strokeOpacity=".22"
        />
        <path
          d="M103 373c106-44 205-52 320-27 69 15 119 12 190-12"
          stroke="currentColor"
          strokeOpacity=".18"
        />
        <path d="M167 312v-80h45v80M236 312V172h56v140M320 312V96h45v216M385 312V142h59v170M469 312V206h42v106M535 312V238h58v74" stroke="currentColor" strokeOpacity=".5" />
        <path d="M339 96l4-42 5 42M338 58h12M338 74h12M329 126h30M329 154h30M329 182h30M329 210h30M329 238h30" stroke="currentColor" strokeOpacity=".42" />
        <path d="M87 333l53-36 59 36M115 318v-36h41v36M575 333l52-39 47 39M604 315v-31h38v31" stroke="currentColor" strokeOpacity=".32" />
        <path d="M68 374h584" stroke="currentColor" strokeOpacity=".28" />
        <path d="M137 221l48-61 62 22 51-58 76 24 66-70 68 53 74-35" stroke="currentColor" strokeOpacity=".13" />
        {[137, 185, 247, 298, 374, 440, 508, 582].map((cx, index) => (
          <circle key={cx} cx={cx} cy={[221, 160, 182, 124, 148, 78, 131, 96][index]} r="3.5" fill="currentColor" opacity=".35" />
        ))}
      </svg>
      <div className="absolute left-8 top-10 h-52 w-80 rounded-full border border-[color-mix(in_srgb,var(--secondary)_18%,transparent)]" />
      <div className="orbital-ring absolute bottom-16 right-6 h-72 w-[28rem]" />
      <div className="absolute bottom-0 left-1/2 h-40 w-80 -translate-x-1/2 bg-[color-mix(in_srgb,var(--secondary)_12%,transparent)] blur-3xl" />
    </div>
  );
}
