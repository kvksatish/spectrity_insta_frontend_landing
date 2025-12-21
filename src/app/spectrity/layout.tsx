import { BottomTabBar } from '@/components/BottomTabBar';

export default function SpectrityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {children}
      <BottomTabBar />
    </div>
  );
}
