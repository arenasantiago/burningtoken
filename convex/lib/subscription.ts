export const PRO_ENTITLEMENT = "pro_auditor_access";
export const PRO_PRODUCT = "pro_auditor_monthly";
export function readTestStoreEntitlement(body: unknown, now = Date.now()) {
  const subscriber = (body as any)?.subscriber;
  if (!subscriber || typeof subscriber !== "object") throw new Error("Respuesta de suscripción inválida.");
  const entitlement = subscriber.entitlements?.[PRO_ENTITLEMENT];
  const subscription = subscriber.subscriptions?.[PRO_PRODUCT];
  const expiration = typeof entitlement?.expires_date === "string" ? Date.parse(entitlement.expires_date) : NaN;
  const purchased = typeof subscription?.purchase_date === "string" ? Date.parse(subscription.purchase_date) : NaN;
  const subscriptionExpiration = typeof subscription?.expires_date === "string" ? Date.parse(subscription.expires_date) : NaN;
  const hasProAccess = entitlement?.product_identifier === PRO_PRODUCT && subscription?.is_sandbox === true &&
    subscription?.store === "test_store" && !subscription?.refunded_at && Number.isFinite(purchased) && purchased <= now &&
    Number.isFinite(expiration) && expiration > now && Number.isFinite(subscriptionExpiration) && subscriptionExpiration > now;
  return { hasProAccess, expirationDate: hasProAccess ? Math.min(expiration, subscriptionExpiration) : undefined,
    entitlementId: PRO_ENTITLEMENT, productId: PRO_PRODUCT, environment: "SANDBOX" as const };
}
export function verifiedAccess(record: any, now = Date.now()): boolean {
  return Boolean(record?.verifiedBy === "revenuecat" && record?.hasProAccess && record.entitlementId === PRO_ENTITLEMENT &&
    record.productId === PRO_PRODUCT && record.environment === "SANDBOX" && record.expirationDate > now && now - record.updatedAt < 5 * 60_000);
}
