package repositories

import (
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"
	"github.com/beka-birhanu/edit-space/server/internal/infrastructure/database"

	"github.com/google/uuid"
)

type PgUserRepository struct {
	db database.Database[entities.User]
}

func NewPgUserRepository(db database.Database[entities.User]) *PgUserRepository {
	return &PgUserRepository{db: db}
}

func (u *PgUserRepository) Find(id uuid.UUID) (entities.User, error) {
	return u.db.FindOne("id = ?", id)
}

func (u *PgUserRepository) FindByUsername(username string) (entities.User, error) {
	return u.db.FindOne("username = ?", username)
}

func (u *PgUserRepository) FindAll() ([]entities.User, error) {
	return u.db.FindAll()
}

func (u *PgUserRepository) Save(entity entities.User) error {
	return u.db.Save(entity)
}

func (u *PgUserRepository) Delete(entity entities.User) error {
	return u.db.Delete(entity)
}

func (u *PgUserRepository) Exists(id uuid.UUID) (bool, error) {
	return u.db.Exists(id)
}
