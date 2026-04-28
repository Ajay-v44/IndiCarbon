from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from ..models.agent import AgentInteraction, AgentRegistry, HITLReview


class AgentRegistryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_active_by_type(self, agent_type: str) -> Optional[AgentRegistry]:
        return (
            self.db.query(AgentRegistry)
            .filter(AgentRegistry.agent_type == agent_type, AgentRegistry.is_active.is_(True))
            .first()
        )

    def get_or_create(self, agent_name: str, agent_type: str, model_version: str) -> AgentRegistry:
        agent = (
            self.db.query(AgentRegistry)
            .filter(AgentRegistry.agent_name == agent_name)
            .first()
        )
        if not agent:
            agent = AgentRegistry(
                id=uuid.uuid4(),
                agent_name=agent_name,
                agent_type=agent_type,
                model_version=model_version,
                is_active=True,
            )
            self.db.add(agent)
            self.db.flush()
        return agent


class AgentInteractionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, **kwargs) -> AgentInteraction:
        interaction = AgentInteraction(id=uuid.uuid4(), **kwargs)
        self.db.add(interaction)
        self.db.flush()
        return interaction

    def get_by_session(self, session_id: str) -> list[AgentInteraction]:
        return (
            self.db.query(AgentInteraction)
            .filter(AgentInteraction.session_id == session_id)
            .order_by(AgentInteraction.created_at)
            .all()
        )


class HITLReviewRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, **kwargs) -> HITLReview:
        review = HITLReview(id=uuid.uuid4(), **kwargs)
        self.db.add(review)
        self.db.flush()
        return review

    def resolve(self, review_id: str, decision: str, reviewer_id: str) -> HITLReview:
        review = self.db.query(HITLReview).filter(HITLReview.id == review_id).first()
        if review:
            review.human_decision = decision
            review.reviewer_id = uuid.UUID(reviewer_id)
            review.reviewed_at = datetime.now(timezone.utc)
            self.db.flush()
        return review
