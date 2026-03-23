# Meal data API
from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import List

from app.services.meal_fetcher import fetch_all_meals, filter_meals_by_date
from app.schemas.meal_schema import MealItem, MealResponse

router = APIRouter()

# 오늘 날짜에 해당하는 데이터가 없을 때 사용할 기본 데이터
FALLBACK_DATA = [
    {"dates": "", "brst": "밥", "brst_cal": "374.13kcal", "lnch": "밥", "lnch_cal": "374.13kcal", "dnr": "밥", "dnr_cal": "374.13kcal", "sum_cal": "2961.19kcal"},
    {"dates": "", "brst": "참치 고추장찌개(05)(06)(09)(16)", "brst_cal": "148.73kcal", "lnch": "황태채미역국(05)(06)(16)", "lnch_cal": "41.88kcal", "dnr": "닭볶음탕(05)(15)", "dnr_cal": "451.14kcal", "sum_cal": "2961.19kcal"},
    {"dates": "", "brst": "새송이버섯야채볶음(05)(06)(10)(18)", "brst_cal": "111.5kcal", "lnch": "사천식캐슈넛멸치볶음(04)(05)", "lnch_cal": "102.06kcal", "dnr": "사골우거지국(02)(05)(06)(16)(18)", "dnr_cal": "164.58kcal", "sum_cal": "2961.19kcal"},
    {"dates": "", "brst": "계란말이(완)(01)(05)(12)", "brst_cal": "106kcal", "lnch": "고추장돼지불고기(완제품)(05)(10)", "lnch_cal": "482.33kcal", "dnr": "느타리버섯볶음(05)", "dnr_cal": "37.98kcal", "sum_cal": "2961.19kcal"},
    {"dates": "", "brst": "배추김치(수의계약)", "brst_cal": "13.8kcal", "lnch": "배추김치(수의계약)", "lnch_cal": "13.8kcal", "dnr": "토핑형발효유(02)(06)", "dnr_cal": "165kcal", "sum_cal": "2961.19kcal"},
    {"dates": "", "brst": "", "brst_cal": "", "lnch": "", "lnch_cal": "", "dnr": "배추김치", "dnr_cal": "0kcal", "sum_cal": "2961.19kcal"},
]


def _get_today_date_string() -> str:
    """오늘 날짜를 'YYYY-MM-DD' 형식으로 반환"""
    return datetime.now().strftime("%Y-%m-%d")


def _get_today_date_with_day() -> str:
    """오늘 날짜를 'YYYY-MM-DD(요일)' 형식으로 반환"""
    days_kr = ["월", "화", "수", "목", "금", "토", "일"]
    now = datetime.now()
    day_name = days_kr[now.weekday()]
    return f"{now.strftime('%Y-%m-%d')}({day_name})"


def _apply_fallback(date_str: str) -> MealResponse:
    """fallback 데이터에 날짜를 적용하여 반환"""
    fallback_with_date = []
    for item in FALLBACK_DATA:
        item_copy = item.copy()
        item_copy["dates"] = date_str
        fallback_with_date.append(item_copy)

    return MealResponse(
        success=True,
        date=date_str,
        data=[MealItem(**item) for item in fallback_with_date],
        is_fallback=True
    )


@router.get("/meals", response_model=MealResponse)
async def get_all_meals():
    """전체 식단 데이터를 반환합니다."""
    meals = await fetch_all_meals()

    if meals is None:
        today = _get_today_date_with_day()
        return _apply_fallback(today)

    return MealResponse(
        success=True,
        date="all",
        data=[MealItem(**meal) for meal in meals]
    )


@router.get("/meals/{date}", response_model=MealResponse)
async def get_meals_by_date(date: str):
    """
    특정 날짜의 식단 데이터를 반환합니다.
    date 형식: YYYY-MM-DD (예: 2026-03-23)
    """
    # 날짜 형식 검증
    try:
        parsed_date = datetime.strptime(date, "%Y-%m-%d")
        days_kr = ["월", "화", "수", "목", "금", "토", "일"]
        day_name = days_kr[parsed_date.weekday()]
        date_with_day = f"{date}({day_name})"
    except ValueError:
        raise HTTPException(status_code=400, detail="날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식으로 입력해주세요.")

    meals = await fetch_all_meals()

    if meals is None:
        return _apply_fallback(date_with_day)

    # 날짜로 필터링
    filtered = filter_meals_by_date(meals, date)

    if not filtered:
        return _apply_fallback(date_with_day)

    return MealResponse(
        success=True,
        date=date_with_day,
        data=[MealItem(**meal) for meal in filtered]
    )
