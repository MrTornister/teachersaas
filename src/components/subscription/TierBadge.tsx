import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface TierBadgeProps {
    tier: 'free' | 'pro';
}

export function TierBadge({ tier }: TierBadgeProps) {
    const t = useTranslations('Subscription');

    return (
        <Badge variant={tier === 'pro' ? 'default' : 'secondary'} className="ml-2">
            {tier === 'free' ? t('freeTier') : t('proTier')}
        </Badge>
    );
}
