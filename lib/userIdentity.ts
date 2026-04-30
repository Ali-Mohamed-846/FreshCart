export function getUserStorageId(user: any): string {
  if (!user || typeof user !== "object") return "";

  const idLike =
    user._id ??
    user.id ??
    user.userId ??
    user.email;

  return typeof idLike === "string" ? idLike : "";
}
