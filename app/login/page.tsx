import Image from 'next/image';
import { LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full">

      {/* ── Left / form panel ── */}
      <div className="relative flex w-full flex-col md:w-2/5 md:bg-white lg:w-[42%]">

        {/* Mobile background: dark gradient + golden glow (hidden on md+) */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background: 'linear-gradient(155deg, #0c0c0c 0%, #111111 40%, #18130a 75%, #0a0a0a 100%)',
          }}
        />
        {/* Golden radial glow — gives depth and warmth */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background: 'radial-gradient(ellipse at 20% 65%, rgba(202,148,20,0.22) 0%, transparent 55%)',
          }}
        />
        {/* Subtle top vignette */}
        <div
          className="absolute inset-x-0 top-0 h-48 md:hidden"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 100%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 px-6 pt-8 sm:px-8 md:px-10">
          <Image
            src="/logo.png"
            alt="Innov CRM"
            width={140}
            height={52}
            style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
            className="brightness-0 invert md:brightness-100 md:invert-0"
            priority
          />
        </div>

        {/* Center block: tagline (mobile) + form card */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 md:items-center md:px-10">

          {/* Tagline — mobile only, sits above the card */}
          <div className="mb-5 md:hidden">
            <div className="mb-3 h-px w-10 rounded-full bg-yellow-500/60" />
            <p className="text-2xl font-bold leading-snug text-white sm:text-3xl">
              Where all leads<br />convert.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              Manage leads, track follow-ups, and close deals.
            </p>
          </div>

          {/* Form card (mobile) / plain form (desktop) */}
          <div className="w-full rounded-2xl bg-white px-6 py-7 shadow-2xl shadow-black/40 md:max-w-sm md:rounded-none md:bg-transparent md:px-0 md:py-0 md:shadow-none">
            <LoginForm />
          </div>

        </div>
      </div>

      {/* ── Right image panel (desktop only) ── */}
      <div
        className="hidden md:flex md:flex-1 md:flex-col md:items-center md:justify-center md:relative md:overflow-hidden md:p-14"
        style={{
          backgroundImage: "url('/login-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/50 to-black/65" />
        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-5 h-1 w-12 rounded-full bg-yellow-500/80" />
          <h2 className="text-4xl font-bold leading-snug xl:text-5xl">
            Where all leads have higher chances of conversion.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            Manage leads, track follow-ups, and close deals — all in one place.
          </p>
        </div>
      </div>

    </div>
  );
}
