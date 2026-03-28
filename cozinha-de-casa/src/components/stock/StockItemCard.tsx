"use client";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { StockItem } from "@/lib/types";
import { STOCK_LOCATIONS } from "@/lib/constants";

interface StockItemCardProps {
  item: StockItem;
  onAdjust: (id: string, delta: number) => void;
  onClick: () => void;
}

export default function StockItemCard({ item, onAdjust, onClick }: StockItemCardProps) {
  const location = STOCK_LOCATIONS.find((l) => l.value === item.location);
  const isLow = item.min_threshold != null && item.quantity <= item.min_threshold;

  const daysToExpiry = item.expiry_date
    ? Math.ceil((new Date(item.expiry_date).getTime() - Date.now()) / 86400000)
    : null;
  const isExpiring = daysToExpiry != null && daysToExpiry <= 3;
  const isExpired = daysToExpiry != null && daysToExpiry <= 0;

  return (
    <Card className={`${isExpired ? "border-rose" : isExpiring ? "border-amber-400" : ""}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{location?.emoji || "📦"}</span>
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-charcoal truncate">{item.name}</span>
            {isLow && <Badge color="orange">Stock baixo</Badge>}
            {isExpired && <Badge color="red">Expirado</Badge>}
            {isExpiring && !isExpired && <Badge color="orange">Expira em {daysToExpiry}d</Badge>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-stone">{item.category}</span>
            <span className="text-xs text-stone">•</span>
            <span className="text-xs text-stone">{location?.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onAdjust(item.id, -1); }}
            className="w-8 h-8 rounded-full bg-cream-dark text-charcoal flex items-center justify-center hover:bg-stone-light/30 active:scale-90 font-bold"
            aria-label="Diminuir quantidade"
          >
            −
          </button>
          <span className="min-w-[48px] text-center font-bold text-charcoal">
            {item.quantity} <span className="text-xs text-stone font-normal">{item.unit}</span>
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onAdjust(item.id, 1); }}
            className="w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center hover:bg-terracotta-dark active:scale-90 font-bold"
            aria-label="Aumentar quantidade"
          >
            +
          </button>
        </div>
      </div>
    </Card>
  );
}
