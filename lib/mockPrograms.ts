export type BusinessType = "farmer" | "meat_processor" | "retail" | "online" | "other";
export type SizeCategory = "micro" | "small" | "medium" | "large";
export type PrimaryNeed = "loan" | "grant" | "disaster_aid" | "technical_assistance";

export interface Program {
  id: string;
  name: string;
  description: string;
  /** Tags used for scoring. Must overlap with TAG_MAPS in matcher.ts */
  tags: string[];
  /**
   * ISO 3166-2 US state codes (e.g. "TX") OR the special value "national"
   * meaning the program is available in all states.
   */
  regions: string[];
  link: string;
  maxAmount?: string;
  deadline?: string;
}

export const PROGRAMS: Program[] = [
  {
    id: "sba-7a",
    name: "SBA 7(a) Loan Program",
    description:
      "The flagship SBA loan program. Provides up to $5M for working capital, equipment, real estate, and business acquisition.",
    tags: ["loan", "small-business", "working-capital", "equipment", "real-estate"],
    regions: ["national"],
    link: "https://www.sba.gov/funding-programs/loans/7a-loans",
    maxAmount: "$5,000,000",
  },
  {
    id: "sba-microloan",
    name: "SBA Microloan Program",
    description:
      "Short-term loans up to $50,000 for startups and small businesses, especially in underserved communities.",
    tags: ["loan", "micro-enterprise", "small-business", "startup"],
    regions: ["national"],
    link: "https://www.sba.gov/funding-programs/loans/microloans",
    maxAmount: "$50,000",
  },
  {
    id: "sba-eidl",
    name: "SBA Economic Injury Disaster Loan (EIDL)",
    description:
      "Low-interest federal disaster loans for working capital to businesses that have suffered economic injury due to a declared disaster.",
    tags: ["loan", "disaster-aid", "working-capital", "small-business"],
    regions: ["national"],
    link: "https://www.sba.gov/funding-programs/disaster-assistance/economic-injury-disaster-loans",
    maxAmount: "$2,000,000",
  },
  {
    id: "sba-community-advantage",
    name: "SBA Community Advantage Loan",
    description:
      "7(a) loans up to $350,000 targeted at underserved markets, rural businesses, and low-income communities.",
    tags: ["loan", "small-business", "rural", "underserved"],
    regions: ["national"],
    link: "https://www.sba.gov/funding-programs/loans/community-advantage-loans",
    maxAmount: "$350,000",
  },
  {
    id: "sba-score-ta",
    name: "SBA SCORE Mentoring & Technical Assistance",
    description:
      "Free mentoring and workshops from experienced business executives covering business planning, marketing, finance, and more.",
    tags: ["technical-assistance", "mentoring", "small-business", "startup"],
    regions: ["national"],
    link: "https://www.score.org/",
  },
  {
    id: "usda-fsa-operating-loan",
    name: "USDA FSA Farm Operating Loan",
    description:
      "Loans for farmers to cover operating expenses such as seed, fertilizer, equipment, and family living costs.",
    tags: ["loan", "agriculture", "farming", "rural", "equipment"],
    regions: ["national"],
    link: "https://www.fsa.usda.gov/programs-and-services/farm-loan-programs/farm-operating-loans/index",
    maxAmount: "$400,000",
  },
  {
    id: "usda-fsa-emergency",
    name: "USDA FSA Emergency Loan Program",
    description:
      "Loans to help farmers and ranchers recover from production and physical losses due to drought, flooding, other natural disasters, or quarantine.",
    tags: ["loan", "disaster-aid", "agriculture", "farming", "rural"],
    regions: ["national"],
    link: "https://www.fsa.usda.gov/programs-and-services/farm-loan-programs/emergency-farm-loans/index",
    maxAmount: "$500,000",
  },
  {
    id: "usda-rbdg",
    name: "USDA Rural Business Development Grant (RBDG)",
    description:
      "Grants for rural small businesses and entrepreneurs for training, technical assistance, and project development.",
    tags: ["grant", "rural", "small-business", "technical-assistance"],
    regions: ["national"],
    link: "https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants",
    maxAmount: "$500,000",
  },
  {
    id: "usda-vapg",
    name: "USDA Value-Added Producer Grant (VAPG)",
    description:
      "Grants help agricultural producers enter into value-added activities to generate new products, create marketing opportunities, and increase producer income.",
    tags: ["grant", "agriculture", "farming", "processing", "rural"],
    regions: ["national"],
    link: "https://www.rd.usda.gov/programs-services/business-programs/value-added-producer-grants",
    maxAmount: "$250,000",
  },
  {
    id: "usda-mppp",
    name: "USDA Meat and Poultry Processing Expansion Program (MPPEP)",
    description:
      "Grants to expand meat and poultry processing capacity, especially for small and very small processors.",
    tags: ["grant", "meat-processing", "processing", "agriculture", "rural"],
    regions: ["national"],
    link: "https://www.ams.usda.gov/selling-food/meat-poultry-processing-expansion",
    maxAmount: "$25,000,000",
  },
  {
    id: "usda-reap",
    name: "USDA Rural Energy for America Program (REAP)",
    description:
      "Grants and loan guarantees for rural small businesses and agricultural producers to purchase and install renewable energy systems or make energy efficiency improvements.",
    tags: ["grant", "loan", "rural", "agriculture", "small-business", "energy"],
    regions: ["national"],
    link: "https://www.rd.usda.gov/programs-services/energy-programs/rural-energy-america-program-renewable-energy-systems-energy-efficiency-improvement-guaranteed-loans",
    maxAmount: "$1,000,000",
  },
  {
    id: "usda-bi-loan",
    name: "USDA Business & Industry (B&I) Loan Guarantee",
    description:
      "Loan guarantees to improve, develop, or finance business, industry, and employment in rural communities.",
    tags: ["loan", "rural", "small-business", "medium-business", "equipment", "real-estate"],
    regions: ["national"],
    link: "https://www.rd.usda.gov/programs-services/business-programs/business-industry-loan-guarantees",
    maxAmount: "$25,000,000",
  },
  {
    id: "usda-fmpp",
    name: "USDA Farmers Market Promotion Program (FMPP)",
    description:
      "Grants to support the development, promotion, and expansion of domestic farmers markets, roadside stands, community-supported agriculture, and other direct farmer-to-consumer market opportunities.",
    tags: ["grant", "agriculture", "farming", "retail", "direct-marketing"],
    regions: ["national"],
    link: "https://www.ams.usda.gov/grants/fmpp",
    maxAmount: "$500,000",
  },
  {
    id: "usda-lfpp",
    name: "USDA Local Food Promotion Program (LFPP)",
    description:
      "Competitive grants for developing and expanding local and regional food business enterprises.",
    tags: ["grant", "agriculture", "farming", "retail", "food-supply-chain", "online"],
    regions: ["national"],
    link: "https://www.ams.usda.gov/grants/lfpp",
    maxAmount: "$500,000",
  },
  {
    id: "usda-beginning-farmer",
    name: "USDA FSA Beginning Farmer Loan Program",
    description:
      "Loans and loan guarantees reserved for beginning farmers and ranchers who cannot otherwise obtain financing.",
    tags: ["loan", "agriculture", "farming", "rural", "startup", "small-business"],
    regions: ["national"],
    link: "https://www.fsa.usda.gov/programs-and-services/farm-loan-programs/beginning-farmers-and-ranchers/index",
    maxAmount: "$600,000",
  },
  {
    id: "usda-specialty-crop",
    name: "USDA Specialty Crop Block Grant Program",
    description:
      "State-administered grants to enhance the competitiveness of specialty crops including fruits, vegetables, tree nuts, dried fruits, horticulture, and nursery crops.",
    tags: ["grant", "agriculture", "farming", "specialty-crop"],
    regions: ["national"],
    link: "https://www.ams.usda.gov/grants/scbgp",
    maxAmount: "Varies by state",
  },
  {
    id: "usda-rmap",
    name: "USDA Rural Microentrepreneur Assistance Program (RMAP)",
    description:
      "Loans and grants to microenterprise development organizations that provide training and technical assistance to rural micro-entrepreneurs.",
    tags: ["loan", "grant", "micro-enterprise", "rural", "technical-assistance", "small-business"],
    regions: ["national"],
    link: "https://www.rd.usda.gov/programs-services/business-programs/rural-microentrepreneur-assistance-program",
    maxAmount: "$250,000",
  },
];
