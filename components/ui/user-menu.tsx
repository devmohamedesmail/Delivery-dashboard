
import { ChevronDown, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function UserMenu() {
    const { t } = useTranslation()
    const router = useRouter()
    const { user, logout } = useAuth()
    const handleLogout = async () => {
        await logout()
        router.push('/auth/login')
    }
    return (
        <>
        
            <DropdownMenu>
                <DropdownMenuTrigger className='flex items-center'>
                    <UserRound />
                    <ChevronDown
                        className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform`}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/admin/profile')}>{t("auth.profile")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}> {t('header.logout')}</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
