import React from "react";
import MainLayout from "../components/layout/MainLayout";
import HeroSection from "../components/home/HeroSection";
import MarketPreview from "../components/home/MarketPreview";
import Features from "../components/home/Features";

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <MarketPreview />
      <Features />
    </MainLayout>
  );
}
