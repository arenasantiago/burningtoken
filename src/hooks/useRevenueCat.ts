import { useEffect, useState } from "react";
import { Purchases, type Package } from "@revenuecat/purchases-js";
export function useRevenueCat(userId?: string) {
  const [selected, setSelected] = useState<Package | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
      if (!apiKey?.startsWith("test_")) throw new Error("Configura RevenueCat Test Store para comprar sin cargos reales.");
      const purchases = Purchases.isConfigured() ? Purchases.getSharedInstance() : Purchases.configure({ apiKey, appUserId: userId });
      if (purchases.getAppUserId() !== userId) await purchases.changeUser(userId);
      const offerings = await purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(p => p.webBillingProduct.identifier === "pro_auditor_monthly");
      if (!pkg) throw new Error("El producto Pro todavía no está disponible en Test Store.");
      if (!cancelled) { setSelected(pkg); setError(null); }
    })().catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [userId]);
  return { error, isConfigured: Boolean(selected), purchasePro: async () => {
    if (!selected || !userId) throw new Error(error || "Espera a que cargue Test Store.");
    const result = await Purchases.getSharedInstance().purchase({ rcPackage: selected });
    if (!result.customerInfo.entitlements.active.pro_auditor_access) throw new Error("La compra no activó el acceso Pro. Actualiza el estado de la suscripción.");
  }};
}
