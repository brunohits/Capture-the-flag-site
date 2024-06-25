"""init2

Revision ID: cfaacc15875b
Revises: a4a6a7a5cdfb
Create Date: 2024-06-26 03:29:00.327013

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'cfaacc15875b'
down_revision: Union[str, None] = 'a4a6a7a5cdfb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('available_competitions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('start_date', sa.DateTime(), nullable=True),
    sa.Column('duration', sa.Integer(), nullable=True),
    sa.Column('type', sa.String(), nullable=True),
    sa.Column('is_closed', sa.Boolean(), nullable=True),
    sa.Column('can_create_team', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_available_competitions_id'), 'available_competitions', ['id'], unique=False)
    op.create_index(op.f('ix_available_competitions_name'), 'available_competitions', ['name'], unique=False)
    op.drop_index('ix_competitions_history_id', table_name='competitions_history')
    op.drop_table('competitions_history')
    op.add_column('competitions', sa.Column('date', sa.Date(), nullable=True))
    op.add_column('competitions', sa.Column('points', sa.Float(), nullable=True))
    op.add_column('competitions', sa.Column('place', sa.Integer(), nullable=True))
    op.add_column('competitions', sa.Column('user_id', sa.Integer(), nullable=True))
    op.alter_column('competitions', 'duration',
               existing_type=sa.INTEGER(),
               type_=sa.String(),
               existing_nullable=True)
    op.drop_index('ix_competitions_name', table_name='competitions')
    op.create_foreign_key(None, 'competitions', 'users', ['user_id'], ['id'])
    op.drop_column('competitions', 'start_date')
    op.drop_column('competitions', 'can_create_team')
    op.drop_column('competitions', 'description')
    op.drop_column('competitions', 'is_closed')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('competitions', sa.Column('is_closed', sa.BOOLEAN(), autoincrement=False, nullable=True))
    op.add_column('competitions', sa.Column('description', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.add_column('competitions', sa.Column('can_create_team', sa.BOOLEAN(), autoincrement=False, nullable=True))
    op.add_column('competitions', sa.Column('start_date', postgresql.TIMESTAMP(), autoincrement=False, nullable=True))
    op.drop_constraint(None, 'competitions', type_='foreignkey')
    op.create_index('ix_competitions_name', 'competitions', ['name'], unique=False)
    op.alter_column('competitions', 'duration',
               existing_type=sa.String(),
               type_=sa.INTEGER(),
               existing_nullable=True)
    op.drop_column('competitions', 'user_id')
    op.drop_column('competitions', 'place')
    op.drop_column('competitions', 'points')
    op.drop_column('competitions', 'date')
    op.create_table('competitions_history',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('date', sa.DATE(), autoincrement=False, nullable=True),
    sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('type', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('duration', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('points', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('place', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='competitions_history_user_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='competitions_history_pkey')
    )
    op.create_index('ix_competitions_history_id', 'competitions_history', ['id'], unique=False)
    op.drop_index(op.f('ix_available_competitions_name'), table_name='available_competitions')
    op.drop_index(op.f('ix_available_competitions_id'), table_name='available_competitions')
    op.drop_table('available_competitions')
    # ### end Alembic commands ###
