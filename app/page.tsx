import {
  AssistantPreviewSection,
  CtaSection,
  HeroSection,
  LieuxPreviewSection,
  PatrimoinePreviewSection,
  ValuePropsSection,
} from "@/components/home";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ValuePropsSection />
      <AssistantPreviewSection />
      <LieuxPreviewSection />
      <PatrimoinePreviewSection />
      <CtaSection />
    </>
  );
}