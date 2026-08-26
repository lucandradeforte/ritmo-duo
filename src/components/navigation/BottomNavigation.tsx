import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Dumbbell,
  History,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import styles from './BottomNavigation.module.css';

export type BottomNavigationItemId = 'today' | 'workouts' | 'history' | 'progress' | 'profile';

interface NavigationItem {
  id: BottomNavigationItemId;
  label: string;
  icon: LucideIcon;
}

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { id: 'today', label: 'Hoje', icon: CalendarDays },
  { id: 'workouts', label: 'Treinos', icon: Dumbbell },
  { id: 'history', label: 'Histórico', icon: History },
  { id: 'progress', label: 'Progresso', icon: ChartNoAxesColumnIncreasing },
  { id: 'profile', label: 'Perfil', icon: UserRound },
];

export interface BottomNavigationProps {
  activeItem: BottomNavigationItemId;
  onItemSelect: (item: BottomNavigationItemId) => void;
  hidden?: boolean;
}

export function BottomNavigation({
  activeItem,
  onItemSelect,
  hidden = false,
}: BottomNavigationProps) {
  if (hidden) {
    return null;
  }

  return (
    <nav className={styles.navigation} aria-label="Navegação principal">
      <div className={styles.inner}>
        {NAVIGATION_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeItem === id;

          return (
            <button
              key={id}
              className={styles.item}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              data-active={isActive || undefined}
              onClick={() => onItemSelect(id)}
            >
              <span className={styles.iconWrap} aria-hidden="true">
                <Icon />
              </span>
              <span className={styles.label}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
