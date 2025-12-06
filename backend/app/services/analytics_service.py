from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.models import Criteria, Industry, Mark, Point, SubIndustry, User


def _date_filters(query, model, start: Optional[date], end: Optional[date]):
    if start:
        query = query.where(model.created_at >= datetime.combine(start, datetime.min.time()))
    if end:
        query = query.where(model.created_at <= datetime.combine(end, datetime.max.time()))
    return query


async def get_analytics_summary(
    db: AsyncSession,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    top_limit: int = 10,
) -> Dict[str, Any]:
    summary: Dict[str, Any] = {}

    # Users by day
    q_users = select(func.date(User.created_at), func.count()).group_by(func.date(User.created_at)).order_by(
        func.date(User.created_at)
    )
    q_users = _date_filters(q_users, User, start_date, end_date)
    users_by_day = [{"date": row[0], "count": row[1]} for row in (await db.execute(q_users)).all()]
    summary["users_by_day"] = users_by_day

    # Points by day
    q_points_day = select(func.date(Point.created_at), func.count()).group_by(func.date(Point.created_at)).order_by(
        func.date(Point.created_at)
    )
    q_points_day = _date_filters(q_points_day, Point, start_date, end_date)
    points_by_day = [{"date": row[0], "count": row[1]} for row in (await db.execute(q_points_day)).all()]
    summary["points_by_day"] = points_by_day

    # Marks by day
    q_marks_day = select(func.date(Mark.created_at), func.count()).group_by(func.date(Mark.created_at)).order_by(
        func.date(Mark.created_at)
    )
    q_marks_day = _date_filters(q_marks_day, Mark, start_date, end_date)
    marks_by_day = [{"date": row[0], "count": row[1]} for row in (await db.execute(q_marks_day)).all()]
    summary["marks_by_day"] = marks_by_day

    # Counts and averages by industry
    q_points_ind = select(Industry.id, Industry.name, func.count(Point.id)).join(Point).group_by(
        Industry.id, Industry.name
    )
    q_points_ind = _date_filters(q_points_ind, Point, start_date, end_date)
    summary["points_by_industry"] = [
        {"industry_id": row[0], "industry": row[1], "count": row[2]} for row in (await db.execute(q_points_ind)).all()
    ]

    q_marks_ind = (
        select(Industry.id, Industry.name, func.count(Mark.id))
        .join(Point, Point.industry_id == Industry.id)
        .join(Mark, Mark.point_id == Point.id)
        .group_by(Industry.id, Industry.name)
    )
    q_marks_ind = _date_filters(q_marks_ind, Mark, start_date, end_date)
    summary["marks_by_industry"] = [
        {"industry_id": row[0], "industry": row[1], "count": row[2]} for row in (await db.execute(q_marks_ind)).all()
    ]

    # Average rating per industry: skip unrated points (mark <= 0)
    q_avg_ind = (
        select(Industry.id, Industry.name, func.avg(Point.mark))
        .join(Point)
        .where(Point.mark > 0)
        .group_by(Industry.id, Industry.name)
    )
    q_avg_ind = _date_filters(q_avg_ind, Point, start_date, end_date)
    summary["avg_rating_by_industry"] = [
        {"industry_id": row[0], "industry": row[1], "avg_mark": float(row[2]) if row[2] is not None else None}
        for row in (await db.execute(q_avg_ind)).all()
    ]

    # Top points high/low (respect date filter)
    # Top points (rated only)
    rated_points = select(Point).where(Point.mark > 0)
    rated_points = _date_filters(rated_points, Point, start_date, end_date)

    q_top = rated_points.order_by(Point.mark.desc(), Point.id).limit(top_limit)
    summary["top_points"] = [{"id": p.id, "name": p.name, "mark": p.mark} for p in (await db.scalars(q_top)).all()]

    q_low = rated_points.order_by(Point.mark.asc(), Point.id).limit(top_limit)
    summary["worst_points"] = [{"id": p.id, "name": p.name, "mark": p.mark} for p in (await db.scalars(q_low)).all()]

    # Points without marks (respect date filter)
    sub_mark_counts = (
        select(Mark.point_id, func.count(Mark.id).label("cnt"))
        .group_by(Mark.point_id)
    )
    sub_mark_counts = _date_filters(sub_mark_counts, Mark, start_date, end_date)
    sub_mark_counts = sub_mark_counts.subquery()
    q_no_marks = (
        select(Point)
        .join(sub_mark_counts, Point.id == sub_mark_counts.c.point_id, isouter=True)
        .where((sub_mark_counts.c.cnt.is_(None)) | (sub_mark_counts.c.cnt == 0))
    )
    q_no_marks = _date_filters(q_no_marks, Point, start_date, end_date)
    summary["points_without_marks"] = [{"id": p.id, "name": p.name} for p in (await db.scalars(q_no_marks)).all()]

    # Top users (by marks + points created)
    point_counts = dict(
        (await db.execute(select(Point.creator_id, func.count()).group_by(Point.creator_id))).all()
    )
    mark_counts = dict((await db.execute(select(Mark.user_id, func.count()).group_by(Mark.user_id))).all())
    totals = defaultdict(int)
    for uid, cnt in point_counts.items():
        totals[uid] += cnt
    for uid, cnt in mark_counts.items():
        totals[uid] += cnt
    top_users_ids = sorted(totals.items(), key=lambda x: x[1], reverse=True)[:top_limit]
    if top_users_ids:
        ids = [uid for uid, _ in top_users_ids if uid is not None]
        users = {u.id: u for u in (await db.execute(select(User).where(User.id.in_(ids)))).scalars().all()}
        summary["top_users"] = [
            {"id": uid, "username": users.get(uid).username if users.get(uid) else None, "activity": cnt}
            for uid, cnt in top_users_ids
        ]
    else:
        summary["top_users"] = []

    # Photos count (respect date filter)
    marks_query = select(Mark)
    marks_query = _date_filters(marks_query, Mark, start_date, end_date)
    marks = (await db.execute(marks_query)).scalars().all()
    photos_total = sum(len(m.photos or []) for m in marks)
    summary["photos_total"] = photos_total

    # Ratio marks/points
    total_points_query = select(func.count()).select_from(Point)
    total_points_query = _date_filters(total_points_query, Point, start_date, end_date)
    total_marks_query = select(func.count()).select_from(Mark)
    total_marks_query = _date_filters(total_marks_query, Mark, start_date, end_date)
    total_points = await db.scalar(total_points_query)
    total_marks = await db.scalar(total_marks_query)
    summary["marks_to_points_ratio"] = float(total_marks) / float(total_points) if total_points else None

    # Criteria stats (avg per criteria)
    criteria_map = {c.id: c.text for c in (await db.execute(select(Criteria))).scalars().all()}
    crit_sum = defaultdict(int)
    crit_count = defaultdict(int)
    for m in marks:
        for cid, ans in zip(m.question_ids or [], m.answers or []):
            crit_sum[cid] += ans
            crit_count[cid] += 1
    summary["criteria_avg"] = [
        {
            "criteria_id": cid,
            "text": criteria_map.get(cid),
            "avg": (crit_sum[cid] / crit_count[cid]) if crit_count[cid] else None,
            "count": crit_count[cid],
        }
        for cid in crit_sum.keys()
    ]

    return summary


async def get_activity_metrics(
    db: AsyncSession, start_date: Optional[date] = None, end_date: Optional[date] = None, top_limit: int = 10
) -> Dict[str, Any]:
    summary = await get_analytics_summary(db, start_date=start_date, end_date=end_date, top_limit=top_limit)
    return {
        "users_by_day": summary.get("users_by_day", []),
        "points_by_day": summary.get("points_by_day", []),
        "marks_by_day": summary.get("marks_by_day", []),
    }


async def get_points_metrics(
    db: AsyncSession, start_date: Optional[date] = None, end_date: Optional[date] = None, top_limit: int = 10
) -> Dict[str, Any]:
    summary = await get_analytics_summary(db, start_date=start_date, end_date=end_date, top_limit=top_limit)
    return {
        "points_by_industry": summary.get("points_by_industry", []),
        "avg_rating_by_industry": summary.get("avg_rating_by_industry", []),
        "top_points": summary.get("top_points", []),
        "worst_points": summary.get("worst_points", []),
        "points_without_marks": summary.get("points_without_marks", []),
    }


async def get_marks_metrics(
    db: AsyncSession, start_date: Optional[date] = None, end_date: Optional[date] = None, top_limit: int = 10
) -> Dict[str, Any]:
    summary = await get_analytics_summary(db, start_date=start_date, end_date=end_date, top_limit=top_limit)
    return {
        "marks_by_industry": summary.get("marks_by_industry", []),
        "marks_to_points_ratio": summary.get("marks_to_points_ratio"),
        "photos_total": summary.get("photos_total", 0),
    }


async def get_users_metrics(
    db: AsyncSession, start_date: Optional[date] = None, end_date: Optional[date] = None, top_limit: int = 10
) -> Dict[str, Any]:
    summary = await get_analytics_summary(db, start_date=start_date, end_date=end_date, top_limit=top_limit)
    return {
        "top_users": summary.get("top_users", []),
    }


async def get_criteria_metrics(
    db: AsyncSession, start_date: Optional[date] = None, end_date: Optional[date] = None, top_limit: int = 10
) -> Dict[str, Any]:
    summary = await get_analytics_summary(db, start_date=start_date, end_date=end_date, top_limit=top_limit)
    return {
        "criteria_avg": summary.get("criteria_avg", []),
    }


def _week_index(dt: datetime) -> int:
    iso = dt.isocalendar()
    return iso.year * 100 + iso.week


def _compute_streak(weeks: List[int]) -> Dict[str, int]:
    """Return current and best streak length (in weeks) from a sorted list of week indices."""

    if not weeks:
        return {"streak_current": 0, "streak_best": 0}

    weeks = sorted(set(weeks))
    best = 1
    current = 1
    # best streak
    for prev, cur in zip(weeks, weeks[1:]):
        if cur == prev + 1:
            current += 1
            best = max(best, current)
        else:
            current = 1

    # current streak (from latest week backwards)
    current_streak = 1
    for prev, cur in zip(reversed(weeks[:-1]), reversed(weeks[1:])):
        if prev == cur - 1:
            current_streak += 1
        else:
            break

    return {"streak_current": current_streak, "streak_best": best}


async def get_users_engagement(
    db: AsyncSession, start_date: Optional[date] = None, end_date: Optional[date] = None, top_limit: int = 20
) -> List[Dict[str, Any]]:
    """Calculate engagement and streaks per user without persisting to DB."""

    # Load users
    users = {u.id: u for u in (await db.execute(select(User))).scalars().all()}
    if not users:
        return []

    # Points per user
    points_q = select(Point)
    points_q = _date_filters(points_q, Point, start_date, end_date)
    points = (await db.execute(points_q)).scalars().all()

    # Marks per user
    marks_q = select(Mark)
    marks_q = _date_filters(marks_q, Mark, start_date, end_date)
    marks = (await db.execute(marks_q)).scalars().all()

    # Aggregate
    points_count: Dict[int, int] = defaultdict(int)
    marks_count: Dict[int, int] = defaultdict(int)
    photos_count: Dict[int, int] = defaultdict(int)
    weeks_by_user: Dict[int, List[int]] = defaultdict(list)

    for p in points:
        if p.creator_id:
            points_count[p.creator_id] += 1
            weeks_by_user[p.creator_id].append(_week_index(p.created_at))

    for m in marks:
        if m.user_id:
            marks_count[m.user_id] += 1
            photos_count[m.user_id] += len(m.photos or [])
            weeks_by_user[m.user_id].append(_week_index(m.created_at))

    results: List[Dict[str, Any]] = []
    for uid, user in users.items():
        pc = points_count.get(uid, 0)
        mc = marks_count.get(uid, 0)
        phc = photos_count.get(uid, 0)
        engagement = mc + pc * 2 + phc * 0.5
        streaks = _compute_streak(weeks_by_user.get(uid, []))
        results.append(
            {
                "user_id": uid,
                "username": user.username,
                "engagement": engagement,
                "points_count": pc,
                "marks_count": mc,
                "photos_count": phc,
                "streak_current_weeks": streaks["streak_current"],
                "streak_best_weeks": streaks["streak_best"],
            }
        )

    results.sort(key=lambda x: x["engagement"], reverse=True)
    return results[:top_limit]
