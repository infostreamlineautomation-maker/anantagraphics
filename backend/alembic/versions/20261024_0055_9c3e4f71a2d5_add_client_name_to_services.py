"""add_client_name_to_services

Revision ID: 9c3e4f71a2d5
Revises: 7a8b8d5acd87
Create Date: 2026-10-24 00:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c3e4f71a2d5'
down_revision: Union[str, None] = '7a8b8d5acd87'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use batch or inspect to safely add column if not exists
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = [c['name'] for c in inspector.get_columns('services')]
    if 'client_name' not in cols:
        op.add_column('services', sa.Column('client_name', sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column('services', 'client_name')
