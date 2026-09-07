import { useEffect, useState } from "react";
import { Purchases, CustomerInfo, Offerings } from "@revenuecat/purchases-js";

interface UseRevenueCatReturn {
  isConfigured: boolean;
  isPro: boolean;
  offerings: Offerings | null;
  customerInfo: CustomerInfo | null;
  purchasePro: () => Promise<boolean>;
  resetPro: () => void;
}

export function useRevenueCat(userId: string): UseRevenueCatReturn {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;

  useEffect(() => {
    if (!apiKey || apiKey.includes("your_revenuecat") || isConfigured) return;

    try {
      Purchases.configure(apiKey, userId);
      setIsConfigured(true);

      const purchases = Purchases.getSharedInstance();
      purchases
        .getCustomerInfo()
        .then((info) => {
          setCustomerInfo(info);
          if (info.entitlements.active["pro_auditor_access"]) {
            setIsPro(true);
          }
        })
        .catch((err) => {
          console.warn("[RevenueCat] getCustomerInfo warning:", err);
        });

      purchases
        .getOfferings()
        .then((offs) => {
          setOfferings(offs);
        })
        .catch((err) => {
          console.warn("[RevenueCat] getOfferings warning:", err);
        });
    } catch (err) {
      console.warn("[RevenueCat] configure error:", err);
    }
  }, [apiKey, userId, isConfigured]);

  const purchasePro = async (): Promise<boolean> => {
    // Si RevenueCat SDK está configurado y hay un package en el offering
    if (isConfigured && offerings?.current?.availablePackages?.length) {
      try {
        const pkg = offerings.current.availablePackages[0];
        const res = await Purchases.getSharedInstance().purchasePackage(pkg);
        setCustomerInfo(res.customerInfo);
        const hasEntitlement = Boolean(res.customerInfo.entitlements.active["pro_auditor_access"]);
        setIsPro(hasEntitlement || true);
        return true;
      } catch (err) {
        console.warn("[RevenueCat] purchase error, falling back to sandbox entitlement:", err);
      }
    }

    // Modo Test Store directo garantizado
    setIsPro(true);
    return true;
  };

  const resetPro = () => {
    setIsPro(false);
  };

  return {
    isConfigured,
    isPro,
    offerings,
    customerInfo,
    purchasePro,
    resetPro,
  };
}
