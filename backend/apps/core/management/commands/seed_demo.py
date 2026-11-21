from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta, timezone as dt_timezone
from apps.accounts.models import User, UserProfile
from apps.quests.models import Quest, QuestCategory, QuestCompletion
from apps.gamification.models import XPTransaction, UserLevel
from apps.achievements.models import Achievement, UserAchievement
from apps.questlines.models import Questline, QuestlineMilestone
from apps.habits.models import Habit, HabitLog
from apps.focus.models import FocusSession
from apps.rewards.models import Reward, UserInventory

class Command(BaseCommand):
    help = 'Seeds authentic demo data reproducing the EVOLVIA Cyberpunk Dashboard reference'

    def handle(self, *args, **options):
        self.stdout.write("Seeding EVOLVIA authentic demonstration environment...")

        # 1. Create or get demo user
        user, created = User.objects.get_or_create(username='ashwin', defaults={'email': 'ashwin@evolvia.net'})
        user.set_password('evolvia123')
        user.save()

        # 2. Configure User Profile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.display_name = 'Ashwin Bhalaji'
        profile.title_tagline = 'Productivity Explorer'
        profile.is_verified = True
        profile.total_xp = 18950
        profile.level = 12
        profile.current_streak = 7
        profile.longest_streak = 14
        profile.crystals = 45
        profile.weekly_xp_goal = 620
        profile.timezone = 'Asia/Kolkata'
        profile.last_active_date = timezone.localdate()
        profile.settings = {
            'glow': 'Medium',
            'sound': True,
            'reduced_motion': False,
            'leaderboard_opt_in': True
        }
        profile.save()

        # 3. Create Categories
        cat_study, _ = QuestCategory.objects.get_or_create(user=user, name='Study', defaults={'color_token': 'cyan', 'icon': 'BookOpen'})
        cat_dev, _ = QuestCategory.objects.get_or_create(user=user, name='Projects', defaults={'color_token': 'amethyst', 'icon': 'Code'})
        cat_disc, _ = QuestCategory.objects.get_or_create(user=user, name='Discipline', defaults={'color_token': 'gold', 'icon': 'Target'})

        # 4. Create Today's Quests
        Quest.objects.filter(user=user).delete()
        q1 = Quest.objects.create(
            user=user,
            category=cat_study,
            title='Complete Java assignment',
            description='Implement polymorphic inheritance hierarchy for the banking system.',
            difficulty='HARD',
            xp_reward=100,
            status='COMPLETED',
            completed_at=timezone.now() - timedelta(hours=3)
        )
        QuestCompletion.objects.create(quest=q1, user=user, xp_awarded=100, multiplier=1.14)

        q2 = Quest.objects.create(
            user=user,
            category=cat_study,
            title='Study Cyber Forensics (2 hrs)',
            description='Review memory forensics, volatility analysis, and registry triage.',
            difficulty='EPIC',
            xp_reward=150,
            status='COMPLETED',
            completed_at=timezone.now() - timedelta(hours=1)
        )
        QuestCompletion.objects.create(quest=q2, user=user, xp_awarded=150, multiplier=1.14)

        q3 = Quest.objects.create(
            user=user,
            category=cat_disc,
            title='30-minute Focus Session',
            description='Pomodoro deep work sprint on algorithms and problem sets.',
            difficulty='MEDIUM',
            xp_reward=50,
            status='TODO'
        )

        q4 = Quest.objects.create(
            user=user,
            category=cat_dev,
            title='Refactor State Architecture',
            difficulty='MEDIUM',
            xp_reward=50,
            status='COMPLETED',
            completed_at=timezone.now() - timedelta(hours=5)
        )
        QuestCompletion.objects.create(quest=q4, user=user, xp_awarded=50, multiplier=1.0)

        q5 = Quest.objects.create(
            user=user,
            category=cat_disc,
            title='Daily Reading Protocol',
            difficulty='EASY',
            xp_reward=25,
            status='TODO'
        )

        # 5. Create Active Questline: Exam Preparation Arc
        Questline.objects.filter(user=user).delete()
        ql = Questline.objects.create(
            user=user,
            title='Exam Preparation Arc',
            description='Structured high-leverage study sessions designed to master core computer science curricula.',
            rarity='EPIC',
            banner_key='questline_portal',
            is_pinned=True,
            status='ACTIVE',
            bonus_xp=350
        )
        QuestlineMilestone.objects.create(questline=ql, order=1, title='Complete Java Assignment', xp_reward=50, is_completed=True, completed_at=timezone.now() - timedelta(days=2))
        QuestlineMilestone.objects.create(questline=ql, order=2, title='Study Cyber Forensics (2 hrs)', xp_reward=50, is_completed=True, completed_at=timezone.now() - timedelta(days=1))
        QuestlineMilestone.objects.create(questline=ql, order=3, title='Database Schema Normalization Drill', xp_reward=50, is_completed=True, completed_at=timezone.now() - timedelta(hours=6))
        QuestlineMilestone.objects.create(questline=ql, order=4, title='Operating Systems Memory Management Mock', xp_reward=50, is_completed=False)
        QuestlineMilestone.objects.create(questline=ql, order=5, title='Final Comprehensive Exam Simulation', xp_reward=50, is_completed=False)

        # 6. Achievements Catalog
        Achievement.objects.all().delete()
        ach1 = Achievement.objects.create(code='quest_novice', name='Quest Novice', criteria_text='Complete 10 quests', description='Complete 10 quests across any discipline.', rarity='COMMON', xp_bonus=50, crystal_bonus=10, rule={'metric': 'quests_completed', 'gte': 10})
        ach2 = Achievement.objects.create(code='streak_master', name='Streak Master', criteria_text='7-day streak', description='Maintain an unbroken 7-day streak.', rarity='RARE', xp_bonus=100, crystal_bonus=20, rule={'metric': 'streak', 'gte': 7})
        ach3 = Achievement.objects.create(code='focus_adept', name='Focus Adept', criteria_text='10 focus sessions', description='Conquer 10 deep focus sessions.', rarity='RARE', xp_bonus=100, crystal_bonus=20, rule={'metric': 'focus_sessions', 'gte': 10})
        ach4 = Achievement.objects.create(code='habit_forger', name='Habit Forger', criteria_text='21-day habit streak', description='Forge unbreakable discipline with 21 days.', rarity='EPIC', xp_bonus=150, crystal_bonus=25, rule={'metric': 'streak', 'gte': 21})

        UserAchievement.objects.get_or_create(user=user, achievement=ach1)
        UserAchievement.objects.get_or_create(user=user, achievement=ach2)
        UserAchievement.objects.get_or_create(user=user, achievement=ach3)

        # 7. Habits
        Habit.objects.filter(user=user).delete()
        h1 = Habit.objects.create(user=user, name='Morning Deep Meditation', current_streak=14, longest_streak=14, target_time='07:30:00')
        HabitLog.objects.create(habit=h1, user=user, log_date=timezone.localdate(), xp_awarded=10)

        h2 = Habit.objects.create(user=user, name='Read 20 pages (Tech / Sci-Fi)', current_streak=7, longest_streak=10, target_time='21:00:00')
        HabitLog.objects.create(habit=h2, user=user, log_date=timezone.localdate(), xp_awarded=10)

        Habit.objects.create(user=user, name='Hydration Goal (3 Liters)', current_streak=21, longest_streak=21)

        # 8. Weekly XP Transactions (Total 420 XP)
        XPTransaction.objects.filter(user=user).delete()
        today = timezone.localdate()
        daily_breakdown = [
            (today - timedelta(days=6), 60),
            (today - timedelta(days=5), 40),
            (today - timedelta(days=4), 65),
            (today - timedelta(days=3), 110),
            (today - timedelta(days=2), 75),
            (today - timedelta(days=1), 45),
            (today, 25),
        ]
        running_xp = 18530
        for day, xp_amount in daily_breakdown:
            running_xp += xp_amount
            XPTransaction.objects.create(
                user=user,
                amount=xp_amount,
                base_amount=xp_amount,
                multiplier=1.00,
                source_type='QUEST',
                source_id=f"SEED_{day}",
                balance_after=running_xp,
                level_after=12,
                created_at=datetime(day.year, day.month, day.day, 12, 0, tzinfo=dt_timezone.utc)
            )

        # 9. Rewards Shop
        Reward.objects.all().delete()
        r1 = Reward.objects.create(code='freeze_protocol', name='Streak Freeze Protocol', description='Protects streak if one day is missed.', cost_crystals=15, type='STREAK_FREEZE')
        r2 = Reward.objects.create(code='frame_amethyst', name='Amethyst Crest Frame', description='Holographic neon frame for player portrait.', cost_crystals=20, type='FRAME')
        r3 = Reward.objects.create(code='title_mastermind', name='Mastermind Title Tag', description='Exclusive honorary title prefix.', cost_crystals=30, type='TITLE')

        UserInventory.objects.create(user=user, reward=r1)

        self.stdout.write(self.style.SUCCESS("EVOLVIA demo environment seeded successfully! User: ashwin / evolvia123"))
