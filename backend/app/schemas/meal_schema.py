# Meal Pydantic schemas
from pydantic import BaseModel
from typing import Optional, List


class MealItem(BaseModel):
    """개별 식단 데이터 항목"""
    dates: str
    brst: Optional[str] = ""
    brst_cal: Optional[str] = ""
    lnch: Optional[str] = ""
    lnch_cal: Optional[str] = ""
    dnr: Optional[str] = ""
    dnr_cal: Optional[str] = ""
    sum_cal: Optional[str] = ""


class MealResponse(BaseModel):
    """식단 API 응답 모델"""
    success: bool
    date: str
    data: List[MealItem]
    is_fallback: bool = False
