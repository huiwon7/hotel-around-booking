import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-wider">HOTEL AROUND</h1>
            <p className="text-[10px] tracking-[0.3em] text-muted-foreground -mt-1">
              PYEONGCHANG
            </p>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://aroundpartners.co.kr"}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              호텔 사이트
            </Link>
            <Button asChild>
              <Link href="/booking">예약하기</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#2d3a2e] via-[#4a7c59] to-[#6b9d78]">
        <div className="text-center text-white px-4">
          <p className="text-sm tracking-[0.4em] mb-4 opacity-80">
            PREMIUM WORKATION IN PYEONGCHANG
          </p>
          <h2 className="text-4xl md:text-5xl font-light leading-tight mb-4">
            산에서 집중,
            <br />
            <span className="font-bold">계곡에서 충전</span>
          </h2>
          <p className="text-sm md:text-base opacity-80 mb-8 max-w-md mx-auto">
            서울에서 1시간 30분, 518개 객실의 신축 호텔에서
            <br />
            당신만의 워케이션을 시작하세요
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-white text-[#2d3a2e] hover:bg-white/90"
            >
              <Link href="/booking">온라인 예약</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white text-white hover:bg-white/10"
            >
              <Link
                href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://aroundpartners.co.kr"}
              >
                자세히 알아보기
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Hotel Around Pyeongchang. All rights reserved.</p>
          <p className="mt-1">
            문의: 02-0000-0000 &middot; around@hotelaround.co.kr
          </p>
        </div>
      </footer>
    </div>
  );
}
