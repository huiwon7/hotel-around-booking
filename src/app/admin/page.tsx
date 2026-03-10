"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface Reservation {
  id: string;
  reservationNo: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  specialRequests: string | null;
  guest: { name: string; email: string; phone: string; company: string | null };
  roomType: { nameKo: string; code: string };
  package: { nameKo: string; code: string } | null;
}

const statusLabels: Record<string, string> = {
  PENDING: "대기",
  CONFIRMED: "확정",
  CANCELLED: "취소",
  CHECKED_IN: "체크인",
  CHECKED_OUT: "체크아웃",
  NO_SHOW: "노쇼",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  CHECKED_IN: "secondary",
  CHECKED_OUT: "secondary",
  NO_SHOW: "destructive",
};

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("limit", "50");

    const res = await fetch(`/api/reservations?${params}`);
    const data = await res.json();
    setReservations(data.data || []);
    setTotal(data.pagination?.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchReservations();
    setSelectedRes(null);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ko-KR").format(price);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const filtered = reservations.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.reservationNo.toLowerCase().includes(s) ||
      r.guest.name.toLowerCase().includes(s) ||
      r.guest.phone.includes(s)
    );
  });

  // Stats
  const pendingCount = reservations.filter((r) => r.status === "PENDING").length;
  const confirmedCount = reservations.filter((r) => r.status === "CONFIRMED").length;
  const todayCheckIn = reservations.filter((r) => {
    const today = new Date().toISOString().split("T")[0];
    return r.checkIn.startsWith(today) && r.status === "CONFIRMED";
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-bold">관리자 대시보드</h1>
            <Badge variant="outline">HOTEL AROUND</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={fetchReservations}>
              새로고침
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">사이트 보기</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-sm text-muted-foreground">전체 예약</p>
              <p className="text-2xl font-bold">{total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-sm text-muted-foreground">대기 중</p>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-sm text-muted-foreground">확정</p>
              <p className="text-2xl font-bold text-primary">{confirmedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-sm text-muted-foreground">오늘 체크인</p>
              <p className="text-2xl font-bold">{todayCheckIn}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="예약번호, 이름, 연락처 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-80"
          />
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="PENDING">대기</SelectItem>
              <SelectItem value="CONFIRMED">확정</SelectItem>
              <SelectItem value="CANCELLED">취소</SelectItem>
              <SelectItem value="CHECKED_IN">체크인</SelectItem>
              <SelectItem value="CHECKED_OUT">체크아웃</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>예약번호</TableHead>
                  <TableHead>예약자</TableHead>
                  <TableHead>객실</TableHead>
                  <TableHead>체크인</TableHead>
                  <TableHead>체크아웃</TableHead>
                  <TableHead>박</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      로딩 중...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      예약 내역이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">
                        {r.reservationNo}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{r.guest.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.guest.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.roomType.nameKo}
                        {r.package && (
                          <div className="text-xs text-muted-foreground">
                            {r.package.nameKo}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(r.checkIn)}</TableCell>
                      <TableCell>{formatDate(r.checkOut)}</TableCell>
                      <TableCell>{r.nights}</TableCell>
                      <TableCell>₩{formatPrice(r.totalPrice)}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[r.status] || "outline"}>
                          {statusLabels[r.status] || r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRes(r)}
                        >
                          상세
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Detail Modal */}
      <Dialog
        open={!!selectedRes}
        onOpenChange={(open) => !open && setSelectedRes(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>예약 상세</DialogTitle>
          </DialogHeader>
          {selectedRes && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">예약번호</span>
                  <p className="font-mono font-medium">
                    {selectedRes.reservationNo}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">상태</span>
                  <p>
                    <Badge
                      variant={statusColors[selectedRes.status] || "outline"}
                    >
                      {statusLabels[selectedRes.status]}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">예약자</span>
                  <p className="font-medium">{selectedRes.guest.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">연락처</span>
                  <p>{selectedRes.guest.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">이메일</span>
                  <p>{selectedRes.guest.email}</p>
                </div>
                {selectedRes.guest.company && (
                  <div>
                    <span className="text-muted-foreground">회사</span>
                    <p>{selectedRes.guest.company}</p>
                  </div>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">체크인</span>
                  <p>{new Date(selectedRes.checkIn).toLocaleDateString("ko-KR")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">체크아웃</span>
                  <p>{new Date(selectedRes.checkOut).toLocaleDateString("ko-KR")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">객실</span>
                  <p>{selectedRes.roomType.nameKo}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">금액</span>
                  <p className="font-bold">
                    ₩{formatPrice(selectedRes.totalPrice)}
                  </p>
                </div>
              </div>
              {selectedRes.specialRequests && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground">특별 요청</span>
                    <p>{selectedRes.specialRequests}</p>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex gap-2">
                {selectedRes.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() =>
                        updateStatus(selectedRes.id, "CONFIRMED")
                      }
                    >
                      예약 확정
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        updateStatus(selectedRes.id, "CANCELLED")
                      }
                    >
                      취소
                    </Button>
                  </>
                )}
                {selectedRes.status === "CONFIRMED" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() =>
                        updateStatus(selectedRes.id, "CHECKED_IN")
                      }
                    >
                      체크인
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        updateStatus(selectedRes.id, "CANCELLED")
                      }
                    >
                      취소
                    </Button>
                  </>
                )}
                {selectedRes.status === "CHECKED_IN" && (
                  <Button
                    size="sm"
                    onClick={() =>
                      updateStatus(selectedRes.id, "CHECKED_OUT")
                    }
                  >
                    체크아웃
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
