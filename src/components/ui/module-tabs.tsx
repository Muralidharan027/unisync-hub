
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ModuleTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function ModuleTabs({ tabs, activeTab, onTabChange }: ModuleTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 pb-4 border-b mb-6">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          className={cn(
            "gap-2 h-10",
            activeTab === tab.id 
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "hover:bg-secondary"
          )}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
