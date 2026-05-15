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

    def create(self, agent_name: str, agent_type: str, model_version: str, is_active: bool = True) -> AgentRegistry:
        agent = AgentRegistry(
            id=uuid.uuid4(),
            agent_name=agent_name,
            agent_type=agent_type,
            model_version=model_version,
            is_active=is_active,
        )
        self.db.add(agent)
        self.db.flush()
        return agent

    def list(self, limit: int = 100, offset: int = 0) -> list[AgentRegistry]:
        return (
            self.db.query(AgentRegistry)
            .order_by(AgentRegistry.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get(self, agent_id: str) -> Optional[AgentRegistry]:
        return self.db.query(AgentRegistry).filter(AgentRegistry.id == uuid.UUID(str(agent_id))).first()

    def update(self, agent_id: str, **kwargs) -> Optional[AgentRegistry]:
        agent = self.get(agent_id)
        if not agent:
            return None
        for key, value in kwargs.items():
            if value is not None and hasattr(agent, key):
                setattr(agent, key, value)
        self.db.flush()
        return agent

    def delete(self, agent_id: str) -> bool:
        agent = self.get(agent_id)
        if not agent:
            return False
        agent.is_active = False
        self.db.flush()
        return True


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

    def get_recent_by_session(self, session_id: str, limit: int = 20) -> list[AgentInteraction]:
        return list(
            reversed(
                self.db.query(AgentInteraction)
                .filter(AgentInteraction.session_id == session_id)
                .order_by(AgentInteraction.created_at.desc())
                .limit(limit)
                .all()
            )
        )

    def get_recent_chat_for_user(
        self,
        organization_id: str,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> list[AgentInteraction]:
        rows = (
            self.db.query(AgentInteraction)
            .filter(AgentInteraction.message_payload["interaction_type"].astext == "chat")
            .filter(AgentInteraction.message_payload["organization_id"].astext == organization_id)
            .filter(AgentInteraction.message_payload["user_id"].astext == user_id)
            .order_by(AgentInteraction.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        return rows


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
