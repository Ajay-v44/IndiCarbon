from pydantic import BaseModel, Field
from datetime import datetime,date
from typing import Optional

class CalculateScopeEmissionsRequest(BaseModel):
    year: date
    factor_key:str
    document_id:str
    raw_quantity:float