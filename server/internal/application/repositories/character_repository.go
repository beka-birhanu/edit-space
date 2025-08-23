package repositories

import (
	"github.com/beka-birhanu/edit-space/server/internal/domain/entities"
	"github.com/beka-birhanu/edit-space/server/internal/infrastructure/database"

	"github.com/google/uuid"
)

type PgCharacterRepository struct {
	db database.Database[entities.Character]
}

func NewPgCharacterRepository(db database.Database[entities.Character]) *PgCharacterRepository {
	return &PgCharacterRepository{db: db}
}

func (c *PgCharacterRepository) Find(id uuid.UUID) (entities.Character, error) {
	return c.db.FindOne("id = ?", id)
}

func (c *PgCharacterRepository) FindByDocumentId(documentId uuid.UUID) ([]entities.Character, error) {
	return c.db.Find("document_id = ?", documentId)
}

func (c *PgCharacterRepository) FindAll() ([]entities.Character, error) {
	return c.db.FindAll()
}

func (c *PgCharacterRepository) Save(character entities.Character) error {
	return c.db.Save(character)
}

func (c *PgCharacterRepository) SaveMany(characters []entities.Character) error {
	return c.db.SaveMany(characters)
}

func (c *PgCharacterRepository) Delete(character entities.Character) error {
	return c.db.Delete(character)
}

func (c *PgCharacterRepository) DeleteMany(characters []entities.Character) error {
	return c.db.DeleteMany(characters)
}

func (c *PgCharacterRepository) Exists(id uuid.UUID) (bool, error) {
	return c.db.Exists(id)
}
