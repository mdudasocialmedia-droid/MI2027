"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export const PROFILE_PHOTOS_BUCKET = "profile-photos";
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  avatarPath: string | null;
};

type ProfileRow = { display_name?: string | null; avatar_path?: string | null };

function metadataName(metadata: Record<string, unknown> | undefined, email: string) {
  const value = metadata?.display_name;
  return typeof value === "string" && value.trim() ? value.trim() : email.split("@")[0] || "Luna";
}

async function signedAvatarUrl(path: string | null) {
  if (!path) return null;
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(PROFILE_PHOTOS_BUCKET).createSignedUrl(path, 60 * 60);
  return error ? null : data.signedUrl;
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "LP";
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileStorageReady, setProfileStorageReady] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user || !auth.user.email) {
      setProfile(null);
      setLoading(false);
      return null;
    }

    const user = auth.user;
    const email = user.email;
    if (!email) {
      setProfile(null);
      setLoading(false);
      return null;
    }
    const { data: row, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, avatar_path")
      .eq("user_id", user.id)
      .maybeSingle<ProfileRow>();

    // Until the approved profile migration is applied, the authenticated metadata remains usable.
    if (profileError) setProfileStorageReady(false);
    const displayName = row?.display_name?.trim() || metadataName(user.user_metadata, email);
    const avatarPath = row?.avatar_path ?? (typeof user.user_metadata?.avatar_path === "string" ? user.user_metadata.avatar_path : null);
    const avatarUrl = await signedAvatarUrl(avatarPath);
    setProfile({ id: user.id, email, displayName, avatarPath, avatarUrl });
    setLoading(false);
    return { id: user.id, email, displayName, avatarPath, avatarUrl };
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const saveDisplayName = useCallback(async (displayName: string) => {
    const clean = displayName.trim();
    if (!clean) throw new Error("El nombre no puede estar vacío.");
    const supabase = createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) throw new Error("No hay una sesión activa.");
    const { error: metadataError } = await supabase.auth.updateUser({ data: { display_name: clean } });
    if (metadataError) throw metadataError;
    const { error: profileError } = await supabase.from("profiles").upsert({ user_id: auth.user.id, display_name: clean });
    if (profileError) setProfileStorageReady(false);
    await refresh();
    return profileError;
  }, [refresh]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) throw new Error("Selecciona una imagen JPG, PNG o WebP.");
    if (file.size > MAX_AVATAR_BYTES) throw new Error("La imagen debe pesar como máximo 2 MB.");
    const supabase = createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) throw new Error("No hay una sesión activa.");
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const avatarPath = `${auth.user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage.from(PROFILE_PHOTOS_BUCKET).upload(avatarPath, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
    if (uploadError) {
      setProfileStorageReady(false);
      throw new Error("No fue posible guardar la imagen. Configura el bucket y las políticas de Storage antes de intentarlo de nuevo.");
    }
    const { error: metadataError } = await supabase.auth.updateUser({ data: { avatar_path: avatarPath } });
    if (metadataError) throw metadataError;
    const { error: profileError } = await supabase.from("profiles").upsert({ user_id: auth.user.id, avatar_path: avatarPath });
    if (profileError) setProfileStorageReady(false);
    await refresh();
    return profileError;
  }, [refresh]);

  return { profile, loading, profileStorageReady, refresh, saveDisplayName, uploadAvatar };
}
