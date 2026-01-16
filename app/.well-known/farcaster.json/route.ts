export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || 'https://mentalwealthacademy.com';
  
  return Response.json({
    accountAssociation: {
      // These will be generated using Base Build Account association tool
      // Visit: https://www.base.dev/preview?tab=account
      header: "",
      payload: "",
      signature: ""
    },
    miniapp: {
      version: "1",
      name: "Mental Wealth Academy",
      homeUrl: URL,
      iconUrl: `${URL}/icons/mentalwealth-academy-logo.png`,
      splashImageUrl: `${URL}/icons/embbedBanner.png`,
      splashBackgroundColor: "#000000",
      webhookUrl: `${URL}/api/webhook`,
      subtitle: "Next Gen Micro-University",
      description: "Mental Wealth Academy is a virtual learning platform for the next generation. Learn, complete quests, earn rewards on-chain.",
      screenshotUrls: [
        `${URL}/icons/embbedBanner.png`
      ],
      primaryCategory: "education",
      tags: ["education", "learning", "blockchain", "web3", "academy"],
      heroImageUrl: `${URL}/icons/embbedBanner.png`,
      tagline: "Learn & Earn Together",
      ogTitle: "Mental Wealth Academy",
      ogDescription: "Virtual learning platform for the next generation with blockchain rewards",
      ogImageUrl: `${URL}/icons/embbedBanner.png`,
      noindex: false
    }
  });
}
