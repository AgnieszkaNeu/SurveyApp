from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


revision: str = 'b9e798652b1c'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('user',
    sa.Column('email', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('hashed_password', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('email_confirmed', sa.Boolean(), nullable=False),
    sa.Column('role', sa.Enum('user', 'superuser', name='role'), nullable=False),
    sa.CheckConstraint("role IN ('user','superuser')", name='chk_user_role'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    op.create_table('survey',
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('prevent_duplicates', sa.Boolean(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('expires_at', sa.DateTime(), nullable=False),
    sa.Column('last_updated', sa.DateTime(), nullable=False),
    sa.Column('status', sa.Enum('public', 'private', 'expired', name='statusenum'), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('submission_count', sa.Integer(), nullable=False),
    sa.Column('is_locked', sa.Boolean(), nullable=False),
    sa.Column('locked_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('surveytemplate',
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('category', sa.Enum('feedback', 'quiz', 'poll', 'research', 'event', 'satisfaction', 'custom', name='templatecategoryenum'), nullable=False),
    sa.Column('questions_data', sa.JSON(), nullable=True),
    sa.Column('is_public', sa.Boolean(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('usage_count', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('question',
    sa.Column('content', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('answer_type', sa.Enum('open', 'close', 'multiple', 'scale', 'rating', 'yes_no', 'dropdown', 'date', 'email', 'number', name='answerenum'), nullable=False),
    sa.Column('settings', sa.JSON(), nullable=True),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('survey_id', sa.Uuid(), nullable=False),
    sa.ForeignKeyConstraint(['survey_id'], ['survey.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('sharelink',
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('max_responses', sa.Integer(), nullable=True),
    sa.Column('password', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    sa.Column('expires_at', sa.DateTime(), nullable=True),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('survey_id', sa.Uuid(), nullable=False),
    sa.Column('share_token', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('clicks', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['survey_id'], ['survey.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sharelink_share_token'), 'sharelink', ['share_token'], unique=True)
    op.create_table('submission',
    sa.Column('survey_id', sa.Uuid(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['survey_id'], ['survey.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('submissionfingerprint',
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('survey_id', sa.Uuid(), nullable=False),
    sa.Column('fingerprint_hash', sqlmodel.sql.sqltypes.AutoString(length=64), nullable=False),
    sa.Column('submitted_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['survey_id'], ['survey.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_submissionfingerprint_fingerprint_hash'), 'submissionfingerprint', ['fingerprint_hash'], unique=False)
    op.create_index(op.f('ix_submissionfingerprint_survey_id'), 'submissionfingerprint', ['survey_id'], unique=False)
    op.create_table('answer',
    sa.Column('question_id', sa.Uuid(), nullable=False),
    sa.Column('response', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('submission_id', sa.Uuid(), nullable=False),
    sa.ForeignKeyConstraint(['question_id'], ['question.id'], ),
    sa.ForeignKeyConstraint(['submission_id'], ['submission.id'], ),
    sa.PrimaryKeyConstraint('question_id', 'submission_id')
    )
    op.create_table('choice',
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('content', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('question_id', sa.Uuid(), nullable=False),
    sa.ForeignKeyConstraint(['question_id'], ['question.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('choice')
    op.drop_table('answer')
    op.drop_index(op.f('ix_submissionfingerprint_survey_id'), table_name='submissionfingerprint')
    op.drop_index(op.f('ix_submissionfingerprint_fingerprint_hash'), table_name='submissionfingerprint')
    op.drop_table('submissionfingerprint')
    op.drop_table('submission')
    op.drop_index(op.f('ix_sharelink_share_token'), table_name='sharelink')
    op.drop_table('sharelink')
    op.drop_table('question')
    op.drop_table('surveytemplate')
    op.drop_table('survey')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_table('user')
