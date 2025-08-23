package repositories

import (
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"
	"github.com/beka-birhanu/edit-space/server/internal/infrastructure/database"
	"github.com/google/uuid"
)

type PgUserCredentialRepository struct {
	db database.Database[entities.UserCredential]
}

func NewPgUserCredentialRepository(db database.Database[entities.UserCredential]) *PgUserCredentialRepository {
	return &PgUserCredentialRepository{db: db}
}

func (ucr *PgUserCredentialRepository) Find(userId uuid.UUID) (entities.UserCredential, error) {
	return ucr.db.FindOne("user_id = ?", userId)
}

func (ucr *PgUserCredentialRepository) Save(userCredential entities.UserCredential) error {
	return ucr.db.Save(userCredential)
}

func (ucr *PgUserCredentialRepository) Delete(userCredential entities.UserCredential) error {
	return ucr.db.Delete(userCredential)
}

func (ucr *PgUserCredentialRepository) Exists(userId uuid.UUID) (bool, error) {
	_, err := ucr.db.FindOne("user_id = ?", userId)
	return err != nil, err
}
