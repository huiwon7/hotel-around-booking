import { IPmsProvider } from "./pms-provider.interface";
import { MockPmsProvider } from "./mock-pms.provider";

export function createPmsProvider(): IPmsProvider {
  const provider = process.env.PMS_PROVIDER || "mock";

  switch (provider) {
    case "mock":
      return new MockPmsProvider();
    // case "sanha":
    //   return new SanhaPmsProvider(); // Phase 2
    default:
      return new MockPmsProvider();
  }
}
