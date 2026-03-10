import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Room Types
  const hotel = await prisma.roomType.upsert({
    where: { code: "hotel" },
    update: {},
    create: {
      code: "hotel",
      nameKo: "호텔룸",
      nameEn: "Hotel Room",
      description:
        "편안한 침구와 업무 공간을 갖춘 스탠다드 호텔룸입니다. 산과 계곡의 전망을 즐길 수 있습니다.",
      maxGuests: 2,
      basePrice: 40000,
      totalCount: 400,
      amenities: JSON.stringify([
        "무료 Wi-Fi",
        "업무용 데스크",
        "에어컨",
        "미니바",
        "욕실용품",
      ]),
      images: JSON.stringify(["/images/room-hotel.jpg"]),
      sortOrder: 1,
    },
  });

  const terrace = await prisma.roomType.upsert({
    where: { code: "terrace" },
    update: {},
    create: {
      code: "terrace",
      nameKo: "테라스룸",
      nameEn: "Terrace Room",
      description:
        "넓은 프라이빗 테라스가 있는 객실입니다. 자연 속에서 여유로운 시간을 보낼 수 있습니다.",
      maxGuests: 3,
      basePrice: 55000,
      totalCount: 100,
      amenities: JSON.stringify([
        "무료 Wi-Fi",
        "업무용 데스크",
        "프라이빗 테라스",
        "에어컨",
        "미니바",
        "욕실용품",
        "테라스 테이블",
      ]),
      images: JSON.stringify(["/images/room-terrace.jpg"]),
      sortOrder: 2,
    },
  });

  const villa = await prisma.roomType.upsert({
    where: { code: "villa" },
    update: {},
    create: {
      code: "villa",
      nameKo: "빌라",
      nameEn: "Villa",
      description:
        "독립된 공간의 프리미엄 빌라입니다. 가족이나 소규모 팀을 위한 최적의 공간입니다.",
      maxGuests: 6,
      basePrice: 80000,
      totalCount: 18,
      amenities: JSON.stringify([
        "무료 Wi-Fi",
        "업무용 데스크",
        "거실",
        "키친",
        "프라이빗 정원",
        "에어컨",
        "세탁기",
        "풀 욕실",
      ]),
      images: JSON.stringify(["/images/room-villa.jpg"]),
      sortOrder: 3,
    },
  });

  console.log("Room types created:", { hotel: hotel.id, terrace: terrace.id, villa: villa.id });

  // Packages
  const packages = [
    {
      code: "starter",
      nameKo: "Starter",
      nameEn: "Starter",
      description: "워케이션 입문자를 위한 1주 패키지",
      nights: 7,
      basePrice: 280000,
      perNight: 40000,
      discountPct: 0,
      features: JSON.stringify([
        "7박 숙박",
        "코워킹 스페이스 이용",
        "조식 포함",
        "웰컴 드링크",
      ]),
      sortOrder: 1,
    },
    {
      code: "professional",
      nameKo: "Professional",
      nameEn: "Professional",
      description: "본격적인 워케이션을 위한 2주 패키지",
      nights: 14,
      basePrice: 490000,
      perNight: 35000,
      discountPct: 12,
      features: JSON.stringify([
        "14박 숙박",
        "코워킹 스페이스 이용",
        "조식 포함",
        "회의실 2시간/주",
        "세탁 서비스 1회/주",
      ]),
      sortOrder: 2,
    },
    {
      code: "nomad",
      nameKo: "Nomad",
      nameEn: "Nomad",
      description: "장기 체류를 위한 한 달 패키지",
      nights: 30,
      basePrice: 990000,
      perNight: 33000,
      discountPct: 18,
      features: JSON.stringify([
        "30박 숙박",
        "코워킹 스페이스 이용",
        "조식 포함",
        "회의실 자유 이용",
        "세탁 서비스 2회/주",
        "피트니스 이용",
      ]),
      sortOrder: 3,
    },
    {
      code: "paradise",
      nameKo: "Paradise",
      nameEn: "Paradise",
      description: "완전한 워라밸을 위한 장기 체류 패키지",
      nights: 90,
      basePrice: 2700000,
      perNight: 30000,
      discountPct: 25,
      features: JSON.stringify([
        "90박 숙박",
        "코워킹 스페이스 이용",
        "조식/석식 포함",
        "회의실 자유 이용",
        "세탁 서비스 무제한",
        "피트니스/수영장 이용",
        "전용 주차",
      ]),
      sortOrder: 4,
    },
    {
      code: "custom",
      nameKo: "기업 맞춤",
      nameEn: "Custom",
      description: "기업/단체를 위한 맞춤형 패키지",
      nights: 0,
      basePrice: 0,
      perNight: 0,
      discountPct: 0,
      features: JSON.stringify([
        "맞춤 일정",
        "단체 회의실",
        "워크숍 공간",
        "팀빌딩 프로그램",
        "전담 매니저",
      ]),
      sortOrder: 5,
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { code: pkg.code },
      update: {},
      create: pkg,
    });
  }

  console.log("Packages created:", packages.length);

  // Generate inventory for next 90 days
  const roomTypes = [hotel, terrace, villa];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const rt of roomTypes) {
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      await prisma.roomInventory.upsert({
        where: {
          roomTypeId_date: { roomTypeId: rt.id, date },
        },
        update: {},
        create: {
          roomTypeId: rt.id,
          date,
          totalRooms: rt.totalCount,
          bookedRooms: 0,
        },
      });
    }
  }

  console.log("Inventory created for 90 days");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
