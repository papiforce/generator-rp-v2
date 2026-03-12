import TemplateBuilder from "@/components/template-builder/template-builder";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <TemplateBuilder />
    </Suspense>
  );
}
