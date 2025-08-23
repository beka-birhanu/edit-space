package repositories

import (
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"
	"github.com/beka-birhanu/edit-space/server/internal/infrastructure/database"
	"github.com/google/uuid"
)

type PgSessionRepository struct {
	db database.Database[entities.Session]
}

func NewPgSessionRepository(db database.Database[entities.Session]) *PgSessionRepository {
	return &PgSessionRepository{db: db}
}

func (sr *PgSessionRepository) Find(id uuid.UUID) (entities.Session, error) {
	return sr.db.FindOne("id", id)
}

func (sr *PgSessionRepository) FindAll() ([]entities.Session, error) {
	return sr.db.FindAll()
}

func (sr *PgSessionRepository) FindByUserId(userId uuid.UUID) ([]entities.Session, error) {
	return sr.db.Find("user_id", userId)
}

func (sr *PgSessionRepository) Save(session entities.Session) error {
	return sr.db.Save(session)
}

func (sr *PgSessionRepository) Delete(session entities.Session) error {
	return sr.db.Delete(session)
}

func (sr *PgSessionRepository) Exists(id uuid.UUID) (bool, error) {
	return sr.db.Exists(id)
}
