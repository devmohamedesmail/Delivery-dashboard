'use client'
import {useEffect} from 'react'
import LanguageSwitcher from "@/components/common/language-switcher";
import { useAuth } from "@/context/auth-provider";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

export default function Home() {
  const { t } = useTranslation()
  const { user } = useAuth();
  const router = useRouter();


   useEffect(() => {
    if (user) {
      router.replace("/admin");
    } else {
      router.replace("/auth/login");
    }
  }, [user, router]);

  
  return (
   <div className="flex items-center justify-center h-screen">
      Redirecting...
     
    </div>
  );
}
