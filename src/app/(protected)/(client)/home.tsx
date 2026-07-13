import React from 'react';
import HomeView from '@/components/home/HomeView';
import { useAuth } from '@/provider/auth';
import { usePostJob } from '@/provider/post-job';
import { useRouter } from 'expo-router';

export default function ClientHomeRoute() {
    const { user } = useAuth();
    const { openPostJob } = usePostJob();
    const router = useRouter();

    return (
        <HomeView
            userName={user?.displayName || 'User'}
            onNavigateToTab={(tab) => router.navigate(`/${tab}`)}
            onOpenPostJob={openPostJob}
            onSelectPro={(proName) => router.navigate('/messages')}
        />
    );
}
