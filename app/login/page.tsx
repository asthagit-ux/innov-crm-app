import Image from 'next/image';
import { LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', width: '100%', backgroundColor: '#f5f5f5' }}>
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>

        {/* ── Left panel ── */}
        <div style={{
          flex: 1,
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative',
        }}>
          {/* Logo */}
          <div style={{ position: 'absolute', top: '1.25rem', left: '2rem', zIndex: 10 }}>
            <Image
              src="/logo.png"
              alt="Innov CRM"
              width={160}
              height={60}
              style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
              priority
            />
          </div>

          {/* Form content */}
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <LoginForm />
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{
          flex: 1,
          backgroundImage: "url('/login-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden',
        }}
          className="hidden md:flex"
        >
          {/* Dark overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(31,41,55,0.5) 0%, rgba(17,24,39,0.5) 100%)',
            zIndex: 0,
          }} />
          {/* Subtle grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`,
            opacity: 0.2, zIndex: 0,
          }} />

          {/* Promo content — centered */}
          <div style={{ position: 'relative', zIndex: 1, color: '#ffffff', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.2 }}>
              Where all leads have higher chances of conversion.
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#d1d5db', lineHeight: 1.6 }}>
              Manage leads, track follow-ups, and close deals — all in one place.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
